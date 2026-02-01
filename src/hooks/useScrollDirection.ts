import { useState, useEffect } from 'react';

export type ScrollDirection = 'up' | 'down' | null;

export const useScrollDirection = (threshold: number = 10) => {
    const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(null);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Don't hide header when at the very top
            if (currentScrollY < threshold) {
                setScrollDirection(null);
                setLastScrollY(currentScrollY);
                return;
            }

            // Determine scroll direction
            if (Math.abs(currentScrollY - lastScrollY) > threshold) {
                if (currentScrollY > lastScrollY) {
                    setScrollDirection('down');
                } else {
                    setScrollDirection('up');
                }
                setLastScrollY(currentScrollY);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY, threshold]);

    return scrollDirection;
};
