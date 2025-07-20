/**
 * CDN Configuration for media optimization
 * Supports multiple CDN providers and local storage
 */

export interface CDNProvider {
  name: string;
  baseUrl: string;
  transformUrl: (url: string, transformations: Record<string, any>) => string;
  supportedFormats: string[];
  maxQuality: number;
  features: {
    autoFormat: boolean;
    autoQuality: boolean;
    lazyLoading: boolean;
    responsiveImages: boolean;
  };
}

/**
 * Cloudinary CDN Provider
 */
export const cloudinaryProvider: CDNProvider = {
  name: 'Cloudinary',
  baseUrl: process.env.NEXT_PUBLIC_CLOUDINARY_URL || '',
  transformUrl: (url: string, transformations: Record<string, any>) => {
    const params = [];
    
    if (transformations.width) params.push(`w_${transformations.width}`);
    if (transformations.height) params.push(`h_${transformations.height}`);
    if (transformations.quality) params.push(`q_${transformations.quality}`);
    if (transformations.format) params.push(`f_${transformations.format}`);
    if (transformations.crop) params.push(`c_${transformations.crop}`);
    if (transformations.gravity) params.push(`g_${transformations.gravity}`);
    if (transformations.blur) params.push(`e_blur:${transformations.blur}`);
    if (transformations.sharpen) params.push(`e_sharpen`);
    if (transformations.auto) params.push(`f_auto,q_auto`);
    
    const transformString = params.join(',');
    return transformString ? `${url}/${transformString}` : url;
  },
  supportedFormats: ['webp', 'avif', 'jpeg', 'png', 'gif'],
  maxQuality: 100,
  features: {
    autoFormat: true,
    autoQuality: true,
    lazyLoading: true,
    responsiveImages: true
  }
};

/**
 * ImageKit CDN Provider
 */
export const imagekitProvider: CDNProvider = {
  name: 'ImageKit',
  baseUrl: process.env.NEXT_PUBLIC_IMAGEKIT_URL || '',
  transformUrl: (url: string, transformations: Record<string, any>) => {
    const params = new URLSearchParams();
    
    if (transformations.width) params.append('tr', `w-${transformations.width}`);
    if (transformations.height) params.append('tr', `h-${transformations.height}`);
    if (transformations.quality) params.append('tr', `q-${transformations.quality}`);
    if (transformations.format) params.append('tr', `f-${transformations.format}`);
    if (transformations.crop) params.append('tr', `c-${transformations.crop}`);
    if (transformations.blur) params.append('tr', `bl-${transformations.blur}`);
    if (transformations.sharpen) params.append('tr', `e-sharpen`);
    
    const queryString = params.toString();
    return queryString ? `${url}?${queryString}` : url;
  },
  supportedFormats: ['webp', 'avif', 'jpeg', 'png'],
  maxQuality: 100,
  features: {
    autoFormat: true,
    autoQuality: true,
    lazyLoading: true,
    responsiveImages: true
  }
};

/**
 * Local/Strapi Provider (no CDN)
 */
export const localProvider: CDNProvider = {
  name: 'Local',
  baseUrl: process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337',
  transformUrl: (url: string, transformations: Record<string, any>) => {
    // For local/Strapi, we rely on Next.js Image optimization
    const params = new URLSearchParams();
    
    if (transformations.width) params.append('width', transformations.width.toString());
    if (transformations.height) params.append('height', transformations.height.toString());
    if (transformations.quality) params.append('quality', transformations.quality.toString());
    if (transformations.format) params.append('format', transformations.format);
    
    const queryString = params.toString();
    return queryString ? `${url}?${queryString}` : url;
  },
  supportedFormats: ['webp', 'avif', 'jpeg', 'png'],
  maxQuality: 100,
  features: {
    autoFormat: false,
    autoQuality: false,
    lazyLoading: true,
    responsiveImages: true
  }
};

/**
 * CDN Configuration Manager
 */
class CDNConfig {
  private provider: CDNProvider;

  constructor(provider?: CDNProvider) {
    this.provider = provider || this.detectProvider();
  }

  /**
   * Auto-detect CDN provider based on environment variables
   */
  private detectProvider(): CDNProvider {
    if (process.env.NEXT_PUBLIC_CLOUDINARY_URL) {
      return cloudinaryProvider;
    }
    
    if (process.env.NEXT_PUBLIC_IMAGEKIT_URL) {
      return imagekitProvider;
    }
    
    return localProvider;
  }

