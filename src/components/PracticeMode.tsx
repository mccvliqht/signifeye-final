import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle2, XCircle, Timer, RotateCcw } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { ALPHABET } from '@/lib/trainingData';

const PracticeMode = () => {
  const { outputText, clearOutput } = useApp();
  const [targetSign, setTargetSign] = useState<string>('');
  const [attempts, setAttempts] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    generateNewSign();
    return () => {
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    };
  }, []);

  // 🛠️ Recognition Logic: Adjusted for 7-13 FPS stability
  useEffect(() => {
    if (!outputText || isProcessing || feedback) return;
    
    const currentOutput = outputText.trim().toUpperCase(); 
    const target = targetSign.toUpperCase();
    
    // ✅ CORRECT MATCH
    if (currentOutput.includes(target)) {
      setIsProcessing(true);
      setFeedback('correct');
      setCorrect(prev => prev + 1);
      setAttempts(prev => prev + 1);
      
      feedbackTimeoutRef.current = setTimeout(() => {
        clearOutput();
        generateNewSign();
        setFeedback(null);
        setIsProcessing(false);
      }, 2000); 
      return;
    }

    // ❌ FORGIVING INCORRECT LOGIC
    // We wait 4 seconds (instead of 1.5) to give the jittery landmarks time to settle
    if (currentOutput.length > 0 && currentOutput !== target) {
      const checkTimer = setTimeout(() => {
        const finalCheck = outputText.trim().toUpperCase();
        
        if (!finalCheck.includes(target) && !feedback) {
          setFeedback('incorrect');
          setAttempts(prev => prev + 1);
          
          setTimeout(() => {
            setFeedback(null);
            clearOutput(); 
            setIsProcessing(false);
          }, 1500);
        } else if (finalCheck.includes(target)) {
          setIsProcessing(false); // User corrected it within the window
        }
      }, 4000); 
      
      return () => clearTimeout(checkTimer);
    }
  }, [outputText, targetSign, clearOutput, isProcessing, feedback]);

  const generateNewSign = () => {
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    
    // Filtering J, Z (motion) and letters often misidentified due to skeleton compression
    const difficultLetters = ['J', 'Z', 'P', 'G', 'T'];
    
    const filteredAlphabet = ALPHABET.filter(letter => 
      !difficultLetters.includes(letter.toUpperCase())
    );
    
    const availableLetters = filteredAlphabet.filter(l => l !== targetSign);
    const randomSign = availableLetters[Math.floor(Math.random() * availableLetters.length)];
    
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
          <h2 className="text-2xl font-bold mb-2 text-white">Alphabet Practice</h2>
          <p className="text-muted-foreground">Sign the letter below to test your accuracy.</p>
        </div>
        {isProcessing && !feedback && (
          <Badge variant="outline" className="animate-pulse gap-1 bg-primary/10 text-primary border-primary/20">
            <Timer className="w-3 h-3" /> Checking...
          </Badge>
        )}
      </div>

      <Card className={`border-2 transition-all duration-500 shadow-lg ${
        feedback === 'correct' ? 'border-green-500 bg-green-500/5' : 
        feedback === 'incorrect' ? 'border-red-500 bg-red-500/5' : 'border-border'
      }`}>
        <CardHeader>
          <CardTitle className="text-center text-muted-foreground uppercase text-xs tracking-[0.2em]">Target Character</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 pb-10">
          <div className={`font-black text-primary transition-all duration-300 text-9xl drop-shadow-sm ${isProcessing ? 'scale-90 opacity-50' : 'scale-100 opacity-100'}`}>
            {targetSign}
          </div>
          
          <div className="h-10 flex items-center"> 
            {feedback === 'correct' && (
              <div className="flex items-center gap-2 text-green-500 animate-in zoom-in duration-300">
                <CheckCircle2 className="w-8 h-8" />
                <span className="font-bold text-xl tracking-tight">Correct!</span>
              </div>
            )}
            {feedback === 'incorrect' && (
              <div className="flex items-center gap-2 text-red-500 animate-in shake duration-300">
                <XCircle className="w-8 h-8" />
                <span className="font-bold text-xl tracking-tight">Try Again</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-none shadow-inner">
        <CardContent className="pt-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Session Accuracy</span>
            <span className={`text-2xl font-black ${accuracy > 80 ? 'text-green-500' : 'text-primary'}`}>{accuracy}%</span>
          </div>
          <Progress value={accuracy} className="h-3 bg-muted" />
        </CardContent>
      </Card>

      <div className="flex gap-3 mt-auto">
        <Button onClick={generateNewSign} variant="secondary" className="flex-1 h-12 rounded-xl font-bold gap-2">
          <RefreshCw className="w-4 h-4" /> Skip Letter
        </Button>
        <Button onClick={resetPractice} variant="outline" className="flex-1 h-12 rounded-xl font-bold gap-2">
          <RotateCcw className="w-4 h-4" /> Reset Stats
        </Button>
      </div>
    </div>
  );
};

export default PracticeMode;