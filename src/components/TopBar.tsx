import { useState, useEffect } from 'react';
import { Settings, BookOpen, Target, Eye, Info, Download } from 'lucide-react'; 
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface TopBarProps {
  onSettingsClick: () => void;
}

const TopBar = ({ onSettingsClick }: TopBarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 🛠️ PWA Installation Logic
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    
    // Show the native install prompt
    installPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setInstallPrompt(null); // Hide the button after installation
    }
  };

  const navItems = [
    { path: '/', label: 'Recognize', icon: Eye },
    { path: '/guide', label: 'Guide', icon: BookOpen },
    { path: '/practice', label: 'Practice', icon: Target },
    { path: '/about', label: 'About', icon: Info },
  ];

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">👁️</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">SignifEye</h1>
        </div>

        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.path}
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate(item.path)}
                className={cn(
                  'gap-2',
                  isActive && 'bg-primary text-primary-foreground'
                )}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {item.label}
              </Button>
            );
          })}
        </nav>
      </div>
      
      <div className="flex items-center gap-2">
        {/* 🛠️ Install Button - Only shows if app is installable */}
        {installPrompt && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleInstallClick}
            className="gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <Download className="w-4 h-4" />
            Install App
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={onSettingsClick}
          className="hover:bg-secondary"
          aria-label="Open settings"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};

export default TopBar;