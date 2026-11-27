import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  Flame,
  Loader2,
  Mic,
  Pause,
  Play,
  ThumbsUp,
  Trophy,
  Zap,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { PROBLEM_THEMES } from '../../data/saathiContent';
import { Language, PeerSolution, ProblemTheme } from '../../types';
import { AudioListenButton } from '../AudioListenButton';
import { VoiceRecorderPanel } from '../VoiceRecorderPanel';

interface PlanScreenProps {
  lang: Language;
  theme: ProblemTheme;
  solutions: PeerSolution[];
  xp: number;
  streakDays: number;
  completedWeeks: number[];
  speakingId: string | null;
  loadingAudioId?: string | null;
  onSpeak: (id: string, text: string, speakerGender?: 'female' | 'male') => void;
  onSelectTheme: (theme: ProblemTheme) => void;
  onToggleWeekDone: (themeId: string, weekNumber: number) => void;
  onBackToMap: () => void;
  onGoToBadges: () => void;
  onScrollDepthReached: (pct: number) => void;
  onVoiceButtonTapped: () => void;
  onVoiceRecordingStarted: () => void;
  onSubmitVoiceSolution: (payload: {
    method: 'voice' | 'text';
    text: string;
    durationSec: number;
    audioUrl?: string;
  }) => void;
  onToggleHelpful: (solutionId: string) => void;
  helpfulIds: string[];
  onOpenAssistant?: () => void;
}

const WEEK_OFFSETS = [
  'translate-x-0',
  '-translate-x-5 @xl:-translate-x-8',
  'translate-x-0',
  'translate-x-5 @xl:translate-x-8',
];

