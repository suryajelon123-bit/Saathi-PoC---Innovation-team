import { Activity, Bot, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AiAssistantSheet } from './components/AiAssistantSheet';
import { TelemetryDrawer } from './components/TelemetryDrawer';
import { MobileBottomNav, TopBar } from './components/TopBar';
import { VariantSwitcherBar } from './components/VariantSwitcherBar';
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
import { SpeakerGender, useSpeech } from './hooks/useSpeech';
import { useTelemetry } from './hooks/useTelemetry';
import {
  AbVariant,
  CommunityStory,
  Language,
  PeerSolution,
  ProblemTheme,
  ScreenId,
  TeacherProfile,
} from './types';

export default function App() {
  const [lang, setLang] = useState<Language>('hi');
  const [activeScreen, setActiveScreen] = useState<ScreenId>('welcome');
  const [selectedTheme, setSelectedTheme] = useState<ProblemTheme>(PROBLEM_THEMES[0]);
  const [profile, setProfile] = useState<TeacherProfile | null>(null);

  const [peerSolutions, setPeerSolutions] = useState<PeerSolution[]>(INITIAL_PEER_SOLUTIONS);
  const [stories, setStories] = useState<CommunityStory[]>(INITIAL_COMMUNITY_STORIES);
  const [helpfulIds, setHelpfulIds] = useState<string[]>([]);
  const [applaudedIds, setApplaudedIds] = useState<string[]>([]);
  const [userSolutionsCount, setUserSolutionsCount] = useState(0);
  const [userChallengesCount, setUserChallengesCount] = useState(0);

  // Unified B+C Gamified 4-Week Progression State
  const [xp, setXp] = useState(75);
  const [streakDays, setStreakDays] = useState(3);
  const [completedWeeksByTheme, setCompletedWeeksByTheme] = useState<Record<string, number[]>>({
    'multi-age': [1],
  });
  const [communityTab, setCommunityTab] = useState<'feed' | 'recognition'>('recognition');

  const [telemetryOpen, setTelemetryOpen] = useState(false);
  const [phonePreview, setPhonePreview] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantInitialPrompt, setAssistantInitialPrompt] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const { speakingId, loadingAudioId, speak, stop } = useSpeech();
  const {
    telemetry,
    trackLanguageSwitch,
    trackReadAloud,
    trackLoginCompleted,
    markMapEntered,
    trackTileTapped,
    trackPlanOpened,
    trackPlanScrollDepth,
    trackVoiceButtonTapped,
    trackVoiceRecordingStarted,
    trackVoiceRecordingCompleted,
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
  } = useTelemetry();

  useEffect(() => {
    if (!toastMsg) return;
    const timer = window.setTimeout(() => setToastMsg(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toastMsg]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
  };

  const openAssistant = (initialPrompt?: string) => {
    setAssistantInitialPrompt(initialPrompt ?? null);
    setAssistantOpen(true);
    trackAiAssistantOpened(activeScreen, selectedTheme?.id);
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    if (activeScreen === 'map') {
      markMapEntered();
    }
    if (activeScreen === 'community') {
      startFeedTimer();
      return () => {
        stopFeedTimer();
      };
    }
  }, [activeScreen, markMapEntered, startFeedTimer, stopFeedTimer]);

  const navigateTo = (screen: ScreenId, options?: { communityTab?: 'feed' | 'recognition' }) => {
    stop();
    if (options?.communityTab) {
      setCommunityTab(options.communityTab);
      if (options.communityTab === 'recognition') {
        trackBadgeScreenViewed();
      }
    }
    setActiveScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const handleLoginSuccess = (nextProfile: TeacherProfile) => {
    if (!nextProfile.phone) {
      setProfile(null);
      return;
    }
    setProfile(nextProfile);
    trackLoginCompleted(`XXXXXX${nextProfile.phone.slice(-4)}`);
    showToast(
      lang === 'hi'
        ? `नमस्ते ${nextProfile.name}, आपका स्वागत है!`
        : `Welcome, ${nextProfile.name}!`
    );
    navigateTo('welcome');
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
      const updated = existing.filter((w) => w !== weekNumber);
      setCompletedWeeksByTheme((prev) => ({ ...prev, [themeId]: updated }));
      setXp((x) => Math.max(0, x - 25));
      return;
    }

    const updated = [...existing, weekNumber].sort((a, b) => a - b);
    setCompletedWeeksByTheme((prev) => ({ ...prev, [themeId]: updated }));
    setXp((x) => x + 25);

    if (updated.length >= 4 && existing.length < 4) {
      setStreakDays((s) => s + 1);
      showToast(
        lang === 'hi'
          ? 'बधाई! 4-सप्ताह का विषय पूरा हुआ · +25 अंक व नया बैज अनलॉक!'
          : 'Congrats! 4-Week Theme Completed · +25 XP & Badge Unlocked!'
      );
    } else {
      showToast(
        lang === 'hi'
          ? `सप्ताह ${weekNumber} पूर्ण · +25 अंक जुड़े!`
          : `Week ${weekNumber} completed · +25 XP earned!`
      );
    }
  };

  const handleSubmitVoiceSolution = (payload: {
    method: 'voice' | 'text';
    text: string;
    durationSec: number;
    audioUrl?: string;
  }) => {
    trackVoiceRecordingCompleted('plan', 'solution', payload.durationSec);
    const teacherName = profile?.name || 'शिक्षक साथी';
    const blockDistrict = profile?.blockDistrict || 'आपका ब्लॉक';

    const newSol: PeerSolution = {
      id: `user-sol-${Date.now()}`,
      themeId: selectedTheme.id,
      teacherName: { hi: teacherName, en: teacherName },
      blockDistrict: { hi: blockDistrict, en: blockDistrict },
      avatarUrl: AVATAR_SUNITA,
      audioDurationSec: payload.durationSec,
      summary: {
        hi: payload.text.slice(0, 90),
        en: payload.text.slice(0, 90),
      },
      transcript: {
        hi: payload.text,
        en: payload.text,
      },
      helpfulCount: 0,
      isUserSubmitted: true,
      recordedAudioUrl: payload.audioUrl,
    };

    const newStory: CommunityStory = {
      id: `user-story-${Date.now()}`,
      teacherName: { hi: teacherName, en: teacherName },
      blockDistrict: { hi: blockDistrict, en: blockDistrict },
      avatarUrl: AVATAR_SUNITA,
      themeId: selectedTheme.id,
      themeLabel: selectedTheme.title,
      storyType: 'solution',
      headline: {
        hi: `${selectedTheme.title.hi} — मेरा कक्षा समाधान`,
        en: `${selectedTheme.title.en} — My classroom solution`,
      },
      body: { hi: payload.text, en: payload.text },
      timeAgo: { hi: 'अभी', en: 'Just now' },
      applauseCount: 0,
      hasVoice: payload.method === 'voice',
      audioDurationSec: payload.durationSec,
      isUserSubmitted: true,
    };

    setPeerSolutions((prev) => [newSol, ...prev]);
    setStories((prev) => [newStory, ...prev]);
    setUserSolutionsCount((c) => c + 1);
    setXp((x) => x + 50);
    setStreakDays((s) => s + 1);
    showToast(
      lang === 'hi'
        ? '+50 अंक मिले! आपका समाधान शिक्षक समुदाय में जुड़ गया है!'
        : '+50 XP earned! Your solution is shared with the community!'
    );
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

    const teacherName = profile?.name || 'शिक्षक साथी';
    const blockDistrict = profile?.blockDistrict || 'आपका ब्लॉक';

    const newStory: CommunityStory = {
      id: `user-challenge-${Date.now()}`,
      teacherName: { hi: teacherName, en: teacherName },
      blockDistrict: { hi: blockDistrict, en: blockDistrict },
      avatarUrl: AVATAR_SUNITA,
      themeId: payload.topicKey,
      themeLabel: { hi: 'कक्षा अनुभव साझा', en: 'Classroom Inquiry' },
      storyType: 'challenge_shared',
      headline: {
        hi: 'कक्षा में जिस विषय पर काम कर रहे हैं',
        en: 'Currently working on in class',
      },
      body: { hi: payload.text, en: payload.text },
      timeAgo: { hi: 'अभी', en: 'Just now' },
      applauseCount: 0,
      hasVoice: payload.method === 'voice',
      audioDurationSec: payload.durationSec,
      isUserSubmitted: true,
    };

    setStories((prev) => [newStory, ...prev]);
    setUserChallengesCount((c) => c + 1);
    setXp((x) => x + 30);
    showToast(
      lang === 'hi'
        ? '+30 अंक मिले! आपकी बात समुदाय फ़ीड में साझा हो गई है!'
        : '+30 XP earned! Your note is now shared in Community!'
    );
  };

  const handleSwitchVariant = (variant: AbVariant) => {
    stop();
    setAbVariant(variant, activeScreen);
    if (variant === 'A') {
      navigateTo('welcome');
    } else if (activeScreen === 'welcome' && profile) {
      navigateTo('map');
    }
  };

  const handleRandomizeVariant = () => {
    const picked = randomize5050Variant(activeScreen);
    if (picked === 'A') {
      navigateTo('welcome');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F7F9] text-[#18202C] pb-20 md:pb-8">
      {!phonePreview && (
        <TopBar
          lang={lang}
          activeScreen={activeScreen}
          variant={telemetry.variant}
          onNavigate={(screen) => navigateTo(screen)}
          onToggleLanguage={handleToggleLanguage}
        />
      )}

      <VariantSwitcherBar
        lang={lang}
        variant={telemetry.variant}
        phonePreview={phonePreview}
        onSelectVariant={handleSwitchVariant}
        onTogglePhonePreview={() => setPhonePreview((p) => !p)}
      />

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
          />
        )}

        <main className={phonePreview ? '@container flex-1 overflow-y-auto' : '@container flex-1'}>
          {telemetry.variant === 'A' && (
            <WelcomeScreen
              lang={lang}
              variant="A"
              profile={profile}
              speakingId={speakingId}
              loadingAudioId={loadingAudioId}
              onSpeak={handleSpeak}
              onLoginSuccess={handleLoginSuccess}
              onGoToMap={() => navigateTo('map')}
              onVariantAPromptSent={trackVariantAPrompt}
            />
          )}

          {telemetry.variant === 'B' && (
            <>
              {activeScreen === 'welcome' && (
                <WelcomeScreen
                  lang={lang}
                  variant="B"
                  profile={profile}
                  xp={xp}
                  streakDays={streakDays}
                  speakingId={speakingId}
                  loadingAudioId={loadingAudioId}
                  onSpeak={handleSpeak}
                  onLoginSuccess={handleLoginSuccess}
                  onGoToMap={() => navigateTo('map')}
                  onGoToLeaderboard={() => navigateTo('community', { communityTab: 'recognition' })}
                  onVariantAPromptSent={trackVariantAPrompt}
                />
              )}

              {activeScreen === 'map' && (
                <ProblemMapScreen
                  lang={lang}
                  stories={stories}
                  applaudedIds={applaudedIds}
                  xp={xp}
                  streakDays={streakDays}
                  completedWeeksByTheme={completedWeeksByTheme}
                  speakingId={speakingId}
                  loadingAudioId={loadingAudioId}
                  onSpeak={handleSpeak}
                  onSelectTheme={handleSelectTheme}
                  onToggleApplause={(id) =>
                    setApplaudedIds((prev) =>
                      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
                    )
                  }
                  onGoToShareChallenge={() => navigateTo('share')}
                  onGoToBadges={() => navigateTo('community', { communityTab: 'recognition' })}
                  onOpenAssistant={(q) => openAssistant(q)}
                />
              )}

              {activeScreen === 'plan' && (
                <PlanScreen
                  lang={lang}
                  theme={selectedTheme}
                  solutions={peerSolutions}
                  xp={xp}
                  streakDays={streakDays}
                  completedWeeks={completedWeeksByTheme[selectedTheme.id] ?? []}
                  speakingId={speakingId}
                  loadingAudioId={loadingAudioId}
                  onSpeak={handleSpeak}
                  onSelectTheme={(t) => {
                    setSelectedTheme(t);
                    trackTileTapped(t.id, t.title.en, t.sourceType);
                    trackPlanOpened(t.id, t.title.en);
                  }}
                  onToggleWeekDone={handleToggleWeekDone}
                  onBackToMap={() => navigateTo('map')}
                  onGoToBadges={() => navigateTo('community', { communityTab: 'recognition' })}
                  onScrollDepthReached={(pct) => trackPlanScrollDepth(pct, selectedTheme.id)}
                  onVoiceButtonTapped={() => trackVoiceButtonTapped('plan', selectedTheme.id)}
                  onVoiceRecordingStarted={() => trackVoiceRecordingStarted('plan', 'solution')}
                  onSubmitVoiceSolution={handleSubmitVoiceSolution}
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
                  speakingId={speakingId}
                  loadingAudioId={loadingAudioId}
                  onSpeak={handleSpeak}
                  onChallengeStarted={trackOwnChallengeStarted}
                  onVoiceRecordingStarted={() => trackVoiceRecordingStarted('share', 'challenge')}
                  onSubmitChallenge={handleSubmitChallenge}
                  onGoToCommunity={() => navigateTo('community', { communityTab: 'feed' })}
                  onGoToMap={() => navigateTo('map')}
                  onOpenAssistant={() => openAssistant()}
                />
              )}

              {activeScreen === 'community' && (
                <CommunityScreen
                  lang={lang}
                  profile={profile}
                  stories={stories}
                  applaudedIds={applaudedIds}
                  userSolutionsCount={userSolutionsCount}
                  userChallengesCount={userChallengesCount}
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
                  onGoToShare={() => navigateTo('share')}
                  onGoToPlan={() => navigateTo('plan')}
                />
              )}
            </>
          )}
        </main>

        {/* Floating AI Assistant Launcher inside 390px Phone Frame */}
        {phonePreview && telemetry.variant !== 'A' && !assistantOpen && (
          <button
            type="button"
            onClick={() => openAssistant()}
            className="absolute bottom-16 right-3 z-40 min-h-[44px] px-3.5 py-2 rounded-full bg-[#0D5C63] hover:bg-[#09474D] text-white text-xs font-semibold shadow-lg flex items-center gap-1.5 cursor-pointer transition-transform active:scale-95"
          >
            <Bot className="w-4 h-4" />
            <span>{lang === 'hi' ? 'AI सहायक' : 'AI Help'}</span>
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

        {phonePreview && telemetry.variant !== 'A' && (
          <MobileBottomNav
            lang={lang}
            activeScreen={activeScreen}
            variant={telemetry.variant}
            isPhoneFrame
            onNavigate={(screen) => navigateTo(screen)}
          />
        )}
      </div>

      {/* Quiet Researcher Footer with Field Telemetry Drawer Trigger */}
      <footer className="max-w-6xl w-full mx-auto px-4 sm:px-6 pt-4 pb-6 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <span>
          {lang === 'hi'
            ? 'साथी शिक्षक समुदाय · विषय चुनें और 4-सप्ताह में हल पूरा करें'
            : 'Saathi Teacher Community · Pick a theme and complete its 4-week path'}
        </span>

        <button
          type="button"
          onClick={() => setTelemetryOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium cursor-pointer transition-colors"
        >
          <Activity className="w-3.5 h-3.5 text-[#0D5C63]" />
          <span>
            {lang === 'hi'
              ? 'फ़ील्ड डेटा व विकल्प'
              : 'Field Data & Views'}
          </span>
        </button>
      </footer>

      {!phonePreview && telemetry.variant !== 'A' && !assistantOpen && (
        <button
          type="button"
          onClick={() => openAssistant()}
          className="fixed bottom-18 right-3.5 md:bottom-6 md:right-6 z-40 min-h-[48px] px-4 py-2.5 rounded-full bg-[#0D5C63] hover:bg-[#09474D] text-white text-xs sm:text-sm font-semibold shadow-xl flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
        >
          <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>{lang === 'hi' ? 'साथी AI सहायक' : 'Saathi AI'}</span>
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
          className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-medium shadow-lg flex items-center gap-2 max-w-[90vw]"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {!phonePreview && telemetry.variant !== 'A' && (
        <MobileBottomNav
          lang={lang}
          activeScreen={activeScreen}
          variant={telemetry.variant}
          onNavigate={(screen) => navigateTo(screen)}
        />
      )}

      <TelemetryDrawer
        isOpen={telemetryOpen}
        onClose={() => setTelemetryOpen(false)}
        lang={lang}
        telemetry={telemetry}
        onSwitchVariant={handleSwitchVariant}
        onRandomize5050={handleRandomizeVariant}
        onResetSession={() => {
          resetTelemetry('B');
          setProfile(null);
          setPeerSolutions(INITIAL_PEER_SOLUTIONS);
          setStories(INITIAL_COMMUNITY_STORIES);
          setUserSolutionsCount(0);
          setUserChallengesCount(0);
          setXp(75);
          setStreakDays(3);
          setCompletedWeeksByTheme({ 'multi-age': [1] });
          setCommunityTab('feed');
          navigateTo('welcome');
        }}
      />
    </div>
  );
}
