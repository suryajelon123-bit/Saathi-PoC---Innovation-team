import { User } from 'firebase/auth';
import {
  Activity,
  Award,
  CheckCircle2,
  ChevronDown,
  Cloud,
  Crown,
  Flame,
  Heart,
  Loader2,
  LogIn,
  Medal,
  Pause,
  Play,
  RefreshCw,
  Trophy,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  AVATAR_SUNITA,
  DISTRICT_RECOGNITION_LIST,
} from '../../data/saathiContent';
import { CloudLeaderboardRow, signInWithGoogle } from '../../services/saathiFirestore';
import { CommunityStory, Language, TeacherProfile } from '../../types';

interface CommunityScreenProps {
  lang: Language;
  profile: TeacherProfile | null;
  cloudUser: User | null;
  cloudLeaderboard: CloudLeaderboardRow[];
  cloudSyncing?: boolean;
  stories: CommunityStory[];
  applaudedIds: string[];
  userSolutionsCount: number;
  xp: number;
  streakDays: number;
  completedWeeksByTheme: Record<string, number[]>;
  initialTab?: 'feed' | 'recognition';
  speakingId: string | null;
  loadingAudioId?: string | null;
  onSpeak: (id: string, text: string, speakerGender?: 'female' | 'male') => void;
  onToggleApplause: (storyId: string) => void;
  onOpenBadgeTab: () => void;
  onSubmitFeedbackSentiment: (sentiment: 'yes' | 'somewhat' | 'no') => void;
  onRefreshCloudLeaderboard: () => void;
  onOpenTeamDashboard: () => void;
}

function getTeacherTier(xp: number, lang: Language): string {
  if (xp >= 250) return lang === 'hi' ? 'ज़िला चैंपियन' : 'District Champion';
  if (xp >= 150) return lang === 'hi' ? 'प्रखंड प्रेरक' : 'Block Trailblazer';
  if (xp >= 100) return lang === 'hi' ? 'एक्शन साथी' : 'Action Mentor';
  return lang === 'hi' ? 'नवप्रवर्तक शिक्षक' : 'Rising Teacher';
}

