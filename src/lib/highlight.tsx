
import React from 'react';

export const normalizeArabic = (text: string): string => {
    return text
        .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u0640\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, '')
        .replace(/[\u0622\u0623\u0625\u0627\u0671\u0672\u0673\u0675]/g, '\u0627') // Alif
        .replace(/[\u0624]/g, '\u0648') // Waw with Hamza -> Waw
        .replace(/[\u0626\u0649]/g, '\u064A') // Ya with Hamza/Alef Maksura -> Ya
        .replace(/[\u0629]/g, '\u0647'); // Te Marbuta -> He
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

            // Allow diacritics between letters, but not after spaces or if at the end
            if (i < normalizedQuery.length - 1 && char !== ' ' && /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(char)) {
                pattern += diacritics;
            }
        }

        if (mode === 'exact') {
            // Use Unicode property escapes for more accurate boundaries: 
            // ^ or any character that is NOT a Letter or Mark
            pattern = `(^|[^\\p{L}\\p{M}])(${pattern})([^\\p{L}\\p{M}]|$)`;
        } else {
            pattern = `(${pattern})`;
        }
        regex = new RegExp(pattern, 'gui');
    } else {
        const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        regex = mode === 'exact'
            ? new RegExp(`(^|[^\\p{L}\\p{M}])(${escapedQuery})([^\\p{L}\\p{M}]|$)`, 'gui')
            : new RegExp(`(${escapedQuery})`, 'gi');
    }

    const parts = text.split(regex);

    if (mode === 'exact') {
        const results: (string | React.JSX.Element)[] = [];
        let i = 0;
        while (i < parts.length) {
            // Segment before the match sequence
            if (parts[i]) results.push(parts[i]);

            if (i + 1 < parts.length) {
                // Prefix group (index 1)
                if (parts[i + 1]) results.push(parts[i + 1]);

                // Match group (index 2)
                results.push(
                    <mark key={`m-${i}`} className="bg-[#FFD700] text-black rounded px-0.5 font-bold">
                        {parts[i + 2]}
                    </mark>
                );

                // Suffix group (index 3)
                if (parts[i + 3]) results.push(parts[i + 3]);
            }
            i += 4;
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
