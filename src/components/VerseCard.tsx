import React, { useState } from 'react';
import { Bookmark, Copy, Share2, Highlighter, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useQuranStore } from '@/store/quranStore';
import type { CombinedVerse, BookmarkColor, HighlightColor, TranslationFont } from '@/types/quran';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { AddBookmarkDialog } from './bookmarks/AddBookmarkDialog';
import { highlightMatch } from '@/lib/highlight';

interface VerseCardProps {
  verse: CombinedVerse;
  surahNumber: number;
  surahName: string;
  searchQuery?: string;
  searchMode?: 'similar' | 'exact';
}

const bookmarkColors: { color: BookmarkColor; className: string; label: string }[] = [
  { color: 'red', className: 'bg-red-500', label: 'Red' },
  { color: 'blue', className: 'bg-blue-500', label: 'Blue' },
  { color: 'yellow', className: 'bg-yellow-500', label: 'Yellow' },
  { color: 'purple', className: 'bg-purple-500', label: 'Purple' },
  { color: 'green', className: 'bg-green-500', label: 'Green' },
  { color: 'orange', className: 'bg-orange-500', label: 'Orange' },
  { color: 'pink', className: 'bg-pink-500', label: 'Pink' },
  { color: 'teal', className: 'bg-teal-500', label: 'Teal' },
  { color: 'lime', className: 'bg-lime-500', label: 'Lime' },
  { color: 'brown', className: 'bg-amber-800', label: 'Brown' },
];

const highlightColors: { color: HighlightColor; className: string; label: string }[] = [
  { color: 'yellow', className: 'bg-yellow-200 dark:bg-yellow-800', label: 'Yellow' },
  { color: 'green', className: 'bg-green-200 dark:bg-green-800', label: 'Green' },
  { color: 'blue', className: 'bg-blue-200 dark:bg-blue-800', label: 'Blue' },
  { color: 'pink', className: 'bg-pink-200 dark:bg-pink-800', label: 'Pink' },
  { color: 'orange', className: 'bg-orange-200 dark:bg-orange-800', label: 'Orange' },
  { color: 'purple', className: 'bg-purple-200 dark:bg-purple-800', label: 'Purple' },
  { color: 'red', className: 'bg-red-200 dark:bg-red-800', label: 'Red' },
  { color: 'teal', className: 'bg-teal-200 dark:bg-teal-800', label: 'Teal' },
  { color: 'lime', className: 'bg-lime-200 dark:bg-lime-800', label: 'Lime' },
  { color: 'rose', className: 'bg-rose-200 dark:bg-rose-800', label: 'Rose' },
];

