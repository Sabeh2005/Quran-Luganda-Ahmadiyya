
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useQuranData } from '@/hooks/useQuranData';
import { cn } from '@/lib/utils';

export default function SearchPage() {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState<'all' | 'arabic' | 'luganda' | 'english'>('all');
    const [searchMode, setSearchMode] = useState<'similar' | 'exact'>('exact');
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
        }, 300);
        return () => clearTimeout(timer);
    }, [query]);

    const results = useMemo(() => {
        if (!debouncedQuery.trim()) return [];
        // Passing searchMode will be enabled after updating the hook
        return searchVerses(debouncedQuery, selectedLanguage, searchMode);
    }, [debouncedQuery, searchVerses, selectedLanguage, searchMode]);

    const handleClear = () => {
        setQuery('');
        setDebouncedQuery('');
        inputRef.current?.focus();
    };

    const highlightMatch = (text: string, searchQuery: string) => {
        if (!searchQuery.trim()) return text;
        // Simple highlight for now, will improve with Exact match logic later
        const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        const parts = text.split(regex);
        return parts.map((part, i) =>
            regex.test(part) ? (
                <mark key={i} className="bg-yellow-300 text-black rounded-sm px-0.5 mx-0.5">
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
            <div className="bg-primary p-4 flex items-center shadow-sm text-primary-foreground">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(-1)}
                    className="mr-2 hover:bg-primary-foreground/20 hover:text-primary-foreground text-primary-foreground"
                >
                    <ArrowLeft className="h-6 w-6" />
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
                                onClick={() => setSelectedLanguage(lang)}
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
                            onClick={() => setSearchMode('exact')}
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
                            onClick={() => setSearchMode('similar')}
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
                                    onClick={() => navigate(`/surah/${result.surahNumber}?verse=${result.verseNumber}`)}
                                    className="cursor-pointer group"
                                >
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <span className="text-primary font-medium whitespace-nowrap text-3xl">
                                            {result.surahNumber}:{result.verseNumber}
                                        </span>

                                        {/* 
                           The screenshot shows the text inline with the verse number.
                           e.g. "2:214 aur unhen halla [daala] gaya..."
                           I need to display the relevant text snippet based on the match.
                        */}
                                        <span className={cn(
                                            "text-3xl leading-relaxed text-foreground/90",
                                            result.matchType === 'arabic' ? "font-noorehuda text-right w-full" : ""
                                        )} dir={result.matchType === 'arabic' ? "rtl" : "ltr"}>
                                            {result.matchType === 'arabic' ? (
                                                highlightMatch(result.arabic, debouncedQuery)
                                            ) : result.matchType === 'luganda' ? (
                                                highlightMatch(result.luganda, debouncedQuery)
                                            ) : (
                                                highlightMatch(result.english, debouncedQuery)
                                            )}
                                        </span>
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
