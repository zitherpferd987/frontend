/**
 * Image optimization utilities for the animator blog system
 * Handles image processing, compression, and format conversion
 */

export interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

export interface ResponsiveImageSizes {
  mobile: number;
  tablet: number;
  desktop: number;
  large: number;
}

export const DEFAULT_IMAGE_SIZES: ResponsiveImageSizes = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
  large: 1920,
};

export const DEFAULT_QUALITY = 80;
export const WEBP_QUALITY = 85;
export const AVIF_QUALITY = 75;

/**
 * Generate optimized image URL with Strapi's built-in image processing
 */
export function getOptimizedImageUrl(
  baseUrl: string,
  options: ImageOptimizationOptions = {}
): string {
  const {
    quality = DEFAULT_QUALITY,
    format,
    width,
    height,
    fit = 'cover'
  } = options;

  const params = new URLSearchParams();
  
  if (width) params.append('width', width.toString());
  if (height) params.append('height', height.toString());
  if (quality !== DEFAULT_QUALITY) params.append('quality', quality.toString());
  if (format) params.append('format', format);
  params.append('fit', fit);

  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Generate responsive image srcSet for different screen sizes
 */
export function generateResponsiveSrcSet(
  baseUrl: string,
  sizes: Partial<ResponsiveImageSizes> = {},
  options: Omit<ImageOptimizationOptions, 'width'> = {}
): string {
  const imageSizes = { ...DEFAULT_IMAGE_SIZES, ...sizes };
  
  const srcSetEntries = Object.entries(imageSizes).map(([key, width]) => {
    const optimizedUrl = getOptimizedImageUrl(baseUrl, { ...options, width });
    return `${optimizedUrl} ${width}w`;
  });

  return srcSetEntries.join(', ');
}

/**
 * Generate sizes attribute for responsive images
 */
export function generateSizesAttribute(
  breakpoints: Partial<ResponsiveImageSizes> = {}
): string {
  const sizes = { ...DEFAULT_IMAGE_SIZES, ...breakpoints };
  
  return [
    `(max-width: ${sizes.mobile}px) 100vw`,
    `(max-width: ${sizes.tablet}px) 50vw`,
    `(max-width: ${sizes.desktop}px) 33vw`,
    '25vw'
  ].join(', ');
}

/**
 * Check if browser supports WebP format
 */
export function supportsWebP(): Promise<boolean> {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
}

/**
 * Check if browser supports AVIF format
 */
export function supportsAVIF(): Promise<boolean> {
  return new Promise((resolve) => {
    const avif = new Image();
    avif.onload = avif.onerror = () => {
      resolve(avif.height === 2);
    };
    avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
  });
}

/**
 * Get the best supported image format for the browser
 */
export async function getBestImageFormat(): Promise<'avif' | 'webp' | 'jpeg'> {
  if (await supportsAVIF()) return 'avif';
  if (await supportsWebP()) return 'webp';
  return 'jpeg';
}

/**
 * Calculate aspect ratio from dimensions
 */
export function calculateAspectRatio(width: number, height: number): number {
  return width / height;
}

/**
 * Get dimensions that maintain aspect ratio
 */
export function getAspectRatioDimensions(
  originalWidth: number,
  originalHeight: number,
  targetWidth?: number,
  targetHeight?: number
): { width: number; height: number } {
  const aspectRatio = calculateAspectRatio(originalWidth, originalHeight);

  if (targetWidth && !targetHeight) {
    return {
      width: targetWidth,
      height: Math.round(targetWidth / aspectRatio)
    };
  }

  if (targetHeight && !targetWidth) {
    return {
      width: Math.round(targetHeight * aspectRatio),
      height: targetHeight
    };
  }

  if (targetWidth && targetHeight) {
    return { width: targetWidth, height: targetHeight };
  }

  return { width: originalWidth, height: originalHeight };
}

/**
 * Preload critical images
 */
export function preloadImage(src: string, as: 'image' = 'image'): void {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = as;
  link.href = src;
  document.head.appendChild(link);
}

/**
 * Lazy load image with intersection observer
 */
export function createImageObserver(
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };

  return new IntersectionObserver((entries) => {
    entries.forEach(callback);
  }, defaultOptions);
}