import { useState, useEffect, useRef } from 'react';

export type ScrollDirection = 'up' | 'down' | null;

export const useScrollDirection = (threshold: number = 50, isPaused: boolean = false) => {
    const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(null);
    const lastScrollY = useRef(0);
    const mountTime = useRef(Date.now());

    useEffect(() => {
        // Initialize with current scroll position
        lastScrollY.current = window.scrollY;
        mountTime.current = Date.now();

        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Grace period after mount (1 second) to ignore auto-focus scrolls or layout shifts
            if (Date.now() - mountTime.current < 1000) {
                lastScrollY.current = currentScrollY;
                return;
            }

            if (isPaused) {
                lastScrollY.current = currentScrollY;
                setScrollDirection('up');
                return;
            }

            // Always show header when near the very top (within threshold)
            if (currentScrollY < threshold) {
                setScrollDirection(null);
                lastScrollY.current = currentScrollY;
                return;
            }

            // Determine scroll direction based on movement
            const diff = currentScrollY - lastScrollY.current;

            // Only update if movement exceeds threshold to avoid jitter
            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    setScrollDirection('down');
                } else {
                    setScrollDirection('up');
                }
                lastScrollY.current = currentScrollY;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [threshold, isPaused]);

    // Ensure header is visible if we start paused
    useEffect(() => {
        if (isPaused) {
            setScrollDirection('up');
        }
    }, [isPaused]);

    return scrollDirection;
};
