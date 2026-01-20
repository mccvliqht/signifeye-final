import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
    
    // Wake up speech engine logic
    if (tempSettings.outputMode === 'speech') {
      const wakeUpUtterance = new SpeechSynthesisUtterance("");
      wakeUpUtterance.volume = 0; 
      window.speechSynthesis.speak(wakeUpUtterance);
    }

    onOpenChange(false);
    toast({
      title: 'Settings saved',
      description: 'Your preferences have been updated',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* 📱 MOBILE FIX: w-[90vw] (90% width), rounded-xl, compact padding */}
      <DialogContent className="w-[90vw] max-w-[400px] rounded-xl sm:rounded-lg p-4 md:p-6 gap-4">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-center text-lg md:text-xl font-bold">Settings</DialogTitle>
          <DialogDescription className="text-center text-xs text-muted-foreground">
            Configure language, output, and appearance.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          
          {/* Language Selection */}
          <div className="grid gap-2">
            <Label htmlFor="language" className="text-xs md:text-sm font-semibold">Language</Label>
            <Select
              value={tempSettings.language}
              onValueChange={(value) =>
                setTempSettings({ ...tempSettings, language: value as Language })
              }
            >
              {/* 📱 COMPACT TRIGGER: h-9 */}
              <SelectTrigger id="language" className="h-9 text-xs md:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ASL">ASL (American Sign Language)</SelectItem>
                <SelectItem value="FSL">FSL (Filipino Sign Language)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Output Mode */}
          <div className="grid gap-2">
            <Label htmlFor="output" className="text-xs md:text-sm font-semibold">Output Mode</Label>
            <Select
              value={tempSettings.outputMode}
              onValueChange={(value) =>
                setTempSettings({ ...tempSettings, outputMode: value as OutputMode })
              }
            >
              <SelectTrigger id="output" className="h-9 text-xs md:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text Only</SelectItem>
                <SelectItem value="speech">Text & Speech</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Theme */}
          <div className="grid gap-2">
            <Label htmlFor="theme" className="text-xs md:text-sm font-semibold">Theme</Label>
            <Select
              value={tempSettings.theme}
              onValueChange={(value) =>
                setTempSettings({ ...tempSettings, theme: value as Theme })
              }
            >
              <SelectTrigger id="theme" className="h-9 text-xs md:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light Mode</SelectItem>
                <SelectItem value="dark">Dark Mode</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Font Size */}
          <div className="grid gap-3 pt-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="fontsize" className="text-xs md:text-sm font-semibold">Font Size</Label>
              <span className="text-xs text-muted-foreground">{tempSettings.fontSize}px</span>
            </div>
            <Slider
              id="fontsize"
              value={[tempSettings.fontSize]}
              onValueChange={([value]) =>
                setTempSettings({ ...tempSettings, fontSize: value })
              }
              min={12}
              max={32}
              step={2}
              className="w-full py-1"
            />
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 mt-2">
          {/* 📱 COMPACT BUTTONS */}
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-9 text-xs md:text-sm w-full">
            Cancel
          </Button>
          <Button onClick={handleSave} className="h-9 text-xs md:text-sm w-full">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;