import { useEffect } from 'react';
import type { EventName } from '@/lib/events';

const dispatchInteraction = (
    eventName: EventName,
    metadata?: Record<string, unknown>
) => {
    const e = new CustomEvent('definedInteraction', {
        detail: { eventName, metadata },
    });
    document.dispatchEvent(e);
};

// auto-track hovers on links and buttons across the page
export const useAutoHoverTracking = (threshold: number = 1200) => {
    useEffect(() => {
        const hoverTimers = new Map<HTMLElement, NodeJS.Timeout>();

        const handleMouseEnter = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const isLink = target.tagName === 'A' || target.closest('a');
            const isButton = target.tagName === 'BUTTON' || target.closest('button');

            if (!isLink && !isButton) return;

            const element = (isLink ? (target.tagName === 'A' ? target : target.closest('a')) : (target.tagName === 'BUTTON' ? target : target.closest('button'))) as HTMLElement;
            if (!element) return;

            const startTime = Date.now();
            const timer = setTimeout(() => {
                const dwellTime = Date.now() - startTime;
                const eventName: EventName = isLink ? 'hover_over_link' : 'hover_over_button';
                
                dispatchInteraction(eventName, {
                    dwellTime,
                    text: element.textContent?.trim().slice(0, 50),
                    href: isLink ? (element as HTMLAnchorElement).href : undefined,
                    elementId: element.id || undefined,
                });
            }, threshold);

            hoverTimers.set(element, timer);
        };

        const handleMouseLeave = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const element = target.tagName === 'A' || target.tagName === 'BUTTON' 
                ? target 
                : (target.closest('a') || target.closest('button')) as HTMLElement;
            
            if (element && hoverTimers.has(element)) {
                clearTimeout(hoverTimers.get(element)!);
                hoverTimers.delete(element);
            }
        };

        document.addEventListener('mouseenter', handleMouseEnter, true);
        document.addEventListener('mouseleave', handleMouseLeave, true);

        return () => {
            hoverTimers.forEach(timer => clearTimeout(timer));
            hoverTimers.clear();
            document.removeEventListener('mouseenter', handleMouseEnter, true);
            document.removeEventListener('mouseleave', handleMouseLeave, true);
        };
    }, [threshold]);
};
