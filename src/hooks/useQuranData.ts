import { useState, useEffect } from 'react';
import type { QuranData, CombinedSurah, CombinedVerse } from '@/types/quran';
import { getSurahInfo } from '@/data/surahNames';

const ARABIC_URL = '/data/quran_arabic.json';
const LUGANDA_URL = '/data/quran_luganda_ahmadiyya.json';
const ENGLISH_URL = '/data/quran_english_ahmadiyya.json';

interface FlatVerse {
  surah_number: number;
  surah_name: string;
  ayah_number: number;
  text: string;
}

// Helper to index flat verses by surah and ayah for O(1) lookup
const createVerseMap = (verses: FlatVerse[]) => {
  const map = new Map<string, string>();
  verses.forEach(v => {
    map.set(`${v.surah_number}:${v.ayah_number}`, v.text);
  });
  return map;
};

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

        const [arabicData, lugandaData, englishData]: [QuranData, FlatVerse[], FlatVerse[]] = await Promise.all([
          arabicRes.json(),
          lugandaRes.json(),
          englishRes.json(),
        ]);

        const lugandaMap = createVerseMap(lugandaData);
        const englishMap = createVerseMap(englishData);

        // Combine the data from the quran array
        const combinedSurahs: CombinedSurah[] = arabicData.quran.map((arabicSurah) => {
          const surahInfo = getSurahInfo(arabicSurah.surahNumber);

          // Map verses preserving exact numbering from JSON
          const combinedVerses: CombinedVerse[] = arabicSurah.verses.map((arabicVerse) => {
            const verseKey = `${arabicSurah.surahNumber}:${arabicVerse.verseNumber}`;
            return {
              verseNumber: arabicVerse.verseNumber,
              arabic: arabicVerse.text,
              luganda: lugandaMap.get(verseKey) || '',
              english: englishMap.get(verseKey) || '',
            };
          });

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
        if (!isMatch && (language === 'all' || language === 'luganda') &&
          verse.luganda.toLowerCase().includes(lowerQuery)) {
          matchType = 'luganda';
          isMatch = true;
        }

        // Check English
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

