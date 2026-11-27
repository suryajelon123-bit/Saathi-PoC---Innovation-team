import { ArrowRight, Bot, CheckCircle2, Compass } from 'lucide-react';
import { useRef, useState } from 'react';
import { Language } from '../../types';
import { AudioListenButton } from '../AudioListenButton';
import { VoiceRecorderPanel } from '../VoiceRecorderPanel';

interface ShareChallengeScreenProps {
  lang: Language;
  speakingId: string | null;
  loadingAudioId?: string | null;
  onSpeak: (id: string, text: string) => void;
  onChallengeStarted: () => void;
  onVoiceRecordingStarted: () => void;
  onSubmitChallenge: (payload: {
    method: 'voice' | 'text';
    text: string;
    durationSec: number;
    topicKey: string;
    audioUrl?: string;
  }) => void;
  onGoToCommunity: () => void;
  onGoToMap: () => void;
  onOpenAssistant?: () => void;
}

const FOCUS_TOPICS = [
  { id: 'classroom-teaching', hi: 'कक्षा में पढ़ाने का तरीका', en: 'Teaching in the classroom' },
  { id: 'attendance-families', hi: 'बच्चों की उपस्थिति व परिवार', en: 'Attendance & talking to parents' },
  { id: 'materials-books', hi: 'पढ़ाने की सामग्री और किताबें', en: 'Books & learning materials' },
  { id: 'other-support', hi: 'स्कूल से जुड़ा कोई और काम', en: 'Something else at school' },
];

