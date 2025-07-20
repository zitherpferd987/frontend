import { Metadata } from 'next';
import { Suspense } from 'react';
import { generateMetadata as genMeta } from '@/lib/utils';
import { PostList } from '@/components/blog';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// Enable ISR for blog list page
export const revalidate = 1800; // Revalidate every 30 minutes

export const metadata: Metadata = genMeta({
  title: 'Blog',
  description: 'Explore technical articles, tutorials, and insights about animation and digital art.',
});

interface BlogPageProps {
  searchParams: Promise<{
    category?: string;
    tag?: string;
    search?: string;
  }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Blog
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Explore technical articles, tutorials, and insights about animation and digital art.
            </p>
          </header>

          <Suspense 
            fallback={
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            }
          >
            <PostList 
              initialCategory={params.category}
              initialTag={params.tag}
              initialSearch={params.search}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}