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
  // 🛠️ Added for persistent PWA installation
  installPrompt: any;
  setInstallPrompt: (value: any) => void;
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
  
  // 🛠️ Global state for the installation prompt
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  // 🛠️ Persistent listener for PWA installation
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault(); // Stop the default mini-infobar
      setInstallPrompt(e); // Store event globally so it survives tab switches
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
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
        installPrompt,    // 🛠️ Expose to App
        setInstallPrompt, // 🛠️ Expose to App
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