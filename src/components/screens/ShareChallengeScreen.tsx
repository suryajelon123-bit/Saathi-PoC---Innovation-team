import { Bot, CheckCircle2, HelpCircle, Mic, Trophy } from 'lucide-react';
import { useRef, useState } from 'react';
import { PROBLEM_THEMES } from '../../data/saathiContent';
import { Language, ProblemTheme } from '../../types';
import { AudioListenButton } from '../AudioListenButton';
import { VoiceRecorderPanel } from '../VoiceRecorderPanel';

interface ShareChallengeScreenProps {
  lang: Language;
  selectedTheme: ProblemTheme;
  speakingId: string | null;
  loadingAudioId?: string | null;
  onSpeak: (id: string, text: string) => void;
  onChallengeStarted: () => void;
  onVoiceRecordingStarted: () => void;
  onSolveWithVoice: (payload: {
    theme: ProblemTheme;
    method: 'voice' | 'text';
    text: string;
    durationSec: number;
    audioUrl?: string;
  }) => void;
  onOneTapSolved: (theme: ProblemTheme) => void;
  onSubmitChallenge: (payload: {
    method: 'voice' | 'text';
    text: string;
    durationSec: number;
    topicKey: string;
    audioUrl?: string;
  }) => void;
  onOpenAssistant?: () => void;
}

