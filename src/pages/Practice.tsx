import { useState, useEffect } from 'react';
import TopBar from '@/components/TopBar';
import PracticeMode from '@/components/PracticeMode';
import CameraView from '@/components/CameraView';
import SettingsModal from '@/components/SettingsModal';
import { useApp } from '@/contexts/AppContext'; 

export type PracticeModeType = 'alphabet' | 'numbers' | 'phrases';

const Practice = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // 🚀 Dito nakalagay ang State kung anong mode ang active
  const [currentMode, setCurrentMode] = useState<PracticeModeType>('alphabet');

  const { setIsRecognizing, setOutputText } = useApp();

  // 👇 CLEANUP MAGIC (Idagdag mo ito!)
  useEffect(() => {
    // Reset pagpasok
    setIsRecognizing(false);
    setOutputText('');

    // Reset pag-alis
    return () => {
      setIsRecognizing(false);
      setOutputText('');
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-hidden">
      <TopBar onSettingsClick={() => setSettingsOpen(true)} />
      
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[6fr_4fr] overflow-hidden">
        
        {/* LEFT: Camera Section */}
        {/* Ipapasa natin ang currentMode sa CameraView para alam ng AI kung ano idedetect */}
        <div className="relative border-b lg:border-r border-border bg-card h-[45vh] lg:h-full overflow-hidden">
          <CameraView practiceMode={currentMode} />
        </div>

        {/* RIGHT: Practice Instructions & Feedback */}
        {/* Ipapasa natin ang currentMode at setMode para sa dropdown selector */}
        <div className="flex flex-col overflow-y-auto bg-background h-full">
          <PracticeMode mode={currentMode} setMode={setCurrentMode} />
        </div>
        
      </main>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
};

export default Practice;