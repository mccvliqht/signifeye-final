import { useState } from 'react';
import TopBar from '@/components/TopBar';
import CameraView from '@/components/CameraView';
import OutputPanel from '@/components/OutputPanel';
import SettingsModal from '@/components/SettingsModal';
import { AppProvider } from '@/contexts/AppContext';

const Index = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <AppProvider>
      <div className="h-screen flex flex-col overflow-hidden">
        <TopBar onSettingsClick={() => setSettingsOpen(true)} />
        
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 overflow-hidden">
          <div className="lg:col-span-2 overflow-auto">
            <CameraView />
          </div>
          
          <div className="overflow-auto">
            <OutputPanel />
          </div>
        </div>

        <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      </div>
    </AppProvider>
  );
};

export default Index;