  /**
   * Get current provider
   */
  getProvider(): CDNProvider {
    return this.provider;
  }

  /**
   * Set provider
   */
  setProvider(provider: CDNProvider): void {
    this.provider = provider;
  }

  /**
   * Transform image URL with optimizations
   */
  transformImage(
    url: string, 
    transformations: Record<string, any> = {}
  ): string {
    // Ensure URL is absolute
    const absoluteUrl = url.startsWith('http') 
      ? url 
      : `${this.provider.baseUrl}${url}`;

    return this.provider.transformUrl(absoluteUrl, transformations);
  }

  /**
   * Generate responsive image sources
   */
  generateResponsiveSources(
    url: string,
    breakpoints: number[] = [640, 768, 1024, 1280, 1920],
    baseTransformations: Record<string, any> = {}
  ): Array<{ src: string; width: number }> {
    return breakpoints.map(width => ({
      src: this.transformImage(url, { ...baseTransformations, width }),
      width
    }));
  }

  /**
   * Generate srcSet string
   */
  generateSrcSet(
    url: string,
    breakpoints: number[] = [640, 768, 1024, 1280, 1920],
    baseTransformations: Record<string, any> = {}
  ): string {
    return this.generateResponsiveSources(url, breakpoints, baseTransformations)
      .map(({ src, width }) => `${src} ${width}w`)
      .join(', ');
  }

  /**
   * Get optimized image for specific use case
   */
  getOptimizedImage(
    url: string,
    useCase: 'thumbnail' | 'gallery' | 'hero' | 'blog' | 'avatar',
    customTransformations: Record<string, any> = {}
  ): string {
    const presets = {
      thumbnail: { width: 150, height: 150, crop: 'fill', quality: 75 },
      gallery: { width: 800, quality: 85, crop: 'fit' },
      hero: { width: 1920, height: 1080, crop: 'fill', quality: 90 },
      blog: { width: 800, quality: 85, crop: 'fit' },
      avatar: { width: 100, height: 100, crop: 'fill', quality: 80 }
    };

    const preset = presets[useCase];
    const transformations = { ...preset, ...customTransformations };

    // Add auto format and quality if supported
    if (this.provider.features.autoFormat) {
      (transformations as any).auto = true;
    }

    return this.transformImage(url, transformations);
  }

  /**
   * Get placeholder image (low quality, blurred)
   */
  getPlaceholder(url: string, width: number = 40): string {
    return this.transformImage(url, {
      width,
      quality: 10,
      blur: 10,
      format: 'jpeg'
    });
  }

  /**
   * Check if format is supported
   */
  isFormatSupported(format: string): boolean {
    return this.provider.supportedFormats.includes(format);
  }

  /**
   * Get best format for browser
   */
  getBestFormat(): string {
    // This would typically check browser support
    // For now, return webp as it's widely supported
    if (this.isFormatSupported('avif')) return 'avif';
    if (this.isFormatSupported('webp')) return 'webp';
    return 'jpeg';
  }

  /**
   * Preload critical images
   */
  preloadImages(urls: string[], transformations: Record<string, any> = {}): void {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = this.transformImage(url, transformations);
      document.head.appendChild(link);
    });
  }
}

// Create default instance
export const cdnConfig = new CDNConfig();

// Export class for custom instances
export { CDNConfig };

// Utility functions
export function getOptimizedImageUrl(
  url: string,
  transformations: Record<string, any> = {}
): string {
  return cdnConfig.transformImage(url, transformations);
}

export function generateImageSrcSet(
  url: string,
  breakpoints?: number[],
  transformations?: Record<string, any>
): string {
  return cdnConfig.generateSrcSet(url, breakpoints, transformations);
}

export function getThumbnailUrl(url: string, size: number = 150): string {
  return cdnConfig.getOptimizedImage(url, 'thumbnail', { width: size, height: size });
}

export function getHeroImageUrl(url: string, width: number = 1920, height: number = 1080): string {
  return cdnConfig.getOptimizedImage(url, 'hero', { width, height });
}

export function getBlogImageUrl(url: string, width: number = 800): string {
  return cdnConfig.getOptimizedImage(url, 'blog', { width });
}

export function getGalleryImageUrl(url: string, width: number = 800): string {
  return cdnConfig.getOptimizedImage(url, 'gallery', { width });
}

export function getPlaceholderUrl(url: string, width: number = 40): string {
  return cdnConfig.getPlaceholder(url, width);
}