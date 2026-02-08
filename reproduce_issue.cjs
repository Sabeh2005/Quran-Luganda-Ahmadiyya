
const normalizeArabic = (text) => {
    return text
        .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u0640\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, '')
        .replace(/[\u0622\u0623\u0625\u0627\u0671\u0672\u0673\u0675]/g, '\u0627')
        .replace(/[\u0624]/g, '\u0648')
        .replace(/[\u0626\u0649]/g, '\u064A')
        .replace(/[\u0629]/g, '\u0647');
};

const highlightMatch = (text, searchQuery, mode) => {
    if (!searchQuery.trim()) return ['No Query'];

    const isArabicText = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text);
    let regex;

    if (isArabicText) {
        const diacritics = '[\u0610-\u061A\u064B-\u065F\u0670\u0640\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]*';
        const alif = '[\u0622\u0623\u0625\u0627\u0671\u0672\u0673\u0675]';
        const waw = '[\u0648\u0624]';
        const ya = '[\u064A\u0649\u0626]';
        const he = '[\u0647\u0629]';

        const normalizedQuery = normalizeArabic(searchQuery)
            .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        let pattern = '';
        for (let i = 0; i < normalizedQuery.length; i++) {
            const char = normalizedQuery[i];
            if (/[\u0622\u0623\u0625\u0627\u0671\u0672\u0673\u0675]/.test(char)) pattern += alif;
            else if (/[\u0648\u0624]/.test(char)) pattern += waw;
            else if (/[\u064A\u0649\u0626]/.test(char)) pattern += ya;
            else if (/[\u0647\u0629]/.test(char)) pattern += he;
            else pattern += char;

            if (char !== ' ' && /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(char)) {
                pattern += diacritics;
            }
        }

        if (mode === 'exact') {
            pattern = `(^|[^\\p{L}\\p{M}])(${pattern})(?=[^\\p{L}\\p{M}]|$)`;
        } else {
            pattern = `(${pattern})`;
        }
        console.log("Pattern:", pattern);
        regex = new RegExp(pattern, 'gui');
    }

    const parts = text.split(regex);
    console.log("Parts length:", parts.length);
    console.log("Parts:", parts);
    return parts.length > 1 ? "Found" : "Not Found";
};

// Text from Surah 24:36
// "yahdi Allahu"
// yahdi ended with Aleph Maksura (0649) and Space
// Allah starts with Alif Wasl (0671)
const text = "يَهْدِى ٱللَّهُ"; // Exact unicode sequence: 064A...0649 0020 0671...
// Let's rely on standard copy-paste string literal first (node source encoding might be utf8)
// Just constructs from char codes to be safe.
const textFromCodes = String.fromCharCode(
    0x064A, 0x064E, 0x0647, 0x0652, 0x062F, 0x0650, 0x0649, // yahdi
    0x0020, // space
    0x0671, 0x0644, 0x0644, 0x0651, 0x064E, 0x0647, 0x064F // Allahu
);

const query = "ٱللَّهِ"; // The query from user

console.log("Text:", textFromCodes);
console.log("Query:", query);
highlightMatch(textFromCodes, query, 'exact');

console.log("Testing Surah 11:32 case");
// khayran (Alif 0627) Space (0020) High Jeem (06D6) Space (0020) Allah (0671)
const text1132 = String.fromCharCode(
    0x062E, 0x064E, 0x064A, 0x0652, 0x0631, 0x064B, 0x0627, // khayran
    0x0020,
    0x06D6,
    0x0020,
    0x0671, 0x0644, 0x0644, 0x0651, 0x064E, 0x0647, 0x064F // Allahu
);
highlightMatch(text1132, query, 'exact');
