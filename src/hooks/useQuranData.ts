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
  searchVerses: (query: string, language?: 'all' | 'arabic' | 'luganda' | 'english', mode?: 'similar' | 'exact') => SearchResult[];
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

import { normalizeArabic } from '@/lib/highlight';



let cachedData: CombinedSurah[] | null = null;
let fetchLoadingPromise: Promise<CombinedSurah[]> | null = null;

export const useQuranData = (): UseQuranDataReturn => {
  // Module-level cache
  const [surahs, setSurahs] = useState<CombinedSurah[]>(cachedData || []);
  const [loading, setLoading] = useState(!cachedData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cachedData) {
      setLoading(false);
      return;
    }

    if (!fetchLoadingPromise) {
      fetchLoadingPromise = (async () => {
        try {
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
          const arabicBySurah = groupArabicVersesBySurah(arabicData);

          const combinedSurahs: CombinedSurah[] = [];
          const surahNumbers = Array.from(arabicBySurah.keys()).sort((a, b) => a - b);

          for (const surahNumber of surahNumbers) {
            const arabicVerses = arabicBySurah.get(surahNumber) || [];
            if (arabicVerses.length === 0) continue;

            const firstVerse = arabicVerses[0];
            const englishName = englishSurahNames.get(surahNumber) || `Surah ${surahNumber}`;

            arabicVerses.sort((a, b) => a.ayah_number - b.ayah_number);

            const combinedVerses: CombinedVerse[] = arabicVerses.map((arabicVerse) => {
              const verseKey = `${surahNumber}:${arabicVerse.ayah_number}`;
              const arabicText = arabicVerse.text_content;
              return {
                verseNumber: arabicVerse.ayah_number,
                arabic: arabicText,
                normalizedArabic: normalizeArabic(arabicText),
                luganda: lugandaMap.get(verseKey) || '',
                english: englishMap.get(verseKey) || '',
              };
            });

            combinedSurahs.push({
              id: surahNumber,
              number: surahNumber,
              arabicName: firstVerse.surah_name_arabic,
              englishName: englishName,
              englishTranslation: '',
              revelationType: surahNumber <= 86 ? 'Meccan' : 'Medinan',
              totalVerses: combinedVerses.length,
              verses: combinedVerses,
            });
          }

          cachedData = combinedSurahs;
          return combinedSurahs;
        } catch (err) {
          throw err;
        }
      })();
    }

    fetchLoadingPromise
      .then((data) => {
        setSurahs(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
        fetchLoadingPromise = null; // Reset promise on error so we can try again
      });

  }, []);


  const getSurah = (surahNumber: number): CombinedSurah | undefined => {
    return surahs.find((s) => s.number === surahNumber);
  };

  const searchVerses = (query: string, language: 'all' | 'arabic' | 'luganda' | 'english' = 'all', mode: 'similar' | 'exact' = 'similar'): SearchResult[] => {
    if (!query.trim()) return [];

    const results: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();
    const normalizedQuery = normalizeArabic(query);

    // Regex for exact match (word boundary check) for non-Arabic
    // We use a more robust check for whole words that works better with various characters
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const exactRegex = new RegExp(`(^|[^\\p{L}\\p{M}])(${escapedQuery})([^\\p{L}\\p{M}]|$)`, 'ui');

    // Arabic exact regex (on normalized text)
    const escapedArabicQuery = normalizedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const exactArabicRegex = new RegExp(`(^|[^\\p{L}\\p{M}])(${escapedArabicQuery})([^\\p{L}\\p{M}]|$)`, 'ui');

    surahs.forEach((surah) => {
      surah.verses.forEach((verse) => {
        let matchType: 'arabic' | 'luganda' | 'english' | null = null;
        let isMatch = false;

        // Check Arabic
        if ((language === 'all' || language === 'arabic')) {
          const normalizedVerseArabic = verse.normalizedArabic;
          if (mode === 'exact') {
            if (exactArabicRegex.test(normalizedVerseArabic)) {
              matchType = 'arabic';
              isMatch = true;
            }
          } else {
            if (normalizedVerseArabic.includes(normalizedQuery)) {
              matchType = 'arabic';
              isMatch = true;
            }
          }
        }

        // Check Luganda
        if (!isMatch && (language === 'all' || language === 'luganda')) {
          if (mode === 'exact') {
            if (exactRegex.test(verse.luganda)) {
              matchType = 'luganda';
              isMatch = true;
            }
          } else {
            if (verse.luganda.toLowerCase().includes(lowerQuery)) {
              matchType = 'luganda';
              isMatch = true;
            }
          }
        }

        // Check English
        if (!isMatch && (language === 'all' || language === 'english')) {
          if (mode === 'exact') {
            if (exactRegex.test(verse.english)) {
              matchType = 'english';
              isMatch = true;
            }
          } else {
            if (verse.english.toLowerCase().includes(lowerQuery)) {
              matchType = 'english';
              isMatch = true;
            }
          }
        }

        // Double check to prioritize correct match type if found
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

