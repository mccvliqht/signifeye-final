import { useEffect, useState } from 'react';

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Wait for 2.5 seconds, then fade out
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 500); 
    }, 2500);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div 
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="flex flex-col items-center animate-in zoom-in-95 duration-700 px-4 text-center">
        
        {/* LOGO CONTAINER */}
        <div className="relative w-80 h-48 mb-8">
          
          {/* Pulsing Background Effect */}
          <div className="absolute inset-0 bg-primary/20 rounded-[40px] animate-ping opacity-75"></div>
          
          {/* Main Container */}
          {/* 🛠️ UPDATED: p-0 (Zero padding) para sagad ang logo sa loob */}
          <div className="relative bg-card p-0 rounded-[40px] shadow-2xl border-4 border-primary/10 h-full w-full flex items-center justify-center overflow-hidden">
             
             {/* ☀️ IMAGE FOR LIGHT MODE */}
             <img 
               src="/logo-lm.png" 
               alt="SignifEye Logo Light" 
               // object-contain ensures hindi ma-crop ang logo kahit anong mangyari
               className="w-full h-full object-contain block dark:hidden drop-shadow-sm p-1" // Added tiny p-1 for breathing room against border
             />

             {/* 🌙 IMAGE FOR DARK MODE */}
             <img 
               src="/logo-dm.png" 
               alt="SignifEye Logo Dark" 
               className="w-full h-full object-contain hidden dark:block drop-shadow-sm p-1" // Added tiny p-1 for breathing room against border
             />

          </div>
        </div>

        {/* 🛠️ UPDATED TEXT & STYLING */}
        <p className="text-muted-foreground text-sm md:text-base tracking-wider uppercase font-medium max-w-md">
          AI-Powered Sign Language Recognition
        </p>

        {/* LOADING DOTS */}
        <div className="flex gap-3 mt-8">
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;