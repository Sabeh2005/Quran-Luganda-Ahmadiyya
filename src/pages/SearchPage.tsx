
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useQuranData } from '@/hooks/useQuranData';
import { useQuranStore } from '@/store/quranStore';
import { cn } from '@/lib/utils';
import backIcon from '@/assets/back-icon.svg';

export default function SearchPage() {
    const navigate = useNavigate();
    const { searchState, setSearchState } = useQuranStore();
    const [query, setQuery] = useState(searchState.query);
    const [debouncedQuery, setDebouncedQuery] = useState(searchState.query);
    const [selectedLanguage, setSelectedLanguage] = useState(searchState.language);
    const [searchMode, setSearchMode] = useState(searchState.mode);
    const { searchVerses, loading } = useQuranData();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Focus input on mount
        inputRef.current?.focus();
    }, []);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
            setSearchState({ query, language: selectedLanguage, mode: searchMode });
        }, 300);
        return () => clearTimeout(timer);
    }, [query, selectedLanguage, searchMode, setSearchState]);

    const results = useMemo(() => {
        if (!debouncedQuery.trim()) return [];
        return searchVerses(debouncedQuery, selectedLanguage, searchMode);
    }, [debouncedQuery, searchVerses, selectedLanguage, searchMode]);

    const handleClear = () => {
        setQuery('');
        setDebouncedQuery('');
        inputRef.current?.focus();
    };

    const highlightMatch = (text: string, searchQuery: string, mode: 'similar' | 'exact') => {
        if (!searchQuery.trim()) return text;

        const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = mode === 'exact'
            ? new RegExp(`(^|[^a-zA-Z0-9])(${escapedQuery})([^a-zA-Z0-9]|$)`, 'gi')
            : new RegExp(`(${escapedQuery})`, 'gi');

        const parts = text.split(regex);

        // When using groups in split, the matched groups are included in the array.
        // For exact mode, we have 3 groups: (prefix)(match)(suffix)
        if (mode === 'exact') {
            const results: (string | React.JSX.Element)[] = [];
            let i = 0;
            while (i < parts.length) {
                // Because split with 3 groups returns: [pre-match, group1, group2, group3, post-match, ...]
                // Every 4th element (starting index 0) is the text between matches
                results.push(parts[i]);
                if (i + 1 < parts.length) {
                    // group1 (prefix)
                    results.push(parts[i + 1]);
                    // group2 (the actual match) - HIGHLIGHT THIS
                    results.push(
                        <mark key={i} className="bg-[#FFD700] text-black rounded px-1.5 py-0.5 mx-0.5">
                            {parts[i + 2]}
                        </mark>
                    );
                    // group3 (suffix)
                    results.push(parts[i + 3]);
                }
                i += 4;
            }
            return results;
        }

        return parts.map((part, i) =>
            regex.test(part) ? (
                <mark key={i} className="bg-[#FFD700] text-black rounded px-1.5 py-0.5 mx-0.5">
                    {part}
                </mark>
            ) : (
                part
            )
        );
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <div className="bg-primary px-0 py-4 flex items-center shadow-sm text-primary-foreground">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(-1)}
                    className="mr-2 hover:bg-primary-foreground/20 hover:text-primary-foreground text-primary-foreground"
                >
                    <img src={backIcon} alt="Back" className="h-6 w-6 brightness-0 invert" />
                </Button>
                <h1 className="text-3xl font-[1000] flex-1 text-center pr-8">
                    {results.length > 0 ? `${results.length} Results` : 'Search Quran'}
                </h1>
            </div>

            <div className="p-2 space-y-2 flex-1 overflow-hidden flex flex-col">
                {/* Search Input */}
                <div className="relative">
                    <div className="relative flex items-center">
                        <Search className="absolute left-3 h-5 w-5 text-white" />
                        <Input
                            ref={inputRef}
                            type="text"
                            placeholder="Search engine"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="pl-10 pr-10 h-12 bg-primary border-none text-white placeholder:text-white rounded-lg text-base shadow-inner focus-visible:ring-2 focus-visible:ring-white/50"
                        />
                        {query && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleClear}
                                className="absolute right-1 h-10 w-10 text-white hover:bg-white/10 hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-[8px]">
                    {/* Language Filters */}
                    <div className="flex gap-[8px] overflow-x-auto scrollbar-hide">
                        <button
                            onClick={() => setSelectedLanguage('all')}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-sm font-medium transition-colors border",
                                selectedLanguage === 'all'
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-muted text-muted-foreground border-transparent hover:bg-muted/80"
                            )}
                        >
                            All
                        </button>
                        {(['arabic', 'luganda', 'english'] as const).map((lang) => (
                            <button
                                key={lang}
                                onClick={() => {
                                    setSelectedLanguage(lang);
                                    setSearchState({ language: lang });
                                }}
                                className={cn(
                                    "px-4 py-1.5 rounded-full text-sm font-medium transition-colors border capitalize",
                                    selectedLanguage === lang
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-muted text-muted-foreground border-transparent hover:bg-muted/80"
                                )}
                            >
                                {lang}
                            </button>
                        ))}
                    </div>

                    {/* Tabs for Similar vs Exact */}
                    <div className="flex gap-[8px]">
                        <button
                            onClick={() => {
                                setSearchMode('exact');
                                setSearchState({ mode: 'exact' });
                            }}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-sm font-medium transition-colors border",
                                searchMode === 'exact'
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-muted text-muted-foreground border-transparent hover:bg-muted/80"
                            )}
                        >
                            Exact
                        </button>
                        <button
                            onClick={() => {
                                setSearchMode('similar');
                                setSearchState({ mode: 'similar' });
                            }}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-sm font-medium transition-colors border",
                                searchMode === 'similar'
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-muted text-muted-foreground border-transparent hover:bg-muted/80"
                            )}
                        >
                            Similar
                        </button>
                    </div>
                </div>


                {/* Results List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar -mr-2 pr-2">
                    {loading ? (
                        <div className="flex items-center justify-center py-10">
                            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                        </div>
                    ) : results.length > 0 ? (
                        <div className="space-y-4 pt-2">
                            {results.map((result, index) => (
                                <div
                                    key={`${result.surahNumber}-${result.verseNumber}-${index}`}
                                    onClick={() => navigate(`/search/results?surah=${result.surahNumber}&verse=${result.verseNumber}`)}
                                    className="cursor-pointer group py-4 border-b last:border-none"
                                >
                                    <div className="flex flex-col gap-2">
                                        <div className="text-[#327D3D] font-bold text-3xl">
                                            Surah {result.surahName.split(' — ')[0]} {result.surahNumber}:{result.verseNumber}
                                        </div>

                                        <div className={cn(
                                            "text-3xl leading-relaxed text-foreground/90",
                                            result.matchType === 'arabic' ? "font-noorehuda text-right w-full" : ""
                                        )} dir={result.matchType === 'arabic' ? "rtl" : "ltr"}>
                                            {result.matchType === 'arabic' ? (
                                                highlightMatch(result.arabic, debouncedQuery, searchMode)
                                            ) : result.matchType === 'luganda' ? (
                                                highlightMatch(result.luganda, debouncedQuery, searchMode)
                                            ) : (
                                                highlightMatch(result.english, debouncedQuery, searchMode)
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : debouncedQuery.trim() ? (
                        <div className="py-10 text-center text-muted-foreground">
                            No results found
                        </div>
                    ) : (
                        <div className="py-10 text-center text-muted-foreground/50">
                            Type to search Quran...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
