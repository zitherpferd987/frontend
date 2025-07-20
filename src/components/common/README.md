# Image and Media Optimization System

This document describes the comprehensive image and media optimization system implemented for the animator blog system.

## Overview

The optimization system provides:
- **Automatic image compression** with WebP/AVIF format support
- **Responsive image generation** for different screen sizes
- **Lazy loading** with intersection observer
- **Progressive loading** with low-quality placeholders
- **CDN integration** support (Cloudinary, ImageKit, local)
- **Client-side compression** before upload
- **Skeleton loading states** for better UX

## Components

### OptimizedImage

The main optimized image component that wraps Next.js Image with additional features.

```tsx
import OptimizedImage, { HeroImage, ThumbnailImage, BlogImage } from '@/components/common/OptimizedImage';

// Basic usage
<OptimizedImage
  src="/path/to/image.jpg"
  alt="Description"
  width={800}
  height={600}
  optimization={{
    quality: 85,
    format: 'webp',
    fit: 'cover'
  }}
/>

// Specialized components
<HeroImage src="/hero.jpg" alt="Hero" />
<ThumbnailImage src="/thumb.jpg" alt="Thumbnail" />
<BlogImage src="/blog.jpg" alt="Blog image" />
```

### LazyImage (Gallery)

Enhanced lazy loading image component with progressive loading.

```tsx
import { LazyImage, GalleryLazyImage, ThumbnailLazyImage } from '@/components/gallery/LazyImage';

<LazyImage
  src="/image.jpg"
  alt="Description"
  fill
  optimization={{
    quality: 85,
    format: 'webp'
  }}
  enableProgressiveLoading={true}
  showSkeleton={true}
/>
```

### FileUpload

File upload component with automatic compression.

```tsx
import FileUpload from '@/components/common/FileUpload';

<FileUpload
  onFilesSelected={(files, compressionResults) => {
    // Handle uploaded files
  }}
  compressionPreset="gallery"
  maxFiles={10}
  validation={{
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
  }}
/>
```

## Utilities

### Image Optimization

```tsx
import {
  getOptimizedImageUrl,
  generateResponsiveSrcSet,
  generateSizesAttribute
} from '@/lib/image-optimization';

// Generate optimized URL
const optimizedUrl = getOptimizedImageUrl('/image.jpg', {
  width: 800,
  quality: 85,
  format: 'webp'
});

// Generate responsive srcSet
const srcSet = generateResponsiveSrcSet('/image.jpg', {
  mobile: 640,
  tablet: 768,
  desktop: 1024
});

// Generate sizes attribute
const sizes = generateSizesAttribute();
```

### Media Compression

```tsx
import {
  compressImage,
  validateFile,
  COMPRESSION_PRESETS
} from '@/lib/media-compression';

// Compress image
const result = await compressImage(file, COMPRESSION_PRESETS.gallery);
console.log(`Compressed from ${result.originalSize} to ${result.compressedSize}`);

// Validate file
const validation = await validateFile(file, {
  maxSize: 5 * 1024 * 1024,
  allowedTypes: ['image/jpeg', 'image/png']
});
```

### CDN Configuration

```tsx
import { cdnConfig, getOptimizedImageUrl } from '@/lib/cdn-config';

// Configure CDN provider
cdnConfig.setProvider(cloudinaryProvider);

// Get optimized image for specific use case
const thumbnailUrl = cdnConfig.getOptimizedImage('/image.jpg', 'thumbnail');
const heroUrl = cdnConfig.getOptimizedImage('/image.jpg', 'hero');
```

### Media Service

```tsx
import { mediaService } from '@/lib/media-service';

// Generate responsive sources
const sources = mediaService.generateResponsiveSources('/image.jpg');

// Get optimized images
const thumbnail = mediaService.getThumbnail('/image.jpg', 150);
const hero = mediaService.getHeroImage('/image.jpg', 1920, 1080);
const placeholder = mediaService.getPlaceholder('/image.jpg', 40);
```

## Hooks

### useLazyLoading

```tsx
import { useLazyLoading } from '@/hooks/use-lazy-loading';

const { elementRef, shouldLoad } = useLazyLoading({
  rootMargin: '50px',
  threshold: 0.1,
  triggerOnce: true
});
```

### useImagePreloader

```tsx
import { useImagePreloader } from '@/hooks/use-lazy-loading';

const { preloadImage, isImageLoaded } = useImagePreloader();

// Preload critical images
useEffect(() => {
  preloadImage('/hero.jpg');
}, []);
```

## Configuration

### Next.js Configuration

The system enhances Next.js image optimization:

```typescript
// next.config.ts
images: {
  formats: ['image/avif', 'image/webp'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512],
  minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
}
```

### Environment Variables

```env
# CDN Configuration
NEXT_PUBLIC_CLOUDINARY_URL=https://res.cloudinary.com/your-cloud
NEXT_PUBLIC_IMAGEKIT_URL=https://ik.imagekit.io/your-id

# Strapi Configuration
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
```

## Performance Features

### Automatic Format Selection
- **AVIF** for modern browsers (best compression)
- **WebP** for most browsers (good compression)
- **JPEG** as fallback (universal support)

### Responsive Images
- Multiple breakpoints for different screen sizes
- Automatic `srcSet` and `sizes` generation
- Device-specific optimization

### Lazy Loading
- Intersection Observer API
- Configurable root margin and threshold
- Progressive loading with placeholders

### Compression
- Client-side image compression before upload
- Multiple quality presets (thumbnail, gallery, hero, blog)
- Automatic dimension calculation
- File validation and error handling

### Caching
- Long-term browser caching (30 days)
- CDN edge caching
- Service worker caching (if implemented)

## Best Practices

### Image Sizing
```tsx
// Use appropriate sizes for different contexts
<ThumbnailImage src="/image.jpg" alt="Thumb" /> // 150x150
<BlogImage src="/image.jpg" alt="Blog" />       // 800px wide
<HeroImage src="/image.jpg" alt="Hero" />       // 1920x1080
```

### Loading Strategy
```tsx
// Critical images (above fold)
<OptimizedImage src="/hero.jpg" preload={true} enableLazyLoading={false} />

// Non-critical images (below fold)
<OptimizedImage src="/gallery.jpg" enableLazyLoading={true} />
```

### Error Handling
```tsx
<OptimizedImage
  src="/image.jpg"
  alt="Description"
  onError={() => console.log('Image failed to load')}
  showSkeleton={true}
/>
```

### File Upload
```tsx
<FileUpload
  compressionPreset="gallery"
  validation={{
    maxSize: 10 * 1024 * 1024, // 10MB
    maxWidth: 4000,
    maxHeight: 4000
  }}
  onError={(error) => toast.error(error)}
/>
```

## Browser Support

- **Modern browsers**: AVIF, WebP, lazy loading
- **Legacy browsers**: JPEG fallback, polyfills
- **Mobile**: Touch-optimized, reduced motion support
- **Accessibility**: Alt text, keyboard navigation, screen readers

## Performance Metrics

The system targets:
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Image load time**: < 3s for hero images
- **Compression ratio**: 60-80% size reduction

## Troubleshooting

### Common Issues

1. **Images not loading**: Check CORS settings and domain configuration
2. **Poor compression**: Verify format support and quality settings
3. **Slow loading**: Enable CDN and check network conditions
4. **Layout shift**: Use proper aspect ratios and skeleton loading

### Debug Mode

Enable debug logging:
```tsx
// Add to your component
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Image optimization debug info');
  }
}, []);
```