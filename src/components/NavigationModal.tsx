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
import { ScrollArea } from "@/components/ui/scroll-area";

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
  }, [selectedSurah, surahs]);

  // Scroll to selected items when modal opens or selections change
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        const selectedSurahEl = document.querySelector('[data-selected-surah="true"]');
        const selectedVerseEl = document.querySelector('[data-selected-verse="true"]');

        selectedSurahEl?.scrollIntoView({ block: 'center', behavior: 'smooth' });
        selectedVerseEl?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, selectedSurah, selectedVerse]);

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
            <h3 className="p-3 text-lg font-bold text-center border-b bg-muted/30 sticky top-0 z-10 text-foreground">
              Select Surah
            </h3>
            <ScrollArea className="flex-1">
              <div
                ref={surahListRef}
                className="p-2 space-y-1"
              >
                {surahs.length > 0 ? (
                  surahs.map((surah) => (
                    <button
                      key={surah.number}
                      data-selected-surah={selectedSurah === surah.number.toString()}
                      onClick={() => handleSurahSelect(surah.number.toString())}
                      className={cn(
                        "w-full text-left px-4 py-3 rounded-lg text-base transition-all duration-200 font-bold",
                        selectedSurah === surah.number.toString()
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "hover:bg-muted text-foreground"
                      )}
                    >
                      <span className="mr-2 text-sm font-bold">{surah.number}.</span>
                      {surah.englishName}
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground">Loading...</div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Verse Selection Column */}
          <div className="flex flex-col h-full overflow-hidden">
            <h3 className="p-3 text-lg font-bold text-center border-b bg-muted/30 sticky top-0 z-10 text-foreground">
              Select Verse
            </h3>
            <ScrollArea className="flex-1">
              <div
                ref={verseListRef}
                className="p-2 space-y-1"
              >
                {Array.from({ length: verseCount }, (_, i) => i + 1).map((v) => (
                  <button
                    key={v}
                    data-selected-verse={selectedVerse === v.toString()}
                    onClick={() => setSelectedVerse(v.toString())}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-lg text-base transition-all duration-200 flex items-center justify-between font-bold",
                      selectedVerse === v.toString()
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "hover:bg-muted text-foreground"
                    )}
                  >
                    <span>Verse {v}</span>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <div className="p-4 border-t bg-muted/10">
          <Button onClick={handleGo} className="w-full text-lg h-12 shadow-md font-bold">
            Go to Surah {selectedSurah}, Verse {selectedVerse}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
