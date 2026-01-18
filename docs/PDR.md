# The Holy Quran App - Product Design Requirements (PDR)

## Document Information

| Field | Value |
|-------|-------|
| Document Title | Product Design Requirements |
| Project Name | The Holy Quran App |
| Version | 1.0 |
| Date | January 7, 2025 |
| Status | Approved |

---

## 1. Executive Summary

### 1.1 Purpose
This document outlines the design requirements for a comprehensive Holy Quran reading application that provides Arabic text with Luganda and English translations. The application follows the Ahmadiyya Muslim verse numbering system and offers extensive customization options for an optimal reading experience.

### 1.2 Scope
The application is a web-based Quran reader accessible on desktop and mobile devices, featuring:
- Complete Quran text in three languages
- Advanced search capabilities
- Personal bookmarking and highlighting
- Extensive theming and customization
- Social sharing features

### 1.3 Target Audience
- Primary: Ahmadiyya Muslims seeking Quran access
- Secondary: Luganda-speaking Muslims
- Tertiary: General users interested in Quranic study

---

## 2. Product Requirements

### 2.1 Functional Requirements

#### FR-001: Quran Display
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-001.1 | Display all 114 Surahs | Must Have |
| FR-001.2 | Show all verses per Surah | Must Have |
| FR-001.3 | Display Arabic original text | Must Have |
| FR-001.4 | Display Luganda translation first | Must Have |
| FR-001.5 | Display English translation second | Must Have |
| FR-001.6 | Preserve Ahmadiyya verse numbering | Must Have |

#### FR-002: Navigation
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-002.1 | Browse Surahs in list format | Must Have |
| FR-002.2 | Navigate to specific Surah | Must Have |
| FR-002.3 | Navigate to specific verse | Must Have |
| FR-002.4 | Return to home from any page | Must Have |
| FR-002.5 | Continue reading feature | Should Have |

#### FR-003: Search
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-003.1 | Global search across all verses | Must Have |
| FR-003.2 | Search Arabic text | Must Have |
| FR-003.3 | Search Luganda translation | Must Have |
| FR-003.4 | Search English translation | Must Have |
| FR-003.5 | Highlight search matches | Should Have |
| FR-003.6 | Navigate to search result | Must Have |

#### FR-004: Bookmarking
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-004.1 | Bookmark any verse | Must Have |
| FR-004.2 | Four bookmark colors | Must Have |
| FR-004.3 | Remove bookmarks | Must Have |
| FR-004.4 | View all bookmarks | Must Have |
| FR-004.5 | Persist bookmarks locally | Must Have |

#### FR-005: Highlighting
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-005.1 | Highlight any verse | Must Have |
| FR-005.2 | Four highlight colors | Must Have |
| FR-005.3 | Remove highlights | Must Have |
| FR-005.4 | Visual distinction for highlighted verses | Must Have |

#### FR-006: Sharing
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-006.1 | Copy verse to clipboard | Must Have |
| FR-006.2 | Native share (where supported) | Should Have |
| FR-006.3 | Include Surah/verse reference | Must Have |

#### FR-007: Settings
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-007.1 | Toggle night mode | Must Have |
| FR-007.2 | Select theme color (6 options) | Must Have |
| FR-007.3 | Select Arabic font (3 options) | Must Have |
| FR-007.4 | Adjust Arabic font size (18-40px) | Must Have |
| FR-007.5 | Adjust translation font size (12-40px) | Must Have |
| FR-007.6 | Set Arabic font color | Must Have |
| FR-007.7 | Set translation font color | Must Have |
| FR-007.8 | Persist settings locally | Must Have |

---

### 2.2 Non-Functional Requirements

#### NFR-001: Performance
| ID | Requirement | Target |
|----|-------------|--------|
| NFR-001.1 | Initial page load | < 3 seconds |
| NFR-001.2 | Surah load time | < 1 second |
| NFR-001.3 | Search response time | < 500ms |
| NFR-001.4 | Setting changes | Instant |

#### NFR-002: Usability
| ID | Requirement | Target |
|----|-------------|--------|
| NFR-002.1 | Mobile responsive | All screen sizes |
| NFR-002.2 | Touch friendly | 44px minimum touch targets |
| NFR-002.3 | Arabic text readability | Proper RTL rendering |
| NFR-002.4 | Font legibility | All sizes readable |

#### NFR-003: Compatibility
| ID | Requirement | Target |
|----|-------------|--------|
| NFR-003.1 | Browsers | Chrome, Safari, Firefox, Edge |
| NFR-003.2 | Devices | Desktop, tablet, mobile |
| NFR-003.3 | OS | Windows, macOS, iOS, Android |

#### NFR-004: Accessibility
| ID | Requirement | Target |
|----|-------------|--------|
| NFR-004.1 | Color contrast | WCAG AA compliant |
| NFR-004.2 | Screen reader | Semantic HTML |
| NFR-004.3 | Keyboard navigation | Full support |

---

## 3. Design Specifications

### 3.1 Color Themes

#### Green Theme (Default)
```css
Primary: hsl(142, 64%, 34%)
Background: hsl(120, 20%, 98%)
Foreground: hsl(120, 30%, 10%)
```

#### Blue Theme
```css
Primary: hsl(210, 75%, 45%)
Background: hsl(210, 30%, 98%)
Foreground: hsl(210, 40%, 10%)
```

