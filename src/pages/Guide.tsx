import { useState } from 'react';
import TopBar from '@/components/TopBar';
import AlphabetGuide from '@/components/AlphabetGuide';
import SettingsModal from '@/components/SettingsModal';
import { AppProvider } from '@/contexts/AppContext';

const Guide = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
      <div className="min-h-screen flex flex-col bg-background">
        <TopBar onSettingsClick={() => setSettingsOpen(true)} />
        <main className="flex-1">
          <AlphabetGuide />
        </main>
        <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      </div>
  );
};

export default Guide;
