import { CombinedSurah, CombinedVerse, VisualMarkers } from '@/types/quran';

// Types for the raw JSON files
interface RawArabicVerse {
    surah_number: number;
    ayah_number: number;
    text_content: string;
    visual_markers: VisualMarkers;
    surah_name_arabic?: string;
    meta: {
        juz: number;
        manzil: number;
        is_sajdah: boolean;
        is_hizb_start?: boolean;
        is_ruku_end?: boolean;
        is_rubba?: boolean;
        is_nisf?: boolean;
        is_thuluth?: boolean;
    };
}

interface RawEnglishVerse {
    surah_number: number;
    surah_name: string;
    ayah_number: number;
    text: string;
}

// Luganda file has same structure as English one based on inspection
interface RawLugandaVerse {
    surah_number: number;
    surah_name: string;
    ayah_number: number;
    text: string;
}

const ARABIC_URL = '/data/quran_arabic_ahmadiyya.json';
const ENGLISH_URL = '/data/quran_english_ahmadiyya.json';
const LUGANDA_URL = '/data/quran_luganda_ahmadiyya.json';

export const fetchQuranData = async (): Promise<CombinedSurah[]> => {
    try {
        const [arabicRes, englishRes, lugandaRes] = await Promise.all([
            fetch(ARABIC_URL),
            fetch(ENGLISH_URL),
            fetch(LUGANDA_URL)
        ]);

        if (!arabicRes.ok || !englishRes.ok || !lugandaRes.ok) {
            throw new Error(`Failed to load data files: Arabic(${arabicRes.status}), English(${englishRes.status}), Luganda(${lugandaRes.status})`);
        }

        const arabicData: RawArabicVerse[] = await arabicRes.json();
        const englishData: RawEnglishVerse[] = await englishRes.json();
        const lugandaData: RawLugandaVerse[] = await lugandaRes.json();

        // Index translation data for faster lookup: [surah_num][ayah_num] -> text
        // Using simple objects or Maps. Arrays of Maps might be efficient enough.
        const englishMap = new Map<string, string>();
        const lugandaMap = new Map<string, string>();
        const englishSurahNames = new Map<number, string>();
        const arabicSurahNames = new Map<number, string>();

        // Build Lookups for English
        englishData.forEach(v => {
            englishMap.set(`${v.surah_number}:${v.ayah_number}`, v.text);
            if (!englishSurahNames.has(v.surah_number)) {
                englishSurahNames.set(v.surah_number, v.surah_name);
            }
        });

        // Build Lookups for Luganda
        lugandaData.forEach(v => {
            lugandaMap.set(`${v.surah_number}:${v.ayah_number}`, v.text);
        });

        // Process Arabic Data (Master Source)
        // We need to group by Surah
        const surahsMap = new Map<number, CombinedSurah>();

        arabicData.forEach((verse) => {
            const sNum = verse.surah_number;
            const vNum = verse.ayah_number;
            const key = `${sNum}:${vNum}`;

            // Capture Arabic Name if present
            if (verse.surah_name_arabic && !arabicSurahNames.has(sNum)) {
                arabicSurahNames.set(sNum, verse.surah_name_arabic);
            }

            // Initialize Surah object if not exists
            if (!surahsMap.has(sNum)) {
                surahsMap.set(sNum, {
                    id: sNum,
                    number: sNum,
                    arabicName: "", // Will populate later
                    englishName: "", // Will populate later
                    englishTranslation: "", // Not available in new data? We'll use English Name for now
                    revelationType: "", // Not in new data, might need to infer or omit
                    totalVerses: 0,
                    verses: []
                });
            }

            const surah = surahsMap.get(sNum)!;

            // Construct CombinedVerse
            const combinedVerse: CombinedVerse = {
                verseNumber: vNum,
                arabic: verse.text_content,
                english: englishMap.get(key) || "",
                luganda: lugandaMap.get(key) || "",
                visualMarkers: verse.visual_markers
            };

            surah.verses.push(combinedVerse);
        });

        // Finalize Surahs (sort verses, add names)
        const sortedSurahs = Array.from(surahsMap.values()).sort((a, b) => a.number - b.number);

        sortedSurahs.forEach(surah => {
            surah.verses.sort((a, b) => a.verseNumber - b.verseNumber);
            surah.totalVerses = surah.verses.length;
            surah.arabicName = arabicSurahNames.get(surah.number) || `Surah ${surah.number}`;
            surah.englishName = englishSurahNames.get(surah.number) || `Surah ${surah.number}`;
            surah.englishName = englishSurahNames.get(surah.number) || `Surah ${surah.number}`;
            // Determine revelation type using static mapping
            surah.revelationType = REVELATION_TYPES[surah.number] || "";
            surah.englishTranslation = "";
        });

        return sortedSurahs;

    } catch (error) {
        console.error("Error fetching Quran data:", error);
        throw error;
    }
};

const REVELATION_TYPES: Record<number, string> = {
    1: "Meccan", 2: "Medinan", 3: "Medinan", 4: "Medinan", 5: "Medinan", 6: "Meccan", 7: "Meccan", 8: "Medinan", 9: "Medinan", 10: "Meccan",
    11: "Meccan", 12: "Meccan", 13: "Medinan", 14: "Meccan", 15: "Meccan", 16: "Meccan", 17: "Meccan", 18: "Meccan", 19: "Meccan", 20: "Meccan",
    21: "Meccan", 22: "Medinan", 23: "Meccan", 24: "Medinan", 25: "Meccan", 26: "Meccan", 27: "Meccan", 28: "Meccan", 29: "Meccan", 30: "Meccan",
    31: "Meccan", 32: "Meccan", 33: "Medinan", 34: "Meccan", 35: "Meccan", 36: "Meccan", 37: "Meccan", 38: "Meccan", 39: "Meccan", 40: "Meccan",
    41: "Meccan", 42: "Meccan", 43: "Meccan", 44: "Meccan", 45: "Meccan", 46: "Meccan", 47: "Medinan", 48: "Medinan", 49: "Medinan", 50: "Meccan",
    51: "Meccan", 52: "Meccan", 53: "Meccan", 54: "Meccan", 55: "Medinan", 56: "Meccan", 57: "Medinan", 58: "Medinan", 59: "Medinan", 60: "Medinan",
    61: "Medinan", 62: "Medinan", 63: "Medinan", 64: "Medinan", 65: "Medinan", 66: "Medinan", 67: "Meccan", 68: "Meccan", 69: "Meccan", 70: "Meccan",
    71: "Meccan", 72: "Meccan", 73: "Meccan", 74: "Meccan", 75: "Meccan", 76: "Medinan", 77: "Meccan", 78: "Meccan", 79: "Meccan", 80: "Meccan",
    81: "Meccan", 82: "Meccan", 83: "Meccan", 84: "Meccan", 85: "Meccan", 86: "Meccan", 87: "Meccan", 88: "Meccan", 89: "Meccan", 90: "Meccan",
    91: "Meccan", 92: "Meccan", 93: "Meccan", 94: "Meccan", 95: "Meccan", 96: "Meccan", 97: "Meccan", 98: "Medinan", 99: "Medinan", 100: "Meccan",
    101: "Meccan", 102: "Meccan", 103: "Meccan", 104: "Meccan", 105: "Meccan", 106: "Meccan", 107: "Meccan", 108: "Meccan", 109: "Meccan", 110: "Medinan",
    111: "Meccan", 112: "Meccan", 113: "Meccan", 114: "Meccan"
};