export const VerseCard: React.FC<VerseCardProps> = ({
  verse,
  surahNumber,
  surahName,
  searchQuery,
  searchMode = 'similar'
}) => {
  const [copied, setCopied] = useState(false);
  const [showBookmarkDialog, setShowBookmarkDialog] = useState(false);
  const { settings, getBookmark, removeBookmark, getHighlight, addHighlight, removeHighlight, collections } = useQuranStore();

  const bookmark = getBookmark(surahNumber, verse.verseNumber);
  const highlight = getHighlight(surahNumber, verse.verseNumber);

  const isInCollection = collections.some(c => c.bookmarks.some(b => b.surahNumber === surahNumber && b.verseNumber === verse.verseNumber));
  const isBookmarked = !!bookmark || isInCollection;

  const getHighlightClass = () => {
    if (!highlight?.color) return '';
    const found = highlightColors.find(h => h.color === highlight.color);
    return found ? found.className : '';
  };

  const getArabicFontClass = () => {
    switch (settings.arabicFont) {
      case 'uthmani': return 'font-uthmani';
      case 'indopak': return 'font-indopak';
      default: return 'font-noorehuda';
    }
  };

  const getTranslationFontFamily = (font: TranslationFont): string => {
    switch (font) {
      case 'times-new-roman': return '"Times New Roman", Times, serif';
      case 'georgia': return 'Georgia, serif';
      case 'libre-baskerville': return '"Libre Baskerville", Georgia, serif';
      case 'eb-garamond': return '"EB Garamond", Georgia, serif';
      default: return 'system-ui, sans-serif';
    }
  };

  const getTranslationFontStyle = () => {
    const isBold = settings.translationFontBold || settings.translationFontStyle === 'bold-italic';
    const isItalic = settings.translationFontStyle === 'italic' || settings.translationFontStyle === 'bold-italic';
    return {
      fontWeight: isBold ? 'bold' : 'normal',
      fontStyle: isItalic ? 'italic' : 'normal',
    };
  };

  const getBookmarkColorClass = () => {
    if (!bookmark?.color) return '';
    const found = bookmarkColors.find(b => b.color === bookmark.color);
    return found ? found.className : '';
  };

  const handleCopy = async () => {
    let text = verse.arabic;
    if (settings.translationDisplay === 'all' || settings.translationDisplay === 'english') {
      text += `\n\n${verse.english}`;
    } else if (settings.translationDisplay === 'luganda') {
      text += `\n\n${verse.luganda}`;
    }
    text += `\n\n— ${surahName} \u200E(${verse.verseNumber})`;

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "Verse copied to clipboard",
    });
  };

  const handleShare = async () => {
    let text = verse.arabic;
    if (settings.translationDisplay === 'all' || settings.translationDisplay === 'english') {
      text += `\n\n${verse.english}`;
    } else if (settings.translationDisplay === 'luganda') {
      text += `\n\n${verse.luganda}`;
    }
    text += `\n\n— ${surahName} \u200E(${verse.verseNumber})`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${surahName} - Verse ${verse.verseNumber}`,
          text: text,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      handleCopy();
    }
  };

  const handleHighlight = (color: HighlightColor) => {
    if (highlight?.color === color) {
      removeHighlight(surahNumber, verse.verseNumber);
      toast({
        title: "Highlight removed",
        description: `Removed highlight from verse ${verse.verseNumber}`,
      });
    } else {
      addHighlight(surahNumber, verse.verseNumber, color);
      toast({
        title: "Highlighted!",
        description: `Added ${color} highlight to verse ${verse.verseNumber}`,
      });
    }
  };

  const showLuganda = settings.translationDisplay === 'all' || settings.translationDisplay === 'luganda';
  const showEnglish = settings.translationDisplay === 'all' || settings.translationDisplay === 'english';
  const translationStyles = getTranslationFontStyle();

  return (
    <div
      className={cn(
        "verse-card app-card-shadow animate-fade-in relative overflow-hidden",
        "bg-white !border-none",
        "dark:bg-[hsl(var(--verse-bg))] dark:!border-none",
        getHighlightClass()
      )}
      style={{ animationDelay: `${(verse.verseNumber % 10) * 50}ms` }}
    >
      {/* Bookmark indicator */}
      {isBookmarked && (
        <div className="absolute top-2 right-4">
          <Bookmark
            className="h-6 w-6 fill-current text-primary"
          />
        </div>
      )}

      <div className="space-y-4">
        {/* Arabic text with verse number */}
        {/* Arabic text with verse number - Stacked layout */}
        <div className="flex flex-col gap-2 w-full">
          <div className="verse-number-ornament self-start">
            {verse.verseNumber}
          </div>
          <p
            className={cn("arabic-text w-full text-right leading-normal", getArabicFontClass())}
            style={{
              fontSize: `${settings.arabicFontSize}px`,
              color: settings.arabicFontColor,
              fontWeight: settings.arabicFontBold ? 'bold' : 'normal',
              wordBreak: 'normal',
              overflowWrap: 'anywhere',
              whiteSpace: 'pre-wrap',
            }}
            dir="rtl"
          >
            {searchQuery ? highlightMatch(verse.arabic, searchQuery, searchMode) : verse.arabic}
          </p>
        </div>

        {/* Luganda translation - full width from left */}
        {showLuganda && (
          <p
            className="translation-text text-left w-full"
            style={{
              fontSize: `${settings.translationFontSize}px`,
              color: settings.translationFontColor,
              fontFamily: getTranslationFontFamily(settings.translationFont),
              ...translationStyles,
              lineHeight: '1.5',
              wordBreak: 'normal',
              overflowWrap: 'anywhere',
              whiteSpace: 'pre-wrap',
            }}
          >
            <span className="text-[15px] font-semibold text-primary uppercase tracking-wide block mb-1" style={{ fontStyle: 'normal' }}>
              Luganda
            </span>
            {searchQuery ? highlightMatch(verse.luganda, searchQuery, searchMode) : verse.luganda}
          </p>
        )}

        {/* English translation - full width from left */}
        {showEnglish && (
          <p
            className="translation-text text-left w-full"
            style={{
              fontSize: `${settings.translationFontSize}px`,
              color: settings.translationFontColor,
              fontFamily: getTranslationFontFamily(settings.translationFont),
              ...translationStyles,
              lineHeight: '1.5',
              wordBreak: 'normal',
              overflowWrap: 'anywhere',
              whiteSpace: 'pre-wrap',
            }}
          >
            <span className="text-[15px] font-semibold text-primary uppercase tracking-wide block mb-1" style={{ fontStyle: 'normal' }}>
              English
            </span>
            {searchQuery ? highlightMatch(verse.english, searchQuery, searchMode) : verse.english}
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-1 mt-4 pt-3 border-t border-border/50">
        {/* Bookmark button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowBookmarkDialog(true)}
          className={cn(
            "h-8 px-2",
            isBookmarked && "text-primary"
          )}
        >
          <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current")} />
          <span className="sr-only">Bookmark</span>
        </Button>
        <AddBookmarkDialog
          isOpen={showBookmarkDialog}
          onClose={() => setShowBookmarkDialog(false)}
          surahNumber={surahNumber}
          verseNumber={verse.verseNumber}
        />

        {/* Highlight button */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 px-2",
                highlight && "text-primary"
              )}
            >
              <Highlighter className={cn("h-4 w-4", highlight && "fill-current")} />
              <span className="sr-only">Highlight</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3 bg-popover" align="end">
            <p className="text-xs font-medium mb-2 text-muted-foreground">Select highlight color</p>
            <div className="grid grid-cols-5 gap-2">
              {highlightColors.map((hc) => (
                <button
                  key={hc.color}
                  onClick={() => handleHighlight(hc.color)}
                  className={cn(
                    "w-6 h-6 rounded-full border-2 border-foreground/20 transition-transform hover:scale-110",
                    hc.className,
                    highlight?.color === hc.color && "ring-2 ring-offset-2 ring-foreground"
                  )}
                  title={hc.label}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Copy button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-8 px-2"
        >
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          <span className="sr-only">Copy</span>
        </Button>

        {/* Share button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          className="h-8 px-2"
        >
          <Share2 className="h-4 w-4" />
          <span className="sr-only">Share</span>
        </Button>
      </div>
    </div>
  );
};
