import { useState, useEffect } from 'react';
import TopBar from '@/components/TopBar';
import PracticeMode from '@/components/PracticeMode';
import CameraView from '@/components/CameraView';
import SettingsModal from '@/components/SettingsModal';
import { useApp } from '@/contexts/AppContext'; 

// 👇 1. IMPORTS PARA SA REMINDER MODAL
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from 'lucide-react';

export type PracticeModeType = 'alphabet' | 'numbers' | 'phrases';

const Practice = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // 👇 2. ALWAYS TRUE PARA LUMABAS TUWING PAPASOK SA PRACTICE PAGE
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  
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

      {/* 👇 3. ITO YUNG PROFANITY / GUIDELINES MODAL (MOBILE RESPONSIVE NA!) 👇 */}
      <AlertDialog open={showDisclaimer} onOpenChange={setShowDisclaimer}>
        {/* 📱 w-[90vw] makes it fit on small phones, max-w-[400px] stops it from being too wide on PCs */}
        <AlertDialogContent className="w-[90vw] max-w-[400px] rounded-xl border-red-500/20 p-4 md:p-6 z-[100]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-500 text-lg md:text-xl">
              <AlertTriangle className="w-5 h-5" />
              Community Guidelines
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left space-y-3 mt-2 text-foreground/80">
              <p className="text-xs md:text-sm">
                Welcome to the <strong>SignifEye Practice Arena</strong>! Please remember that our system recognizes a specific set of vocabulary.
              </p>
              <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                <p className="text-xs md:text-sm font-medium text-foreground">
                  <strong className="text-red-500">Friendly Reminder:</strong> Please stick to the target signs. Unsupported or inappropriate gestures (e.g., profanity) will trigger incorrect feedback. Let's practice respectfully!
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-2 md:mt-4">
            <AlertDialogAction onClick={() => setShowDisclaimer(false)} className="w-full font-bold h-10 text-xs md:text-sm">
              Got it!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default Practice;