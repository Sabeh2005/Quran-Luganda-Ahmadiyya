import { useState, useEffect } from 'react';
import type { QuranData, CombinedSurah, CombinedVerse } from '@/types/quran';
import { getSurahInfo } from '@/data/surahNames';

const ARABIC_URL = '/data/quran_arabic.json';
const LUGANDA_URL = '/data/quran_luganda.json';
const ENGLISH_URL = '/data/quran_english.json';

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

        const [arabicRes, lugandaRes, englishRes] = await Promise.all([
          fetch(ARABIC_URL),
          fetch(LUGANDA_URL),
          fetch(ENGLISH_URL),
        ]);

        if (!arabicRes.ok || !lugandaRes.ok || !englishRes.ok) {
          throw new Error('Failed to fetch Quran data');
        }

        const [arabicData, lugandaData, englishData]: [QuranData, QuranData, QuranData] = await Promise.all([
          arabicRes.json(),
          lugandaRes.json(),
          englishRes.json(),
        ]);

        // Combine the data from the quran array
        const combinedSurahs: CombinedSurah[] = arabicData.quran.map((arabicSurah, index) => {
          const lugandaSurah = lugandaData.quran[index];
          const englishSurah = englishData.quran[index];
          const surahInfo = getSurahInfo(arabicSurah.surahNumber);

          // Map verses preserving exact numbering from JSON
          const combinedVerses: CombinedVerse[] = arabicSurah.verses.map((arabicVerse, vIndex) => ({
            verseNumber: arabicVerse.verseNumber,
            arabic: arabicVerse.text,
            luganda: lugandaSurah?.verses[vIndex]?.text || '',
            english: englishSurah?.verses[vIndex]?.text || '',
          }));

          return {
            id: arabicSurah.surahNumber,
            number: arabicSurah.surahNumber,
            arabicName: arabicSurah.surahName,
            englishName: surahInfo.transliteration,
            englishTranslation: surahInfo.english,
            revelationType: arabicSurah.type,
            totalVerses: arabicSurah.totalVerses,
            verses: combinedVerses,
          };
        });

        setSurahs(combinedSurahs);
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

        // Check Luganda
        // If specific language is selected, prioritize it or check it exclusively if we haven't found a match yet (or just check filtered list)
        // With 'let matchType', we need to be careful. The previous logic prioritized in order: Arabic > Luganda > English.
        // If we want to support explicit search, we should respect the filter.

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

