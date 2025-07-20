/**
 * Tests for image optimization utilities
 */

import {
  getOptimizedImageUrl,
  generateResponsiveSrcSet,
  generateSizesAttribute,
  calculateAspectRatio,
  getAspectRatioDimensions,
  DEFAULT_IMAGE_SIZES,
  DEFAULT_QUALITY
} from '../image-optimization';

describe('Image Optimization', () => {
  const testUrl = 'https://example.com/image.jpg';

  describe('getOptimizedImageUrl', () => {
    it('should return original URL when no options provided', () => {
      const result = getOptimizedImageUrl(testUrl);
      expect(result).toBe(testUrl);
    });

    it('should add width parameter', () => {
      const result = getOptimizedImageUrl(testUrl, { width: 800 });
      expect(result).toBe(`${testUrl}?width=800&fit=cover`);
    });

    it('should add multiple parameters', () => {
      const result = getOptimizedImageUrl(testUrl, {
        width: 800,
        height: 600,
        quality: 90,
        format: 'webp'
      });
      expect(result).toContain('width=800');
      expect(result).toContain('height=600');
      expect(result).toContain('quality=90');
      expect(result).toContain('format=webp');
    });
  });

  describe('generateResponsiveSrcSet', () => {
    it('should generate srcSet with default sizes', () => {
      const result = generateResponsiveSrcSet(testUrl);
      expect(result).toContain('640w');
      expect(result).toContain('768w');
      expect(result).toContain('1024w');
      expect(result).toContain('1920w');
    });

    it('should generate srcSet with custom sizes', () => {
      const customSizes = { mobile: 320, tablet: 768 };
      const result = generateResponsiveSrcSet(testUrl, customSizes);
      expect(result).toContain('320w');
      expect(result).toContain('768w');
    });
  });

  describe('generateSizesAttribute', () => {
    it('should generate sizes attribute with default breakpoints', () => {
      const result = generateSizesAttribute();
      expect(result).toContain('(max-width: 640px) 100vw');
      expect(result).toContain('(max-width: 768px) 50vw');
      expect(result).toContain('25vw');
    });

    it('should generate sizes attribute with custom breakpoints', () => {
      const customBreakpoints = { mobile: 320, tablet: 768 };
      const result = generateSizesAttribute(customBreakpoints);
      expect(result).toContain('(max-width: 320px) 100vw');
      expect(result).toContain('(max-width: 768px) 50vw');
    });
  });

  describe('calculateAspectRatio', () => {
    it('should calculate correct aspect ratio', () => {
      expect(calculateAspectRatio(1920, 1080)).toBeCloseTo(1.778, 3);
      expect(calculateAspectRatio(800, 600)).toBeCloseTo(1.333, 3);
      expect(calculateAspectRatio(500, 500)).toBe(1);
    });
  });

  describe('getAspectRatioDimensions', () => {
    it('should maintain aspect ratio when only width is provided', () => {
      const result = getAspectRatioDimensions(1920, 1080, 800);
      expect(result.width).toBe(800);
      expect(result.height).toBe(450);
    });

    it('should maintain aspect ratio when only height is provided', () => {
      const result = getAspectRatioDimensions(1920, 1080, undefined, 600);
      expect(result.width).toBe(1067);
      expect(result.height).toBe(600);
    });

    it('should return exact dimensions when both are provided', () => {
      const result = getAspectRatioDimensions(1920, 1080, 800, 600);
      expect(result.width).toBe(800);
      expect(result.height).toBe(600);
    });

    it('should return original dimensions when neither is provided', () => {
      const result = getAspectRatioDimensions(1920, 1080);
      expect(result.width).toBe(1920);
      expect(result.height).toBe(1080);
    });
  });
});