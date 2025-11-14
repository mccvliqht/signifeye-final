import { Settings, BookOpen, Target, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface TopBarProps {
  onSettingsClick: () => void;
}

const TopBar = ({ onSettingsClick }: TopBarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Recognize', icon: null },
    { path: '/guide', label: 'Guide', icon: BookOpen },
    { path: '/practice', label: 'Practice', icon: Target },
    { path: '/dataset', label: 'Dataset', icon: Database },
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
      
      <Button
        variant="ghost"
        size="icon"
        onClick={onSettingsClick}
        className="hover:bg-secondary"
        aria-label="Open settings"
      >
        <Settings className="h-5 w-5" />
      </Button>
    </header>
  );
};

export default TopBar;
