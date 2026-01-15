import { useState } from 'react';
import { Settings, BookOpen, Target, Eye, Info, Download, X } from 'lucide-react'; 
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';

interface TopBarProps {
  onSettingsClick: () => void;
}

const TopBar = ({ onSettingsClick }: TopBarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { installPrompt, setInstallPrompt } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Recognize', icon: Eye },
    { path: '/guide', label: 'Guide', icon: BookOpen },
    { path: '/practice', label: 'Practice', icon: Target },
    { path: '/about', label: 'About', icon: Info },
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex items-center justify-between px-4 py-3">
        
        {/* 👁️ LEFT GROUP: Logo + Title + Navigation */}
        <div className="flex items-center gap-6 overflow-hidden">
          <div className="flex items-center gap-2 shrink-0">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-lg bg-primary hover:bg-primary/90 shrink-0 h-9 w-9 flex items-center justify-center"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5 text-primary-foreground" />
              ) : (
                <span className="text-primary-foreground font-bold text-lg leading-none">👁️</span>
              )}
            </Button>
            <h1 className="text-xl font-bold tracking-tight hidden md:block">SignifEye</h1>
          </div>

          {/* Desktop Navigation Grouped on Left */}
          <nav className="hidden md:flex items-center gap-1 border-l border-border/50 pl-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavClick(item.path)}
                  className={cn(
                    'gap-2 px-3 h-9 text-sm font-semibold rounded-md transition-all',
                    isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  )}
                >
                  {Icon && <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />}
                  <span>{item.label}</span>
                </Button>
              );
            })}
          </nav>
        </div>

        {/* ⚙️ RIGHT GROUP: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {installPrompt && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => installPrompt.prompt()}
              /* 🛠️ UPDATED: Added px-3 and kept text visible for mobile */
              className="gap-2 border-primary/50 text-primary h-9 px-3 text-xs font-bold flex items-center shadow-sm"
            >
              <Download className="w-4 h-4 shrink-0" />
              {/* 🛠️ FIX: Removed 'hidden xs:inline' so text always shows */}
              <span className="whitespace-nowrap">Install App</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={onSettingsClick}
            className="hover:bg-secondary h-9 w-9"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* 📱 Mobile Tabs Overlay (Vertical) */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-card border-b border-border p-3 flex flex-col gap-1.5 animate-in slide-in-from-top-2 duration-200 md:hidden shadow-2xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.path}
                variant={isActive ? 'default' : 'ghost'}
                className={cn(
                  "justify-start gap-4 h-12 w-full text-base rounded-xl",
                  isActive ? "bg-primary text-primary-foreground" : "bg-secondary/10"
                )}
                onClick={() => handleNavClick(item.path)}
              >
                {Icon && <Icon className="w-5 h-5" />}
                <span className="font-bold">{item.label}</span>
              </Button>
            );
          })}
        </div>
      )}
    </header>
  );
};

export default TopBar;