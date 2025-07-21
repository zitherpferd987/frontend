'use client';

import { ReactNode, useRef, useState, useCallback } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { useMobileGestures } from '@/hooks/use-mobile-gestures';
import { useMobileDetection } from '@/hooks/use-mobile-detection';
import { useViewport } from '@/hooks/use-viewport';
import { cn } from '@/lib/utils';

interface TouchFriendlyInteractionProps {
  children: ReactNode;
  className?: string;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
  enableHapticFeedback?: boolean;
  touchFeedbackType?: 'scale' | 'highlight' | 'ripple' | 'none';
  swipeThreshold?: number;
  longPressDelay?: number;
  disabled?: boolean;
}

export function TouchFriendlyInteraction({
  children,
  className = '',
  onTap,
  onDoubleTap,
  onLongPress,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPinch,
  enableHapticFeedback = true,
  touchFeedbackType = 'scale',
  swipeThreshold = 50,
  longPressDelay = 500,
  disabled = false,
}: TouchFriendlyInteractionProps) {
  const { isTouchDevice, isIOS, isAndroid } = useMobileDetection();
  const { width } = useViewport();
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const rippleIdRef = useRef(0);

  // Enhanced gesture handling with haptic feedback
  const gestureRef = useMobileGestures({
    onTap: useCallback(() => {
      if (disabled) return;
      triggerHapticFeedback('light');
      onTap?.();
    }, [disabled, onTap]),
    
    onDoubleTap: useCallback(() => {
      if (disabled) return;
      triggerHapticFeedback('medium');
      onDoubleTap?.();
    }, [disabled, onDoubleTap]),
    
    onLongPress: useCallback(() => {
      if (disabled) return;
      triggerHapticFeedback('heavy');
      onLongPress?.();
    }, [disabled, onLongPress]),
    
    onSwipeLeft: useCallback(() => {
      if (disabled) return;
      triggerHapticFeedback('light');
      onSwipeLeft?.();
    }, [disabled, onSwipeLeft]),
    
    onSwipeRight: useCallback(() => {
      if (disabled) return;
      triggerHapticFeedback('light');
      onSwipeRight?.();
    }, [disabled, onSwipeRight]),
    
    onSwipeUp: useCallback(() => {
      if (disabled) return;
      triggerHapticFeedback('light');
      onSwipeUp?.();
    }, [disabled, onSwipeUp]),
    
    onSwipeDown: useCallback(() => {
      if (disabled) return;
      triggerHapticFeedback('light');
      onSwipeDown?.();
    }, [disabled, onSwipeDown]),
    
    onPinch: useCallback((scale: number) => {
      if (disabled) return;
      onPinch?.(scale);
    }, [disabled, onPinch]),
    
    swipeThreshold,
    longPressDelay,
    enableHapticFeedback,
  });

  // Haptic feedback utility
  const triggerHapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy') => {
    if (!enableHapticFeedback || !isTouchDevice) return;
    
    try {
      // Standard vibration API
      if ('vibrate' in navigator) {
        const patterns = {
          light: [10],
          medium: [20],
          heavy: [30],
        };
        navigator.vibrate(patterns[type]);
      }
      
      // iOS Taptic Engine
      if (isIOS && 'Taptic' in window) {
        (window as any).Taptic.impact(type);
      }
      
      // Android haptic feedback
      if (isAndroid && 'AndroidHaptic' in window) {
        (window as any).AndroidHaptic.vibrate(type);
      }
    } catch (error) {
      // Silently fail if haptic feedback is not supported
      console.debug('Haptic feedback not supported:', error);
    }
  }, [enableHapticFeedback, isTouchDevice, isIOS, isAndroid]);

  // Ripple effect for touch feedback
  const createRipple = useCallback((event: React.TouchEvent | React.MouseEvent) => {
    if (touchFeedbackType !== 'ripple' || disabled) return;
    
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = ('touches' in event ? event.touches[0].clientX : event.clientX) - rect.left;
    const y = ('touches' in event ? event.touches[0].clientY : event.clientY) - rect.top;
    
    const rippleId = rippleIdRef.current++;
    setRipples(prev => [...prev, { id: rippleId, x, y }]);
    
    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== rippleId));
    }, 600);
  }, [touchFeedbackType, disabled]);

  // Touch event handlers
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    if (disabled) return;
    setIsPressed(true);
    createRipple(event);
  }, [disabled, createRipple]);

  const handleTouchEnd = useCallback(() => {
    if (disabled) return;
    setIsPressed(false);
  }, [disabled]);

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (disabled || isTouchDevice) return;
    setIsPressed(true);
    createRipple(event);
  }, [disabled, isTouchDevice, createRipple]);

  const handleMouseUp = useCallback(() => {
    if (disabled || isTouchDevice) return;
    setIsPressed(false);
  }, [disabled, isTouchDevice]);

  const handleMouseLeave = useCallback(() => {
    if (disabled || isTouchDevice) return;
    setIsPressed(false);
  }, [disabled, isTouchDevice]);

  // Pan gesture handling for swipes
  const handlePan = useCallback((event: any, info: PanInfo) => {
    if (disabled) return;
    
    const { offset, velocity } = info;
    const threshold = swipeThreshold;
    const velocityThreshold = 500;
    
    // Determine swipe direction based on offset and velocity
    if (Math.abs(offset.x) > Math.abs(offset.y)) {
      // Horizontal swipe
      if (offset.x > threshold && velocity.x > velocityThreshold) {
        onSwipeRight?.();
      } else if (offset.x < -threshold && velocity.x < -velocityThreshold) {
        onSwipeLeft?.();
      }
    } else {
      // Vertical swipe
      if (offset.y > threshold && velocity.y > velocityThreshold) {
        onSwipeDown?.();
      } else if (offset.y < -threshold && velocity.y < -velocityThreshold) {
        onSwipeUp?.();
      }
    }
  }, [disabled, swipeThreshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  // Touch feedback styles
  const getTouchFeedbackStyles = () => {
    switch (touchFeedbackType) {
      case 'scale':
        return isPressed ? 'scale-98' : 'scale-100';
      case 'highlight':
        return isPressed ? 'bg-foreground/10' : '';
      case 'ripple':
        return 'overflow-hidden';
      default:
        return '';
    }
  };

  return (
    <motion.div
      ref={gestureRef}
      className={cn(
        'touch-friendly-interaction relative',
        'touch-manipulation select-none',
        '-webkit-tap-highlight-color: transparent',
        getTouchFeedbackStyles(),
        disabled && 'pointer-events-none opacity-50',
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onPan={handlePan}
      whileTap={touchFeedbackType === 'scale' ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.1 }}
      style={{
        // Ensure minimum touch target size
        minHeight: isTouchDevice ? '44px' : 'auto',
        minWidth: isTouchDevice ? '44px' : 'auto',
        // Optimize for touch scrolling
        touchAction: onPinch ? 'none' : 'manipulation',
      }}
    >
      {children}
      
      {/* Ripple effects */}
      {touchFeedbackType === 'ripple' && ripples.map(ripple => (
        <motion.div
          key={ripple.id}
          className="absolute pointer-events-none bg-primary/20 rounded-full"
          style={{
            left: ripple.x,
            top: ripple.y,
            transform: 'translate(-50%, -50%)',
          }}
          initial={{ width: 0, height: 0, opacity: 0.5 }}
          animate={{ 
            width: Math.max(width * 0.5, 200), 
            height: Math.max(width * 0.5, 200), 
            opacity: 0 
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      ))}
    </motion.div>
  );
}

// Specialized touch-friendly components
interface TouchButtonProps extends TouchFriendlyInteractionProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function TouchButton({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  ...props
}: TouchButtonProps) {
  const { isMobile } = useMobileDetection();

  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary/90 active:bg-primary/80',
    secondary: 'bg-secondary text-white hover:bg-secondary/90 active:bg-secondary/80',
    ghost: 'bg-transparent text-foreground hover:bg-foreground/5 active:bg-foreground/10 border border-foreground/20',
  };

  const sizeClasses = {
    sm: isMobile ? 'px-4 py-2 text-sm min-h-[40px]' : 'px-3 py-1.5 text-sm',
    md: isMobile ? 'px-6 py-3 text-base min-h-[44px]' : 'px-4 py-2 text-base',
    lg: isMobile ? 'px-8 py-4 text-lg min-h-[48px]' : 'px-6 py-3 text-lg',
  };

  return (
    <TouchFriendlyInteraction
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      touchFeedbackType="scale"
      {...props}
    >
      {children}
    </TouchFriendlyInteraction>
  );
}

interface TouchCardProps extends TouchFriendlyInteractionProps {
  padding?: 'sm' | 'md' | 'lg';
  elevated?: boolean;
}

export function TouchCard({
  children,
  className = '',
  padding = 'md',
  elevated = true,
  ...props
}: TouchCardProps) {
  const { isMobile } = useMobileDetection();

  const paddingClasses = {
    sm: isMobile ? 'p-3' : 'p-4',
    md: isMobile ? 'p-4' : 'p-6',
    lg: isMobile ? 'p-6' : 'p-8',
  };

  return (
    <TouchFriendlyInteraction
      className={cn(
        'bg-background rounded-lg border border-foreground/10 transition-all duration-200',
        elevated && 'shadow-sm hover:shadow-md',
        paddingClasses[padding],
        className
      )}
      touchFeedbackType="scale"
      {...props}
    >
      {children}
    </TouchFriendlyInteraction>
  );
}

// Hook for touch interaction utilities
export const useTouchInteraction = () => {
  const { isTouchDevice, isIOS, isAndroid } = useMobileDetection();

  return {
    isTouchDevice,
    isIOS,
    isAndroid,
    
    // Utility functions
    getTouchTargetSize: () => isTouchDevice ? 44 : 32,
    
    shouldShowTouchFeedback: () => isTouchDevice,
    
    getOptimalTouchDelay: () => isIOS ? 300 : isAndroid ? 250 : 200,
    
    supportsHapticFeedback: () => {
      return (
        'vibrate' in navigator ||
        (isIOS && 'Taptic' in window) ||
        (isAndroid && 'AndroidHaptic' in window)
      );
    },
    
    getRecommendedSwipeThreshold: () => {
      // Adjust based on screen size and device type
      return isTouchDevice ? 50 : 30;
    },
  };
};