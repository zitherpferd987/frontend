import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { blogQueries } from '@/lib/queries';
import { generateMetadata as genMeta } from '@/lib/utils';
import { PostDetail } from '@/components/blog';
import { api } from '@/lib/api';

// Enable static generation for blog posts
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const response = await blogQueries.getBySlug(slug);
    const post = response.data[0];
    
    if (!post) {
      return genMeta({
        title: 'Post Not Found',
        description: 'The requested blog post could not be found.',
      });
    }

    const { attributes } = post;
    const featuredImage = attributes.featuredImage?.data;
    
    return genMeta({
      title: attributes.title,
      description: attributes.excerpt || attributes.content.substring(0, 160) + '...',
      image: featuredImage ? api.getMediaUrl(featuredImage.attributes.url) : undefined,
      url: `/blog/${slug}`,
      type: 'article',
    });
  } catch (error) {
    console.error('Error generating metadata:', error);
    return genMeta({
      title: 'Blog Post',
      description: 'Read this blog post about animation and digital art.',
    });
  }
}

// Generate static params for all blog posts
export async function generateStaticParams() {
  // Return empty array during build to avoid API calls
  // Static generation will happen at runtime with ISR
  return [];
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  try {
    const { slug } = await params;
    const response = await blogQueries.getBySlug(slug);
    const post = response.data[0];
    
    if (!post) {
      notFound();
    }

    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <PostDetail post={post} />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading blog post:', error);
    notFound();
  }
}