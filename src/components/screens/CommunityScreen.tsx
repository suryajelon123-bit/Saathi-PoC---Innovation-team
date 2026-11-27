import {
  ArrowRight,
  Award,
  CheckCircle2,
  Crown,
  Flame,
  Heart,
  Loader2,
  Medal,
  Mic,
  Pause,
  Play,
  Shield,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  AVATAR_SUNITA,
  DISTRICT_RECOGNITION_LIST,
  PROBLEM_THEMES,
  UI_COPY,
} from '../../data/saathiContent';
import { CommunityStory, Language, TeacherProfile } from '../../types';

interface CommunityScreenProps {
  lang: Language;
  profile: TeacherProfile | null;
  stories: CommunityStory[];
  applaudedIds: string[];
  userSolutionsCount: number;
  userChallengesCount: number;
  xp: number;
  streakDays: number;
  completedWeeksByTheme: Record<string, number[]>;
  initialTab?: 'feed' | 'recognition';
  speakingId: string | null;
  loadingAudioId?: string | null;
  onSpeak: (id: string, text: string, speakerGender?: 'female' | 'male') => void;
  onToggleApplause: (storyId: string) => void;
  onOpenBadgeTab: () => void;
  onGoToShare: () => void;
  onGoToPlan: () => void;
}

