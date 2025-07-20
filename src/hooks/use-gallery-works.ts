import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { galleryQueries } from '@/lib/queries';
import { GalleryWork } from '@/types';

// Hook for getting all gallery works with pagination
export function useGalleryWorks(params?: {
  page?: number;
  pageSize?: number;
  category?: string;
  tag?: string;
  featured?: boolean;
}) {
  return useQuery({
    queryKey: ['gallery-works', params],
    queryFn: () => galleryQueries.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for infinite scroll gallery works
export function useInfiniteGalleryWorks(params?: {
  pageSize?: number;
  category?: string;
  tag?: string;
  featured?: boolean;
}) {
  return useInfiniteQuery({
    queryKey: ['gallery-works-infinite', params],
    queryFn: ({ pageParam = 1 }) =>
      galleryQueries.getAll({ ...params, page: pageParam }),
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

// Hook for getting a single gallery work by ID
export function useGalleryWork(id: number) {
  return useQuery({
    queryKey: ['gallery-work', id],
    queryFn: async () => {
      const response = await galleryQueries.getById(id);
      return response.data;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for getting featured gallery works
export function useFeaturedGalleryWorks(limit: number = 6) {
  return useQuery({
    queryKey: ['featured-gallery-works', limit],
    queryFn: () => galleryQueries.getFeatured(limit),
    staleTime: 10 * 60 * 1000,
  });
}

// Hook for getting recent gallery works
export function useRecentGalleryWorks(limit: number = 8) {
  return useQuery({
    queryKey: ['recent-gallery-works', limit],
    queryFn: () => galleryQueries.getRecent(limit),
    staleTime: 5 * 60 * 1000,
  });
}