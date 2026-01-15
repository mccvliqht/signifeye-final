import { useState } from 'react';
import TopBar from '@/components/TopBar';
import CameraView from '@/components/CameraView';
import OutputPanel from '@/components/OutputPanel';
import SettingsModal from '@/components/SettingsModal';

const Index = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <TopBar onSettingsClick={() => setSettingsOpen(true)} />
      
      {/* 📱 Mobile: Vertical Stack | 💻 Desktop: Side-by-Side (2/3 Camera, 1/3 Output) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* 🛠️ CAMERA SECTION: Set to 60vh on mobile to prevent the "short camera" look */}
        <div className="h-[60vh] lg:h-full lg:w-2/3 overflow-hidden border-b lg:border-b-0 lg:border-r border-border/40">
          <CameraView />
        </div>
        
        {/* 🛠️ OUTPUT SECTION: Takes up the remaining space (flex-1) below the camera on mobile */}
        <div className="flex-1 lg:h-full lg:w-1/3 overflow-auto bg-muted/10">
          <OutputPanel />
        </div>
      </div>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
};

export default Index;