'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { BlogPost } from '@/types';
import { api } from '@/lib/api';
import { formatDate, calculateReadingTime } from '@/lib/utils';
import { useRelatedBlogPosts } from '@/hooks/use-blog-posts';
import { PostCard } from './PostCard';
import { ContentRenderer } from './ContentRenderer';

interface PostDetailProps {
  post: BlogPost;
}

export function PostDetail({ post }: PostDetailProps) {
  const { attributes } = post;
  const featuredImage = attributes.featuredImage?.data;
  const category = attributes.category?.data;
  const tags = attributes.tags?.data || [];
  
  const readingTime = calculateReadingTime(attributes.content);
  
  // Get related posts
  const { data: relatedPostsData } = useRelatedBlogPosts(
    post.id,
    category?.id,
    3
  );
  const relatedPosts = relatedPostsData?.data || [];

  return (
    <article className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        {/* Category and Meta */}
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
          {category && (
            <Link
              href={`/blog?category=${category.attributes.slug}`}
              className="inline-flex items-center px-3 py-1 rounded-full text-white text-xs font-semibold hover:opacity-80 transition-opacity"
              style={{ backgroundColor: category.attributes.color || '#3B82F6' }}
            >
              {category.attributes.name}
            </Link>
          )}
          <time dateTime={attributes.publishedAt}>
            {formatDate(attributes.publishedAt)}
          </time>
          <span>•</span>
          <span>{readingTime} min read</span>
          {attributes.viewCount && (
            <>
              <span>•</span>
              <span>{attributes.viewCount} views</span>
            </>
          )}
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          {attributes.title}
        </h1>

        {/* Excerpt */}
        {attributes.excerpt && (
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            {attributes.excerpt}
          </p>
        )}

        {/* Featured Image */}
        {featuredImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative h-64 md:h-96 rounded-xl overflow-hidden mb-8"
          >
            <Image
              src={api.getMediaUrl(featuredImage.attributes.url)}
              alt={featuredImage.attributes.alternativeText || attributes.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              priority
            />
          </motion.div>
        )}
      </motion.header>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mb-12"
      >
        <ContentRenderer content={attributes.content} />
      </motion.div>

      {/* Tags */}
      {tags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-12"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/blog?tag=${tag.attributes.slug}`}
                className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                #{tag.attributes.name}
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="border-t border-gray-200 dark:border-gray-700 pt-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            Related Posts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedPosts.map((relatedPost, index) => (
              <PostCard 
                key={relatedPost.id} 
                post={relatedPost} 
                index={index}
              />
            ))}
          </div>
        </motion.section>
      )}

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700"
      >
        <Link
          href="/blog"
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Blog
        </Link>
      </motion.div>
    </article>
  );
}