import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { ScrollArea } from '@/components/ui/scroll-area';

const OutputPanel = () => {
  const { outputText, clearOutput, settings } = useApp();

  return (
    <div className="flex flex-col h-full p-6 gap-4 bg-output-surface border-l border-border">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Output</h2>
        <Button
          onClick={clearOutput}
          size="sm"
          variant="outline"
          className="gap-2"
          disabled={!outputText}
        >
          <Trash2 className="w-4 h-4" />
          Clear
        </Button>
      </div>

      <ScrollArea className="flex-1 rounded-lg border border-border bg-card p-4">
        <div
          className="min-h-[200px] text-foreground whitespace-pre-wrap"
          style={{ fontSize: `${settings.fontSize}px` }}
        >
          {outputText || (
            <span className="text-muted-foreground italic">
              Recognized signs will appear here...
            </span>
          )}
        </div>
      </ScrollArea>

      <div className="text-sm text-muted-foreground">
        <p>Language: <span className="font-medium text-foreground">{settings.language}</span></p>
        <p>Output: <span className="font-medium text-foreground">{settings.outputMode === 'text' ? 'Text' : 'Speech'}</span></p>
      </div>
    </div>
  );
};

export default OutputPanel;
