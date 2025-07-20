'use client';

import { useEffect, useState } from 'react';

interface MobileDetection {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const useMobileDetection = (): MobileDetection => {
  const [detection, setDetection] = useState<MobileDetection>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouchDevice: false,
    screenSize: 'lg',
  });

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      let screenSize: MobileDetection['screenSize'] = 'lg';
      let isMobile = false;
      let isTablet = false;
      let isDesktop = true;

      if (width < 475) {
        screenSize = 'xs';
        isMobile = true;
        isDesktop = false;
      } else if (width < 640) {
        screenSize = 'sm';
        isMobile = true;
        isDesktop = false;
      } else if (width < 768) {
        screenSize = 'md';
        isTablet = true;
        isDesktop = false;
      } else if (width < 1024) {
        screenSize = 'lg';
        isTablet = true;
        isDesktop = false;
      } else if (width < 1280) {
        screenSize = 'xl';
      } else {
        screenSize = '2xl';
      }

      setDetection({
        isMobile,
        isTablet,
        isDesktop,
        isTouchDevice,
        screenSize,
      });
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return detection;
};