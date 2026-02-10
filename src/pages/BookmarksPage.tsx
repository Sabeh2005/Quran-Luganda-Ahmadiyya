import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuranStore } from '@/store/quranStore';
import { useQuranData } from '@/hooks/useQuranData';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { cn } from '@/lib/utils';
import backIcon from '@/assets/back-icon.svg';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookmarkItem } from '@/components/bookmarks/BookmarkItem';
import { CollectionItem } from '@/components/bookmarks/CollectionItem';
import { CreateCollectionDialog } from '@/components/bookmarks/CreateCollectionDialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { BookmarkCollection } from '@/types/quran';

const BookmarksPage = () => {
    const navigate = useNavigate();
    const bookmarks = useQuranStore(state => state.bookmarks);
    const collections = useQuranStore(state => state.collections);
    const clearAllBookmarks = useQuranStore(state => state.clearAllBookmarks);
    const clearAllCollections = useQuranStore(state => state.clearAllCollections);
    const settings = useQuranStore(state => state.settings);
    const { surahs } = useQuranData();
    const scrollDirection = useScrollDirection();
    const isHeaderHidden = scrollDirection === 'down';

    const [activeTab, setActiveTab] = useState(settings.swapBookmarksAndCollections ? 'collections' : 'single');
    const [viewingCollection, setViewingCollection] = useState<BookmarkCollection | null>(null);
    const [showClearDialog, setShowClearDialog] = useState(false);
    const [editingCollectionId, setEditingCollectionId] = useState<string | null>(null);
    const [showCreateDialog, setShowCreateDialog] = useState(false);

    const getVerseData = (surahNum: number, verseNum: number) => {
        const surah = surahs.find(s => s.number === surahNum);
        return surah?.verses.find(v => v.verseNumber === verseNum);
    };

    const handleClearAll = () => {
        setShowClearDialog(true);
    };

    const confirmClear = () => {
        if (activeTab === 'single') {
            clearAllBookmarks();
        } else {
            clearAllCollections();
        }
        setShowClearDialog(false);
    };

    // Filter bookmarks for display
    // For 'Single Bookmarks', we use the root `bookmarks` array.
    // For 'Collections', we show the list of collections.

    // If Viewing Collection
    const collectionBookmarks = viewingCollection
        ? viewingCollection.bookmarks
        : [];

    const handleCreateCollection = () => {
        setEditingCollectionId(null);
        setShowCreateDialog(true);
    };

    const handleEditCollection = (id: string) => {
        setEditingCollectionId(id);
        setShowCreateDialog(true);
    };

    if (viewingCollection) {
        return (
            <div className="min-h-screen bg-background">
                {/* Collection Detail Header */}
                <header className={cn(
                    "sticky top-0 z-40 w-full h-20 header-gradient shadow-md px-0 flex items-center text-white transition-transform duration-300",
                    isHeaderHidden ? "-translate-y-full" : "translate-y-0"
                )}>
                    <div className="flex items-center w-full px-0 relative h-full">
                        <Button variant="ghost" size="icon" onClick={() => setViewingCollection(null)} className="text-white hover:bg-white/20 z-10">
                            <img src={backIcon} alt="Back" className="w-6 h-6 brightness-0 invert" />
                        </Button>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <h1 className="text-3xl font-bold text-center px-12">{viewingCollection.name}</h1>
                        </div>
                    </div>
                </header>

                <div className="w-full space-y-2">
                    {collectionBookmarks.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">Empty collection</div>
                    ) : (
                        collectionBookmarks.map((b, idx) => {
                            const verse = getVerseData(b.surahNumber, b.verseNumber);
                            if (!verse) return null;
                            return <BookmarkItem key={idx} verse={verse} surahNumber={b.surahNumber} />;
                        })
                    )}
                </div>
            </div>
        );
    }

    const singleTabTrigger = (
        <TabsTrigger
            value="single"
            className="rounded-none h-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-base transition-colors"
        >
            Single Bookmarks
        </TabsTrigger>
    );

    const collectionsTabTrigger = (
        <TabsTrigger
            value="collections"
            className="rounded-none h-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-base transition-colors"
        >
            Collections
        </TabsTrigger>
    );

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Main Header */}
            <header className={cn(
                "sticky top-0 z-40 w-full h-20 header-gradient shadow-md px-0 flex items-center text-white transition-transform duration-300",
                isHeaderHidden ? "-translate-y-full" : "translate-y-0"
            )}>
                <div className="flex items-center justify-between w-full px-0 relative h-full">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-white hover:bg-white/20 z-10">
                        <img src={backIcon} alt="Back" className="w-6 h-6 brightness-0 invert" />
                    </Button>

                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <h1 className="text-3xl font-bold text-center">Bookmarks</h1>
                    </div>

                    <Button
                        variant="ghost"
                        className="text-white font-semibold uppercase hover:bg-white/20 z-10"
                        onClick={handleClearAll}
                    >
                        CLEAR ALL
                    </Button>
                </div>
            </header>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col">
                <TabsList className="w-full grid grid-cols-2 rounded-none h-12 bg-white dark:bg-card border-b">
                    {settings.swapBookmarksAndCollections ? (
                        <>
                            {collectionsTabTrigger}
                            {singleTabTrigger}
                        </>
                    ) : (
                        <>
                            {singleTabTrigger}
                            {collectionsTabTrigger}
                        </>
                    )}
                </TabsList>

                <div className="flex-1 bg-background">
                    <TabsContent value="single" className="mt-0 space-y-0">
                        {bookmarks.length === 0 ? (
                            <div className="text-center py-20 text-muted-foreground">
                                No single bookmarks
                            </div>
                        ) : (
                            bookmarks.map((b, idx) => {
                                const verse = getVerseData(b.surahNumber, b.verseNumber);
                                if (!verse) return null;
                                return <BookmarkItem key={idx} verse={verse} surahNumber={b.surahNumber} />;
                            })
                        )}
                    </TabsContent>

                    <TabsContent value="collections" className="mt-0">
                        {/* "Create New" button usually at top or floating? Screenshot 2 doesn't show button. 
                   But how to create collection? 
                   Usually from "Add Bookmark" dialog OR maybe a floating button. 
                   I'll add a padding or just rely on the "Add Bookmark" dialog flow + allow management here.
                   Wait, user needs to be able to create collection from here too? 
                   Screenshot 2 just shows list. 
                   I'll stick to displaying list. Creation happens via "Create New" in Add Dialog, 
                   OR I can add a Floating Action Button or valid UI if requested.
                   "Create New" exists in Add Dialog.
                   I will assume management (Edit/Delete) is main goal here.
               */}
                        <div className="divide-y">
                            {/* Special "Default" collection logic?
                       If we want a "Default" collection that always exists, we can add it. 
                       But user screenshots show "Default" as just a collection name.
                   */}
                            {collections.length === 0 ? (
                                <div className="text-center py-20 text-muted-foreground">
                                    No collections
                                </div>
                            ) : (
                                collections.map((c) => (
                                    <CollectionItem
                                        key={c.id}
                                        collection={c}
                                        onClick={() => setViewingCollection(c)}
                                        onEdit={() => handleEditCollection(c.id)}
                                    />
                                ))
                            )}
                        </div>
                    </TabsContent>
                </div>
            </Tabs>

            {/* Clear Confirmation Dialog */}
            <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-center">
                            {activeTab === 'single' ? 'Remove Bookmarks' : 'Remove Collections'}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-center font-bold text-lg text-foreground mt-4">
                            {activeTab === 'single'
                                ? 'Are you sure? you want to remove all bookmarks?'
                                : 'Are you sure? you want to remove all collections?'
                            }
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-col gap-3">
                        <Button
                            className="w-full bg-[#75a47f] hover:bg-[#5e8e68] text-white rounded-full h-12 text-lg sm:text-lg"
                            onClick={confirmClear}
                        >
                            Yes
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full text-lg sm:text-lg font-bold"
                            onClick={() => setShowClearDialog(false)}
                        >
                            Cancel
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Edit Collection Dialog */}
            <CreateCollectionDialog
                isOpen={showCreateDialog}
                onClose={() => setShowCreateDialog(false)}
                editCollectionId={editingCollectionId || undefined}
            />
        </div>
    );
};

export default BookmarksPage;
