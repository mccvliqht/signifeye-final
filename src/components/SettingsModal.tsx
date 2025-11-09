import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useApp, Language, OutputMode, Theme } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsModal = ({ open, onOpenChange }: SettingsModalProps) => {
  const { settings, updateSettings } = useApp();
  const { toast } = useToast();

  const [tempSettings, setTempSettings] = useState(settings);

  const handleSave = () => {
    updateSettings(tempSettings);
    onOpenChange(false);
    toast({
      title: 'Settings saved',
      description: 'Your preferences have been updated',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Language Selection */}
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select
              value={tempSettings.language}
              onValueChange={(value) =>
                setTempSettings({ ...tempSettings, language: value as Language })
              }
            >
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ASL">ASL (American Sign Language)</SelectItem>
                <SelectItem value="FSL">FSL (Filipino Sign Language)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Output Mode */}
          <div className="space-y-2">
            <Label htmlFor="output">Output Mode</Label>
            <Select
              value={tempSettings.outputMode}
              onValueChange={(value) =>
                setTempSettings({ ...tempSettings, outputMode: value as OutputMode })
              }
            >
              <SelectTrigger id="output">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="speech">Speech</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Theme */}
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select
              value={tempSettings.theme}
              onValueChange={(value) =>
                setTempSettings({ ...tempSettings, theme: value as Theme })
              }
            >
              <SelectTrigger id="theme">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Font Size */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Font Size</Label>
              <span className="text-sm text-muted-foreground">{tempSettings.fontSize}px</span>
            </div>
            <Slider
              value={[tempSettings.fontSize]}
              onValueChange={([value]) =>
                setTempSettings({ ...tempSettings, fontSize: value })
              }
              min={12}
              max={32}
              step={2}
              className="w-full"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
