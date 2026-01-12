import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle2, XCircle, Timer } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { ALPHABET } from '@/lib/trainingData';

const PracticeMode = () => {
  const { outputText, clearOutput } = useApp();
  const [targetSign, setTargetSign] = useState<string>('');
  const [attempts, setAttempts] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  
  // 🕒 NEW: Logic for "Thinking Time"
  const [isProcessing, setIsProcessing] = useState(false);
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const phrases = ['Hello', 'I love you', 'Wait a Minute'];

  useEffect(() => {
    generateNewSign();
  }, []);

  useEffect(() => {
    // If we are already showing "Correct" or "Incorrect", or if there's no text, don't do anything.
    if (!outputText || isProcessing || feedback) return;
    
    const currentOutput = outputText.trim();
    
    // ✅ CHECK FOR CORRECT SIGN
    if (currentOutput.toLowerCase() === targetSign.toLowerCase()) {
      setIsProcessing(true); // Lock the UI so it doesn't flicker
      setFeedback('correct');
      setCorrect(prev => prev + 1);
      setAttempts(prev => prev + 1);
      
      feedbackTimeoutRef.current = setTimeout(() => {
        clearOutput();
        generateNewSign();
        setFeedback(null);
        setIsProcessing(false);
      }, 2000); // Increased wait time to 2 seconds
      return;
    }

    // ❌ SLOWER INCORRECT LOGIC
    // We only trigger "Incorrect" if the text is long enough AND the user hasn't 
    // corrected it within a "Grace Period".
    if (currentOutput.length >= targetSign.length) {
      setIsProcessing(true);
      
      // Give the user 1.5 seconds of "Grace" to fix their hand before showing the Red X.
      feedbackTimeoutRef.current = setTimeout(() => {
        // Double check: is it still wrong after 1.5 seconds?
        if (outputText.trim().toLowerCase() !== targetSign.toLowerCase()) {
          setFeedback('incorrect');
          setAttempts(prev => prev + 1);
          
          setTimeout(() => {
            setFeedback(null);
            clearOutput(); 
            setIsProcessing(false);
          }, 1500);
        } else {
          // They fixed it in time! Don't mark as incorrect.
          setIsProcessing(false);
        }
      }, 1500); 
    }
  }, [outputText, targetSign, clearOutput, isProcessing, feedback]);

  const generateNewSign = () => {
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    const staticLetters = ALPHABET.filter(l => !['J', 'Z'].includes(l));
    const practicePool = [...staticLetters, ...phrases];
    const randomSign = practicePool[Math.floor(Math.random() * practicePool.length)];
    setTargetSign(randomSign);
  };

  const resetPractice = () => {
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    setAttempts(0);
    setCorrect(0);
    setFeedback(null);
    setIsProcessing(false);
    clearOutput();
    generateNewSign();
  };

  const accuracy = attempts > 0 ? Math.round((correct / attempts) * 100) : 0;

  return (
    <div className="flex flex-col h-full p-6 gap-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-2">Practice Mode</h2>
          <p className="text-muted-foreground">Sign the target below. Take your time!</p>
        </div>
        {isProcessing && !feedback && (
          <Badge variant="outline" className="animate-pulse gap-1">
            <Timer className="w-3 h-3" /> Checking...
          </Badge>
        )}
      </div>

      <Card className={`border-2 transition-colors duration-500 ${
        feedback === 'correct' ? 'border-green-500 bg-green-50/10' : 
        feedback === 'incorrect' ? 'border-red-500 bg-red-50/10' : 'border-border'
      }`}>
        <CardHeader>
          <CardTitle className="text-center">Target Sign</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className={`font-bold text-primary transition-all ${targetSign.length > 1 ? 'text-5xl' : 'text-9xl'} ${isProcessing ? 'opacity-50' : 'opacity-100'}`}>
            {targetSign}
          </div>
          
          <div className="h-8"> {/* Fixed height to prevent UI jumping */}
            {feedback === 'correct' && (
              <div className="flex items-center gap-2 text-green-600 animate-in zoom-in duration-300">
                <CheckCircle2 className="w-6 h-6" />
                <span className="font-semibold">Perfect!</span>
              </div>
            )}
            
            {feedback === 'incorrect' && (
              <div className="flex items-center gap-2 text-red-600 animate-in shake duration-300">
                <XCircle className="w-6 h-6" />
                <span className="font-semibold">Try again</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress Section remains the same */}
      <Card>
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Accuracy</span>
            <Badge variant="secondary" className="text-lg">{accuracy}%</Badge>
          </div>
          <Progress value={accuracy} className="h-3" />
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={generateNewSign} variant="outline" className="flex-1 gap-2">
          <RefreshCw className="w-4 h-4" /> Skip
        </Button>
        <Button onClick={resetPractice} variant="outline" className="flex-1">Reset</Button>
      </div>
    </div>
  );
};

export default PracticeMode;