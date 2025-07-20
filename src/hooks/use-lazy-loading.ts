'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export interface LazyLoadingOptions {
  rootMargin?: string;
  threshold?: number | number[];
  triggerOnce?: boolean;
  skip?: boolean;
}

/**
 * Hook for lazy loading with Intersection Observer
 */
export function useLazyLoading(options: LazyLoadingOptions = {}) {
  const {
    rootMargin = '50px',
    threshold = 0.1,
    triggerOnce = true,
    skip = false
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const shouldLoad = skip || isIntersecting || (triggerOnce && hasIntersected);

  useEffect(() => {
    if (skip) {
      setIsIntersecting(true);
      setHasIntersected(true);
      return;
    }

    const element = elementRef.current;
    if (!element) return;

    // Create observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        const isVisible = entry.isIntersecting;
        
        setIsIntersecting(isVisible);
        
        if (isVisible && !hasIntersected) {
          setHasIntersected(true);
          
          // Unobserve if triggerOnce is true
          if (triggerOnce && observerRef.current) {
            observerRef.current.unobserve(element);
          }
        }
      },
      {
        rootMargin,
        threshold
      }
    );

    // Start observing
    observerRef.current.observe(element);

    // Cleanup
    return () => {
      if (observerRef.current && element) {
        observerRef.current.unobserve(element);
      }
    };
  }, [rootMargin, threshold, triggerOnce, skip, hasIntersected]);

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    elementRef,
    isIntersecting,
    hasIntersected,
    shouldLoad
  };
}

/**
 * Hook for preloading images
 */
export function useImagePreloader() {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const preloadImage = useCallback((src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (loadedImages.has(src)) {
        resolve();
        return;
      }

      if (failedImages.has(src)) {
        reject(new Error(`Image ${src} previously failed to load`));
        return;
      }

      const img = new Image();
      
      img.onload = () => {
        setLoadedImages(prev => new Set(prev).add(src));
        resolve();
      };
      
      img.onerror = () => {
        setFailedImages(prev => new Set(prev).add(src));
        reject(new Error(`Failed to load image: ${src}`));
      };
      
      img.src = src;
    });
  }, [loadedImages, failedImages]);

  const preloadImages = useCallback(async (sources: string[]): Promise<void> => {
    const promises = sources.map(src => preloadImage(src).catch(() => {})); // Ignore individual failures
    await Promise.all(promises);
  }, [preloadImage]);

  const isImageLoaded = useCallback((src: string): boolean => {
    return loadedImages.has(src);
  }, [loadedImages]);

  const isImageFailed = useCallback((src: string): boolean => {
    return failedImages.has(src);
  }, [failedImages]);

  return {
    preloadImage,
    preloadImages,
    isImageLoaded,
    isImageFailed,
    loadedImages: Array.from(loadedImages),
    failedImages: Array.from(failedImages)
  };
}

/**
 * Hook for progressive image loading
 */
export function useProgressiveImage(src: string, placeholderSrc?: string) {
  const [currentSrc, setCurrentSrc] = useState(placeholderSrc || '');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!src) return;

    setIsLoading(true);
    setHasError(false);

    const img = new Image();
    
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoading(false);
    };
    
    img.onerror = () => {
      setHasError(true);
      setIsLoading(false);
    };
    
    img.src = src;
  }, [src]);

  return {
    src: currentSrc,
    isLoading,
    hasError
  };
}

/**
 * Hook for managing image loading states in a gallery
 */
export function useGalleryImageLoader(images: string[]) {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [errorStates, setErrorStates] = useState<Record<string, boolean>>({});
  const [loadedCount, setLoadedCount] = useState(0);

  const handleImageLoad = useCallback((src: string) => {
    setLoadingStates(prev => ({ ...prev, [src]: false }));
    setLoadedCount(prev => prev + 1);
  }, []);

  const handleImageError = useCallback((src: string) => {
    setLoadingStates(prev => ({ ...prev, [src]: false }));
    setErrorStates(prev => ({ ...prev, [src]: true }));
  }, []);

  const startImageLoad = useCallback((src: string) => {
    setLoadingStates(prev => ({ ...prev, [src]: true }));
  }, []);

  // Initialize loading states
  useEffect(() => {
    const initialStates = images.reduce((acc, src) => {
      acc[src] = false;
      return acc;
    }, {} as Record<string, boolean>);
    
    setLoadingStates(initialStates);
    setErrorStates({});
    setLoadedCount(0);
  }, [images]);

  const isAllLoaded = loadedCount === images.length;
  const loadingProgress = images.length > 0 ? (loadedCount / images.length) * 100 : 0;

  return {
    loadingStates,
    errorStates,
    loadedCount,
    isAllLoaded,
    loadingProgress,
    handleImageLoad,
    handleImageError,
    startImageLoad
  };
}