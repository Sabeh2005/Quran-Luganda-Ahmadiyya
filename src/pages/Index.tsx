import React, { useState, useEffect } from 'react';
import { Loader2, BookOpen, Bookmark } from 'lucide-react';
import { Header } from '@/components/Header';
import { SurahCard } from '@/components/SurahCard';
import { SearchBar } from '@/components/SearchBar';
import { SettingsPanel } from '@/components/SettingsPanel';
import { NavigationModal } from '@/components/NavigationModal';
import { useQuranData } from '@/hooks/useQuranData';
import { useQuranStore } from '@/store/quranStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Index = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const { surahs, loading, error, getSurah } = useQuranData();
  const { settings, bookmarks, lastReadPosition } = useQuranStore();
  const navigate = useNavigate();

  // Handle hydration to prevent UI mismatch and ensure persistent data is loaded
  useEffect(() => {
    setIsHydrated(true);
    // Force a re-render after a tiny delay for mobile browser storage engines
    const timer = setTimeout(() => setIsHydrated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Apply theme and night mode on mount
  useEffect(() => {
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
  }, [settings.nightMode, settings.themeColor]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading the Holy Quran...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <BookOpen className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold">Failed to Load Quran</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  // Group bookmarks by surah
  const bookmarksBySurah = bookmarks.reduce((acc, bookmark) => {
    const key = bookmark.surahNumber;
    if (!acc[key]) acc[key] = [];
    acc[key].push(bookmark);
    return acc;
  }, {} as Record<number, typeof bookmarks>);

  return (
    <div className={cn("min-h-screen transition-colors duration-300", settings.coloredAppBackground ? "bg-primary" : "bg-background")}>
      <Header
        onSettingsClick={() => setSettingsOpen(true)}
        onMenuClick={() => setNavigationOpen(true)}
      />

      <main className="container mx-auto pt-2 pb-6 px-2">
        {/* Continue Reading */}
        {isHydrated && lastReadPosition && (
          <button
            onClick={() => navigate(`/surah/${lastReadPosition.surahNumber}?verse=${lastReadPosition.verseNumber}`)}
            className={cn(
              "w-full mb-2 p-4 rounded-xl transition-all border",
              settings.coloredAppBackground
                ? "bg-card border-border shadow-sm"
                : "bg-primary/10 border-primary/20"
            )}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="text-left flex-1">
                <p className={cn("text-sm", settings.coloredAppBackground ? "text-muted-foreground" : "text-muted-foreground")}>Continue Reading</p>
                <p className="font-semibold text-foreground">
                  {getSurah(lastReadPosition.surahNumber)?.englishName} — Verse {lastReadPosition.verseNumber}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/about');
                }}
                className="p-2 -mr-2 rounded-full hover:bg-black/10 transition-colors text-black"
                title="About"
              >
                <svg stroke="black" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6">
                  <circle cx="12" cy="11.9999" r="9" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                  <rect x="12" y="8" width="0.01" height="0.01" stroke="black" stroke-width="2.25" stroke-linejoin="round" />
                  <path d="M12 12V16" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </div>
          </button>
        )}

        {/* Search Bar */}
        <div className={cn(settings.coloredAppBackground && "text-primary-foreground")}>
          <SearchBar />
        </div>

        <Tabs defaultValue="surahs" className="w-full">
          <TabsList className={cn("w-full grid grid-cols-2 mb-2", settings.coloredAppBackground ? "bg-primary-foreground/10 text-primary-foreground" : "")}>
            <TabsTrigger value="surahs" className={cn("gap-2", settings.coloredAppBackground && "data-[state=active]:bg-card data-[state=active]:text-primary")}>
              <BookOpen className="h-4 w-4" /> Surahs
            </TabsTrigger>
            <TabsTrigger
              value="bookmarks"
              className={cn("gap-2", settings.coloredAppBackground && "data-[state=active]:bg-card data-[state=active]:text-primary")}
              onClick={() => navigate('/bookmarks')}
            >
              <Bookmark className="h-4 w-4" /> Bookmarks ({bookmarks.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="surahs" className="mt-0">
            <div className="space-y-2">
              {surahs.map((surah, index) => (
                <SurahCard key={surah.number} surah={surah} index={index} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <NavigationModal isOpen={navigationOpen} onClose={() => setNavigationOpen(false)} />
    </div>
  );
};

export default Index;
