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
// Range U+06D6–U+06ED, excluding U+06DD (End of Ayah mark which is intentional).
const PROBLEMATIC_QURANIC_MARKS_REGEX = /[\u06D6-\u06DC\u06DE-\u06ED]/g;

// Farsi Yeh (U+06CC) → Arabic Yeh (U+064A)
// The Ahmadiyya text uses Farsi Yeh which UthmanicHafs doesn't support,
// causing dotted circles to appear on nearly every verse.
const FARSI_YEH = /\u06CC/g;
const ARABIC_YEH = '\u064A';

/**
 * Cleans Arabic text for display with the Uthmani (UthmanicHafs) font by:
 * 1. Removing Quranic annotation marks that cause circular visual artifacts
 * 2. Replacing Farsi Yeh with standard Arabic Yeh for proper glyph rendering
 * 
 * @param text - The Arabic text to clean
 * @returns The cleaned text compatible with UthmanicHafs font
 */
export function cleanArabicForUthmani(text: string): string {
    return text
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
