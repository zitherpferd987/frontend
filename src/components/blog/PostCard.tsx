'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { BlogPost } from '@/types';
import { api } from '@/lib/api';
import { formatDate, calculateReadingTime, truncateText, cn } from '@/lib/utils';
import OptimizedImage, { BlogImage } from '@/components/common/OptimizedImage';
import { useMobileDetection } from '@/hooks/use-mobile-detection';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

interface PostCardProps {
  post: BlogPost;
  index?: number;
}

export function PostCard({ post, index = 0 }: PostCardProps) {
  const { attributes } = post;
  const featuredImage = attributes.featuredImage?.data;
  const category = attributes.category?.data;
  const tags = attributes.tags?.data || [];
  const { isMobile, isTouchDevice } = useMobileDetection();
  const prefersReducedMotion = useReducedMotion();

  const readingTime = calculateReadingTime(attributes.content);
  const excerpt = attributes.excerpt || truncateText(attributes.content, isMobile ? 120 : 150);

  return (
    <motion.article
      initial={{ opacity: 0, y: isMobile ? 15 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: isMobile ? 0.4 : 0.5, 
        delay: prefersReducedMotion ? 0 : index * 0.1 
      }}
      whileHover={{ y: prefersReducedMotion || isTouchDevice ? 0 : -5 }}
      whileTap={{ scale: prefersReducedMotion ? 1 : 0.98 }}
      className={cn(
        "group bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300",
        isTouchDevice && "touch-manipulation"
      )}
    >
      <Link href={`/blog/${attributes.slug}`} className="block">
        {/* Featured Image - Mobile Optimized */}
        <div className={cn(
          "relative overflow-hidden",
          isMobile ? "h-40" : "h-48"
        )}>
          {featuredImage ? (
            <BlogImage
              src={api.getMediaUrl(featuredImage.attributes.url)}
              alt={featuredImage.attributes.alternativeText || attributes.title}
              fill
              className={cn(
                "object-cover transition-transform duration-300",
                !prefersReducedMotion && !isTouchDevice && "group-hover:scale-105"
              )}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              optimization={{
                quality: 85,
                format: 'webp'
              }}
              showSkeleton={true}
              enableLazyLoading={true}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <div className="text-white text-4xl font-bold opacity-50">
                {attributes.title.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
          
          {/* Category Badge - Mobile Optimized */}
          {category && (
            <div className={cn("absolute", isMobile ? "top-3 left-3" : "top-4 left-4")}>
              <span 
                className={cn(
                  "font-semibold text-white rounded-full",
                  isMobile ? "px-2 py-1 text-xs" : "px-3 py-1 text-xs"
                )}
                style={{ backgroundColor: category.attributes.color || '#3B82F6' }}
              >
                {category.attributes.name}
              </span>
            </div>
          )}

          {/* Featured Badge - Mobile Optimized */}
          {attributes.featured && (
            <div className={cn("absolute", isMobile ? "top-3 right-3" : "top-4 right-4")}>
              <span className={cn(
                "font-semibold text-yellow-800 bg-yellow-200 rounded-full",
                isMobile ? "px-2 py-1 text-xs" : "px-2 py-1 text-xs"
              )}>
                Featured
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Meta Info */}
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
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
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {attributes.title}
          </h2>

          {/* Excerpt */}
          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
            {excerpt}
          </p>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.id}
                  className="px-2 py-1 text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  #{tag.attributes.name}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
                  +{tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.article>
  );
}