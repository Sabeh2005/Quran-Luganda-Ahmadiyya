import React from 'react';
import { CombinedVerse } from '@/types/quran';
import { useQuranStore } from '@/store/quranStore';
import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useQuranData } from '@/hooks/useQuranData';
import { getArabicTextForFont } from '@/lib/arabicTextUtils';

interface BookmarkItemProps {
    verse: CombinedVerse;
    surahNumber: number;
}

export const BookmarkItem: React.FC<BookmarkItemProps> = ({ verse, surahNumber }) => {
    const { settings } = useQuranStore();
    const { getSurah } = useQuranData();
    const navigate = useNavigate();

    const surah = getSurah(surahNumber);
    const surahName = surah ? surah.englishName : `Surah ${surahNumber}`;

    const handleContinue = () => {
        navigate(`/surah/${surahNumber}?verse=${verse.verseNumber}`);
    };

    const getArabicFontClass = () => {
        switch (settings.arabicFont) {
            case 'uthmani': return 'font-uthmani';
            case 'indopak': return 'font-indopak';
            default: return 'font-noorehuda';
        }
    };

    const showArabic = true;
    const showLuganda = settings.translationDisplay === 'all' || settings.translationDisplay === 'luganda';
    const showEnglish = settings.translationDisplay === 'all' || settings.translationDisplay === 'english';

    return (
        <div className="group py-6 px-4 border-b border-border/40 last:border-none flex flex-col gap-4 transition-colors">
            <div className="flex flex-col gap-2">
                <div className="text-[#327D3D] font-bold text-[25px]">
                    Surah {surahName} {surahNumber}:{verse.verseNumber}
                </div>

                <div className="space-y-4">
                    {/* Arabic */}
                    {showArabic && (
                        <div
                            className={cn("text-[25px] text-right w-full leading-[2] text-foreground/90", getArabicFontClass())}
                            dir="rtl"
                            style={{ color: settings.arabicFontColor }}
                        >
                            {getArabicTextForFont(verse.arabic, settings.arabicFont)}
                        </div>
                    )}

                    {/* Luganda */}
                    {showLuganda && (
                        <div
                            className="text-[25px] leading-relaxed text-foreground/80 font-medium"
                            style={{ color: settings.translationFontColor }}
                        >
                            {verse.luganda}
                        </div>
                    )}

                    {/* English */}
                    {showEnglish && (
                        <div
                            className="text-[25px] leading-relaxed text-foreground/80 font-medium"
                            style={{ color: settings.translationFontColor }}
                        >
                            {verse.english}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end pt-2">
                <button
                    onClick={handleContinue}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-300 group/btn shadow-sm border border-primary/20"
                >
                    <span className="font-bold text-base">Continue Reading</span>
                    <BookOpen className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                </button>
            </div>
        </div>
    );
};
