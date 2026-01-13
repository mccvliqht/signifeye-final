import { useState } from 'react';
import TopBar from '@/components/TopBar';
import PracticeMode from '@/components/PracticeMode';
import CameraView from '@/components/CameraView';
import SettingsModal from '@/components/SettingsModal';
import { AppProvider } from '@/contexts/AppContext';

const Practice = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
      <div className="min-h-screen flex flex-col bg-background">
        <TopBar onSettingsClick={() => setSettingsOpen(true)} />
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-2">
          <CameraView />
          <PracticeMode />
        </main>
        <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      </div>
  );
};

export default Practice;
