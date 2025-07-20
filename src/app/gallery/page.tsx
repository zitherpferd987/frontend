import { Metadata } from 'next';
import { generateMetadata as genMeta } from '@/lib/utils';
import { WorkGrid } from '@/components/gallery';

// Enable ISR for gallery page
export const revalidate = 3600; // Revalidate every hour

export const metadata: Metadata = genMeta({
  title: 'Gallery',
  description: 'Explore my animation works, digital art, and creative projects. Each piece represents a journey of creativity and technical skill.',
});

interface GalleryPageProps {
  searchParams: Promise<{
    category?: string;
    tag?: string;
  }>;
}

export default async function GalleryPage({ searchParams }: GalleryPageProps) {
  const params = await searchParams;
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Gallery
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Explore my animation works, digital art, and creative projects. 
              Each piece represents a journey of creativity and technical skill.
            </p>
          </header>

          {/* Gallery Grid */}
          <WorkGrid 
            showFilters={true}
            columns={3}
            className="mt-8"
          />
        </div>
      </div>
    </div>
  );
}