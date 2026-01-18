import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AppSettings,
  VerseBookmark,
  VerseHighlight,
  ArabicFont,
  ThemeColor,
  BookmarkColor,
  HighlightColor
} from '@/types/quran';

interface QuranStore {
  // Settings
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;

  // Bookmarks
  bookmarks: VerseBookmark[];
  addBookmark: (surahNumber: number, verseNumber: number, color: BookmarkColor) => void;
  removeBookmark: (surahNumber: number, verseNumber: number) => void;
  getBookmark: (surahNumber: number, verseNumber: number) => VerseBookmark | undefined;

  // Highlights
  highlights: VerseHighlight[];
  addHighlight: (surahNumber: number, verseNumber: number, color: HighlightColor) => void;
  removeHighlight: (surahNumber: number, verseNumber: number) => void;
  getHighlight: (surahNumber: number, verseNumber: number) => VerseHighlight | undefined;

  // Last read position
  lastReadPosition: { surahNumber: number; verseNumber: number } | null;
  setLastReadPosition: (surahNumber: number, verseNumber: number) => void;
}

const defaultSettings: AppSettings = {
  nightMode: false,
  arabicFont: 'noorehuda',
  arabicFontSize: 18,
  arabicFontBold: false,
  translationFont: 'default',
  translationFontSize: 12,
  translationFontBold: false,
  translationFontStyle: 'normal',
  translationDisplay: 'all',
  arabicFontColor: '#166534', // Green - matches default theme
  translationFontColor: '#000000', // Black
  themeColor: 'green',
  fullscreen: false,
};

// Export defaultSettings for reset functionality
export { defaultSettings };

export const useQuranStore = create<QuranStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      bookmarks: [],

      addBookmark: (surahNumber, verseNumber, color) => {
        set((state) => {
          const filtered = state.bookmarks.filter(
            (b) => !(b.surahNumber === surahNumber && b.verseNumber === verseNumber)
          );
          if (color) {
            return { bookmarks: [...filtered, { surahNumber, verseNumber, color }] };
          }
          return { bookmarks: filtered };
        });
      },

      removeBookmark: (surahNumber, verseNumber) => {
        set((state) => ({
          bookmarks: state.bookmarks.filter(
            (b) => !(b.surahNumber === surahNumber && b.verseNumber === verseNumber)
          ),
        }));
      },

      getBookmark: (surahNumber, verseNumber) => {
        return get().bookmarks.find(
          (b) => b.surahNumber === surahNumber && b.verseNumber === verseNumber
        );
      },

      highlights: [],

      addHighlight: (surahNumber, verseNumber, color) => {
        set((state) => {
          const filtered = state.highlights.filter(
            (h) => !(h.surahNumber === surahNumber && h.verseNumber === verseNumber)
          );
          if (color) {
            return { highlights: [...filtered, { surahNumber, verseNumber, color }] };
          }
          return { highlights: filtered };
        });
      },

      removeHighlight: (surahNumber, verseNumber) => {
        set((state) => ({
          highlights: state.highlights.filter(
            (h) => !(h.surahNumber === surahNumber && h.verseNumber === verseNumber)
          ),
        }));
      },

      getHighlight: (surahNumber, verseNumber) => {
        return get().highlights.find(
          (h) => h.surahNumber === surahNumber && h.verseNumber === verseNumber
        );
      },

      lastReadPosition: null,

      setLastReadPosition: (surahNumber, verseNumber) => {
        set({ lastReadPosition: { surahNumber, verseNumber } });
      },
    }),
    {
      name: 'quran-app-storage',
    }
  )
);