#### Purple Theme
```css
Primary: hsl(270, 60%, 50%)
Background: hsl(270, 25%, 98%)
Foreground: hsl(270, 35%, 12%)
```

#### Gold Rose Theme
```css
Primary: hsl(30, 70%, 50%)
Background: hsl(30, 35%, 98%)
Foreground: hsl(25, 40%, 12%)
```

#### Orange Theme
```css
Primary: hsl(25, 90%, 50%)
Background: hsl(25, 40%, 98%)
Foreground: hsl(20, 45%, 12%)
```

#### Brown Theme
```css
Primary: hsl(25, 45%, 35%)
Background: hsl(30, 20%, 97%)
Foreground: hsl(25, 35%, 15%)
```

### 3.2 Typography

#### Arabic Fonts
1. **Noorehuda** (Default) - Clean, modern Quranic script
2. **Uthmanic (Usmani)** - Traditional Uthmani script
3. **Indo-Pak** - Nastaliq style, popular in South Asia

#### Latin Fonts
- **Inter** - System UI for interface elements
- Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### 3.3 Component Specifications

#### Verse Card
- Padding: 20px
- Border radius: 12px
- Background: verse-bg token
- Border: 1px solid verse-border token
- Animation: fade-in on scroll

#### Surah Card
- Padding: 16px
- Border radius: 12px
- Background: card token
- Hover: subtle shadow + border color change
- Verse number ornament: 40x40px circle

#### Settings Panel
- Width: 100% max 448px
- Position: Fixed right
- Animation: slide-in-right
- Backdrop: blur effect

---

## 4. Data Structure

### 4.1 Surah Object
```typescript
interface CombinedSurah {
  id: number;
  number: number;
  arabicName: string;
  englishName: string;
  englishTranslation: string;
  revelationType: string;
  totalVerses: number;
  verses: CombinedVerse[];
}
```

### 4.2 Verse Object
```typescript
interface CombinedVerse {
  verseNumber: number;
  arabic: string;
  luganda: string;
  english: string;
}
```

### 4.3 Settings Object
```typescript
interface AppSettings {
  nightMode: boolean;
  arabicFont: 'noorehuda' | 'uthmani' | 'indopak';
  arabicFontSize: number;
  translationFontSize: number;
  arabicFontColor: string;
  translationFontColor: string;
  themeColor: 'green' | 'blue' | 'purple' | 'gold-rose' | 'orange' | 'brown';
}
```

---

## 5. User Flows

### 5.1 First-Time User Flow
```
1. User opens app
2. App loads with green theme, day mode
3. Quran data loads from external JSON
4. User sees list of 114 Surahs
5. User taps a Surah to read
6. Verses display with Arabic + translations
```

### 5.2 Search Flow
```
1. User taps search icon
2. Search modal opens
3. User types query
4. Results appear in real-time
5. User taps a result
6. App navigates to that verse
7. Verse is scrolled into view
```

### 5.3 Bookmark Flow
```
1. User reads a verse
2. User taps bookmark icon
3. Color picker appears
4. User selects color
5. Bookmark indicator appears
6. Bookmark saved to local storage
```

### 5.4 Settings Flow
```
1. User taps settings icon
2. Settings panel slides in
3. User adjusts preferences
4. Changes apply instantly
5. User closes panel
6. Settings persist on refresh
```

---

## 6. Testing Requirements

### 6.1 Unit Tests
- [ ] Surah data loading
- [ ] Verse combination logic
- [ ] Search functionality
- [ ] Settings persistence
- [ ] Bookmark CRUD operations
- [ ] Highlight CRUD operations

### 6.2 Integration Tests
- [ ] Navigation between pages
- [ ] Search to navigation flow
- [ ] Settings application
- [ ] Theme switching

### 6.3 E2E Tests
- [ ] Complete user journey
- [ ] All 114 Surahs accessible
- [ ] Bookmark creation and retrieval
- [ ] Settings persistence across sessions

### 6.4 Manual Tests
- [ ] Arabic text rendering (all 3 fonts)
- [ ] RTL layout correctness
- [ ] Color theme visual accuracy
- [ ] Mobile touch interactions
- [ ] Cross-browser compatibility

---

## 7. Deployment Requirements

### 7.1 Hosting
- Static site hosting (Lovable publishing)
- CDN for optimal performance
- HTTPS required

### 7.2 External Dependencies
- Supabase Storage for JSON files
- Google Fonts for Inter
- QuranCDN for Arabic fonts

### 7.3 Environment
- Production URL: TBD
- No backend required (static data + local storage)

---

## 8. Appendix

### A. Surah Name Reference
All 114 Surahs follow the naming convention:
`{Transliteration} — {Arabic}`

Example: `Al‑Fātiḥah — الفاتحة`

### B. Highlight Colors (HSL)
| Color | Light Mode | Dark Mode |
|-------|------------|-----------|
| Yellow | 48, 96%, 89% | 48, 70%, 25% |
| Green | 142, 60%, 85% | 142, 45%, 22% |
| Blue | 210, 80%, 90% | 210, 55%, 25% |
| Pink | 330, 80%, 92% | 330, 50%, 28% |

### C. Bookmark Colors (HSL)
| Color | HSL Value |
|-------|-----------|
| Red | 0, 75%, 55% |
| Blue | 210, 80%, 55% |
| Yellow | 45, 95%, 55% |
| Purple | 270, 65%, 55% |

---

*Document prepared for The Holy Quran App development team*
*© 2025 Ahmadiyya Muslim Community*
