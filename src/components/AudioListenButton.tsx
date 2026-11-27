import { Loader2, Volume2, VolumeX } from 'lucide-react';
import { UI_COPY } from '../data/saathiContent';
import { Language } from '../types';

interface AudioListenButtonProps {
  id: string;
  lang: Language;
  speakingId: string | null;
  loadingAudioId?: string | null;
  onClick: () => void;
  idleLabel?: string;
  className?: string;
  compact?: boolean;
}

export function AudioListenButton({
  id,
  lang,
  speakingId,
  loadingAudioId = null,
  onClick,
  idleLabel,
  className = '',
  compact = false,
}: AudioListenButtonProps) {
  const isLoading = loadingAudioId === id;
  const isSpeaking = speakingId === id;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isSpeaking ? UI_COPY.stopListening[lang] : idleLabel ?? UI_COPY.listen[lang]}
      className={`min-h-[44px] px-3.5 py-2 rounded-lg border text-xs @xl:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
        isSpeaking
          ? 'border-[#0D5C63] bg-[#EEF6F6] text-[#0D5C63]'
          : isLoading
          ? 'border-slate-300 bg-slate-100 text-slate-700'
          : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-800'
      } ${className}`}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 text-[#0D5C63] animate-spin shrink-0" />
      ) : isSpeaking ? (
        <VolumeX className="w-4 h-4 text-[#0D5C63] shrink-0" />
      ) : (
        <Volume2 className="w-4 h-4 text-[#0D5C63] shrink-0" />
      )}
      {!compact && (
        <span>
          {isLoading
            ? lang === 'hi'
              ? 'आवाज़ तैयार...'
              : 'Loading...'
            : isSpeaking
            ? UI_COPY.stopListening[lang]
            : idleLabel ?? UI_COPY.listen[lang]}
        </span>
      )}
    </button>
  );
}
