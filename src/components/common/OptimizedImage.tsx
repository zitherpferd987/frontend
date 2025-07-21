'use client';

import Image, { ImageProps } from 'next/image';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  getOptimizedImageUrl,
  generateResponsiveSrcSet,
  generateSizesAttribute,
  getBestImageFormat,
  type ImageOptimizationOptions,
  type ResponsiveImageSizes
} from '@/lib/image-optimization';

interface OptimizedImageProps extends Omit<ImageProps, 'src' | 'srcSet'> {
  src: string;
  alt: string;
  optimization?: ImageOptimizationOptions;
  responsiveSizes?: Partial<ResponsiveImageSizes>;
  showSkeleton?: boolean;
  skeletonClassName?: string;
  enableLazyLoading?: boolean;
  preload?: boolean;
}

/**
 * Skeleton component for image loading states
 */
function ImageSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200',
        'bg-[length:200%_100%] animate-[shimmer_2s_infinite]',
        className
      )}
      style={{
        backgroundImage: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 2s infinite'
      }}
    />
  );
}

/**
 * Optimized Image component with WebP/AVIF support, lazy loading, and skeleton states
 */
export default function OptimizedImage({
  src,
  alt,
  className,
  optimization = {},
  responsiveSizes,
  showSkeleton = true,
  skeletonClassName,
  enableLazyLoading = true,
  preload = false,
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [optimizedSrc, setOptimizedSrc] = useState(src);
  const [bestFormat, setBestFormat] = useState<'avif' | 'webp' | 'jpeg'>('jpeg');

  // Detect best image format on mount
  useEffect(() => {
    getBestImageFormat().then(setBestFormat);
  }, []);

  // Generate optimized image URL
  useEffect(() => {
    if (src && bestFormat) {
      const optimizedUrl = getOptimizedImageUrl(src, {
        format: bestFormat,
        ...optimization
      });
      setOptimizedSrc(optimizedUrl);
    }
  }, [src, bestFormat, optimization]);

  // Handle image load
  const handleLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.(event);
  };

  // Handle image error
  const handleError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoading(false);
    setHasError(true);
    onError?.(event);
  };

  // Generate responsive attributes
  const srcSet = responsiveSizes
    ? generateResponsiveSrcSet(src, responsiveSizes, { format: bestFormat, ...optimization })
    : undefined;

  const sizes = responsiveSizes
    ? generateSizesAttribute(responsiveSizes)
    : undefined;

  return (
    <div className="relative overflow-hidden">
      {/* Skeleton loader */}
      {isLoading && showSkeleton && (
        <ImageSkeleton
          className={cn(
            'absolute inset-0 z-10',
            skeletonClassName
          )}
        />
      )}

      {/* Error state */}
      {hasError && (
        <div className={cn(
          'absolute inset-0 flex items-center justify-center',
          'bg-gray-100 text-gray-400',
          className
        )}>
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="mt-2 text-sm">Failed to load image</p>
          </div>
        </div>
      )}

      {/* Optimized Image */}
      <Image
        src={optimizedSrc}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        loading={enableLazyLoading ? 'lazy' : 'eager'}
        priority={preload}
        {...(srcSet && { srcSet })}
        {...(sizes && { sizes })}
        {...props}
      />
    </div>
  );
}

/**
 * Specialized component for hero/banner images with optimized loading
 */
export function HeroImage(props: OptimizedImageProps) {
  return (
    <OptimizedImage
      {...props}
      preload={true}
      enableLazyLoading={false}
      optimization={{
        quality: 90,
        format: 'webp',
        ...props.optimization
      }}
      responsiveSizes={{
        mobile: 640,
        tablet: 1024,
        desktop: 1920,
        large: 2560,
        ...props.responsiveSizes
      }}
    />
  );
}

/**
 * Specialized component for gallery thumbnails
 */
export function ThumbnailImage(props: OptimizedImageProps) {
  return (
    <OptimizedImage
      {...props}
      optimization={{
        quality: 75,
        format: 'webp',
        ...props.optimization
      }}
      responsiveSizes={{
        mobile: 150,
        tablet: 200,
        desktop: 300,
        large: 400,
        ...props.responsiveSizes
      }}
    />
  );
}

/**
 * Specialized component for blog post images
 */
export function BlogImage(props: OptimizedImageProps) {
  return (
    <OptimizedImage
      {...props}
      optimization={{
        quality: 85,
        format: 'webp',
        ...props.optimization
      }}
      responsiveSizes={{
        mobile: 640,
        tablet: 768,
        desktop: 1024,
        large: 1200,
        ...props.responsiveSizes
      }}
    />
  );
}