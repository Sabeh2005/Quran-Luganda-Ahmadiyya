import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { CombinedSurah } from '@/types/quran';
import { getSurahInfo } from '@/data/surahNames';
import { cn } from '@/lib/utils';

interface SurahCardProps {
  surah: CombinedSurah;
  index: number;
}

export const SurahCard: React.FC<SurahCardProps> = ({ surah, index }) => {
  const navigate = useNavigate();
  const surahInfo = getSurahInfo(surah.number);

  return (
    <button
      onClick={() => navigate(`/surah/${surah.number}`)}
      className={cn(
        "w-full p-4 rounded-xl bg-card border border-border hover:border-primary/50",
        "transition-all duration-300 hover:shadow-lg hover:shadow-primary/10",
        "flex items-center gap-4 text-left group animate-fade-in"
      )}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Surah number */}
      <div className="verse-number-ornament flex-shrink-0 group-hover:scale-110 transition-transform">
        {surah.number}
      </div>

      {/* Surah info - only transliteration name */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground text-lg truncate">
          {surahInfo.transliteration}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {surah.totalVerses} verses • {surah.revelationType}
        </p>
      </div>

      {/* Arabic name - larger */}
      <div className="text-right flex-shrink-0">
        <p className="text-2xl font-noorehuda text-primary" dir="rtl">
          {surahInfo.arabic}
        </p>
      </div>

      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
    </button>
  );
};
