'use client';

import { useEffect, useRef, RefObject } from 'react';
import { useMobileDetection } from './use-mobile-detection';

interface MobileGestureOptions {
  // Swipe gestures
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  
  // Tap gestures
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  
  // Pinch gestures
  onPinchStart?: () => void;
  onPinch?: (scale: number, velocity: number) => void;
  onPinchEnd?: () => void;
  
  // Pan gestures
  onPanStart?: (point: { x: number; y: number }) => void;
  onPan?: (delta: { x: number; y: number }, point: { x: number; y: number }) => void;
  onPanEnd?: (velocity: { x: number; y: number }) => void;
  
  // Configuration
  swipeThreshold?: number;
  longPressDelay?: number;
  doubleTapDelay?: number;
  pinchThreshold?: number;
  preventScroll?: boolean;
  enableHapticFeedback?: boolean;
}

interface TouchPoint {
  x: number;
  y: number;
  time: number;
  id: number;
}

interface GestureState {
  isActive: boolean;
  startPoints: TouchPoint[];
  currentPoints: TouchPoint[];
  gestureType: 'none' | 'tap' | 'swipe' | 'pinch' | 'pan' | 'longpress';
  initialDistance: number;
  initialCenter: { x: number; y: number };
}

export const useMobileGestures = <T extends HTMLElement>(
  options: MobileGestureOptions = {}
): RefObject<T> => {
  const elementRef = useRef<T>(null);
  const gestureState = useRef<GestureState>({
    isActive: false,
    startPoints: [],
    currentPoints: [],
    gestureType: 'none',
    initialDistance: 0,
    initialCenter: { x: 0, y: 0 },
  });
  
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const lastTapTime = useRef<number>(0);
  const tapCount = useRef<number>(0);
  
  const { isTouchDevice, isIOS } = useMobileDetection();

  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap,
    onDoubleTap,
    onLongPress,
    onPinchStart,
    onPinch,
    onPinchEnd,
    onPanStart,
    onPan,
    onPanEnd,
    swipeThreshold = 50,
    longPressDelay = 500,
    doubleTapDelay = 300,
    pinchThreshold = 0.1,
    preventScroll = false,
    enableHapticFeedback = true,
  } = options;

  // Haptic feedback utility
  const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!enableHapticFeedback || !isTouchDevice) return;
    
    try {
      if ('vibrate' in navigator) {
        const patterns = {
          light: [10],
          medium: [20],
          heavy: [30],
        };
        navigator.vibrate(patterns[type]);
      }
      
      // iOS haptic feedback
      if (isIOS && 'Taptic' in window) {
        (window as any).Taptic.impact(type);
      }
    } catch (error) {
      // Silently fail if haptic feedback is not supported
    }
  };

  const getTouchPoint = (touch: Touch): TouchPoint => ({
    x: touch.clientX,
    y: touch.clientY,
    time: Date.now(),
    id: touch.identifier,
  });

  const getDistance = (point1: TouchPoint, point2: TouchPoint): number => {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getCenter = (points: TouchPoint[]): { x: number; y: number } => {
    const sum = points.reduce(
      (acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }),
      { x: 0, y: 0 }
    );
    return {
      x: sum.x / points.length,
      y: sum.y / points.length,
    };
  };

  const getVelocity = (startPoint: TouchPoint, endPoint: TouchPoint): { x: number; y: number } => {
    const deltaTime = endPoint.time - startPoint.time;
    if (deltaTime === 0) return { x: 0, y: 0 };
    
    return {
      x: (endPoint.x - startPoint.x) / deltaTime,
      y: (endPoint.y - startPoint.y) / deltaTime,
    };
  };

  const clearLongPressTimer = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleTouchStart = (e: TouchEvent) => {
    if (preventScroll) {
      e.preventDefault();
    }

    const touches = Array.from(e.touches).map(getTouchPoint);
    gestureState.current = {
      isActive: true,
      startPoints: touches,
      currentPoints: touches,
      gestureType: 'none',
      initialDistance: touches.length === 2 ? getDistance(touches[0], touches[1]) : 0,
      initialCenter: getCenter(touches),
    };

    // Handle single touch
    if (touches.length === 1) {
      // Start long press timer
      if (onLongPress) {
        longPressTimer.current = setTimeout(() => {
          if (gestureState.current.isActive && gestureState.current.gestureType === 'none') {
            gestureState.current.gestureType = 'longpress';
            triggerHapticFeedback('medium');
            onLongPress();
          }
        }, longPressDelay);
      }
    }

    // Handle pinch start
    if (touches.length === 2 && onPinchStart) {
      gestureState.current.gestureType = 'pinch';
      onPinchStart();
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (preventScroll) {
      e.preventDefault();
    }

    if (!gestureState.current.isActive) return;

    const touches = Array.from(e.touches).map(getTouchPoint);
    gestureState.current.currentPoints = touches;

    const startPoint = gestureState.current.startPoints[0];
    const currentPoint = touches[0];

    // Clear long press if moved too much
    if (startPoint && currentPoint) {
      const distance = getDistance(startPoint, currentPoint);
      if (distance > 10) {
        clearLongPressTimer();
      }
    }

    // Handle pinch gesture
    if (touches.length === 2 && gestureState.current.gestureType === 'pinch' && onPinch) {
      const currentDistance = getDistance(touches[0], touches[1]);
      const scale = currentDistance / gestureState.current.initialDistance;
      const velocity = Math.abs(currentDistance - gestureState.current.initialDistance) / 100;
      
      if (Math.abs(scale - 1) > pinchThreshold) {
        onPinch(scale, velocity);
      }
    }

    // Handle pan gesture
    if (touches.length === 1 && gestureState.current.gestureType === 'none') {
      const delta = {
        x: currentPoint.x - startPoint.x,
        y: currentPoint.y - startPoint.y,
      };
      
      if (Math.abs(delta.x) > 5 || Math.abs(delta.y) > 5) {
        if (gestureState.current.gestureType === 'none') {
          gestureState.current.gestureType = 'pan';
          if (onPanStart) {
            onPanStart({ x: startPoint.x, y: startPoint.y });
          }
        }
        
        if (onPan) {
          onPan(delta, { x: currentPoint.x, y: currentPoint.y });
        }
      }
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (preventScroll) {
      e.preventDefault();
    }

    clearLongPressTimer();

    if (!gestureState.current.isActive) return;

    const endTouches = Array.from(e.changedTouches).map(getTouchPoint);
    const startPoint = gestureState.current.startPoints[0];
    const endPoint = endTouches[0];

    // Handle pinch end
    if (gestureState.current.gestureType === 'pinch' && onPinchEnd) {
      onPinchEnd();
    }

    // Handle pan end
    if (gestureState.current.gestureType === 'pan' && onPanEnd && startPoint && endPoint) {
      const velocity = getVelocity(startPoint, endPoint);
      onPanEnd(velocity);
    }

    // Handle tap and swipe gestures
    if (gestureState.current.gestureType === 'none' && startPoint && endPoint) {
      const deltaX = endPoint.x - startPoint.x;
      const deltaY = endPoint.y - startPoint.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const deltaTime = endPoint.time - startPoint.time;

      // Handle tap gestures
      if (distance < 10 && deltaTime < 300) {
        const now = Date.now();
        const timeSinceLastTap = now - lastTapTime.current;

        if (timeSinceLastTap < doubleTapDelay) {
          tapCount.current++;
        } else {
          tapCount.current = 1;
        }

        lastTapTime.current = now;

        if (tapCount.current === 2 && onDoubleTap) {
          triggerHapticFeedback('light');
          onDoubleTap();
          tapCount.current = 0;
        } else if (onTap) {
          setTimeout(() => {
            if (tapCount.current === 1) {
              triggerHapticFeedback('light');
              onTap();
            }
            tapCount.current = 0;
          }, doubleTapDelay);
        }
      }
      // Handle swipe gestures
      else if (distance > swipeThreshold) {
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        triggerHapticFeedback('light');

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
    }

    // Reset gesture state
    gestureState.current = {
      isActive: false,
      startPoints: [],
      currentPoints: [],
      gestureType: 'none',
      initialDistance: 0,
      initialCenter: { x: 0, y: 0 },
    };
  };

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !isTouchDevice) return;

    const options = { passive: !preventScroll };

    element.addEventListener('touchstart', handleTouchStart, options);
    element.addEventListener('touchmove', handleTouchMove, options);
    element.addEventListener('touchend', handleTouchEnd, options);
    element.addEventListener('touchcancel', handleTouchEnd, options);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);
      clearLongPressTimer();
    };
  }, [
    isTouchDevice,
    preventScroll,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap,
    onDoubleTap,
    onLongPress,
    onPinchStart,
    onPinch,
    onPinchEnd,
    onPanStart,
    onPan,
    onPanEnd,
    swipeThreshold,
    longPressDelay,
    doubleTapDelay,
    pinchThreshold,
    enableHapticFeedback,
  ]);

  return elementRef as React.RefObject<T>;
};