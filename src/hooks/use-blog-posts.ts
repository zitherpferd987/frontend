import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { blogQueries } from '@/lib/queries';
import { BlogPost } from '@/types';

// Hook for getting all blog posts with pagination
export function useBlogPosts(params?: {
  page?: number;
  pageSize?: number;
  category?: string;
  tag?: string;
  featured?: boolean;
  search?: string;
}) {
  return useQuery({
    queryKey: ['blog-posts', params],
    queryFn: () => blogQueries.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for infinite scroll blog posts
export function useInfiniteBlogPosts(params?: {
  pageSize?: number;
  category?: string;
  tag?: string;
  featured?: boolean;
  search?: string;
}) {
  return useInfiniteQuery({
    queryKey: ['blog-posts-infinite', params],
    queryFn: ({ pageParam = 1 }) =>
      blogQueries.getAll({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      const { pagination } = lastPage.meta || {};
      if (pagination && pagination.page < pagination.pageCount) {
        return pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for getting a single blog post by slug
export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      const response = await blogQueries.getBySlug(slug);
      return response.data[0] || null;
    },
    enabled: !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for getting featured blog posts
export function useFeaturedBlogPosts(limit: number = 3) {
  return useQuery({
    queryKey: ['featured-blog-posts', limit],
    queryFn: () => blogQueries.getFeatured(limit),
    staleTime: 10 * 60 * 1000,
  });
}

// Hook for getting recent blog posts
export function useRecentBlogPosts(limit: number = 5) {
  return useQuery({
    queryKey: ['recent-blog-posts', limit],
    queryFn: () => blogQueries.getRecent(limit),
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for getting related blog posts
export function useRelatedBlogPosts(
  postId: number,
  categoryId?: number,
  limit: number = 3
) {
  return useQuery({
    queryKey: ['related-blog-posts', postId, categoryId, limit],
    queryFn: () => blogQueries.getRelated(postId, categoryId, limit),
    enabled: !!postId,
    staleTime: 10 * 60 * 1000,
  });
}