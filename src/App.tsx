import { User } from 'firebase/auth';
import { Activity, Bot, CheckCircle2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { AiAssistantSheet } from './components/AiAssistantSheet';
import { FirstRunFlow } from './components/FirstRunFlow';
import { TeamDashboardDrawer } from './components/TeamDashboardDrawer';
import { MobileBottomNav, TopBar } from './components/TopBar';
import {
  WeekCelebrationModal,
  WeekCelebrationPayload,
} from './components/WeekCelebrationModal';
import { WinMomentModal } from './components/WinMomentModal';
import { CommunityScreen } from './components/screens/CommunityScreen';
import { PlanScreen } from './components/screens/PlanScreen';
import { ProblemMapScreen } from './components/screens/ProblemMapScreen';
import { ShareChallengeScreen } from './components/screens/ShareChallengeScreen';
import { WelcomeScreen } from './components/screens/WelcomeScreen';
import {
  AVATAR_SUNITA,
  INITIAL_COMMUNITY_STORIES,
  INITIAL_PEER_SOLUTIONS,
  PROBLEM_THEMES,
} from './data/saathiContent';
import { testConnection } from './firebase';
import { SpeakerGender, useSpeech } from './hooks/useSpeech';
import { useTelemetry } from './hooks/useTelemetry';
import {
  CloudLeaderboardRow,
  fetchLeaderboardFromFirestore,
  fetchPublicSolutionsFromFirestore,
  saveFeedbackNoteToFirestore,
  saveSolutionToFirestore,
  subscribeAuth,
  syncTeacherProfileToFirestore,
} from './services/saathiFirestore';
import {
  AbVariant,
  CommunityStory,
  Language,
  PeerSolution,
  ProblemTheme,
  ScreenId,
  TeacherProfile,
  WinMomentPayload,
} from './types';

const WALKTHROUGH_STORAGE_KEY = 'saathi_walkthrough_done_v1';
const PROFILE_STORAGE_KEY = 'saathi_teacher_profile_v1';

function loadSavedProfile(): TeacherProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TeacherProfile;
    return parsed?.phone ? parsed : null;
  } catch {
    return null;
  }
}

