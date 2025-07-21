'use client';

import { ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMobileDetection } from '@/hooks/use-mobile-detection';
import { useViewport } from '@/hooks/use-viewport';
import { useMobileOptimization, getMobileAnimationProps } from '@/hooks/use-mobile-optimization';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/utils';

interface MobileOptimizedLayoutProps {
  children: ReactNode;
  className?: string;
  enableGestures?: boolean;
  compactMode?: boolean;
  safeArea?: boolean;
}

export function MobileOptimizedLayout({
  children,
  className = '',
  enableGestures = true,
  compactMode,
  safeArea = true,
}: MobileOptimizedLayoutProps) {
  const { isMobile, isTouchDevice, deviceType, orientation } = useMobileDetection();
  const { width, height, isLandscape, isSmallHeight, safeAreaInsets } = useViewport();
  const prefersReducedMotion = useReducedMotion();
  const mobileOptimization = useMobileOptimization();

  const shouldUseCompactMode = compactMode ?? (isMobile || isSmallHeight);
  const animationProps = getMobileAnimationProps(
    isMobile,
    prefersReducedMotion,
    mobileOptimization.performanceMode
  );

  // Set CSS custom properties for mobile optimization
  useEffect(() => {
    const root = document.documentElement;
    
    // Set safe area insets
    if (safeArea) {
      root.style.setProperty('--safe-area-inset-top', `${safeAreaInsets.top}px`);
      root.style.setProperty('--safe-area-inset-bottom', `${safeAreaInsets.bottom}px`);
      root.style.setProperty('--safe-area-inset-left', `${safeAreaInsets.left}px`);
      root.style.setProperty('--safe-area-inset-right', `${safeAreaInsets.right}px`);
    }

    // Set viewport dimensions
    root.style.setProperty('--viewport-width', `${width}px`);
    root.style.setProperty('--viewport-height', `${height}px`);
    
    // Set device-specific properties
    root.style.setProperty('--is-mobile', isMobile ? '1' : '0');
    root.style.setProperty('--is-touch', isTouchDevice ? '1' : '0');
    root.style.setProperty('--is-landscape', isLandscape ? '1' : '0');
    
    // Performance mode
    root.style.setProperty('--performance-mode', mobileOptimization.performanceMode);
    
    // Animation settings
    root.style.setProperty(
      '--animation-duration',
      `${mobileOptimization.animationDuration}ms`
    );
  }, [
    safeAreaInsets,
    width,
    height,
    isMobile,
    isTouchDevice,
    isLandscape,
    mobileOptimization.performanceMode,
    mobileOptimization.animationDuration,
    safeArea,
  ]);

  // Add mobile-specific body classes
  useEffect(() => {
    const body = document.body;
    const classes: string[] = [];

    if (isMobile) classes.push('mobile-device');
    if (isTouchDevice) classes.push('touch-device');
    if (isLandscape) classes.push('landscape-orientation');
    if (isSmallHeight) classes.push('small-height');
    if (shouldUseCompactMode) classes.push('compact-mode');
    if (mobileOptimization.performanceMode === 'battery-saver') {
      classes.push('battery-saver-mode');
    }

    classes.forEach(cls => body.classList.add(cls));

    return () => {
      classes.forEach(cls => body.classList.remove(cls));
    };
  }, [
    isMobile,
    isTouchDevice,
    isLandscape,
    isSmallHeight,
    shouldUseCompactMode,
    mobileOptimization.performanceMode,
  ]);

  return (
    <motion.div
      {...animationProps}
      className={cn(
        'mobile-optimized-layout',
        // Base responsive classes
        'w-full min-h-screen',
        
        // Safe area support
        safeArea && [
          'pt-safe-top pb-safe-bottom pl-safe-left pr-safe-right',
          'md:pt-0 md:pb-0 md:pl-0 md:pr-0', // Remove safe area on desktop
        ],
        
        // Touch device optimizations
        isTouchDevice && [
          'touch-manipulation',
          'select-none', // Prevent text selection on touch
        ],
        
        // Mobile-specific spacing
        isMobile && [
          shouldUseCompactMode ? 'space-y-2' : 'space-y-4',
          'px-4', // Mobile horizontal padding
        ],
        
        // Tablet optimizations
        deviceType === 'tablet' && [
          'px-6 space-y-6',
        ],
        
        // Desktop spacing
        !isMobile && [
          'px-8 space-y-8',
        ],
        
        // Landscape mobile optimizations
        isMobile && isLandscape && [
          'landscape-compact',
          shouldUseCompactMode && 'py-2',
        ],
        
        // Small height optimizations
        isSmallHeight && [
          'compact-vertical-spacing',
          'py-2',
        ],
        
        // Performance mode classes
        mobileOptimization.performanceMode === 'battery-saver' && [
          'reduce-animations',
          'optimize-rendering',
        ],
        
        // Connection-based optimizations
        mobileOptimization.connectionType === 'slow' && [
          'low-bandwidth-mode',
        ],
        
        className
      )}
      style={{
        // CSS custom properties for dynamic values
        '--mobile-spacing': shouldUseCompactMode ? '0.5rem' : '1rem',
        '--touch-target-size': isTouchDevice ? '44px' : '32px',
        '--animation-easing': mobileOptimization.performanceMode === 'high' 
          ? 'cubic-bezier(0.4, 0, 0.2, 1)' 
          : 'ease-out',
      } as React.CSSProperties}
    >
      <AnimatePresence mode="wait">
        {children}
      </AnimatePresence>
    </motion.div>
  );
}

// Mobile-optimized container component
interface MobileContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function MobileContainer({
  children,
  className = '',
  maxWidth = 'lg',
  padding = 'md',
}: MobileContainerProps) {
  const { isMobile, deviceType } = useMobileDetection();

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    '2xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  const paddingClasses = {
    none: '',
    sm: isMobile ? 'px-3 py-2' : 'px-4 py-3',
    md: isMobile ? 'px-4 py-3' : 'px-6 py-4',
    lg: isMobile ? 'px-6 py-4' : 'px-8 py-6',
  };

  return (
    <div
      className={cn(
        'mx-auto w-full',
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        // Mobile-specific adjustments
        isMobile && 'mobile-container',
        deviceType === 'tablet' && 'tablet-container',
        className
      )}
    >
      {children}
    </div>
  );
}

// Mobile-optimized section component
interface MobileSectionProps {
  children: ReactNode;
  className?: string;
  spacing?: 'tight' | 'normal' | 'loose';
  background?: 'transparent' | 'subtle' | 'card';
}

export function MobileSection({
  children,
  className = '',
  spacing = 'normal',
  background = 'transparent',
}: MobileSectionProps) {
  const { isMobile } = useMobileDetection();
  const { height } = useViewport();
  const isSmallHeight = height < 600;

  const spacingClasses = {
    tight: isMobile ? 'py-4' : 'py-6',
    normal: isMobile ? 'py-6' : 'py-8',
    loose: isMobile ? 'py-8' : 'py-12',
  };

  const backgroundClasses = {
    transparent: '',
    subtle: 'bg-foreground/2',
    card: 'bg-background border border-foreground/10 rounded-lg',
  };

  return (
    <section
      className={cn(
        'w-full',
        spacingClasses[spacing],
        backgroundClasses[background],
        // Reduce spacing on small height screens
        isSmallHeight && 'py-4',
        className
      )}
    >
      {children}
    </section>
  );
}