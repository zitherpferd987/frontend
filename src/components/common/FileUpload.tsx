'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  compressImage, 
  validateFile, 
  formatFileSize, 
  createPreviewUrl,
  COMPRESSION_PRESETS,
  type CompressionResult,
  type CompressionOptions,
  type FileValidationOptions
} from '@/lib/media-compression';

interface FileUploadProps {
  onFilesSelected: (files: File[], compressionResults?: CompressionResult[]) => void;
  onError?: (error: string) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  compressionPreset?: keyof typeof COMPRESSION_PRESETS;
  customCompression?: CompressionOptions;
  validation?: FileValidationOptions;
  className?: string;
  disabled?: boolean;
}

interface FilePreview {
  file: File;
  preview: string;
  compressionResult?: CompressionResult;
  validationError?: string;
}

export default function FileUpload({
  onFilesSelected,
  onError,
  accept = 'image/*',
  multiple = false,
  maxFiles = 10,
  compressionPreset = 'gallery',
  customCompression,
  validation,
  className = '',
  disabled = false
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previews, setPreviews] = useState<FilePreview[]>([]);
  const [processingProgress, setProcessingProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressionOptions = customCompression || COMPRESSION_PRESETS[compressionPreset];

  const processFiles = useCallback(async (files: FileList) => {
    if (disabled) return;

    const fileArray = Array.from(files);
    
    // Check file count limit
    if (fileArray.length > maxFiles) {
      onError?.(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);
    
    const newPreviews: FilePreview[] = [];
    const validFiles: File[] = [];
    const compressionResults: CompressionResult[] = [];

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        setProcessingProgress((i / fileArray.length) * 50); // First 50% for validation

        // Validate file
        const validationResult = await validateFile(file, validation);
        
        // Create preview
        const preview = await createPreviewUrl(file);
        
        const filePreview: FilePreview = {
          file,
          preview,
          validationError: validationResult.isValid ? undefined : validationResult.errors.join(', ')
        };

        if (validationResult.isValid) {
          validFiles.push(file);
          
          // Compress image if it's an image file
          if (file.type.startsWith('image/')) {
            try {
              const compressionResult = await compressImage(file, compressionOptions);
              filePreview.compressionResult = compressionResult;
              compressionResults.push(compressionResult);
              validFiles[validFiles.length - 1] = compressionResult.file; // Replace with compressed file
            } catch (compressionError) {
              console.warn('Compression failed, using original file:', compressionError);
            }
          }
        }

        newPreviews.push(filePreview);
        setProcessingProgress(50 + ((i + 1) / fileArray.length) * 50); // Second 50% for compression
      }

      setPreviews(newPreviews);
      
      if (validFiles.length > 0) {
        onFilesSelected(validFiles, compressionResults);
      }

      if (validFiles.length !== fileArray.length) {
        const invalidCount = fileArray.length - validFiles.length;
        onError?.(`${invalidCount} file(s) were invalid and skipped`);
      }

    } catch (error) {
      onError?.(`Error processing files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  }, [disabled, maxFiles, validation, compressionOptions, onFilesSelected, onError]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  }, [disabled, processFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  }, [processFiles]);

  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const removePreview = useCallback((index: number) => {
    setPreviews(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearAll = useCallback(() => {
    setPreviews([]);
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <motion.div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200 ease-in-out
          ${isDragOver 
            ? 'border-primary bg-primary/5 scale-105' 
            : 'border-gray-300 hover:border-primary hover:bg-gray-50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        whileHover={disabled ? {} : { scale: 1.02 }}
        whileTap={disabled ? {} : { scale: 0.98 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />

        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isDragOver ? 'Drop files here' : 'Upload files'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Drag and drop files here, or click to select
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {accept} • Max {maxFiles} files • Auto-compression enabled
            </p>
          </div>
        </div>

        {/* Processing Overlay */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/90 flex items-center justify-center rounded-lg"
            >
              <div className="text-center space-y-2">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-gray-600">Processing files...</p>
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${processingProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* File Previews */}
      <AnimatePresence>
        {previews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Selected Files ({previews.length})</h3>
              <button
                onClick={clearAll}
                className="text-sm text-red-600 hover:text-red-800 transition-colors"
              >
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {previews.map((preview, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={`
                    relative border rounded-lg p-3 space-y-2
                    ${preview.validationError ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'}
                  `}
                >
                  {/* Preview Image */}
                  <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                    <img
                      src={preview.preview}
                      alt={preview.file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* File Info */}
                  <div className="space-y-1">
                    <p className="text-sm font-medium truncate" title={preview.file.name}>
                      {preview.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(preview.file.size)}
                    </p>

                    {/* Compression Info */}
                    {preview.compressionResult && (
                      <div className="text-xs text-green-600">
                        Compressed: {formatFileSize(preview.compressionResult.compressedSize)} 
                        ({preview.compressionResult.compressionRatio.toFixed(1)}% reduction)
                      </div>
                    )}

                    {/* Validation Error */}
                    {preview.validationError && (
                      <p className="text-xs text-red-600">
                        {preview.validationError}
                      </p>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removePreview(index)}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}