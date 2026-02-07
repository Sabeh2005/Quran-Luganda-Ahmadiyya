import { useState, useEffect } from 'react';
import type { CombinedSurah, CombinedVerse } from '@/types/quran';


const ARABIC_URL = '/data/quran_arabic.json';
const LUGANDA_URL = '/data/quran_luganda_ahmadiyya.json';
const ENGLISH_URL = '/data/quran_english_ahmadiyya.json';

interface FlatVerse {
  surah_number: number;
  surah_name: string;
  ayah_number: number;
  text: string;
}

// New flat Arabic verse structure from the updated JSON
interface FlatArabicVerse {
  surah_number: number;
  surah_name_arabic: string;
  ayah_number: number;
  text_content: string;
}

// Helper to index flat verses by surah and ayah for O(1) lookup
const createVerseMap = (verses: FlatVerse[]) => {
  const map = new Map<string, string>();
  verses.forEach(v => {
    map.set(`${v.surah_number}:${v.ayah_number}`, v.text);
  });
  return map;
};

// Helper to extract Surah names from English data
const extractEnglishSurahNames = (verses: FlatVerse[]) => {
  const map = new Map<number, string>();
  verses.forEach(v => {
    if (!map.has(v.surah_number)) {
      map.set(v.surah_number, v.surah_name);
    }
  });
  return map;
};

// Group flat Arabic verses by surah number
const groupArabicVersesBySurah = (verses: FlatArabicVerse[]): Map<number, FlatArabicVerse[]> => {
  const grouped = new Map<number, FlatArabicVerse[]>();
  verses.forEach(v => {
    const existing = grouped.get(v.surah_number) || [];
    existing.push(v);
    grouped.set(v.surah_number, existing);
  });
  return grouped;
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

        const [arabicData, lugandaData, englishData]: [FlatArabicVerse[], FlatVerse[], FlatVerse[]] = await Promise.all([
          arabicRes.json(),
          lugandaRes.json(),
          englishRes.json(),
        ]);

        const lugandaMap = createVerseMap(lugandaData);
        const englishMap = createVerseMap(englishData);
        const englishSurahNames = extractEnglishSurahNames(englishData);

        // Group Arabic verses by surah
        const arabicBySurah = groupArabicVersesBySurah(arabicData);

        // Build combined surahs from grouped Arabic data
        const combinedSurahs: CombinedSurah[] = [];

        // Sort surah numbers to ensure correct order
        const surahNumbers = Array.from(arabicBySurah.keys()).sort((a, b) => a - b);

        for (const surahNumber of surahNumbers) {
          const arabicVerses = arabicBySurah.get(surahNumber) || [];
          if (arabicVerses.length === 0) continue;

          // const surahInfo = getSurahInfo(surahNumber); // No longer using hardcoded info for names
          const firstVerse = arabicVerses[0];
          const englishName = englishSurahNames.get(surahNumber) || `Surah ${surahNumber}`;

          // Sort verses by ayah number
          arabicVerses.sort((a, b) => a.ayah_number - b.ayah_number);

          const combinedVerses: CombinedVerse[] = arabicVerses.map((arabicVerse) => {
            const verseKey = `${surahNumber}:${arabicVerse.ayah_number}`;
            return {
              verseNumber: arabicVerse.ayah_number,
              arabic: arabicVerse.text_content,
              luganda: lugandaMap.get(verseKey) || '',
              english: englishMap.get(verseKey) || '',
            };
          });

          combinedSurahs.push({
            id: surahNumber,
            number: surahNumber,
            arabicName: firstVerse.surah_name_arabic,
            englishName: englishName,
            englishTranslation: '', // Removed transliteration dependence, maybe use englishName or empty if not provided separately
            revelationType: surahNumber <= 86 ? 'Meccan' : 'Medinan', // Simplified
            totalVerses: combinedVerses.length,
            verses: combinedVerses,
          });
        }

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

