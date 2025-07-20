/**
 * Media service for handling CDN and local storage
 * Provides unified interface for media file operations
 */

export interface MediaConfig {
  cdnUrl?: string;
  localStorageUrl?: string;
  useWebP?: boolean;
  useAVIF?: boolean;
  enableLazyLoading?: boolean;
  compressionQuality?: number;
}

export interface MediaTransformation {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  blur?: number;
  sharpen?: boolean;
}

class MediaService {
  private config: MediaConfig;

  constructor(config: MediaConfig = {}) {
    this.config = {
      useWebP: true,
      useAVIF: true,
      enableLazyLoading: true,
      compressionQuality: 80,
      ...config
    };
  }

  /**
   * Get the base URL for media files
   */
  private getBaseUrl(): string {
    if (this.config.cdnUrl) {
      return this.config.cdnUrl;
    }
    
    if (this.config.localStorageUrl) {
      return this.config.localStorageUrl;
    }

    // Default to Strapi uploads
    return process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
  }

  /**
   * Build media URL with transformations
   */
  buildUrl(path: string, transformations: MediaTransformation = {}): string {
    const baseUrl = this.getBaseUrl();
    const fullUrl = path.startsWith('http') ? path : `${baseUrl}${path}`;
    
    // If using CDN, apply transformations via URL parameters
    if (this.config.cdnUrl) {
      return this.buildCdnUrl(fullUrl, transformations);
    }

    // For local/Strapi, use query parameters
    return this.buildLocalUrl(fullUrl, transformations);
  }

  /**
   * Build CDN URL with transformations (Cloudinary-style)
   */
  private buildCdnUrl(url: string, transformations: MediaTransformation): string {
    const params = new URLSearchParams();
    
    if (transformations.width) params.append('w', transformations.width.toString());
    if (transformations.height) params.append('h', transformations.height.toString());
    if (transformations.quality) params.append('q', transformations.quality.toString());
    if (transformations.format) params.append('f', transformations.format);
    if (transformations.fit) params.append('c', transformations.fit);
    if (transformations.blur) params.append('e', `blur:${transformations.blur}`);
    if (transformations.sharpen) params.append('e', 'sharpen');

    const queryString = params.toString();
    return queryString ? `${url}?${queryString}` : url;
  }

  /**
   * Build local URL with transformations
   */
  private buildLocalUrl(url: string, transformations: MediaTransformation): string {
    const params = new URLSearchParams();
    
    if (transformations.width) params.append('width', transformations.width.toString());
    if (transformations.height) params.append('height', transformations.height.toString());
    if (transformations.quality) params.append('quality', transformations.quality.toString());
    if (transformations.format) params.append('format', transformations.format);
    if (transformations.fit) params.append('fit', transformations.fit);

    const queryString = params.toString();
    return queryString ? `${url}?${queryString}` : url;
  }

  /**
   * Generate responsive image sources
   */
  generateResponsiveSources(
    path: string,
    breakpoints: number[] = [640, 768, 1024, 1280, 1920]
  ): Array<{ src: string; width: number }> {
    return breakpoints.map(width => ({
      src: this.buildUrl(path, { width, format: 'webp' }),
      width
    }));
  }

  /**
   * Generate srcSet string for responsive images
   */
  generateSrcSet(
    path: string,
    breakpoints: number[] = [640, 768, 1024, 1280, 1920],
    transformations: Omit<MediaTransformation, 'width'> = {}
  ): string {
    return breakpoints
      .map(width => {
        const src = this.buildUrl(path, { ...transformations, width });
        return `${src} ${width}w`;
      })
      .join(', ');
  }

  /**
   * Get optimized image for different use cases
   */
  getThumbnail(path: string, size: number = 150): string {
    return this.buildUrl(path, {
      width: size,
      height: size,
      fit: 'cover',
      format: 'webp',
      quality: 75
    });
  }

  getHeroImage(path: string, width: number = 1920, height?: number): string {
    return this.buildUrl(path, {
      width,
      height,
      fit: 'cover',
      format: 'webp',
      quality: 90
    });
  }

  getBlogImage(path: string, width: number = 800): string {
    return this.buildUrl(path, {
      width,
      fit: 'inside',
      format: 'webp',
      quality: 85
    });
  }

  getGalleryImage(path: string, width: number = 1200): string {
    return this.buildUrl(path, {
      width,
      fit: 'inside',
      format: 'webp',
      quality: 90
    });
  }

  /**
   * Generate placeholder image (blur/low quality)
   */
  getPlaceholder(path: string, width: number = 40): string {
    return this.buildUrl(path, {
      width,
      quality: 10,
      blur: 10,
      format: 'jpeg'
    });
  }

  /**
   * Preload critical images
   */
  preloadImages(paths: string[], transformations: MediaTransformation = {}): void {
    paths.forEach(path => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = this.buildUrl(path, transformations);
      document.head.appendChild(link);
    });
  }

  /**
   * Check if image format is supported
   */
  async isFormatSupported(format: 'webp' | 'avif'): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = img.onerror = () => {
        resolve(img.height === 2);
      };
      
      if (format === 'webp') {
        img.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
      } else if (format === 'avif') {
        img.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
      }
    });
  }

  /**
   * Get best supported format
   */
  async getBestFormat(): Promise<'avif' | 'webp' | 'jpeg'> {
    if (this.config.useAVIF && await this.isFormatSupported('avif')) {
      return 'avif';
    }
    if (this.config.useWebP && await this.isFormatSupported('webp')) {
      return 'webp';
    }
    return 'jpeg';
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<MediaConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): MediaConfig {
    return { ...this.config };
  }
}

// Create default instance
export const mediaService = new MediaService({
  localStorageUrl: process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337',
  useWebP: true,
  useAVIF: true,
  enableLazyLoading: true,
  compressionQuality: 80
});

// Export class for custom instances
export { MediaService };

// Utility functions for common operations
export function getOptimizedImageUrl(
  path: string,
  transformations: MediaTransformation = {}
): string {
  return mediaService.buildUrl(path, transformations);
}

export function generateImageSrcSet(
  path: string,
  breakpoints?: number[],
  transformations?: Omit<MediaTransformation, 'width'>
): string {
  return mediaService.generateSrcSet(path, breakpoints, transformations);
}

export function getThumbnailUrl(path: string, size?: number): string {
  return mediaService.getThumbnail(path, size);
}

export function getHeroImageUrl(path: string, width?: number, height?: number): string {
  return mediaService.getHeroImage(path, width, height);
}

export function getBlogImageUrl(path: string, width?: number): string {
  return mediaService.getBlogImage(path, width);
}

export function getGalleryImageUrl(path: string, width?: number): string {
  return mediaService.getGalleryImage(path, width);
}

export function getPlaceholderUrl(path: string, width?: number): string {
  return mediaService.getPlaceholder(path, width);
}