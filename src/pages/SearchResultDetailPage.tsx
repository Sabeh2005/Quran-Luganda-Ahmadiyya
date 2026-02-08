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
    const { searchState } = useQuranStore();
    const { searchVerses, loading } = useQuranData();
    const [settingsOpen, setSettingsOpen] = React.useState(false);
    const verseRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const scrollDirection = useScrollDirection();

    const surahNumber = parseInt(searchParams.get('surah') || '0');
    const verseNumber = parseInt(searchParams.get('verse') || '0');

    const results = searchVerses(
        searchState.query,
        searchState.language,
        searchState.mode
    );

    useEffect(() => {
        if (surahNumber && verseNumber) {
            const key = `${surahNumber}-${verseNumber}`;
            setTimeout(() => {
                verseRefs.current[key]?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
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
                "sticky top-0 z-40 w-full bg-primary px-0 py-4 shadow-sm text-primary-foreground transition-transform duration-300",
                isHeaderHidden ? "-translate-y-full" : "translate-y-0"
            )}>
                <div className="flex w-full items-center justify-between">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(-1)}
                        className="text-primary-foreground hover:bg-primary-foreground/20"
                    >
                        <img src={backIcon} alt="Back" className="h-6 w-6 brightness-0 invert" />
                    </Button>
                    <h1 className="text-3xl font-[1000] text-primary-foreground flex-1 text-center">
                        {results.length} Results
                    </h1>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSettingsOpen(true)}
                        className="text-primary-foreground hover:bg-primary-foreground/20"
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
                                "transition-all duration-500 rounded-xl",
                                isTarget ? "ring-4 ring-primary z-10 relative" : ""
                            )}
                        >
                            <VerseCard
                                verse={{
                                    verseNumber: result.verseNumber,
                                    arabic: result.arabic,
                                    luganda: result.luganda,
                                    english: result.english
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