export function CommunityScreen({
  lang,
  profile,
  stories,
  applaudedIds,
  userSolutionsCount,
  userChallengesCount,
  xp,
  streakDays,
  completedWeeksByTheme,
  initialTab = 'recognition',
  speakingId,
  loadingAudioId = null,
  onSpeak,
  onToggleApplause,
  onOpenBadgeTab,
  onGoToShare,
  onGoToPlan,
}: CommunityScreenProps) {
  const [activeTab, setActiveTab] = useState<'feed' | 'recognition'>(initialTab);
  const [badgeSentiment, setBadgeSentiment] = useState<string | null>(null);
  const [cheeredLeaderIds, setCheeredLeaderIds] = useState<string[]>([]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleTabChange = (tab: 'feed' | 'recognition') => {
    setActiveTab(tab);
    if (tab === 'recognition') {
      onOpenBadgeTab();
    }
  };

  const toggleCheer = (id: string) => {
    setCheeredLeaderIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const teacherDisplayName =
    profile?.name || (lang === 'hi' ? 'आप (शिक्षक साथी)' : 'You (Teacher Saathi)');
  const teacherDistrict =
    profile?.blockDistrict || (lang === 'hi' ? 'आपका ब्लॉक / ज़िला' : 'Your Block / District');

  const totalWeeksDone = Object.values(completedWeeksByTheme).reduce(
    (sum, w) => sum + w.length,
    0
  );
  const completedThemesCount = PROBLEM_THEMES.filter(
    (t) => (completedWeeksByTheme[t.id]?.length ?? 0) >= 4
  ).length;
  const totalThanksReceived = 14 + userSolutionsCount * 3;
  const schoolsReached = 6 + userSolutionsCount * 2;

  // Build live sorted leaderboard combining peer teachers + current user
  const userEntry = {
    id: 'current-user',
    isCurrentUser: true,
    teacherName: { hi: teacherDisplayName, en: teacherDisplayName },
    schoolAndBlock: {
      hi: profile?.blockDistrict || 'आपका स्कूल व ब्लॉक',
      en: profile?.blockDistrict || 'Your School & Block',
    },
    district: { hi: '', en: '' },
    avatarUrl: AVATAR_SUNITA,
    solutionsShared: userSolutionsCount,
    teachersHelped: totalThanksReceived,
    xp,
    streakDays,
    weeksCompleted: totalWeeksDone,
    honorTitle:
      completedThemesCount >= 1
        ? { hi: '4-सप्ताह विषय विजेता', en: '4-Week Theme Winner' }
        : totalWeeksDone >= 1
        ? { hi: 'प्रगतिशील शिक्षक साथी', en: 'Rising Teacher Saathi' }
        : { hi: 'नया शिक्षक साथी', en: 'New Teacher Saathi' },
  };

  const combinedLeaderboard = [
    ...DISTRICT_RECOGNITION_LIST.map((e) => ({ ...e, isCurrentUser: false })),
    userEntry,
  ]
    .sort((a, b) => b.xp - a.xp)
    .map((entry, idx) => ({ ...entry, liveRank: idx + 1 }));

  const myEntry = combinedLeaderboard.find((e) => e.isCurrentUser)!;
  const personAbove =
    myEntry.liveRank > 1
      ? combinedLeaderboard.find((e) => e.liveRank === myEntry.liveRank - 1) ?? null
      : null;
  const xpNeededForNext = personAbove ? Math.max(5, personAbove.xp - myEntry.xp + 5) : 0;
  const progressToNextPct = personAbove
    ? Math.min(95, Math.max(18, Math.round((myEntry.xp / Math.max(1, personAbove.xp)) * 100)))
    : 100;

  const topThree = combinedLeaderboard.slice(0, 3);
  const podiumOrder = topThree.length === 3 ? [topThree[1], topThree[0], topThree[2]] : topThree;

  const shields = [
    {
      id: 'streak',
      icon: Flame,
      title: { hi: '3-दिन की लय', en: '3-Day Streak' },
      desc: {
        hi: 'लगातार कक्षा सुधार से जुड़ने पर',
        en: 'Consistent weekly engagement',
      },
      unlocked: streakDays >= 3,
    },
    {
      id: 'first-week',
      icon: CheckCircle2,
      title: { hi: 'पहला सप्ताह पूर्ण', en: 'First Week Done' },
      desc: {
        hi: 'किसी विषय का पहला सप्ताह पूरा करने पर',
        en: 'Complete Week 1 of any theme',
      },
      unlocked: totalWeeksDone >= 1,
    },
    {
      id: 'four-week-master',
      icon: Trophy,
      title: { hi: '4-सप्ताह विषय विजेता', en: '4-Week Theme Winner' },
      desc: {
        hi: 'किसी एक विषय के चारों सप्ताह (1–4) पूरे करने पर',
        en: 'Complete all 4 weeks of a theme',
      },
      unlocked: completedThemesCount >= 1,
    },
    {
      id: 'voice-honor',
      icon: Mic,
      title: { hi: 'समाधान आवाज़ सम्मान', en: 'Solution Voice Honor' },
      desc: {
        hi: 'अपना कक्षा समाधान आवाज़ में साझा करने पर',
        en: 'Share your own voice solution',
      },
      unlocked: userSolutionsCount >= 1,
    },
  ];

  return (
    <div className="space-y-0">
      {/* Gamified HUD Strip */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-3.5 @xl:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-3.5 @xl:gap-6">
            <div className="flex items-center gap-1.5 text-xs @xl:text-sm font-bold text-[#D97706]">
              <Flame className="w-4 h-4 @xl:w-5 @xl:h-5 fill-[#F59E0B] text-[#D97706]" />
              <span className="tabular-nums">
                {streakDays} {lang === 'hi' ? 'दिन लय' : 'Day Streak'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs @xl:text-sm font-bold text-[#0D5C63]">
              <Zap className="w-4 h-4 fill-[#0D5C63]" />
              <span className="tabular-nums">
                {xp} {lang === 'hi' ? 'अंक' : 'XP'}
              </span>
            </div>

            <div className="hidden @xl:flex items-center gap-1.5 text-xs font-semibold text-slate-600 tabular-nums">
              <Shield className="w-4 h-4 text-[#B45309]" />
              <span>
                {shields.filter((s) => s.unlocked).length}/4{' '}
                {lang === 'hi' ? 'बैज प्राप्त' : 'Badges Unlocked'}
              </span>
            </div>
          </div>

          <span className="text-xs font-bold text-[#0D5C63] tabular-nums">
            {lang === 'hi' ? `आपकी रैंक #${myEntry.liveRank}` : `Your Rank #${myEntry.liveRank}`}
          </span>
        </div>
      </div>

      <section className="max-w-6xl mx-auto px-3.5 @xl:px-6 py-4 @3xl:py-8 space-y-5 @xl:space-y-6">
        {/* Header + Segmented View Switch */}
        <div className="flex flex-col @3xl:flex-row @3xl:items-end justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <p className="text-xs font-semibold text-[#0D5C63]">
              {lang === 'hi'
                ? 'शिक्षक समुदाय · लीडरबोर्ड, बैज और अनुभव'
                : 'Teacher Community · Leaderboard, Badges & Stories'}
            </p>
            <h1 className="text-xl @xl:text-3xl font-bold text-slate-900 text-balance">
              {lang === 'hi'
                ? 'ब्लॉक लीडरबोर्ड, आपके बैज और साथियों के अनुभव'
                : 'Block leaderboard, earned shields & teacher stories'}
            </h1>
            <p className="text-sm text-slate-600">
              {lang === 'hi'
                ? 'सप्ताह 1–4 पूरा करें और अपनी आवाज़ में समाधान जोड़ें — आपका हर प्रयास आस-पास के स्कूलों की मदद करता है।'
                : 'Complete Weeks 1–4 and share voice solutions—every point reflects real classroom impact.'}
            </p>
          </div>

          <div
            role="tablist"
            aria-label={lang === 'hi' ? 'समुदाय दृश्य' : 'Community Views'}
            className="inline-flex items-center gap-1 p-1 bg-slate-200/75 rounded-xl self-start @3xl:self-auto"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'recognition'}
              onClick={() => handleTabChange('recognition')}
              className={`min-h-[40px] px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'recognition'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'hi' ? 'लीडरबोर्ड व बैज' : 'Leaderboard & Badges'}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'feed'}
              onClick={() => handleTabChange('feed')}
              className={`min-h-[40px] px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'feed'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'hi' ? 'अनुभव व धन्यवाद' : 'Stories & Thanks'}
            </button>
          </div>
        </div>

        {activeTab === 'feed' ? (
          <div className="grid grid-cols-1 @5xl:grid-cols-12 gap-5 items-start">
            {/* Stories Feed */}
            <div className="@5xl:col-span-8 space-y-4">
              {stories.map((story) => {
                const isApplauded = applaudedIds.includes(story.id);
                const isLoadingVoice = loadingAudioId === `story-${story.id}`;
                const isPlaying = speakingId === `story-${story.id}`;

                return (
                  <article
                    key={story.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 @xl:p-6 space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={story.avatarUrl}
                          alt={story.teacherName[lang]}
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {story.teacherName[lang]}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {story.blockDistrict[lang]} · {story.themeLabel[lang]} · {story.timeAgo[lang]}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          onSpeak(
                            `story-${story.id}`,
                            `${story.headline[lang]}. ${story.body[lang]}`,
                            story.avatarUrl.includes('rajesh') ? 'male' : 'female'
                          )
                        }
                        aria-label={UI_COPY.listen[lang]}
                        className="min-h-[40px] min-w-[40px] px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        {isLoadingVoice ? (
                          <Loader2 className="w-4 h-4 text-[#0D5C63] animate-spin" />
                        ) : isPlaying ? (
                          <VolumeX className="w-4 h-4 text-[#0D5C63]" />
                        ) : (
                          <Volume2 className="w-4 h-4 text-[#0D5C63]" />
                        )}
                        <span className="hidden sm:inline">
                          {isLoadingVoice
                            ? lang === 'hi'
                              ? 'आवाज़ तैयार...'
                              : 'Loading...'
                            : isPlaying
                            ? UI_COPY.stopListening[lang]
                            : UI_COPY.listen[lang]}
                        </span>
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                        {story.headline[lang]}
                      </h2>
                      <p className="text-sm text-slate-700 leading-relaxed">{story.body[lang]}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {story.hasVoice && (
                          <button
                            type="button"
                            onClick={() =>
                              onSpeak(
                                `story-${story.id}`,
                                story.body[lang],
                                story.avatarUrl.includes('rajesh') ? 'male' : 'female'
                              )
                            }
                            className={`min-h-[40px] px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer ${
                              isPlaying
                                ? 'bg-[#0D5C63] text-white'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                            }`}
                          >
                            {isLoadingVoice ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : isPlaying ? (
                              <Pause className="w-3.5 h-3.5" />
                            ) : (
                              <Play className="w-3.5 h-3.5" />
                            )}
                            <span className="tabular-nums">
                              {isLoadingVoice
                                ? lang === 'hi'
                                  ? 'आवाज़ तैयार...'
                                  : 'Loading...'
                                : `${lang === 'hi' ? 'सुनें' : 'Play'} (${
                                    story.audioDurationSec ?? 30
                                  }s)`}
                            </span>
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => onToggleApplause(story.id)}
                        className={`min-h-[40px] px-3.5 py-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer tabular-nums ${
                          isApplauded
                            ? 'border-[#B45309] bg-amber-50 text-[#92400E]'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isApplauded ? 'fill-current' : ''}`} />
                        <span>
                          {lang === 'hi' ? 'धन्यवाद' : 'Thanks'} ·{' '}
                          {story.applauseCount + (isApplauded ? 1 : 0)}
                        </span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Right Rail: Gratitude & Warm Impact Summary */}
            <aside className="@5xl:col-span-4 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 @xl:p-5 space-y-4">
                <div className="flex items-center gap-2.5">
                  <Award className="w-5 h-5 text-[#B45309]" />
                  <h2 className="text-base font-bold text-slate-900">
                    {lang === 'hi' ? 'आपका योगदान और पहुँच' : 'Your Impact & Reach'}
                  </h2>
                </div>
                <p className="text-sm text-slate-600">
                  {lang === 'hi'
                    ? 'जब आप 4-सप्ताह पथ पूरा करते हैं या आवाज़ में तरीका साझा करते हैं, तो अन्य शिक्षक धन्यवाद भेजते हैं।'
                    : 'As you complete 4-week paths and share voice solutions, nearby teachers try your ideas and thank you.'}
                </p>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                    <div className="text-xs text-slate-500">
                      {lang === 'hi' ? 'कुल अंक (XP)' : 'Total Points'}
                    </div>
                    <div className="text-xl font-bold text-[#0D5C63] tabular-nums mt-0.5">
                      {xp}
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                    <div className="text-xs text-slate-500">
                      {lang === 'hi' ? 'सप्ताह पूरे' : 'Weeks Done'}
                    </div>
                    <div className="text-xl font-bold text-slate-900 tabular-nums mt-0.5">
                      {totalWeeksDone}
                    </div>
                  </div>
                  <div className="rounded-xl bg-amber-50/70 border border-amber-200 p-3">
                    <div className="text-xs text-[#92400E]">
                      {lang === 'hi' ? 'धन्यवाद संदेश' : 'Thank-you Notes'}
                    </div>
                    <div className="text-xl font-bold text-slate-900 tabular-nums mt-0.5">
                      {totalThanksReceived}
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#EEF6F6] border border-[#B6D4D6] p-3">
                    <div className="text-xs text-[#0D5C63]">
                      {lang === 'hi' ? 'स्कूलों ने आज़माया' : 'Schools Reached'}
                    </div>
                    <div className="text-xl font-bold text-slate-900 tabular-nums mt-0.5">
                      {schoolsReached}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleTabChange('recognition')}
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold cursor-pointer transition-colors"
                >
                  {lang === 'hi' ? 'लीडरबोर्ड व बैज देखें' : 'View Leaderboard & Badges'}
                </button>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
                <h3 className="text-sm font-bold text-slate-900">
                  {lang === 'hi' ? 'क्या आप भी अपनी बात जोड़ना चाहते हैं?' : 'Want to add your voice?'}
                </h3>
                <p className="text-xs text-slate-600">
                  {lang === 'hi'
                    ? 'कक्षा में आज आप जिस बात पर काम कर रहे हैं, उसे साझा करें (+30 अंक)।'
                    : 'Share what you are working on in your classroom right now (+30 XP).'}
                </p>
                <button
                  type="button"
                  onClick={onGoToShare}
                  className="w-full min-h-[44px] px-4 py-2 rounded-xl border border-[#0D5C63] text-[#0D5C63] hover:bg-[#EEF6F6] text-sm font-semibold cursor-pointer transition-colors"
                >
                  {lang === 'hi' ? 'अपनी बात साझा करें (+30 अंक)' : 'Share what you need (+30 XP)'}
                </button>
              </div>
            </aside>
          </div>
        ) : (
          /* CELEBRATORY MOTIVATING LEADERBOARD + SHIELDS */
          <div className="grid grid-cols-1 @5xl:grid-cols-12 gap-5 @xl:gap-6 items-start">
            {/* Left Column: Motivating Leaderboard (Top-3 Podium + Next Rank Goal + Full List) */}
            <div className="@5xl:col-span-7 space-y-5">
              {/* Personal Motivation & Next Milestone Card */}
              <div className="rounded-2xl border-2 border-[#B6D4D6] bg-gradient-to-br from-[#0D5C63] to-[#083F44] text-white p-4 @xl:p-6 space-y-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>
                        {lang === 'hi'
                          ? `आपकी वर्तमान स्थिति · रैंक #${myEntry.liveRank}`
                          : `YOUR LIVE STANDING · RANK #${myEntry.liveRank}`}
                      </span>
                    </p>
                    <h2 className="text-lg @xl:text-xl font-bold leading-snug">
                      {personAbove
                        ? lang === 'hi'
                          ? `${personAbove.teacherName.hi} (#${personAbove.liveRank}) से आगे बढ़ने के लिए केवल ${xpNeededForNext} अंक और!`
                          : `Only ${xpNeededForNext} XP to pass ${personAbove.teacherName.en} (#${personAbove.liveRank})!`
                        : lang === 'hi'
                        ? 'शानदार! आप अपने ब्लॉक लीडरबोर्ड में पहले स्थान पर हैं!'
                        : 'Amazing! You are #1 on your Block Leaderboard!'}
                    </h2>
                  </div>

                  <div className="rounded-xl bg-white/15 px-3.5 py-2 text-right shrink-0">
                    <div className="text-[11px] text-white/80">
                      {lang === 'hi' ? 'आपके अंक' : 'Your XP'}
                    </div>
                    <div className="text-xl font-extrabold tabular-nums text-amber-300">
                      {xp}
                    </div>
                  </div>
                </div>

                {/* Progress Bar toward Next Rank */}
                <div className="space-y-1.5">
                  <div className="h-3 w-full rounded-full bg-white/20 overflow-hidden">
                    <div
                      className="h-full bg-[#FACC15] rounded-full transition-all duration-500"
                      style={{ width: `${progressToNextPct}%` }}
                    />
                  </div>
                  <p className="text-xs text-white/85">
                    {lang === 'hi'
                      ? 'सप्ताह पूरा करें (+25 अंक) या अपना तरीका आवाज़ में साझा करें (+50 अंक) — हर कदम से दूसरे शिक्षकों को मदद मिलती है।'
                      : 'Complete a week (+25 XP) or share a voice solution (+50 XP) to rise while helping peers.'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={onGoToPlan}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs @xl:text-sm font-bold border-b-4 border-[#14532D] active:translate-y-[2px] active:border-b-2 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{lang === 'hi' ? 'अगला सप्ताह पूरा करें (+25 अंक)' : 'Complete a Week (+25 XP)'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={onGoToShare}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs @xl:text-sm font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Mic className="w-4 h-4" />
                    <span>{lang === 'hi' ? 'बात साझा करें (+30 अंक)' : 'Share Note (+30 XP)'}</span>
                  </button>
                </div>
              </div>

              {/* Top 3 Celebratory Podium */}
              <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-b from-amber-50/90 via-white to-white p-4 @xl:p-6 space-y-5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base @xl:text-lg font-bold text-slate-900">
                      {lang === 'hi'
                        ? 'प्रमुख सहयोगी शिक्षक (शीर्ष 3)'
                        : 'Top Peer Mentors (Top 3)'}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {lang === 'hi'
                        ? 'जिन शिक्षकों के उपाय ज़्यादा स्कूलों के काम आए'
                        : 'Teachers whose shared solutions helped the most schools'}
                    </p>
                  </div>
                  <Trophy className="w-5 h-5 text-[#D97706] shrink-0" />
                </div>

                <div className="grid grid-cols-3 gap-2 @xl:gap-4 items-end pt-2">
                  {podiumOrder.map((entry) => {
                    const isFirst = entry.liveRank === 1;
                    const isSecond = entry.liveRank === 2;
                    return (
                      <div
                        key={entry.id}
                        className={`rounded-2xl border p-2.5 @xl:p-4 text-center flex flex-col items-center transition-all ${
                          isFirst
                            ? 'bg-amber-50/90 border-amber-300 shadow-sm -translate-y-2'
                            : isSecond
                            ? 'bg-slate-50 border-slate-300'
                            : 'bg-orange-50/50 border-orange-200'
                        }`}
                      >
                        <div className="mb-1.5">
                          {isFirst ? (
                            <Crown className="w-5 h-5 text-[#D97706] fill-[#FBBF24] mx-auto" />
                          ) : (
                            <Medal
                              className={`w-4 h-4 mx-auto ${
                                isSecond ? 'text-slate-500' : 'text-amber-700'
                              }`}
                            />
                          )}
                        </div>

                        <div className="relative">
                          <img
                            src={entry.avatarUrl}
                            alt={entry.teacherName[lang]}
                            referrerPolicy="no-referrer"
                            className={`rounded-full object-cover border-2 ${
                              isFirst
                                ? 'w-14 h-14 @xl:w-16 @xl:h-16 border-[#F59E0B]'
                                : 'w-11 h-11 @xl:w-13 @xl:h-13 border-slate-300'
                            }`}
                          />
                          <span
                            className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full text-[11px] font-extrabold text-white flex items-center justify-center tabular-nums ${
                              isFirst
                                ? 'bg-[#D97706]'
                                : isSecond
                                ? 'bg-slate-600'
                                : 'bg-amber-800'
                            }`}
                          >
                            {entry.liveRank}
                          </span>
                        </div>

                        <p className="text-xs @xl:text-sm font-bold text-slate-900 mt-2.5 line-clamp-1">
                          {entry.teacherName[lang]}
                        </p>
                        <p className="text-[10px] @xl:text-[11px] text-[#B45309] font-semibold line-clamp-1 mt-0.5">
                          {entry.honorTitle[lang]}
                        </p>

                        <div className="mt-2 pt-2 border-t border-slate-200/70 w-full flex flex-col items-center gap-0.5">
                          <span className="text-xs @xl:text-sm font-extrabold text-[#0D5C63] tabular-nums">
                            {entry.xp} {lang === 'hi' ? 'अंक' : 'XP'}
                          </span>
                          <span className="text-[10px] text-slate-500 tabular-nums">
                            {entry.teachersHelped} {lang === 'hi' ? 'धन्यवाद' : 'thanks'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Complete Ranked List including Current User + Peer Cheer Button */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 @xl:p-6 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm @xl:text-base font-bold text-slate-900">
                    {lang === 'hi'
                      ? 'पूरा ब्लॉक व ज़िला क्रम'
                      : 'Full Block & District Standings'}
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    {lang === 'hi' ? 'उदाहरण + आपकी लाइव रैंक' : 'Sample peers + your live rank'}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {combinedLeaderboard.map((entry) => {
                    const isCheered = cheeredLeaderIds.includes(entry.id);
                    return (
                      <div
                        key={entry.id}
                        className={`rounded-xl border p-3 @xl:p-3.5 flex flex-wrap items-center justify-between gap-3 transition-colors ${
                          entry.isCurrentUser
                            ? 'border-[#0D5C63] bg-[#EEF6F6] ring-2 ring-[#0D5C63]/15'
                            : 'border-slate-200 bg-white hover:bg-slate-50/70'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span
                            className={`w-7 h-7 rounded-lg text-xs font-extrabold flex items-center justify-center tabular-nums shrink-0 ${
                              entry.liveRank === 1
                                ? 'bg-amber-100 text-[#B45309]'
                                : entry.isCurrentUser
                                ? 'bg-[#0D5C63] text-white'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {entry.liveRank}
                          </span>

                          <img
                            src={entry.avatarUrl}
                            alt={entry.teacherName[lang]}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                          />

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-bold text-slate-900 truncate">
                                {entry.teacherName[lang]}
                              </p>
                              {entry.isCurrentUser && (
                                <span className="text-[11px] font-bold text-[#0D5C63] shrink-0">
                                  ({lang === 'hi' ? 'आप' : 'You'})
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 truncate">
                              {entry.schoolAndBlock[lang]}
                              {entry.district[lang] ? ` · ${entry.district[lang]}` : ''}
                            </p>
                            <p className="text-[11px] font-semibold text-[#B45309] mt-0.5">
                              {entry.honorTitle[lang]} · {entry.weeksCompleted}{' '}
                              {lang === 'hi' ? 'सप्ताह' : 'wks'} · {entry.streakDays}d 🔥
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          <div className="text-right">
                            <div className="text-sm font-extrabold text-[#0D5C63] tabular-nums">
                              {entry.xp} {lang === 'hi' ? 'अंक' : 'XP'}
                            </div>
                            <div className="text-[11px] text-slate-500 tabular-nums">
                              {entry.teachersHelped + (isCheered ? 1 : 0)}{' '}
                              {lang === 'hi' ? 'सराहना' : 'cheers'}
                            </div>
                          </div>

                          {!entry.isCurrentUser && (
                            <button
                              type="button"
                              onClick={() => toggleCheer(entry.id)}
                              aria-label={lang === 'hi' ? 'सराहें' : 'Cheer teacher'}
                              className={`min-h-[38px] px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                                isCheered
                                  ? 'border-amber-300 bg-amber-50 text-[#B45309]'
                                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <Heart className={`w-3.5 h-3.5 ${isCheered ? 'fill-current' : ''}`} />
                              <span className="hidden sm:inline">
                                {isCheered
                                  ? lang === 'hi'
                                    ? 'सराहा'
                                    : 'Cheered'
                                  : lang === 'hi'
                                  ? 'सराहें'
                                  : 'Cheer'}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Teacher's Own Honor Card + 4 Unlocked Shields */}
            <div className="@5xl:col-span-5 rounded-2xl border border-slate-200 bg-white p-4 @xl:p-6 space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-[#B45309]">
                    {lang === 'hi' ? 'आपका शिक्षक सम्मान कार्ड' : 'Your Teacher Recognition Card'}
                  </p>
                  <h2 className="text-xl font-bold text-slate-900">{teacherDisplayName}</h2>
                  <p className="text-xs text-slate-500">
                    {teacherDistrict} · {xp} {lang === 'hi' ? 'अंक' : 'XP'} ·{' '}
                    {userSolutionsCount + userChallengesCount}{' '}
                    {lang === 'hi' ? 'साझा अनुभव' : 'shares'}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                  <Award className="w-6 h-6 text-[#B45309]" />
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-200">
                <p className="text-sm font-semibold text-slate-900">
                  {lang === 'hi' ? 'आपके सम्मान बैज (4)' : 'Your Honor Shields (4)'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {shields.map((shield) => {
                    const Icon = shield.icon;
                    return (
                      <div
                        key={shield.id}
                        className={`p-3.5 rounded-xl border transition-colors ${
                          shield.unlocked
                            ? 'border-amber-300 bg-amber-50/75'
                            : 'border-slate-200 bg-slate-50 opacity-75'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <Icon
                            className={`w-5 h-5 ${
                              shield.unlocked ? 'text-[#B45309]' : 'text-slate-400'
                            }`}
                          />
                          <span
                            className={`text-[11px] font-bold ${
                              shield.unlocked ? 'text-[#15803D]' : 'text-slate-500'
                            }`}
                          >
                            {shield.unlocked
                              ? lang === 'hi'
                                ? 'प्राप्त ✓'
                                : 'Earned ✓'
                              : lang === 'hi'
                              ? 'बाकी'
                              : 'Locked'}
                          </span>
                        </div>
                        <div className="text-sm font-bold text-slate-900">{shield.title[lang]}</div>
                        <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                          {shield.desc[lang]}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Simple feedback prompt */}
              <div className="pt-4 border-t border-slate-200 space-y-2.5">
                <p className="text-xs font-semibold text-slate-800">
                  {lang === 'hi'
                    ? 'आपकी राय: क्या ब्लॉक या ज़िले में इस तरह का लीडरबोर्ड और सम्मान आपको प्रेरित करता है?'
                    : 'Quick question: Does a block or district leaderboard like this motivate you?'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'yes', hi: 'हाँ, बहुत प्रेरित करता है', en: 'Yes, motivating' },
                    { id: 'somewhat', hi: 'थोड़ा-बहुत', en: 'Somewhat' },
                    { id: 'no', hi: 'ज़्यादा ज़रूरी नहीं', en: 'Not needed' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setBadgeSentiment(opt.id)}
                      className={`min-h-[38px] px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                        badgeSentiment === opt.id
                          ? 'border-[#0D5C63] bg-[#0D5C63] text-white'
                          : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {opt[lang]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
