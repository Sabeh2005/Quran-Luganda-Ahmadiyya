
import React from 'react';

export const normalizeArabic = (text: string): string => {
    return text
        .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u0640\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, '')
        .replace(/[\u0622\u0623\u0625\u0627\u0671\u0672\u0673\u0675]/g, '\u0627') // Alif
        .replace(/[\u0624]/g, '\u0648') // Waw with Hamza -> Waw
        .replace(/[\u0626\u0649]/g, '\u064A') // Ya with Hamza/Alef Maksura -> Ya
        .replace(/[\u0629]/g, '\u0647'); // Te Marbuta -> He
};

/**
 * Normalizes English and Luganda text for fuzzy searching:
 * 1. Converts to lowercase
 * 2. Removes diacritics (e.g., ó -> o, ñ -> n)
 * 3. Maps Luganda 'ŋ' to 'n' for easier searching
 */
/**
 * Normalizes English and Luganda text for fuzzy searching:
 * 1. Converts to lowercase
 * 2. Removes diacritics (e.g., ó -> o, ñ -> n)
 * 3. Maps Luganda 'ŋ' to 'n' for easier searching
 */
export const normalizeText = (text: string): string => {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/ŋ/g, 'n') // Map Luganda specialized character
        .replace(/[^a-z0-9 ]/g, ' ') // Replace punctuation with space
        .replace(/\s+/g, ' ') // Collapse spaces
        .trim();
};

/**
 * Generates an accent-insensitive and 'ŋ'-aware regex pattern for a Latin string
 */
const getFuzzyLatinPattern = (text: string): string => {
    const chars: { [key: string]: string } = {
        'a': '[aàáâãäå]',
        'e': '[eèéêë]',
        'i': '[iìíîï]',
        'o': '[oòóôõöø]',
        'u': '[uùúûü]',
        'n': '[nñŋ]',
        'c': '[cç]',
        's': '[sśš]',
        'z': '[zźž]',
    };

    return text
        .split('')
        .map(char => {
            const lower = char.toLowerCase();
            return chars[lower] || lower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        })
        .join('');
};

export const highlightMatch = (text: string, searchQuery: string, mode: 'similar' | 'exact') => {
    if (!searchQuery.trim()) return text;

    const isArabicText = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text);
    let regex: RegExp;

    if (isArabicText) {
        // Arabic-aware regex: handles normalization and diacritics
        const diacritics = '[\u0610-\u061A\u064B-\u065F\u0670\u0640\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]*';
        const alif = '[\u0622\u0623\u0625\u0627\u0671\u0672\u0673\u0675]';
        const waw = '[\u0648\u0624]';
        const ya = '[\u064A\u0649\u0626]';
        const he = '[\u0647\u0629]';

        // Normalize query for regex construction (remove diacritics, Tatweel, escape special chars)
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

            // Allow diacritics between letters and after the last letter
            if (char !== ' ' && /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(char)) {
                pattern += diacritics;
            }
        }

        if (mode === 'exact') {
            // Use Unicode property escapes for more accurate boundaries: 
            // ^ or any character that is NOT a Letter or Mark
            // Allow diacritics/marks after the boundary character to handle cases where 
            // a stop sign or mark appears between the previous word and the target word.
            // e.g. "Word" + Space + "Mark" + "Target"
            pattern = `(^|(?:[^\\p{L}\\p{M}])(?:${diacritics})*)(${pattern})(?=[^\\p{L}\\p{M}]|$)`;
        } else {
            pattern = `(${pattern})`;
        }
        regex = new RegExp(pattern, 'gui');
    } else {
        const normalizedQuery = normalizeText(searchQuery);
        const words = normalizedQuery.split(' ').filter(w => w.length > 0);

        if (words.length === 0) return text;

        const patterns = words.map(word => getFuzzyLatinPattern(word));

        if (mode === 'exact') {
            // Unify all words into a single match group to prevent stride-3 logic errors
            const combinedPattern = patterns.join('|');
            const pattern = `(^|[^\\p{L}\\p{M}])(${combinedPattern})(?=[^\\p{L}\\p{M}]|$)`;
            regex = new RegExp(pattern, 'gui');
        } else {
            const pattern = `(${patterns.join('|')})`;
            regex = new RegExp(pattern, 'gi');
        }
    }

    const parts = text.split(regex);

    if (mode === 'exact') {
        const results: (string | React.JSX.Element)[] = [];
        let i = 0;
        // Stride is exactly 3: [segmentBefore, prefixBoundary, match, segmentAfter...]
        while (i < parts.length) {
            // Segment before the match sequence
            if (parts[i]) results.push(parts[i]);

            if (i + 2 < parts.length) {
                // Prefix group (e.g. space or punctuation) - keep it unhighlighted
                if (parts[i + 1]) results.push(parts[i + 1]);

                // Match group - apply highlight
                results.push(
                    <mark key={`m-${i}`} className="bg-[#FFD700] text-black rounded px-0.5 font-bold">
                        {parts[i + 2]}
                    </mark>
                );
            }
            i += 3;
        }
        return results;
    }

    return parts.map((part, i) => {
        // Reset lastIndex because of 'g' flag
        regex.lastIndex = 0;
        return regex.test(part) ? (
            <mark key={i} className="bg-[#FFD700] text-black rounded px-0.5 font-bold">
                {part}
            </mark>
        ) : (
            part
        );
    });
};
