import { User } from 'firebase/auth';
import { useCallback, useEffect, useRef, useState } from 'react';
import { recordTelemetryEventToFirestore } from '../services/saathiFirestore';
import { AbVariant, Language, ScreenId, TelemetryEvent, TelemetryState } from '../types';

const STORAGE_KEY = 'saathi_sensing_telemetry_v2';

function createInitialState(variant?: AbVariant): TelemetryState {
  const assignedVariant: AbVariant = variant ?? 'B';
  const sessionId = `proto-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  return {
    sessionId,
    prototype_data: true,
    variant: assignedVariant,
    initialLanguage: 'hi',
    currentLanguage: 'hi',
    languageSwitchCount: 0,
    walkthroughStatus: 'pending',
    readAloudCount: 0,
    mapEnteredAtMs: null,
    firstTileTappedId: null,
    firstTileTappedLabel: null,
    timeToFirstTapMs: null,
    tilesTappedTotal: 0,
    plansOpenedCount: 0,
    maxPlanScrollDepthPct: 0,
    voiceButtonTappedCount: 0,
    voiceRecordingStartedCount: 0,
    voiceRecordingCompletedCount: 0,
    winMomentsCount: 0,
    whatsappSharesCount: 0,
    ownChallengeStartedCount: 0,
    ownChallengeCompletedCount: 0,
    timeOnFeedMs: 0,
    badgeScreenViews: 0,
    aiAssistantQueriesCount: 0,
    events: [
      {
        id: `evt-${Date.now()}`,
        sessionId,
        timestamp: new Date().toISOString(),
        prototype_data: true,
        variant: assignedVariant,
        eventType: 'session_started',
        screen: 'map',
        metadata: { initialLanguage: 'hi', prototype_data: true },
      },
    ],
  };
}

function loadTelemetry(): TelemetryState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as TelemetryState;
      if (parsed && parsed.prototype_data === true && Array.isArray(parsed.events)) {
        const rawVariant = parsed.variant as string;
        const normalizedVariant: AbVariant = rawVariant === 'A' ? 'A' : 'B';
        return {
          ...parsed,
          variant: normalizedVariant,
          walkthroughStatus: parsed.walkthroughStatus ?? 'pending',
          winMomentsCount: parsed.winMomentsCount ?? 0,
          whatsappSharesCount: parsed.whatsappSharesCount ?? 0,
          aiAssistantQueriesCount: parsed.aiAssistantQueriesCount ?? 0,
        };
      }
    }
  } catch {
    // Ignore storage parse failure
  }
  return createInitialState('B');
}

export function useTelemetry(cloudUser: User | null = null) {
  const [telemetry, setTelemetry] = useState<TelemetryState>(() => loadTelemetry());
  const feedEnteredAtRef = useRef<number | null>(null);
  const cloudUserRef = useRef<User | null>(cloudUser);
  cloudUserRef.current = cloudUser;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(telemetry));
    } catch {
      // Ignore storage quota errors
    }
  }, [telemetry]);

  const appendEvent = useCallback(
    (
      eventType: TelemetryEvent['eventType'],
      screen: ScreenId,
      metadata?: Record<string, string | number | boolean>,
      updater?: (prev: TelemetryState) => Partial<TelemetryState>
    ) => {
      let createdEvent: TelemetryEvent | null = null;
      let activeLang: Language = 'hi';

      setTelemetry((prev) => {
        activeLang = prev.currentLanguage;
        const nextEvent: TelemetryEvent = {
          id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          sessionId: prev.sessionId,
          timestamp: new Date().toISOString(),
          prototype_data: true,
          variant: prev.variant,
          eventType,
          screen,
          metadata: { ...metadata, prototype_data: true },
        };
        createdEvent = nextEvent;
        const patch = updater ? updater(prev) : {};
        return {
          ...prev,
          ...patch,
          events: [nextEvent, ...prev.events].slice(0, 150),
        };
      });

      if (createdEvent) {
        const themeId =
          typeof metadata?.themeId === 'string' ? metadata.themeId : undefined;
        void recordTelemetryEventToFirestore({
          user: cloudUserRef.current,
          event: createdEvent,
          lang: activeLang,
          themeId,
        }).catch(() => {
          // Non-blocking background analytics sync
        });
      }
    },
    []
  );

  const trackLanguageSwitch = useCallback(
    (nextLang: Language, screen: ScreenId) => {
      appendEvent(
        'language_switched',
        screen,
        { from: nextLang === 'hi' ? 'en' : 'hi', to: nextLang },
        (prev) => ({
          currentLanguage: nextLang,
          languageSwitchCount: prev.languageSwitchCount + 1,
        })
      );
    },
    [appendEvent]
  );

  const trackWalkthroughOutcome = useCallback(
    (status: 'completed' | 'skipped') => {
      appendEvent(
        status === 'completed' ? 'walkthrough_completed' : 'walkthrough_skipped',
        'map',
        { status },
        () => ({ walkthroughStatus: status })
      );
    },
    [appendEvent]
  );

  const trackReadAloud = useCallback(
    (screen: ScreenId, targetId: string, lang: Language) => {
      appendEvent('read_aloud_used', screen, { targetId, lang }, (prev) => ({
        readAloudCount: prev.readAloudCount + 1,
      }));
    },
    [appendEvent]
  );

  const trackLoginCompleted = useCallback(
    (phoneMasked: string) => {
      appendEvent('login_completed', 'welcome', { phoneMasked });
    },
    [appendEvent]
  );

  const markMapEntered = useCallback(() => {
    setTelemetry((prev) => {
      if (prev.mapEnteredAtMs !== null) return prev;
      return { ...prev, mapEnteredAtMs: Date.now() };
    });
  }, []);

  const trackTileTapped = useCallback(
    (themeId: string, themeLabel: string, sourceType: string) => {
      const now = Date.now();
      appendEvent('tile_tapped', 'map', { themeId, themeLabel, sourceType }, (prev) => {
        const isFirst = prev.firstTileTappedId === null;
        const baseTime = prev.mapEnteredAtMs ?? now;
        const delta = isFirst ? Math.max(0, now - baseTime) : prev.timeToFirstTapMs;
        return {
          firstTileTappedId: isFirst ? themeId : prev.firstTileTappedId,
          firstTileTappedLabel: isFirst ? themeLabel : prev.firstTileTappedLabel,
          timeToFirstTapMs: delta,
          tilesTappedTotal: prev.tilesTappedTotal + 1,
        };
      });
    },
    [appendEvent]
  );

  const trackPlanOpened = useCallback(
    (themeId: string, themeLabel: string) => {
      appendEvent('plan_opened', 'plan', { themeId, themeLabel }, (prev) => ({
        plansOpenedCount: prev.plansOpenedCount + 1,
      }));
    },
    [appendEvent]
  );

  const trackPlanScrollDepth = useCallback(
    (depthPct: number, themeId: string) => {
      setTelemetry((prev) => {
        if (depthPct <= prev.maxPlanScrollDepthPct) return prev;
        const nextEvent: TelemetryEvent = {
          id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          sessionId: prev.sessionId,
          timestamp: new Date().toISOString(),
          prototype_data: true,
          variant: prev.variant,
          eventType: 'plan_scroll_depth',
          screen: 'plan',
          metadata: { depthPct, themeId, prototype_data: true },
        };
        return {
          ...prev,
          maxPlanScrollDepthPct: depthPct,
          events: [nextEvent, ...prev.events].slice(0, 150),
        };
      });
    },
    []
  );

  const trackVoiceButtonTapped = useCallback(
    (screen: ScreenId, themeId?: string) => {
      appendEvent('voice_button_tapped', screen, { themeId: themeId ?? 'general' }, (prev) => ({
        voiceButtonTappedCount: prev.voiceButtonTappedCount + 1,
      }));
    },
    [appendEvent]
  );

  const trackVoiceRecordingStarted = useCallback(
    (screen: ScreenId, mode: 'solution' | 'challenge') => {
      appendEvent('voice_recording_started', screen, { mode }, (prev) => ({
        voiceRecordingStartedCount: prev.voiceRecordingStartedCount + 1,
      }));
    },
    [appendEvent]
  );

  const trackVoiceRecordingCompleted = useCallback(
    (screen: ScreenId, mode: 'solution' | 'challenge', durationSec: number) => {
      appendEvent('voice_recording_completed', screen, { mode, durationSec }, (prev) => ({
        voiceRecordingCompletedCount: prev.voiceRecordingCompletedCount + 1,
      }));
    },
    [appendEvent]
  );

  const trackWinMoment = useCallback(
    (screen: ScreenId, themeId: string, method: 'quick_tap' | 'voice' | 'text') => {
      appendEvent('win_moment_triggered', screen, { themeId, method }, (prev) => ({
        winMomentsCount: (prev.winMomentsCount ?? 0) + 1,
      }));
    },
    [appendEvent]
  );

  const trackWhatsappShare = useCallback(
    (screen: ScreenId, themeId: string) => {
      appendEvent('whatsapp_share_clicked', screen, { themeId }, (prev) => ({
        whatsappSharesCount: (prev.whatsappSharesCount ?? 0) + 1,
      }));
    },
    [appendEvent]
  );

  const trackOwnChallengeStarted = useCallback(() => {
    appendEvent('own_challenge_started', 'share', {}, (prev) => ({
      ownChallengeStartedCount: prev.ownChallengeStartedCount + 1,
    }));
  }, [appendEvent]);

  const trackOwnChallengeCompleted = useCallback(
    (method: 'voice' | 'text', topicId: string) => {
      appendEvent('own_challenge_completed', 'share', { method, topicId }, (prev) => ({
        ownChallengeCompletedCount: prev.ownChallengeCompletedCount + 1,
      }));
    },
    [appendEvent]
  );

  const startFeedTimer = useCallback(() => {
    feedEnteredAtRef.current = Date.now();
    appendEvent('feed_viewed', 'community', {});
  }, [appendEvent]);

  const stopFeedTimer = useCallback(() => {
    if (feedEnteredAtRef.current !== null) {
      const elapsed = Math.max(0, Date.now() - feedEnteredAtRef.current);
      feedEnteredAtRef.current = null;
      if (elapsed > 200) {
        setTelemetry((prev) => ({
          ...prev,
          timeOnFeedMs: prev.timeOnFeedMs + elapsed,
        }));
      }
    }
  }, []);

  const trackBadgeScreenViewed = useCallback(() => {
    appendEvent('badge_screen_viewed', 'community', {}, (prev) => ({
      badgeScreenViews: prev.badgeScreenViews + 1,
    }));
  }, [appendEvent]);

  const setAbVariant = useCallback(
    (variant: AbVariant, screen: ScreenId) => {
      appendEvent('variant_switched', screen, { variant }, () => ({ variant }));
    },
    [appendEvent]
  );

  const randomize5050Variant = useCallback(
    (screen: ScreenId) => {
      const pool: AbVariant[] = ['A', 'B'];
      const picked: AbVariant = pool[Math.floor(Math.random() * pool.length)];
      appendEvent('variant_switched', screen, { variant: picked, assignment: 'randomized_split' }, () => ({
        variant: picked,
      }));
      return picked;
    },
    [appendEvent]
  );

  const trackVariantAPrompt = useCallback(
    (promptText: string) => {
      appendEvent('variant_a_prompt_sent', 'welcome', {
        charCount: promptText.length,
        variant: 'A',
      });
    },
    [appendEvent]
  );

  const trackAiAssistantOpened = useCallback(
    (screen: ScreenId, themeId?: string) => {
      appendEvent('ai_assistant_opened', screen, { themeId: themeId ?? 'general' });
    },
    [appendEvent]
  );

  const trackAiAssistantMessageSent = useCallback(
    (screen: ScreenId, charCount: number, themeId?: string) => {
      appendEvent(
        'ai_assistant_message_sent',
        screen,
        { charCount, themeId: themeId ?? 'general' },
        (prev) => ({
          aiAssistantQueriesCount: (prev.aiAssistantQueriesCount ?? 0) + 1,
        })
      );
    },
    [appendEvent]
  );

  const resetTelemetry = useCallback((variant: AbVariant = 'B') => {
    feedEnteredAtRef.current = null;
    setTelemetry(createInitialState(variant));
  }, []);

  return {
    telemetry,
    trackLanguageSwitch,
    trackWalkthroughOutcome,
    trackReadAloud,
    trackLoginCompleted,
    markMapEntered,
    trackTileTapped,
    trackPlanOpened,
    trackPlanScrollDepth,
    trackVoiceButtonTapped,
    trackVoiceRecordingStarted,
    trackVoiceRecordingCompleted,
    trackWinMoment,
    trackWhatsappShare,
    trackOwnChallengeStarted,
    trackOwnChallengeCompleted,
    startFeedTimer,
    stopFeedTimer,
    trackBadgeScreenViewed,
    setAbVariant,
    randomize5050Variant,
    trackVariantAPrompt,
    trackAiAssistantOpened,
    trackAiAssistantMessageSent,
    resetTelemetry,
  };
}
