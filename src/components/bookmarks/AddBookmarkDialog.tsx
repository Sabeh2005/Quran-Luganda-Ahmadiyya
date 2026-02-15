import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useQuranStore } from '@/store/quranStore';
import { Check, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CreateCollectionDialog } from './CreateCollectionDialog';
import { CollectionColor } from '@/types/quran';

interface AddBookmarkDialogProps {
    isOpen: boolean;
    onClose: () => void;
    surahNumber: number;
    verseNumber: number;
}

export const AddBookmarkDialog: React.FC<AddBookmarkDialogProps> = ({
    isOpen,
    onClose,
    surahNumber,
    verseNumber,
}) => {
    const {
        bookmarks,
        collections,
        addBookmark,
        removeBookmark,
        toggleBookmarkInCollection,
        settings,
    } = useQuranStore();

    const [mode, setMode] = useState<'single' | 'collection'>('single');
    const [selectedCollectionIds, setSelectedCollectionIds] = useState<Set<string>>(new Set());
    const [showCreateCollection, setShowCreateCollection] = useState(false);

    // Initialize state when dialog opens
    useEffect(() => {
        if (isOpen) {
            // Check if in Single Bookmarks
            const singleExists = bookmarks.some(
                (b) => b.surahNumber === surahNumber && b.verseNumber === verseNumber
            );

            // Check which collections contain this verse
            const inCollections = new Set<string>();
            collections.forEach((c) => {
                if (c.bookmarks.some((b) => b.surahNumber === surahNumber && b.verseNumber === verseNumber)) {
                    inCollections.add(c.id);
                }
            });
            setSelectedCollectionIds(inCollections);

            // Default to single bookmark mode as per requirement
            setMode('single');
        }
    }, [isOpen, surahNumber, verseNumber, bookmarks, collections]);

    const handleToggleCollection = (id: string) => {
        // Automatically switch execution mode to collection if user clicks a collection
        if (mode !== 'collection') {
            setMode('collection');
        }

        const newSet = new Set(selectedCollectionIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedCollectionIds(newSet);
    };

    const handleDone = () => {
        // Logic:
        // If Mode is SINGLE:
        // - If bookmark exists in Single, remove it (toggle off)
        // - If bookmark doesn't exist in Single, add it
        // - Remove from ALL collections in both cases

        // If Mode is COLLECTION:
        // - Remove from Single Bookmarks (strict Radio implies exclusivity)
        // - Update Collections based on selection.

        if (mode === 'single') {
            if (isUpdate) {
                // If it's bookmarked ANYWHERE, selecting this mode should remove it from everywhere
                removeBookmark(surahNumber, verseNumber);
                collections.forEach(c => {
                    if (c.bookmarks.some(b => b.surahNumber === surahNumber && b.verseNumber === verseNumber)) {
                        toggleBookmarkInCollection(c.id, surahNumber, verseNumber);
                    }
                });
            } else {
                // Not bookmarked anywhere, add to single
                addBookmark(surahNumber, verseNumber, 'green');
            }
        } else {
            // Mode is COLLECTION

            // Remove from Single Bookmarks (if strict exclusivity desired)
            const currentlyInSingle = bookmarks.some(
                (b) => b.surahNumber === surahNumber && b.verseNumber === verseNumber
            );
            if (currentlyInSingle) {
                removeBookmark(surahNumber, verseNumber);
            }

            // Update Collections
            collections.forEach((c) => {
                const isSelected = selectedCollectionIds.has(c.id);
                const currentlyInCollection = c.bookmarks.some(
                    (b) => b.surahNumber === surahNumber && b.verseNumber === verseNumber
                );

                if (isSelected !== currentlyInCollection) {
                    toggleBookmarkInCollection(c.id, surahNumber, verseNumber);
                }
            });
        }

        onClose();
    };

    // Determine title based on initial state
    const isUpdate = bookmarks.some(b => b.surahNumber === surahNumber && b.verseNumber === verseNumber) ||
        collections.some(c => c.bookmarks.some(b => b.surahNumber === surahNumber && b.verseNumber === verseNumber));

    const getColorClass = (color: CollectionColor) => {
        switch (color) {
            case 'green': return 'bg-green-500';
            case 'blue': return 'bg-blue-500';
            case 'purple': return 'bg-purple-500';
            case 'orange': return 'bg-orange-500';
            case 'yellow': return 'bg-yellow-500';
            case 'peach': return 'bg-[#ff9e80]';
            case 'red': return 'bg-red-500';
            case 'teal': return 'bg-teal-500';
            case 'brown': return 'bg-amber-800';
            case 'pink': return 'bg-pink-500';
            default: return 'bg-gray-500';
        }
    };

    const singleSection = (
        <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => {
                setMode('single');
                setSelectedCollectionIds(new Set());
            }}
        >
            <div className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                mode === 'single' ? "bg-green-600 border-green-600" : "border-muted-foreground"
            )}>
                {mode === 'single' && <Check className="w-4 h-4 text-white" />}
            </div>
            <span className="font-semibold text-lg">
                {isUpdate ? "Remove Bookmark" : "Single Bookmark"}
            </span>
        </div>
    );

    const collectionSection = (
        <div className="space-y-3">
            <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => setMode('collection')}
            >
                <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                    mode === 'collection' ? "bg-green-600 border-green-600" : "border-muted-foreground"
                )}>
                    {mode === 'collection' && <Check className="w-4 h-4 text-white" />}
                </div>
                <span className="font-semibold text-lg">Bookmarks Collection</span>
            </div>

            <div className="pl-9 space-y-3 transition-opacity max-h-[320px] overflow-y-auto pr-2 scrollbar-hide">
                {collections.map((collection) => (
                    <div
                        key={collection.id}
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => handleToggleCollection(collection.id)}
                    >
                        <div className="flex items-center gap-3">
                            <div className={cn("w-2.5 h-2.5 rounded-full", getColorClass(collection.color))} />
                            <span className="text-base font-medium">{collection.name}</span>
                        </div>
                        <div className={cn(
                            "w-5 h-5 border-2 rounded flex items-center justify-center transition-colors",
                            selectedCollectionIds.has(collection.id) ? "bg-green-600 border-green-600" : "border-muted-foreground"
                        )}>
                            {selectedCollectionIds.has(collection.id) && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <DialogContent className="sm:max-w-xs w-[90%] rounded-xl">
                    <DialogHeader>
                        <DialogTitle className="text-center text-xl font-bold">
                            {isUpdate ? 'Update Bookmark' : 'Add Bookmarks'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {settings.swapBookmarksAndCollections ? (
                            <>
                                {collectionSection}
                                {singleSection}
                            </>
                        ) : (
                            <>
                                {singleSection}
                                {collectionSection}
                            </>
                        )}
                    </div>

                    <div className="flex gap-2 justify-center mt-2">
                        <Button
                            variant="outline"
                            className="rounded-full px-6 border-green-600 text-green-700 hover:text-green-800 hover:bg-green-50"
                            onClick={() => setShowCreateCollection(true)}
                        >
                            Create New
                        </Button>
                        <Button
                            className={cn(
                                "rounded-full px-8 text-white transition-colors",
                                mode === 'single' && isUpdate
                                    ? "bg-red-500 hover:bg-red-600"
                                    : "bg-[#75a47f] hover:bg-[#5e8e68]"
                            )}
                            onClick={handleDone}
                        >
                            {mode === 'single' && isUpdate ? 'Remove' : 'Done'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <CreateCollectionDialog
                isOpen={showCreateCollection}
                onClose={() => setShowCreateCollection(false)}
                onSuccess={onClose}
                surahNumber={surahNumber}
                verseNumber={verseNumber}
            />
        </>
    );
};
