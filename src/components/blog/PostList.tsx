'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBlogPosts } from '@/hooks/use-blog-posts';
import { PostCard } from './PostCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { CategoryFilter } from './CategoryFilter';
import { SearchBar } from './SearchBar';
import { Pagination } from './Pagination';

interface PostListProps {
  initialCategory?: string;
  initialTag?: string;
  initialSearch?: string;
}

export function PostList({ 
  initialCategory, 
  initialTag, 
  initialSearch 
}: PostListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || '');
  const [selectedTag, setSelectedTag] = useState(initialTag || '');
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');
  const pageSize = 9;

  const { data, isLoading, error } = useBlogPosts({
    page: currentPage,
    pageSize,
    category: selectedCategory || undefined,
    tag: selectedTag || undefined,
    search: searchQuery || undefined,
  });

  const posts = data?.data || [];
  const pagination = data?.meta?.pagination;

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleTagChange = (tag: string) => {
    setSelectedTag(tag);
    setCurrentPage(1);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of posts
    document.getElementById('posts-section')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedTag('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-semibold mb-2">Failed to load posts</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {error.message || 'Something went wrong while loading the blog posts.'}
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search and Filters */}
      <div className="space-y-6">
        <SearchBar 
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search posts..."
        />
        
        <CategoryFilter
          selectedCategory={selectedCategory}
          selectedTag={selectedTag}
          onCategoryChange={handleCategoryChange}
          onTagChange={handleTagChange}
        />

        {/* Active Filters */}
        {(selectedCategory || selectedTag || searchQuery) && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
            
            {selectedCategory && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                Category: {selectedCategory}
                <button
                  onClick={() => handleCategoryChange('')}
                  className="ml-1 hover:text-blue-600 dark:hover:text-blue-300"
                >
                  ×
                </button>
              </span>
            )}
            
            {selectedTag && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
                Tag: {selectedTag}
                <button
                  onClick={() => handleTagChange('')}
                  className="ml-1 hover:text-green-600 dark:hover:text-green-300"
                >
                  ×
                </button>
              </span>
            )}
            
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Search: "{searchQuery}"
                <button
                  onClick={() => handleSearch('')}
                  className="ml-1 hover:text-purple-600 dark:hover:text-purple-300"
                >
                  ×
                </button>
              </span>
            )}
            
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Posts Section */}
      <div id="posts-section">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-semibold mb-2">No posts found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery || selectedCategory || selectedTag
                  ? 'Try adjusting your search criteria or filters.'
                  : 'No blog posts have been published yet.'}
              </p>
            </div>
            {(searchQuery || selectedCategory || selectedTag) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </motion.div>
        ) : (
          <>
            {/* Posts Grid */}
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              <AnimatePresence mode="popLayout">
                {posts.map((post, index) => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    index={index}
                  />
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Pagination */}
            {pagination && pagination.pageCount > 1 && (
              <div className="mt-12">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.pageCount}
                  onPageChange={handlePageChange}
                />
              </div>
            )}

            {/* Results Info */}
            {pagination && (
              <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
                Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
                {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
                {pagination.total} posts
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}