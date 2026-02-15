import { ArabicFont } from '@/types/quran';

/**
 * Returns the CSS class name for the selected Arabic font.
 * 
 * @param font - The selected Arabic font setting
 * @returns The CSS class name defined in index.css
 */
export function getArabicFontClass(font: ArabicFont | string): string {
    switch (font) {
        case 'uthmani':
            return 'font-uthmani';
        case 'indopak':
            return 'font-indopak';
        case 'noorehuda':
        default:
            return 'font-noorehuda';
    }
}
