import dynamic from 'next/dynamic';
import { ComponentType, ReactElement } from 'react';

// Lazy load components with loading states
export const LazyHeroBanner = dynamic(
  () => import('@/components/home/HeroBanner'),
  {
    loading: () => (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="animate-pulse text-white text-xl">Loading...</div>
      </div>
    ),
    ssr: true,
  }
);

export const LazyWorkGrid = dynamic(
  () => import('@/components/gallery/WorkGrid').then(mod => ({ default: mod.WorkGrid })),
  {
    loading: () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded-lg" />
        ))}
      </div>
    ),
  }
);

export const LazyPostList = dynamic(
  () => import('@/components/blog/PostList').then(mod => ({ default: mod.PostList })),
  {
    loading: () => (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-lg" />
        ))}
      </div>
    ),
  }
);

export const LazyWorkModal = dynamic(
  () => import('@/components/gallery/WorkModal').then(mod => ({ default: mod.WorkModal })),
  {
    loading: () => (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg animate-pulse">
          <div className="w-96 h-64 bg-gray-200 rounded" />
        </div>
      </div>
    ),
  }
);

export const LazyMediaViewer = dynamic(
  () => import('@/components/gallery/MediaViewer').then(mod => ({ default: mod.MediaViewer })),
  {
    loading: () => (
      <div className="w-full h-64 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Loading media...</div>
      </div>
    ),
  }
);

export const LazyCodeBlock = dynamic(
  () => import('@/components/blog/CodeBlock').then(mod => ({ default: mod.CodeBlock })),
  {
    loading: () => (
      <div className="bg-gray-900 text-white p-4 rounded-lg animate-pulse">
        <div className="h-4 bg-gray-700 rounded mb-2" />
        <div className="h-4 bg-gray-700 rounded mb-2 w-3/4" />
        <div className="h-4 bg-gray-700 rounded w-1/2" />
      </div>
    ),
  }
);

// Higher-order component for lazy loading with intersection observer
export function withLazyLoading<T extends object>(
  Component: ComponentType<T>,
  fallback?: () => ReactElement
) {
  return dynamic(() => Promise.resolve(Component), {
    loading: fallback || (() => <div className="animate-pulse bg-gray-200 h-32 rounded" />),
  });
}

// Route-based code splitting
export const LazyBlogPage = dynamic(() => import('@/app/blog/page'), {
  loading: () => <div className="min-h-screen flex items-center justify-center">Loading blog...</div>,
  ssr: true,
});

export const LazyGalleryPage = dynamic(() => import('@/app/gallery/page'), {
  loading: () => <div className="min-h-screen flex items-center justify-center">Loading gallery...</div>,
  ssr: true,
});

// Analytics components (loaded only when needed)
export const LazyPerformanceAnalytics = dynamic(
  () => import('@/components/common/PerformanceAnalytics'),
  {
    loading: () => null,
  }
);

// Chart components for analytics (would need react-chartjs-2 installed)
// export const LazyChart = dynamic(
//   () => import('react-chartjs-2').then(mod => ({ default: mod.Line })),
//   {
//     loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded" />,
//   }
// );