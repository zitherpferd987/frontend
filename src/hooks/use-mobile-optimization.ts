'use client';

import { useEffect, useState, useCallback } from 'react';
import { useMobileDetection } from './use-mobile-detection';
import { useViewport } from './use-viewport';
import { useReducedMotion } from './use-reduced-motion';

interface MobileOptimizationConfig {
  // Animation settings
  enableParallax: boolean;
  enableHoverEffects: boolean;
  animationDuration: number;
  
  // Performance settings
  enableLazyLoading: boolean;
  imageQuality: number;
  enablePreloading: boolean;
  
  // Touch settings
  touchFeedback: boolean;
  swipeGestures: boolean;
  
  // Layout settings
  compactLayout: boolean;
  adaptiveSpacing: boolean;
  
  // Accessibility
  respectReducedMotion: boolean;
  enhancedTouchTargets: boolean;
}

interface MobileOptimizationState extends MobileOptimizationConfig {
  isOptimized: boolean;
  performanceMode: 'high' | 'balanced' | 'battery-saver';
  connectionType: 'slow' | 'fast' | 'unknown';
}

export const useMobileOptimization = (): MobileOptimizationState => {
  const { isMobile, isTouchDevice, deviceType, isIOS, isAndroid } = useMobileDetection();
  const { width, height, isLandscape, isSmallHeight } = useViewport();
  const prefersReducedMotion = useReducedMotion();

  const [connectionType, setConnectionType] = useState<'slow' | 'fast' | 'unknown'>('unknown');
  const [performanceMode, setPerformanceMode] = useState<'high' | 'balanced' | 'battery-saver'>('balanced');

  // Detect connection speed
  useEffect(() => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (connection) {
      const updateConnection = () => {
        const effectiveType = connection.effectiveType;
        if (effectiveType === 'slow-2g' || effectiveType === '2g') {
          setConnectionType('slow');
          setPerformanceMode('battery-saver');
        } else if (effectiveType === '3g') {
          setConnectionType('fast');
          setPerformanceMode('balanced');
        } else {
          setConnectionType('fast');
          setPerformanceMode('high');
        }
      };

      updateConnection();
      connection.addEventListener('change', updateConnection);

      return () => {
        connection.removeEventListener('change', updateConnection);
      };
    }
  }, []);

  // Detect battery status for performance optimization
  useEffect(() => {
    const updateBatteryStatus = (battery: any) => {
      if (battery.level < 0.2 || battery.charging === false) {
        setPerformanceMode('battery-saver');
      } else if (battery.level > 0.5 && battery.charging) {
        setPerformanceMode('high');
      } else {
        setPerformanceMode('balanced');
      }
    };

    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        updateBatteryStatus(battery);
        
        battery.addEventListener('levelchange', () => updateBatteryStatus(battery));
        battery.addEventListener('chargingchange', () => updateBatteryStatus(battery));
      });
    }
  }, []);

  // Generate optimized configuration based on device and performance
  const getOptimizedConfig = useCallback((): MobileOptimizationConfig => {
    const baseConfig: MobileOptimizationConfig = {
      enableParallax: true,
      enableHoverEffects: true,
      animationDuration: 300,
      enableLazyLoading: true,
      imageQuality: 85,
      enablePreloading: true,
      touchFeedback: true,
      swipeGestures: true,
      compactLayout: false,
      adaptiveSpacing: true,
      respectReducedMotion: true,
      enhancedTouchTargets: true,
    };

    // Mobile optimizations
    if (isMobile) {
      baseConfig.enableParallax = false;
      baseConfig.enableHoverEffects = false;
      baseConfig.animationDuration = 200;
      baseConfig.compactLayout = true;
      baseConfig.imageQuality = 75;
    }

    // Touch device optimizations
    if (isTouchDevice) {
      baseConfig.enableHoverEffects = false;
      baseConfig.touchFeedback = true;
      baseConfig.enhancedTouchTargets = true;
    }

    // Performance mode adjustments
    switch (performanceMode) {
      case 'battery-saver':
        baseConfig.enableParallax = false;
        baseConfig.enableHoverEffects = false;
        baseConfig.animationDuration = 100;
        baseConfig.imageQuality = 60;
        baseConfig.enablePreloading = false;
        break;
      case 'balanced':
        baseConfig.enableParallax = !isMobile;
        baseConfig.animationDuration = isMobile ? 200 : 250;
        baseConfig.imageQuality = isMobile ? 70 : 80;
        break;
      case 'high':
        // Keep defaults or enhance
        if (!isMobile) {
          baseConfig.imageQuality = 90;
          baseConfig.animationDuration = 350;
        }
        break;
    }

    // Connection-based optimizations
    if (connectionType === 'slow') {
      baseConfig.imageQuality = 50;
      baseConfig.enablePreloading = false;
      baseConfig.enableParallax = false;
    }

    // Reduced motion preferences
    if (prefersReducedMotion) {
      baseConfig.enableParallax = false;
      baseConfig.animationDuration = 0;
    }

    // Small screen optimizations
    if (isSmallHeight) {
      baseConfig.compactLayout = true;
      baseConfig.adaptiveSpacing = true;
    }

    // iOS-specific optimizations
    if (isIOS) {
      baseConfig.touchFeedback = true;
      // iOS handles touch feedback natively
    }

    // Android-specific optimizations
    if (isAndroid) {
      baseConfig.touchFeedback = true;
      // Android may need more explicit touch feedback
    }

    return baseConfig;
  }, [
    isMobile,
    isTouchDevice,
    performanceMode,
    connectionType,
    prefersReducedMotion,
    isSmallHeight,
    isIOS,
    isAndroid,
  ]);

  const config = getOptimizedConfig();

  return {
    ...config,
    isOptimized: isMobile || isTouchDevice,
    performanceMode,
    connectionType,
  };
};

