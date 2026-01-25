import React from 'react';
import { CombinedVerse } from '@/types/quran';
import { useQuranStore } from '@/store/quranStore';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface BookmarkItemProps {
    verse: CombinedVerse;
    surahNumber: number;
}

export const BookmarkItem: React.FC<BookmarkItemProps> = ({ verse, surahNumber }) => {
    const { settings } = useQuranStore();
    const navigate = useNavigate();

    const handleContinue = () => {
        navigate(`/surah/${surahNumber}?verse=${verse.verseNumber}`);
    };

    const showLuganda = settings.translationDisplay === 'all' || settings.translationDisplay === 'luganda';
    const showEnglish = settings.translationDisplay === 'all' || settings.translationDisplay === 'english';

    return (
        <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-border/50 p-4 mb-3">
            {/* Arabic - Centered or Right aligned based on Screenshot? Screenshot shows Centered/Justified? */}
            {/* Screenshot 1: Arabic is justified/right on top. Translation below. */}

            <p
                className="text-right text-2xl mb-4 font-noorehuda leading-loose"
                style={{ color: settings.arabicFontColor }}
            >
                {verse.arabic}
            </p>

            {showLuganda && (
                <p className="text-right text-lg mb-2" style={{ color: settings.translationFontColor }} dir="rtl">
                    {/* Screenshot shows Urdu? Likely the user's "Luganda" or "Translation" text */}
                    {/* The screenshot text "Jo log ghaib par iman..." looks Urdu. I will assume this is the 'luganda' field content for this app context or just render what is in verse.luganda */}
                    {verse.luganda}
                </p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border/30 pt-3 mt-2">
                <div className="text-base font-semibold">
                    <span className="block text-xs text-muted-foreground uppercase">Surah</span>
                    {surahNumber}
                </div>
                <div className="text-base font-semibold border-l border-border/30 pl-4">
                    <span className="block text-xs text-muted-foreground uppercase">Ayat</span>
                    {verse.verseNumber}
                </div>
                <button
                    onClick={handleContinue}
                    className="flex items-center gap-1 text-green-600 font-semibold text-sm pl-4 border-l border-border/30"
                >
                    Continue <br /> Reading
                    <ArrowRight className="w-4 h-4 ml-1" />
                </button>
            </div>
        </div>
    );
};
