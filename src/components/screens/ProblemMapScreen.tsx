import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  Compass,
  Flame,
  Heart,
  Loader2,
  Mic,
  Pause,
  Play,
  Radio,
  Search,
  Trophy,
  X,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { PROBLEM_THEMES } from '../../data/saathiContent';
import { CommunityStory, Language, ProblemTheme } from '../../types';
import { AudioListenButton } from '../AudioListenButton';

interface ProblemMapScreenProps {
  lang: Language;
  stories: CommunityStory[];
  applaudedIds: string[];
  xp: number;
  streakDays: number;
  completedWeeksByTheme: Record<string, number[]>;
  speakingId: string | null;
  loadingAudioId?: string | null;
  onSpeak: (id: string, text: string, gender?: 'female' | 'male') => void;
  onSelectTheme: (theme: ProblemTheme) => void;
  onToggleApplause: (storyId: string) => void;
  onGoToShareChallenge: () => void;
  onGoToBadges: () => void;
  onOpenAssistant?: (initialPrompt?: string) => void;
}

type ThemeFilter = 'all' | 'classroom_hypothesis' | 'mitra_school';
type ExploreMode = 'map' | 'voices';

export function ProblemMapScreen({
  lang,
  stories,
  applaudedIds,
  xp,
  streakDays,
  completedWeeksByTheme,
  speakingId,
  loadingAudioId = null,
  onSpeak,
  onSelectTheme,
  onToggleApplause,
  onGoToShareChallenge,
  onGoToBadges,
  onOpenAssistant,
}: ProblemMapScreenProps) {
  const [exploreMode, setExploreMode] = useState<ExploreMode>('map');
  const [filter, setFilter] = useState<ThemeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredThemes = PROBLEM_THEMES.filter((t) => {
    const matchesFilter = filter === 'all' ? true : t.sourceType === filter;
    if (!matchesFilter) return false;
    if (!normalizedQuery) return true;
    return (
      t.title.hi.toLowerCase().includes(normalizedQuery) ||
      t.title.en.toLowerCase().includes(normalizedQuery) ||
      t.shortPrompt.hi.toLowerCase().includes(normalizedQuery) ||
      t.shortPrompt.en.toLowerCase().includes(normalizedQuery) ||
      t.contextNote.hi.toLowerCase().includes(normalizedQuery) ||
      t.contextNote.en.toLowerCase().includes(normalizedQuery)
    );
  });

  const filteredStories = stories.filter((s) => {
    const theme = PROBLEM_THEMES.find((t) => t.id === s.themeId);
    const matchesFilter = filter === 'all' ? true : theme?.sourceType === filter;
    if (!matchesFilter) return false;
    if (!normalizedQuery) return true;
    return (
      s.headline.hi.toLowerCase().includes(normalizedQuery) ||
      s.headline.en.toLowerCase().includes(normalizedQuery) ||
      s.body.hi.toLowerCase().includes(normalizedQuery) ||
      s.body.en.toLowerCase().includes(normalizedQuery) ||
      s.teacherName.hi.toLowerCase().includes(normalizedQuery) ||
      s.teacherName.en.toLowerCase().includes(normalizedQuery)
    );
  });

  const featuredStory = stories[0];
  const featuredMatchingTheme =
    PROBLEM_THEMES.find((t) => t.id === featuredStory?.themeId) ?? PROBLEM_THEMES[0];
  const isPlayingFeatured = speakingId === 'map-featured-voice';
  const isLoadingFeatured = loadingAudioId === 'map-featured-voice';

  const completedThemesCount = PROBLEM_THEMES.filter(
    (t) => (completedWeeksByTheme[t.id]?.length ?? 0) >= 4
  ).length;
  const totalWeeksDone = Object.values(completedWeeksByTheme).reduce(
    (sum, weeks) => sum + weeks.length,
    0
  );

  const mapReadAloudText =
    lang === 'hi'
      ? 'यहाँ से अपनी कक्षा या स्कूल का कोई भी विषय चुनें। हर विषय पर क्लिक करने पर आपको चार सप्ताह की आसान चरणबद्ध योजना मिलेगी — पहला, दूसरा, तीसरा और चौथा सप्ताह। आप चाहें तो साथियों की आवाज़ें भी सुन सकते हैं।'
      : 'Pick any topic from this list to open its 4-week step-by-step plan—Week 1, Week 2, Week 3, and Week 4. You can also listen to 30-second voice notes from fellow teachers.';

  const getTileSpanClass = (size: ProblemTheme['size']) => {
    switch (size) {
      case 'large':
        return 'col-span-2 @3xl:col-span-6 @5xl:col-span-6 min-h-[148px] @xl:min-h-[172px]';
      case 'medium':
        return 'col-span-1 @3xl:col-span-6 @5xl:col-span-4 min-h-[144px] @xl:min-h-[158px]';
      case 'compact':
      default:
        return 'col-span-1 @3xl:col-span-4 @5xl:col-span-4 min-h-[132px] @xl:min-h-[142px]';
    }
  };

  const getTileSurfaceClass = (theme: ProblemTheme, isComplete: boolean) => {
    if (isComplete) {
      return 'bg-emerald-50/70 border-emerald-300 hover:border-[#16A34A]';
    }
    if (theme.size === 'large') {
      return theme.sourceType === 'mitra_school'
        ? 'bg-[#EEF6F6] border-[#B6D4D6] hover:border-[#0D5C63]'
        : 'bg-[#FFFFFF] border-slate-300 hover:border-[#0D5C63]';
    }
    if (theme.size === 'medium') {
      return theme.sourceType === 'mitra_school'
        ? 'bg-[#F3F8F8] border-slate-200 hover:border-[#0D5C63]'
        : 'bg-white border-slate-200 hover:border-[#0D5C63]';
    }
    return 'bg-slate-50 border-slate-200 hover:border-[#0D5C63]';
  };

  const classroomCount = PROBLEM_THEMES.filter((t) => t.sourceType === 'classroom_hypothesis').length;
  const mitraCount = PROBLEM_THEMES.filter((t) => t.sourceType === 'mitra_school').length;

  return (
    <div className="space-y-0">
      {/* Gamified Duolingo HUD Strip */}
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
              <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
              <span>
                {lang === 'hi'
                  ? `${totalWeeksDone} सप्ताह पूरे · ${completedThemesCount} विषय पूर्ण`
                  : `${totalWeeksDone} weeks done · ${completedThemesCount} themes completed`}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onGoToBadges}
            className="text-xs font-bold text-[#B45309] hover:underline flex items-center gap-1.5 cursor-pointer"
          >
            <Trophy className="w-4 h-4" />
            <span>{lang === 'hi' ? 'मेरे बैज व सम्मान' : 'Badges & Honors'}</span>
          </button>
        </div>
      </div>

      <section className="max-w-6xl mx-auto px-3.5 @xl:px-6 py-4 @3xl:py-8 space-y-4 @xl:space-y-5">
        {/* Header + Read Aloud */}
        <div className="flex flex-col @3xl:flex-row @3xl:items-end justify-between gap-3 @xl:gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <p className="text-xs font-semibold text-[#0D5C63]">
              {lang === 'hi'
                ? 'चरण 1: विषय चुनें → चरण 2: सप्ताह 1 · 2 · 3 · 4 पथ पूरा करें'
                : 'Step 1: Pick a theme → Step 2: Follow Weeks 1 · 2 · 3 · 4'}
            </p>
            <h1 className="text-xl @xl:text-3xl font-bold text-slate-900 text-balance">
              {lang === 'hi'
                ? 'आज आप किस विषय की 4-सप्ताह योजना शुरू करेंगे?'
                : 'Which 4-week theme plan would you like to open today?'}
            </h1>
            <p className="text-xs @xl:text-sm text-slate-600">
              {lang === 'hi'
                ? 'किसी भी विषय पर टैप करें और सप्ताह 1 से 4 तक आसान कदमों में काम पूरा करें।'
                : 'Tap any theme card to open its Duolingo-style Week 1–4 path, earn +25 XP per week, and hear fellow teachers.'}
            </p>
          </div>

          <AudioListenButton
            id="map-overview"
            lang={lang}
            speakingId={speakingId}
            loadingAudioId={loadingAudioId}
            onClick={() => onSpeak('map-overview', mapReadAloudText)}
            className="self-start @3xl:self-auto"
          />
        </div>

        {/* Switch: Theme List <-> Teacher Voices */}
        <div
          role="tablist"
          aria-label={lang === 'hi' ? 'खोजने का तरीका' : 'Explore mode'}
          className="grid grid-cols-2 p-1 rounded-xl bg-slate-200/80 max-w-md"
        >
          <button
            type="button"
            role="tab"
            aria-selected={exploreMode === 'map'}
            onClick={() => setExploreMode('map')}
            className={`min-h-[42px] px-3 py-2 rounded-lg text-xs @xl:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              exploreMode === 'map'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-4 h-4 text-[#0D5C63]" />
            <span>{lang === 'hi' ? `विषय सूची (${PROBLEM_THEMES.length})` : `Themes (${PROBLEM_THEMES.length})`}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={exploreMode === 'voices'}
            onClick={() => setExploreMode('voices')}
            className={`min-h-[42px] px-3 py-2 rounded-lg text-xs @xl:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              exploreMode === 'voices'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Radio className="w-4 h-4 text-[#0D5C63]" />
            <span>
              {lang === 'hi'
                ? `साथियों की आवाज़ें (${stories.length})`
                : `Teacher Voices (${stories.length})`}
            </span>
          </button>
        </div>

        {/* Featured Peer Voice Strip */}
        {exploreMode === 'map' && featuredStory && !normalizedQuery && (
          <div className="rounded-2xl border border-[#B6D4D6] bg-[#EEF6F6] p-3.5 @xl:p-4 flex flex-col @3xl:flex-row @3xl:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={featuredStory.avatarUrl}
                alt={featuredStory.teacherName[lang]}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover border border-white shrink-0"
              />
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-[#0D5C63]">
                  {lang === 'hi'
                    ? `साथी आवाज़ · ${featuredStory.teacherName.hi} (${featuredStory.blockDistrict.hi})`
                    : `Peer Voice · ${featuredStory.teacherName.en} (${featuredStory.blockDistrict.en})`}
                </p>
                <p className="text-xs @xl:text-sm font-bold text-slate-900 truncate">
                  {featuredStory.headline[lang]}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() =>
                  onSpeak(
                    'map-featured-voice',
                    `${featuredStory.headline[lang]}. ${featuredStory.body[lang]}`,
                    featuredStory.avatarUrl.includes('rajesh') ? 'male' : 'female'
                  )
                }
                className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-[#0D5C63] hover:bg-[#09474D] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                {isLoadingFeatured ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : isPlayingFeatured ? (
                  <Pause className="w-3.5 h-3.5" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
                <span>
                  {isLoadingFeatured
                    ? lang === 'hi'
                      ? 'तैयार...'
                      : 'Loading...'
                    : isPlayingFeatured
                    ? lang === 'hi'
                      ? 'रोकें'
                      : 'Stop'
                    : `${lang === 'hi' ? 'सुनें' : 'Play'} (${featuredStory.audioDurationSec ?? 32}s)`}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTheme(featuredMatchingTheme)}
                className="min-h-[40px] px-3.5 py-1.5 rounded-xl border border-[#0D5C63]/30 bg-white hover:bg-slate-50 text-[#0D5C63] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <span>
                  {lang === 'hi' ? '4-सप्ताह पथ खोलें' : 'Open 4-Week Path'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Filter Tabs + Quick Search */}
        <div className="flex flex-col @3xl:flex-row @3xl:items-center justify-between gap-2.5">
          <div
            role="tablist"
            aria-label={lang === 'hi' ? 'विषय श्रेणी' : 'Topic category'}
            className="inline-flex items-center gap-1 p-1 bg-slate-200/75 rounded-xl overflow-x-auto max-w-full"
          >
            {[
              {
                id: 'all' as const,
                hi: `सभी (${PROBLEM_THEMES.length})`,
                en: `All (${PROBLEM_THEMES.length})`,
              },
              {
                id: 'classroom_hypothesis' as const,
                hi: `कक्षा शिक्षण (${classroomCount})`,
                en: `Classroom (${classroomCount})`,
              },
              {
                id: 'mitra_school' as const,
                hi: `स्कूल व परिवार (${mitraCount})`,
                en: `School & Family (${mitraCount})`,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={filter === tab.id}
                onClick={() => setFilter(tab.id)}
                className={`min-h-[38px] px-3 py-1.5 text-xs @xl:text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  filter === tab.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab[lang]}
              </button>
            ))}
          </div>

          <div className="relative w-full @3xl:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                lang === 'hi' ? 'खोजें (पढ़ाई, गिनती, आधार)...' : 'Search (reading, math, Aadhaar)...'
              }
              aria-label={lang === 'hi' ? 'विषय खोजें' : 'Search topics'}
              className="w-full min-h-[42px] pl-9 pr-9 rounded-xl border border-slate-300 bg-white text-xs @xl:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D5C63]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label={lang === 'hi' ? 'खोज साफ़ करें' : 'Clear search'}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-md hover:bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* MODE 1: Theme List with 4-Week Duolingo Progress */}
        {exploreMode === 'map' && (
          <>
            {filteredThemes.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center space-y-3">
                <p className="text-sm font-semibold text-slate-800">
                  {lang === 'hi'
                    ? `"${searchQuery}" से जुड़ा कोई विषय नहीं मिला।`
                    : `No topic found for "${searchQuery}".`}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2.5">
                  {onOpenAssistant && (
                    <button
                      type="button"
                      onClick={() => onOpenAssistant(searchQuery)}
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-[#0D5C63] hover:bg-[#09474D] text-white text-xs @xl:text-sm font-semibold flex items-center gap-2 cursor-pointer"
                    >
                      <Bot className="w-4 h-4" />
                      <span>{lang === 'hi' ? 'साथी AI से पूछें' : 'Ask Saathi AI'}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setFilter('all');
                    }}
                    className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs @xl:text-sm font-semibold cursor-pointer"
                  >
                    {lang === 'hi' ? 'सभी विषय दिखाएं' : 'Show all topics'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 @3xl:grid-cols-12 gap-2.5 @xl:gap-4">
                {filteredThemes.map((theme) => {
                  const isLarge = theme.size === 'large';
                  const doneWeeks = completedWeeksByTheme[theme.id] ?? [];
                  const doneCount = doneWeeks.length;
                  const isComplete = doneCount >= 4;
                  const nextWeek = [1, 2, 3, 4].find((w) => !doneWeeks.includes(w)) ?? 4;

                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => onSelectTheme(theme)}
                      className={`group text-left rounded-2xl border border-b-4 p-3.5 sm:p-5 transition-all duration-150 flex flex-col justify-between cursor-pointer active:translate-y-[2px] active:border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C63] ${getTileSpanClass(
                        theme.size
                      )} ${getTileSurfaceClass(theme, isComplete)}`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-1.5">
                          <span className="text-[11px] sm:text-xs font-medium text-slate-500 line-clamp-1">
                            {theme.contextNote[lang]}
                          </span>
                          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#0D5C63] transition-colors shrink-0" />
                        </div>

                        <h2
                          className={`font-bold text-slate-900 group-hover:text-[#0D5C63] transition-colors leading-snug ${
                            isLarge ? 'text-base sm:text-xl' : 'text-sm sm:text-lg'
                          }`}
                        >
                          {theme.title[lang]}
                        </h2>

                        <p className="text-[11px] sm:text-sm text-slate-600 leading-snug line-clamp-2">
                          {theme.shortPrompt[lang]}
                        </p>
                      </div>

                      {/* 4-Week Duolingo Segment Progress */}
                      <div className="pt-3 mt-3 border-t border-slate-200/80 space-y-2 w-full">
                        <div className="grid grid-cols-4 gap-1" aria-hidden="true">
                          {[1, 2, 3, 4].map((wk) => {
                            const wkDone = doneWeeks.includes(wk);
                            return (
                              <div
                                key={wk}
                                className={`h-1.5 rounded-full transition-colors ${
                                  wkDone ? 'bg-[#16A34A]' : 'bg-slate-200'
                                }`}
                              />
                            );
                          })}
                        </div>
                        <div className="flex items-center justify-between gap-2 text-[11px] sm:text-xs font-semibold">
                          <span className={isComplete ? 'text-[#15803D]' : 'text-slate-600 tabular-nums'}>
                            {lang === 'hi'
                              ? `${doneCount}/4 सप्ताह`
                              : `${doneCount}/4 weeks`}
                          </span>
                          <span className="text-[#0D5C63] whitespace-nowrap">
                            {isComplete
                              ? lang === 'hi'
                                ? 'पूर्ण ✓'
                                : 'Done ✓'
                              : doneCount > 0
                              ? lang === 'hi'
                                ? `सप्ताह ${nextWeek} →`
                                : `Week ${nextWeek} →`
                              : lang === 'hi'
                              ? '1·2·3·4 पथ →'
                              : 'Weeks 1–4 →'}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* MODE 2: Peer Voices Chaupal */}
        {exploreMode === 'voices' && (
          <div className="space-y-4">
            {filteredStories.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center space-y-3">
                <p className="text-sm font-semibold text-slate-800">
                  {lang === 'hi'
                    ? 'इस खोज के लिए अभी कोई आवाज़ नहीं मिली।'
                    : 'No voice notes match this filter yet.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setFilter('all');
                  }}
                  className="min-h-[42px] px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  {lang === 'hi' ? 'सभी आवाज़ें दिखाएं' : 'Show all voices'}
                </button>
              </div>
            ) : (
              filteredStories.map((story) => {
                const isPlaying = speakingId === `chaupal-story-${story.id}`;
                const isLoading = loadingAudioId === `chaupal-story-${story.id}`;
                const matchingTheme =
                  PROBLEM_THEMES.find((t) => t.id === story.themeId) ?? PROBLEM_THEMES[0];

                return (
                  <article
                    key={story.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 @xl:p-6 space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
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
                            `chaupal-story-${story.id}`,
                            `${story.headline[lang]}. ${story.body[lang]}`,
                            story.avatarUrl.includes('rajesh') ? 'male' : 'female'
                          )
                        }
                        className={`min-h-[44px] px-4 py-2 rounded-xl text-xs @xl:text-sm font-semibold flex items-center gap-2 cursor-pointer ${
                          isPlaying
                            ? 'bg-[#0D5C63] text-white'
                            : 'bg-[#EEF6F6] hover:bg-[#dceeee] text-[#0D5C63]'
                        }`}
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isPlaying ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                        <span className="tabular-nums">
                          {isLoading
                            ? lang === 'hi'
                              ? 'आवाज़ तैयार...'
                              : 'Loading...'
                            : isPlaying
                            ? lang === 'hi'
                              ? 'रोकें'
                              : 'Stop'
                            : `${lang === 'hi' ? 'सुनें' : 'Listen'} · ${story.audioDurationSec ?? 32}s`}
                        </span>
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <h2 className="text-base @xl:text-lg font-bold text-slate-900">{story.headline[lang]}</h2>
                      <p className="text-sm text-slate-600 leading-relaxed">{story.body[lang]}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => onSelectTheme(matchingTheme)}
                        className="min-h-[42px] px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs @xl:text-sm font-semibold flex items-center gap-2 cursor-pointer"
                      >
                        <span>
                          {lang === 'hi'
                            ? 'मेरे स्कूल में भी यही है → 4-सप्ताह पथ'
                            : 'Same in my school → 4-Week Path'}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onToggleApplause(story.id)}
                        className={`min-h-[40px] px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer tabular-nums ${
                          applaudedIds.includes(story.id)
                            ? 'border-[#B45309] bg-amber-50 text-[#92400E]'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${applaudedIds.includes(story.id) ? 'fill-current' : ''}`} />
                        <span>
                          {lang === 'hi' ? 'धन्यवाद' : 'Thanks'} ·{' '}
                          {story.applauseCount + (applaudedIds.includes(story.id) ? 1 : 0)}
                        </span>
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        )}

        {/* Bottom CTA to Screen 4: Speak Your Own Challenge */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 @xl:p-6 flex flex-col @xl:flex-row @xl:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base @xl:text-lg font-bold text-slate-900">
              {lang === 'hi'
                ? 'आपकी कक्षा की चुनौती यहाँ नहीं दिख रही?'
                : 'Working on something not listed here?'}
            </h3>
            <p className="text-sm text-slate-600">
              {lang === 'hi'
                ? 'अपनी बात बोलकर या लिखकर साझा करें — +30 अंक और साथियों के सुझाव मिलेंगे।'
                : 'Share what you are working on by voice or text for +30 XP and peer ideas.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onGoToShareChallenge}
            className="w-full @xl:w-auto min-h-[48px] px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
          >
            <Mic className="w-4 h-4" />
            <span>{lang === 'hi' ? 'अपनी बात साझा करें (+30 अंक)' : 'Share what you need (+30 XP)'}</span>
          </button>
        </div>
      </section>
    </div>
  );
}
