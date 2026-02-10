import { HighlightColor } from '@/types/quran';

export const highlightColors: { color: HighlightColor; className: string; label: string }[] = [
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
