import { useEffect, useRef, useState } from 'react';

export const useSpeechSynthesis = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const lastSpokenTextRef = useRef<string>('');
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const synth = window.speechSynthesis;
      synthRef.current = synth;
      setIsSupported(true);

      const loadVoices = () => { 
          const available = synth.getVoices();
          console.log("Available Voices:", available.map(v => v.name)); // Check natin sa console kung meron ka
      };
      
      if (typeof synth.onvoiceschanged !== 'undefined') {
        synth.onvoiceschanged = loadVoices;
      }
      loadVoices();
    }
  }, []);

  const speak = (text: string, language: 'ASL' | 'FSL' = 'ASL') => {
    if (!isSupported || !synthRef.current || !text || text.trim() === '') return;
    if (text === lastSpokenTextRef.current) return;

    const synth = synthRef.current;
    try { if (synth.paused) synth.resume(); } catch {}
    synth.cancel();

    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;
      const voices = synth.getVoices();

      let targetVoice = null;

      if (language === 'FSL') {
          utterance.lang = 'tl-PH'; // Set Language Code
          
          // --- UPDATED SMART SEARCH FOR PINOY ACCENT ---
          // 1. Priority: "Google Filipino" (Best sa Chrome)
          // 2. Priority: "Microsoft Angelo" or "Blessica" (Best sa Edge/Windows)
          // 3. Fallback: Any voice with 'fil' or 'tl' in the language code
          targetVoice = voices.find(v => v.name.includes('Google Filipino')) ||
                        voices.find(v => v.name.includes('Angelo') || v.name.includes('Blessica')) ||
                        voices.find(v => v.lang.includes('fil') || v.lang.includes('tl'));
          
          if (!targetVoice) {
              console.warn("Walang Filipino voice na nahanap. Using default.");
          }
      } else {
          // English (ASL)
          utterance.lang = 'en-US';
          targetVoice = voices.find(v => v.lang.startsWith('en-US')) || 
                        voices.find(v => v.lang.startsWith('en'));
      }

      utterance.voice = targetVoice || voices[0];
      utterance.rate = 1.0; 
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsSpeaking(true);
        lastSpokenTextRef.current = text;
        console.log(`[SignifEye] Speaking (${language}) using voice: ${utterance.voice?.name}`);
      };

      utterance.onend = () => { setIsSpeaking(false); };
      utterance.onerror = () => { setIsSpeaking(false); lastSpokenTextRef.current = ''; };

      synth.speak(utterance);
    }, 100); 
  };

  const cancel = () => { if (synthRef.current) { synthRef.current.cancel(); setIsSpeaking(false); }};
  const reset = () => { lastSpokenTextRef.current = ''; cancel(); };

  return { isSupported, isSpeaking, speak, cancel, reset };
};