import { Loader2, MessageSquare, Volume2, VolumeX } from 'lucide-react';
import { useState } from 'react';
import { Language, TeacherProfile } from '../../types';
import { AudioListenButton } from '../AudioListenButton';

interface WelcomeScreenProps {
  lang: Language;
  profile: TeacherProfile | null;
  speakingId: string | null;
  loadingAudioId?: string | null;
  onSpeak: (id: string, text: string, gender?: 'female' | 'male') => void;
  onVariantAPromptSent: (prompt: string) => void;
}

export function WelcomeScreen({
  lang,
  profile,
  speakingId,
  loadingAudioId = null,
  onSpeak,
  onVariantAPromptSent,
}: WelcomeScreenProps) {
  const [chatInput, setChatInput] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<{ sender: 'system' | 'teacher'; text: string }[]>([
    {
      sender: 'system',
      text:
        lang === 'hi'
          ? 'नमस्ते शिक्षक साथी! बताइए आज आपके स्कूल या कक्षा में किस बात में मदद चाहिए?'
          : 'Namaste teacher! Tell me what help you need in your school or classroom today.',
    },
  ]);

  const sendVariantAMessage = async (rawPrompt: string) => {
    const trimmed = rawPrompt.trim();
    if (!trimmed || chatSending) return;
    onVariantAPromptSent(trimmed);
    setChatError(null);
    const historyForApi = chatMessages.slice(-8).map((m) => ({
      role: m.sender === 'teacher' ? ('user' as const) : ('model' as const),
      text: m.text,
    }));
    setChatMessages((prev) => [...prev, { sender: 'teacher', text: trimmed }]);
    setChatInput('');
    setChatSending(true);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          lang,
          history: historyForApi,
          context: {
            activeScreen: 'welcome',
            variant: 'A',
            teacherName: profile?.name,
            blockDistrict: profile?.blockDistrict,
          },
        }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok || !data.reply) {
        setChatError(
          data.error ||
            (lang === 'hi'
              ? 'अभी जवाब नहीं मिल पाया। कृपया दोबारा कोशिश करें।'
              : 'Could not get a reply right now. Please try again.')
        );
        return;
      }
      setChatMessages((prev) => [...prev, { sender: 'system', text: data.reply! }]);
    } catch {
      setChatError(
        lang === 'hi'
          ? 'नेटवर्क में दिक्कत है। कृपया फिर से भेजें।'
          : 'Network error connecting to AI assistant.'
      );
    } finally {
      setChatSending(false);
    }
  };

  const starterChips =
    lang === 'hi'
      ? [
          'बच्चों को निजी स्कूल जाने से कैसे रोकें?',
          'DBT व आधार-बैंक सीडिंग की देरी कैसे सुलझाएं?',
          'एक साथ 2–3 कक्षाओं को कैसे पढ़ाएं?',
        ]
      : [
          'How do we stop students shifting to private schools?',
          'How to resolve stalled DBT Aadhaar-bank seeding?',
          'How to teach 2–3 grades together?',
        ];

  return (
    <section className="max-w-3xl mx-auto px-3.5 @xl:px-6 py-4 @3xl:py-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl @xl:text-2xl font-bold text-slate-900">
          {lang === 'hi'
            ? 'अपने स्कूल की समस्या पर तुरंत मदद पाएं'
            : 'Get quick help for your school'}
        </h1>
        <AudioListenButton
          id="var-a-intro"
          lang={lang}
          speakingId={speakingId}
          loadingAudioId={loadingAudioId}
          onClick={() => onSpeak('var-a-intro', chatMessages[0].text)}
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="p-4 space-y-3 min-h-[260px] bg-slate-50/60">
          {chatMessages.map((msg, idx) => {
            const msgAudioId = `var-a-msg-${idx}`;
            const isPlaying = speakingId === msgAudioId;
            const isLoadingVoice = loadingAudioId === msgAudioId;
            return (
              <div
                key={idx}
                className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                  msg.sender === 'teacher'
                    ? 'ml-auto bg-[#0D5C63] text-white'
                    : 'bg-white border border-slate-200 text-slate-800'
                }`}
              >
                {msg.text}
                {msg.sender === 'system' && (
                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => onSpeak(msgAudioId, msg.text)}
                      className="text-xs font-semibold text-[#0D5C63] inline-flex items-center gap-1 cursor-pointer"
                    >
                      {isLoadingVoice ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : isPlaying ? (
                        <VolumeX className="w-3.5 h-3.5" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {isPlaying
                          ? lang === 'hi'
                            ? 'रोकें'
                            : 'Stop'
                          : lang === 'hi'
                          ? 'सुनें'
                          : 'Listen'}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {chatSending && (
            <div className="max-w-[75%] rounded-2xl bg-white border border-slate-200 px-4 py-2.5 text-xs font-medium text-slate-600 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-[#0D5C63] animate-spin" />
              <span>{lang === 'hi' ? 'जवाब लिखा जा रहा है...' : 'Writing reply...'}</span>
            </div>
          )}

          {chatError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-medium text-red-800">
              {chatError}
            </div>
          )}

          {chatMessages.length === 1 && !chatSending && (
            <div className="flex flex-wrap gap-2 pt-2">
              {starterChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => void sendVariantAMessage(chip)}
                  className="min-h-[38px] px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-700 cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void sendVariantAMessage(chatInput);
          }}
          className="p-3.5 border-t border-slate-200 bg-white flex gap-2"
        >
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder={lang === 'hi' ? 'सवाल लिखें...' : 'Type your question...'}
            className="flex-1 min-h-[46px] rounded-xl border border-slate-300 px-3.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D5C63]"
          />
          <button
            type="submit"
            disabled={!chatInput.trim() || chatSending}
            className="min-h-[46px] px-4 rounded-xl bg-[#0D5C63] hover:bg-[#09474D] disabled:bg-slate-300 text-white text-sm font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{lang === 'hi' ? 'भेजें' : 'Send'}</span>
          </button>
        </form>
      </div>
    </section>
  );
}
