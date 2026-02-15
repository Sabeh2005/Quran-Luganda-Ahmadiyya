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
import BookmarksPage from "./pages/BookmarksPage";
import SearchPage from "./pages/SearchPage";
import SearchResultDetailPage from "./pages/SearchResultDetailPage";
import NotFound from "./pages/NotFound";
import AboutPage from "./pages/AboutPage";

const queryClient = new QueryClient();

const App = () => {
  const settings = useQuranStore(state => state.settings);

  // Initialize theme color on app load
  // Apply theme and night mode globally
  useEffect(() => {
    updateMetaThemeColor(settings.themeColor);

    // Apply night mode
    if (settings.nightMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Apply theme color
    document.documentElement.classList.remove(
      'theme-blue',
      'theme-purple',
      'theme-gold-rose',
      'theme-orange',
      'theme-brown',
      'theme-dark-green',
      'theme-dark-blue',
      'theme-maroon',
      'theme-red',
      'theme-teal',
      'theme-indigo',
      'theme-deep-sea-green',
      'theme-forest'
    );
    if (settings.themeColor !== 'green') {
      document.documentElement.classList.add(`theme-${settings.themeColor}`);
    }

    // Apply global font family variable
    const fontFamilies = {
      noorehuda: 'Noorehuda, serif',
      uthmani: 'UthmanicHafs, serif',
      indopak: 'IndoPak, serif'
    };
    document.documentElement.style.setProperty('--arabic-font', fontFamilies[settings.arabicFont] || fontFamilies.noorehuda);
  }, [settings.themeColor, settings.nightMode, settings.arabicFont]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/bookmarks" element={<BookmarksPage />} />
            <Route path="/surah/:surahNumber" element={<SurahPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/search/results" element={<SearchResultDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