export default function App() {
  const [lang, setLang] = useState<Language>('hi');
  const [showWalkthrough, setShowWalkthrough] = useState<boolean>(false);
  const [activeScreen, setActiveScreen] = useState<ScreenId>('map');
  const [selectedTheme, setSelectedTheme] = useState<ProblemTheme>(PROBLEM_THEMES[0]);
  const [profile, setProfile] = useState<TeacherProfile | null>(() => loadSavedProfile());
  const [cloudUser, setCloudUser] = useState<User | null>(null);

  const [peerSolutions, setPeerSolutions] = useState<PeerSolution[]>(INITIAL_PEER_SOLUTIONS);
  const [stories, setStories] = useState<CommunityStory[]>(INITIAL_COMMUNITY_STORIES);
  const [helpfulIds, setHelpfulIds] = useState<string[]>([]);
  const [applaudedIds, setApplaudedIds] = useState<string[]>([]);
  const [userSolutionsCount, setUserSolutionsCount] = useState(0);
  const [solvedThemeIds, setSolvedThemeIds] = useState<string[]>([]);

  const [xp, setXp] = useState(75);
  const [streakDays, setStreakDays] = useState(3);
  const [completedWeeksByTheme, setCompletedWeeksByTheme] = useState<Record<string, number[]>>({
    'multi-age': [1],
  });
  const [communityTab, setCommunityTab] = useState<'feed' | 'recognition'>('recognition');

  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [phonePreview] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantInitialPrompt, setAssistantInitialPrompt] = useState<string | null>(null);
  const [activeWin, setActiveWin] = useState<WinMomentPayload | null>(null);
  const [activeWeekCelebration, setActiveWeekCelebration] =
    useState<WeekCelebrationPayload | null>(null);
  const [externalStepRequest, setExternalStepRequest] = useState<{
    week: number;
    key: number;
  } | null>(null);
  const [cloudLeaderboard, setCloudLeaderboard] = useState<CloudLeaderboardRow[]>([]);
  const [cloudLbLoading, setCloudLbLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const mainScrollRef = useRef<HTMLElement | null>(null);
  const { speakingId, loadingAudioId, speak, stop } = useSpeech();
  const {
    telemetry,
    trackLanguageSwitch,
    trackWalkthroughOutcome,
    trackReadAloud,
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
  } = useTelemetry(cloudUser);

  // Startup Firebase connection check + auth listener
  useEffect(() => {
    void testConnection();
    const unsub = subscribeAuth((user) => {
      setCloudUser(user);
    });
    return () => unsub();
  }, []);

  const loadCloudLeaderboard = async (user: User | null) => {
    if (!user) {
      setCloudLeaderboard([]);
      return;
    }
    setCloudLbLoading(true);
    try {
      const rows = await fetchLeaderboardFromFirestore(user);
      setCloudLeaderboard(rows);
    } catch {
      // Handled cleanly inside service
    } finally {
      setCloudLbLoading(false);
    }
  };

  // Load shared Firestore solutions & leaderboard once authenticated
  useEffect(() => {
    if (!cloudUser) {
      setCloudLeaderboard([]);
      return;
    }
    let cancelled = false;
    void fetchPublicSolutionsFromFirestore(cloudUser)
      .then((cloudSolutions) => {
        if (cancelled || cloudSolutions.length === 0) return;
        setPeerSolutions((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const uniqueCloud = cloudSolutions.filter((c) => !existingIds.has(c.id));
          return [...uniqueCloud, ...prev];
        });
      })
      .catch(() => {
        // Handled cleanly inside service
      });
    void loadCloudLeaderboard(cloudUser);
    return () => {
      cancelled = true;
    };
  }, [cloudUser]);

  useEffect(() => {
    if (!toastMsg) return;
    const timer = window.setTimeout(() => setToastMsg(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toastMsg]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    if (activeScreen === 'map' && !showWalkthrough) {
      markMapEntered();
    }
    if (activeScreen === 'community') {
      startFeedTimer();
      return () => {
        stopFeedTimer();
      };
    }
  }, [activeScreen, showWalkthrough, markMapEntered, startFeedTimer, stopFeedTimer]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
  };

  const scrollActiveViewToTop = () => {
    if (phonePreview && mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const navigateTo = (screen: ScreenId, options?: { communityTab?: 'feed' | 'recognition' }) => {
    stop();
    setShowWalkthrough(false);
    if (options?.communityTab) {
      setCommunityTab(options.communityTab);
      if (options.communityTab === 'recognition') {
        trackBadgeScreenViewed();
      }
    }
    setActiveScreen(screen);
    scrollActiveViewToTop();
  };

  const finishWalkthrough = (status: 'completed' | 'skipped') => {
    try {
      localStorage.setItem(WALKTHROUGH_STORAGE_KEY, 'true');
    } catch {
      // Ignore storage write failure
    }
    trackWalkthroughOutcome(status);
    setShowWalkthrough(false);
    setActiveScreen('map');
    scrollActiveViewToTop();
  };

  const openAssistant = (initialPrompt?: string) => {
    setAssistantInitialPrompt(initialPrompt ?? null);
    setAssistantOpen(true);
    trackAiAssistantOpened(activeScreen, selectedTheme?.id);
  };

  const handleToggleLanguage = () => {
    stop();
    const nextLang: Language = lang === 'hi' ? 'en' : 'hi';
    setLang(nextLang);
    trackLanguageSwitch(nextLang, activeScreen);
  };

  const handleSpeak = (
    id: string,
    text: string,
    speakerGender: SpeakerGender = 'female'
  ) => {
    if (speakingId !== id && loadingAudioId !== id) {
      trackReadAloud(activeScreen, id, lang);
    }
    speak(id, text, lang, speakerGender);
  };

  const handleSelectTheme = (theme: ProblemTheme) => {
    setSelectedTheme(theme);
    trackTileTapped(theme.id, theme.title.en, theme.sourceType);
    trackPlanOpened(theme.id, theme.title.en);
    navigateTo('plan');
  };

  const handleToggleWeekDone = (themeId: string, weekNumber: number) => {
    const existing = completedWeeksByTheme[themeId] ?? [];
    const alreadyDone = existing.includes(weekNumber);

    if (alreadyDone) {
      const nextMap = {
        ...completedWeeksByTheme,
        [themeId]: existing.filter((w) => w !== weekNumber),
      };
      const nextXp = Math.max(0, xp - 25);
      setCompletedWeeksByTheme(nextMap);
      setXp(nextXp);
      return;
    }

    const updated = [...existing, weekNumber].sort((a, b) => a - b);
    const nextMap = { ...completedWeeksByTheme, [themeId]: updated };
    const nextXp = xp + 25;
    setCompletedWeeksByTheme(nextMap);
    setXp(nextXp);

    const matchedTheme = PROBLEM_THEMES.find((t) => t.id === themeId) ?? selectedTheme;
    setActiveWeekCelebration({
      theme: matchedTheme,
      weekNumber,
      completedWeeks: updated,
      xpEarned: 25,
      streakDays,
    });

    if (cloudUser) {
      const totalWeeks = Object.values(nextMap).reduce((s, w) => s + w.length, 0);
      const teacherName =
        cloudUser.displayName || profile?.name || (lang === 'hi' ? 'शिक्षक साथी' : 'Teacher Saathi');
      const blockDistrict = profile?.blockDistrict || (lang === 'hi' ? 'आपका ब्लॉक' : 'Your Block');
      void syncTeacherProfileToFirestore({
        user: cloudUser,
        displayName: teacherName,
        blockDistrict,
        xp: nextXp,
        streakDays,
        solutionsCount: userSolutionsCount,
        weeksDoneCount: totalWeeks,
      })
        .then(() => loadCloudLeaderboard(cloudUser))
        .catch(() => {});
    }
  };

  const recordSolutionAndCelebrate = (params: {
    theme: ProblemTheme;
    method: 'quick_tap' | 'voice' | 'text';
    text: string;
    durationSec: number;
    audioUrl?: string;
  }) => {
    const teacherName = profile?.name || (lang === 'hi' ? 'शिक्षक साथी' : 'Teacher Saathi');
    const blockDistrict = profile?.blockDistrict || (lang === 'hi' ? 'आपका ब्लॉक' : 'Your Block');
    const solId = `sol_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    const newSol: PeerSolution = {
      id: solId,
      themeId: params.theme.id,
      teacherName: { hi: teacherName, en: teacherName },
      blockDistrict: { hi: blockDistrict, en: blockDistrict },
      avatarUrl: AVATAR_SUNITA,
      audioDurationSec: params.durationSec,
      summary: {
        hi: params.text.slice(0, 90),
        en: params.text.slice(0, 90),
      },
      transcript: {
        hi: params.text,
        en: params.text,
      },
      helpfulCount: 0,
      isUserSubmitted: true,
      recordedAudioUrl: params.audioUrl,
    };

    const newStory: CommunityStory = {
      id: `story_${Date.now()}`,
      teacherName: { hi: teacherName, en: teacherName },
      blockDistrict: { hi: blockDistrict, en: blockDistrict },
      avatarUrl: AVATAR_SUNITA,
      themeId: params.theme.id,
      themeLabel: params.theme.title,
      storyType: 'solution',
      headline: {
        hi: `${params.theme.title.hi} — हल साझा किया`,
        en: `${params.theme.title.en} — Solved`,
      },
      body: { hi: params.text, en: params.text },
      timeAgo: { hi: 'अभी', en: 'Just now' },
      applauseCount: 0,
      hasVoice: params.method === 'voice',
      audioDurationSec: params.durationSec,
      isUserSubmitted: true,
    };

    setPeerSolutions((prev) => [newSol, ...prev]);
    setStories((prev) => [newStory, ...prev]);
    setUserSolutionsCount((c) => c + 1);
    setSolvedThemeIds((prev) =>
      prev.includes(params.theme.id) ? prev : [...prev, params.theme.id]
    );
    const nextXp = xp + 50;
    const nextStreak = streakDays + 1;
    setXp(nextXp);
    setStreakDays(nextStreak);

    trackWinMoment(activeScreen, params.theme.id, params.method);

    if (cloudUser) {
      void saveSolutionToFirestore({
        user: cloudUser,
        solutionId: solId,
        authorName: teacherName,
        blockDistrict,
        themeId: params.theme.id,
        method: params.method === 'voice' ? 'voice' : 'text',
        summary: params.text.slice(0, 180),
        transcript: params.text,
        durationSec: params.durationSec,
      }).catch(() => {});
      const totalWeeks = Object.values(completedWeeksByTheme).reduce((s, w) => s + w.length, 0);
      void syncTeacherProfileToFirestore({
        user: cloudUser,
        displayName: teacherName,
        blockDistrict,
        xp: nextXp,
        streakDays: nextStreak,
        solutionsCount: userSolutionsCount + 1,
        weeksDoneCount: totalWeeks,
      }).catch(() => {});
    }

    setActiveWin({
      themeId: params.theme.id,
      themeTitle: params.theme.title,
      solutionText: params.text,
      method: params.method,
      xpEarned: 50,
    });
  };

  const handleOneTapSolved = (theme: ProblemTheme) => {
    const quickText =
      lang === 'hi'
        ? `"${theme.title.hi}" का आसान तरीका स्कूल में सफलतापूर्वक आज़माया।`
        : `Successfully tried a practical solution for "${theme.title.en}" at school.`;
    recordSolutionAndCelebrate({
      theme,
      method: 'quick_tap',
      text: quickText,
      durationSec: 15,
    });
  };

  const handleSubmitVoiceSolution = (
    theme: ProblemTheme,
    payload: {
      method: 'voice' | 'text';
      text: string;
      durationSec: number;
      audioUrl?: string;
    }
  ) => {
    trackVoiceRecordingCompleted(activeScreen, 'solution', payload.durationSec);
    recordSolutionAndCelebrate({
      theme,
      method: payload.method,
      text: payload.text,
      durationSec: payload.durationSec,
      audioUrl: payload.audioUrl,
    });
  };

  const handleSubmitChallenge = (payload: {
    method: 'voice' | 'text';
    text: string;
    durationSec: number;
    topicKey: string;
    audioUrl?: string;
  }) => {
    if (payload.method === 'voice') {
      trackVoiceRecordingCompleted('share', 'challenge', payload.durationSec);
    }
    trackOwnChallengeCompleted(payload.method, payload.topicKey);

    const teacherName = profile?.name || (lang === 'hi' ? 'शिक्षक साथी' : 'Teacher Saathi');
    const blockDistrict = profile?.blockDistrict || (lang === 'hi' ? 'आपका ब्लॉक' : 'Your Block');
    const themeMatch = PROBLEM_THEMES.find((t) => t.id === payload.topicKey);

    const newStory: CommunityStory = {
      id: `challenge_${Date.now()}`,
      teacherName: { hi: teacherName, en: teacherName },
      blockDistrict: { hi: blockDistrict, en: blockDistrict },
      avatarUrl: AVATAR_SUNITA,
      themeId: payload.topicKey,
      themeLabel: themeMatch ? themeMatch.title : { hi: 'सवाल / अनुभव', en: 'School Question' },
      storyType: 'challenge_shared',
      headline: {
        hi: 'साथियों से सलाह',
        en: 'Question for fellow teachers',
      },
      body: { hi: payload.text, en: payload.text },
      timeAgo: { hi: 'अभी', en: 'Just now' },
      applauseCount: 0,
      hasVoice: payload.method === 'voice',
      audioDurationSec: payload.durationSec,
      isUserSubmitted: true,
    };

    setStories((prev) => [newStory, ...prev]);
    setXp((x) => x + 30);
    showToast(
      lang === 'hi'
        ? '+30 अंक! आपकी बात समुदाय में जुड़ गई।'
        : '+30 XP! Your note is shared with peers.'
    );
  };

  const handleSwitchVariant = (variant: AbVariant) => {
    stop();
    setAbVariant(variant, activeScreen);
    if (variant === 'A') {
      setShowWalkthrough(false);
      navigateTo('welcome');
    } else {
      navigateTo('map');
    }
  };

  const handleRandomizeVariant = () => {
    const picked = randomize5050Variant(activeScreen);
    if (picked === 'A') {
      setShowWalkthrough(false);
      navigateTo('welcome');
    } else {
      navigateTo('map');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F7F9] text-[#18202C] pb-20 md:pb-6">
      {!phonePreview && (
        <TopBar
          lang={lang}
          activeScreen={activeScreen}
          variant={telemetry.variant}
          onNavigate={(screen) => navigateTo(screen)}
          onToggleLanguage={handleToggleLanguage}
          onReplayWalkthrough={() => setShowWalkthrough(true)}
        />
      )}

      <div
        className={
          phonePreview
            ? 'relative w-full max-w-[390px] mx-auto my-5 rounded-[36px] border-[10px] border-slate-900 bg-[#F6F7F9] shadow-2xl overflow-hidden flex flex-col h-[780px]'
            : 'flex-1 flex flex-col'
        }
      >
        {phonePreview && (
          <TopBar
            lang={lang}
            activeScreen={activeScreen}
            variant={telemetry.variant}
            isPhoneFrame
            onNavigate={(screen) => navigateTo(screen)}
            onToggleLanguage={handleToggleLanguage}
            onReplayWalkthrough={() => setShowWalkthrough(true)}
          />
        )}

        <main
          ref={mainScrollRef}
          className={phonePreview ? '@container flex-1 overflow-y-auto' : '@container flex-1'}
        >
          {telemetry.variant === 'A' ? (
            <WelcomeScreen
              lang={lang}
              profile={profile}
              speakingId={speakingId}
              loadingAudioId={loadingAudioId}
              onSpeak={handleSpeak}
              onVariantAPromptSent={trackVariantAPrompt}
            />
          ) : showWalkthrough ? (
            <FirstRunFlow
              lang={lang}
              speakingId={speakingId}
              loadingAudioId={loadingAudioId}
              onSpeak={handleSpeak}
              onComplete={() => finishWalkthrough('completed')}
              onSkip={() => finishWalkthrough('skipped')}
            />
          ) : (
            <>
              {(activeScreen === 'map' || activeScreen === 'welcome') && (
                <ProblemMapScreen
                  lang={lang}
                  peerSolutions={peerSolutions}
                  xp={xp}
                  streakDays={streakDays}
                  solvedThemeIds={solvedThemeIds}
                  completedWeeksByTheme={completedWeeksByTheme}
                  speakingId={speakingId}
                  loadingAudioId={loadingAudioId}
                  onSpeak={handleSpeak}
                  onSelectTheme={handleSelectTheme}
                  onGoToShare={() => navigateTo('share')}
                  onOpenAssistant={(q) => openAssistant(q)}
                />
              )}

              {activeScreen === 'plan' && (
                <PlanScreen
                  lang={lang}
                  theme={selectedTheme}
                  solutions={peerSolutions}
                  completedWeeks={completedWeeksByTheme[selectedTheme.id] ?? []}
                  isSolvedByUser={solvedThemeIds.includes(selectedTheme.id)}
                  speakingId={speakingId}
                  loadingAudioId={loadingAudioId}
                  externalStepRequest={externalStepRequest}
                  onSpeak={handleSpeak}
                  onSelectTheme={(t) => {
                    setSelectedTheme(t);
                    trackTileTapped(t.id, t.title.en, t.sourceType);
                    trackPlanOpened(t.id, t.title.en);
                  }}
                  onToggleWeekDone={handleToggleWeekDone}
                  onBackToMap={() => navigateTo('map')}
                  onScrollDepthReached={(pct) => trackPlanScrollDepth(pct, selectedTheme.id)}
                  onVoiceButtonTapped={() => trackVoiceButtonTapped('plan', selectedTheme.id)}
                  onVoiceRecordingStarted={() => trackVoiceRecordingStarted('plan', 'solution')}
                  onOneTapSolved={handleOneTapSolved}
                  onSubmitVoiceSolution={(payload) =>
                    handleSubmitVoiceSolution(selectedTheme, payload)
                  }
                  helpfulIds={helpfulIds}
                  onToggleHelpful={(id) =>
                    setHelpfulIds((prev) =>
                      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
                    )
                  }
                  onOpenAssistant={() => openAssistant()}
                />
              )}

              {activeScreen === 'share' && (
                <ShareChallengeScreen
                  lang={lang}
                  selectedTheme={selectedTheme}
                  speakingId={speakingId}
                  loadingAudioId={loadingAudioId}
                  onSpeak={handleSpeak}
                  onChallengeStarted={trackOwnChallengeStarted}
                  onVoiceRecordingStarted={() => trackVoiceRecordingStarted('share', 'challenge')}
                  onSolveWithVoice={(payload) =>
                    handleSubmitVoiceSolution(payload.theme, payload)
                  }
                  onOneTapSolved={handleOneTapSolved}
                  onSubmitChallenge={handleSubmitChallenge}
                  onOpenAssistant={() => openAssistant()}
                />
              )}

              {activeScreen === 'community' && (
                <CommunityScreen
                  lang={lang}
                  profile={profile}
                  cloudUser={cloudUser}
                  cloudLeaderboard={cloudLeaderboard}
                  cloudSyncing={cloudLbLoading}
                  stories={stories}
                  applaudedIds={applaudedIds}
                  userSolutionsCount={userSolutionsCount}
                  xp={xp}
                  streakDays={streakDays}
                  completedWeeksByTheme={completedWeeksByTheme}
                  initialTab={communityTab}
                  speakingId={speakingId}
                  loadingAudioId={loadingAudioId}
                  onSpeak={handleSpeak}
                  onToggleApplause={(id) =>
                    setApplaudedIds((prev) =>
                      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
                    )
                  }
                  onOpenBadgeTab={trackBadgeScreenViewed}
                  onSubmitFeedbackSentiment={(sentiment) => {
                    void saveFeedbackNoteToFirestore({
                      user: cloudUser,
                      sentiment,
                    }).catch(() => {});
                    showToast(
                      lang === 'hi' ? 'आपकी राय के लिए धन्यवाद!' : 'Thank you for your feedback!'
                    );
                  }}
                  onRefreshCloudLeaderboard={() => void loadCloudLeaderboard(cloudUser)}
                  onOpenTeamDashboard={() => setDashboardOpen(true)}
                />
              )}
            </>
          )}
        </main>

        {/* Floating AI Assistant Launcher inside 390px Phone Frame */}
        {phonePreview && telemetry.variant !== 'A' && !showWalkthrough && !assistantOpen && (
          <button
            type="button"
            onClick={() => openAssistant()}
            className="absolute bottom-16 right-3 z-40 min-h-[42px] px-3 py-2 rounded-full bg-[#0D5C63] hover:bg-[#09474D] text-white text-xs font-semibold shadow-lg flex items-center gap-1.5 cursor-pointer"
          >
            <Bot className="w-4 h-4" />
            <span>{lang === 'hi' ? 'AI मदद' : 'AI Help'}</span>
          </button>
        )}

        {phonePreview && (
          <AiAssistantSheet
            isOpen={assistantOpen}
            isPhoneFrame
            lang={lang}
            variant={telemetry.variant}
            activeScreen={activeScreen}
            selectedTheme={selectedTheme}
            profile={profile}
            speakingId={speakingId}
            loadingAudioId={loadingAudioId}
            initialPrompt={assistantInitialPrompt}
            onClearInitialPrompt={() => setAssistantInitialPrompt(null)}
            onClose={() => setAssistantOpen(false)}
            onSpeak={handleSpeak}
            onMessageSent={(chars, tId) => trackAiAssistantMessageSent(activeScreen, chars, tId)}
          />
        )}

        {phonePreview && telemetry.variant !== 'A' && !showWalkthrough && (
          <MobileBottomNav
            lang={lang}
            activeScreen={activeScreen}
            isPhoneFrame
            onNavigate={(screen) => navigateTo(screen)}
          />
        )}
      </div>

      {/* Quiet Team Dashboard Footer */}
      <footer className="max-w-5xl w-full mx-auto px-4 sm:px-6 pt-3 pb-5 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <span>
          {lang === 'hi'
            ? 'साथी · सरकारी स्कूल शिक्षकों व HM का आवाज़ मंच'
            : 'Saathi · Minimal voice-first hub for rural teachers & HMs'}
        </span>

        <button
          type="button"
          onClick={() => setDashboardOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer"
        >
          <Activity className="w-3.5 h-3.5 text-[#0D5C63]" />
          <span>{lang === 'hi' ? 'टीम डैशबोर्ड व डेटा' : 'Team Dashboard'}</span>
        </button>
      </footer>

      {!phonePreview && telemetry.variant !== 'A' && !showWalkthrough && !assistantOpen && (
        <button
          type="button"
          onClick={() => openAssistant()}
          className="fixed bottom-18 right-3.5 md:bottom-6 md:right-6 z-40 min-h-[44px] px-3.5 py-2 rounded-full bg-[#0D5C63] hover:bg-[#09474D] text-white text-xs font-semibold shadow-lg flex items-center gap-1.5 cursor-pointer"
        >
          <Bot className="w-4 h-4" />
          <span>{lang === 'hi' ? 'साथी AI' : 'Saathi AI'}</span>
        </button>
      )}

      {!phonePreview && (
        <AiAssistantSheet
          isOpen={assistantOpen}
          lang={lang}
          variant={telemetry.variant}
          activeScreen={activeScreen}
          selectedTheme={selectedTheme}
          profile={profile}
          speakingId={speakingId}
          loadingAudioId={loadingAudioId}
          initialPrompt={assistantInitialPrompt}
          onClearInitialPrompt={() => setAssistantInitialPrompt(null)}
          onClose={() => setAssistantOpen(false)}
          onSpeak={handleSpeak}
          onMessageSent={(chars, tId) => trackAiAssistantMessageSent(activeScreen, chars, tId)}
        />
      )}

      {toastMsg && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-medium shadow-lg flex items-center gap-2 max-w-[90vw]"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {!phonePreview && telemetry.variant !== 'A' && !showWalkthrough && (
        <MobileBottomNav
          lang={lang}
          activeScreen={activeScreen}
          onNavigate={(screen) => navigateTo(screen)}
        />
      )}

      <WeekCelebrationModal
        celebration={activeWeekCelebration}
        lang={lang}
        speakingId={speakingId}
        loadingAudioId={loadingAudioId}
        onSpeak={handleSpeak}
        onContinueNextWeek={(nextWeek) => {
          setActiveWeekCelebration(null);
          setExternalStepRequest({ week: nextWeek, key: Date.now() });
        }}
        onClaimFinalWin={(themeToWin) => {
          setActiveWeekCelebration(null);
          handleOneTapSolved(themeToWin);
        }}
        onClose={() => setActiveWeekCelebration(null)}
      />

      <WinMomentModal
        win={activeWin}
        lang={lang}
        teacherName={profile?.name}
        blockDistrict={profile?.blockDistrict}
        onClose={() => setActiveWin(null)}
        onAddVoiceTip={() => {
          if (activeWin) {
            const matched = PROBLEM_THEMES.find((t) => t.id === activeWin.themeId);
            if (matched) setSelectedTheme(matched);
          }
          setActiveWin(null);
          navigateTo('share');
        }}
        onWhatsappShareClicked={(themeId) => {
          trackWhatsappShare(activeScreen, themeId);
          showToast(lang === 'hi' ? 'WhatsApp साझा खुला!' : 'Opened WhatsApp share!');
        }}
      />

      <TeamDashboardDrawer
        isOpen={dashboardOpen}
        onClose={() => setDashboardOpen(false)}
        lang={lang}
        telemetry={telemetry}
        cloudUser={cloudUser}
        onSwitchVariant={handleSwitchVariant}
        onRandomize5050={handleRandomizeVariant}
        onResetSession={() => {
          resetTelemetry('B');
          setProfile(null);
          try {
            localStorage.removeItem(PROFILE_STORAGE_KEY);
            localStorage.removeItem(WALKTHROUGH_STORAGE_KEY);
          } catch {
            // Ignore
          }
          setPeerSolutions(INITIAL_PEER_SOLUTIONS);
          setStories(INITIAL_COMMUNITY_STORIES);
          setUserSolutionsCount(0);
          setSolvedThemeIds([]);
          setXp(75);
          setStreakDays(3);
          setCompletedWeeksByTheme({ 'multi-age': [1] });
          setShowWalkthrough(false);
          navigateTo('map');
        }}
      />
    </div>
  );
}
