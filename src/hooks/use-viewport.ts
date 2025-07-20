'use client';

import { useEffect, useState } from 'react';

interface ViewportSize {
  width: number;
  height: number;
  aspectRatio: number;
}

interface ViewportInfo extends ViewportSize {
  isLandscape: boolean;
  isPortrait: boolean;
  isSmallHeight: boolean; // < 600px
  isMobileViewport: boolean; // width < 768px
  safeAreaInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export const useViewport = (): ViewportInfo => {
  const [viewport, setViewport] = useState<ViewportInfo>({
    width: 0,
    height: 0,
    aspectRatio: 1,
    isLandscape: false,
    isPortrait: true,
    isSmallHeight: false,
    isMobileViewport: false,
    safeAreaInsets: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
  });

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const aspectRatio = width / height;
      const isLandscape = width > height;
      const isPortrait = height > width;
      const isSmallHeight = height < 600;
      const isMobileViewport = width < 768;

      // Get safe area insets (for devices with notches, etc.)
      const computedStyle = getComputedStyle(document.documentElement);
      const safeAreaInsets = {
        top: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)') || '0'),
        bottom: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
        left: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)') || '0'),
        right: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)') || '0'),
      };

      setViewport({
        width,
        height,
        aspectRatio,
        isLandscape,
        isPortrait,
        isSmallHeight,
        isMobileViewport,
        safeAreaInsets,
      });
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', updateViewport);

    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
    };
  }, []);

  return viewport;
};