export function CommunityScreen({
  lang,
  profile,
  cloudUser,
  cloudLeaderboard,
  cloudSyncing = false,
  stories,
  applaudedIds,
  userSolutionsCount,
  xp,
  streakDays,
  completedWeeksByTheme,
  initialTab = 'recognition',
  speakingId,
  loadingAudioId = null,
  onSpeak,
  onToggleApplause,
  onOpenBadgeTab,
  onSubmitFeedbackSentiment,
  onRefreshCloudLeaderboard,
  onOpenTeamDashboard,
}: CommunityScreenProps) {
  const [activeTab, setActiveTab] = useState<'feed' | 'recognition'>(initialTab);
  const [badgeSentiment, setBadgeSentiment] = useState<'yes' | 'somewhat' | 'no' | null>(null);
  const [showPoll, setShowPoll] = useState(false);
  const [cheeredLeaderIds, setCheeredLeaderIds] = useState<string[]>([]);
  const [connectingFirebase, setConnectingFirebase] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleTabChange = (tab: 'feed' | 'recognition') => {
    setActiveTab(tab);
    if (tab === 'recognition') {
      onOpenBadgeTab();
    }
  };

  const teacherDisplayName =
    cloudUser?.displayName ||
    profile?.name ||
    (lang === 'hi' ? 'आप (शिक्षक साथी)' : 'You (Teacher Saathi)');

  const totalWeeksDone = Object.values(completedWeeksByTheme).reduce(
    (sum, w) => sum + w.length,
    0
  );

  const userEntry = {
    id: 'current-user',
    isCurrentUser: true,
    isLiveCloud: Boolean(cloudUser),
    teacherName: { hi: teacherDisplayName, en: teacherDisplayName },
    schoolAndBlock: {
      hi: profile?.blockDistrict || 'आपका स्कूल व ब्लॉक',
      en: profile?.blockDistrict || 'Your School & Block',
    },
    avatarUrl: cloudUser?.photoURL || AVATAR_SUNITA,
    teachersHelped: 14 + userSolutionsCount * 3,
    xp,
    streakDays,
    weeksCompleted: totalWeeksDone,
    honorTitle: {
      hi: getTeacherTier(xp, 'hi'),
      en: getTeacherTier(xp, 'en'),
    },
  };

  const remoteCloudPeers = cloudLeaderboard
    .filter((row) => !cloudUser || row.uid !== cloudUser.uid)
    .map((row) => ({
      id: `cloud_${row.uid}`,
      isCurrentUser: false,
      isLiveCloud: true,
      teacherName: { hi: row.displayName, en: row.displayName },
      schoolAndBlock: { hi: row.blockDistrict, en: row.blockDistrict },
      avatarUrl: AVATAR_SUNITA,
      teachersHelped: 10 + row.solutionsCount * 3,
      xp: row.xp,
      streakDays: row.streakDays,
      weeksCompleted: row.weeksDoneCount,
      honorTitle: {
        hi: getTeacherTier(row.xp, 'hi'),
        en: getTeacherTier(row.xp, 'en'),
      },
    }));

  const combinedLeaderboard = [
    ...DISTRICT_RECOGNITION_LIST.map((e) => ({ ...e, isCurrentUser: false, isLiveCloud: false })),
    ...remoteCloudPeers,
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
  const rankProgressPct = personAbove
    ? Math.min(95, Math.max(15, Math.round((myEntry.xp / Math.max(1, personAbove.xp)) * 100)))
    : 100;

  const podiumFirst = combinedLeaderboard[0];
  const podiumSecond = combinedLeaderboard[1];
  const podiumThird = combinedLeaderboard[2];
  const remainingRankings = combinedLeaderboard.slice(3);

  const handleConnectFirebase = async () => {
    setConnectingFirebase(true);
    try {
      await signInWithGoogle();
    } catch {
      // Cancelled or handled cleanly
    } finally {
      setConnectingFirebase(false);
    }
  };

  return (
    <section className="max-w-5xl mx-auto px-3.5 @xl:px-6 pt-3 pb-8 space-y-4">
      {/* Compact Stats + Team Dashboard Trigger */}
      <div className="rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3.5">
          <span className="text-xs font-bold text-[#D97706] flex items-center gap-1 tabular-nums">
            <Flame className="w-4 h-4 fill-[#F59E0B] text-[#D97706]" />
            {streakDays}d
          </span>
          <span className="text-xs font-bold text-[#0D5C63] flex items-center gap-1 tabular-nums">
            <Zap className="w-3.5 h-3.5 fill-[#0D5C63]" />
            {xp} {lang === 'hi' ? 'अंक' : 'XP'}
          </span>
          <span className="text-xs font-bold text-[#15803D] flex items-center gap-1 tabular-nums">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {totalWeeksDone} {lang === 'hi' ? 'सप्ताह' : 'wks'}
          </span>
          <span className="text-xs font-bold text-slate-700 tabular-nums">
            {lang === 'hi' ? `रैंक #${myEntry.liveRank}` : `Rank #${myEntry.liveRank}`}
          </span>
        </div>

        <button
          type="button"
          onClick={onOpenTeamDashboard}
          className="min-h-[34px] px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-bold text-[#0D5C63] flex items-center gap-1 cursor-pointer"
        >
          <Activity className="w-3.5 h-3.5" />
          <span>{lang === 'hi' ? 'टीम डैशबोर्ड' : 'Team Dashboard'}</span>
        </button>
      </div>

      {/* Sub-tabs: Leaderboard vs Stories */}
      <div
        role="tablist"
        aria-label={lang === 'hi' ? 'समुदाय दृश्य' : 'Community Views'}
        className="grid grid-cols-2 p-1 bg-slate-200/75 rounded-xl max-w-md"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'recognition'}
          onClick={() => handleTabChange('recognition')}
          className={`min-h-[40px] px-3 py-1.5 text-xs @xl:text-sm font-bold rounded-lg cursor-pointer ${
            activeTab === 'recognition' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
          }`}
        >
          {lang === 'hi' ? 'ब्लॉक लीडरबोर्ड' : 'Block Leaderboard'}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'feed'}
          onClick={() => handleTabChange('feed')}
          className={`min-h-[40px] px-3 py-1.5 text-xs @xl:text-sm font-bold rounded-lg cursor-pointer ${
            activeTab === 'feed' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
          }`}
        >
          {lang === 'hi' ? `साथी आवाज़ें (${stories.length})` : `Peer Stories (${stories.length})`}
        </button>
      </div>

      {activeTab === 'recognition' ? (
        <div className="space-y-4">
          {/* Gamified Tier & Rank Motivation Banner */}
          <div className="rounded-2xl bg-gradient-to-br from-[#0D5C63] via-[#0E6971] to-[#114B5F] text-white p-4 @xl:p-5 space-y-3 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-amber-300 uppercase tracking-wide">
                  {getTeacherTier(xp, lang)} · {lang === 'hi' ? `रैंक #${myEntry.liveRank}` : `Rank #${myEntry.liveRank}`}
                </p>
                <h2 className="text-base @xl:text-lg font-extrabold flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-300 shrink-0" />
                  <span>
                    {personAbove
                      ? lang === 'hi'
                        ? `${personAbove.teacherName.hi} से आगे बढ़ने के लिए केवल ${xpNeededForNext} XP!`
                        : `Only ${xpNeededForNext} XP to pass ${personAbove.teacherName.en}!`
                      : lang === 'hi'
                      ? 'आप ब्लॉक लीडरबोर्ड में #1 पर हैं!'
                      : 'You lead #1 in your block leaderboard!'}
                  </span>
                </h2>
              </div>
              <Award className="w-8 h-8 text-amber-300 shrink-0" />
            </div>

            <div className="space-y-1">
              <div className="h-2.5 w-full rounded-full bg-black/25 overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-300 transition-all duration-300"
                  style={{ width: `${rankProgressPct}%` }}
                />
              </div>
              <p className="text-[11px] text-white/85 flex items-center justify-between">
                <span>
                  {lang === 'hi'
                    ? 'हर सप्ताह एक्शन प्लान = +25 XP · समस्या हल = +50 XP'
                    : 'Each weekly plan = +25 XP · Solving theme = +50 XP'}
                </span>
                <span className="font-bold tabular-nums">{xp} XP</span>
              </p>
            </div>
          </div>

          {/* Elevated Top-3 Podium Showcase */}
          {podiumFirst && podiumSecond && podiumThird && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900">
                  {lang === 'hi' ? 'ब्लॉक के शीर्ष 3 मार्गदर्शक' : 'Top 3 Block Trailblazers'}
                </h3>
                <span className="text-[11px] font-semibold text-slate-500">
                  {lang === 'hi' ? 'साप्ताहिक गति' : 'Live Standings'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3 items-end pt-2">
                {/* #2 Left */}
                <PodiumCard entry={podiumSecond} rank={2} lang={lang} />
                {/* #1 Center Elevated Gold */}
                <PodiumCard entry={podiumFirst} rank={1} lang={lang} />
                {/* #3 Right */}
                <PodiumCard entry={podiumThird} rank={3} lang={lang} />
              </div>
            </div>
          )}

          {/* Live Firebase Cloud Sync Bar */}
          <div className="rounded-xl border border-[#B6D4D6] bg-[#EEF6F6] px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Cloud className="w-4 h-4 text-[#0D5C63] shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#0D5C63] truncate">
                  {cloudUser
                    ? lang === 'hi'
                      ? `Firebase लाइव जुड़ा है (${cloudUser.email})`
                      : `Firebase live sync active (${cloudUser.email})`
                    : lang === 'hi'
                    ? 'अपना स्कोर Firebase पर सुरक्षित व लाइव जोड़ें'
                    : 'Connect Firebase to save XP & join live leaderboard'}
                </p>
              </div>
            </div>

            {cloudUser ? (
              <button
                type="button"
                onClick={onRefreshCloudLeaderboard}
                className="min-h-[36px] px-3 py-1 rounded-lg bg-white border border-[#0D5C63]/30 text-xs font-bold text-[#0D5C63] flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${cloudSyncing ? 'animate-spin' : ''}`} />
                <span>{lang === 'hi' ? 'रिफ्रेश' : 'Refresh'}</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={connectingFirebase}
                onClick={() => void handleConnectFirebase()}
                className="min-h-[36px] px-3 py-1 rounded-lg bg-[#0D5C63] hover:bg-[#09474D] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>
                  {connectingFirebase
                    ? lang === 'hi'
                      ? 'जुड़ रहा है...'
                      : 'Connecting...'
                    : lang === 'hi'
                    ? 'Firebase से जुड़ें'
                    : 'Connect Firebase'}
                </span>
              </button>
            )}
          </div>

          {/* Remaining Standings (#4+ plus always show current user if #1-3) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                {lang === 'hi' ? 'अन्य सक्रिय साथी शिक्षक' : 'Block Teacher Standings'}
              </h3>
              <span className="text-[11px] text-slate-500 tabular-nums">
                {combinedLeaderboard.length} {lang === 'hi' ? 'शिक्षक' : 'teachers'}
              </span>
            </div>

            {(remainingRankings.length > 0 ? remainingRankings : combinedLeaderboard).map((entry) => {
              const isCheered = cheeredLeaderIds.includes(entry.id);
              return (
                <div
                  key={entry.id}
                  className={`rounded-xl border p-3 flex items-center justify-between gap-2.5 ${
                    entry.isCurrentUser
                      ? 'border-2 border-[#0D5C63] bg-[#EEF6F6]'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-7 h-7 rounded-lg text-xs font-extrabold flex items-center justify-center shrink-0 tabular-nums ${
                        entry.isCurrentUser
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
                      className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                    />

                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {entry.teacherName[lang]}{' '}
                        {entry.isCurrentUser ? (lang === 'hi' ? '(आप)' : '(You)') : ''}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {entry.schoolAndBlock[lang]} · {entry.weeksCompleted}{' '}
                        {lang === 'hi' ? 'सप्ताह' : 'wks'} · 🔥{entry.streakDays}d
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-extrabold text-[#0D5C63] tabular-nums">
                      {entry.xp} XP
                    </span>

                    {!entry.isCurrentUser && (
                      <button
                        type="button"
                        onClick={() =>
                          setCheeredLeaderIds((prev) =>
                            prev.includes(entry.id)
                              ? prev.filter((x) => x !== entry.id)
                              : [...prev, entry.id]
                          )
                        }
                        aria-label={lang === 'hi' ? 'सराहें' : 'Cheer'}
                        className={`min-h-[36px] px-2.5 rounded-lg border text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                          isCheered
                            ? 'border-amber-300 bg-amber-50 text-[#B45309]'
                            : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isCheered ? 'fill-current' : ''}`} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Expand-Collapsible Motivation Poll */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <button
              type="button"
              onClick={() => setShowPoll((v) => !v)}
              aria-expanded={showPoll}
              className="w-full px-4 py-3 flex items-center justify-between gap-2 text-left hover:bg-slate-50 cursor-pointer"
            >
              <span className="text-xs font-bold text-slate-800">
                {lang === 'hi'
                  ? 'क्या यह सम्मान सूची आपको प्रेरित करती है? (राय दें)'
                  : 'Does this block leaderboard motivate you? (Quick feedback)'}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-slate-500 transition-transform ${
                  showPoll ? 'rotate-180' : ''
                }`}
              />
            </button>

            {showPoll && (
              <div className="px-4 pb-4 pt-1 flex flex-wrap gap-2 border-t border-slate-100">
                {[
                  { id: 'yes' as const, hi: 'हाँ, बहुत', en: 'Yes, a lot' },
                  { id: 'somewhat' as const, hi: 'थोड़ा', en: 'Somewhat' },
                  { id: 'no' as const, hi: 'ज़रूरी नहीं', en: 'Not needed' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setBadgeSentiment(opt.id);
                      onSubmitFeedbackSentiment(opt.id);
                    }}
                    className={`min-h-[38px] px-3.5 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer ${
                      badgeSentiment === opt.id
                        ? 'border-[#0D5C63] bg-[#0D5C63] text-white'
                        : 'border-slate-300 text-slate-700'
                    }`}
                  >
                    {opt[lang]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Peer Voice Stories Feed */
        <div className="space-y-3">
          {stories.map((story) => {
            const isApplauded = applaudedIds.includes(story.id);
            const isLoadingVoice = loadingAudioId === `story-${story.id}`;
            const isPlaying = speakingId === `story-${story.id}`;

            return (
              <article
                key={story.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={story.avatarUrl}
                      alt={story.teacherName[lang]}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {story.teacherName[lang]}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {story.blockDistrict[lang]} · {story.timeAgo[lang]}
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
                    className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 ${
                      isPlaying ? 'bg-[#0D5C63] text-white' : 'bg-[#EEF6F6] text-[#0D5C63]'
                    }`}
                  >
                    {isLoadingVoice ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : isPlaying ? (
                      <Pause className="w-3.5 h-3.5" />
                    ) : (
                      <Play className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {isPlaying
                        ? lang === 'hi'
                          ? 'रोकें'
                          : 'Stop'
                        : `${lang === 'hi' ? 'सुनें' : 'Listen'} (${story.audioDurationSec ?? 30}s)`}
                    </span>
                  </button>
                </div>

                <h2 className="text-sm @xl:text-base font-bold text-slate-900">
                  {story.headline[lang]}
                </h2>
                <p className="text-xs @xl:text-sm text-slate-600 leading-relaxed">{story.body[lang]}</p>

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => onToggleApplause(story.id)}
                    className={`min-h-[38px] px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer tabular-nums ${
                      isApplauded
                        ? 'border-amber-300 bg-amber-50 text-[#92400E]'
                        : 'border-slate-200 text-slate-700'
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
      )}
    </section>
  );
}

interface PodiumCardProps {
  entry: {
    id: string;
    isCurrentUser: boolean;
    teacherName: { hi: string; en: string };
    avatarUrl: string;
    xp: number;
    weeksCompleted: number;
    streakDays: number;
  };
  rank: 1 | 2 | 3;
  lang: Language;
}

function PodiumCard({ entry, rank, lang }: PodiumCardProps) {
  const isFirst = rank === 1;
  const ringClass =
    rank === 1
      ? 'border-amber-400 ring-2 ring-amber-200 bg-amber-50/60'
      : rank === 2
      ? 'border-slate-300 bg-slate-50/70'
      : 'border-orange-200 bg-orange-50/40';

  return (
    <div
      className={`rounded-xl border p-2.5 sm:p-3 text-center flex flex-col items-center gap-1.5 ${ringClass} ${
        isFirst ? 'pb-4 pt-3 shadow-sm' : ''
      } ${entry.isCurrentUser ? 'ring-2 ring-[#0D5C63]' : ''}`}
    >
      <div className="flex items-center justify-center gap-1 text-xs font-extrabold">
        {isFirst ? (
          <Crown className="w-4 h-4 text-[#D97706]" />
        ) : (
          <Medal className={`w-4 h-4 ${rank === 2 ? 'text-slate-500' : 'text-[#B45309]'}`} />
        )}
        <span className="tabular-nums text-slate-800">#{rank}</span>
      </div>

      <img
        src={entry.avatarUrl}
        alt={entry.teacherName[lang]}
        referrerPolicy="no-referrer"
        className={`rounded-full object-cover border-2 ${
          isFirst
            ? 'w-12 h-12 sm:w-14 sm:h-14 border-amber-400'
            : 'w-10 h-10 sm:w-11 sm:h-11 border-white shadow-xs'
        }`}
      />

      <div className="w-full min-w-0">
        <p className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
          {entry.teacherName[lang].split(' ')[0]}
          {entry.isCurrentUser ? (lang === 'hi' ? ' (आप)' : ' (You)') : ''}
        </p>
        <p className="text-[11px] font-extrabold text-[#0D5C63] tabular-nums">{entry.xp} XP</p>
        <p className="text-[10px] text-slate-500 tabular-nums">
          ✓ {entry.weeksCompleted} {lang === 'hi' ? 'सप्ताह' : 'wks'} · 🔥{entry.streakDays}d
        </p>
      </div>
    </div>
  );
}
