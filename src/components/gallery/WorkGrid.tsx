'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GalleryWork } from '@/types';
import { WorkCard } from './WorkCard';
import { WorkModal } from './WorkModal';
import { CategoryFilter } from './CategoryFilter';
import { TagFilter } from './TagFilter';
import { useInfiniteGalleryWorks } from '@/hooks/use-gallery-works';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';

interface WorkGridProps {
  initialWorks?: GalleryWork[];
  showFilters?: boolean;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function WorkGrid({ 
  initialWorks, 
  showFilters = true, 
  columns = 3,
  className = '' 
}: WorkGridProps) {
  const [selectedWork, setSelectedWork] = useState<GalleryWork | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isLoadMoreVisible = useIntersectionObserver(loadMoreRef, {
    threshold: 0.1,
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteGalleryWorks({
    pageSize: 12,
    category: selectedCategory || undefined,
    tag: selectedTags.length > 0 ? selectedTags[0] : undefined, // For simplicity, use first tag
  });

  // Auto-load more when scroll reaches bottom
  useEffect(() => {
    if (isLoadMoreVisible && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isLoadMoreVisible, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allWorks = data?.pages.flatMap(page => page.data) || initialWorks || [];

  const handleWorkClick = (work: GalleryWork) => {
    setSelectedWork(work);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedWork(null), 300); // Wait for animation
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleTagsChange = (tags: string[]) => {
    setSelectedTags(tags);
  };

  const getGridColumns = () => {
    switch (columns) {
      case 2:
        return 'grid-cols-1 md:grid-cols-2';
      case 3:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case 4:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Failed to load gallery works</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Filters */}
      {showFilters && (
        <div className="space-y-4">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />
          <TagFilter
            selectedTags={selectedTags}
            onTagsChange={handleTagsChange}
          />
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="grid gap-6 ${getGridColumns()}">
          {Array.from({ length: 12 }).map((_, index) => (
            <div
              key={index}
              className="aspect-square bg-foreground/5 rounded-lg animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Works grid */}
      {!isLoading && allWorks.length > 0 && (
        <motion.div
          className={`grid gap-6 ${getGridColumns()}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <AnimatePresence mode="popLayout">
            {allWorks.map((work, index) => (
              <motion.div
                key={work.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.05,
                  layout: { duration: 0.3 }
                }}
              >
                <WorkCard
                  work={work}
                  onClick={() => handleWorkClick(work)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Empty state */}
      {!isLoading && allWorks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-foreground/60 text-lg">
            No works found matching your criteria.
          </p>
          {(selectedCategory || selectedTags.length > 0) && (
            <button
              onClick={() => {
                setSelectedCategory('');
                setSelectedTags([]);
              }}
              className="mt-4 px-4 py-2 text-primary hover:text-primary/80 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Load more trigger */}
      {hasNextPage && (
        <div ref={loadMoreRef} className="flex justify-center py-8">
          {isFetchingNextPage ? (
            <div className="flex items-center space-x-2 text-foreground/60">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span>Loading more works...</span>
            </div>
          ) : (
            <button
              onClick={() => fetchNextPage()}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Load More
            </button>
          )}
        </div>
      )}

      {/* Work detail modal */}
      <WorkModal
        work={selectedWork}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}