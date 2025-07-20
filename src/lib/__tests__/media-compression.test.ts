/**
 * Tests for media compression utilities
 */

import {
  isImageFile,
  isVideoFile,
  calculateNewDimensions,
  formatFileSize,
  COMPRESSION_PRESETS
} from '../media-compression';

// Mock File constructor for testing
const createMockFile = (name: string, type: string, size: number = 1024): File => {
  const file = new File([''], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

describe('Media Compression', () => {
  describe('isImageFile', () => {
    it('should identify image files correctly', () => {
      const imageFile = createMockFile('test.jpg', 'image/jpeg');
      const textFile = createMockFile('test.txt', 'text/plain');
      
      expect(isImageFile(imageFile)).toBe(true);
      expect(isImageFile(textFile)).toBe(false);
    });
  });

  describe('isVideoFile', () => {
    it('should identify video files correctly', () => {
      const videoFile = createMockFile('test.mp4', 'video/mp4');
      const imageFile = createMockFile('test.jpg', 'image/jpeg');
      
      expect(isVideoFile(videoFile)).toBe(true);
      expect(isVideoFile(imageFile)).toBe(false);
    });
  });

  describe('calculateNewDimensions', () => {
    it('should return original dimensions when no constraints', () => {
      const result = calculateNewDimensions(1920, 1080);
      expect(result).toEqual({ width: 1920, height: 1080 });
    });

    it('should scale down to max width while maintaining aspect ratio', () => {
      const result = calculateNewDimensions(1920, 1080, 800);
      expect(result.width).toBe(800);
      expect(result.height).toBe(450);
    });

    it('should scale down to max height while maintaining aspect ratio', () => {
      const result = calculateNewDimensions(1920, 1080, undefined, 600);
      expect(result.width).toBe(1067);
      expect(result.height).toBe(600);
    });

    it('should respect both width and height constraints', () => {
      const result = calculateNewDimensions(2000, 1000, 800, 600);
      expect(result.width).toBe(800);
      expect(result.height).toBe(400);
    });

    it('should not scale up images', () => {
      const result = calculateNewDimensions(400, 300, 800, 600);
      expect(result.width).toBe(400);
      expect(result.height).toBe(300);
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    });

    it('should handle decimal places', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(1024 * 1024 * 1.5)).toBe('1.5 MB');
    });
  });

  describe('COMPRESSION_PRESETS', () => {
    it('should have all required presets', () => {
      expect(COMPRESSION_PRESETS).toHaveProperty('thumbnail');
      expect(COMPRESSION_PRESETS).toHaveProperty('gallery');
      expect(COMPRESSION_PRESETS).toHaveProperty('hero');
      expect(COMPRESSION_PRESETS).toHaveProperty('blog');
    });

    it('should have valid preset configurations', () => {
      Object.values(COMPRESSION_PRESETS).forEach(preset => {
        expect(preset).toHaveProperty('maxWidth');
        expect(preset).toHaveProperty('maxHeight');
        expect(preset).toHaveProperty('quality');
        expect(preset).toHaveProperty('format');
        expect(preset.quality).toBeGreaterThan(0);
        expect(preset.quality).toBeLessThanOrEqual(1);
      });
    });
  });
});