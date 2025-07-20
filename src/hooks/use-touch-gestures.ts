'use client';

import { useEffect, useRef, RefObject } from 'react';

interface TouchGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  threshold?: number;
  preventScroll?: boolean;
}

interface TouchPoint {
  x: number;
  y: number;
  time: number;
}

export const useTouchGestures = <T extends HTMLElement>(
  options: TouchGestureOptions = {}
): RefObject<T> => {
  const elementRef = useRef<T>(null);
  const touchStart = useRef<TouchPoint | null>(null);
  const lastTap = useRef<number>(0);
  const initialDistance = useRef<number>(0);

  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPinch,
    onTap,
    onDoubleTap,
    threshold = 50,
    preventScroll = false,
  } = options;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const getTouchPoint = (touch: Touch): TouchPoint => ({
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    });

    const getDistance = (touch1: Touch, touch2: Touch): number => {
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (preventScroll) {
        e.preventDefault();
      }

      if (e.touches.length === 1) {
        touchStart.current = getTouchPoint(e.touches[0]);
      } else if (e.touches.length === 2 && onPinch) {
        initialDistance.current = getDistance(e.touches[0], e.touches[1]);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (preventScroll) {
        e.preventDefault();
      }

      if (e.touches.length === 2 && onPinch && initialDistance.current > 0) {
        const currentDistance = getDistance(e.touches[0], e.touches[1]);
        const scale = currentDistance / initialDistance.current;
        onPinch(scale);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (preventScroll) {
        e.preventDefault();
      }

      if (!touchStart.current || e.touches.length > 0) return;

      const touchEnd = getTouchPoint(e.changedTouches[0]);
      const deltaX = touchEnd.x - touchStart.current.x;
      const deltaY = touchEnd.y - touchStart.current.y;
      const deltaTime = touchEnd.time - touchStart.current.time;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Handle tap gestures
      if (distance < 10 && deltaTime < 300) {
        const now = Date.now();
        const timeSinceLastTap = now - lastTap.current;

        if (timeSinceLastTap < 300 && onDoubleTap) {
          onDoubleTap();
          lastTap.current = 0; // Reset to prevent triple tap
        } else {
          lastTap.current = now;
          if (onTap) {
            setTimeout(() => {
              if (lastTap.current === now) {
                onTap();
              }
            }, 300);
          }
        }
        return;
      }

      // Handle swipe gestures
      if (distance > threshold) {
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        if (absX > absY) {
          // Horizontal swipe
          if (deltaX > 0 && onSwipeRight) {
            onSwipeRight();
          } else if (deltaX < 0 && onSwipeLeft) {
            onSwipeLeft();
          }
        } else {
          // Vertical swipe
          if (deltaY > 0 && onSwipeDown) {
            onSwipeDown();
          } else if (deltaY < 0 && onSwipeUp) {
            onSwipeUp();
          }
        }
      }

      touchStart.current = null;
      initialDistance.current = 0;
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: !preventScroll });
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventScroll });
    element.addEventListener('touchend', handleTouchEnd, { passive: !preventScroll });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPinch,
    onTap,
    onDoubleTap,
    threshold,
    preventScroll,
  ]);

  return elementRef;
};