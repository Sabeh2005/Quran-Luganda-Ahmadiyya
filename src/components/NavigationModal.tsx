import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useQuranData } from "@/hooks/useQuranData";
import { cn } from "@/lib/utils";

interface NavigationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NavigationModal: React.FC<NavigationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const { surahs } = useQuranData();
  const [selectedSurah, setSelectedSurah] = useState<string>("1");
  const [selectedVerse, setSelectedVerse] = useState<string>("1");
  const [verseCount, setVerseCount] = useState<number>(7); // Default Fatiha

  // Refs for scrolling to selected items
  const surahListRef = useRef<HTMLDivElement>(null);
  const verseListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (surahs.length > 0) {
      const surah = surahs.find((s) => s.number === parseInt(selectedSurah));
      if (surah) {
        setVerseCount(surah.totalVerses);
        // Reset verse selection if it exceeds new count
        if (parseInt(selectedVerse) > surah.totalVerses) {
          setSelectedVerse("1");
        }
      }
    }
  }, [selectedSurah, surahs]); // Removed selectedVerse from dependency to avoid loop resetting

  const handleGo = () => {
    navigate(`/surah/${selectedSurah}?verse=${selectedVerse}`);
    onClose();
  };

  const handleSurahSelect = (number: string) => {
    setSelectedSurah(number);
    setSelectedVerse("1"); // Reset verse when surah changes
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-background">
        <DialogHeader className="p-6 pb-2 border-b">
          <DialogTitle className="text-center text-2xl font-bold text-primary">
            Quick Navigation
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 h-[400px] divide-x">
          {/* Surah Selection Column */}
          <div className="flex flex-col h-full overflow-hidden">
            <h3 className="p-3 text-sm font-semibold text-center border-b bg-muted/30 sticky top-0 z-10">
              Select Surah
            </h3>
            <div
              ref={surahListRef}
              className="flex-1 overflow-y-auto p-2 space-y-1"
            >
              {surahs.length > 0 ? (
                surahs.map((surah) => (
                  <button
                    key={surah.number}
                    onClick={() => handleSurahSelect(surah.number.toString())}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-lg text-sm transition-all duration-200",
                      selectedSurah === surah.number.toString()
                        ? "bg-primary text-primary-foreground font-bold shadow-sm"
                        : "hover:bg-muted text-foreground/80"
                    )}
                  >
                    <span className="opacity-70 mr-2 text-xs">{surah.number}.</span>
                    {surah.englishName}
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">Loading...</div>
              )}
            </div>
          </div>

          {/* Verse Selection Column */}
          <div className="flex flex-col h-full overflow-hidden">
            <h3 className="p-3 text-sm font-semibold text-center border-b bg-muted/30 sticky top-0 z-10">
              Select Verse
            </h3>
            <div
              ref={verseListRef}
              className="flex-1 overflow-y-auto p-2 space-y-1"
            >
              {Array.from({ length: verseCount }, (_, i) => i + 1).map((v) => (
                <button
                  key={v}
                  onClick={() => setSelectedVerse(v.toString())}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-lg text-sm transition-all duration-200 flex items-center justify-between",
                    selectedVerse === v.toString()
                      ? "bg-primary text-primary-foreground font-bold shadow-sm"
                      : "hover:bg-muted text-foreground/80"
                  )}
                >
                  <span>Verse {v}</span>
                  {selectedVerse === v.toString() && (
                    <span className="w-2 h-2 rounded-full bg-white opacity-80" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t bg-muted/10">
          <Button onClick={handleGo} className="w-full text-lg h-12 shadow-md">
            Go to Surah {selectedSurah}, Verse {selectedVerse}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