export function PlanScreen({
  lang,
  theme,
  solutions,
  xp,
  streakDays,
  completedWeeks,
  speakingId,
  loadingAudioId = null,
  onSpeak,
  onSelectTheme,
  onToggleWeekDone,
  onBackToMap,
  onGoToBadges,
  onScrollDepthReached,
  onVoiceButtonTapped,
  onVoiceRecordingStarted,
  onSubmitVoiceSolution,
  onToggleHelpful,
  helpfulIds,
  onOpenAssistant,
}: PlanScreenProps) {
  const getInitialActiveWeek = (done: number[]) => {
    const firstPending = [1, 2, 3, 4].find((w) => !done.includes(w));
    return firstPending ?? 1;
  };

  const [selectedWeek, setSelectedWeek] = useState<number>(() =>
    getInitialActiveWeek(completedWeeks)
  );
  const [showRecorder, setShowRecorder] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [playingBlobId, setPlayingBlobId] = useState<string | null>(null);
  const blobAudioRef = useRef<HTMLAudioElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const weekCardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setSelectedWeek(getInitialActiveWeek(completedWeeks));
    setShowRecorder(false);
    setJustSubmitted(false);
  }, [theme.id]);

  const themeSolutions = solutions.filter((s) => s.themeId === theme.id);
  const fallbackSolutions =
    themeSolutions.length > 0 ? themeSolutions : solutions.slice(0, 2);

  // Track scroll depth milestones (25, 50, 75, 100)
  useEffect(() => {
    const checkScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const totalHeight = Math.max(1, el.scrollHeight);
      const viewportBottom = window.innerHeight - rect.top;
      const pct = Math.min(100, Math.max(25, Math.round((viewportBottom / totalHeight) * 100)));
      if (pct >= 95) onScrollDepthReached(100);
      else if (pct >= 75) onScrollDepthReached(75);
      else if (pct >= 50) onScrollDepthReached(50);
      else onScrollDepthReached(25);
    };

    checkScroll();
    window.addEventListener('scroll', checkScroll, { passive: true });
    return () => window.removeEventListener('scroll', checkScroll);
  }, [theme.id, onScrollDepthReached]);

  const activeWeekStep =
    theme.planSteps.find((s) => s.stepNumber === selectedWeek) ?? theme.planSteps[0];

  const completedCount = completedWeeks.length;
  const allFourWeeksDone = completedCount >= 4;
  const progressPct = Math.round((completedCount / 4) * 100);
  const isCurrentWeekDone = completedWeeks.includes(selectedWeek);
  const nextPendingWeek = [1, 2, 3, 4].find((w) => !completedWeeks.includes(w)) ?? null;

  const activeWeekSpeechText = activeWeekStep
    ? `${theme.title[lang]}. ${lang === 'hi' ? `सप्ताह ${selectedWeek}` : `Week ${selectedWeek}`}: ${activeWeekStep.title[lang]}. ${activeWeekStep.detail[lang]}`
    : theme.planIntro[lang];

  const handleOpenVoiceSolve = () => {
    onVoiceButtonTapped();
    setShowRecorder(true);
    setJustSubmitted(false);
  };

  const handleCompleteCurrentWeek = () => {
    const wasDone = completedWeeks.includes(selectedWeek);
    onToggleWeekDone(theme.id, selectedWeek);
    if (!wasDone) {
      if (selectedWeek < 4) {
        setSelectedWeek(selectedWeek + 1);
      }
      onScrollDepthReached(Math.min(100, selectedWeek * 25));
    }
  };

  const handleSelectWeekNode = (wkNum: number) => {
    setSelectedWeek(wkNum);
    if (window.innerWidth < 960 && weekCardRef.current) {
      weekCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleSolutionPlay = (sol: PeerSolution) => {
    if (sol.recordedAudioUrl) {
      if (playingBlobId === sol.id) {
        blobAudioRef.current?.pause();
        setPlayingBlobId(null);
        return;
      }
      if (blobAudioRef.current) {
        blobAudioRef.current.pause();
      }
      const audio = new Audio(sol.recordedAudioUrl);
      blobAudioRef.current = audio;
      audio.onended = () => setPlayingBlobId(null);
      audio.play().catch(() => {});
      setPlayingBlobId(sol.id);
      return;
    }

    const gender = sol.avatarUrl.includes('rajesh') ? 'male' : 'female';
    onSpeak(`sol-audio-${sol.id}`, sol.transcript[lang], gender);
  };

  return (
    <div className="space-y-0">
      {/* Gamified HUD Strip */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-3.5 @xl:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2.5">
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

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <div className="w-20 @xl:w-28 h-2.5 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-[#16A34A] transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span className="tabular-nums">{completedCount}/4</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onGoToBadges}
            className="text-xs font-bold text-[#B45309] hover:underline flex items-center gap-1.5 cursor-pointer"
          >
            <Trophy className="w-4 h-4" />
            <span>{lang === 'hi' ? 'मेरे बैज' : 'My Badges'}</span>
          </button>
        </div>
      </div>

      <section
        ref={sectionRef}
        className="max-w-5xl mx-auto px-3.5 @xl:px-6 py-4 @3xl:py-8 space-y-5 @xl:space-y-6"
      >
        {/* Top Back Button + Quick Theme Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={onBackToMap}
            className="min-h-[44px] px-3 py-2 -ml-3 rounded-lg text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === 'hi' ? 'विषय सूची पर लौटें' : 'Back to Themes'}</span>
          </button>

          <div className="flex items-center gap-2 w-full @xl:w-auto justify-between @xl:justify-end">
            <label htmlFor="theme-quick-select" className="text-xs font-medium text-slate-500 shrink-0">
              {lang === 'hi' ? 'विषय बदलें:' : 'Theme:'}
            </label>
            <select
              id="theme-quick-select"
              value={theme.id}
              onChange={(e) => {
                const found = PROBLEM_THEMES.find((t) => t.id === e.target.value);
                if (found) onSelectTheme(found);
              }}
              className="min-h-[42px] flex-1 @xl:flex-initial @xl:max-w-[250px] rounded-lg border border-slate-300 bg-white px-2.5 text-xs @xl:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D5C63]"
            >
              {PROBLEM_THEMES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title[lang]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Duolingo Theme Header Banner */}
        <div
          className={`rounded-2xl p-4 @xl:p-6 text-white space-y-3 transition-colors ${
            allFourWeeksDone ? 'bg-[#15803D]' : 'bg-[#0D5C63]'
          }`}
        >
          <div className="flex flex-col @xl:flex-row @xl:items-start justify-between gap-3">
            <div className="space-y-1.5 max-w-2xl">
              <p className="text-xs font-semibold text-white/80">
                {theme.contextNote[lang]} ·{' '}
                {lang === 'hi' ? '4-सप्ताह की चरणबद्ध योजना' : '4-Week Step-by-Step Path'}
              </p>
              <h1 className="text-xl @xl:text-2xl font-bold leading-snug text-balance">
                {theme.title[lang]}
              </h1>
              <p className="text-xs @xl:text-sm text-white/90 leading-relaxed">
                {theme.planIntro[lang]}
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2 self-start bg-black/20 rounded-xl px-3.5 py-2 text-xs font-bold tabular-nums">
              <span>
                {completedCount}/4 {lang === 'hi' ? 'सप्ताह पूर्ण' : 'Weeks Done'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1.5 pt-1" aria-label={lang === 'hi' ? '4 सप्ताह प्रगति' : '4 week progress'}>
            {[1, 2, 3, 4].map((wk) => (
              <div
                key={wk}
                className={`h-2 rounded-full transition-colors ${
                  completedWeeks.includes(wk) ? 'bg-[#FACC15]' : 'bg-white/25'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Main 2-Zone Duolingo 1-2-3-4 Path + Active Week Focus Card */}
        <div className="grid grid-cols-1 @5xl:grid-cols-12 gap-5 @xl:gap-6 items-start">
          {/* Left: Winding S-Curve 1 -> 2 -> 3 -> 4 Path */}
          <div className="@5xl:col-span-5 rounded-2xl border border-slate-200 bg-white p-4 @xl:p-6">
            <div className="text-center space-y-0.5 mb-5">
              <h2 className="text-sm @xl:text-base font-bold text-slate-900">
                {lang === 'hi' ? 'सप्ताह 1 से 4 का पथ (चुनें)' : 'Weeks 1 to 4 Path (Tap any week)'}
              </h2>
              <p className="text-xs text-slate-500">
                {lang === 'hi'
                  ? 'हर सप्ताह +25 अंक · सप्ताह 4 के बाद आवाज़ समाधान'
                  : '+25 XP per week · Voice share after Week 4'}
              </p>
            </div>

            <div className="relative flex flex-col items-center space-y-5 py-2">
              {[1, 2, 3, 4].map((wkNum, idx) => {
                const weekStep = theme.planSteps.find((s) => s.stepNumber === wkNum);
                const isDone = completedWeeks.includes(wkNum);
                const isSelected = selectedWeek === wkNum;
                const isNextUp = !isDone && nextPendingWeek === wkNum;
                const offsetClass = WEEK_OFFSETS[idx % WEEK_OFFSETS.length];

                return (
                  <div
                    key={wkNum}
                    className={`relative z-10 flex flex-col items-center text-center max-w-[220px] transition-transform ${offsetClass}`}
                  >
                    {isSelected && (
                      <span className="mb-1.5 px-2.5 py-0.5 rounded-lg bg-slate-900 text-white text-[11px] font-bold">
                        {lang === 'hi' ? `सप्ताह ${wkNum} खुला है` : `OPEN · WEEK ${wkNum}`}
                      </span>
                    )}
                    {!isSelected && isNextUp && (
                      <span className="mb-1.5 px-2.5 py-0.5 rounded-lg bg-[#16A34A] text-white text-[11px] font-bold">
                        {lang === 'hi' ? 'अगला सप्ताह' : 'NEXT UP'}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleSelectWeekNode(wkNum)}
                      aria-pressed={isSelected}
                      aria-label={
                        lang === 'hi'
                          ? `सप्ताह ${wkNum}: ${weekStep?.title.hi ?? ''}`
                          : `Week ${wkNum}: ${weekStep?.title.en ?? ''}`
                      }
                      className={`w-16 h-16 @xl:w-[74px] @xl:h-[74px] rounded-full border-b-[6px] flex flex-col items-center justify-center transition-all active:translate-y-[3px] active:border-b-2 cursor-pointer shadow-sm ${
                        isDone
                          ? `bg-[#F59E0B] border-[#B45309] text-white ${
                              isSelected ? 'ring-4 ring-amber-200' : ''
                            }`
                          : isSelected || isNextUp
                          ? 'bg-[#16A34A] border-[#14532D] text-white ring-4 ring-emerald-200'
                          : 'bg-white border-2 border-slate-300 border-b-[6px] text-slate-800 hover:border-[#0D5C63]'
                      }`}
                    >
                      {isDone ? (
                        <Check className="w-7 h-7 stroke-[3]" />
                      ) : (
                        <span className="text-xl @xl:text-2xl font-extrabold tabular-nums">
                          {wkNum}
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectWeekNode(wkNum)}
                      className="mt-2 cursor-pointer space-y-0.5"
                    >
                      <div className="text-xs font-bold text-[#0D5C63]">
                        {lang === 'hi' ? `सप्ताह ${wkNum}` : `Week ${wkNum}`}
                        {isDone ? (lang === 'hi' ? ' · पूर्ण' : ' · Done') : ''}
                      </div>
                      {weekStep && (
                        <div className="text-xs font-semibold text-slate-700 leading-snug line-clamp-2">
                          {weekStep.title[lang].replace(/^सप्ताह \d+:\s*|^Week \d+:\s*/i, '')}
                        </div>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Active Selected Week Card */}
          <div ref={weekCardRef} className="@5xl:col-span-7 space-y-5">
            {activeWeekStep && (
              <article className="rounded-2xl border-2 border-slate-200 bg-white p-4 @xl:p-7 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <span className="text-xs font-bold text-[#15803D]">
                    {lang === 'hi'
                      ? `सप्ताह ${selectedWeek} / 4 · ${activeWeekStep.duration.hi}`
                      : `WEEK ${selectedWeek} OF 4 · ${activeWeekStep.duration.en}`}
                  </span>

                  <div className="flex flex-wrap items-center gap-2">
                    <AudioListenButton
                      id={`week-${theme.id}-${selectedWeek}`}
                      lang={lang}
                      speakingId={speakingId}
                      loadingAudioId={loadingAudioId}
                      onClick={() =>
                        onSpeak(`week-${theme.id}-${selectedWeek}`, activeWeekSpeechText)
                      }
                    />
                    {onOpenAssistant && (
                      <button
                        type="button"
                        onClick={onOpenAssistant}
                        className="min-h-[44px] px-3.5 py-2 rounded-lg border border-[#B6D4D6] bg-[#EEF6F6] hover:bg-[#dfeeee] text-[#0D5C63] text-xs @xl:text-sm font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <Bot className="w-4 h-4" />
                        <span>{lang === 'hi' ? 'AI से पूछें' : 'Ask AI'}</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2.5 py-1">
                  <h2 className="text-xl @xl:text-2xl font-bold text-slate-900 leading-snug">
                    {activeWeekStep.title[lang]}
                  </h2>
                  <p className="text-sm @xl:text-base text-slate-700 leading-relaxed">
                    {activeWeekStep.detail[lang]}
                  </p>
                </div>

                {/* Primary Tactile Duolingo Week Complete Action */}
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <button
                    type="button"
                    onClick={handleCompleteCurrentWeek}
                    className={`w-full min-h-[52px] px-5 py-3 rounded-2xl text-sm @xl:text-base font-bold border-b-4 active:translate-y-[2px] active:border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isCurrentWeekDone
                        ? 'bg-emerald-50 border-2 border-emerald-400 border-b-4 text-emerald-900 hover:bg-emerald-100'
                        : 'bg-[#16A34A] hover:bg-[#15803D] border-[#14532D] text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>
                      {isCurrentWeekDone
                        ? lang === 'hi'
                          ? `सप्ताह ${selectedWeek} पूरा हो चुका है ✓ (हटाने के लिए दबाएं)`
                          : `Week ${selectedWeek} Completed ✓ (Tap to undo)`
                        : lang === 'hi'
                        ? `सप्ताह ${selectedWeek} पूरा किया · +25 अंक`
                        : `Mark Week ${selectedWeek} Done · +25 XP`}
                    </span>
                  </button>

                  {/* Previous / Next Week Navigation */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      disabled={selectedWeek <= 1}
                      onClick={() => setSelectedWeek((w) => Math.max(1, w - 1))}
                      className="min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {lang === 'hi' ? '← पिछला सप्ताह' : '← Previous Week'}
                    </button>

                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4].map((wk) => (
                        <button
                          key={wk}
                          type="button"
                          onClick={() => setSelectedWeek(wk)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold tabular-nums cursor-pointer transition-colors ${
                            selectedWeek === wk
                              ? 'bg-slate-900 text-white'
                              : completedWeeks.includes(wk)
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {wk}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      disabled={selectedWeek >= 4}
                      onClick={() => setSelectedWeek((w) => Math.min(4, w + 1))}
                      className="min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                    >
                      <span>{lang === 'hi' ? 'अगला सप्ताह' : 'Next Week'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            )}

            {/* Week 4 Voice Solution Milestone ("I solved this +50 XP") */}
            {!showRecorder ? (
              <div
                className={`rounded-2xl border p-4 @xl:p-6 flex flex-col @xl:flex-row @xl:items-center justify-between gap-4 transition-colors ${
                  allFourWeeksDone || selectedWeek === 4
                    ? 'bg-amber-50 border-amber-300'
                    : 'bg-[#EEF6F6] border-[#B6D4D6]'
                }`}
              >
                <div className="space-y-1">
                  <p className="text-xs font-bold text-[#B45309]">
                    {allFourWeeksDone
                      ? lang === 'hi'
                        ? '4 सप्ताह पूर्ण! · +50 अंक बोनस'
                        : '4 WEEKS COMPLETE! · +50 XP BONUS'
                      : lang === 'hi'
                      ? 'सप्ताह 4 का पड़ाव · +50 अंक'
                      : 'WEEK 4 MILESTONE · +50 XP'}
                  </p>
                  <h2 className="text-base @xl:text-lg font-bold text-slate-900">
                    {lang === 'hi'
                      ? 'क्या आपने अपनी कक्षा में इसका कोई तरीका निकाला है?'
                      : 'Have you found something that works in your classroom?'}
                  </h2>
                  <p className="text-sm text-slate-700">
                    {lang === 'hi'
                      ? 'अपना तरीका बोलकर बताएं ताकि आस-पास के अन्य शिक्षक भी सीख सकें।'
                      : 'Share your solution by voice so nearby teachers can learn from your experience.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenVoiceSolve}
                  className="w-full @xl:w-auto min-h-[52px] @xl:min-h-[48px] px-5 py-3 rounded-2xl bg-[#D97706] hover:bg-[#B45309] text-white text-sm @xl:text-base font-bold border-b-4 border-[#92400E] active:translate-y-[2px] active:border-b-2 flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 whitespace-nowrap"
                >
                  <Mic className="w-5 h-5" />
                  <span>{lang === 'hi' ? 'मैंने इसे हल किया (+50 अंक)' : 'I solved this (+50 XP)'}</span>
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-300 bg-white p-4 @xl:p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">
                    {lang === 'hi'
                      ? 'अपना तरीका आवाज़ में बताएं (+50 अंक)'
                      : 'Share how you solved this (+50 XP)'}
                  </h3>
                </div>
                <VoiceRecorderPanel
                  lang={lang}
                  mode="solution"
                  textPlaceholder={
                    lang === 'hi'
                      ? 'बताएं कि आपने कक्षा में क्या किया और बच्चों में क्या बदलाव दिखा...'
                      : 'Briefly describe what you tried in class and what worked...'
                  }
                  submitLabel={lang === 'hi' ? '+50 अंक के साथ समाधान जोड़ें' : 'Post solution (+50 XP)'}
                  onRecordingStarted={onVoiceRecordingStarted}
                  onCancel={() => setShowRecorder(false)}
                  onSubmit={(payload) => {
                    onSubmitVoiceSolution(payload);
                    setShowRecorder(false);
                    setJustSubmitted(true);
                  }}
                />
              </div>
            )}

            {justSubmitted && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 flex items-center justify-between gap-3 text-sm text-emerald-900 font-medium">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                  <span>
                    {lang === 'hi'
                      ? '+50 अंक मिले! आपका अनुभव नीचे और समुदाय फ़ीड में जुड़ गया है।'
                      : '+50 XP added! Your solution is live below and in the Community feed.'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onGoToBadges}
                  className="text-xs font-bold text-[#0D5C63] underline shrink-0 cursor-pointer"
                >
                  {lang === 'hi' ? 'सम्मान देखें' : 'View Badges'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Peer Teacher Solutions */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              {lang === 'hi'
                ? `अन्य शिक्षकों के अनुभव (${fallbackSolutions.length})`
                : `Solutions from fellow teachers (${fallbackSolutions.length})`}
            </h2>
            {themeSolutions.length === 0 && (
              <span className="text-xs text-slate-500">
                {lang === 'hi'
                  ? 'इस विषय पर पहले शिक्षक बनें — नीचे साथियों के उदाहरण सुनें'
                  : 'Be the first to share on this topic — sample peer stories below'}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 @3xl:grid-cols-2 gap-4">
            {fallbackSolutions.map((sol) => {
              const isLoadingAudio = loadingAudioId === `sol-audio-${sol.id}`;
              const isPlaying =
                playingBlobId === sol.id || speakingId === `sol-audio-${sol.id}`;
              const isHelpful = helpfulIds.includes(sol.id);

              return (
                <div
                  key={sol.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 @xl:p-5 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={sol.avatarUrl}
                        alt={sol.teacherName[lang]}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {sol.teacherName[lang]}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {sol.blockDistrict[lang]}
                          {sol.isUserSubmitted
                            ? ` · ${lang === 'hi' ? 'अभी साझा किया' : 'Just shared'}`
                            : ''}
                        </p>
                      </div>
                    </div>

                    <h3 className="text-base font-semibold text-slate-900 leading-snug">
                      {sol.summary[lang]}
                    </h3>

                    <p className="text-sm text-slate-600 leading-relaxed">
                      {sol.transcript[lang]}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => handleSolutionPlay(sol)}
                      className={`min-h-[40px] px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                        isPlaying
                          ? 'bg-[#0D5C63] text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      }`}
                    >
                      {isLoadingAudio ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : isPlaying ? (
                        <Pause className="w-3.5 h-3.5" />
                      ) : (
                        <Play className="w-3.5 h-3.5" />
                      )}
                      <span className="tabular-nums">
                        {isLoadingAudio
                          ? lang === 'hi'
                            ? 'आवाज़ तैयार...'
                            : 'Loading...'
                          : isPlaying
                          ? lang === 'hi'
                            ? 'रोकें'
                            : 'Stop'
                          : `${lang === 'hi' ? 'सुनें' : 'Listen'} (${sol.audioDurationSec}s)`}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onToggleHelpful(sol.id)}
                      className={`min-h-[40px] px-3 py-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer tabular-nums ${
                        isHelpful
                          ? 'border-[#0D5C63] bg-[#EEF6F6] text-[#0D5C63]'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>
                        {lang === 'hi' ? 'काम आया' : 'Helpful'} ·{' '}
                        {sol.helpfulCount + (isHelpful ? 1 : 0)}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
