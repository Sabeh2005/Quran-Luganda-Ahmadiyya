import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { CombinedSurah } from '@/types/quran';
import { cn } from '@/lib/utils';
import { useQuranStore } from '@/store/quranStore';

interface SurahCardProps {
  surah: CombinedSurah;
  index: number;
}

export const SurahCard: React.FC<SurahCardProps> = React.memo(({ surah, index }) => {
  const navigate = useNavigate();
  const settings = useQuranStore(state => state.settings);

  return (
    <button
      onClick={() => navigate(`/surah/${surah.number}`)}
      className={cn(
        "w-full p-4 rounded-xl border transition-all duration-300",
        "app-card-shadow flex items-center gap-4 text-left animate-fade-in",
        settings.coloredBackground
          ? "bg-primary border-primary text-primary-foreground"
          : "bg-card border-border"
      )}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Surah number */}
      <div className={cn(
        "verse-number-ornament flex-shrink-0",
        settings.coloredBackground && "bg-white text-primary dark:bg-zinc-800 dark:text-primary"
      )}>
        {surah.number}
      </div>

      {/* Surah info - only transliteration name */}
      <div className="flex-1 min-w-0">
        <h3 className={cn(
          "font-semibold text-lg truncate",
          settings.coloredBackground ? "text-primary-foreground" : "text-foreground"
        )}>
          {surah.englishName}
        </h3>
        <p className={cn(
          "text-sm mt-1",
          settings.coloredBackground ? "text-primary-foreground/80" : "text-muted-foreground"
        )}>
          {surah.totalVerses} verses • {surah.revelationType}
        </p>
      </div>

      {/* Arabic name - larger */}
      <div className="text-right flex-shrink-0">
        <p className={cn(
          "text-4xl font-noorehuda",
          settings.coloredBackground ? "text-primary-foreground" : "text-primary"
        )} dir="rtl">
          {surah.arabicName}
        </p>
      </div>
    </button>
  );
});
