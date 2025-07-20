import { MetadataRoute } from 'next';
import { blogQueries, galleryQueries } from '@/lib/queries';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  try {
    // Dynamic blog post pages
    const blogPosts = await blogQueries.getAll({ 
      page: 1,
      pageSize: 100
    });

    const blogPages: MetadataRoute.Sitemap = blogPosts.data.map((post) => ({
      url: `${baseUrl}/blog/${post.attributes.slug}`,
      lastModified: new Date(post.attributes.updatedAt || post.attributes.publishedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    // Dynamic gallery work pages
    const galleryWorks = await galleryQueries.getAll({ 
      page: 1,
      pageSize: 100
    });

    const galleryPages: MetadataRoute.Sitemap = galleryWorks.data.map((work) => ({
      url: `${baseUrl}/gallery/${work.id}`,
      lastModified: new Date(work.attributes.updatedAt || work.attributes.createdAt),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));

    return [...staticPages, ...blogPages, ...galleryPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return static pages only if API fails
    return staticPages;
  }
}