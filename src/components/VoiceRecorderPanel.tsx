import { Check, Mic, Play, RotateCcw, Square } from 'lucide-react';
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

  const cleanupMedia = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
  };

  useEffect(() => {
    return () => {
      cleanupMedia();
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    onRecordingStarted();
    setDurationSec(0);
    setMicModeNote(null);
    chunksRef.current = [];

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(undefined);
    }

    setStatus('recording');
    timerRef.current = window.setInterval(() => {
      setDurationSec((s) => s + 1);
    }, 1000);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
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
            ? 'माइक अनुमति उपलब्ध नहीं — सिमुलेटेड रिकॉर्डिंग चालू है'
            : 'Mic unavailable — prototype timer mode active'
        );
      }
    } catch {
      setMicModeNote(
        lang === 'hi'
          ? 'माइक अनुमति नहीं मिली — आप फिर भी समय के साथ परीक्षण या लिखकर साझा कर सकते हैं'
          : 'Mic permission declined — timer test mode active, or type below'
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
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(undefined);
    }
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

    onSubmit({
      method: hasVoice ? 'voice' : 'text',
      text:
        trimmed ||
        (lang === 'hi'
          ? mode === 'solution'
            ? `मेरी आवाज़ में कक्षा का समाधान (${Math.max(3, durationSec)} सेकंड)`
            : `मेरी आवाज़ में साझा की गई बात (${Math.max(3, durationSec)} सेकंड)`
          : mode === 'solution'
          ? `Voice solution recorded (${Math.max(3, durationSec)}s)`
          : `Voice challenge shared (${Math.max(3, durationSec)}s)`),
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
    <div className="space-y-4">
      {/* Voice Capture Zone */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-900">
              {lang === 'hi' ? 'अपनी आवाज़ में बोलकर रिकॉर्ड करें' : 'Record in your own voice'}
            </p>
            <p className="text-xs text-slate-600">
              {lang === 'hi'
                ? 'सीधी और सरल भाषा में बताएं — जैसे आप किसी साथी शिक्षक से बात कर रहे हों।'
                : 'Speak naturally, just as you would explain to a fellow teacher.'}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
            {status === 'idle' && (
              <button
                type="button"
                onClick={startRecording}
                className="w-full sm:w-auto min-h-[52px] sm:min-h-[44px] px-5 py-3 rounded-xl bg-[#0D5C63] hover:bg-[#09474D] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Mic className="w-5 h-5" />
                <span>{lang === 'hi' ? 'बोलना शुरू करें' : 'Start Recording'}</span>
              </button>
            )}

            {status === 'recording' && (
              <button
                type="button"
                onClick={stopRecording}
                className="w-full sm:w-auto min-h-[52px] sm:min-h-[44px] px-5 py-3 rounded-xl bg-[#B91C1C] hover:bg-[#991B1B] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>
                  {lang === 'hi' ? 'रोकें' : 'Stop'} ({formatDuration(durationSec)})
                </span>
              </button>
            )}

            {status === 'recorded' && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={togglePreview}
                  className="min-h-[44px] px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-sm font-medium flex items-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <Play className="w-4 h-4 text-[#0D5C63]" />
                  <span className="tabular-nums">
                    {isPlayingPreview
                      ? lang === 'hi'
                        ? 'चल रहा है...'
                        : 'Playing...'
                      : `${lang === 'hi' ? 'सुनें' : 'Play'} (${formatDuration(Math.max(1, durationSec))})`}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={resetRecording}
                  aria-label={lang === 'hi' ? 'दोबारा रिकॉर्ड करें' : 'Re-record'}
                  className="min-h-[44px] min-w-[44px] rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-600 flex items-center justify-center cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {status === 'recording' && (
          <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-[#B91C1C] font-medium">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#B91C1C] animate-pulse" />
              {lang === 'hi' ? 'रिकॉर्डिंग जारी है...' : 'Recording in progress...'}
            </span>
            <span className="font-mono-tabular">{formatDuration(durationSec)}</span>
          </div>
        )}

        {micModeNote && (
          <p className="mt-2 text-xs text-slate-600">{micModeNote}</p>
        )}
      </div>

      {/* Text Fallback */}
      <div>
        <label className="block text-sm font-medium text-slate-800 mb-1.5">
          {lang === 'hi' ? 'या लिखकर बताएं (वैकल्पिक यदि आवाज़ रिकॉर्ड की है)' : 'Or type here (optional if recorded by voice)'}
        </label>
        <textarea
          rows={3}
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder={textPlaceholder}
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D5C63] focus:border-transparent"
        />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[44px] px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium cursor-pointer"
          >
            {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
          </button>
        )}
        <button
          type="button"
          disabled={!canSubmit || status === 'recording'}
          onClick={handleSubmit}
          className={`min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors ${
            canSubmit && status !== 'recording'
              ? 'bg-[#0D5C63] hover:bg-[#09474D] text-white cursor-pointer'
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
