'use client';

import { useState, useRef, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';
import { motion } from 'framer-motion';
import { getOptimizedImageUrl, getPlaceholderUrl, type MediaTransformation } from '@/lib/media-service';
import { useProgressiveImage } from '@/hooks/use-lazy-loading';

interface LazyImageProps extends Omit<ImageProps, 'onLoad' | 'src'> {
  src: string;
  onLoad?: () => void;
  showSkeleton?: boolean;
  skeletonClassName?: string;
  optimization?: MediaTransformation;
  enableProgressiveLoading?: boolean;
  rootMargin?: string;
  threshold?: number;
}

export function LazyImage({
  src,
  alt,
  onLoad,
  showSkeleton = true,
  skeletonClassName = '',
  className = '',
  optimization = {},
  enableProgressiveLoading = true,
  rootMargin = '50px',
  threshold = 0.1,
  priority = false,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // Progressive image loading
  const placeholderSrc = enableProgressiveLoading ? getPlaceholderUrl(src, 40) : undefined;
  const optimizedSrc = getOptimizedImageUrl(src, {
    format: 'webp',
    quality: 80,
    ...optimization
  });
  
  const { src: progressiveSrc, isLoading: progressiveLoading } = useProgressiveImage(
    isInView ? optimizedSrc : '',
    placeholderSrc
  );

  useEffect(() => {
    if (priority) return; // Skip intersection observer for priority images

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, threshold, rootMargin]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  return (
    <div ref={imgRef} className="relative overflow-hidden">
      {/* Skeleton loader */}
      {showSkeleton && !isLoaded && (
        <div className={`absolute inset-0 bg-foreground/5 animate-pulse ${skeletonClassName}`}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/10 to-transparent animate-shimmer" />
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-foreground/5 flex items-center justify-center">
          <div className="text-center text-foreground/40">
            <svg
              className="w-8 h-8 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-xs">Failed to load</p>
          </div>
        </div>
      )}

      {/* Progressive placeholder */}
      {enableProgressiveLoading && placeholderSrc && !isLoaded && isInView && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: progressiveLoading ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0"
        >
          <Image
            src={placeholderSrc}
            alt=""
            fill
            className="blur-sm scale-110 object-cover"
            priority={priority}
          />
        </motion.div>
      )}

      {/* Optimized image */}
      {isInView && !hasError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <Image
            src={progressiveSrc || optimizedSrc}
            alt={alt}
            onLoad={handleLoad}
            onError={handleError}
            className={className}
            priority={priority}
            quality={optimization.quality || 80}
            {...props}
          />
        </motion.div>
      )}
    </div>
  );
}

/**
 * Specialized components for different use cases
 */

export function GalleryLazyImage(props: Omit<LazyImageProps, 'optimization'>) {
  return (
    <LazyImage
      {...props}
      optimization={{
        format: 'webp',
        quality: 85,
        fit: 'cover'
      }}
      enableProgressiveLoading={true}
    />
  );
}

export function ThumbnailLazyImage(props: Omit<LazyImageProps, 'optimization'>) {
  return (
    <LazyImage
      {...props}
      optimization={{
        format: 'webp',
        quality: 75,
        fit: 'cover'
      }}
      enableProgressiveLoading={false}
      showSkeleton={true}
    />
  );
}

export function HeroLazyImage(props: Omit<LazyImageProps, 'optimization' | 'priority'>) {
  return (
    <LazyImage
      {...props}
      priority={true}
      optimization={{
        format: 'webp',
        quality: 90,
        fit: 'cover'
      }}
      enableProgressiveLoading={true}
      showSkeleton={false}
    />
  );
}