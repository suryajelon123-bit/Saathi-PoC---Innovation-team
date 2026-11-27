import {
  ArrowRight,
  Award,
  Check,
  Crown,
  Flame,
  Sparkles,
  Trophy,
  X,
  Zap,
} from 'lucide-react';
import { useEffect } from 'react';
import { Language, ProblemTheme } from '../types';
import { AudioListenButton } from './AudioListenButton';

export interface WeekCelebrationPayload {
  theme: ProblemTheme;
  weekNumber: number;
  completedWeeks: number[];
  xpEarned: number;
  streakDays: number;
}

interface WeekCelebrationModalProps {
  celebration: WeekCelebrationPayload | null;
  lang: Language;
  speakingId: string | null;
  loadingAudioId?: string | null;
  onSpeak: (id: string, text: string, gender?: 'female' | 'male') => void;
  onContinueNextWeek: (nextWeek: number) => void;
  onClaimFinalWin: (theme: ProblemTheme) => void;
  onClose: () => void;
}

const WEEK_CHEERS: Record<
  number,
  {
    headlineHi: string;
    headlineEn: string;
    bodyHi: string;
    bodyEn: string;
  }
> = {
  1: {
    headlineHi: 'बधाई हो! पहला कदम आपने जीत लिया!',
    headlineEn: "Congratulations! You've got this!",
    bodyHi:
      'शुरुआत करना सबसे बड़ी बात है। आपके छोटे कदम से कक्षा में सकारात्मक बदलाव शुरू हो चुका है।',
    bodyEn:
      'Starting is the hardest part. Your classroom is already feeling the shift from this first action!',
  },
  2: {
    headlineHi: 'शानदार गति! सप्ताह 2 भी पूरा!',
    headlineEn: 'Awesome momentum! Week 2 complete!',
    bodyHi:
      'आप लगातार आगे बढ़ रहे हैं। अब बच्चे और अभिभावक भी आपकी नई पहल का असर महसूस कर रहे होंगे।',
    bodyEn:
      'Two weeks strong! Students and families are already noticing your consistent effort.',
  },
  3: {
    headlineHi: 'गज़ब! मंज़िल बस एक कदम दूर है!',
    headlineEn: 'Amazing consistency! Almost there!',
    bodyHi:
      'तीसरे सप्ताह तक पहुँचने वाले चुनिंदा प्रेरणादायक शिक्षकों में आप शामिल हैं। आखिरी सप्ताह और बाकी है!',
    bodyEn:
      'Only one final week left! You are among the dedicated peers leading real change.',
  },
  4: {
    headlineHi: 'सुपरस्टार शिक्षक! चारों सप्ताह पूरे!',
    headlineEn: 'Action Plan Champion! All 4 weeks done!',
    bodyHi:
      'पूरे महीने का एक्शन प्लान पूरा करके आपने कमाल कर दिया। अब अपनी जीत दर्ज करें और साथियों को प्रेरित करें!',
    bodyEn:
      'You completed the entire 4-week action plan! Claim your +50 XP victory bonus and inspire fellow teachers.',
  },
};

