import { useState } from 'react';
import TopBar from '@/components/TopBar';
import PracticeMode from '@/components/PracticeMode';
import CameraView from '@/components/CameraView';
import SettingsModal from '@/components/SettingsModal';

const Practice = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-hidden">
      <TopBar onSettingsClick={() => setSettingsOpen(true)} />
      
      {/* 🛠️ Widen Camera: Changed grid-cols-2 to a 70/30 split using 7fr and 3fr */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[6fr_4fr] overflow-hidden">
        
        {/* LEFT: Camera Section (Now takes up ~70%) */}
        <div className="relative border-r border-border bg-card min-h-[45vh] lg:min-h-0">
          <CameraView mode="alphabet" />
        </div>

        {/* RIGHT: Practice Instructions & Feedback (Now takes up ~30%) */}
        <div className="flex flex-col overflow-y-auto bg-background">
          <PracticeMode />
        </div>
        
      </main>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
};

export default Practice;