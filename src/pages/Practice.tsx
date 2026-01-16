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
      
      {/* 🚀 Split the screen: 60/40 on large screens, stack on mobile */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[6fr_4fr] overflow-hidden">
        
        {/* LEFT: Camera Section */}
        {/* 🛠️ FIX: Reduced min-h-[45vh] to [35vh] for a shorter mobile camera height */}
        <div className="relative border-b lg:border-r border-border bg-card h-[45vh] lg:h-full overflow-hidden">
          <CameraView />
        </div>

        {/* RIGHT: Practice Instructions & Feedback */}
        <div className="flex flex-col overflow-y-auto bg-background h-full">
          <PracticeMode />
        </div>
        
      </main>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
};

export default Practice;