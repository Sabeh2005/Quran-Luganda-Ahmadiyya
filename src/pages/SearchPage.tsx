
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useQuranData } from '@/hooks/useQuranData';
import { useQuranStore } from '@/store/quranStore';
import { cn } from '@/lib/utils';
import backIcon from '@/assets/back-icon.svg';
import searchIcon from '@/assets/search-icon.svg';
import { highlightMatch } from '@/lib/highlight';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { SearchResult } from '@/types/quran';
import { getArabicTextForFont } from '@/lib/arabicTextUtils';

export default function SearchPage() {
    const navigate = useNavigate();
    const searchState = useQuranStore(state => state.searchState);
    const setSearchState = useQuranStore(state => state.setSearchState);
    const [query, setQuery] = useState(searchState.query);
    const [debouncedQuery, setDebouncedQuery] = useState(searchState.query);
    const [selectedLanguage, setSelectedLanguage] = useState(searchState.language);
    const [searchMode, setSearchMode] = useState(searchState.mode);
    const { searchVerses, loading } = useQuranData();
    const inputRef = useRef<HTMLInputElement>(null);
    const scrollDirection = useScrollDirection();
    const settings = useQuranStore(state => state.settings);

    const getArabicFontClass = () => {
        switch (settings.arabicFont) {
            case 'uthmani': return 'font-uthmani';
            case 'indopak': return 'font-indopak';
            default: return 'font-noorehuda';
        }
    };

    // Track IME composition state to fix Arabic input delay
    const isComposingRef = useRef(false);

    useEffect(() => {
        // Focus input on mount
        inputRef.current?.focus();
    }, []);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
            setSearchState({ query, language: selectedLanguage, mode: searchMode });
        }, 150); // Snappier response
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

    // IME composition handlers for Arabic/non-Latin input
    const handleCompositionStart = useCallback(() => {
        isComposingRef.current = true;
    }, []);

    const handleCompositionEnd = useCallback((e: React.CompositionEvent<HTMLInputElement>) => {
        isComposingRef.current = false;
        // Manually trigger state update with the composed value
        setQuery(e.currentTarget.value);
    }, []);


    const isHeaderHidden = scrollDirection === 'down';

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <div className={cn(
                "bg-primary px-0 h-20 flex items-center shadow-sm text-primary-foreground sticky top-0 z-40 w-full transition-transform duration-300",
                isHeaderHidden ? "-translate-y-full" : "translate-y-0"
            )}>
                <div className="flex items-center w-full px-0 relative h-full">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(-1)}
                        className="hover:bg-primary-foreground/20 hover:text-primary-foreground text-primary-foreground z-10"
                    >
                        <img src={backIcon} alt="Back" className="h-6 w-6 brightness-0 invert" />
                    </Button>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <h1 className="text-3xl font-[1000] text-center">
                            {results.length > 0 ? `${results.length} Results` : 'Search Quran'}
                        </h1>
                    </div>
                </div>
            </div>

            <div className="p-2 space-y-2 flex-1 flex flex-col">
                {/* Search Input */}
                <div className="relative">
                    <div className="relative flex items-center">
                        <img src={searchIcon} alt="Search" className="absolute left-3 h-5 w-5 brightness-0 invert" />
                        <Input
                            ref={inputRef}
                            type="text"
                            placeholder="Search engine"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onCompositionStart={handleCompositionStart}
                            onCompositionEnd={handleCompositionEnd}
                            style={{ fontSize: '20px' }}
                            className="pl-10 pr-10 h-12 bg-primary border-none text-primary-foreground placeholder:text-white placeholder:opacity-100 rounded-lg shadow-inner focus-visible:ring-2 focus-visible:ring-primary-foreground/50"
                        />
                        {query && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleClear}
                                className="absolute right-1 h-10 w-10 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
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
                <div className="flex-1 -mr-2 pr-2">
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
                                    className="cursor-pointer group py-3 border-b border-border/40 last:border-none"
                                >
                                    <div className="flex flex-col gap-1">
                                        <div className="text-primary font-bold text-[25px]">
                                            {result.surahName.split(' — ')[0]} {result.surahNumber}:{result.verseNumber}
                                        </div>

                                        <div className={cn(
                                            "text-[25px] leading-relaxed text-foreground/90",
                                            result.matchType === 'arabic' ? cn(getArabicFontClass(), "text-right w-full") : ""
                                        )} dir={result.matchType === 'arabic' ? "rtl" : "ltr"}>
                                            {result.matchType === 'surah' && (
                                                <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded mr-2 uppercase tracking-wider">Chapter</span>
                                            )}
                                            {result.matchType === 'arabic' ? (
                                                highlightMatch(getArabicTextForFont(result.arabic, settings.arabicFont), debouncedQuery, searchMode)
                                            ) : (result.matchType === 'luganda' || result.matchType === 'surah' && selectedLanguage === 'luganda') ? (
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
