import { Check, Mic, Pause, Play, RotateCcw, Square } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Language } from '../types';

interface VoiceRecorderPanelProps {
  lang: Language;
  mode: 'solution' | 'challenge';
  textPlaceholder: string;
  submitLabel: string;
  onRecordingStarted: () => void;
  onSubmit: (payload: {
    method: 'voice' | 'text';
    text: string;
    durationSec: number;
    audioUrl?: string;
  }) => void;
  onCancel?: () => void;
}

export function VoiceRecorderPanel({
  lang,
  mode,
  textPlaceholder,
  submitLabel,
  onRecordingStarted,
  onSubmit,
  onCancel,
}: VoiceRecorderPanelProps) {
  const [status, setStatus] = useState<'idle' | 'recording' | 'recorded'>('idle');
  const [durationSec, setDurationSec] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | undefined>(undefined);
  const [noteText, setNoteText] = useState('');
  const [micModeNote, setMicModeNote] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  const timerRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const submittedUrlsRef = useRef<Set<string>>(new Set());

  const cleanupMedia = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current = null;
    }
    mediaRecorderRef.current = null;
  };

  useEffect(() => {
    return () => {
      cleanupMedia();
      if (audioUrl && !submittedUrlsRef.current.has(audioUrl)) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    onRecordingStarted();
    setDurationSec(0);
    setMicModeNote(null);
    chunksRef.current = [];

    if (audioUrl && !submittedUrlsRef.current.has(audioUrl)) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(undefined);

    setStatus('recording');
    timerRef.current = window.setInterval(() => {
      setDurationSec((s) => s + 1);
    }, 1000);

    try {
      if (
        typeof navigator !== 'undefined' &&
        navigator.mediaDevices &&
        typeof navigator.mediaDevices.getUserMedia === 'function' &&
        typeof MediaRecorder !== 'undefined'
      ) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (evt) => {
          if (evt.data.size > 0) {
            chunksRef.current.push(evt.data);
          }
        };
        recorder.onstop = () => {
          if (chunksRef.current.length > 0) {
            const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);
          }
        };
        recorder.start();
      } else {
        setMicModeNote(
          lang === 'hi'
            ? 'माइक उपलब्ध नहीं — आप समय के साथ परीक्षण कर सकते हैं या नीचे लिख सकते हैं।'
            : 'Mic unavailable — timer mode active, or type below.'
        );
      }
    } catch {
      setMicModeNote(
        lang === 'hi'
          ? 'माइक अनुमति नहीं मिली — आप नीचे लिखकर भी साझा कर सकते हैं।'
          : 'Mic permission declined — you can also type below.'
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // Ignore stop errors
      }
    }
    cleanupMedia();
    setStatus('recorded');
  };

  const resetRecording = () => {
    cleanupMedia();
    if (audioUrl && !submittedUrlsRef.current.has(audioUrl)) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(undefined);
    setDurationSec(0);
    setStatus('idle');
    setMicModeNote(null);
    setIsPlayingPreview(false);
  };

  const togglePreview = () => {
    if (!audioUrl) {
      setIsPlayingPreview((p) => !p);
      return;
    }
    if (!audioElRef.current) {
      audioElRef.current = new Audio(audioUrl);
      audioElRef.current.onended = () => setIsPlayingPreview(false);
    }
    if (isPlayingPreview) {
      audioElRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      audioElRef.current.play().catch(() => {});
      setIsPlayingPreview(true);
    }
  };

  const handleSubmit = () => {
    const hasVoice = status === 'recorded' || durationSec > 0;
    const trimmed = noteText.trim();
    if (!hasVoice && !trimmed) return;

    if (audioUrl) {
      submittedUrlsRef.current.add(audioUrl);
    }

    onSubmit({
      method: hasVoice ? 'voice' : 'text',
      text:
        trimmed ||
        (lang === 'hi'
          ? mode === 'solution'
            ? `मेरी आवाज़ में कक्षा का हल (${Math.max(3, durationSec)} सेकंड)`
            : `मेरी आवाज़ में साझा बात (${Math.max(3, durationSec)} सेकंड)`
          : mode === 'solution'
          ? `Voice solution recorded (${Math.max(3, durationSec)}s)`
          : `Voice note shared (${Math.max(3, durationSec)}s)`),
      durationSec: Math.max(3, durationSec),
      audioUrl,
    });
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const canSubmit = status === 'recorded' || noteText.trim().length > 0;

  return (
    <div className="space-y-3.5">
      {/* Voice-First Capture Zone */}
      <div className="rounded-2xl border border-[#B6D4D6] bg-[#EEF6F6] p-4 flex flex-col items-center text-center gap-3">
        <p className="text-sm font-bold text-slate-900">
          {lang === 'hi' ? 'बोलकर बताएं (सरल और तेज़)' : 'Speak in your own voice'}
        </p>

        {status === 'idle' && (
          <button
            type="button"
            onClick={startRecording}
            className="w-full sm:w-auto min-h-[54px] px-6 py-3 rounded-2xl bg-[#0D5C63] hover:bg-[#09474D] text-white text-sm font-bold flex items-center justify-center gap-2.5 cursor-pointer transition-transform active:scale-95"
          >
            <Mic className="w-5 h-5" />
            <span>{lang === 'hi' ? 'माइक दबाएं और बोलें' : 'Tap Mic & Speak'}</span>
          </button>
        )}

        {status === 'recording' && (
          <button
            type="button"
            onClick={stopRecording}
            className="w-full sm:w-auto min-h-[54px] px-6 py-3 rounded-2xl bg-[#B91C1C] hover:bg-[#991B1B] text-white text-sm font-bold flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Square className="w-4 h-4 fill-current" />
            <span className="tabular-nums">
              {lang === 'hi' ? 'रोकें' : 'Stop'} ({formatDuration(durationSec)})
            </span>
          </button>
        )}

        {status === 'recorded' && (
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={togglePreview}
              className="min-h-[46px] px-4 py-2 rounded-xl border border-[#0D5C63] bg-white text-[#0D5C63] text-sm font-bold flex items-center gap-2 cursor-pointer"
            >
              {isPlayingPreview ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span className="tabular-nums">
                {isPlayingPreview
                  ? lang === 'hi'
                    ? 'चल रहा है'
                    : 'Playing'
                  : `${lang === 'hi' ? 'सुनें' : 'Play'} (${formatDuration(Math.max(1, durationSec))})`}
              </span>
            </button>
            <button
              type="button"
              onClick={resetRecording}
              aria-label={lang === 'hi' ? 'दोबारा रिकॉर्ड करें' : 'Re-record'}
              className="min-h-[46px] min-w-[46px] rounded-xl border border-slate-300 bg-white text-slate-700 flex items-center justify-center cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}

        {micModeNote && <p className="text-xs text-slate-600">{micModeNote}</p>}
      </div>

      {/* Compact Optional Text Box */}
      <div>
        <textarea
          rows={2}
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder={textPlaceholder}
          aria-label={lang === 'hi' ? 'लिखकर बताएं (वैकल्पिक)' : 'Optional text note'}
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D5C63]"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2.5">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 text-sm font-semibold cursor-pointer"
          >
            {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
          </button>
        )}
        <button
          type="button"
          disabled={!canSubmit || status === 'recording'}
          onClick={handleSubmit}
          className={`min-h-[46px] px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors ${
            canSubmit && status !== 'recording'
              ? 'bg-[#16A34A] hover:bg-[#15803D] text-white cursor-pointer'
              : 'bg-slate-200 text-slate-500 cursor-not-allowed'
          }`}
        >
          <Check className="w-4 h-4" />
          <span>{submitLabel}</span>
        </button>
      </div>
    </div>
  );
}
