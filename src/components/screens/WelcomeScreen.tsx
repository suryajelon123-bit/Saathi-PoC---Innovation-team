import {
  ArrowRight,
  Flame,
  Loader2,
  LogOut,
  MapPin,
  MessageSquare,
  Pause,
  Phone,
  Play,
  Radio,
  Trophy,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import { FormEvent, useState } from 'react';
import { HERO_CLASSROOM_IMAGE, INITIAL_COMMUNITY_STORIES } from '../../data/saathiContent';
import { AbVariant, Language, TeacherProfile } from '../../types';
import { AudioListenButton } from '../AudioListenButton';

interface WelcomeScreenProps {
  lang: Language;
  variant: AbVariant;
  profile: TeacherProfile | null;
  xp?: number;
  streakDays?: number;
  speakingId: string | null;
  loadingAudioId?: string | null;
  onSpeak: (id: string, text: string, gender?: 'female' | 'male') => void;
  onLoginSuccess: (profile: TeacherProfile) => void;
  onGoToMap: () => void;
  onGoToLeaderboard?: () => void;
  onVariantAPromptSent: (prompt: string) => void;
}

const QUICK_BLOCKS = [
  { id: 'barabanki', hi: 'बाराबंकी', en: 'Barabanki' },
  { id: 'sitapur', hi: 'सीतापुर', en: 'Sitapur' },
  { id: 'hardoi', hi: 'हरदोई', en: 'Hardoi' },
];

export function WelcomeScreen({
  lang,
  variant,
  profile,
  xp = 75,
  streakDays = 3,
  speakingId,
  loadingAudioId = null,
  onSpeak,
  onLoginSuccess,
  onGoToMap,
  onGoToLeaderboard,
  onVariantAPromptSent,
}: WelcomeScreenProps) {
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [teacherName, setTeacherName] = useState(profile?.name ?? '');
  const [blockDistrict, setBlockDistrict] = useState(profile?.blockDistrict ?? '');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [imageFailed, setImageFailed] = useState(false);

  // Variant A (live AI chat entry baseline) state
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

  const featuredStory = INITIAL_COMMUNITY_STORIES[0];
  const isPlayingFeatured = speakingId === 'welcome-featured-voice';
  const isLoadingFeatured = loadingAudioId === 'welcome-featured-voice';

  const loginSpeechText =
    lang === 'hi'
      ? 'साथी शिक्षक समुदाय में आपका स्वागत है। जुड़ने के लिए अपना दस अंकों का मोबाइल नंबर लिखें, अपना ज़िला चुनें, और शुरू करें बटन दबाएं।'
      : 'Welcome to Saathi Teacher Community. Enter your ten-digit mobile number, pick your district, and tap Continue to start.';

  const introSpeechText =
    lang === 'hi'
      ? 'साथी में आपका स्वागत है। यहाँ आप अन्य शिक्षकों की आवाज़ में उनके आज़माए हुए तरीके सुन सकते हैं, चार सप्ताह की आसान योजना देख सकते हैं, और अपने बैज व सम्मान पा सकते हैं।'
      : 'Welcome to Saathi. Here you can listen to fellow teachers, follow a 4-week step-by-step plan, and earn community recognition.';

  const handleSubmitLogin = (e: FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      setPhoneError(
        lang === 'hi'
          ? 'कृपया 10 अंकों का मोबाइल नंबर लिखें।'
          : 'Please enter a 10-digit mobile number.'
      );
      return;
    }
    setPhoneError(null);
    onLoginSuccess({
      phone: digits.slice(-10),
      name: teacherName.trim() || (lang === 'hi' ? 'शिक्षक साथी' : 'Teacher Saathi'),
      blockDistrict: blockDistrict.trim() || (lang === 'hi' ? 'बाराबंकी' : 'Barabanki'),
      loggedInAt: new Date().toISOString(),
    });
  };

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

  const handleVariantASend = (e: FormEvent) => {
    e.preventDefault();
    void sendVariantAMessage(chatInput);
  };

  // Variant A: Direct AI Chat Entry (Comparison Baseline)
  if (variant === 'A') {
    const starterChips =
      lang === 'hi'
        ? [
            'कक्षा 1–3 को पढ़ना कैसे सिखाएं?',
            'एक साथ 2–3 कक्षाओं को कैसे पढ़ाएं?',
            'स्कूल न आने वाले बच्चों को कैसे जोड़ें?',
          ]
        : [
            'How to build early reading in Class 1–3?',
            'How to teach 2–3 grades together?',
            'How to bring back absent children?',
          ];

    return (
      <section className="max-w-3xl mx-auto px-3.5 @xl:px-6 py-4 @3xl:py-10">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-slate-500">
              {lang === 'hi' ? 'चैट सहायता' : 'Direct Chat Help'}
            </p>
            <h1 className="text-xl @xl:text-3xl font-bold text-slate-900 mt-1 text-balance">
              {lang === 'hi'
                ? 'अपने स्कूल की किसी समस्या पर तुरंत मदद पाएं'
                : 'Get quick help for a challenge in your school'}
            </h1>
          </div>
          <AudioListenButton
            id="welcome-intro"
            lang={lang}
            speakingId={speakingId}
            loadingAudioId={loadingAudioId}
            onClick={() => onSpeak('welcome-intro', introSpeechText)}
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="p-4 @xl:p-6 space-y-3.5 min-h-[280px] bg-slate-50/60">
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
                        className="text-xs font-semibold text-[#0D5C63] hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        {isLoadingVoice ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : isPlaying ? (
                          <VolumeX className="w-3.5 h-3.5" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {isLoadingVoice
                            ? lang === 'hi'
                              ? 'आवाज़ तैयार...'
                              : 'Loading...'
                            : isPlaying
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
                    className="min-h-[38px] px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:border-[#0D5C63] text-xs font-medium text-slate-700 cursor-pointer transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleVariantASend} className="p-3.5 @xl:p-4 border-t border-slate-200 bg-white flex gap-2.5">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={
                lang === 'hi'
                  ? 'अपनी बात या सवाल यहाँ लिखें...'
                  : 'Type your school or classroom question here...'
              }
              className="flex-1 min-h-[46px] rounded-xl border border-slate-300 px-3.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D5C63]"
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || chatSending}
              className="min-h-[46px] px-4 @xl:px-5 rounded-xl bg-[#0D5C63] hover:bg-[#09474D] disabled:bg-slate-300 text-white text-sm font-semibold flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{lang === 'hi' ? 'भेजें' : 'Send'}</span>
            </button>
          </form>
        </div>
      </section>
    );
  }

  // SEPARATE LOGIN PAGE (shown first when arriving at Home before signing in)
  if (!profile) {
    return (
      <section className="max-w-lg mx-auto px-3.5 @xl:px-6 py-6 @3xl:py-14">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 @xl:p-8 shadow-sm space-y-6">
          {/* Login Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-[#0D5C63]">
                {lang === 'hi' ? 'साथी · शिक्षक लॉगिन' : 'Saathi · Teacher Sign In'}
              </p>
              <h1 className="text-2xl @xl:text-3xl font-bold text-slate-900 leading-snug">
                {lang === 'hi' ? 'अपने फ़ोन नंबर से जुड़ें' : 'Sign in with your phone'}
              </h1>
              <p className="text-xs @xl:text-sm text-slate-600 leading-relaxed">
                {lang === 'hi'
                  ? 'अन्य शिक्षकों के आज़माए तरीके सुनने, 4-सप्ताह पथ पूरा करने और अपने बैज सहेजने के लिए लॉगिन करें।'
                  : 'Sign in to explore teacher voices, follow 4-week plans, and save your points and badges.'}
              </p>
            </div>

            <AudioListenButton
              id="login-intro"
              lang={lang}
              speakingId={speakingId}
              loadingAudioId={loadingAudioId}
              onClick={() => onSpeak('login-intro', loginSpeechText)}
              className="shrink-0"
            />
          </div>

          <form onSubmit={handleSubmitLogin} className="space-y-4">
            <div>
              <label htmlFor="teacher-phone" className="block text-sm font-semibold text-slate-800 mb-1.5">
                {lang === 'hi' ? 'मोबाइल नंबर (10 अंक)' : 'Mobile Number (10 digits)'}
              </label>
              <div className="flex items-center rounded-xl border border-slate-300 bg-white focus-within:ring-2 focus-within:ring-[#0D5C63] overflow-hidden">
                <span className="px-3.5 py-3 text-sm font-semibold text-slate-600 bg-slate-50 border-r border-slate-200 font-mono-tabular">
                  +91
                </span>
                <input
                  id="teacher-phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/\D/g, ''));
                    if (phoneError) setPhoneError(null);
                  }}
                  placeholder="9876543210"
                  className="flex-1 min-h-[48px] px-3.5 text-base text-slate-900 font-mono-tabular focus:outline-none"
                />
              </div>
              {phoneError && (
                <p className="mt-1.5 text-xs font-medium text-[#B91C1C]" role="alert">
                  {phoneError}
                </p>
              )}
            </div>

            {/* Quick 1-tap district choices */}
            <div className="space-y-1.5">
              <span className="block text-xs font-semibold text-slate-700">
                {lang === 'hi' ? 'आपका ज़िला / ब्लॉक चुनें (वैकल्पिक)' : 'Select your District / Block (optional)'}
              </span>
              <div className="flex flex-wrap gap-2">
                {QUICK_BLOCKS.map((blk) => {
                  const label = blk[lang];
                  const active = blockDistrict === label;
                  return (
                    <button
                      key={blk.id}
                      type="button"
                      onClick={() => setBlockDistrict(label)}
                      className={`min-h-[38px] px-3.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                        active
                          ? 'border-[#0D5C63] bg-[#EEF6F6] text-[#0D5C63]'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 @xl:grid-cols-2 gap-3">
              <div>
                <label htmlFor="teacher-name" className="block text-xs font-medium text-slate-700 mb-1">
                  {lang === 'hi' ? 'आपका नाम (वैकल्पिक)' : 'Your Name (optional)'}
                </label>
                <input
                  id="teacher-name"
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder={lang === 'hi' ? 'जैसे: सुनीता शर्मा' : 'e.g. Sunita Sharma'}
                  className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D5C63]"
                />
              </div>
              <div>
                <label htmlFor="teacher-block" className="block text-xs font-medium text-slate-700 mb-1">
                  {lang === 'hi' ? 'या अपना ब्लॉक लिखें' : 'Or type block name'}
                </label>
                <input
                  id="teacher-block"
                  type="text"
                  value={blockDistrict}
                  onChange={(e) => setBlockDistrict(e.target.value)}
                  placeholder={lang === 'hi' ? 'जैसे: देवा ब्लॉक' : 'e.g. Dewa Block'}
                  className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D5C63]"
                />
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="submit"
                className="w-full min-h-[52px] px-5 py-3 rounded-2xl bg-[#0D5C63] hover:bg-[#09474D] text-white text-base font-bold border-b-4 border-[#073B40] active:translate-y-[2px] active:border-b-2 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>{lang === 'hi' ? 'लॉगिन करें और आगे बढ़ें' : 'Sign In & Continue'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setPhone('9811223344');
                  setTeacherName(lang === 'hi' ? 'प्रिया मिश्रा' : 'Priya Mishra');
                  setBlockDistrict(lang === 'hi' ? 'बाराबंकी' : 'Barabanki');
                  setPhoneError(null);
                }}
                className="w-full min-h-[40px] text-xs font-semibold text-slate-500 hover:text-[#0D5C63] cursor-pointer"
              >
                {lang === 'hi' ? 'जाँचने के लिए नमूना नंबर भरें' : 'Fill sample details to try'}
              </button>
            </div>
          </form>
        </div>
      </section>
    );
  }

  // SIGNED-IN HOME HUB (Hero + Today's Peer Voice + Next Step + Switch Account)
  return (
    <section className="max-w-6xl mx-auto px-3.5 @xl:px-6 py-4 @3xl:py-8 space-y-5">
      {/* Compact Signed-in Teacher Greeting Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 min-w-0">
          <div className="min-w-0">
            <p className="text-sm @xl:text-base font-bold text-slate-900 truncate">
              {lang === 'hi' ? `नमस्ते, ${profile.name}` : `Namaste, ${profile.name}`}
            </p>
            <p className="text-xs text-slate-500 font-mono-tabular truncate">
              +91 {profile.phone} · {profile.blockDistrict}
            </p>
          </div>
          <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
            <span className="text-xs font-bold text-[#D97706] flex items-center gap-1 tabular-nums">
              <Flame className="w-4 h-4 fill-[#F59E0B] text-[#D97706]" />
              {streakDays}d
            </span>
            <span className="text-xs font-bold text-[#0D5C63] flex items-center gap-1 tabular-nums">
              <Zap className="w-3.5 h-3.5 fill-[#0D5C63]" />
              {xp} {lang === 'hi' ? 'अंक' : 'XP'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setPhone('');
            setTeacherName('');
            onLoginSuccess({
              phone: '',
              name: '',
              blockDistrict: '',
              loggedInAt: '',
            });
          }}
          className="min-h-[38px] px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 flex items-center gap-1.5 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{lang === 'hi' ? 'लॉगिन बदलें' : 'Switch Login'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 @5xl:grid-cols-12 gap-5 @5xl:gap-7 items-stretch">
        {/* Left: Classroom Hero + 30-second Peer Voice Highlight */}
        <div className="@5xl:col-span-7 flex flex-col justify-between rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="relative h-40 @xl:h-56 @5xl:h-64 bg-slate-200 overflow-hidden">
            {!imageFailed ? (
              <img
                src={HERO_CLASSROOM_IMAGE}
                alt={
                  lang === 'hi'
                    ? 'सरकारी प्राथमिक विद्यालय में बच्चों के साथ पढ़ाती शिक्षिका'
                    : 'Primary school teacher working with students in a sunlit classroom'
                }
                referrerPolicy="no-referrer"
                onError={() => setImageFailed(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#0D5C63]/15 via-slate-100 to-amber-50 flex items-center justify-center p-4 text-center">
                <p className="text-sm font-medium text-slate-700">
                  {lang === 'hi' ? 'साथी · शिक्षक समुदाय मंच' : 'Saathi · Teacher Community Hub'}
                </p>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-900/20 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2">
              <p className="text-xs font-medium text-white/95 line-clamp-1">
                {lang === 'hi'
                  ? 'शिक्षकों के अनुभव · आसान उपाय'
                  : 'Teacher Stories · Simple Classroom Ideas'}
              </p>
              <AudioListenButton
                id="welcome-intro"
                lang={lang}
                speakingId={speakingId}
                loadingAudioId={loadingAudioId}
                onClick={() => onSpeak('welcome-intro', introSpeechText)}
                className="min-h-[40px] bg-white/95 hover:bg-white border-transparent shadow-sm text-xs"
              />
            </div>
          </div>

          <div className="p-4 @xl:p-7 space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              <h1 className="text-xl @xl:text-3xl font-bold tracking-tight text-slate-900 leading-snug text-balance">
                {lang === 'hi'
                  ? 'दूसरे शिक्षकों के आज़माए तरीके सुनें — और अपनी आवाज़ में अपना उपाय बताएं'
                  : 'Hear what worked for fellow teachers — and share your own way by voice'}
              </h1>
              <p className="text-xs @xl:text-base text-slate-600 leading-relaxed max-w-2xl">
                {lang === 'hi'
                  ? 'विषय सूची से अपनी कक्षा की चुनौती चुनें, सप्ताह 1 से 4 तक छोटे कदम पूरे करें और अपने ब्लॉक में सम्मान पाएं।'
                  : 'Choose a theme, step through Weeks 1 to 4, listen to peer audio clips, and climb your block recognition board.'}
              </p>
            </div>

            {/* Featured 30-sec Teacher Audio Card */}
            <div className="rounded-2xl border border-[#B6D4D6] bg-[#EEF6F6] p-3.5 @xl:p-4 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#0D5C63] flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {lang === 'hi' ? 'आज की साथी आवाज़ · 32 सेकंड' : 'Today’s Peer Voice · 32s'}
                  </span>
                </span>
                <span className="text-[11px] text-slate-600">{featuredStory.blockDistrict[lang]}</span>
              </div>

              <div className="flex flex-col @xl:flex-row @xl:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={featuredStory.avatarUrl}
                    alt={featuredStory.teacherName[lang]}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover border border-white shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {featuredStory.teacherName[lang]}
                    </p>
                    <p className="text-xs text-slate-700 line-clamp-1">{featuredStory.headline[lang]}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onSpeak(
                      'welcome-featured-voice',
                      `${featuredStory.headline[lang]}. ${featuredStory.body[lang]}`,
                      'female'
                    )
                  }
                  className="w-full @xl:w-auto min-h-[42px] px-4 py-2 rounded-xl bg-[#0D5C63] hover:bg-[#09474D] text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  {isLoadingFeatured ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : isPlayingFeatured ? (
                    <Pause className="w-3.5 h-3.5" />
                  ) : (
                    <Play className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {isLoadingFeatured
                      ? lang === 'hi'
                        ? 'आवाज़ तैयार...'
                        : 'Loading...'
                      : isPlayingFeatured
                      ? lang === 'hi'
                        ? 'रोकें'
                        : 'Stop'
                      : lang === 'hi'
                      ? 'सुनें (32s)'
                      : 'Listen (32s)'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Launch Card to 4-Week Path & Leaderboard */}
        <div className="@5xl:col-span-5 rounded-2xl border border-slate-200 bg-white p-4 @xl:p-7 flex flex-col justify-between gap-5">
          <div className="space-y-4">
            <p className="text-xs font-bold text-[#15803D]">
              {lang === 'hi' ? 'आज की शुरुआत' : 'TODAY’S NEXT STEP'}
            </p>
            <h2 className="text-xl @xl:text-2xl font-bold text-slate-900 leading-snug">
              {lang === 'hi'
                ? 'विषय चुनें और 4-सप्ताह का पथ शुरू करें'
                : 'Pick a theme and start your 4-week path'}
            </h2>

            <div className="space-y-3 pt-1">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 flex items-start gap-3">
                <span className="text-xs font-bold text-[#0D5C63] mt-0.5">01</span>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {lang === 'hi' ? 'विषय सूची से चुनें' : 'Choose a Theme'}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {lang === 'hi' ? '15 कक्षा व स्कूल विषयों में से अपना विषय चुनें' : '15 classroom & school topics'}
                  </p>
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 flex items-start gap-3">
                <span className="text-xs font-bold text-[#15803D] mt-0.5">02</span>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {lang === 'hi' ? 'सप्ताह 1 · 2 · 3 · 4 पूरा करें' : 'Complete Weeks 1 · 2 · 3 · 4'}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {lang === 'hi' ? 'हर सप्ताह पूरा करने पर +25 अंक पाएं' : 'Earn +25 XP for each week done'}
                  </p>
                </div>
              </div>
              <div className="rounded-xl bg-amber-50/70 border border-amber-200 p-3.5 flex items-start gap-3">
                <span className="text-xs font-bold text-[#B45309] mt-0.5">03</span>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {lang === 'hi' ? 'आवाज़ साझा करें व लीडरबोर्ड पर बढ़ें' : 'Share by Voice & Rise on Board'}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {lang === 'hi' ? '+50 अंक, बैज और ज़िला सम्मान पाएं' : '+50 XP, shields & district honor'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={onGoToMap}
              className="w-full min-h-[50px] px-5 py-3 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] text-white text-sm @xl:text-base font-bold border-b-4 border-[#14532D] active:translate-y-[2px] active:border-b-2 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>{lang === 'hi' ? 'विषय सूची खोलें' : 'Open Themes & 4-Week Path'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {onGoToLeaderboard && (
              <button
                type="button"
                onClick={onGoToLeaderboard}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-[#92400E] text-xs @xl:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Trophy className="w-4 h-4 text-[#B45309]" />
                <span>{lang === 'hi' ? 'लीडरबोर्ड व मेरे बैज देखें' : 'View Leaderboard & My Badges'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
