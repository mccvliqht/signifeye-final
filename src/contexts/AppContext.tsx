import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'ASL' | 'FSL';
export type OutputMode = 'text' | 'speech';
export type Theme = 'light' | 'dark';

interface AppSettings {
  language: Language;
  outputMode: OutputMode;
  theme: Theme;
  fontSize: number;
}

interface AppContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  isRecognizing: boolean;
  setIsRecognizing: (value: boolean) => void;
  outputText: string;
  setOutputText: (value: string) => void;
  clearOutput: () => void;
  mirrorCamera: boolean;
  toggleMirrorCamera: () => void;
  installPrompt: any;
  setInstallPrompt: (value: any) => void;
  isAppInstalled: boolean; // 👇 Added this helper
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'signifeye-app-settings';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const savedSettings = localStorage.getItem(STORAGE_KEY);
    return savedSettings ? JSON.parse(savedSettings) : {
      language: 'ASL',
      outputMode: 'text',
      theme: 'dark',
      fontSize: 16,
    };
  });

  const [isRecognizing, setIsRecognizing] = useState(false);
  const [outputText, setOutputText] = useState('');
  const [mirrorCamera, setMirrorCamera] = useState(true);
  
  // PWA Install State
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false); // 👇 Track installation status

  // 1. 👇 DETECT STANDALONE MODE (Check if running as App)
  useEffect(() => {
    const checkStandalone = () => {
      // Check if running in standalone mode (Chromium / iOS)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                           (window.navigator as any).standalone === true;
      setIsAppInstalled(!!isStandalone);
    };

    checkStandalone();
    
    // Listen for changes
    window.matchMedia('(display-mode: standalone)').addEventListener('change', checkStandalone);
  }, []);

  // 2. 👇 PWA INSTALL LISTENER
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault(); // Stop the default mini-infobar
      setInstallPrompt(e); // Store event globally
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // If user successfully installs, update state immediately
    window.addEventListener('appinstalled', () => {
      setInstallPrompt(null);
      setIsAppInstalled(true);
    });

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const clearOutput = () => {
    setOutputText('');
  };

  const toggleMirrorCamera = () => {
    setMirrorCamera((prev) => !prev);
  };

  return (
    <AppContext.Provider
      value={{
        settings,
        updateSettings,
        isRecognizing,
        setIsRecognizing,
        outputText,
        setOutputText,
        clearOutput,
        mirrorCamera,
        toggleMirrorCamera,
        // 👇 MAGIC LOGIC: If app is installed/standalone, force installPrompt to null.
        // This automatically hides the button in your Landing Page/About Page.
        installPrompt: isAppInstalled ? null : installPrompt, 
        setInstallPrompt,
        isAppInstalled,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};