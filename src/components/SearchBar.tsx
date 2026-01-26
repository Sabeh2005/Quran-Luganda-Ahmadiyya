import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuranData } from '@/hooks/useQuranData';
import { cn } from '@/lib/utils';

export const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<'all' | 'arabic' | 'luganda' | 'english'>('all');
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { searchVerses, loading } = useQuranData();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    return searchVerses(debouncedQuery, selectedLanguage);
  }, [debouncedQuery, searchVerses, selectedLanguage]);

  const handleResultClick = (surahNumber: number, verseNumber: number) => {
    navigate(`/surah/${surahNumber}?verse=${verseNumber}`);
    setIsOpen(false);
    setQuery('');
  };

  const handleFocus = () => {
    setIsOpen(true);
  };

  const handleClear = () => {
    setQuery('');
    setDebouncedQuery('');
    inputRef.current?.focus();
  };

  const highlightMatch = (text: string, searchQuery: string) => {
    if (!searchQuery.trim()) return text;
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div ref={containerRef} className="relative w-full mb-4">
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search in Quran (Arabic, Luganda, or English)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          className="pl-9 pr-9 h-11 bg-card border-border"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="absolute right-1 h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="border-b border-border bg-muted/50">
            {/* Language Selector */}
            <div className="flex p-2 gap-2 overflow-x-auto">
              {(['all', 'arabic', 'luganda', 'english'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-full transition-colors whitespace-nowrap",
                    selectedLanguage === lang
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </button>
              ))}
            </div>

            {/* Result Count - Only show if there are results */}
            {results.length > 0 && (
              <div className="px-3 pb-2 text-xs text-muted-foreground text-center">
                {results.length.toLocaleString()} result{results.length !== 1 ? 's' : ''} found
              </div>
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center p-6">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : results.length > 0 ? (
              <div className="p-2">
                {results.map((result, index) => (
                  <button
                    key={`${result.surahNumber}-${result.verseNumber}-${index}`}
                    onClick={() => handleResultClick(result.surahNumber, result.verseNumber)}
                    className={cn(
                      "w-full p-3 rounded-lg text-left transition-colors hover:bg-accent",
                      "border-b border-border/50 last:border-0"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-primary">
                        {result.surahName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Verse {result.verseNumber}
                      </span>
                    </div>

                    {result.matchType === 'arabic' ? (
                      <p className="text-base font-noorehuda text-right" dir="rtl">
                        {highlightMatch(result.arabic, debouncedQuery)}
                      </p>
                    ) : result.matchType === 'luganda' ? (
                      <p className="text-sm">
                        {highlightMatch(result.luganda, debouncedQuery)}
                      </p>
                    ) : (
                      <p className="text-sm">
                        {highlightMatch(result.english, debouncedQuery)}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            ) : debouncedQuery.trim() ? (
              <div className="p-6 text-center text-muted-foreground text-sm">
                No results found for "{debouncedQuery}"
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
