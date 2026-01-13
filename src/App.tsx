import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./contexts/AppContext"; // Import the Provider here
import { registerSW } from 'virtual:pwa-register'; // Import PWA register
import Index from "./pages/Index";
import Guide from "./pages/Guide";
import Practice from "./pages/Practice";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

// Register the PWA service worker to enable offline mode and installation
registerSW({ immediate: true });

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    {/* 🛠️ Move AppProvider here to wrap the entire app for theme persistence */}
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/guide" element={<Guide />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/about" element={<About />} />
            
            {/* Catch-all route for 404s */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;