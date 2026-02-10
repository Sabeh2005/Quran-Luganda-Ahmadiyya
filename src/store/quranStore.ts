import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type {
  AppSettings,
  VerseBookmark,
  VerseHighlight,
  ArabicFont,
  ThemeColor,
  BookmarkColor,
  HighlightColor,
  BookmarkCollection,
  CollectionColor
} from '@/types/quran';

interface QuranStore {
  // Settings
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;

  // Bookmarks (Single)
  bookmarks: VerseBookmark[];
  addBookmark: (surahNumber: number, verseNumber: number, color?: BookmarkColor) => void;
  removeBookmark: (surahNumber: number, verseNumber: number) => void;
  getBookmark: (surahNumber: number, verseNumber: number) => VerseBookmark | undefined;
  clearAllBookmarks: () => void;

  // Collections
  collections: BookmarkCollection[];
  createCollection: (name: string, color: CollectionColor) => void;
  editCollection: (id: string, name: string, color: CollectionColor) => void;
  deleteCollection: (id: string) => void;
  clearAllCollections: () => void;

  // Collection Bookmarks
  toggleBookmarkInCollection: (collectionId: string, surahNumber: number, verseNumber: number) => void;
  isBookmarkedInCollection: (collectionId: string, surahNumber: number, verseNumber: number) => boolean;

  // Highlights
  highlights: VerseHighlight[];
  addHighlight: (surahNumber: number, verseNumber: number, color: HighlightColor) => void;
  removeHighlight: (surahNumber: number, verseNumber: number) => void;
  getHighlight: (surahNumber: number, verseNumber: number) => VerseHighlight | undefined;
  clearAllHighlights: () => void;

  // Last read position
  lastReadPosition: { surahNumber: number; verseNumber: number } | null;
  searchState: {
    query: string;
    language: 'all' | 'arabic' | 'luganda' | 'english';
    mode: 'similar' | 'exact';
  };
  setSearchState: (state: Partial<QuranStore['searchState']>) => void;
  setLastReadPosition: (surahNumber: number, verseNumber: number) => void;
  clearLastReadPosition: () => void;
}

const defaultSettings: AppSettings = {
  nightMode: false,
  arabicFont: 'noorehuda',
  arabicFontSize: 40,
  arabicFontBold: false,
  translationFont: 'default',
  translationFontSize: 30,
  translationFontBold: false,
  translationFontStyle: 'normal',
  translationDisplay: 'all',
  arabicFontColor: '#166534', // Green - matches default theme
  translationFontColor: '#000000', // Black
  themeColor: 'green',
  coloredBackground: false,
  coloredAppBackground: false,
  fullscreen: false,
  verseHighlightColor: null,
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

      addBookmark: (surahNumber, verseNumber, color = 'green') => {
        set((state) => {
          const filtered = state.bookmarks.filter(
            (b) => !(b.surahNumber === surahNumber && b.verseNumber === verseNumber)
          );
          return { bookmarks: [...filtered, { surahNumber, verseNumber, color: color || 'green', timestamp: Date.now() }] };
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

      clearAllBookmarks: () => {
        set({ bookmarks: [] });
      },

      collections: [],

      createCollection: (name, color) => {
        set((state) => ({
          collections: [
            ...state.collections,
            {
              id: uuidv4(),
              name,
              color,
              bookmarks: [],
            },
          ],
        }));
      },

      editCollection: (id, name, color) => {
        set((state) => ({
          collections: state.collections.map((c) =>
            c.id === id ? { ...c, name, color } : c
          ),
        }));
      },

      deleteCollection: (id) => {
        set((state) => ({
          collections: state.collections.filter((c) => c.id !== id),
        }));
      },

      clearAllCollections: () => {
        set({ collections: [] });
      },

      toggleBookmarkInCollection: (collectionId, surahNumber, verseNumber) => {
        set((state) => ({
          collections: state.collections.map((c) => {
            if (c.id !== collectionId) return c;

            const exists = c.bookmarks.some(
              (b) => b.surahNumber === surahNumber && b.verseNumber === verseNumber
            );

            if (exists) {
              return {
                ...c,
                bookmarks: c.bookmarks.filter(
                  (b) => !(b.surahNumber === surahNumber && b.verseNumber === verseNumber)
                ),
              };
            } else {
              return {
                ...c,
                bookmarks: [...c.bookmarks, { surahNumber, verseNumber }],
              };
            }
          }),
        }));
      },

      isBookmarkedInCollection: (collectionId, surahNumber, verseNumber) => {
        const collection = get().collections.find((c) => c.id === collectionId);
        if (!collection) return false;
        return collection.bookmarks.some(
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

      clearAllHighlights: () => {
        set({ highlights: [] });
      },

      lastReadPosition: null,

      searchState: {
        query: '',
        language: 'all',
        mode: 'exact',
      },
      setSearchState: (state) => set((s) => ({
        searchState: { ...s.searchState, ...state }
      })),
      setLastReadPosition: (surahNumber, verseNumber) => {
        set({ lastReadPosition: { surahNumber, verseNumber } });
      },
      clearLastReadPosition: () => {
        set({ lastReadPosition: null });
      },
    }),
    {
      name: 'quran-app-storage',
    }
  )
);
