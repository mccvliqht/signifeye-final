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

  useEffect(() => {
    if (!outputText || isProcessing || feedback) return;
    const currentOutput = outputText.trim().toUpperCase(); 
    const target = targetSign.toUpperCase();
    
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
          setIsProcessing(false);
        }
      }, 4000); 
      return () => clearTimeout(checkTimer);
    }
  }, [outputText, targetSign, clearOutput, isProcessing, feedback]);

  const generateNewSign = () => {
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    const difficultLetters = ['J', 'Z', 'P', 'G', 'T'];
    const filteredAlphabet = ALPHABET.filter(letter => !difficultLetters.includes(letter.toUpperCase()));
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
    /* 🛠️ REDUCED: p-4 to p-3 to gain more vertical space */
    <div className="flex flex-col h-full p-3 md:p-6 gap-3 md:gap-6 bg-background">
      
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">Alphabet Practice</h2>
          <p className="text-[10px] md:text-sm text-muted-foreground leading-relaxed">Sign the letter below to test your accuracy.</p>
        </div>
        {isProcessing && !feedback && (
          <Badge variant="outline" className="animate-pulse gap-1 bg-primary/10 text-primary border-primary/20 text-[9px] px-1.5 py-0">
            <Timer className="w-2.5 h-2.5" /> Checking...
          </Badge>
        )}
      </div>

      {/* Target Character Card */}
      <Card className={`border-2 transition-all duration-500 shadow-lg ${
        feedback === 'correct' ? 'border-green-500 bg-green-500/5' : 
        feedback === 'incorrect' ? 'border-red-500 bg-red-500/5' : 'border-border'
      }`}>
        {/* 🛠️ REDUCED: CardHeader padding from py-3 to py-2 */}
        <CardHeader className="py-2 md:py-6">
          <CardTitle className="text-center text-muted-foreground uppercase text-[9px] md:text-xs tracking-[0.2em]">Target Character</CardTitle>
        </CardHeader>
        {/* 🛠️ REDUCED: CardContent bottom padding from pb-6 to pb-4 */}
        <CardContent className="flex flex-col items-center gap-2 md:gap-6 pb-4 md:pb-10">
          {/* 🛠️ REDUCED: Character size from text-7xl to text-6xl for better mobile fit */}
          <div className={`font-black text-primary transition-all duration-300 text-6xl md:text-9xl drop-shadow-sm ${isProcessing ? 'scale-90 opacity-50' : 'scale-100 opacity-100'}`}>
            {targetSign}
          </div>
          
          <div className="h-6 md:h-10 flex items-center"> 
            {feedback === 'correct' && (
              <div className="flex items-center gap-2 text-green-500 animate-in zoom-in duration-300">
                <CheckCircle2 className="w-5 h-5 md:w-8 md:h-8" />
                <span className="font-bold text-base md:text-xl tracking-tight">Correct!</span>
              </div>
            )}
            {feedback === 'incorrect' && (
              <div className="flex items-center gap-2 text-red-500 animate-in shake duration-300">
                <XCircle className="w-5 h-5 md:w-8 md:h-8" />
                <span className="font-bold text-base md:text-xl tracking-tight">Try Again</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Session Accuracy Section */}
      <Card className="bg-card/50 border-none shadow-inner">
        {/* 🛠️ REDUCED: Vertical padding from py-4 to py-2 */}
        <CardContent className="py-2.5 md:pt-6 space-y-2 md:space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[9px] md:text-sm font-bold text-muted-foreground uppercase tracking-wider">Session Accuracy</span>
            <span className={`text-lg md:text-2xl font-black ${accuracy > 80 ? 'text-green-500' : 'text-primary'}`}>{accuracy}%</span>
          </div>
          <Progress value={accuracy} className="h-1.5 md:h-3 bg-muted" />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {/* 🛠️ REDUCED: mt-auto to mt-1 and h-11 to h-10 to stay within viewport */}
      <div className="flex gap-2 mt-1 pb-1">
        <Button onClick={generateNewSign} variant="secondary" className="flex-1 h-10 md:h-12 rounded-xl font-bold gap-2 text-xs md:text-sm shadow-md">
          <RefreshCw className="w-3.5 h-3.5" /> Skip
        </Button>
        <Button onClick={resetPractice} variant="outline" className="flex-1 h-10 md:h-12 rounded-xl font-bold gap-2 text-xs md:text-sm shadow-sm">
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </Button>
      </div>
    </div>
  );
};

export default PracticeMode;