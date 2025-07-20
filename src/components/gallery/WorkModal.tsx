'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GalleryWork, Media } from '@/types';
import { MediaViewer } from './MediaViewer';
import { 
  XMarkIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ShareIcon,
  HeartIcon,
  CalendarIcon,
  TagIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface WorkModalProps {
  work: GalleryWork | null;
  isOpen: boolean;
  onClose: () => void;
}

export function WorkModal({ work, isOpen, onClose }: WorkModalProps) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const mediaItems = work?.attributes.media.data || [];
  const currentMedia = mediaItems[currentMediaIndex];

  // Reset media index when work changes
  useEffect(() => {
    setCurrentMediaIndex(0);
  }, [work?.id]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNext();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentMediaIndex, mediaItems.length]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const goToNext = () => {
    if (mediaItems.length > 1) {
      setCurrentMediaIndex((prev) => (prev + 1) % mediaItems.length);
    }
  };

  const goToPrevious = () => {
    if (mediaItems.length > 1) {
      setCurrentMediaIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleShare = async () => {
    if (navigator.share && work) {
      try {
        await navigator.share({
          title: work.attributes.title,
          text: work.attributes.description || '',
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to copy URL
        copyToClipboard();
      }
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!work) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={modalRef}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={handleBackdropClick}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

          {/* Modal content */}
          <motion.div
            className="relative w-full max-w-7xl max-h-[90vh] bg-background rounded-lg shadow-2xl overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex flex-col lg:flex-row h-full">
              {/* Media section */}
              <div className="flex-1 relative bg-black">
                <MediaViewer
                  media={currentMedia}
                  className="w-full h-full"
                />

                {/* Navigation arrows */}
                {mediaItems.length > 1 && (
                  <>
                    <button
                      onClick={goToPrevious}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                      aria-label="Previous media"
                    >
                      <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                    <button
                      onClick={goToNext}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                      aria-label="Next media"
                    >
                      <ChevronRightIcon className="w-6 h-6" />
                    </button>
                  </>
                )}

                {/* Media counter */}
                {mediaItems.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/70 text-white text-sm rounded-full">
                    {currentMediaIndex + 1} / {mediaItems.length}
                  </div>
                )}

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                  aria-label="Close modal"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Details section */}
              <div className="w-full lg:w-96 p-6 overflow-y-auto">
                <div className="space-y-6">
                  {/* Header */}
                  <div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">
                      {work.attributes.title}
                    </h1>
                    
                    {/* Action buttons */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setIsLiked(!isLiked)}
                        className="flex items-center space-x-1 px-3 py-1 rounded-full hover:bg-foreground/5 transition-colors"
                      >
                        {isLiked ? (
                          <HeartSolidIcon className="w-5 h-5 text-red-500" />
                        ) : (
                          <HeartIcon className="w-5 h-5 text-foreground/60" />
                        )}
                        <span className="text-sm text-foreground/60">Like</span>
                      </button>
                      
                      <div className="relative">
                        <button
                          onClick={handleShare}
                          className="flex items-center space-x-1 px-3 py-1 rounded-full hover:bg-foreground/5 transition-colors"
                        >
                          <ShareIcon className="w-5 h-5 text-foreground/60" />
                          <span className="text-sm text-foreground/60">Share</span>
                        </button>
                        
                        {/* Share menu */}
                        {showShareMenu && (
                          <div className="absolute top-full left-0 mt-2 bg-background border border-foreground/10 rounded-lg shadow-lg p-2 z-10">
                            <button
                              onClick={copyToClipboard}
                              className="block w-full text-left px-3 py-2 text-sm hover:bg-foreground/5 rounded"
                            >
                              Copy Link
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {work.attributes.description && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Description</h3>
                      <p className="text-foreground/80 leading-relaxed">
                        {work.attributes.description}
                      </p>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="space-y-4">
                    {/* Created date */}
                    <div className="flex items-center space-x-3">
                      <CalendarIcon className="w-5 h-5 text-foreground/60" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Created</p>
                        <p className="text-sm text-foreground/70">
                          {formatDate(work.attributes.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Dimensions */}
                    {work.attributes.dimensions && (
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 border-2 border-foreground/60 rounded" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Dimensions</p>
                          <p className="text-sm text-foreground/70">
                            {work.attributes.dimensions}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Software used */}
                    {work.attributes.softwareUsed && work.attributes.softwareUsed.length > 0 && (
                      <div className="flex items-start space-x-3">
                        <CpuChipIcon className="w-5 h-5 text-foreground/60 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-foreground mb-2">Software Used</p>
                          <div className="flex flex-wrap gap-2">
                            {work.attributes.softwareUsed.map((software) => (
                              <span
                                key={software}
                                className="px-2 py-1 bg-primary/10 text-primary text-sm rounded-full"
                              >
                                {software}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Category */}
                    {work.attributes.category?.data && (
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 bg-foreground/60 rounded" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Category</p>
                          <p className="text-sm text-foreground/70">
                            {work.attributes.category.data.attributes.name}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {work.attributes.tags?.data && work.attributes.tags.data.length > 0 && (
                      <div className="flex items-start space-x-3">
                        <TagIcon className="w-5 h-5 text-foreground/60 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-foreground mb-2">Tags</p>
                          <div className="flex flex-wrap gap-2">
                            {work.attributes.tags.data.map((tag) => (
                              <span
                                key={tag.id}
                                className="px-2 py-1 bg-foreground/10 text-foreground/70 text-sm rounded-full"
                              >
                                {tag.attributes.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Media thumbnails */}
                  {mediaItems.length > 1 && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-3">All Media</h3>
                      <div className="grid grid-cols-4 gap-2">
                        {mediaItems.map((media, index) => (
                          <button
                            key={media.id}
                            onClick={() => setCurrentMediaIndex(index)}
                            className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                              index === currentMediaIndex
                                ? 'border-primary'
                                : 'border-transparent hover:border-foreground/20'
                            }`}
                          >
                            <img
                              src={media.attributes.formats?.thumbnail?.url || media.attributes.url}
                              alt={media.attributes.alternativeText || ''}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}