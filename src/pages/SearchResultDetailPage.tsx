import React, { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VerseCard } from '@/components/VerseCard';
import { useQuranStore } from '@/store/quranStore';
import { useQuranData } from '@/hooks/useQuranData';
import { cn } from '@/lib/utils';
import { SettingsPanel } from '@/components/SettingsPanel';
import settingsIcon from '@/assets/settings-icon.svg';
import backIcon from '@/assets/back-icon.svg';
import { useScrollDirection } from '@/hooks/useScrollDirection';

const SearchResultDetailPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const searchState = useQuranStore(state => state.searchState);
    const settings = useQuranStore(state => state.settings);
    const { searchVerses, loading } = useQuranData();
    const [settingsOpen, setSettingsOpen] = React.useState(false);
    const [isAutoScrolling, setIsAutoScrolling] = React.useState(false);
    const verseRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const scrollDirection = useScrollDirection(10, isAutoScrolling);

    const surahNumber = parseInt(searchParams.get('surah') || '0');
    const verseNumber = parseInt(searchParams.get('verse') || '0');

    const results = React.useMemo(() => searchVerses(
        searchState.query,
        searchState.language,
        searchState.mode
    ), [searchVerses, searchState.query, searchState.language, searchState.mode]);



    useEffect(() => {
        if (surahNumber && verseNumber) {
            const key = `${surahNumber}-${verseNumber}`;
            setIsAutoScrolling(true);
            setTimeout(() => {
                verseRefs.current[key]?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
                setTimeout(() => setIsAutoScrolling(false), 2000);
            }, 300);
        }
    }, [surahNumber, verseNumber, results.length]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (results.length === 0) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <p className="text-muted-foreground mb-4">No results found for your search.</p>
                <Button onClick={() => navigate('/search')}>Go Back</Button>
            </div>
        );
    }


    const isHeaderHidden = scrollDirection === 'down';

    return (
        <div className="min-h-screen bg-background pb-10">
            <header className={cn(
                "sticky top-0 z-40 w-full h-20 bg-primary px-0 shadow-sm text-primary-foreground transition-transform duration-300",
                isHeaderHidden ? "-translate-y-full" : "translate-y-0"
            )}>
                <div className="flex w-full items-center justify-between relative h-full">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(-1)}
                        className="text-primary-foreground hover:bg-primary-foreground/20 z-10"
                    >
                        <img src={backIcon} alt="Back" className="h-6 w-6 brightness-0 invert" />
                    </Button>

                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <h1 className="text-3xl font-[1000] text-primary-foreground text-center">
                            {results.length} Results
                        </h1>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSettingsOpen(true)}
                        className="text-primary-foreground hover:bg-primary-foreground/20 z-10"
                    >
                        <img src={settingsIcon} alt="Settings" className="h-6 w-6 brightness-0 invert" />
                    </Button>
                </div>
            </header>

            <main className="w-full mt-2 px-2 space-y-2">
                {results.map((result, index) => {
                    const isTarget = result.surahNumber === surahNumber && result.verseNumber === verseNumber;
                    const key = `${result.surahNumber}-${result.verseNumber}`;

                    return (
                        <div
                            key={key}
                            ref={(el) => { verseRefs.current[key] = el; }}
                            className={cn(
                                "transition-all duration-500 rounded-xl scroll-mt-[88px]",
                                isTarget ? "ring-4 ring-primary z-10 relative" : ""
                            )}
                        >
                            <VerseCard
                                verse={{
                                    verseNumber: result.verseNumber,
                                    arabic: result.arabic,
                                    normalizedArabic: result.normalizedArabic,
                                    luganda: result.luganda,
                                    normalizedLuganda: result.normalizedLuganda,
                                    english: result.english,
                                    normalizedEnglish: result.normalizedEnglish,
                                    transliteration: result.transliteration,
                                    normalizedTransliteration: result.normalizedTransliteration
                                }}
                                surahNumber={result.surahNumber}
                                surahName={result.surahName}
                                searchQuery={searchState.query}
                                searchMode={searchState.mode}
                            />
                        </div>
                    );
                })}
            </main>

            <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
        </div>
    );
};

export default SearchResultDetailPage;
