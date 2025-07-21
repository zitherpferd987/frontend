'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMobileDetection } from '@/hooks/use-mobile-detection';
import { useViewport } from '@/hooks/use-viewport';
import { useMobileOptimization } from '@/hooks/use-mobile-optimization';
import { cn } from '@/lib/utils';

interface ResponsiveTestingGridProps {
  children: React.ReactNode;
  showDebugInfo?: boolean;
  enableBreakpointIndicator?: boolean;
}

export function ResponsiveTestingGrid({
  children,
  showDebugInfo = false,
  enableBreakpointIndicator = true,
}: ResponsiveTestingGridProps) {
  const { isMobile, isTablet, isDesktop, deviceType, orientation, screenSize } = useMobileDetection();
  const { width, height, aspectRatio, isLandscape, isPortrait, isSmallHeight, safeAreaInsets } = useViewport();
  const mobileOptimization = useMobileOptimization();
  const [isDebugVisible, setIsDebugVisible] = useState(showDebugInfo);

  // Breakpoint definitions
  const breakpoints = {
    xs: 475,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  };

  const getCurrentBreakpoint = () => {
    if (width < breakpoints.xs) return 'xs';
    if (width < breakpoints.sm) return 'sm';
    if (width < breakpoints.md) return 'md';
    if (width < breakpoints.lg) return 'lg';
    if (width < breakpoints.xl) return 'xl';
    return '2xl';
  };

  const currentBreakpoint = getCurrentBreakpoint();

  // Test different screen scenarios
  const testScenarios = [
    { name: 'iPhone SE', width: 375, height: 667, type: 'mobile' },
    { name: 'iPhone 12', width: 390, height: 844, type: 'mobile' },
    { name: 'iPhone 12 Pro Max', width: 428, height: 926, type: 'mobile' },
    { name: 'iPad Mini', width: 768, height: 1024, type: 'tablet' },
    { name: 'iPad Pro', width: 1024, height: 1366, type: 'tablet' },
    { name: 'Desktop Small', width: 1280, height: 720, type: 'desktop' },
    { name: 'Desktop Large', width: 1920, height: 1080, type: 'desktop' },
  ];

  // Responsive grid system
  const getGridClasses = () => {
    const baseClasses = 'responsive-testing-grid w-full';
    
    switch (currentBreakpoint) {
      case 'xs':
        return `${baseClasses} grid-cols-1 gap-2 p-2`;
      case 'sm':
        return `${baseClasses} grid-cols-1 gap-3 p-3`;
      case 'md':
        return `${baseClasses} grid-cols-2 gap-4 p-4`;
      case 'lg':
        return `${baseClasses} grid-cols-2 gap-6 p-6`;
      case 'xl':
        return `${baseClasses} grid-cols-3 gap-6 p-6`;
      case '2xl':
        return `${baseClasses} grid-cols-3 gap-8 p-8`;
      default:
        return `${baseClasses} grid-cols-1 gap-4 p-4`;
    }
  };

  // Adaptive spacing system
  const getAdaptiveSpacing = () => {
    if (isMobile) {
      return isLandscape ? 'py-2 px-4' : 'py-4 px-4';
    }
    if (isTablet) {
      return 'py-6 px-6';
    }
    return 'py-8 px-8';
  };

  // Typography scaling
  const getTypographyScale = () => {
    const baseScale = {
      xs: { heading: 'text-xl', subheading: 'text-lg', body: 'text-sm', caption: 'text-xs' },
      sm: { heading: 'text-2xl', subheading: 'text-xl', body: 'text-base', caption: 'text-sm' },
      md: { heading: 'text-3xl', subheading: 'text-2xl', body: 'text-lg', caption: 'text-base' },
      lg: { heading: 'text-4xl', subheading: 'text-3xl', body: 'text-xl', caption: 'text-lg' },
      xl: { heading: 'text-5xl', subheading: 'text-4xl', body: 'text-xl', caption: 'text-lg' },
      '2xl': { heading: 'text-6xl', subheading: 'text-5xl', body: 'text-2xl', caption: 'text-xl' },
    };
    
    return baseScale[currentBreakpoint as keyof typeof baseScale] || baseScale.md;
  };

  const typography = getTypographyScale();

  return (
    <div className="responsive-testing-container relative">
      {/* Breakpoint Indicator */}
      {enableBreakpointIndicator && (
        <motion.div
          className="fixed top-4 right-4 z-50 bg-primary text-white px-3 py-1 rounded-full text-sm font-mono shadow-lg"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {currentBreakpoint} ({width}×{height})
        </motion.div>
      )}

      {/* Debug Panel */}
      <AnimatePresence>
        {isDebugVisible && (
          <motion.div
            className="fixed bottom-4 left-4 right-4 bg-background/95 backdrop-blur-md border border-foreground/20 rounded-lg p-4 z-40 max-h-96 overflow-y-auto"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              {/* Device Info */}
              <div className="space-y-2">
                <h3 className="font-semibold text-primary">Device Info</h3>
                <div className="space-y-1 text-foreground/70">
                  <p>Type: {deviceType}</p>
                  <p>Mobile: {isMobile ? 'Yes' : 'No'}</p>
                  <p>Tablet: {isTablet ? 'Yes' : 'No'}</p>
                  <p>Desktop: {isDesktop ? 'Yes' : 'No'}</p>
                  <p>Touch: {mobileOptimization.isOptimized ? 'Yes' : 'No'}</p>
                </div>
              </div>

              {/* Screen Info */}
              <div className="space-y-2">
                <h3 className="font-semibold text-primary">Screen Info</h3>
                <div className="space-y-1 text-foreground/70">
                  <p>Size: {width}×{height}</p>
                  <p>Breakpoint: {currentBreakpoint}</p>
                  <p>Screen Size: {screenSize}</p>
                  <p>Orientation: {orientation}</p>
                  <p>Aspect Ratio: {aspectRatio.toFixed(2)}</p>
                  <p>Small Height: {isSmallHeight ? 'Yes' : 'No'}</p>
                </div>
              </div>

              {/* Performance Info */}
              <div className="space-y-2">
                <h3 className="font-semibold text-primary">Performance</h3>
                <div className="space-y-1 text-foreground/70">
                  <p>Mode: {mobileOptimization.performanceMode}</p>
                  <p>Connection: {mobileOptimization.connectionType}</p>
                  <p>Animation Duration: {mobileOptimization.animationDuration}ms</p>
                  <p>Parallax: {mobileOptimization.enableParallax ? 'On' : 'Off'}</p>
                  <p>Lazy Loading: {mobileOptimization.enableLazyLoading ? 'On' : 'Off'}</p>
                </div>
              </div>

              {/* Safe Area */}
              <div className="space-y-2">
                <h3 className="font-semibold text-primary">Safe Area</h3>
                <div className="space-y-1 text-foreground/70">
                  <p>Top: {safeAreaInsets.top}px</p>
                  <p>Bottom: {safeAreaInsets.bottom}px</p>
                  <p>Left: {safeAreaInsets.left}px</p>
                  <p>Right: {safeAreaInsets.right}px</p>
                </div>
              </div>

              {/* Typography Scale */}
              <div className="space-y-2">
                <h3 className="font-semibold text-primary">Typography</h3>
                <div className="space-y-1 text-foreground/70">
                  <p>Heading: {typography.heading}</p>
                  <p>Subheading: {typography.subheading}</p>
                  <p>Body: {typography.body}</p>
                  <p>Caption: {typography.caption}</p>
                </div>
              </div>

              {/* Test Scenarios */}
              <div className="space-y-2">
                <h3 className="font-semibold text-primary">Test Scenarios</h3>
                <div className="space-y-1">
                  {testScenarios.map((scenario) => (
                    <button
                      key={scenario.name}
                      className="block w-full text-left text-xs text-foreground/70 hover:text-primary transition-colors"
                      onClick={() => {
                        // This would typically trigger a responsive testing tool
                        console.log(`Testing ${scenario.name}: ${scenario.width}×${scenario.height}`);
                      }}
                    >
                      {scenario.name} ({scenario.width}×{scenario.height})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              className="mt-4 px-3 py-1 bg-primary text-white rounded text-sm hover:bg-primary/90 transition-colors"
              onClick={() => setIsDebugVisible(false)}
            >
              Close Debug
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Debug Toggle Button */}
      {!isDebugVisible && (
        <button
          className="fixed bottom-4 left-4 bg-primary text-white p-2 rounded-full shadow-lg z-40 hover:bg-primary/90 transition-colors"
          onClick={() => setIsDebugVisible(true)}
          aria-label="Show debug info"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      )}

      {/* Responsive Grid Container */}
      <div
        className={cn(
          'responsive-content-container',
          getAdaptiveSpacing(),
          // Responsive grid classes
          'grid',
          getGridClasses(),
          // Safe area support
          'safe-area-inset-top safe-area-inset-bottom',
          // Performance optimizations
          mobileOptimization.performanceMode === 'battery-saver' && 'battery-saver-optimized'
        )}
        style={{
          // CSS custom properties for responsive values
          '--current-breakpoint': currentBreakpoint,
          '--viewport-width': `${width}px`,
          '--viewport-height': `${height}px`,
          '--safe-area-top': `${safeAreaInsets.top}px`,
          '--safe-area-bottom': `${safeAreaInsets.bottom}px`,
          '--safe-area-left': `${safeAreaInsets.left}px`,
          '--safe-area-right': `${safeAreaInsets.right}px`,
          '--aspect-ratio': aspectRatio,
          '--is-mobile': isMobile ? '1' : '0',
          '--is-tablet': isTablet ? '1' : '0',
          '--is-desktop': isDesktop ? '1' : '0',
          '--is-landscape': isLandscape ? '1' : '0',
          '--is-portrait': isPortrait ? '1' : '0',
        }}
      >
        {children}
      </div>

      {/* Responsive Testing Overlay */}
      <div className="responsive-testing-overlay">
        {/* Grid overlay for alignment testing */}
        <div className="fixed inset-0 pointer-events-none z-10 opacity-0 hover:opacity-20 transition-opacity">
          <div className="w-full h-full bg-gradient-to-r from-primary/10 via-transparent to-primary/10" />
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/10 via-transparent to-secondary/10" />
        </div>

        {/* Breakpoint boundaries */}
        {Object.entries(breakpoints).map(([name, size]) => (
          <div
            key={name}
            className="fixed top-0 bottom-0 border-l-2 border-primary/20 pointer-events-none z-10 opacity-0 hover:opacity-50 transition-opacity"
            style={{ left: `${(size / width) * 100}%` }}
          >
            <div className="absolute top-4 -left-8 bg-primary/80 text-white px-2 py-1 rounded text-xs">
              {name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Hook for responsive testing utilities
export const useResponsiveTesting = () => {
  const { width, height } = useViewport();
  const { deviceType, screenSize } = useMobileDetection();

  const breakpoints = {
    xs: 475,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  };

  const getCurrentBreakpoint = () => {
    if (width < breakpoints.xs) return 'xs';
    if (width < breakpoints.sm) return 'sm';
    if (width < breakpoints.md) return 'md';
    if (width < breakpoints.lg) return 'lg';
    if (width < breakpoints.xl) return 'xl';
    return '2xl';
  };

  const isBreakpoint = (breakpoint: keyof typeof breakpoints) => {
    return getCurrentBreakpoint() === breakpoint;
  };

  const isBreakpointOrLarger = (breakpoint: keyof typeof breakpoints) => {
    return width >= breakpoints[breakpoint];
  };

  const isBreakpointOrSmaller = (breakpoint: keyof typeof breakpoints) => {
    return width <= breakpoints[breakpoint];
  };

  const getResponsiveValue = <T>(values: Partial<Record<keyof typeof breakpoints | 'default', T>>): T => {
    const currentBreakpoint = getCurrentBreakpoint();
    
    // Try current breakpoint first
    if (values[currentBreakpoint as keyof typeof breakpoints]) {
      return values[currentBreakpoint as keyof typeof breakpoints]!;
    }
    
    // Fall back to smaller breakpoints
    const orderedBreakpoints: (keyof typeof breakpoints)[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'];
    const currentIndex = orderedBreakpoints.indexOf(currentBreakpoint as keyof typeof breakpoints);
    
    for (let i = currentIndex + 1; i < orderedBreakpoints.length; i++) {
      const bp = orderedBreakpoints[i];
      if (values[bp]) {
        return values[bp]!;
      }
    }
    
    // Fall back to default
    return values.default!;
  };

  const testResponsiveLayout = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const issues: string[] = [];

    // Check minimum touch target size
    if (rect.width < 44 || rect.height < 44) {
      issues.push('Touch target too small (minimum 44px)');
    }

    // Check text readability
    const computedStyle = window.getComputedStyle(element);
    const fontSize = parseFloat(computedStyle.fontSize);
    if (fontSize < 16) {
      issues.push('Font size too small for mobile (minimum 16px)');
    }

    // Check horizontal overflow
    if (rect.width > width) {
      issues.push('Element wider than viewport');
    }

    return {
      element,
      rect,
      issues,
      isAccessible: issues.length === 0,
    };
  };

  return {
    currentBreakpoint: getCurrentBreakpoint(),
    breakpoints,
    width,
    height,
    deviceType,
    screenSize,
    
    // Utility functions
    isBreakpoint,
    isBreakpointOrLarger,
    isBreakpointOrSmaller,
    getResponsiveValue,
    testResponsiveLayout,
    
    // Common responsive patterns
    getGridColumns: () => getResponsiveValue({
      xs: 1,
      sm: 1,
      md: 2,
      lg: 3,
      xl: 3,
      '2xl': 4,
      default: 1,
    }),
    
    getContainerPadding: () => getResponsiveValue({
      xs: '1rem',
      sm: '1.5rem',
      md: '2rem',
      lg: '2.5rem',
      xl: '3rem',
      '2xl': '3.5rem',
      default: '1rem',
    }),
    
    getFontSize: (base: number) => getResponsiveValue({
      xs: `${base * 0.875}rem`,
      sm: `${base}rem`,
      md: `${base * 1.125}rem`,
      lg: `${base * 1.25}rem`,
      xl: `${base * 1.375}rem`,
      '2xl': `${base * 1.5}rem`,
      default: `${base}rem`,
    }),
  };
};