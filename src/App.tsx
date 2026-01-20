import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useQuranStore } from "@/store/quranStore";
import { updateMetaThemeColor } from "@/utils/themeColors";
import Index from "./pages/Index";
import SurahPage from "./pages/SurahPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const { settings } = useQuranStore();

  // Initialize theme color on app load
  useEffect(() => {
    updateMetaThemeColor(settings.themeColor);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/surah/:surahNumber" element={<SurahPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
