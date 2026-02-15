/**
 * Arabic text utilities for handling font-specific rendering issues.
 * 
 * The Ahmadiyya Arabic text uses characters and combining marks that render correctly
 * with Noorehuda and IndoPak fonts, but cause unwanted round/circular dotted designs
 * when displayed with the UthmanicHafs (Usmani) font.
 * 
 * Two categories of issues:
 * 1. Quranic annotation combining marks (U+06D6–U+06ED): tajweed marks that UthmanicHafs
 *    renders as prominent circular dotted designs instead of subtle marks.
 * 2. Farsi Yeh (U+06CC / ی): Used in Ahmadiyya/IndoPak Arabic text instead of standard
 *    Arabic Yeh (U+064A / ي). UthmanicHafs doesn't have a glyph for Farsi Yeh and
 *    renders it with a dotted circle placeholder.
 */

// Quranic annotation combining marks that cause circular visual artifacts with UthmanicHafs.
// Range U+06D6–U+06ED, excluding U+06DD (End of Ayah mark).
const PROBLEMATIC_QURANIC_MARKS_REGEX = /[\u06D6-\u06DC\u06DE-\u06ED]/g;

// Farsi Yeh (U+06CC) → Arabic Yeh (U+064A)
const FARSI_YEH = /\u06CC/g;
const ARABIC_YEH = '\u064A';

// Shadda + Madda combination (in any order). 
// The Usmani font often renders this combination incorrectly (marks overlapping or shifting).
// In Uthmani script Muqatta'at, the Shadda is omitted to allow the Madda to display clearly.
const SHADDA_MADDA_COMBINATION = /(\u0651\u0653|\u0653\u0651)/g;
const MADDA_ONLY = '\u0653';

/**
 * Cleans Arabic text for display with the Uthmani (UthmanicHafs) font by:
 * 1. Normalizing to NFC to help the font trigger correct ligatures/anchors
 * 2. Fixing Shadda+Madda collisions by prioritizing the Madda
 * 3. Removing Quranic annotation marks that cause circular visual artifacts
 * 4. Replacing Farsi Yeh with standard Arabic Yeh for proper glyph rendering
 * 
 * @param text - The Arabic text to clean
 * @returns The cleaned text compatible with UthmanicHafs font
 */
export function cleanArabicForUthmani(text: string): string {
    return text
        .normalize('NFC')
        .replace(SHADDA_MADDA_COMBINATION, MADDA_ONLY) // Fix collision in words like Alm
        .replace(PROBLEMATIC_QURANIC_MARKS_REGEX, '')
        .replace(FARSI_YEH, ARABIC_YEH);
}

/**
 * Returns the appropriate Arabic text based on the selected font.
 * For Uthmani font, cleans text to avoid rendering artifacts.
 * For other fonts (Noorehuda, IndoPak), returns the text as-is.
 * 
 * @param text - The Arabic text
 * @param font - The currently selected Arabic font
 * @returns The text, cleaned if necessary for the selected font
 */
export function getArabicTextForFont(text: string, font: string): string {
    if (font === 'uthmani') {
        return cleanArabicForUthmani(text);
    }
    return text;
}