export function WeekCelebrationModal({
  celebration,
  lang,
  speakingId,
  loadingAudioId = null,
  onSpeak,
  onContinueNextWeek,
  onClaimFinalWin,
  onClose,
}: WeekCelebrationModalProps) {
  useEffect(() => {
    if (!celebration) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [celebration, onClose]);

  if (!celebration) return null;

  const cheer = WEEK_CHEERS[celebration.weekNumber] ?? WEEK_CHEERS[1];
  const isFinalWeek = celebration.weekNumber === 4 || celebration.completedWeeks.length >= 4;
  const nextWeek = Math.min(4, celebration.weekNumber + 1);

  const speechText = `${cheer[lang === 'hi' ? 'headlineHi' : 'headlineEn']} ${cheer[lang === 'hi' ? 'bodyHi' : 'bodyEn']}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label={lang === 'hi' ? 'एक्शन प्लान बधाई' : 'Action Plan Milestone'}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Festive Top Banner */}
        <div className="relative bg-gradient-to-br from-[#0D5C63] via-[#0F6E75] to-[#15803D] px-5 pt-6 pb-5 text-white text-center space-y-2.5">
          <button
            type="button"
            onClick={onClose}
            aria-label={lang === 'hi' ? 'बंद करें' : 'Close'}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/20 hover:bg-black/35 text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-amber-300 text-slate-900 mx-auto flex items-center justify-center shadow-lg border-b-4 border-amber-500">
            {isFinalWeek ? <Crown className="w-8 h-8" /> : <Sparkles className="w-8 h-8" />}
          </div>

          <p className="text-[11px] font-extrabold tracking-wide uppercase text-amber-200 tabular-nums">
            {lang === 'hi'
              ? `सप्ताह ${celebration.weekNumber} एक्शन प्लान पूरा`
              : `Week ${celebration.weekNumber} Action Plan Completed`}
          </p>

          <h2 className="text-xl font-extrabold leading-snug text-balance">
            {lang === 'hi' ? cheer.headlineHi : cheer.headlineEn}
          </h2>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4">
          <p className="text-xs font-bold text-[#0D5C63] text-center truncate">
            {celebration.theme.title[lang]}
          </p>

          <p className="text-sm text-slate-700 text-center leading-relaxed">
            {lang === 'hi' ? cheer.bodyHi : cheer.bodyEn}
          </p>

          {/* 4-Level Duolingo Gem Tracker */}
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3.5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              {[1, 2, 3, 4].map((num) => {
                const done = celebration.completedWeeks.includes(num);
                const justDone = num === celebration.weekNumber;
                return (
                  <div key={num} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-extrabold border-b-2 transition-all ${
                        done
                          ? justDone
                            ? 'bg-[#16A34A] text-white border-[#14532D] ring-4 ring-emerald-200 scale-105'
                            : 'bg-[#16A34A] text-white border-[#14532D]'
                          : 'bg-slate-200 text-slate-500 border-slate-300'
                      }`}
                    >
                      {done ? <Check className="w-4 h-4 stroke-[3]" /> : `W${num}`}
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 tabular-nums">
                      {lang === 'hi' ? `सप्ताह ${num}` : `Wk ${num}`}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-around text-xs font-extrabold">
              <span className="inline-flex items-center gap-1 text-[#0D5C63] tabular-nums">
                <Zap className="w-4 h-4 fill-[#0D5C63]" />
                +{celebration.xpEarned} {lang === 'hi' ? 'अंक' : 'XP'}
              </span>
              <span className="inline-flex items-center gap-1 text-[#B45309] tabular-nums">
                <Flame className="w-4 h-4 fill-[#F59E0B] text-[#B45309]" />
                {celebration.streakDays} {lang === 'hi' ? 'दिन स्ट्रीक' : 'Day Streak'}
              </span>
              <span className="inline-flex items-center gap-1 text-[#15803D] tabular-nums">
                <Award className="w-4 h-4" />
                {celebration.completedWeeks.length}/4
              </span>
            </div>
          </div>

          <div className="flex justify-center">
            <AudioListenButton
              id={`week-cheer-${celebration.theme.id}-${celebration.weekNumber}`}
              lang={lang}
              speakingId={speakingId}
              loadingAudioId={loadingAudioId}
              onClick={() =>
                onSpeak(`week-cheer-${celebration.theme.id}-${celebration.weekNumber}`, speechText)
              }
            />
          </div>

          {/* Primary Action */}
          <div className="space-y-2 pt-1">
            {isFinalWeek ? (
              <button
                type="button"
                onClick={() => onClaimFinalWin(celebration.theme)}
                className="w-full min-h-[50px] px-5 py-3 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-extrabold border-b-4 border-[#14532D] active:translate-y-[2px] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trophy className="w-4 h-4" />
                <span>
                  {lang === 'hi'
                    ? 'फाइनल जीत (+50) व WhatsApp साझा करें'
                    : 'Claim +50 Win Bonus & Share'}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onContinueNextWeek(nextWeek)}
                className="w-full min-h-[50px] px-5 py-3 rounded-2xl bg-[#0D5C63] hover:bg-[#09474D] text-white text-sm font-extrabold border-b-4 border-[#073B40] active:translate-y-[2px] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>
                  {lang === 'hi'
                    ? `अगला कदम: सप्ताह ${nextWeek} (L${nextWeek}) खोलें`
                    : `Continue to Week ${nextWeek} (L${nextWeek})`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full min-h-[40px] text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              {lang === 'hi' ? 'यहीं रुकें' : 'Stay on Action Plan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