export function ShareChallengeScreen({
  lang,
  speakingId,
  loadingAudioId = null,
  onSpeak,
  onChallengeStarted,
  onVoiceRecordingStarted,
  onSubmitChallenge,
  onGoToCommunity,
  onGoToMap,
  onOpenAssistant,
}: ShareChallengeScreenProps) {
  const [selectedTopic, setSelectedTopic] = useState(FOCUS_TOPICS[0].id);
  const [submitted, setSubmitted] = useState(false);
  const startedRef = useRef(false);

  const ensureStarted = () => {
    if (!startedRef.current) {
      startedRef.current = true;
      onChallengeStarted();
    }
  };

  const promptSpeechText =
    lang === 'hi'
      ? 'आप अभी अपनी कक्षा या स्कूल में किस बात पर काम कर रहे हैं, और आपको किस तरह की मदद चाहिए? आप बोलकर या लिखकर अपने साथी शिक्षकों से पूछ सकते हैं।'
      : 'What are you working on in your classroom or school right now, and what kind of help would support you? Speak or type below to share with fellow teachers.';

  return (
    <section className="max-w-4xl mx-auto px-3.5 @xl:px-6 py-4 @3xl:py-10 space-y-5 @xl:space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 @xl:p-8 space-y-5 @xl:space-y-6">
        <div className="flex flex-col @xl:flex-row @xl:items-start justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs font-semibold text-[#0D5C63]">
              {lang === 'hi'
                ? 'आपकी कक्षा · आपका अनुभव · +30 अंक'
                : 'Your Classroom · Your Experience · +30 XP'}
            </p>
            <h1 className="text-xl @xl:text-3xl font-bold text-slate-900 leading-snug text-balance">
              {lang === 'hi'
                ? 'आप अभी किस बात पर काम कर रहे हैं, और कैसी मदद चाहिए?'
                : 'What are you working on, and what help do you need?'}
            </h1>
            <p className="text-sm @xl:text-base text-slate-600 leading-relaxed">
              {lang === 'hi'
                ? 'यह कोई शिकायत पेटी नहीं है — जब आप अपना अनुभव साझा करते हैं, तो आपके ब्लॉक के दूसरे शिक्षक भी अपने सुझाव दे पाते हैं।'
                : 'This is not a complaint box—sharing what you are trying helps fellow teachers suggest practical ideas.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start shrink-0">
            <AudioListenButton
              id="share-challenge-prompt"
              lang={lang}
              speakingId={speakingId}
              loadingAudioId={loadingAudioId}
              onClick={() => onSpeak('share-challenge-prompt', promptSpeechText)}
            />
            {onOpenAssistant && (
              <button
                type="button"
                onClick={onOpenAssistant}
                className="min-h-[44px] px-3.5 py-2 rounded-lg border border-[#B6D4D6] bg-[#EEF6F6] hover:bg-[#dfeeee] text-[#0D5C63] text-xs @xl:text-sm font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Bot className="w-4 h-4" />
                <span>{lang === 'hi' ? 'AI से सुझाव लें' : 'Ask AI'}</span>
              </button>
            )}
          </div>
        </div>

        {submitted ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 sm:p-6 space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-emerald-950">
                  {lang === 'hi'
                    ? '+30 अंक मिले! आपकी बात समुदाय में जुड़ गई'
                    : '+30 XP Earned! Shared with fellow teachers'}
                </h2>
                <p className="text-sm text-emerald-900">
                  {lang === 'hi'
                    ? 'अब दूसरे शिक्षक समुदाय में इसे देख और सुन सकते हैं और अपने सुझाव जोड़ सकते हैं।'
                    : 'Other teachers can now hear or read this in the Community feed and share helpful ideas.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={onGoToCommunity}
                className="min-h-[44px] px-5 py-2.5 rounded-lg bg-[#0D5C63] hover:bg-[#09474D] text-white text-sm font-semibold flex items-center gap-2 cursor-pointer"
              >
                <span>{lang === 'hi' ? 'समुदाय देखें' : 'View Community'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onGoToMap}
                className="min-h-[44px] px-4 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold flex items-center gap-2 cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                <span>{lang === 'hi' ? 'विषय सूची पर जाएं' : 'Back to Themes'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  startedRef.current = false;
                  setSubmitted(false);
                }}
                className="min-h-[44px] px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                {lang === 'hi' ? 'एक और बात साझा करें' : 'Share another note'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Optional Topic Area */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-800">
                {lang === 'hi' ? 'यह किस विषय से जुड़ा है? (वैकल्पिक)' : 'Which area is this about? (Optional)'}
              </p>
              <div className="grid grid-cols-1 @xl:grid-cols-2 gap-2.5">
                {FOCUS_TOPICS.map((topic) => (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => {
                      ensureStarted();
                      setSelectedTopic(topic.id);
                    }}
                    className={`min-h-[44px] px-4 py-2.5 rounded-xl border text-left text-sm font-medium transition-colors cursor-pointer ${
                      selectedTopic === topic.id
                        ? 'border-[#0D5C63] bg-[#EEF6F6] text-[#0D5C63] font-semibold'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {topic[lang]}
                  </button>
                ))}
              </div>
            </div>

            {/* Mic + Text Fallback */}
            <div
              onFocus={ensureStarted}
              onClick={ensureStarted}
            >
              <VoiceRecorderPanel
                lang={lang}
                mode="challenge"
                textPlaceholder={
                  lang === 'hi'
                    ? 'उदाहरण: मेरी कक्षा 2 के कुछ बच्चे घर की बोली बोलते हैं और किताब पढ़ने में झिझकते हैं — मुझे छोटे खेल का सुझाव चाहिए...'
                    : 'Example: Some Class 2 students hesitate to read textbook Hindi—I would love ideas for a simple 10-minute activity...'
                }
                submitLabel={lang === 'hi' ? 'साथी समुदाय में साझा करें (+30 अंक)' : 'Share with Fellow Teachers (+30 XP)'}
                onRecordingStarted={() => {
                  ensureStarted();
                  onVoiceRecordingStarted();
                }}
                onSubmit={(payload) => {
                  ensureStarted();
                  onSubmitChallenge({ ...payload, topicKey: selectedTopic });
                  setSubmitted(true);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
