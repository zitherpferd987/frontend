import { useQuery } from '@tanstack/react-query';
import { searchQueries } from '@/lib/queries';

// Hook for global search
export function useSearch(
  query: string,
  type?: 'posts' | 'works',
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['search', query, type],
    queryFn: () => searchQueries.search(query, type),
    enabled: enabled && !!query && query.length >= 2, // Only search if query is at least 2 characters
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for search suggestions (debounced)
export function useSearchSuggestions(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['search-suggestions', query],
    queryFn: async () => {
      if (!query || query.length < 2) return { posts: [], works: [] };
      
      // Get limited results for suggestions
      const [postsResult, worksResult] = await Promise.all([
        searchQueries.search(query, 'posts'),
        searchQueries.search(query, 'works'),
      ]);
      
      // Handle the different return types from search
      const posts = 'data' in postsResult ? postsResult.data : [];
      const works = 'data' in worksResult ? worksResult.data : [];
      
      return {
        posts: posts?.slice(0, 3) || [],
        works: works?.slice(0, 3) || [],
      };
    },
    enabled: enabled && !!query && query.length >= 2,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
}