import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CollectionColor } from '@/types/quran';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuranStore } from '@/store/quranStore';

interface CreateCollectionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    editCollectionId?: string; // If provided, we are in edit mode
}

const colors: { color: CollectionColor; className: string }[] = [
    { color: 'green', className: 'bg-green-500' },
    { color: 'blue', className: 'bg-blue-500' },
    { color: 'orange', className: 'bg-orange-500' },
    { color: 'purple', className: 'bg-purple-500' },
    { color: 'yellow', className: 'bg-yellow-500' },
    { color: 'peach', className: 'bg-[#ff9e80]' },
    { color: 'red', className: 'bg-red-500' },
    { color: 'teal', className: 'bg-teal-500' },
    { color: 'brown', className: 'bg-amber-800' },
    { color: 'pink', className: 'bg-pink-500' },
];

export const CreateCollectionDialog: React.FC<CreateCollectionDialogProps> = ({
    isOpen,
    onClose,
    editCollectionId,
}) => {
    const { collections, createCollection, editCollection, deleteCollection } = useQuranStore();
    const [name, setName] = useState('');
    const [selectedColor, setSelectedColor] = useState<CollectionColor>('green');

    useEffect(() => {
        if (isOpen) {
            if (editCollectionId) {
                const collection = collections.find((c) => c.id === editCollectionId);
                if (collection) {
                    setName(collection.name);
                    setSelectedColor(collection.color);
                }
            } else {
                setName('');
                setSelectedColor('green');
            }
        }
    }, [isOpen, editCollectionId, collections]);

    const handleSave = () => {
        if (!name.trim()) return;

        if (editCollectionId) {
            editCollection(editCollectionId, name, selectedColor);
        } else {
            createCollection(name, selectedColor);
        }
        onClose();
    };

    const handleDelete = () => {
        if (editCollectionId) {
            deleteCollection(editCollectionId);
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-center text-xl font-bold">
                        {editCollectionId ? 'Edit Collection' : 'Create New'}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold uppercase tracking-wide">Name</label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Collection Name"
                            className="border-0 border-b border-input rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary text-lg"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-medium">Choose a color</label>
                        <div className="grid grid-cols-5 gap-3 justify-items-center">
                            {colors.map(({ color, className }) => (
                                <button
                                    key={color}
                                    onClick={() => setSelectedColor(color)}
                                    className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110",
                                        className
                                    )}
                                >
                                    {selectedColor === color && (
                                        <Check className="w-5 h-5 text-white" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 sm:gap-2">
                    <Button
                        onClick={handleSave}
                        className="w-full bg-[#75a47f] hover:bg-[#5e8e68] text-white rounded-full h-12 text-lg"
                    >
                        {editCollectionId ? 'Update' : 'Create and Add'}
                    </Button>

                    {editCollectionId ? (
                        <Button
                            variant="ghost"
                            onClick={handleDelete}
                            className="w-full text-lg font-normal hover:bg-transparent hover:text-destructive"
                        >
                            Delete
                        </Button>
                    ) : (
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            className="w-full text-lg font-normal hover:bg-transparent"
                        >
                            Cancel
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
