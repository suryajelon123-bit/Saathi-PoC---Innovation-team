import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Flame,
  Loader2,
  Mic,
  Pause,
  Play,
  Search,
  X,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { PROBLEM_THEMES } from '../../data/saathiContent';
import { Language, PeerSolution, ProblemTheme } from '../../types';
import { AudioListenButton } from '../AudioListenButton';

interface ProblemMapScreenProps {
  lang: Language;
  peerSolutions: PeerSolution[];
  xp: number;
  streakDays: number;
  solvedThemeIds: string[];
  completedWeeksByTheme?: Record<string, number[]>;
  speakingId: string | null;
  loadingAudioId?: string | null;
  onSpeak: (id: string, text: string, gender?: 'female' | 'male') => void;
  onSelectTheme: (theme: ProblemTheme) => void;
  onGoToShare: () => void;
  onOpenAssistant?: (initialPrompt?: string) => void;
}

function getTreemapTileClasses(theme: ProblemTheme, userSolved: boolean): {
  spanClass: string;
  bgClass: string;
  heatLabel: { hi: string; en: string };
} {
  let spanClass = 'col-span-2 row-span-1 @3xl:col-span-2 @3xl:row-span-1';

  if (theme.commonalityRank <= 2) {
    spanClass = 'col-span-2 row-span-2 @3xl:col-span-4 @3xl:row-span-2';
  } else if (theme.size === 'large') {
    spanClass = 'col-span-2 row-span-2 @3xl:col-span-2 @3xl:row-span-2';
  } else if (theme.size === 'medium') {
    spanClass = 'col-span-4 row-span-1 @3xl:col-span-4 @3xl:row-span-1';
  }

  if (userSolved) {
    return {
      spanClass,
      bgClass: 'bg-[#15803D] hover:bg-[#166534]',
      heatLabel: { hi: 'हल किया', en: 'Solved' },
    };
  }

  if (theme.commonalityRank <= 3) {
    return {
      spanClass,
      bgClass: 'bg-[#B8332A] hover:bg-[#9E2A22]',
      heatLabel: { hi: 'अति आवश्यक', en: 'Top Heat' },
    };
  }

  if (theme.commonalityRank <= 7) {
    return {
      spanClass,
      bgClass: 'bg-[#9A3412] hover:bg-[#7C2D12]',
      heatLabel: { hi: 'उच्च', en: 'High' },
    };
  }

  if (theme.commonalityRank <= 12) {
    return {
      spanClass,
      bgClass: 'bg-[#0D5C63] hover:bg-[#09474D]',
      heatLabel: { hi: 'प्रमुख', en: 'Active' },
    };
  }

  return {
    spanClass,
    bgClass: 'bg-[#2C4A52] hover:bg-[#223A41]',
    heatLabel: { hi: 'सामान्य', en: 'Steady' },
  };
}

