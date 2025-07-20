import { useQuery } from '@tanstack/react-query';
import { categoryQueries } from '@/lib/queries';

// Hook for getting all categories
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryQueries.getAll(),
    staleTime: 30 * 60 * 1000, // 30 minutes - categories don't change often
  });
}

// Hook for getting a single category by slug
export function useCategory(slug: string) {
  return useQuery({
    queryKey: ['category', slug],
    queryFn: async () => {
      const response = await categoryQueries.getBySlug(slug);
      return response.data[0] || null;
    },
    enabled: !!slug,
    staleTime: 30 * 60 * 1000,
  });
}