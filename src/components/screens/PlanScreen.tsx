import {
  ArrowLeft,
  Bot,
  Check,
  CheckCircle2,
  ChevronDown,
  Crown,
  Loader2,
  Mic,
  Pause,
  Play,
  Star,
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
  completedWeeks: number[];
  isSolvedByUser: boolean;
  speakingId: string | null;
  loadingAudioId?: string | null;
  externalStepRequest?: { week: number; key: number } | null;
  onSpeak: (id: string, text: string, speakerGender?: 'female' | 'male') => void;
  onSelectTheme: (theme: ProblemTheme) => void;
  onToggleWeekDone: (themeId: string, weekNumber: number) => void;
  onBackToMap: () => void;
  onScrollDepthReached: (pct: number) => void;
  onVoiceButtonTapped: () => void;
  onVoiceRecordingStarted: () => void;
  onOneTapSolved: (theme: ProblemTheme) => void;
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

const PATH_OFFSETS = [
  'justify-start pl-2 sm:pl-8',
  'justify-center',
  'justify-end pr-2 sm:pr-8',
  'justify-center',
];

export function PlanScreen({
  lang,
  theme,
  solutions,
  completedWeeks,
  isSolvedByUser,
  speakingId,
  loadingAudioId = null,
  externalStepRequest = null,
  onSpeak,
  onSelectTheme,
  onToggleWeekDone,
  onBackToMap,
  onScrollDepthReached,
  onVoiceButtonTapped,
  onVoiceRecordingStarted,
  onOneTapSolved,
  onSubmitVoiceSolution,
  onToggleHelpful,
  helpfulIds,
  onOpenAssistant,
}: PlanScreenProps) {
  const [selectedStep, setSelectedStep] = useState<number>(1);
  const [showContext, setShowContext] = useState(false);
  const [showRecorder, setShowRecorder] = useState(false);
  const [showPeerSolutions, setShowPeerSolutions] = useState(false);
  const [playingBlobId, setPlayingBlobId] = useState<string | null>(null);
  const blobAudioRef = useRef<HTMLAudioElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const activityCardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const nextUnfinished =
      [1, 2, 3, 4].find((num) => !completedWeeks.includes(num)) ?? 1;
    setSelectedStep(nextUnfinished);
    setShowRecorder(false);
    setShowContext(false);
  }, [theme.id]);

  useEffect(() => {
    if (!externalStepRequest) return;
    setSelectedStep(externalStepRequest.week);
    activityCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [externalStepRequest]);

  useEffect(() => {
    return () => {
      blobAudioRef.current?.pause();
      blobAudioRef.current = null;
    };
  }, []);

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

  const themeSolutions = solutions.filter((s) => s.themeId === theme.id);
  const fallbackSolutions = themeSolutions.length > 0 ? themeSolutions : solutions.slice(0, 2);
  const activeStep = theme.planSteps.find((s) => s.stepNumber === selectedStep) ?? theme.planSteps[0];

  const completedCount = completedWeeks.filter((w) => w >= 1 && w <= 4).length;
  const progressPct = Math.round((completedCount / 4) * 100);
  const nextCurrentStep = [1, 2, 3, 4].find((num) => !completedWeeks.includes(num)) ?? 4;

  const fullSummarySpeech = activeStep
    ? `${theme.title[lang]}. ${lang === 'hi' ? `सप्ताह ${activeStep.stepNumber}` : `Week ${activeStep.stepNumber}`}. ${activeStep.title[lang]}. ${activeStep.detail[lang]}`
    : theme.planIntro[lang];

  const activeStepSpeech = activeStep
    ? `${lang === 'hi' ? `सप्ताह ${activeStep.stepNumber}, लेवल ${activeStep.stepNumber}` : `Week ${activeStep.stepNumber}, Level ${activeStep.stepNumber}`}. ${activeStep.title[lang]}. ${activeStep.detail[lang]}`
    : '';

  const handleSolutionPlay = (sol: PeerSolution) => {
    if (sol.recordedAudioUrl) {
      if (playingBlobId === sol.id) {
        blobAudioRef.current?.pause();
        setPlayingBlobId(null);
        return;
      }
      blobAudioRef.current?.pause();
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

  const handleSelectLevel = (stepNumber: number) => {
    setSelectedStep(stepNumber);
    activityCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  return (
    <section ref={sectionRef} className="max-w-4xl mx-auto px-3.5 @xl:px-6 pt-3 pb-8 space-y-3.5">
      {/* Back + Quick Theme Switch */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBackToMap}
          className="min-h-[42px] px-2.5 -ml-2 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-200/60 flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'hi' ? 'समस्याएँ' : 'Problems'}</span>
        </button>

        <select
          aria-label={lang === 'hi' ? 'समस्या बदलें' : 'Switch problem'}
          value={theme.id}
          onChange={(e) => {
            const found = PROBLEM_THEMES.find((t) => t.id === e.target.value);
            if (found) onSelectTheme(found);
          }}
          className="min-h-[40px] max-w-[230px] rounded-xl border border-slate-300 bg-white px-2.5 text-xs font-semibold text-slate-800"
        >
          {PROBLEM_THEMES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title[lang]}
            </option>
          ))}
        </select>
      </div>

      {/* Focused Compact Problem Header + Collapsible Context */}
      <div className="rounded-2xl bg-[#0D5C63] text-white p-4 space-y-2.5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <p className="text-[11px] font-semibold text-white/80">
              {theme.contextNote[lang]}
            </p>
            <h1 className="text-lg @xl:text-xl font-extrabold leading-snug text-balance">
              {theme.title[lang]}
            </h1>
          </div>

          <AudioListenButton
            id={`plan-header-${theme.id}`}
            lang={lang}
            speakingId={speakingId}
            loadingAudioId={loadingAudioId}
            onClick={() => onSpeak(`plan-header-${theme.id}`, fullSummarySpeech)}
            className="bg-white text-slate-900 border-transparent shrink-0"
          />
        </div>

        {/* Expand/Collapse Secondary Overview */}
        <button
          type="button"
          onClick={() => setShowContext((v) => !v)}
          aria-expanded={showContext}
          className="w-full pt-1 flex items-center justify-between text-xs font-bold text-white/85 hover:text-white cursor-pointer"
        >
          <span>{lang === 'hi' ? 'पूरी जानकारी व संक्षेप देखें' : 'View theme background'}</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${showContext ? 'rotate-180' : ''}`}
          />
        </button>

        {showContext && (
          <p className="text-xs @xl:text-sm text-white/95 pt-1 border-t border-white/15 leading-relaxed">
            {theme.planIntro[lang]}
          </p>
        )}
      </div>

      {/* HERO FOCUS: DUOLINGO-STYLE WEEKLY ACTION PLAN PATH */}
      <div className="rounded-2xl border-2 border-[#0D5C63]/20 bg-white p-4 @xl:p-5 space-y-4 shadow-xs">
        {/* Path Gamified XP & Progress Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm @xl:text-base font-extrabold text-slate-900">
                {lang === 'hi' ? '4 सप्ताह का एक्शन प्लान (लेवल 1–4)' : '4-Week Action Plan (Levels 1–4)'}
              </h2>
              <p className="text-xs text-slate-600">
                {lang === 'hi'
                  ? 'हर सप्ताह पूरा करें और +25 अंक व बधाई पाएं'
                  : 'Complete each week for +25 XP & milestone cheer'}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-extrabold text-[#0D5C63] tabular-nums inline-flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-[#0D5C63]" />
                {completedCount * 25}/100 XP
              </span>
              <p className="text-[11px] font-bold text-slate-500 tabular-nums">
                {completedCount}/4 {lang === 'hi' ? 'पूर्ण' : 'Done'}
              </p>
            </div>
          </div>

          <div
            role="progressbar"
            aria-valuenow={progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={lang === 'hi' ? 'एक्शन प्लान प्रगति' : 'Action plan progress'}
            className="h-3 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-200/70"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#0D5C63] to-[#16A34A] transition-all duration-300"
              style={{ width: `${Math.max(progressPct, 6)}%` }}
            />
          </div>
        </div>

        {/* Winding Duolingo-Style Level 1 -> 2 -> 3 -> 4 Nodes */}
        <div className="relative py-2 space-y-4">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-8 bottom-8 w-1 -translate-x-1/2 border-l-2 border-dashed border-slate-200"
          />

          {theme.planSteps.map((step, idx) => {
            const done = completedWeeks.includes(step.stepNumber);
            const isSelected = selectedStep === step.stepNumber;
            const isCurrentTarget = !done && step.stepNumber === nextCurrentStep;
            const isFinal = step.stepNumber === 4;
            const alignClass = PATH_OFFSETS[idx % PATH_OFFSETS.length];

            return (
              <div key={step.stepNumber} className={`relative z-10 flex items-center ${alignClass}`}>
                <div className="flex items-center gap-3 max-w-full">
                  <button
                    type="button"
                    onClick={() => handleSelectLevel(step.stepNumber)}
                    aria-current={isSelected ? 'step' : undefined}
                    aria-label={
                      lang === 'hi'
                        ? `सप्ताह ${step.stepNumber}, लेवल ${step.stepNumber}: ${step.title.hi}`
                        : `Week ${step.stepNumber}, Level ${step.stepNumber}: ${step.title.en}`
                    }
                    className={`relative w-16 h-16 rounded-full flex flex-col items-center justify-center shrink-0 transition-transform active:translate-y-[2px] cursor-pointer ${
                      done
                        ? 'bg-[#16A34A] hover:bg-[#15803D] text-white border-b-4 border-[#14532D]'
                        : isSelected || isCurrentTarget
                        ? 'bg-[#0D5C63] hover:bg-[#09474D] text-white border-b-4 border-[#073B40]'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 border-b-4 border-b-slate-300'
                    } ${isSelected ? 'ring-4 ring-[#0D5C63]/25 scale-[1.04]' : ''}`}
                  >
                    {done ? (
                      <Check className="w-6 h-6 stroke-[3]" />
                    ) : isFinal ? (
                      <Crown className="w-6 h-6" />
                    ) : (
                      <Star className={`w-6 h-6 ${isSelected || isCurrentTarget ? 'fill-white/25' : ''}`} />
                    )}
                    <span className="text-[10px] font-extrabold leading-none mt-0.5 tabular-nums">
                      L{step.stepNumber}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectLevel(step.stepNumber)}
                    className={`text-left px-3 py-2 rounded-xl border transition-colors cursor-pointer max-w-[215px] sm:max-w-[270px] ${
                      isSelected
                        ? 'bg-[#F0F9F9] border-[#0D5C63] shadow-xs'
                        : done
                        ? 'bg-emerald-50/70 border-emerald-200'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <p
                      className={`text-[11px] font-bold tabular-nums ${
                        done ? 'text-[#15803D]' : isSelected ? 'text-[#0D5C63]' : 'text-slate-500'
                      }`}
                    >
                      {lang === 'hi'
                        ? `सप्ताह ${step.stepNumber} · लेवल ${step.stepNumber}`
                        : `Week ${step.stepNumber} · Level ${step.stepNumber}`}
                      {done
                        ? lang === 'hi'
                          ? ' · पूर्ण ✓'
                          : ' · Done ✓'
                        : isCurrentTarget
                        ? lang === 'hi'
                          ? ' · अगला'
                          : ' · Next'
                        : ''}
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug mt-0.5">
                      {step.title[lang]}
                    </p>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Focused Active Week Action Plan Card */}
        {activeStep && (
          <div
            ref={activityCardRef}
            className="rounded-xl border-2 border-[#0D5C63]/25 bg-[#F8FAFC] p-4 space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5">
                <p className="text-[11px] font-bold text-[#0D5C63] tabular-nums">
                  {lang === 'hi'
                    ? `सप्ताह ${activeStep.stepNumber} एक्शन प्लान · ${activeStep.duration.hi}`
                    : `Week ${activeStep.stepNumber} Action Plan · ${activeStep.duration.en}`}
                </p>
                <h3 className="text-base @xl:text-lg font-extrabold text-slate-900 leading-snug">
                  {activeStep.title[lang]}
                </h3>
              </div>

              <AudioListenButton
                id={`level-audio-${theme.id}-${activeStep.stepNumber}`}
                lang={lang}
                speakingId={speakingId}
                loadingAudioId={loadingAudioId}
                onClick={() =>
                  onSpeak(`level-audio-${theme.id}-${activeStep.stepNumber}`, activeStepSpeech)
                }
                className="shrink-0"
              />
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">{activeStep.detail[lang]}</p>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                onClick={() => onToggleWeekDone(theme.id, selectedStep)}
                className={`flex-1 min-h-[48px] px-4 py-2.5 rounded-xl text-xs @xl:text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  completedWeeks.includes(selectedStep)
                    ? 'bg-emerald-50 border border-emerald-300 text-[#15803D]'
                    : 'bg-[#16A34A] hover:bg-[#15803D] text-white border-b-4 border-[#14532D] active:translate-y-[2px]'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {completedWeeks.includes(selectedStep)
                    ? lang === 'hi'
                      ? `सप्ताह ${selectedStep} पूरा हुआ ✓ (बदलें)`
                      : `Week ${selectedStep} Done ✓ (Undo)`
                    : lang === 'hi'
                    ? `सप्ताह ${selectedStep} एक्शन प्लान पूरा करें (+25 XP)`
                    : `Complete Week ${selectedStep} Plan (+25 XP)`}
                </span>
              </button>

              {onOpenAssistant && (
                <button
                  type="button"
                  onClick={onOpenAssistant}
                  className="min-h-[48px] px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-[#0D5C63] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Bot className="w-4 h-4" />
                  <span>{lang === 'hi' ? 'AI मदद' : 'Ask AI'}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Win Banner + Expand-Collapsible Voice Tip Recorder */}
      <div className="rounded-2xl border border-amber-300 bg-amber-50/90 p-3.5 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-extrabold text-slate-900">
              {isSolvedByUser
                ? lang === 'hi'
                  ? 'यह समस्या आपने हल कर ली है ✓'
                  : 'Problem marked solved ✓'
                : lang === 'hi'
                ? 'स्कूल में हल हो गया? जीत दर्ज करें'
                : 'Solved this at school? Record your win'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onOneTapSolved(theme)}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-extrabold border-b-4 border-[#14532D] active:translate-y-[2px] flex items-center gap-1.5 cursor-pointer"
            >
              <Trophy className="w-4 h-4" />
              <span>{lang === 'hi' ? 'मैंने इसे हल किया (+50)' : 'I solved this (+50)'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onVoiceButtonTapped();
                setShowRecorder((v) => !v);
              }}
              aria-expanded={showRecorder}
              className="min-h-[44px] px-3 py-2 rounded-xl bg-white border border-amber-400 text-[#92400E] text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'आवाज़ जोड़ें' : 'Add Voice'}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${showRecorder ? 'rotate-180' : ''}`}
              />
            </button>
          </div>
        </div>

        {showRecorder && (
          <div className="pt-2 border-t border-amber-200">
            <VoiceRecorderPanel
              lang={lang}
              mode="solution"
              textPlaceholder={
                lang === 'hi'
                  ? 'बताएं आपने कक्षा में क्या किया...'
                  : 'Briefly share what worked in class...'
              }
              submitLabel={lang === 'hi' ? 'आवाज़ साझा करें (+50 अंक)' : 'Post Solution (+50 XP)'}
              onRecordingStarted={onVoiceRecordingStarted}
              onCancel={() => setShowRecorder(false)}
              onSubmit={(payload) => {
                onSubmitVoiceSolution(payload);
                setShowRecorder(false);
              }}
            />
          </div>
        )}
      </div>

      {/* Expand-Collapsible Peer Teacher Voice Solutions */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <button
          type="button"
          onClick={() => setShowPeerSolutions((v) => !v)}
          aria-expanded={showPeerSolutions}
          className="w-full min-h-[50px] px-4 py-3 flex items-center justify-between gap-2 text-left hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <div>
            <h2 className="text-sm @xl:text-base font-bold text-slate-900">
              {lang === 'hi'
                ? `साथी शिक्षकों के हल सुनें (${fallbackSolutions.length})`
                : `Peer Teacher Solutions (${fallbackSolutions.length})`}
            </h2>
            <p className="text-[11px] text-slate-500">
              {showPeerSolutions
                ? lang === 'hi'
                  ? 'छिपाने के लिए टैप करें'
                  : 'Tap to collapse'
                : lang === 'hi'
                ? 'अन्य स्कूलों के शिक्षकों के आवाज़ अनुभव खोलें'
                : 'Tap to expand real teacher voice examples'}
            </p>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-slate-500 shrink-0 transition-transform ${
              showPeerSolutions ? 'rotate-180' : ''
            }`}
          />
        </button>

        {showPeerSolutions && (
          <div className="p-4 pt-2 border-t border-slate-100 grid grid-cols-1 @3xl:grid-cols-2 gap-3">
            {fallbackSolutions.map((sol) => {
              const isLoadingAudio = loadingAudioId === `sol-audio-${sol.id}`;
              const isPlaying = playingBlobId === sol.id || speakingId === `sol-audio-${sol.id}`;
              const isHelpful = helpfulIds.includes(sol.id);

              return (
                <div
                  key={sol.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={sol.avatarUrl}
                        alt={sol.teacherName[lang]}
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {sol.teacherName[lang]}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">{sol.blockDistrict[lang]}</p>
                      </div>
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">{sol.summary[lang]}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {sol.transcript[lang]}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleSolutionPlay(sol)}
                      className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                        isPlaying ? 'bg-[#0D5C63] text-white' : 'bg-[#EEF6F6] text-[#0D5C63]'
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
                        {isPlaying
                          ? lang === 'hi'
                            ? 'रोकें'
                            : 'Stop'
                          : `${lang === 'hi' ? 'सुनें' : 'Listen'} (${sol.audioDurationSec}s)`}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onToggleHelpful(sol.id)}
                      className={`min-h-[38px] px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 cursor-pointer tabular-nums ${
                        isHelpful
                          ? 'border-[#0D5C63] bg-[#EEF6F6] text-[#0D5C63]'
                          : 'border-slate-200 bg-white text-slate-700'
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
        )}
      </div>
    </section>
  );
}
