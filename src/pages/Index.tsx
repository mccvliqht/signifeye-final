import { useState, useEffect } from 'react';
import TopBar from '@/components/TopBar';
import CameraView from '@/components/CameraView';
import OutputPanel from '@/components/OutputPanel';
import SettingsModal from '@/components/SettingsModal';
import { useApp } from '@/contexts/AppContext'; // 1. Import Context

const Index = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // 2. Kunin ang setters mula sa Context
  const { setIsRecognizing, setOutputText } = useApp();

  // 3. CLEANUP MAGIC: Ito ang pipigil sa connection issue sa Practice page!
  useEffect(() => {
    // Reset pag nag-load ang page (Mount)
    setIsRecognizing(false);
    setOutputText('');

    // Reset kapag UMALIS ka sa page na 'to (Unmount)
    return () => {
      setIsRecognizing(false); // Patayin ang camera logic
      setOutputText('');       // Linisin ang output
    };
  }, []); // Run once on mount

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <TopBar onSettingsClick={() => setSettingsOpen(true)} />
      
      {/* 📱 Mobile: Vertical Stack | 💻 Desktop: Side-by-Side (2/3 Camera, 1/3 Output) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* 🛠️ CAMERA SECTION: Set to 60vh on mobile to prevent the "short camera" look */}
        <div className="h-[60vh] lg:h-full lg:w-2/3 overflow-hidden border-b lg:border-b-0 lg:border-r border-border/40">
          {/* 4. FORCE MODE: Phrases lang dapat ang gumana dito */}
          <CameraView practiceMode="phrases" />
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