import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, Save } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useMediaPipe } from '@/hooks/useMediaPipe';
import { useToast } from '@/hooks/use-toast';
import { ALPHABET } from '@/lib/trainingData';

interface LandmarkSample {
  landmarks: number[];
  label: string;
  timestamp: number;
}

const DatasetCollector = () => {
  const { settings, isRecognizing } = useApp();
  const { detectHands } = useMediaPipe();
  const { toast } = useToast();
  const [selectedLetter, setSelectedLetter] = useState<string>('A');
  const [samples, setSamples] = useState<LandmarkSample[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);

  const captureSample = () => {
    if (!isRecognizing) {
      toast({
        title: 'Camera not active',
        description: 'Please start the camera first',
        variant: 'destructive'
      });
      return;
    }

    // Get current video element
    const video = document.querySelector('video');
    if (!video) return;

    const results = detectHands(video, performance.now());
    if (results?.landmarks && results.landmarks.length > 0) {
      const handLandmarks = results.landmarks[0];
      const wrist = handLandmarks[0];
      
      // Extract relative landmarks
      const landmarks: number[] = [];
      for (let i = 0; i < 21; i++) {
        const landmark = handLandmarks[i];
        landmarks.push(landmark.x - wrist.x);
        landmarks.push(landmark.y - wrist.y);
        landmarks.push(landmark.z - wrist.z);
      }

      const sample: LandmarkSample = {
        landmarks,
        label: selectedLetter,
        timestamp: Date.now()
      };

      setSamples(prev => [...prev, sample]);
      
      toast({
        title: 'Sample captured',
        description: `Captured ${selectedLetter} sample #${samples.length + 1}`,
      });
    } else {
      toast({
        title: 'No hand detected',
        description: 'Make sure your hand is visible',
        variant: 'destructive'
      });
    }
  };

  const startBulkCapture = () => {
    setIsCapturing(true);
    let count = 0;
    const interval = setInterval(() => {
      captureSample();
      count++;
      if (count >= 10) {
        clearInterval(interval);
        setIsCapturing(false);
        toast({
          title: 'Bulk capture complete',
          description: `Captured 10 samples of ${selectedLetter}`,
        });
      }
    }, 500);
  };

  const exportDataset = () => {
    if (samples.length === 0) {
      toast({
        title: 'No samples',
        description: 'Capture some samples first',
        variant: 'destructive'
      });
      return;
    }

    const dataStr = JSON.stringify(samples, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${settings.language}-dataset-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Dataset exported',
      description: `Exported ${samples.length} samples`,
    });
  };

  const clearDataset = () => {
    setSamples([]);
    toast({
      title: 'Dataset cleared',
      description: 'All samples removed',
    });
  };

  const samplesPerLetter = ALPHABET.reduce((acc, letter) => {
    acc[letter] = samples.filter(s => s.label === letter).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex flex-col h-full p-6 gap-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Dataset Collector</h2>
        <p className="text-muted-foreground">
          Collect hand landmark data to train better recognition models
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Capture Samples</CardTitle>
          <CardDescription>
            Make the sign and capture landmark data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Select Letter</label>
            <Select value={selectedLetter} onValueChange={setSelectedLetter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {ALPHABET.map(letter => (
                  <SelectItem key={letter} value={letter}>
                    {letter} ({samplesPerLetter[letter] || 0} samples)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={captureSample}
              disabled={!isRecognizing || isCapturing}
              className="flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              Capture One
            </Button>
            <Button
              onClick={startBulkCapture}
              disabled={!isRecognizing || isCapturing}
              variant="outline"
              className="flex-1"
            >
              Capture 10
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dataset Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total Samples</span>
            <Badge variant="secondary" className="text-lg">
              {samples.length}
            </Badge>
          </div>

          <div className="grid grid-cols-6 gap-2">
            {ALPHABET.map(letter => {
              const count = samplesPerLetter[letter] || 0;
              return (
                <div
                  key={letter}
                  className={`text-center p-2 rounded-md border ${
                    count > 0 ? 'bg-primary/10 border-primary' : 'bg-muted'
                  }`}
                >
                  <div className="font-bold">{letter}</div>
                  <div className="text-xs text-muted-foreground">{count}</div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={exportDataset}
              disabled={samples.length === 0}
              className="flex-1 gap-2"
            >
              <Download className="w-4 h-4" />
              Export Dataset
            </Button>
            <Button
              onClick={clearDataset}
              disabled={samples.length === 0}
              variant="outline"
              className="flex-1"
            >
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatasetCollector;
