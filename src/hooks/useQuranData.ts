import { useState, useEffect } from 'react';
import type { CombinedSurah } from '@/types/quran';
import { fetchQuranData } from '@/lib/quranUtils';

interface UseQuranDataReturn {
  surahs: CombinedSurah[];
  loading: boolean;
  error: string | null;
  getSurah: (surahNumber: number) => CombinedSurah | undefined;
  searchVerses: (query: string, language?: 'all' | 'arabic' | 'luganda' | 'english') => SearchResult[];
}

interface SearchResult {
  surahNumber: number;
  surahName: string;
  verseNumber: number;
  arabic: string;
  luganda: string;
  english: string;
  matchType: 'arabic' | 'luganda' | 'english';
}

const normalizeArabic = (text: string): string => {
  return text
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, '')
    .replace(/[\u0622\u0623\u0625\u0671\u0672\u0673\u0675]/g, '\u0627'); // Normalize Alif variants to bare Alif
};

export const useQuranData = (): UseQuranDataReturn => {
  const [surahs, setSurahs] = useState<CombinedSurah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchQuranData();
        setSurahs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getSurah = (surahNumber: number): CombinedSurah | undefined => {
    return surahs.find((s) => s.number === surahNumber);
  };

  const searchVerses = (query: string, language: 'all' | 'arabic' | 'luganda' | 'english' = 'all'): SearchResult[] => {
    if (!query.trim()) return [];

    const results: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();
    const normalizedQuery = normalizeArabic(query);

    surahs.forEach((surah) => {
      surah.verses.forEach((verse) => {
        let matchType: 'arabic' | 'luganda' | 'english' | null = null;
        let isMatch = false;

        // Check Arabic
        if ((language === 'all' || language === 'arabic') &&
          normalizeArabic(verse.arabic).includes(normalizedQuery)) {
          matchType = 'arabic';
          isMatch = true;
        }

        if (!isMatch && (language === 'all' || language === 'luganda') &&
          verse.luganda.toLowerCase().includes(lowerQuery)) {
          matchType = 'luganda';
          isMatch = true;
        }

        if (!isMatch && (language === 'all' || language === 'english') &&
          verse.english.toLowerCase().includes(lowerQuery)) {
          matchType = 'english';
          isMatch = true;
        }

        if (isMatch && matchType) {
          results.push({
            surahNumber: surah.number,
            surahName: `${surah.englishName} — ${surah.arabicName}`,
            verseNumber: verse.verseNumber,
            arabic: verse.arabic,
            luganda: verse.luganda,
            english: verse.english,
            matchType,
          });
        }
      });
    });

    return results;
  };

  return { surahs, loading, error, getSurah, searchVerses };
};

