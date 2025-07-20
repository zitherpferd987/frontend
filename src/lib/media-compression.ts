/**
 * Media compression and processing utilities
 * Handles client-side image compression before upload
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'webp' | 'png';
  maintainAspectRatio?: boolean;
}

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  dimensions: {
    width: number;
    height: number;
  };
}

/**
 * Default compression settings for different use cases
 */
export const COMPRESSION_PRESETS = {
  thumbnail: {
    maxWidth: 300,
    maxHeight: 300,
    quality: 0.7,
    format: 'webp' as const
  },
  gallery: {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.8,
    format: 'webp' as const
  },
  hero: {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.85,
    format: 'webp' as const
  },
  blog: {
    maxWidth: 800,
    maxHeight: 600,
    quality: 0.8,
    format: 'webp' as const
  }
};

/**
 * Check if file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Check if file is a video
 */
export function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/');
}

/**
 * Get image dimensions from file
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}

/**
 * Calculate new dimensions maintaining aspect ratio
 */
export function calculateNewDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth?: number,
  maxHeight?: number
): { width: number; height: number } {
  if (!maxWidth && !maxHeight) {
    return { width: originalWidth, height: originalHeight };
  }

  const aspectRatio = originalWidth / originalHeight;

  let newWidth = originalWidth;
  let newHeight = originalHeight;

  if (maxWidth && newWidth > maxWidth) {
    newWidth = maxWidth;
    newHeight = newWidth / aspectRatio;
  }

  if (maxHeight && newHeight > maxHeight) {
    newHeight = maxHeight;
    newWidth = newHeight * aspectRatio;
  }

  return {
    width: Math.round(newWidth),
    height: Math.round(newHeight)
  };
}

/**
 * Compress image file
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  if (!isImageFile(file)) {
    throw new Error('File is not an image');
  }

  const {
    maxWidth,
    maxHeight,
    quality = 0.8,
    format = 'webp',
    maintainAspectRatio = true
  } = options;

  // Get original dimensions
  const originalDimensions = await getImageDimensions(file);
  
  // Calculate new dimensions
  const newDimensions = maintainAspectRatio
    ? calculateNewDimensions(originalDimensions.width, originalDimensions.height, maxWidth, maxHeight)
    : { width: maxWidth || originalDimensions.width, height: maxHeight || originalDimensions.height };

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      // Set canvas dimensions
      canvas.width = newDimensions.width;
      canvas.height = newDimensions.height;

      // Draw and compress image
      ctx.drawImage(img, 0, 0, newDimensions.width, newDimensions.height);
      
      // Convert to blob
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          
          if (!blob) {
            reject(new Error('Failed to compress image'));
            return;
          }

          // Create new file
          const compressedFile = new File(
            [blob],
            file.name.replace(/\.[^/.]+$/, `.${format}`),
            { type: `image/${format}` }
          );

          const result: CompressionResult = {
            file: compressedFile,
            originalSize: file.size,
            compressedSize: blob.size,
            compressionRatio: (1 - blob.size / file.size) * 100,
            dimensions: newDimensions
          };

          resolve(result);
        },
        `image/${format}`,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for compression'));
    };

    img.src = url;
  });
}

/**
 * Compress multiple images
 */
export async function compressImages(
  files: File[],
  options: CompressionOptions = {}
): Promise<CompressionResult[]> {
  const compressionPromises = files
    .filter(isImageFile)
    .map(file => compressImage(file, options));

  return Promise.all(compressionPromises);
}

/**
 * Generate thumbnail from image
 */
export async function generateThumbnail(
  file: File,
  size: number = 150
): Promise<CompressionResult> {
  return compressImage(file, {
    maxWidth: size,
    maxHeight: size,
    quality: 0.7,
    format: 'webp'
  });
}

/**
 * Validate file size and type
 */
export interface FileValidationOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  maxWidth?: number;
  maxHeight?: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export async function validateFile(
  file: File,
  options: FileValidationOptions = {}
): Promise<ValidationResult> {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    maxWidth = 4000,
    maxHeight = 4000
  } = options;

  const errors: string[] = [];

  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (${(maxSize / 1024 / 1024).toFixed(2)}MB)`);
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }

  // Check image dimensions if it's an image
  if (isImageFile(file)) {
    try {
      const dimensions = await getImageDimensions(file);
      if (dimensions.width > maxWidth) {
        errors.push(`Image width (${dimensions.width}px) exceeds maximum allowed width (${maxWidth}px)`);
      }
      if (dimensions.height > maxHeight) {
        errors.push(`Image height (${dimensions.height}px) exceeds maximum allowed height (${maxHeight}px)`);
      }
    } catch (error) {
      errors.push('Failed to read image dimensions');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Create a data URL from file for preview
 */
export function createPreviewUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}