
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useQuranData } from '@/hooks/useQuranData';
import { useQuranStore } from '@/store/quranStore';
import { cn } from '@/lib/utils';
import backIcon from '@/assets/back-icon.svg';
import { highlightMatch } from '@/lib/highlight';
import { useScrollDirection } from '@/hooks/useScrollDirection';

export default function SearchPage() {
    const navigate = useNavigate();
    const { searchState, setSearchState } = useQuranStore();
    const [query, setQuery] = useState(searchState.query);
    const [debouncedQuery, setDebouncedQuery] = useState(searchState.query);
    const [selectedLanguage, setSelectedLanguage] = useState(searchState.language);
    const [searchMode, setSearchMode] = useState(searchState.mode);
    const { searchVerses, loading } = useQuranData();
    const inputRef = useRef<HTMLInputElement>(null);
    const scrollDirection = useScrollDirection();

    // Track IME composition state to fix Arabic input delay
    const isComposingRef = useRef(false);

    useEffect(() => {
        // Focus input on mount
        inputRef.current?.focus();
    }, []);

    // Debounce search - only trigger when not composing
    useEffect(() => {
        // Don't debounce during IME composition
        if (isComposingRef.current) return;

        const timer = setTimeout(() => {
            setDebouncedQuery(query);
            setSearchState({ query, language: selectedLanguage, mode: searchMode });
        }, 200); // Reduced debounce time for faster response
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
                        <Search className="absolute left-3 h-5 w-5 text-white" />
                        <Input
                            ref={inputRef}
                            type="text"
                            placeholder="Search engine"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onCompositionStart={handleCompositionStart}
                            onCompositionEnd={handleCompositionEnd}
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
