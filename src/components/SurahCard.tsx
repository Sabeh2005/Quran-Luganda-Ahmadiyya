import { useNavigate } from 'react-router-dom';
import type { CombinedSurah } from '@/types/quran';
import { cn } from '@/lib/utils';

interface SurahCardProps {
  surah: CombinedSurah;
  index: number;
}

export const SurahCard: React.FC<SurahCardProps> = ({ surah, index }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/surah/${surah.number}`)}
      className={cn(
        "w-full p-4 rounded-xl bg-card border border-border",
        "transition-all duration-300",
        "app-card-shadow",
        "flex items-center gap-4 text-left animate-fade-in"
      )}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Surah number */}
      <div className="verse-number-ornament flex-shrink-0">
        {surah.number}
      </div>

      {/* Surah info - only transliteration name */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground text-lg truncate">
          {surah.englishName}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {surah.totalVerses} verses • {surah.revelationType}
        </p>
      </div>

      {/* Arabic name - larger */}
      <div className="text-right flex-shrink-0">
        <p className="text-4xl font-noorehuda text-primary" dir="rtl">
          {surah.arabicName}
        </p>
      </div>
    </button>
  );
};
