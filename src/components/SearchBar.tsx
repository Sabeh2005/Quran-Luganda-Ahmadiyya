
import React from 'react';
import { useNavigate } from 'react-router-dom';
import searchIcon from '@/assets/search-icon.svg';
import { Input } from '@/components/ui/input';
import { useQuranStore } from '@/store/quranStore';
import { cn } from '@/lib/utils';

export const SearchBar: React.FC = () => {
  const navigate = useNavigate();

  const { setSearchState, settings } = useQuranStore();

  const handleFocus = () => {
    setSearchState({ query: '', language: 'all' });
    navigate('/search');
  };

  return (
    <div className="relative w-full mb-2">
      <div className="relative flex items-center">
        <img
          src={searchIcon}
          alt="Search"
          className={cn(
            "absolute left-3 h-4 w-4 pointer-events-none z-10",
            settings.coloredAppBackground ? "opacity-50" : "brightness-0 invert"
          )}
        />
        <Input
          type="text"
          placeholder="Search engine"
          readOnly
          onFocus={handleFocus}
          onClick={handleFocus}
          style={{ fontSize: '20px' }}
          className={cn(
            "pl-9 h-11 border-none cursor-pointer transition-all placeholder:opacity-100",
            settings.coloredAppBackground
              ? "bg-card text-foreground shadow-sm placeholder:text-muted-foreground"
              : "bg-primary text-white placeholder:text-white focus-visible:ring-1 focus-visible:ring-white/20"
          )}
        />
      </div>
    </div>
  );
};
