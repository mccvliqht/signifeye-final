import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, CheckCircle2, XCircle, Timer, RotateCcw, Dumbbell } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { ALPHABET, NUMBERS, COMMON_PHRASES } from '@/lib/trainingData';
import { PracticeModeType } from '@/pages/Practice'; 

interface PracticeModeProps {
  mode: PracticeModeType;
  setMode: (mode: PracticeModeType) => void;
}

const PracticeMode = ({ mode, setMode }: PracticeModeProps) => {
  const { outputText, clearOutput } = useApp();
  const [targetSign, setTargetSign] = useState<string>('');
  const [attempts, setAttempts] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // 👇 1. SAFETY STATE: Warm-up muna para iwas Ghost Touch
  const [isWarmingUp, setIsWarmingUp] = useState(true);

  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset kapag nagpalit ng mode
  useEffect(() => {
    resetPractice();
  }, [mode]);

  // Initial load logic
  useEffect(() => {
    // 👇 2. WARM-UP TIMER: Block inputs for 1 second
    setIsWarmingUp(true);
    clearOutput(); 
    generateNewSign();
    
    const warmUpTimer = setTimeout(() => {
      setIsWarmingUp(false); // READY NA! 🚀
    }, 1000);

    return () => {
      clearTimeout(warmUpTimer);
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    };
  }, []); 

  // CHECKING LOGIC
  useEffect(() => {
    // 👇 3. GUARD: Kapag warming up pa, 'wag pansinin ang outputText
    if (isWarmingUp || !outputText || isProcessing || feedback) return;
    
    const currentOutput = outputText.trim().toLowerCase(); 
    const target = targetSign.toLowerCase();
    
    // Check Match
    if (currentOutput.includes(target) || currentOutput === target) {
      handleCorrect();
      return;
    }

    // Logic for incorrect attempts
    if (currentOutput.length > 0 && !currentOutput.includes(target)) {
      const checkTimer = setTimeout(() => {
        const finalCheck = outputText.trim().toLowerCase();
        if ((!finalCheck.includes(target)) && !feedback) {
          handleIncorrect();
        } else if (finalCheck.includes(target)) {
          handleCorrect();
        }
      }, 3000); 
      return () => clearTimeout(checkTimer);
    }
  }, [outputText, targetSign, isProcessing, feedback, isWarmingUp]); 

  const handleCorrect = () => {
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
  };

  const handleIncorrect = () => {
      setFeedback('incorrect');
      setAttempts(prev => prev + 1);
      setTimeout(() => {
        setFeedback(null);
        clearOutput(); 
        setIsProcessing(false);
      }, 1500);
  };

  const generateNewSign = () => {
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    
    let dataSet: string[] = [];
    
    if (mode === 'alphabet') {
        const difficultLetters = ['J', 'Z']; 
        dataSet = ALPHABET.filter(l => !difficultLetters.includes(l));
    } else if (mode === 'numbers') {
        dataSet = NUMBERS;
    } else if (mode === 'phrases') {
        dataSet = COMMON_PHRASES;
    }

    const available = dataSet.filter(item => item !== targetSign);
    if (available.length === 0) {
        setTargetSign(dataSet[0] || 'A'); 
    } else {
        const randomSign = available[Math.floor(Math.random() * available.length)];
        setTargetSign(randomSign);
    }
  };

  const resetPractice = () => {
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    
    // Reset warm-up on manual reset too
    setIsWarmingUp(true);
    setTimeout(() => setIsWarmingUp(false), 1000);

    setAttempts(0);
    setCorrect(0);
    setFeedback(null);
    setIsProcessing(false);
    clearOutput();
    generateNewSign();
  };

  const accuracy = attempts > 0 ? Math.round((correct / attempts) * 100) : 0;

  return (
    // 📱 ADJUSTED: Reduced padding (p-2) for mobile to save space
    <div className="flex flex-col h-full p-2 md:p-6 gap-2 md:gap-6 bg-background">
      
      {/* Header with Dropdown */}
      <div className="flex flex-col gap-2 md:gap-4 shrink-0">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg md:text-2xl font-bold text-foreground leading-tight">Practice Arena</h2>
            <p className="text-[10px] md:text-sm text-muted-foreground">Select a mode and mimic the sign.</p>
          </div>
          
          <Select value={mode} onValueChange={(val: any) => setMode(val)}>
            <SelectTrigger className="w-[130px] md:w-[180px] h-8 md:h-10 text-xs md:text-sm bg-card border-primary/20">
              <div className="flex items-center gap-2">
                 <Dumbbell className="w-3 h-3 md:w-4 md:h-4 text-primary" />
                 <SelectValue placeholder="Select Mode" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alphabet">Alphabet (A-Z)</SelectItem>
              <SelectItem value="numbers">Numbers (1-10)</SelectItem>
              <SelectItem value="phrases">Common Phrases</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Target Character Card - COMPACT FOR MOBILE */}
      <Card className={`border-2 transition-all duration-500 shadow-lg flex-1 flex flex-col justify-center min-h-0 ${
        feedback === 'correct' ? 'border-green-500 bg-green-500/5' : 
        feedback === 'incorrect' ? 'border-red-500 bg-red-500/5' : 'border-border'
      }`}>
        <CardHeader className="py-1 md:py-2 shrink-0">
          <CardTitle className="text-center text-muted-foreground uppercase text-[9px] md:text-xs tracking-[0.2em]">Target {mode === 'phrases' ? 'Phrase' : 'Sign'}</CardTitle>
        </CardHeader>
        
        {/* 📱 ADJUSTED: Reduced padding bottom (pb-2) */}
        <CardContent className="flex flex-col items-center gap-2 md:gap-4 pb-2 md:pb-6 flex-1 justify-center min-h-0">
          
          {/* Target Sign Display - SMALLER TEXT ON MOBILE (text-5xl) */}
          <div className={`font-black text-primary transition-all duration-300 text-center drop-shadow-sm leading-none ${
              mode === 'phrases' ? 'text-2xl md:text-6xl px-2' : 'text-6xl md:text-9xl'
            } ${isProcessing || isWarmingUp ? 'scale-90 opacity-50' : 'scale-100 opacity-100'}`}>
            {targetSign}
          </div>
          
          <div className="h-6 md:h-8 flex items-center justify-center w-full shrink-0"> 
            {feedback === 'correct' && (
              <div className="flex items-center gap-2 text-green-500 animate-in zoom-in duration-300">
                <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
                <span className="font-bold text-sm md:text-lg">Correct!</span>
              </div>
            )}
            {feedback === 'incorrect' && (
              <div className="flex items-center gap-2 text-red-500 animate-in shake duration-300">
                <XCircle className="w-5 h-5 md:w-6 md:h-6" />
                <span className="font-bold text-sm md:text-lg">Try Again</span>
              </div>
            )}
            {/* Show "Get Ready..." during warm-up */}
            {isWarmingUp && !feedback && (
                <Badge variant="outline" className="animate-pulse gap-1 bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-[10px] md:text-xs">
                    <Timer className="w-3 h-3" /> Get Ready...
                </Badge>
            )}
            {/* Show "Checking..." only when processing and NOT warming up */}
            {isProcessing && !feedback && !isWarmingUp && (
                <Badge variant="outline" className="animate-pulse gap-1 bg-primary/10 text-primary border-primary/20 text-[10px] md:text-xs">
                    <Timer className="w-3 h-3" /> Checking...
                </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Accuracy & Controls - COMPACT BUTTONS */}
      <div className="mt-auto space-y-2 md:space-y-3 shrink-0">
        <Card className="bg-card/50 border-none shadow-inner">
            <CardContent className="py-2 md:py-3 flex justify-between items-center">
                <span className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase">Accuracy</span>
                <div className="flex items-center gap-2 md:gap-3">
                    <Progress value={accuracy} className="w-20 md:w-32 h-1.5 md:h-2 bg-muted" />
                    <span className={`text-sm md:text-lg font-black ${accuracy > 80 ? 'text-green-500' : 'text-primary'}`}>{accuracy}%</span>
                </div>
            </CardContent>
        </Card>

        <div className="flex gap-2">
            {/* 📱 ADJUSTED: Reduced height (h-10) for mobile buttons */}
            <Button onClick={generateNewSign} variant="secondary" className="flex-1 h-10 md:h-12 rounded-xl font-bold gap-2 shadow-md text-xs md:text-sm">
            <RefreshCw className="w-3 h-3 md:w-4 md:h-4" /> Skip
            </Button>
            <Button onClick={resetPractice} variant="outline" className="flex-1 h-10 md:h-12 rounded-xl font-bold gap-2 shadow-sm text-xs md:text-sm">
            <RotateCcw className="w-3 h-3 md:w-4 md:h-4" /> Reset
            </Button>
        </div>
      </div>
    </div>
  );
};

export default PracticeMode;