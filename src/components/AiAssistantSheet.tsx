import {
  Bot,
  Loader2,
  Mic,
  MicOff,
  RotateCcw,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { UI_COPY } from '../data/saathiContent';
import {
  AbVariant,
  AssistantMessage,
  Language,
  ProblemTheme,
  ScreenId,
  TeacherProfile,
} from '../types';

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  0: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface AiAssistantSheetProps {
  isOpen: boolean;
  isPhoneFrame?: boolean;
  lang: Language;
  variant: AbVariant;
  activeScreen: ScreenId;
  selectedTheme: ProblemTheme | null;
  profile: TeacherProfile | null;
  speakingId: string | null;
  loadingAudioId: string | null;
  initialPrompt?: string | null;
  onClearInitialPrompt?: () => void;
  onClose: () => void;
  onSpeak: (id: string, text: string, speakerGender?: 'female' | 'male') => void;
  onMessageSent: (charCount: number, themeId?: string) => void;
}

export function AiAssistantSheet({
  isOpen,
  isPhoneFrame = false,
  lang,
  variant,
  activeScreen,
  selectedTheme,
  profile,
  speakingId,
  loadingAudioId,
  initialPrompt = null,
  onClearInitialPrompt,
  onClose,
  onSpeak,
  onMessageSent,
}: AiAssistantSheetProps) {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDictating, setIsDictating] = useState(false);

  const listEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const speechRecAvailable = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const win = window as unknown as {
      SpeechRecognition?: unknown;
      webkitSpeechRecognition?: unknown;
    };
    return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending, isOpen]);

  useEffect(() => {
    if (isOpen && initialPrompt) {
      setInput(initialPrompt);
      onClearInitialPrompt?.();
    }
  }, [isOpen, initialPrompt, onClearInitialPrompt]);

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {
        // Ignore stop errors
      }
    };
  }, []);

  const quickPrompts = useMemo(() => {
    if (selectedTheme && (activeScreen === 'plan' || activeScreen === 'map')) {
      return lang === 'hi'
        ? [
            `"${selectedTheme.title.hi}" को 40 बच्चों के साथ कैसे संभालें?`,
            'बिना खर्च के 5-मिनट की गतिविधि बताएं',
            'अभिभावक से बात करने का आसान तरीका बताएं',
          ]
        : [
            `How to adapt "${selectedTheme.title.en}" for 40+ students?`,
            'Suggest a zero-cost 5-minute classroom activity',
            'How can I explain this gently to parents?',
          ];
    }
    return lang === 'hi'
      ? [
          'बच्चों को निजी स्कूल जाने से कैसे रोकें?',
          'DBT व आधार-बैंक सीडिंग की देरी कैसे सुलझाएं?',
          'अलग-अलग स्तर के बच्चों को एक साथ कैसे पढ़ाएं?',
        ]
      : [
          'How do we stop students shifting to private schools?',
          'How to resolve stalled DBT Aadhaar-bank seeding?',
          'How do I manage 3 reading levels in one classroom?',
        ];
  }, [activeScreen, lang, selectedTheme]);

  const sendMessage = async (rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed || isSending) return;

    setErrorMsg(null);
    const userMsg: AssistantMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: new Date().toISOString(),
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput('');
    setIsSending(true);
    onMessageSent(trimmed.length, selectedTheme?.id);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          lang,
          history: messages.slice(-8).map((m) => ({ role: m.role, text: m.text })),
          context: {
            activeScreen,
            variant,
            themeTitle: selectedTheme?.title[lang],
            themeIntro: selectedTheme?.planIntro[lang],
            teacherName: profile?.name,
            blockDistrict: profile?.blockDistrict,
          },
        }),
      });

      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok || !data.reply) {
        setErrorMsg(
          data.error ||
            (lang === 'hi'
              ? 'उत्तर प्राप्त करने में समस्या आई। कृपया पुनः प्रयास करें।'
              : 'Could not get a response right now. Please try again.')
        );
        return;
      }

      const modelMsg: AssistantMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: data.reply,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, modelMsg]);
    } catch {
      setErrorMsg(
        lang === 'hi'
          ? 'नेटवर्क या सर्वर से संपर्क नहीं हो पाया। कृपया पुनः प्रयास करें।'
          : 'Network error connecting to Saathi AI. Please retry.'
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  const toggleVoiceDictation = () => {
    if (!speechRecAvailable) return;

    if (isDictating) {
      try {
        recognitionRef.current?.stop();
      } catch {
        // Ignore
      }
      setIsDictating(false);
      return;
    }

    const win = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Rec = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!Rec) return;

    try {
      const recognition = new Rec();
      recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const transcript = event.results?.[0]?.[0]?.transcript?.trim();
        if (transcript) {
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };
      recognition.onerror = () => setIsDictating(false);
      recognition.onend = () => setIsDictating(false);

      recognitionRef.current = recognition;
      setIsDictating(true);
      recognition.start();
    } catch {
      setIsDictating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={
        isPhoneFrame
          ? 'absolute inset-0 z-50 bg-slate-950/45 flex items-end'
          : 'fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-[2px] flex items-end md:items-center md:justify-end md:p-5'
      }
      role="dialog"
      aria-modal="true"
      aria-label={lang === 'hi' ? 'साथी AI सहायक' : 'Saathi AI Assistant'}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={
          isPhoneFrame
            ? 'w-full h-[88%] bg-white rounded-t-3xl shadow-2xl border-t border-slate-200 flex flex-col overflow-hidden'
            : 'w-full md:max-w-md h-[86vh] md:h-[min(680px,90vh)] bg-white rounded-t-3xl md:rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden'
        }
      >
        {/* Sheet Drag Handle on Mobile */}
        <div className="md:hidden pt-2 pb-1 flex justify-center shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-300" />
        </div>

        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3 bg-white shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#EEF6F6] border border-[#B6D4D6] flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-[#0D5C63]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-900 truncate">
                {lang === 'hi' ? 'साथी AI सहायक' : 'Saathi AI Assistant'}
              </h2>
              <p className="text-[11px] text-slate-500 truncate">
                {selectedTheme
                  ? `${lang === 'hi' ? 'संदर्भ:' : 'Topic:'} ${selectedTheme.title[lang]}`
                  : lang === 'hi'
                  ? 'शिक्षक कक्षा सहयोगी · भारतीय हिंदी/अंग्रेज़ी आवाज़'
                  : 'Classroom helper · Indian accent audio ready'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {messages.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setMessages([]);
                  setErrorMsg(null);
                }}
                title={lang === 'hi' ? 'नई बातचीत' : 'New chat'}
                aria-label={lang === 'hi' ? 'नई बातचीत' : 'New chat'}
                className="min-h-[40px] min-w-[40px] rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label={lang === 'hi' ? 'बंद करें' : 'Close'}
              className="min-h-[40px] min-w-[40px] rounded-lg hover:bg-slate-100 text-slate-600 flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 bg-[#F6F7F9]">
          {messages.length === 0 ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#0D5C63]">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>
                    {lang === 'hi' ? 'आपका कक्षा सहायक तैयार है' : 'Your classroom helper is ready'}
                  </span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {lang === 'hi'
                    ? 'कक्षा की किसी भी चुनौती, गतिविधि या अभिभावक संवाद के बारे में सरल प्रश्न पूछें — आप हर उत्तर को भारतीय आवाज़ में सुन भी सकते हैं।'
                    : 'Ask anything about classroom activities, multi-level teaching, or parent outreach—and listen to any reply in Indian-accent audio.'}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500 px-0.5">
                  {lang === 'hi' ? '1-टैप में पूछें:' : 'Tap to ask:'}
                </p>
                <div className="space-y-2">
                  {quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => void sendMessage(prompt)}
                      className="w-full min-h-[44px] text-left px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:border-[#0D5C63] hover:bg-[#EEF6F6]/40 text-xs font-medium text-slate-800 transition-colors cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isModel = msg.role === 'model';
              const audioId = `ai-msg-${msg.id}`;
              const isLoadingVoice = loadingAudioId === audioId;
              const isSpeaking = speakingId === audioId;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isModel ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                      isModel
                        ? 'bg-white border border-slate-200 text-slate-800'
                        : 'bg-[#0D5C63] text-white'
                    }`}
                  >
                    {msg.text}

                    {isModel && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => onSpeak(audioId, msg.text, 'female')}
                          className={`min-h-[36px] px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                            isSpeaking
                              ? 'bg-[#EEF6F6] text-[#0D5C63]'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          {isLoadingVoice ? (
                            <Loader2 className="w-3.5 h-3.5 text-[#0D5C63] animate-spin" />
                          ) : isSpeaking ? (
                            <VolumeX className="w-3.5 h-3.5 text-[#0D5C63]" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5 text-[#0D5C63]" />
                          )}
                          <span>
                            {isLoadingVoice
                              ? lang === 'hi'
                                ? 'आवाज़ तैयार...'
                                : 'Loading...'
                              : isSpeaking
                              ? UI_COPY.stopListening[lang]
                              : lang === 'hi'
                              ? 'सुनें'
                              : 'Listen'}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {isSending && (
            <div className="flex items-start">
              <div className="rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-600 flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-[#0D5C63] animate-spin" />
                <span>{lang === 'hi' ? 'सहायक सोच रहा है...' : 'Thinking...'}</span>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-800 font-medium">
              {errorMsg}
            </div>
          )}

          <div ref={listEndRef} />
        </div>

        {/* Bottom Composer */}
        <form
          onSubmit={handleSubmit}
          className="p-3 border-t border-slate-200 bg-white flex items-center gap-2 shrink-0"
        >
          {speechRecAvailable && (
            <button
              type="button"
              onClick={toggleVoiceDictation}
              aria-label={
                isDictating
                  ? lang === 'hi'
                    ? 'माइक बंद करें'
                    : 'Stop dictation'
                  : lang === 'hi'
                  ? 'बोलकर लिखें'
                  : 'Voice input'
              }
              className={`min-h-[44px] min-w-[44px] rounded-xl border flex items-center justify-center cursor-pointer transition-colors shrink-0 ${
                isDictating
                  ? 'border-red-300 bg-red-50 text-red-700'
                  : 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700'
              }`}
            >
              {isDictating ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              lang === 'hi'
                ? 'अपना कक्षा प्रश्न लिखें या माइक से बोलें...'
                : 'Ask a classroom question...'
            }
            className="flex-1 min-h-[44px] rounded-xl border border-slate-300 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D5C63]"
          />

          <button
            type="submit"
            disabled={!input.trim() || isSending}
            aria-label={lang === 'hi' ? 'भेजें' : 'Send'}
            className={`min-h-[44px] min-w-[44px] px-3.5 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
              input.trim() && !isSending
                ? 'bg-[#0D5C63] hover:bg-[#09474D] text-white cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
