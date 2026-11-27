import { CheckCircle2, Mic, Share2, Trophy, X } from 'lucide-react';
import { useEffect } from 'react';
import { Language, WinMomentPayload } from '../types';

interface WinMomentModalProps {
  win: WinMomentPayload | null;
  lang: Language;
  teacherName?: string;
  blockDistrict?: string;
  onClose: () => void;
  onAddVoiceTip?: () => void;
  onWhatsappShareClicked: (themeId: string) => void;
}

export function WinMomentModal({
  win,
  lang,
  teacherName,
  blockDistrict,
  onClose,
  onAddVoiceTip,
  onWhatsappShareClicked,
}: WinMomentModalProps) {
  useEffect(() => {
    if (!win) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [win, onClose]);

  if (!win) return null;

  const appUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const senderLabel = teacherName
    ? `${teacherName}${blockDistrict ? ` (${blockDistrict})` : ''}`
    : lang === 'hi'
    ? 'एक शिक्षक साथी'
    : 'A fellow teacher';

  const whatsappMessage =
    lang === 'hi'
      ? `नमस्ते साथी शिक्षकों! ${senderLabel} ने 'साथी' पर "${win.themeTitle.hi}" समस्या का हल आज़माया: "${win.solutionText}"। आप भी सुनें और अपने स्कूल में आज़माएं: ${appUrl}`
      : `Namaste teachers! ${senderLabel} shared a win on Saathi for "${win.themeTitle.en}": "${win.solutionText}". Listen & try in your school: ${appUrl}`;

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={lang === 'hi' ? 'आपकी जीत!' : 'Your Win!'}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-3xl bg-white border border-amber-200 p-6 text-center space-y-5 shadow-xl relative">
        <button
          type="button"
          onClick={onClose}
          aria-label={lang === 'hi' ? 'बंद करें' : 'Close'}
          className="absolute top-3.5 right-3.5 w-10 h-10 rounded-full hover:bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 rounded-2xl bg-amber-100 border-2 border-amber-300 text-[#B45309] mx-auto flex items-center justify-center">
          <Trophy className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-[#15803D] text-xs font-extrabold">
            <CheckCircle2 className="w-4 h-4" />
            <span>+{win.xpEarned} {lang === 'hi' ? 'अंक मिले!' : 'XP Earned!'}</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 pt-1">
            {lang === 'hi' ? 'शाबाश! आपने यह समस्या हल की' : 'Well done! You solved this!'}
          </h2>
          <p className="text-sm text-slate-600 leading-snug">
            {win.themeTitle[lang]}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3.5 text-left text-xs text-slate-700 leading-relaxed">
          “{win.solutionText}”
        </div>

        <div className="space-y-2.5 pt-1">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onWhatsappShareClicked(win.themeId)}
            className="w-full min-h-[50px] px-5 py-3 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-bold border-b-4 border-[#14532D] active:translate-y-[2px] flex items-center justify-center gap-2 transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>
              {lang === 'hi'
                ? 'WhatsApp पर साथियों को भेजें'
                : 'Share on WhatsApp'}
            </span>
          </a>

          {win.method === 'quick_tap' && onAddVoiceTip && (
            <button
              type="button"
              onClick={onAddVoiceTip}
              className="w-full min-h-[44px] px-4 py-2 rounded-xl border border-[#0D5C63] text-[#0D5C63] hover:bg-[#EEF6F6] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              <span>
                {lang === 'hi'
                  ? 'बोलकर बताएं आपने कैसे हल किया'
                  : 'Add quick voice note on how you solved it'}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[40px] text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            {lang === 'hi' ? 'आगे बढ़ें' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
