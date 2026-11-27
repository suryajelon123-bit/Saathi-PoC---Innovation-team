import { ArrowRight, CheckCircle2, Compass, Mic, Share2 } from 'lucide-react';
import { useState } from 'react';
import { PROBLEM_THEMES } from '../data/saathiContent';
import { Language } from '../types';
import { AudioListenButton } from './AudioListenButton';

interface FirstRunFlowProps {
  lang: Language;
  speakingId: string | null;
  loadingAudioId?: string | null;
  onSpeak: (id: string, text: string, gender?: 'female' | 'male') => void;
  onComplete: () => void;
  onSkip: () => void;
}

export function FirstRunFlow({
  lang,
  speakingId,
  loadingAudioId = null,
  onSpeak,
  onComplete,
  onSkip,
}: FirstRunFlowProps) {
  // Phase 0: Quick Splash -> Steps 1, 2, 3
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);

  const steps = [
    {
      num: 1 as const,
      icon: Compass,
      accentBg: 'bg-[#EEF6F6] text-[#0D5C63]',
      title: {
        hi: '1. अपने स्कूल की समस्या चुनें',
        en: '1. Pick your school or class problem',
      },
      desc: {
        hi: `निजी स्कूल पलायन, DBT योजना, बहु-कक्षा या उपस्थिति — ${PROBLEM_THEMES.length} असल विषयों में से चुनें और तुरंत सुनें।`,
        en: `Private school shift, DBT scheme, attendance, or multi-grade — pick from ${PROBLEM_THEMES.length} real issues and listen right away.`,
      },
    },
    {
      num: 2 as const,
      icon: Mic,
      accentBg: 'bg-amber-50 text-[#B45309]',
      title: {
        hi: '2. दूसरे शिक्षकों की आवाज़ सुनें',
        en: '2. Listen to fellow teachers',
      },
      desc: {
        hi: 'बिना खर्च वाले छोटे तरीके हिंदी में सुनें — कम इंटरनेट और छोटे फ़ोन पर भी आराम से चलता है।',
        en: 'Hear zero-cost ideas in Hindi — built to work smoothly on entry phones and weak networks.',
      },
    },
    {
      num: 3 as const,
      icon: Share2,
      accentBg: 'bg-emerald-50 text-[#15803D]',
      title: {
        hi: '3. "मैंने इसे हल किया" + WhatsApp साझा करें',
        en: '3. Tap "I solved this" + Share on WhatsApp',
      },
      desc: {
        hi: 'कोई तरीका काम आए तो एक बटन दबाकर जीत दर्ज करें और सीधे अपने स्कूल या BRC ग्रुप में भेजें।',
        en: 'Mark your win in one tap, record a quick voice tip if you want, and share on WhatsApp.',
      },
    },
  ];

  if (step === 0) {
    const splashVoice =
      lang === 'hi'
        ? 'साथी में आपका स्वागत है। यह सरकारी स्कूल शिक्षकों और प्रधानाध्यापकों का सरल आवाज़ मंच है।'
        : 'Welcome to Saathi, a lightweight voice hub for government school teachers and headmasters.';

    return (
      <section className="max-w-md mx-auto px-4 py-8 @xl:py-14">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 @xl:p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#0D5C63] text-white mx-auto flex items-center justify-center text-2xl font-extrabold">
            सा
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {lang === 'hi' ? 'साथी' : 'Saathi'}
            </h1>
            <p className="text-sm font-medium text-slate-600 leading-relaxed">
              {lang === 'hi'
                ? 'सरकारी स्कूल शिक्षकों व प्रधानाध्यापकों का आवाज़-प्रथम मंच — असली समस्याएँ, असली हल।'
                : 'Voice-first hub for rural teachers & headmasters — real problems, really solved.'}
            </p>
          </div>

          <div className="flex justify-center">
            <AudioListenButton
              id="splash-intro"
              lang={lang}
              speakingId={speakingId}
              loadingAudioId={loadingAudioId}
              onClick={() => onSpeak('splash-intro', splashVoice)}
            />
          </div>

          <div className="space-y-2.5 pt-1">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full min-h-[52px] px-5 py-3 rounded-2xl bg-[#0D5C63] hover:bg-[#09474D] text-white text-base font-bold border-b-4 border-[#073B40] active:translate-y-[2px] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{lang === 'hi' ? 'आगे बढ़ें (3 आसान कदम)' : 'Start (3 Quick Steps)'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onSkip}
              className="w-full min-h-[44px] text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              {lang === 'hi' ? 'सीधे समस्याओं पर जाएं →' : 'Skip straight to problems →'}
            </button>
          </div>
        </div>
      </section>
    );
  }

  const current = steps[step - 1];
  const Icon = current.icon;
  const stepSpeech = `${current.title[lang]}. ${current.desc[lang]}`;

  return (
    <section className="max-w-md mx-auto px-4 py-6 @xl:py-12">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 @xl:p-7 space-y-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((idx) => (
              <span
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  idx === step ? 'w-7 bg-[#0D5C63]' : idx < step ? 'w-3 bg-[#16A34A]' : 'w-3 bg-slate-200'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={onSkip}
            className="min-h-[36px] px-2.5 text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
          >
            {lang === 'hi' ? 'छोड़ें' : 'Skip'}
          </button>
        </div>

        <div className="py-2 space-y-4 text-center">
          <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center ${current.accentBg}`}>
            <Icon className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">{current.title[lang]}</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{current.desc[lang]}</p>
          </div>

          <div className="flex justify-center pt-1">
            <AudioListenButton
              id={`walkthrough-step-${step}`}
              lang={lang}
              speakingId={speakingId}
              loadingAudioId={loadingAudioId}
              onClick={() => onSpeak(`walkthrough-step-${step}`, stepSpeech)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2.5 pt-2">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : 1))}
              className="min-h-[48px] px-4 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 cursor-pointer"
            >
              {lang === 'hi' ? 'पीछे' : 'Back'}
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (step < 3) {
                setStep((s) => ((s + 1) as 1 | 2 | 3));
              } else {
                onComplete();
              }
            }}
            className="flex-1 min-h-[48px] px-5 py-3 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            {step === 3 ? <CheckCircle2 className="w-4 h-4" /> : null}
            <span>
              {step < 3
                ? lang === 'hi'
                  ? 'आगे बढ़ें'
                  : 'Next'
                : lang === 'hi'
                ? 'समस्याएँ देखें'
                : 'Go to Problems'}
            </span>
            {step < 3 && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </section>
  );
}
