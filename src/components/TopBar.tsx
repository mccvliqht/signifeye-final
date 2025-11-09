import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TopBarProps {
  onSettingsClick: () => void;
}

const TopBar = ({ onSettingsClick }: TopBarProps) => {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-xl">👁️</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">SignifEye</h1>
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
