import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./contexts/AppContext";
import { useState } from "react";

// Components
import SplashScreen from "./components/SplashScreen"; // Import the new component

// Pages
import Index from "./pages/Index";      // This is the Recognize Page
import About from "./pages/About";      // This will be the new Landing Page
import Guide from "./pages/Guide";
import Practice from "./pages/Practice";
import NotFound from "./pages/NotFound";
import Dataset from "./pages/Dataset";

const queryClient = new QueryClient();

const App = () => {
  // State to track if splash screen is finished
  const [showSplash, setShowSplash] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          
          {/* 👇 LOGIC: Show Splash first, then App */}
          {showSplash ? (
            <SplashScreen onFinish={() => setShowSplash(false)} />
          ) : (
            <BrowserRouter>
              <Routes>
                {/* 🔄 ROUTING CHANGES:
                  1. '/' is now About (Landing Page)
                  2. '/recognize' is now Index (Camera Page)
                */}
                <Route path="/" element={<About />} />
                <Route path="/recognize" element={<Index />} />
                
                <Route path="/guide" element={<Guide />} />
                <Route path="/practice" element={<Practice />} />
                <Route path="/dataset" element={<Dataset />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          )}
          
        </TooltipProvider>
      </AppProvider>
    </QueryClientProvider>
  );
};

export default App;