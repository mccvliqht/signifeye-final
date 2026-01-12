import { useEffect, useRef, useState } from 'react';

export const useSpeechSynthesis = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const lastSpokenTextRef = useRef<string>('');
  const synthRef = useRef<SpeechSynthesis | null>(null);
  
  // Ref to prevent the browser from deleting the speech object mid-sentence
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const synth = window.speechSynthesis;
      synthRef.current = synth;
      setIsSupported(true);

      const loadVoices = () => { synth.getVoices(); };
      if (typeof synth.onvoiceschanged !== 'undefined') {
        synth.onvoiceschanged = loadVoices;
      }
      loadVoices();
    }
  }, []);

  const speak = (text: string) => {
    if (!isSupported || !synthRef.current || !text || text.trim() === '') return;

    // 1. Prevent Spamming (Matches your sample project logic)
    if (text === lastSpokenTextRef.current) return;

    const synth = synthRef.current;

    // 2. Hardware Resume (Fixes Chrome/Safari silence)
    try {
      if (synth.paused) synth.resume();
    } catch {}

    // 3. Immediate Cancel
    synth.cancel();

    // 4. The "Safety Gap" for Alphabet Speed
    // This 100ms gap ensures the hardware is ready to switch from 'A' to 'B'.
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      // Select an English voice from your 22 loaded voices
      const voices = synth.getVoices();
      utterance.voice = voices.find(v => v.lang.startsWith('en')) || voices[0];

      utterance.rate = 1.1; // Balanced for both full words and fast letters
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsSpeaking(true);
        lastSpokenTextRef.current = text;
        console.log(`[SignifEye] Speaking: ${text}`);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        // Do NOT clear lastSpokenText here; let the recognition hook 
        // handle the 1.5s timeout instead.
      };

      utterance.onerror = (event) => {
        console.error('Speech error:', event);
        setIsSpeaking(false);
        lastSpokenTextRef.current = ''; 
      };

      synth.speak(utterance);
    }, 100); 
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

  return { isSupported, isSpeaking, speak, cancel, reset };
};