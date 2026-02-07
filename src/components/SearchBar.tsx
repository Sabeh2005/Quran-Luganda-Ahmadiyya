
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export const SearchBar: React.FC = () => {
  const navigate = useNavigate();

  const handleFocus = () => {
    navigate('/search');
  };

  return (
    <div className="relative w-full mb-2">
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-white pointer-events-none" />
        <Input
          type="text"
          placeholder="Search engine"
          readOnly
          onFocus={handleFocus}
          onClick={handleFocus}
          className="pl-9 h-11 bg-primary border-none text-white placeholder:text-white focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:ring-offset-0 cursor-pointer"
        />
      </div>
    </div>
  );
};
