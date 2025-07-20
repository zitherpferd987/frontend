'use client';

import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { categoryQueries, tagQueries } from '@/lib/queries';

interface CategoryFilterProps {
  selectedCategory: string;
  selectedTag: string;
  onCategoryChange: (category: string) => void;
  onTagChange: (tag: string) => void;
}

export function CategoryFilter({
  selectedCategory,
  selectedTag,
  onCategoryChange,
  onTagChange,
}: CategoryFilterProps) {
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryQueries.getAll,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const { data: tagsData } = useQuery({
    queryKey: ['popular-tags'],
    queryFn: () => tagQueries.getPopular(15),
    staleTime: 10 * 60 * 1000,
  });

  const categories = categoriesData?.data || [];
  const tags = tagsData?.data || [];

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Categories
        </h3>
        <div className="flex flex-wrap gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onCategoryChange('')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === ''
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            All Categories
          </motion.button>
          
          {categories.map((category) => (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onCategoryChange(category.attributes.slug)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category.attributes.slug
                  ? 'text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              style={{
                backgroundColor: selectedCategory === category.attributes.slug 
                  ? category.attributes.color || '#3B82F6'
                  : undefined
              }}
            >
              {category.attributes.name}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Popular Tags
        </h3>
        <div className="flex flex-wrap gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onTagChange('')}
            className={`px-3 py-1 rounded-md text-sm transition-all ${
              selectedTag === ''
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            All Tags
          </motion.button>
          
          {tags.map((tag) => (
            <motion.button
              key={tag.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onTagChange(tag.attributes.slug)}
              className={`px-3 py-1 rounded-md text-sm transition-all ${
                selectedTag === tag.attributes.slug
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              #{tag.attributes.name}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}