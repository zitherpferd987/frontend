import { generateMetadata } from '@/components/common';
import { Layout } from '@/components/common';
import { HeroBanner, AboutSection } from '@/components/home';
import PerformanceAnalytics from '@/components/common/PerformanceAnalytics';
import { Metadata } from 'next';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Lazy load non-critical components (remove ssr: false for server components)
const RecentWorks = dynamic(() => import('@/components/home/RecentWorks'), {
  loading: () => (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  ),
});

const FeaturedPosts = dynamic(() => import('@/components/home/FeaturedPosts'), {
  loading: () => (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  ),
});

// Enable ISR for home page
export const revalidate = 1800; // Revalidate every 30 minutes for better performance

export const metadata: Metadata = generateMetadata({
  title: 'Home',
  description: 'Welcome to my creative space - exploring animation, digital art, and technical insights.',
});

export default function Home() {
  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Critical above-the-fold content loads immediately */}
        <HeroBanner />
        
        {/* Non-critical content loads lazily */}
        <Suspense fallback={
          <div className="py-16">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        }>
          <RecentWorks />
        </Suspense>
        
        <Suspense fallback={
          <div className="py-16">
            <div className="container mx-auto px-4">
              <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        }>
          <FeaturedPosts />
        </Suspense>
        
        <AboutSection />
        <PerformanceAnalytics pageName="home" />
      </div>
    </Layout>
  );
}