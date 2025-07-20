'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Category } from '@/types';
import { categoryQueries } from '@/lib/queries';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  className?: string;
}

export function CategoryFilter({
  selectedCategory,
  onCategoryChange,
  className = '',
}: CategoryFilterProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryQueries.getAll();
        setCategories(response.data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const selectedCategoryData = categories.find(
    (cat) => cat.attributes.slug === selectedCategory
  );

  const handleCategorySelect = (categorySlug: string) => {
    onCategoryChange(categorySlug);
    setIsOpen(false);
  };

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-10 bg-foreground/10 rounded-lg w-48" />
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-foreground/70">Category:</span>
        
        {/* Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center space-x-2 px-4 py-2 bg-background border border-foreground/20 rounded-lg hover:border-foreground/40 transition-colors min-w-[120px]"
          >
            <span className="text-sm">
              {selectedCategoryData?.attributes.name || 'All Categories'}
            </span>
            <ChevronDownIcon
              className={`w-4 h-4 transition-transform ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 mt-2 w-64 bg-background border border-foreground/20 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto"
              >
                <div className="p-2">
                  {/* All categories option */}
                  <button
                    onClick={() => handleCategorySelect('')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      !selectedCategory
                        ? 'bg-primary text-white'
                        : 'hover:bg-foreground/5'
                    }`}
                  >
                    All Categories
                  </button>

                  {/* Individual categories */}
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.attributes.slug)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between ${
                        selectedCategory === category.attributes.slug
                          ? 'bg-primary text-white'
                          : 'hover:bg-foreground/5'
                      }`}
                    >
                      <span>{category.attributes.name}</span>
                      {category.attributes.color && (
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.attributes.color }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick filter buttons for mobile */}
        <div className="hidden md:flex items-center space-x-2">
          <button
            onClick={() => onCategoryChange('')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              !selectedCategory
                ? 'bg-primary text-white'
                : 'bg-foreground/10 text-foreground/70 hover:bg-foreground/20'
            }`}
          >
            All
          </button>
          
          {categories.slice(0, 4).map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.attributes.slug)}
              className={`px-3 py-1 text-sm rounded-full transition-colors flex items-center space-x-1 ${
                selectedCategory === category.attributes.slug
                  ? 'bg-primary text-white'
                  : 'bg-foreground/10 text-foreground/70 hover:bg-foreground/20'
              }`}
            >
              {category.attributes.color && (
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: category.attributes.color }}
                />
              )}
              <span>{category.attributes.name}</span>
            </button>
          ))}
          
          {categories.length > 4 && (
            <button
              onClick={() => setIsOpen(true)}
              className="px-3 py-1 text-sm rounded-full bg-foreground/10 text-foreground/70 hover:bg-foreground/20 transition-colors"
            >
              +{categories.length - 4} more
            </button>
          )}
        </div>
      </div>

      {/* Mobile category pills */}
      <div className="md:hidden mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => onCategoryChange('')}
          className={`px-3 py-1 text-sm rounded-full transition-colors ${
            !selectedCategory
              ? 'bg-primary text-white'
              : 'bg-foreground/10 text-foreground/70'
          }`}
        >
          All
        </button>
        
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.attributes.slug)}
            className={`px-3 py-1 text-sm rounded-full transition-colors flex items-center space-x-1 ${
              selectedCategory === category.attributes.slug
                ? 'bg-primary text-white'
                : 'bg-foreground/10 text-foreground/70'
            }`}
          >
            {category.attributes.color && (
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: category.attributes.color }}
              />
            )}
            <span>{category.attributes.name}</span>
          </button>
        ))}
      </div>

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}