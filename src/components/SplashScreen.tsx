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
        
        {/* LOGO CONTAINER - 📱 RESPONSIVE SIZE */}
        {/* Mobile: w-48 h-28 | Desktop: w-80 h-48 */}
        <div className="relative w-48 h-28 md:w-80 md:h-48 mb-6 md:mb-8">
          
          {/* Pulsing Background Effect - Adjusted Radius for Mobile */}
          <div className="absolute inset-0 bg-primary/20 rounded-[24px] md:rounded-[40px] animate-ping opacity-75"></div>
          
          {/* Main Container - Adjusted Radius for Mobile */}
          <div className="relative bg-card p-0 rounded-[24px] md:rounded-[40px] shadow-2xl border-4 border-primary/10 h-full w-full flex items-center justify-center overflow-hidden">
              
              {/* ☀️ IMAGE FOR LIGHT MODE */}
              <img 
                src="/logo-lm.png" 
                alt="SignifEye Logo Light" 
                className="w-full h-full object-contain block dark:hidden drop-shadow-sm p-1" 
              />

              {/* 🌙 IMAGE FOR DARK MODE */}
              <img 
                src="/logo-dm.png" 
                alt="SignifEye Logo Dark" 
                className="w-full h-full object-contain hidden dark:block drop-shadow-sm p-1" 
              />

          </div>
        </div>

        {/* 🛠️ UPDATED TEXT SIZE - Smaller on Mobile */}
        <p className="text-muted-foreground text-xs md:text-base tracking-wider uppercase font-medium max-w-md">
          AI-Powered Sign Language Recognition
        </p>

        {/* LOADING DOTS - Smaller on Mobile */}
        <div className="flex gap-2 md:gap-3 mt-6 md:mt-8">
          <div className="w-2 h-2 md:w-3 md:h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 md:w-3 md:h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 md:w-3 md:h-3 bg-primary rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;