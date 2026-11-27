import { useCallback, useEffect, useRef, useState } from 'react';
import { Language } from '../types';

export type SpeakerGender = 'female' | 'male';

const INDIAN_VOICE_NAME_HINTS = [
  'india',
  'indian',
  'hindi',
  'rishi',
  'veena',
  'lekha',
  'swara',
  'madhur',
  'neerja',
  'prabhat',
  'heera',
  'ravi',
  'kiran',
  'ananya',
  'aarav',
];

function pickIndianBrowserVoice(
  voices: SpeechSynthesisVoice[],
  lang: Language,
  gender: SpeakerGender
): SpeechSynthesisVoice | undefined {
  const targetLangPrefix = lang === 'hi' ? 'hi' : 'en-in';

  const exactIndian = voices.filter((v) => {
    const normalized = v.lang.toLowerCase().replace('_', '-');
    return lang === 'hi'
      ? normalized === 'hi-in' || normalized.startsWith('hi')
      : normalized === 'en-in';
  });

  if (exactIndian.length > 0) {
    if (gender === 'male') {
      const maleMatch = exactIndian.find((v) =>
        /rishi|madhur|prabhat|ravi|aarav|male/i.test(v.name)
      );
      if (maleMatch) return maleMatch;
    } else {
      const femaleMatch = exactIndian.find((v) =>
        /veena|lekha|swara|neerja|heera|ananya|female/i.test(v.name)
      );
      if (femaleMatch) return femaleMatch;
    }
    return exactIndian[0];
  }

  return voices.find((v) => {
    const lower = v.name.toLowerCase();
    const langLower = v.lang.toLowerCase();
    return (
      langLower.startsWith(targetLangPrefix) ||
      INDIAN_VOICE_NAME_HINTS.some((hint) => lower.includes(hint))
    );
  });
}

export function useSpeech() {
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [loadingAudioId, setLoadingAudioId] = useState<string | null>(null);

  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const audioCacheRef = useRef<Map<string, string>>(new Map());
  const fallbackTimerRef = useRef<number | null>(null);
  const activeRequestIdRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    activeRequestIdRef.current += 1;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    if (fallbackTimerRef.current !== null) {
      window.clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }

    if (audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current.currentTime = 0;
      audioElRef.current = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore synthesis cancel errors
      }
    }

    setLoadingAudioId(null);
    setSpeakingId(null);
  }, []);

  const speakWithIndianBrowserFallback = useCallback(
    (id: string, text: string, lang: Language, gender: SpeakerGender, requestToken: number) => {
      if (activeRequestIdRef.current !== requestToken) return;

      const estimatedMs = Math.min(18000, Math.max(2500, text.length * 60));
      setLoadingAudioId(null);
      setSpeakingId(id);

      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
          utterance.rate = lang === 'hi' ? 0.94 : 0.95;

          const voices = window.speechSynthesis.getVoices();
          const indianVoice = pickIndianBrowserVoice(voices, lang, gender);
          if (indianVoice) {
            utterance.voice = indianVoice;
            utterance.lang = indianVoice.lang;
          }

          let settled = false;
          utterance.onend = () => {
            if (!settled) {
              settled = true;
              setSpeakingId((curr) => (curr === id ? null : curr));
            }
          };
          utterance.onerror = () => {
            if (!settled) {
              settled = true;
              fallbackTimerRef.current = window.setTimeout(() => {
                setSpeakingId((curr) => (curr === id ? null : curr));
              }, 2200);
            }
          };

          window.speechSynthesis.speak(utterance);

          fallbackTimerRef.current = window.setTimeout(() => {
            if (!settled) {
              settled = true;
              setSpeakingId((curr) => (curr === id ? null : curr));
            }
          }, estimatedMs + 2500);
          return;
        } catch {
          // Fall through to visual timer
        }
      }

      fallbackTimerRef.current = window.setTimeout(() => {
        setSpeakingId((curr) => (curr === id ? null : curr));
      }, estimatedMs);
    },
    []
  );

  const speak = useCallback(
    async (
      id: string,
      text: string,
      lang: Language,
      speakerGender: SpeakerGender = 'female'
    ) => {
      if (speakingId === id || loadingAudioId === id) {
        stop();
        return;
      }

      stop();
      const requestToken = activeRequestIdRef.current;
      const cacheKey = `${lang}:${speakerGender}:${text.slice(0, 1500)}`;

      const playAudioUrl = (url: string) => {
        if (activeRequestIdRef.current !== requestToken) return;
        const audio = new Audio(url);
        audioElRef.current = audio;
        setLoadingAudioId(null);
        setSpeakingId(id);

        audio.onended = () => {
          setSpeakingId((curr) => (curr === id ? null : curr));
          if (audioElRef.current === audio) {
            audioElRef.current = null;
          }
        };
        audio.onerror = () => {
          if (audioElRef.current === audio) {
            audioElRef.current = null;
          }
          speakWithIndianBrowserFallback(id, text, lang, speakerGender, requestToken);
        };
        audio.play().catch(() => {
          speakWithIndianBrowserFallback(id, text, lang, speakerGender, requestToken);
        });
      };

      const cachedUrl = audioCacheRef.current.get(cacheKey);
      if (cachedUrl) {
        playAudioUrl(cachedUrl);
        return;
      }

      // Offline / weak-network fast path: immediately use local Indian speech synthesis
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        speakWithIndianBrowserFallback(id, text, lang, speakerGender, requestToken);
        return;
      }

      setLoadingAudioId(id);
      const controller = new AbortController();
      abortControllerRef.current = controller;
      const timeoutId = window.setTimeout(() => controller.abort(), 2500);

      try {
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, lang, speakerGender }),
          signal: controller.signal,
        });
        window.clearTimeout(timeoutId);

        if (activeRequestIdRef.current !== requestToken) return;

        if (!res.ok) {
          speakWithIndianBrowserFallback(id, text, lang, speakerGender, requestToken);
          return;
        }

        const data = (await res.json()) as { audioBase64?: string; mimeType?: string };
        if (activeRequestIdRef.current !== requestToken) return;

        if (data.audioBase64) {
          const byteChars = atob(data.audioBase64);
          const byteArray = new Uint8Array(byteChars.length);
          for (let i = 0; i < byteChars.length; i++) {
            byteArray[i] = byteChars.charCodeAt(i);
          }
          const blob = new Blob([byteArray], { type: data.mimeType || 'audio/wav' });
          const objectUrl = URL.createObjectURL(blob);
          audioCacheRef.current.set(cacheKey, objectUrl);
          playAudioUrl(objectUrl);
          return;
        }

        speakWithIndianBrowserFallback(id, text, lang, speakerGender, requestToken);
      } catch {
        window.clearTimeout(timeoutId);
        speakWithIndianBrowserFallback(id, text, lang, speakerGender, requestToken);
      }
    },
    [loadingAudioId, speakingId, speakWithIndianBrowserFallback, stop]
  );

  useEffect(() => {
    const cache = audioCacheRef.current;
    return () => {
      stop();
      cache.forEach((url) => URL.revokeObjectURL(url));
      cache.clear();
    };
  }, [stop]);

  return { speakingId, loadingAudioId, speak, stop };
}
