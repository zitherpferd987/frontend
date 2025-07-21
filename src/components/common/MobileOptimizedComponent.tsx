'use client';

import { ReactNode, forwardRef } from 'react';
import { motion, MotionProps } from 'framer-motion';
import { useMobileDetection } from '@/hooks/use-mobile-detection';
import { useViewport } from '@/hooks/use-viewport';
import { useMobileOptimization, getMobileAnimationProps, getMobileResponsiveClasses } from '@/hooks/use-mobile-optimization';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/utils';

interface MobileOptimizedComponentProps {
  children: ReactNode;
  className?: string;
  variant?: 'container' | 'card' | 'button' | 'text';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  spacing?: 'tight' | 'normal' | 'loose';
  animation?: boolean;
  touchOptimized?: boolean;
  gestureEnabled?: boolean;
  as?: keyof React.JSX.IntrinsicElements;
  motionProps?: Partial<MotionProps>;
}

export const MobileOptimizedComponent = forwardRef<
  HTMLDivElement,
  MobileOptimizedComponentProps
>(({
  children,
  className = '',
  variant = 'container',
  size = 'md',
  spacing = 'normal',
  animation = true,
  touchOptimized = true,
  gestureEnabled = true,
  as = 'div',
  motionProps = {},
  ...props
}, ref) => {
  const { isMobile, isTouchDevice, deviceType, orientation } = useMobileDetection();
  const { width, height, isLandscape, isSmallHeight } = useViewport();
  const prefersReducedMotion = useReducedMotion();
  const mobileOptimization = useMobileOptimization();

  const responsiveClasses = getMobileResponsiveClasses(
    isMobile,
    isTouchDevice,
    mobileOptimization.performanceMode
  );

  const animationProps = animation 
    ? getMobileAnimationProps(isMobile, prefersReducedMotion, mobileOptimization.performanceMode)
    : {};

  // Size-based classes
  const sizeClasses = {
    sm: isMobile ? 'text-sm p-2' : 'text-sm p-3',
    md: isMobile ? 'text-base p-4' : 'text-base p-6',
    lg: isMobile ? 'text-lg p-6' : 'text-lg p-8',
    xl: isMobile ? 'text-xl p-8' : 'text-xl p-12',
  };

  // Spacing-based classes
  const spacingClasses = {
    tight: isMobile ? 'space-y-2' : 'space-y-3',
    normal: isMobile ? 'space-y-4' : 'space-y-6',
    loose: isMobile ? 'space-y-6' : 'space-y-8',
  };

  // Variant-specific classes
  const variantClasses = {
    container: responsiveClasses.container,
    card: responsiveClasses.card,
    button: responsiveClasses.button,
    text: 'text-foreground',
  };

  const Component = (motion as any)[as];

  return (
    <Component
      ref={ref}
      className={cn(
        // Base mobile optimizations
        'mobile-optimized-component',
        
        // Variant classes
        variantClasses[variant],
        
        // Size classes
        sizeClasses[size],
        
        // Spacing classes
        spacingClasses[spacing],
        
        // Touch optimizations
        touchOptimized && isTouchDevice && [
          'touch-manipulation',
          '-webkit-tap-highlight-color: transparent',
          'select-none',
        ],
        
        // Gesture support
        gestureEnabled && isTouchDevice && [
          'cursor-pointer',
          'active:scale-98',
        ],
        
        // Performance optimizations
        mobileOptimization.performanceMode === 'battery-saver' && [
          'transition-none',
          'transform-none',
        ],
        
        // Orientation-specific classes
        isMobile && isLandscape && 'landscape-mobile-optimized',
        isMobile && !isLandscape && 'portrait-mobile-optimized',
        
        // Small height optimizations
        isSmallHeight && 'compact-height',
        
        // Device-specific optimizations
        deviceType === 'mobile' && 'mobile-device-optimized',
        deviceType === 'tablet' && 'tablet-device-optimized',
        
        className
      )}
      {...animationProps}
      {...motionProps}
      {...props}
      style={{
        // Dynamic CSS custom properties
        '--mobile-width': `${width}px`,
        '--mobile-height': `${height}px`,
        '--mobile-orientation': orientation,
        '--performance-mode': mobileOptimization.performanceMode,
        '--animation-duration': `${mobileOptimization.animationDuration}ms`,
        '--touch-target-size': isTouchDevice ? '44px' : '32px',
        ...motionProps.style,
      }}
    >
      {children}
    </Component>
  );
});

MobileOptimizedComponent.displayName = 'MobileOptimizedComponent';

// Specialized mobile-optimized components
export const MobileCard = forwardRef<HTMLDivElement, Omit<MobileOptimizedComponentProps, 'variant'>>(
  (props, ref) => (
    <MobileOptimizedComponent ref={ref} variant="card" {...props} />
  )
);

MobileCard.displayName = 'MobileCard';

export const MobileButton = forwardRef<HTMLButtonElement, Omit<MobileOptimizedComponentProps, 'variant' | 'as'>>(
  (props, ref) => (
    <MobileOptimizedComponent ref={ref as any} variant="button" as="button" {...props} />
  )
);

MobileButton.displayName = 'MobileButton';

export const MobileContainer = forwardRef<HTMLDivElement, Omit<MobileOptimizedComponentProps, 'variant'>>(
  (props, ref) => (
    <MobileOptimizedComponent ref={ref as any} variant="container" {...props} />
  )
);

MobileContainer.displayName = 'MobileContainer';

// Hook for mobile-optimized styling
export const useMobileStyles = () => {
  const { isMobile, isTouchDevice, deviceType } = useMobileDetection();
  const { isLandscape, isSmallHeight } = useViewport();
  const mobileOptimization = useMobileOptimization();

  return {
    isMobile,
    isTouchDevice,
    deviceType,
    isLandscape,
    isSmallHeight,
    performanceMode: mobileOptimization.performanceMode,
    
    // Utility functions
    getResponsiveSize: (mobile: string, tablet: string, desktop: string) => {
      if (isMobile) return mobile;
      if (deviceType === 'tablet') return tablet;
      return desktop;
    },
    
    getResponsiveSpacing: (base: number) => {
      const multiplier = isMobile ? 0.75 : deviceType === 'tablet' ? 0.875 : 1;
      return `${base * multiplier}rem`;
    },
    
    getTouchTargetSize: () => isTouchDevice ? '44px' : '32px',
    
    getAnimationDuration: () => {
      if (mobileOptimization.performanceMode === 'battery-saver') return '0.1s';
      return isMobile ? '0.2s' : '0.3s';
    },
    
    shouldReduceAnimations: () => 
      mobileOptimization.performanceMode === 'battery-saver' || 
      (isMobile && mobileOptimization.connectionType === 'slow'),
  };
};