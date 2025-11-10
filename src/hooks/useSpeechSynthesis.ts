import { useEffect, useRef, useState } from 'react';

export const useSpeechSynthesis = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const lastSpokenTextRef = useRef<string>('');
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const synth = window.speechSynthesis;
      synthRef.current = synth;
      setIsSupported(true);
      // Preload voices; some browsers require touching getVoices()
      const loadVoices = () => {
        synth.getVoices();
      };
      if (typeof synth.onvoiceschanged !== 'undefined') {
        synth.onvoiceschanged = loadVoices;
      }
      loadVoices();
    }
  }, []);

  const speak = (text: string, opts?: { lang?: string; voice?: string }) => {
    if (!isSupported || !synthRef.current || !text) return;

    // Only speak if the text is different from what was last spoken
    if (text === lastSpokenTextRef.current) return;

    const synth = synthRef.current;

    // Try to resume if paused (iOS/Safari quirks)
    try {
      if (synth.paused) synth.resume();
    } catch {}

    // Cancel any ongoing speech
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    if (opts?.lang) utterance.lang = opts.lang;

    if (opts?.voice) {
      const v = synth.getVoices().find((vv) => vv.name === opts.voice || vv.lang === opts.voice);
      if (v) utterance.voice = v;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      lastSpokenTextRef.current = text;
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
    };

    synth.speak(utterance);
  };

  const cancel = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const reset = () => {
    lastSpokenTextRef.current = '';
    cancel();
  };

  return {
    isSupported,
    isSpeaking,
    speak,
    cancel,
    reset
  };
};