export function ShareChallengeScreen({
  lang,
  selectedTheme,
  speakingId,
  loadingAudioId = null,
  onSpeak,
  onChallengeStarted,
  onVoiceRecordingStarted,
  onSolveWithVoice,
  onOneTapSolved,
  onSubmitChallenge,
  onOpenAssistant,
}: ShareChallengeScreenProps) {
  const [voiceMode, setVoiceMode] = useState<'solve' | 'ask'>('solve');
  const [chosenThemeId, setChosenThemeId] = useState<string>(selectedTheme.id);
  const [askSubmitted, setAskSubmitted] = useState(false);
  const startedRef = useRef(false);

  const chosenTheme =
    PROBLEM_THEMES.find((t) => t.id === chosenThemeId) ?? selectedTheme;

  const ensureStarted = () => {
    if (!startedRef.current) {
      startedRef.current = true;
      onChallengeStarted();
    }
  };

  const voiceHubAudio =
    lang === 'hi'
      ? 'यहाँ आप बोलकर बता सकते हैं कि आपने कौन-सी समस्या हल की, या किसी बात पर साथियों से सलाह पूछ सकते हैं।'
      : 'Here you can speak to share a problem you solved, or ask fellow teachers for help.';

  return (
    <section className="max-w-3xl mx-auto px-3.5 @xl:px-6 pt-3 pb-8 space-y-4">
      {/* Header with Voice Listen */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg @xl:text-2xl font-bold text-slate-900">
            {lang === 'hi' ? 'आवाज़ केंद्र · बोलकर बताएं' : 'Voice Hub · Speak & Solve'}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            {lang === 'hi'
              ? 'बोलना लिखने से तेज़ है — अपनी भाषा में बताएं'
              : 'Speaking is faster than typing — use your own words'}
          </p>
        </div>

        <AudioListenButton
          id="voice-hub-intro"
          lang={lang}
          speakingId={speakingId}
          loadingAudioId={loadingAudioId}
          onClick={() => onSpeak('voice-hub-intro', voiceHubAudio)}
          className="shrink-0"
        />
      </div>

      {/* Mode Switch: I Solved This vs Ask Peers */}
      <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-200/80">
        <button
          type="button"
          onClick={() => {
            setVoiceMode('solve');
            setAskSubmitted(false);
          }}
          className={`min-h-[44px] px-3 py-2 rounded-lg text-xs @xl:text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
            voiceMode === 'solve' ? 'bg-white text-[#15803D] shadow-sm' : 'text-slate-600'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>{lang === 'hi' ? 'मैंने हल किया' : 'I Solved This'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setVoiceMode('ask');
            setAskSubmitted(false);
          }}
          className={`min-h-[44px] px-3 py-2 rounded-lg text-xs @xl:text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
            voiceMode === 'ask' ? 'bg-white text-[#0D5C63] shadow-sm' : 'text-slate-600'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>{lang === 'hi' ? 'सवाल पूछें' : 'Ask Peers'}</span>
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 @xl:p-6 space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="voice-theme-select" className="block text-xs font-bold text-slate-700">
            {lang === 'hi' ? 'किस समस्या से जुड़ा है?' : 'Which problem is this about?'}
          </label>
          <select
            id="voice-theme-select"
            value={chosenTheme.id}
            onChange={(e) => setChosenThemeId(e.target.value)}
            className="w-full min-h-[44px] rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-900"
          >
            {PROBLEM_THEMES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title[lang]}
              </option>
            ))}
          </select>
        </div>

        {voiceMode === 'solve' ? (
          <div className="space-y-4">
            {/* Instant 1-tap Solve Button */}
            <button
              type="button"
              onClick={() => onOneTapSolved(chosenTheme)}
              className="w-full min-h-[50px] px-5 py-3 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-bold border-b-4 border-[#14532D] active:translate-y-[2px] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trophy className="w-5 h-5" />
              <span>
                {lang === 'hi'
                  ? '1-टैप: मैंने इसे हल किया (+50 अंक व WhatsApp)'
                  : '1-Tap: I Solved This (+50 XP & WhatsApp)'}
              </span>
            </button>

            <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-400">
              <div className="h-px flex-1 bg-slate-200" />
              <span>{lang === 'hi' ? 'या अपनी आवाज़ में तरीका जोड़ें' : 'OR RECORD YOUR VOICE TIP'}</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <VoiceRecorderPanel
              lang={lang}
              mode="solution"
              textPlaceholder={
                lang === 'hi'
                  ? 'या छोटे शब्दों में लिखें कि आपने क्या किया...'
                  : 'Or type a short tip on what worked...'
              }
              submitLabel={lang === 'hi' ? 'आवाज़ से हल साझा करें (+50)' : 'Share Voice Win (+50 XP)'}
              onRecordingStarted={onVoiceRecordingStarted}
              onSubmit={(payload) => onSolveWithVoice({ ...payload, theme: chosenTheme })}
            />
          </div>
        ) : askSubmitted ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-[#15803D] mx-auto" />
            <p className="text-sm font-bold text-slate-900">
              {lang === 'hi'
                ? '+30 अंक! आपका सवाल साथी शिक्षकों तक पहुँच गया है।'
                : '+30 XP! Your question is shared with peers.'}
            </p>
            <button
              type="button"
              onClick={() => {
                startedRef.current = false;
                setAskSubmitted(false);
              }}
              className="min-h-[40px] px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 cursor-pointer"
            >
              {lang === 'hi' ? 'एक और बात रखें' : 'Ask another'}
            </button>
          </div>
        ) : (
          <div onFocus={ensureStarted} onClick={ensureStarted}>
            <VoiceRecorderPanel
              lang={lang}
              mode="challenge"
              textPlaceholder={
                lang === 'hi'
                  ? 'उदाहरण: मेरी कक्षा में बच्चे कम बोलते हैं, कोई छोटा खेल बताएं...'
                  : 'Example: Quiet students hesitate to speak, any quick game ideas?'
              }
              submitLabel={lang === 'hi' ? 'साथियों से पूछें (+30 अंक)' : 'Ask Community (+30 XP)'}
              onRecordingStarted={() => {
                ensureStarted();
                onVoiceRecordingStarted();
              }}
              onSubmit={(payload) => {
                ensureStarted();
                onSubmitChallenge({ ...payload, topicKey: chosenTheme.id });
                setAskSubmitted(true);
              }}
            />
          </div>
        )}

        {onOpenAssistant && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            <span className="text-xs text-slate-500 flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-[#0D5C63]" />
              {lang === 'hi' ? 'तुरंत सुझाव चाहिए?' : 'Need instant ideas?'}
            </span>
            <button
              type="button"
              onClick={onOpenAssistant}
              className="min-h-[38px] px-3 py-1.5 rounded-lg bg-[#EEF6F6] text-[#0D5C63] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'साथी AI से पूछें' : 'Ask Saathi AI'}</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
