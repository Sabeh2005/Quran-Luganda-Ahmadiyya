import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useQuranData } from "@/hooks/useQuranData";

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
    } else {
        // Fallback or loading state if surahs not loaded yet (though hook handles it)
    }
  }, [selectedSurah, surahs, selectedVerse]);

  const handleGo = () => {
    navigate(`/surah/${selectedSurah}?verse=${selectedVerse}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-primary">
            Quick Navigation
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Select Surah</label>
            <Select
              value={selectedSurah}
              onValueChange={setSelectedSurah}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Surah" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {surahs.length > 0 ? (
                    surahs.map((surah) => (
                    <SelectItem key={surah.number} value={surah.number.toString()}>
                        {surah.number}. {surah.englishName}
                    </SelectItem>
                    ))
                ) : (
                    // Fallback if data loading
                    <SelectItem value="1">Loading...</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Select Verse</label>
            <Select
              value={selectedVerse}
              onValueChange={setSelectedVerse}
              disabled={surahs.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Verse" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {Array.from({ length: verseCount }, (_, i) => i + 1).map((v) => (
                  <SelectItem key={v} value={v.toString()}>
                    Verse {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleGo} className="w-full mt-2 text-lg">
            Go to Verse
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
