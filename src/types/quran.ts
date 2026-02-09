// JSON structure from the Quran text files
export interface JsonVerse {
  verseNumber: number;
  text: string;
}

export interface JsonSurah {
  surahNumber: number;
  surahName: string;
  totalVerses: number;
  type: string;
  verses: JsonVerse[];
}

export interface QuranData {
  quran: JsonSurah[];
}

export interface CombinedVerse {
  verseNumber: number;
  arabic: string;
  normalizedArabic: string;
  luganda: string;
  lowercasedLuganda: string;
  english: string;
  lowercasedEnglish: string;
}

export interface CombinedSurah {
  id: number;
  number: number;
  arabicName: string;
  englishName: string;
  englishTranslation: string;
  revelationType: string;
  totalVerses: number;
  verses: CombinedVerse[];
}

export type ArabicFont = 'noorehuda' | 'uthmani' | 'indopak';
export type TranslationFont = 'default' | 'times-new-roman' | 'georgia' | 'libre-baskerville' | 'eb-garamond';
export type TranslationDisplay = 'all' | 'luganda' | 'english' | 'off';
export type ThemeColor = 'green' | 'blue' | 'purple' | 'gold-rose' | 'orange' | 'brown' | 'dark-green' | 'dark-blue' | 'maroon' | 'red' | 'teal' | 'indigo';
export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'orange' | 'purple' | 'red' | 'teal' | 'lime' | 'rose' | null;
export type BookmarkColor = 'red' | 'blue' | 'yellow' | 'purple' | 'green' | 'orange' | 'pink' | 'teal' | 'lime' | 'brown' | null;
export type CollectionColor = 'green' | 'blue' | 'orange' | 'purple' | 'yellow' | 'peach' | 'red' | 'teal' | 'brown' | 'pink';
export type TranslationFontStyle = 'normal' | 'italic' | 'bold-italic';

export interface VerseBookmark {
  surahNumber: number;
  verseNumber: number;
  color: BookmarkColor;
  timestamp?: number; // Add timestamp for sorting
}

export interface BookmarkCollection {
  id: string;
  name: string;
  color: CollectionColor;
  bookmarks: { surahNumber: number; verseNumber: number }[];
}

export interface VerseHighlight {
  surahNumber: number;
  verseNumber: number;
  color: HighlightColor;
}

export interface AppSettings {
  nightMode: boolean;
  arabicFont: ArabicFont;
  arabicFontSize: number;
  arabicFontBold: boolean;
  translationFont: TranslationFont;
  translationFontSize: number;
  translationFontBold: boolean;
  translationFontStyle: TranslationFontStyle;
  translationDisplay: TranslationDisplay;
  arabicFontColor: string;
  translationFontColor: string;
  themeColor: ThemeColor;
  fullscreen: boolean;
}

export interface SearchResult {
  surahNumber: number;
  surahName: string;
  verseNumber: number;
  arabic: string;
  luganda: string;
  english: string;
  matchType: 'arabic' | 'luganda' | 'english';
}
