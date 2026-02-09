import type { ThemeColor } from '@/types/quran';

// Theme color hex values for meta theme-color tag
export const THEME_COLORS: Record<ThemeColor, string> = {
    green: '#16a34a',           // green-600
    'dark-green': '#327D3D',    // custom dark green
    blue: '#2563eb',            // blue-600
    'dark-blue': '#1e3a8a',     // blue-800
    purple: '#9333ea',          // purple-600
    maroon: '#881337',          // rose-800
    red: '#dc2626',             // red-600
    'gold-rose': '#f59e0b',     // amber-500
    orange: '#ea580c',          // orange-600
    brown: '#92400e',           // amber-800
    teal: '#0d9488',            // teal-600
    indigo: '#4f46e5',          // indigo-600
    'pure-black': '#000000',
    'pure-white': '#FFFFFF',
    'ivory-creme': '#dac0a7',
    'bright-creme': '#fffcd8',
    'deep-sea-green': '#095859',
    'forest': '#0b6623',
};

/**
 * Updates the meta theme-color tag to match the current app theme.
 * This dynamically changes the Android status bar color.
 */
export function updateMetaThemeColor(themeColor: ThemeColor): void {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    const color = THEME_COLORS[themeColor];

    if (metaThemeColor) {
        metaThemeColor.setAttribute('content', color);
    } else {
        // Create meta tag if it doesn't exist
        const meta = document.createElement('meta');
        meta.name = 'theme-color';
        meta.content = color;
        document.head.appendChild(meta);
    }
}
