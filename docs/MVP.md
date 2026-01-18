# The Holy Quran App - MVP Document

## Minimum Viable Product (MVP) Specification

### Project Overview

A comprehensive Quran application featuring Arabic text with Luganda and English translations, built with modern web technologies. The app uses the Ahmadiyya Muslim verse numbering system and provides extensive customization options.

---

## Core Features (MVP)

### 1. Quran Reading
- **114 Complete Surahs**: All chapters of the Holy Quran
- **Complete Verses**: All verses from each Surah
- **Trilingual Support**: 
  - Arabic (original text)
  - Luganda translation (first)
  - English translation (second)
- **Ahmadiyya Verse Numbering**: Preserved from source JSON files

### 2. Surah Navigation
- **Surah List**: Browse all 114 Surahs with:
  - Arabic name
  - English transliteration
  - English meaning
  - Verse count
  - Revelation type (Meccan/Medinan)
- **Surah Detail Page**: Read complete Surah with all verses

### 3. Search Functionality
- **Global Search**: Search across all verses
- **Multi-language Search**: Search in Arabic, Luganda, or English
- **Instant Results**: Real-time search with debouncing
- **Direct Navigation**: Click search result to jump to verse

### 4. Bookmarking System
- **Four Bookmark Colors**: Red, Blue, Yellow, Purple
- **Per-Verse Bookmarks**: Mark any verse
- **Bookmark List**: View all bookmarks organized by Surah
- **Persistent Storage**: Bookmarks saved locally

### 5. Highlighting System
- **Four Highlight Colors**: Yellow, Green, Blue, Pink
- **Background Highlighting**: Visual distinction for important verses
- **Toggle On/Off**: Easy to add or remove

### 6. Share & Copy
- **Copy Verse**: Copy Arabic + translations to clipboard
- **Share Verse**: Native sharing on supported devices
- **Formatted Output**: Includes Surah name and verse number

### 7. Customization Settings

#### Display Modes
- **Day Mode**: Light, elegant background
- **Night Mode**: Dark theme for comfortable reading

#### Theme Colors
- Green (default)
- Blue
- Purple
- Gold Rose
- Orange
- Brown

#### Arabic Fonts
- **Noorehuda** (default)
- **Usmani (Uthmanic)**
- **Indo-Pak**

#### Font Sizes
- **Arabic**: 18px - 40px (adjustable slider)
- **Translation**: 12px - 40px (adjustable slider)

#### Font Colors
- **Arabic Color**: 8 color options
- **Translation Color**: 8 color options

### 8. Reading Progress
- **Continue Reading**: Remember last read position
- **Auto-tracking**: Updates as user scrolls

---

## Technical Architecture

### Frontend Stack
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool
- **Tailwind CSS**: Styling
- **Zustand**: State management
- **React Router**: Navigation

### Data Source
- External JSON files hosted on Supabase Storage:
  - `quran_arabic.json`
  - `quran_luganda.json`
  - `quran_english.json`

### Local Storage
- User settings (theme, fonts, colors)
- Bookmarks
- Highlights
- Last read position

---

## User Interface

### Home Page
- App header with search and settings
- Continue reading section (if applicable)
- Tabs: Surahs list / Bookmarks
- Surah cards with essential info

### Surah Page
- Header with Surah name (Arabic + English)
- Verse count and revelation type
- Scrollable verse cards
- Action buttons per verse

### Settings Panel
- Slide-in panel from right
- Organized sections
- Real-time preview of changes

### Search Dialog
- Modal overlay
- Live search results
- Highlighted matches

---

## Success Metrics (MVP)

1. **Functionality**: All 114 Surahs load correctly with all verses
2. **Performance**: Initial load under 3 seconds
3. **Accessibility**: Readable fonts at all sizes
4. **Persistence**: Settings and bookmarks survive page refresh
5. **Responsiveness**: Works on mobile and desktop

---

## Future Enhancements (Post-MVP)

1. Audio recitation
2. Tajweed color coding
3. Juz (Para) navigation
4. Daily verse notifications
5. Notes feature per verse
6. Cloud sync for bookmarks
7. Offline support (PWA)
8. Multiple translation options
9. Verse by verse comparison
10. Print functionality

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-07 | Initial MVP Release |

---

*Developed for the Ahmadiyya Muslim Community*
