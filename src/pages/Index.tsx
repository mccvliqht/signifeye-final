import { useState, useEffect } from 'react';
import TopBar from '@/components/TopBar';
import CameraView from '@/components/CameraView';
import OutputPanel from '@/components/OutputPanel';
import SettingsModal from '@/components/SettingsModal';
import { useApp } from '@/contexts/AppContext';

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

const Index = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // 👇 GINAWANG "TRUE" PARA AUTOMATIC LALABAS TUWING BABALIK SA PAGE
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  
  const { setIsRecognizing, setOutputText } = useApp();

  useEffect(() => {
    setIsRecognizing(false);
    setOutputText('');

    return () => {
      setIsRecognizing(false); 
      setOutputText('');       
    };
  }, []); 

  // 👇 TINANGGAL NA ANG LOCALSTORAGE PARA HINDI NIYA TANDAAN, KAYA UULIT SIYA
  const handleAcceptDisclaimer = () => {
    setShowDisclaimer(false);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <TopBar onSettingsClick={() => setSettingsOpen(true)} />
      
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="h-[60vh] lg:h-full lg:w-2/3 overflow-hidden border-b lg:border-b-0 lg:border-r border-border/40">
          <CameraView practiceMode="phrases" />
        </div>
        
        <div className="flex-1 lg:h-full lg:w-1/3 overflow-auto bg-muted/10">
          <OutputPanel />
        </div>
      </div>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />

      {/* PROFANITY / GUIDELINES MODAL */}
      <AlertDialog open={showDisclaimer} onOpenChange={setShowDisclaimer}>
        <AlertDialogContent className="w-[90vw] max-w-[400px] rounded-xl border-red-500/20 p-4 md:p-6 z-[100]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-500 text-lg md:text-xl">
              <AlertTriangle className="w-5 h-5" />
              Community Guidelines
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left space-y-3 mt-2 text-foreground/80">
              <p className="text-xs md:text-sm">
                Welcome to <strong>SignifEye</strong>! Please note that our system is currently trained to recognize a limited set of vocabulary (Alphabets, Numbers, and Common Phrases).
              </p>
              <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                <p className="text-xs md:text-sm font-medium text-foreground">
                  <strong className="text-red-500">Friendly Reminder:</strong> Performing unsupported or inappropriate gestures (e.g., profanity) will result in inaccurate translations. We highly encourage respectful use of the application.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-2 md:mt-4">
            <AlertDialogAction onClick={handleAcceptDisclaimer} className="w-full font-bold h-10 text-xs md:text-sm">
              I Understand
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
    </div>
  );
};

export default Index;