import React from 'react';
import { BookmarkCollection, CollectionColor } from '@/types/quran';
import { ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';


interface CollectionItemProps {
    collection: BookmarkCollection;
    onClick: () => void;
    onEdit: () => void;
}

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

export const CollectionItem: React.FC<CollectionItemProps> = ({
    collection,
    onClick,
    onEdit
}) => {
    return (
        <div
            className="flex items-center justify-between p-4 bg-white dark:bg-card border-b border-border/40 hover:bg-gray-50 dark:hover:bg-accent/10 transition-colors cursor-pointer"
            onClick={onClick}
        >
            <div className="flex items-center gap-4">
                <div className={cn("w-2.5 h-2.5 rounded-full mt-1", getColorClass(collection.color))} />
                <div>
                    <h3 className="text-lg font-semibold leading-none mb-1">{collection.name}</h3>
                    <p className="text-sm text-muted-foreground">{collection.bookmarks.length} Ayat</p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <ChevronRight className="w-5 h-5 text-muted-foreground" />

                <button
                    className="p-2 hover:bg-gray-100 rounded-full"
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                    }}
                >
                    <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                </button>
            </div>
        </div>
    );
};
