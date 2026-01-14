import { Settings, BookOpen, Target, Eye, Info, Download } from 'lucide-react'; 
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext'; // Import your custom hook

interface TopBarProps {
  onSettingsClick: () => void;
}

const TopBar = ({ onSettingsClick }: TopBarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 🛠️ Consume the global installation state from AppContext
  const { installPrompt, setInstallPrompt } = useApp();

  const handleInstallClick = async () => {
    // If the prompt event doesn't exist in global state, do nothing
    if (!installPrompt) return;
    
    // Trigger the native browser install dialog
    installPrompt.prompt();
    
    // Check if the user accepted or dismissed the installation
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('SignifEye installation accepted');
      // Clear the global prompt so the button disappears after success
      setInstallPrompt(null); 
    }
  };

  const navItems = [
    { path: '/', label: 'Recognize', icon: Eye },
    { path: '/guide', label: 'Guide', icon: BookOpen },
    { path: '/practice', label: 'Practice', icon: Target },
    { path: '/about', label: 'About', icon: Info },
  ];

  return (
    /* Sticky ensures the navigation stays visible during long recognition sessions */
    <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card sticky top-0 z-50">
      <div className="flex items-center gap-4 overflow-hidden flex-1">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">👁️</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight hidden sm:block">SignifEye</h1>
        </div>

        {/* 🛠️ Scrollable Nav: Optimized for mobile tab switching */}
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
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
                  'gap-2 shrink-0 whitespace-nowrap px-3 h-9',
                  isActive && 'bg-primary text-primary-foreground'
                )}
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span className="text-xs sm:text-sm">{item.label}</span>
              </Button>
            );
          })}
        </nav>
      </div>
      
      <div className="flex items-center gap-2 shrink-0 ml-2">
      {/* 🛠️ Install Button: Forced text visibility for PC and Mobile */}
      {installPrompt && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleInstallClick}
          className="gap-2 border-primary text-primary h-9 px-3 animate-in fade-in zoom-in duration-300 shadow-sm hover:bg-primary/5 shrink-0"
        >
          <Download className="w-4 h-4 shrink-0" />
          {/* Removed 'hidden' class so text always shows */}
          <span className="text-xs font-bold whitespace-nowrap">
            Install App
          </span>
        </Button>
      )}

        <Button
          variant="ghost"
          size="icon"
          onClick={onSettingsClick}
          className="hover:bg-secondary h-9 w-9"
          aria-label="Open settings"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};

export default TopBar;