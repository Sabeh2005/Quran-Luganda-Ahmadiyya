import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, BookOpen, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { VerseCard } from '@/components/VerseCard';
import { Button } from '@/components/ui/button';

import { useQuranData } from '@/hooks/useQuranData';
import { useQuranStore } from '@/store/quranStore';
import { getSurahInfo, getSurahDisplayName } from '@/data/surahNames';

const SurahPage = () => {
  const { surahNumber } = useParams<{ surahNumber: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getSurah, loading, error } = useQuranData();
  const { settings, setLastReadPosition } = useQuranStore();
  const verseRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const surahNum = parseInt(surahNumber || '1', 10);
  const surah = getSurah(surahNum);
  const surahInfo = getSurahInfo(surahNum);
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

  // Apply theme and night mode
  useEffect(() => {
    if (settings.nightMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    document.documentElement.classList.remove(
      'theme-blue', 'theme-purple', 'theme-gold-rose', 'theme-orange', 'theme-brown', 'theme-black'
    );
    if (settings.themeColor !== 'green') {
      document.documentElement.classList.add(`theme-${settings.themeColor}`);
    }
  }, [settings.nightMode, settings.themeColor]);

  // Scroll to target verse
  useEffect(() => {
    if (targetVerse && verseRefs.current[parseInt(targetVerse)]) {
      setTimeout(() => {
        verseRefs.current[parseInt(targetVerse)]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
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

  const surahDisplayName = getSurahDisplayName(surahNum);

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header for Surah Page - No settings icon */}
      <header className="sticky top-0 z-40 w-full">
        <div className="header-gradient px-4 py-4 shadow-lg">
          <div className="container mx-auto flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-primary-foreground">{surahDisplayName}</h1>
              <p className="text-sm text-primary-foreground/80">
                {surah.totalVerses} verses • {surah.revelationType}
              </p>
            </div>
          </div>
        </div>
        <div className="h-2 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />
      </header>

      <main className="container mx-auto py-6 px-4">
        {/* Surah header */}
        <div className="text-center mb-8 p-6 rounded-2xl bg-card border border-border">
          <p className="text-4xl font-noorehuda text-primary mb-2" dir="rtl">
            {surahInfo.arabic}
          </p>
          <h2 className="text-2xl font-semibold text-foreground">
            {surahInfo.transliteration}
          </h2>
          <div className="flex items-center justify-center gap-4 mt-3 text-sm text-muted-foreground">
            <span>{surah.totalVerses} Verses</span>
            <span>•</span>
            <span>{surah.revelationType}</span>
          </div>
        </div>

        {/* Verses */}
        <div className="space-y-4">
          {surah.verses.map((verse) => (
            <div 
              key={verse.verseNumber}
              ref={(el) => { verseRefs.current[verse.verseNumber] = el; }}
            >
              <VerseCard
                verse={verse}
                surahNumber={surahNum}
                surahName={surahDisplayName}
              />
            </div>
          ))}
        </div>

        {/* Surah Navigation Buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
          {hasPreviousSurah ? (
            <Button
              onClick={goToPreviousSurah}
              className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Previous Surah</span>
            </Button>
          ) : (
            <div></div>
          )}

          {hasNextSurah ? (
            <Button
              onClick={goToNextSurah}
              className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <span>Next Surah</span>
              <ChevronRight className="h-5 w-5" />
            </Button>
          ) : (
            <div></div>
          )}
        </div>
      </main>
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