// Utility functions for mobile optimization
export const getMobileAnimationProps = (
  isMobile: boolean,
  prefersReducedMotion: boolean,
  performanceMode: 'high' | 'balanced' | 'battery-saver'
) => {
  if (prefersReducedMotion || performanceMode === 'battery-saver') {
    return {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      transition: { duration: 0 },
    };
  }

  const duration = performanceMode === 'high' ? 0.4 : isMobile ? 0.2 : 0.3;

  return {
    initial: { opacity: 0, y: isMobile ? 10 : 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration, ease: 'easeOut' },
  };
};

export const getMobileImageProps = (
  isMobile: boolean,
  connectionType: 'slow' | 'fast' | 'unknown',
  performanceMode: 'high' | 'balanced' | 'battery-saver'
) => {
  let quality = 85;
  
  if (performanceMode === 'battery-saver' || connectionType === 'slow') {
    quality = 50;
  } else if (isMobile) {
    quality = 70;
  } else if (performanceMode === 'high') {
    quality = 90;
  }

  return {
    quality,
    format: 'webp' as const,
    loading: 'lazy' as const,
    placeholder: 'blur' as const,
  };
};

export const getMobileTouchProps = (isTouchDevice: boolean, touchFeedback: boolean) => {
  if (!isTouchDevice || !touchFeedback) {
    return {};
  }

  return {
    whileTap: { scale: 0.98 },
    transition: { duration: 0.1 },
    style: { touchAction: 'manipulation' },
  };
};

export const getMobileLayoutProps = (
  isMobile: boolean,
  deviceType: 'mobile' | 'tablet' | 'desktop',
  isLandscape: boolean
) => {
  const baseSpacing = isMobile ? (isLandscape ? 'py-2 px-4' : 'py-4 px-4') : 'py-6 px-6';
  const containerMaxWidth = isMobile ? 'max-w-full' : deviceType === 'tablet' ? 'max-w-4xl' : 'max-w-6xl';
  
  return {
    spacing: baseSpacing,
    containerMaxWidth,
    gridCols: isMobile ? 1 : deviceType === 'tablet' ? 2 : 3,
    cardPadding: isMobile ? 'p-4' : 'p-6',
    buttonSize: isMobile ? 'px-6 py-3 text-base' : 'px-8 py-4 text-lg',
    headingSize: isMobile ? 'text-2xl' : deviceType === 'tablet' ? 'text-3xl' : 'text-4xl',
  };
};

export const getMobileResponsiveClasses = (
  isMobile: boolean,
  isTouchDevice: boolean,
  performanceMode: 'high' | 'balanced' | 'battery-saver'
) => {
  const baseClasses = [
    isTouchDevice && 'touch-manipulation',
    isMobile && 'mobile-optimized',
    performanceMode === 'battery-saver' && 'battery-saver-mode',
  ].filter(Boolean);

  return {
    container: [
      ...baseClasses,
      isMobile ? 'px-4 py-2' : 'px-6 py-4',
      'transition-all duration-300',
    ].join(' '),
    card: [
      ...baseClasses,
      'rounded-lg overflow-hidden',
      isMobile ? 'p-4' : 'p-6',
      isTouchDevice ? 'active:scale-98' : 'hover:shadow-lg',
      'transition-all duration-200',
    ].join(' '),
    button: [
      ...baseClasses,
      'rounded-lg font-medium transition-all duration-200',
      isMobile ? 'px-6 py-3 text-base min-h-touch' : 'px-8 py-4 text-lg',
      isTouchDevice ? 'active:scale-95' : 'hover:scale-105',
      'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
    ].join(' '),
    text: {
      heading: isMobile ? 'text-2xl font-bold' : 'text-4xl font-bold',
      subheading: isMobile ? 'text-lg font-semibold' : 'text-2xl font-semibold',
      body: isMobile ? 'text-base' : 'text-lg',
      caption: isMobile ? 'text-sm' : 'text-base',
    },
  };
};