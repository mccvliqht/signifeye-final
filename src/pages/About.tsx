import { useState } from 'react';
import TopBar from '@/components/TopBar';
import AboutContent from '@/components/AboutContent';
import SettingsModal from '@/components/SettingsModal';
import { AppProvider } from '@/contexts/AppContext';

const About = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        {/* TopBar will now show up because onSettingsClick is provided */}
        <TopBar onSettingsClick={() => setSettingsOpen(true)} />
        
        <main className="flex-1 overflow-y-auto">
          {/* AboutContent holds your message and recommendations */}
          <AboutContent />
        </main>

        <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      </div>
    </AppProvider>
  );
};

export default About;