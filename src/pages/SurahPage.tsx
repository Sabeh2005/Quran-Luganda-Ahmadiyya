import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, BookOpen, ArrowLeft, ArrowRight } from 'lucide-react';
import { VerseCard } from '@/components/VerseCard';
import { SettingsPanel } from '@/components/SettingsPanel';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import settingsIcon from '@/assets/settings-icon.svg';
import backIcon from '@/assets/back-icon.svg';

import { useQuranData } from '@/hooks/useQuranData';
import { useQuranStore } from '@/store/quranStore';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { getArabicTextForFont } from '@/lib/arabicTextUtils';

const SurahPage = () => {
  const { surahNumber } = useParams<{ surahNumber: string }>();
  const [searchParams] = useSearchParams();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const navigate = useNavigate();
  const { getSurah, loading, error } = useQuranData();
  const settings = useQuranStore(state => state.settings);
  const setLastReadPosition = useQuranStore(state => state.setLastReadPosition);
  const verseRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const scrollDirection = useScrollDirection(10, isAutoScrolling);

  const surahNum = parseInt(surahNumber || '1', 10);
  const surah = getSurah(surahNum);
  const targetVerse = searchParams.get('verse');

  const hasPreviousSurah = surahNum > 1;
  const hasNextSurah = surahNum < 114;

  const goToPreviousSurah = () => {
    if (hasPreviousSurah) {
      navigate(`/surah/${surahNum - 1}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToNextSurah = () => {
    if (hasNextSurah) {
      navigate(`/surah/${surahNum + 1}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getArabicFontClass = () => {
    switch (settings.arabicFont) {
      case 'uthmani': return 'font-uthmani';
      case 'indopak': return 'font-indopak';
      default: return 'font-noorehuda';
    }
  };

  // Apply theme and night mode
  useEffect(() => {
    if (settings.nightMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

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



  // Scroll to top when surah changes (unless verse is specified)
  useEffect(() => {
    if (!targetVerse) {
      window.scrollTo(0, 0);
    }
  }, [surahNum, targetVerse]);

  // Scroll to target verse
  useEffect(() => {
    if (targetVerse && verseRefs.current[parseInt(targetVerse)] && surah) {
      // Set auto-scrolling to true to keep header visible
      setIsAutoScrolling(true);

      setTimeout(() => {
        const element = verseRefs.current[parseInt(targetVerse)];
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }

        // Re-enable header hiding after scroll completes
        setTimeout(() => setIsAutoScrolling(false), 2000);
      }, 500);
    }
  }, [targetVerse, surah]);

  // Track last read position on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!surah) return;

      const viewportCenter = window.innerHeight / 2;
      let closestVerse = 1;
      let closestDistance = Infinity;

      Object.entries(verseRefs.current).forEach(([verseNum, ref]) => {
        if (ref) {
          const rect = ref.getBoundingClientRect();
          const distance = Math.abs(rect.top + rect.height / 2 - viewportCenter);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestVerse = parseInt(verseNum);
          }
        }
      });

      setLastReadPosition(surahNum, closestVerse);
    };

    const debounced = debounce(handleScroll, 500);
    window.addEventListener('scroll', debounced);
    return () => window.removeEventListener('scroll', debounced);
  }, [surah, surahNum, setLastReadPosition]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading Surah...</p>
        </div>
      </div>
    );
  }

  if (error || !surah) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <BookOpen className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold">Surah Not Found</h2>
          <p className="text-muted-foreground">{error || 'This surah could not be loaded.'}</p>
        </div>
      </div>
    );
  }

  const surahDisplayName = `${surah.englishName} — ${surah.arabicName}`;



  // Determine if header should be hidden based on scroll direction
  const isHeaderHidden = scrollDirection === 'down';

  return (
    <div className={cn("min-h-screen transition-colors duration-300", settings.coloredAppBackground ? "bg-primary" : "bg-background")}>
      {/* Header for Surah Page with back button and settings */}
      <header
        className={`sticky top-0 z-40 w-full transition-transform duration-300 ${isHeaderHidden ? '-translate-y-full' : 'translate-y-0'
          }`}
      >
        <div className="header-gradient px-0 py-4 shadow-lg">
          <div className="flex items-center justify-between px-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <img src={backIcon} alt="Back" className="h-6 w-6 brightness-0 invert" />
            </Button>
            <div className="text-center">
              <h1 className="text-lg font-bold text-primary-foreground">{surahDisplayName}</h1>
              <p className="text-sm text-primary-foreground/80">
                {surah.totalVerses} verses • {surah.revelationType}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSettingsOpen(true)}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <img src={settingsIcon} alt="Settings" className="h-6 w-6 brightness-0 invert" />
            </Button>
          </div>
        </div>

      </header>

      <main className="container mx-auto pt-2 pb-6 px-2">
        {/* Surah header */}
        {/* Surah header */}
        {/* Surah header */}
        <div
          className={cn(
            "verse-card surah-header-shadow text-center mb-2 p-6 rounded-xl relative transition-all duration-300",
            "bg-primary text-primary-foreground"
          )}
        >
          <p className={cn("text-5xl mb-2 text-primary-foreground", getArabicFontClass())} dir="rtl">
            {getArabicTextForFont(surah.arabicName, settings.arabicFont)}
          </p>
          <h2 className="text-3xl font-semibold text-primary-foreground">
            {surah.englishName}
          </h2>
          <p className="text-xl text-primary-foreground mt-2">
            Chapter No: {surahNum}
          </p>
          <div className="flex items-center justify-center gap-4 mt-3 text-base text-primary-foreground font-medium">
            <span>{surah.totalVerses} Verses</span>
            <span>•</span>
            <span>{surah.revelationType}</span>
          </div>
        </div>

        {/* Verses */}
        <div className="space-y-2">
          {surah.verses.map((verse) => (
            <div
              key={verse.verseNumber}
              ref={(el) => { verseRefs.current[verse.verseNumber] = el; }}
              className="scroll-mt-[88px]"
            >
              <VerseCard
                verse={verse}
                surahNumber={surahNum}
                surahName={surahDisplayName}
                isSurahView={true}
              />
            </div>
          ))}
        </div>

        {/* Surah Navigation Buttons */}
        <div className={cn("flex justify-between items-center mt-8 pt-6 border-t", settings.coloredAppBackground ? "border-primary-foreground/20" : "border-border")}>
          {hasPreviousSurah ? (
            <Button
              onClick={goToPreviousSurah}
              className={cn(
                "flex items-center gap-2 transition-all",
                settings.coloredAppBackground
                  ? "bg-card text-primary hover:bg-card/90 shadow-sm"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Previous Surah</span>
            </Button>
          ) : (
            <div></div>
          )}

          {hasNextSurah ? (
            <Button
              onClick={goToNextSurah}
              className={cn(
                "flex items-center gap-2 transition-all",
                settings.coloredAppBackground
                  ? "bg-card text-primary hover:bg-card/90 shadow-sm"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              <span>Next Surah</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <div></div>
          )}
        </div>
      </main>

      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
};

// Debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default SurahPage;