export function ProblemMapScreen({
  lang,
  peerSolutions,
  xp,
  streakDays,
  solvedThemeIds,
  completedWeeksByTheme = {},
  speakingId,
  loadingAudioId = null,
  onSpeak,
  onSelectTheme,
  onGoToShare,
  onOpenAssistant,
}: ProblemMapScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredThemes = PROBLEM_THEMES.filter((t) => {
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

  const overviewAudio =
    lang === 'hi'
      ? `यहाँ सरकारी स्कूलों की ${PROBLEM_THEMES.length} असली समस्याएँ हैं, जिनमें निजी स्कूल पलायन और DBT योजना भी शामिल हैं। किसी भी बॉक्स को खोलकर हल देखें या सुनें।`
      : `Here are ${PROBLEM_THEMES.length} real school issues, including students shifting to private schools and DBT scheme delays. Tap any tile to open simple steps or listen.`;

  return (
    <section className="max-w-6xl mx-auto px-3 @xl:px-6 pt-2.5 pb-8 space-y-2.5">
      {/* Ultra-Minimal Header Row (Direct to Themes, zero login friction) */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-base @xl:text-xl font-extrabold text-slate-900 tracking-tight text-balance">
              {lang === 'hi' ? 'समस्या हीटमैप' : 'Problem Heatmap'}
            </h1>
            <span className="text-[11px] font-bold text-[#B45309] inline-flex items-center gap-0.5 tabular-nums">
              <Flame className="w-3.5 h-3.5 fill-[#F59E0B] text-[#B45309]" />
              {streakDays}d
            </span>
            <span className="text-[11px] font-bold text-[#0D5C63] inline-flex items-center gap-0.5 tabular-nums">
              <Zap className="w-3 h-3 fill-[#0D5C63]" />
              {xp}
            </span>
          </div>
          <p className="text-[11px] @xl:text-xs text-slate-600 truncate">
            {lang === 'hi'
              ? 'बड़ा व गहरा रंग = अधिक ज़रूरी · सुनें या टैप करें'
              : 'Larger & warmer tile = higher urgency · Tap or listen'}
          </p>
        </div>

        <AudioListenButton
          id="problems-overview"
          lang={lang}
          speakingId={speakingId}
          loadingAudioId={loadingAudioId}
          onClick={() => onSpeak('problems-overview', overviewAudio)}
          className="shrink-0"
        />
      </div>

      {/* Compact Search Row */}
      <div className="flex items-center">
        <div className="relative w-full @3xl:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'hi' ? 'खोजें (DBT, निजी स्कूल, पढ़ाई)...' : 'Search (DBT, private school)...'}
            aria-label={lang === 'hi' ? 'समस्या खोजें' : 'Search problems'}
            className="w-full min-h-[38px] pl-8 pr-8 rounded-lg border border-slate-300 bg-white text-xs @xl:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D5C63]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label={lang === 'hi' ? 'साफ़ करें' : 'Clear'}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-md text-slate-500 flex items-center justify-center cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Shikshagraha Thermal Legend (unboxed inline swatches, zero pills) */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-slate-600 px-0.5">
        <span className="inline-flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-xs bg-[#B8332A] inline-block" />
          {lang === 'hi' ? 'अति आवश्यक' : 'Top Heat'}
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-xs bg-[#9A3412] inline-block" />
          {lang === 'hi' ? 'उच्च' : 'High'}
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-xs bg-[#0D5C63] inline-block" />
          {lang === 'hi' ? 'प्रमुख' : 'Active'}
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-xs bg-[#2C4A52] inline-block" />
          {lang === 'hi' ? 'सामान्य' : 'Steady'}
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-xs bg-[#15803D] inline-block" />
          {lang === 'hi' ? 'हल किया' : 'Solved'}
        </span>
      </div>

      {/* Nokia Lumia Live-Tile + Shikshagraha Proportional Treemap Grid */}
      {filteredThemes.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center space-y-3">
          <p className="text-sm font-semibold text-slate-800">
            {lang === 'hi' ? `"${searchQuery}" नहीं मिला।` : `No match for "${searchQuery}".`}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {onOpenAssistant && (
              <button
                type="button"
                onClick={() => onOpenAssistant(searchQuery)}
                className="min-h-[42px] px-4 py-2 rounded-lg bg-[#0D5C63] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Bot className="w-4 h-4" />
                <span>{lang === 'hi' ? 'साथी AI से पूछें' : 'Ask Saathi AI'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="min-h-[42px] px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 cursor-pointer"
            >
              {lang === 'hi' ? 'सभी दिखाएं' : 'Show All'}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-4 @3xl:grid-cols-8 auto-rows-[minmax(102px,auto)] sm:auto-rows-[minmax(112px,auto)] grid-flow-dense gap-1.5 sm:gap-2">
          {filteredThemes.map((theme) => {
            const themeAudioId = `problem-card-${theme.id}`;
            const isPlaying = speakingId === themeAudioId;
            const isLoading = loadingAudioId === themeAudioId;
            const solvedCount = peerSolutions.filter((s) => s.themeId === theme.id).length;
            const userSolvedThis = solvedThemeIds.includes(theme.id);
            const weeksDone = (completedWeeksByTheme[theme.id] ?? []).length;
            const firstStep = theme.planSteps[0];
            const cardSpeech = `${theme.title[lang]}. ${
              firstStep ? `${firstStep.title[lang]}. ${firstStep.detail[lang]}` : theme.planIntro[lang]
            }`;
            const { spanClass, bgClass } = getTreemapTileClasses(theme, userSolvedThis);
            const isLargeTile = theme.size === 'large' || theme.commonalityRank <= 2;

            return (
              <div
                key={theme.id}
                className={`relative rounded-md overflow-hidden transition-transform active:scale-[0.985] ${spanClass} ${bgClass}`}
              >
                {/* Full-Tile Primary Tap Surface */}
                <button
                  type="button"
                  onClick={() => onSelectTheme(theme)}
                  className="w-full h-full p-2.5 sm:p-3.5 text-left flex flex-col justify-between gap-2 text-white cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/90"
                >
                  {/* Top metadata line — leaves right space for 44px audio trigger */}
                  <div className="pr-10 flex items-center flex-wrap gap-x-1.5 gap-y-0.5 text-[10px] sm:text-[11px] font-bold text-white/85 tracking-wide">
                    <span>
                      {theme.sourceType === 'mitra_school'
                        ? lang === 'hi'
                          ? 'संस्कृति'
                          : 'Sanskriti'
                        : lang === 'hi'
                        ? 'कक्षा'
                        : 'Class'}
                    </span>
                    {userSolvedThis ? (
                      <span className="inline-flex items-center gap-0.5 text-white">
                        · <CheckCircle2 className="w-3 h-3" /> {lang === 'hi' ? 'हल किया' : 'Done'}
                      </span>
                    ) : weeksDone > 0 ? (
                      <span className="tabular-nums text-amber-200">
                        · {lang === 'hi' ? `L${weeksDone}/4 पूर्ण` : `L${weeksDone}/4`}
                      </span>
                    ) : solvedCount > 0 ? (
                      <span className="tabular-nums text-white/95">
                        · {lang === 'hi' ? `${solvedCount} हल` : `${solvedCount} wins`}
                      </span>
                    ) : null}
                  </div>

                  {/* Bottom Title + Optional Large-Tile Prompt */}
                  <div className="space-y-1">
                    <h2
                      className={`font-extrabold text-white text-balance leading-snug ${
                        isLargeTile
                          ? 'text-[15px] sm:text-lg @3xl:text-xl'
                          : 'text-[13px] sm:text-sm'
                      }`}
                    >
                      {theme.title[lang]}
                    </h2>

                    {isLargeTile && (
                      <p className="text-[11px] sm:text-xs text-white/85 line-clamp-2 leading-snug">
                        {theme.shortPrompt[lang]}
                      </p>
                    )}

                    {isLargeTile && (
                      <div className="pt-0.5 flex items-center gap-1 text-[11px] font-bold text-white/95">
                        <span>{lang === 'hi' ? 'एक्शन प्लान (L1–L4)' : 'Action Plan (L1–L4)'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </button>

                {/* Independent 44x44px Voice Trigger in Top-Right Corner */}
                <button
                  type="button"
                  onClick={() => onSpeak(themeAudioId, cardSpeech)}
                  aria-label={
                    isPlaying
                      ? lang === 'hi'
                        ? `${theme.title.hi} रोकें`
                        : `Stop ${theme.title.en}`
                      : lang === 'hi'
                      ? `${theme.title.hi} सुनें`
                      : `Listen to ${theme.title.en}`
                  }
                  className={`absolute top-1.5 right-1.5 min-w-[40px] min-h-[40px] rounded-md flex items-center justify-center transition-colors cursor-pointer ${
                    isPlaying
                      ? 'bg-white text-[#0D5C63] shadow-sm'
                      : 'bg-black/25 hover:bg-black/40 text-white'
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4 ml-0.5" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Slim Lumia-Style Bottom Voice Hub Strip */}
      <button
        type="button"
        onClick={onGoToShare}
        className="w-full min-h-[48px] rounded-md bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2.5 flex items-center justify-between gap-3 cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Mic className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold truncate">
            {lang === 'hi'
              ? 'अपनी आवाज़ में नया हल या समस्या बताएं'
              : 'Record a solution or question by voice'}
          </span>
        </div>
        <span className="text-xs font-bold text-emerald-300 shrink-0 flex items-center gap-1">
          {lang === 'hi' ? 'बोलें' : 'Speak'}
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </button>
    </section>
  );
}
