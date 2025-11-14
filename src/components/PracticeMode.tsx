import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { ALPHABET } from '@/lib/trainingData';

const PracticeMode = () => {
  const { outputText, clearOutput } = useApp();
  const [targetLetter, setTargetLetter] = useState<string>('');
  const [attempts, setAttempts] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  useEffect(() => {
    generateNewLetter();
  }, []);

  useEffect(() => {
    if (!outputText) return;
    
    const lastLetter = outputText.trim().slice(-1).toUpperCase();
    
    if (lastLetter === targetLetter) {
      setFeedback('correct');
      setCorrect(prev => prev + 1);
      setAttempts(prev => prev + 1);
      
      setTimeout(() => {
        clearOutput();
        generateNewLetter();
        setFeedback(null);
      }, 1500);
    } else if (ALPHABET.includes(lastLetter)) {
      setFeedback('incorrect');
      setAttempts(prev => prev + 1);
      
      setTimeout(() => {
        setFeedback(null);
      }, 1000);
    }
  }, [outputText, targetLetter, clearOutput]);

  const generateNewLetter = () => {
    // Focus on static letters (exclude J and Z which require motion)
    const staticLetters = ALPHABET.filter(l => !['J', 'Z'].includes(l));
    const randomLetter = staticLetters[Math.floor(Math.random() * staticLetters.length)];
    setTargetLetter(randomLetter);
  };

  const resetPractice = () => {
    setAttempts(0);
    setCorrect(0);
    setFeedback(null);
    clearOutput();
    generateNewLetter();
  };

  const accuracy = attempts > 0 ? Math.round((correct / attempts) * 100) : 0;

  return (
    <div className="flex flex-col h-full p-6 gap-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Practice Mode</h2>
        <p className="text-muted-foreground">
          Sign the letter shown below and get real-time feedback!
        </p>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-center">Target Letter</CardTitle>
          <CardDescription className="text-center">
            Make this sign with your hand
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="text-9xl font-bold text-primary">
            {targetLetter}
          </div>
          
          {feedback === 'correct' && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-6 h-6" />
              <span className="font-semibold">Correct! Great job!</span>
            </div>
          )}
          
          {feedback === 'incorrect' && (
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="w-6 h-6" />
              <span className="font-semibold">Try again!</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Accuracy</span>
            <Badge variant="secondary" className="text-lg">
              {accuracy}%
            </Badge>
          </div>
          <Progress value={accuracy} className="h-3" />
          
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{correct}</div>
              <div className="text-sm text-muted-foreground">Correct</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{attempts - correct}</div>
              <div className="text-sm text-muted-foreground">Incorrect</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button
          onClick={generateNewLetter}
          variant="outline"
          className="flex-1 gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Skip Letter
        </Button>
        <Button
          onClick={resetPractice}
          variant="outline"
          className="flex-1"
        >
          Reset Progress
        </Button>
      </div>
    </div>
  );
};

export default PracticeMode;
