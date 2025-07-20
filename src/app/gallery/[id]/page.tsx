import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { galleryQueries } from '@/lib/queries';
import { generateMetadata as genMeta } from '@/lib/utils';
import { api } from '@/lib/api';
import GalleryWorkClient from './client';

// Enable static generation for gallery works
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

interface GalleryWorkPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: GalleryWorkPageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const response = await galleryQueries.getById(parseInt(id));
    const work = response.data;
    
    if (!work) {
      return genMeta({
        title: 'Gallery Work Not Found',
        description: 'The requested gallery work could not be found.',
      });
    }

    const { attributes } = work;
    const featuredImage = attributes.media?.data?.[0];
    
    return genMeta({
      title: attributes.title,
      description: attributes.description || `View ${attributes.title} - A creative work by the animator.`,
      image: featuredImage ? api.getMediaUrl(featuredImage.attributes.url) : undefined,
      url: `/gallery/${id}`,
      type: 'article',
    });
  } catch (error) {
    console.error('Error generating metadata:', error);
    return genMeta({
      title: 'Gallery Work',
      description: 'View this creative work from the gallery.',
    });
  }
}

// Generate static params for all gallery works
export async function generateStaticParams() {
  // Return empty array during build to avoid API calls
  // Static generation will happen at runtime with ISR
  return [];
}

export default async function GalleryWorkPage({ params }: GalleryWorkPageProps) {
  try {
    const { id } = await params;
    const response = await galleryQueries.getById(parseInt(id));
    const work = response.data;
    
    if (!work) {
      notFound();
    }

    return <GalleryWorkClient work={work} />;
  } catch (error) {
    console.error('Error loading gallery work:', error);
    notFound();
  }
}