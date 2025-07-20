'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GalleryWork } from '@/types';
import { MediaViewer } from '@/components/gallery';
import { 
  ArrowLeftIcon,
  CalendarIcon,
  TagIcon,
  CpuChipIcon,
  ShareIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface GalleryWorkClientProps {
  work: GalleryWork;
}

export default function GalleryWorkClient({ work }: GalleryWorkClientProps) {
  const router = useRouter();
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  
  const mediaItems = work.attributes.media.data || [];
  const currentMedia = mediaItems[currentMediaIndex];

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: work.attributes.title,
          text: work.attributes.description || '',
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to copy URL
        try {
          await navigator.clipboard.writeText(window.location.href);
        } catch (clipboardError) {
          console.error('Failed to share or copy URL:', error);
        }
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors mb-8"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back to Gallery</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Media section */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {/* Main media viewer */}
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  {currentMedia && (
                    <MediaViewer
                      media={currentMedia}
                      className="w-full h-full"
                      autoPlay={false}
                      controls={true}
                    />
                  )}
                </div>

                {/* Media thumbnails */}
                {mediaItems.length > 1 && (
                  <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                    {mediaItems.map((media, index) => (
                      <button
                        key={media.id}
                        onClick={() => setCurrentMediaIndex(index)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                          index === currentMediaIndex
                            ? 'border-blue-500'
                            : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
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
                )}
              </div>
            </div>

            {/* Details section */}
            <div className="space-y-8">
              <div>
                {/* Title and actions */}
                <div className="flex items-start justify-between mb-4">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                    {work.attributes.title}
                  </h1>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setIsLiked(!isLiked)}
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      {isLiked ? (
                        <HeartSolidIcon className="w-6 h-6 text-red-500" />
                      ) : (
                        <HeartIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                      )}
                    </button>
                    
                    <button
                      onClick={handleShare}
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <ShareIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                {work.attributes.description && (
                  <div className="mb-6">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {work.attributes.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Metadata */}
              <div className="space-y-6">
                {/* Created date */}
                <div className="flex items-center space-x-3">
                  <CalendarIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Created</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(work.attributes.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Dimensions */}
                {work.attributes.dimensions && (
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 border-2 border-gray-600 dark:border-gray-400 rounded" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Dimensions</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {work.attributes.dimensions}
                      </p>
                    </div>
                  </div>
                )}

                {/* Software used */}
                {work.attributes.softwareUsed && work.attributes.softwareUsed.length > 0 && (
                  <div className="flex items-start space-x-3">
                    <CpuChipIcon className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Software Used</p>
                      <div className="flex flex-wrap gap-2">
                        {work.attributes.softwareUsed.map((software) => (
                          <span
                            key={software}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
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
                    <div 
                      className="w-5 h-5 rounded"
                      style={{ 
                        backgroundColor: work.attributes.category.data.attributes.color || '#6b7280' 
                      }}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Category</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {work.attributes.category.data.attributes.name}
                      </p>
                    </div>
                  </div>
                )}

                {/* Tags */}
                {work.attributes.tags?.data && work.attributes.tags.data.length > 0 && (
                  <div className="flex items-start space-x-3">
                    <TagIcon className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {work.attributes.tags.data.map((tag) => (
                          <span
                            key={tag.id}
                            className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm rounded-full"
                          >
                            {tag.attributes.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}