import { useState, useEffect, useCallback, useMemo } from 'react';
import type { CombinedSurah, CombinedVerse, SearchResult } from '@/types/quran';


const ARABIC_URL = '/data/quran_arabic_ahmadiyya.json';
const LUGANDA_URL = '/data/quran_luganda_ahmadiyya.json';
const ENGLISH_URL = '/data/quran_english_ahmadiyya.json';
const TRANSLITERATION_URL = '/data/quran_transliteration.json';

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



import { normalizeArabic, normalizeText } from '@/lib/highlight';



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
          const [arabicRes, lugandaRes, englishRes, transliterationRes] = await Promise.all([
            fetch(ARABIC_URL),
            fetch(LUGANDA_URL),
            fetch(ENGLISH_URL),
            fetch(TRANSLITERATION_URL),
          ]);

          if (!arabicRes.ok || !lugandaRes.ok || !englishRes.ok || !transliterationRes.ok) {
            throw new Error('Failed to fetch Quran data');
          }

          const [arabicData, lugandaData, englishData, transliterationData]: [FlatArabicVerse[], FlatVerse[], FlatVerse[], FlatVerse[]] = await Promise.all([
            arabicRes.json(),
            lugandaRes.json(),
            englishRes.json(),
            transliterationRes.json(),
          ]);

          const lugandaMap = createVerseMap(lugandaData);
          const englishMap = createVerseMap(englishData);
          const transliterationMap = createVerseMap(transliterationData);
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
              const lugandaText = lugandaMap.get(verseKey) || '';
              const englishText = englishMap.get(verseKey) || '';
              const transliterationText = transliterationMap.get(verseKey) || '';

              return {
                verseNumber: arabicVerse.ayah_number,
                arabic: arabicVerse.text_content.normalize('NFKC'), // Normalize presentation forms to standard Arabic
                normalizedArabic: normalizeArabic(arabicVerse.text_content), // For search
                luganda: lugandaText,
                normalizedLuganda: normalizeText(lugandaText),
                english: englishText,
                normalizedEnglish: normalizeText(englishText),
                transliteration: transliterationText,
                normalizedTransliteration: normalizeText(transliterationText),
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


  const getSurah = useCallback((surahNumber: number): CombinedSurah | undefined => {
    return surahs.find((s) => s.number === surahNumber);
  }, [surahs]);

  const searchVerses = useCallback((query: string, language: 'all' | 'arabic' | 'luganda' | 'english' = 'all', mode: 'similar' | 'exact' = 'similar'): SearchResult[] => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return [];

    const results: SearchResult[] = [];

    // 1. Prepare normalized query versions
    const normalizedArabicQuery = normalizeArabic(trimmedQuery);
    const normalizedTextQuery = normalizeText(trimmedQuery);
    const queryWords = normalizedTextQuery.split(' ').filter(word => word.length > 0);

    // 2. Exact match regexes for when 'exact' mode is on
    const escapedArabicQuery = normalizedArabicQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const exactArabicRegex = new RegExp(`(^|[^\\p{L}\\p{M}])(${escapedArabicQuery})([^\\p{L}\\p{M}]|$)`, 'ui');

    // English/Luganda exact regexes (one for each word)
    const exactWordRegexes = queryWords.map(word => {
      const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`(^|[^\\p{L}\\p{M}])(${escaped})([^\\p{L}\\p{M}]|$)`, 'ui');
    });

    surahs.forEach((surah) => {
      // Check if Surah name matches (Surah Jump improvement)
      let surahMatches = false;
      if (language === 'all') {
        const normSurahEng = normalizeText(surah.englishName);
        if (normSurahEng.includes(normalizedTextQuery)) surahMatches = true;
      }

      surah.verses.forEach((verse) => {
        let matchType: SearchResult['matchType'] | null = null;
        let isMatch = false;

        // A. Surah Name Priority
        if (surahMatches && verse.verseNumber === 1) {
          matchType = 'surah';
          isMatch = true;
        }

        // B. Check Arabic
        if (!isMatch && (language === 'all' || language === 'arabic')) {
          const normalizedVerseArabic = verse.normalizedArabic;
          if (mode === 'exact') {
            if (exactArabicRegex.test(normalizedVerseArabic)) {
              matchType = 'arabic';
              isMatch = true;
            }
          } else {
            if (normalizedVerseArabic.includes(normalizedArabicQuery)) {
              matchType = 'arabic';
              isMatch = true;
            }
          }
        }

        // C. Check Luganda
        if (!isMatch && (language === 'all' || language === 'luganda')) {
          const target = verse.normalizedLuganda;
          if (mode === 'exact') {
            // ALl words must match exactly
            const allWordsMatch = exactWordRegexes.every(re => re.test(target));
            if (allWordsMatch && queryWords.length > 0) {
              matchType = 'luganda';
              isMatch = true;
            }
          } else {
            // All words must be present in any order (Multi-word search improvement)
            const allWordsPresent = queryWords.every(word => target.includes(word));
            if (allWordsPresent && queryWords.length > 0) {
              matchType = 'luganda';
              isMatch = true;
            }
          }
        }

        // D. Check English
        if (!isMatch && (language === 'all' || language === 'english')) {
          const target = verse.normalizedEnglish;
          if (mode === 'exact') {
            const allWordsMatch = exactWordRegexes.every(re => re.test(target));
            if (allWordsMatch && queryWords.length > 0) {
              matchType = 'english';
              isMatch = true;
            }
          } else {
            const allWordsPresent = queryWords.every(word => target.includes(word));
            if (allWordsPresent && queryWords.length > 0) {
              matchType = 'english';
              isMatch = true;
            }
          }
        }

        // E. Check Transliteration
        if (!isMatch && (language === 'all')) {
          const target = verse.normalizedTransliteration;
          // Use English logic for transliteration as it uses Latin script
          if (mode === 'exact') {
            const allWordsMatch = exactWordRegexes.every(re => re.test(target));
            if (allWordsMatch && queryWords.length > 0) {
              matchType = 'transliteration';
              isMatch = true;
            }
          } else {
            const allWordsPresent = queryWords.every(word => target.includes(word));
            if (allWordsPresent && queryWords.length > 0) {
              matchType = 'transliteration';
              isMatch = true;
            }
          }
        }

        if (isMatch && matchType) {
          results.push({
            surahNumber: surah.number,
            surahName: `${surah.englishName} — ${surah.arabicName}`,
            verseNumber: verse.verseNumber,
            arabic: verse.arabic,
            normalizedArabic: verse.normalizedArabic,
            luganda: verse.luganda,
            normalizedLuganda: verse.normalizedLuganda,
            english: verse.english,
            normalizedEnglish: verse.normalizedEnglish,
            transliteration: verse.transliteration,
            normalizedTransliteration: verse.normalizedTransliteration,
            matchType,
          });
        }
      });
    });

    return results;
  }, [surahs]);

  return useMemo(() => ({
    surahs,
    loading,
    error,
    getSurah,
    searchVerses
  }), [surahs, loading, error, getSurah, searchVerses]);
};

