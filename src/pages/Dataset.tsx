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
      
      {/* Grid split: 60% Camera, 40% Practice Info */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[6fr_4fr] overflow-hidden">
        
        {/* LEFT: Camera Section */}
        {/* 🛠️ FIX: Added 'flex items-center justify-center' to prevent stretching */}
        <div className="relative border-r border-border bg-card min-h-[45vh] lg:min-h-0 flex items-center justify-center overflow-hidden">
          <div className="w-full h-full max-w-full max-h-full aspect-video">
             <CameraView mode="alphabet" />
          </div>
        </div>

        {/* RIGHT: Practice Instructions & Feedback */}
        <div className="flex flex-col overflow-y-auto bg-background">
          <PracticeMode />
        </div>
        
      </main>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
};

export default Practice;