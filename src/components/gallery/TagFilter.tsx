'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag } from '@/types';
import { tagQueries } from '@/lib/queries';
import { XMarkIcon, TagIcon } from '@heroicons/react/24/outline';

interface TagFilterProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  maxTags?: number;
  className?: string;
}

export function TagFilter({
  selectedTags,
  onTagsChange,
  maxTags = 5,
  className = '',
}: TagFilterProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await tagQueries.getPopular(50);
        setTags(response.data);
      } catch (error) {
        console.error('Failed to fetch tags:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();
  }, []);

  const handleTagToggle = (tagSlug: string) => {
    if (selectedTags.includes(tagSlug)) {
      // Remove tag
      onTagsChange(selectedTags.filter((tag) => tag !== tagSlug));
    } else {
      // Add tag (respect maxTags limit)
      if (selectedTags.length < maxTags) {
        onTagsChange([...selectedTags, tagSlug]);
      }
    }
  };

  const clearAllTags = () => {
    onTagsChange([]);
  };

  const displayTags = showAll ? tags : tags.slice(0, 20);

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="flex items-center space-x-2 mb-3">
          <TagIcon className="w-4 h-4" />
          <span className="text-sm font-medium">Tags:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-7 bg-foreground/10 rounded-full"
              style={{ width: `${60 + Math.random() * 40}px` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <TagIcon className="w-4 h-4 text-foreground/70" />
          <span className="text-sm font-medium text-foreground/70">Tags:</span>
          {selectedTags.length > 0 && (
            <span className="text-xs text-foreground/50">
              ({selectedTags.length}/{maxTags})
            </span>
          )}
        </div>

        {selectedTags.length > 0 && (
          <button
            onClick={clearAllTags}
            className="text-xs text-primary hover:text-primary/80 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Selected tags */}
      {selectedTags.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {selectedTags.map((tagSlug) => {
                const tag = tags.find((t) => t.attributes.slug === tagSlug);
                if (!tag) return null;

                return (
                  <motion.button
                    key={tagSlug}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => handleTagToggle(tagSlug)}
                    className="flex items-center space-x-1 px-3 py-1 bg-primary text-white text-sm rounded-full hover:bg-primary/90 transition-colors"
                  >
                    <span>{tag.attributes.name}</span>
                    <XMarkIcon className="w-3 h-3" />
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Available tags */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {displayTags.map((tag) => {
            const isSelected = selectedTags.includes(tag.attributes.slug);
            const isDisabled = !isSelected && selectedTags.length >= maxTags;

            return (
              <motion.button
                key={tag.id}
                onClick={() => handleTagToggle(tag.attributes.slug)}
                disabled={isDisabled}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  isSelected
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : isDisabled
                    ? 'bg-foreground/5 text-foreground/40 cursor-not-allowed'
                    : 'bg-foreground/10 text-foreground/70 hover:bg-foreground/20 hover:text-foreground'
                }`}
                whileHover={!isDisabled ? { scale: 1.05 } : {}}
                whileTap={!isDisabled ? { scale: 0.95 } : {}}
              >
                {tag.attributes.name}
              </motion.button>
            );
          })}
        </div>

        {/* Show more/less button */}
        {tags.length > 20 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            {showAll ? 'Show less' : `Show ${tags.length - 20} more tags`}
          </button>
        )}
      </div>

      {/* Help text */}
      {selectedTags.length === 0 && (
        <p className="text-xs text-foreground/50 mt-2">
          Select up to {maxTags} tags to filter works
        </p>
      )}
    </div>
  );
}