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
  searchVerses: (query: string) => SearchResult[];
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

  const searchVerses = (query: string): SearchResult[] => {
    if (!query.trim()) return [];

    const results: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    surahs.forEach((surah) => {
      surah.verses.forEach((verse) => {
        let matchType: 'arabic' | 'luganda' | 'english' | null = null;

        if (verse.arabic.includes(query)) {
          matchType = 'arabic';
        } else if (verse.luganda.toLowerCase().includes(lowerQuery)) {
          matchType = 'luganda';
        } else if (verse.english.toLowerCase().includes(lowerQuery)) {
          matchType = 'english';
        }

        if (matchType) {
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

    return results.slice(0, 50); // Limit results
  };

  return { surahs, loading, error, getSurah, searchVerses };
};
