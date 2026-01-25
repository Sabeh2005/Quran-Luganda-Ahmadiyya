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
    } = useQuranStore();

    const [isSingle, setIsSingle] = useState(false);
    const [selectedCollectionIds, setSelectedCollectionIds] = useState<Set<string>>(new Set());
    const [showCreateCollection, setShowCreateCollection] = useState(false);

    // Initialize state when dialog opens
    useEffect(() => {
        if (isOpen) {
            // Check if in Single Bookmarks
            const singleExists = bookmarks.some(
                (b) => b.surahNumber === surahNumber && b.verseNumber === verseNumber
            );
            setIsSingle(singleExists);

            // Check which collections contain this verse
            const inCollections = new Set<string>();
            collections.forEach((c) => {
                if (c.bookmarks.some((b) => b.surahNumber === surahNumber && b.verseNumber === verseNumber)) {
                    inCollections.add(c.id);
                }
            });
            setSelectedCollectionIds(inCollections);
        }
    }, [isOpen, surahNumber, verseNumber, bookmarks, collections]);

    const handleToggleCollection = (id: string) => {
        const newSet = new Set(selectedCollectionIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedCollectionIds(newSet);
    };

    const handleDone = () => {
        // Update Single Bookmark State
        const currentlyInSingle = bookmarks.some(
            (b) => b.surahNumber === surahNumber && b.verseNumber === verseNumber
        );

        if (isSingle && !currentlyInSingle) {
            addBookmark(surahNumber, verseNumber, 'green'); // Default to green
        } else if (!isSingle && currentlyInSingle) {
            removeBookmark(surahNumber, verseNumber);
        }

        // Update Collections State
        collections.forEach((c) => {
            const isSelected = selectedCollectionIds.has(c.id);
            const currentlyInCollection = c.bookmarks.some(
                (b) => b.surahNumber === surahNumber && b.verseNumber === verseNumber
            );

            if (isSelected !== currentlyInCollection) {
                toggleBookmarkInCollection(c.id, surahNumber, verseNumber);
            }
        });

        onClose();
    };

    // Determine title based on initial state (simplified to check if any bookmark exists)
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
            default: return 'bg-gray-500';
        }
    };

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
                        {/* Single Bookmark Option */}
                        <div
                            className="flex items-center gap-3 cursor-pointer"
                            onClick={() => setIsSingle(!isSingle)}
                        >
                            <div className={cn(
                                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                                isSingle ? "bg-green-600 border-green-600" : "border-muted-foreground"
                            )}>
                                {isSingle && <Check className="w-4 h-4 text-white" />}
                            </div>
                            <span className="font-semibold text-lg">Single Bookmark</span>
                        </div>

                        {/* Collections Section */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "w-6 h-6 rounded-full border-2 border-muted-foreground flex items-center justify-center",
                                    // Only show active style if at least one collection is selected? 
                                    // Or just keep it as a section header icon as per screenshot 7?
                                    // Screenshot 7 has an empty circle. Let's keep it empty to represent the group?
                                    selectedCollectionIds.size > 0 ? "border-green-600" : ""
                                )}>
                                    {/* Maybe show partial check? For now keep empty/border logic */}
                                </div>
                                <span className="font-semibold text-lg">Bookmarks Collection</span>
                            </div>

                            <div className="pl-9 space-y-3">
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
                            className="rounded-full px-8 bg-[#75a47f] hover:bg-[#5e8e68] text-white"
                            onClick={handleDone}
                        >
                            Done
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <CreateCollectionDialog
                isOpen={showCreateCollection}
                onClose={() => setShowCreateCollection(false)}
            />
        </>
    );
};
