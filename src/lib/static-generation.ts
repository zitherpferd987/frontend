import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { blogQueries, galleryQueries } from '@/lib/queries';

// Static generation configuration
export const revalidate = 3600; // Revalidate every hour
export const dynamicParams = true; // Allow dynamic params not generated at build time

// Generate static params for blog posts
export async function generateBlogPostParams() {
  try {
    const posts = await blogQueries.getAll({ 
      page: 1,
      pageSize: 100
    });
    
    return posts.data.map((post) => ({
      slug: post.attributes.slug,
    }));
  } catch (error) {
    console.error('Error generating blog post params:', error);
    return [];
  }
}

// Generate static params for gallery works
export async function generateGalleryWorkParams() {
  try {
    const works = await galleryQueries.getAll({ 
      page: 1,
      pageSize: 100
    });
    
    return works.data.map((work) => ({
      id: work.id.toString(),
    }));
  } catch (error) {
    console.error('Error generating gallery work params:', error);
    return [];
  }
}

// Generate metadata for blog posts
export async function generateBlogPostMetadata(slug: string): Promise<Metadata> {
  try {
    const response = await blogQueries.getBySlug(slug);
    const post = response.data[0];
    
    if (!post) {
      return {
        title: 'Post Not Found',
        description: 'The requested blog post could not be found.',
      };
    }

    const { title, excerpt, featuredImage, publishedAt } = post.attributes;
    const imageUrl = featuredImage?.data?.attributes?.url;
    const fullImageUrl = imageUrl ? `${process.env.NEXT_PUBLIC_STRAPI_URL}${imageUrl}` : null;

    return {
      title,
      description: excerpt || `Read ${title} on Animator Blog`,
      openGraph: {
        title,
        description: excerpt || `Read ${title} on Animator Blog`,
        type: 'article',
        publishedTime: publishedAt,
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${slug}`,
        images: fullImageUrl ? [
          {
            url: fullImageUrl,
            width: 1200,
            height: 630,
            alt: title,
          }
        ] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description: excerpt || `Read ${title} on Animator Blog`,
        images: fullImageUrl ? [fullImageUrl] : [],
      },
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${slug}`,
      },
    };
  } catch (error) {
    console.error('Error generating blog post metadata:', error);
    return {
      title: 'Blog Post',
      description: 'Read the latest blog post on Animator Blog',
    };
  }
}

// Generate metadata for gallery works
export async function generateGalleryWorkMetadata(id: string): Promise<Metadata> {
  try {
    const response = await galleryQueries.getById(parseInt(id));
    const work = response.data;
    
    if (!work) {
      return {
        title: 'Work Not Found',
        description: 'The requested gallery work could not be found.',
      };
    }

    const { title, description, media } = work.attributes;
    const firstImage = media?.data?.[0]?.attributes;
    const imageUrl = firstImage?.url;
    const fullImageUrl = imageUrl ? `${process.env.NEXT_PUBLIC_STRAPI_URL}${imageUrl}` : null;

    return {
      title: `${title} - Gallery`,
      description: description || `View ${title} in the gallery`,
      openGraph: {
        title: `${title} - Gallery`,
        description: description || `View ${title} in the gallery`,
        type: 'article',
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/gallery/${id}`,
        images: fullImageUrl ? [
          {
            url: fullImageUrl,
            width: firstImage?.width || 1200,
            height: firstImage?.height || 630,
            alt: title,
          }
        ] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} - Gallery`,
        description: description || `View ${title} in the gallery`,
        images: fullImageUrl ? [fullImageUrl] : [],
      },
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/gallery/${id}`,
      },
    };
  } catch (error) {
    console.error('Error generating gallery work metadata:', error);
    return {
      title: 'Gallery Work',
      description: 'View the latest work in the gallery',
    };
  }
}

// ISR (Incremental Static Regeneration) configuration
export const ISR_CONFIG = {
  // Revalidate blog posts every hour
  blogPosts: {
    revalidate: 3600,
    tags: ['blog-posts'],
  },
  // Revalidate gallery works every 2 hours
  galleryWorks: {
    revalidate: 7200,
    tags: ['gallery-works'],
  },
  // Revalidate home page every 30 minutes
  homePage: {
    revalidate: 1800,
    tags: ['home-page', 'featured-content'],
  },
};

// Static generation helpers
export async function getStaticBlogPost(slug: string) {
  try {
    const response = await blogQueries.getBySlug(slug);
    const post = response.data[0];
    
    if (!post) {
      notFound();
    }

    return {
      post,
      revalidate: ISR_CONFIG.blogPosts.revalidate,
    };
  } catch (error) {
    console.error('Error fetching static blog post:', error);
    notFound();
  }
}

export async function getStaticGalleryWork(id: string) {
  try {
    const response = await galleryQueries.getById(parseInt(id));
    const work = response.data;
    
    if (!work) {
      notFound();
    }

    return {
      work,
      revalidate: ISR_CONFIG.galleryWorks.revalidate,
    };
  } catch (error) {
    console.error('Error fetching static gallery work:', error);
    notFound();
  }
}

// Pre-render critical pages
export const STATIC_PAGES = [
  '/',
  '/blog',
  '/gallery',
  '/about',
] as const;

// Dynamic route configurations
export const DYNAMIC_ROUTES = {
  '/blog/[slug]': {
    generateStaticParams: generateBlogPostParams,
    generateMetadata: generateBlogPostMetadata,
    revalidate: ISR_CONFIG.blogPosts.revalidate,
  },
  '/gallery/[id]': {
    generateStaticParams: generateGalleryWorkParams,
    generateMetadata: generateGalleryWorkMetadata,
    revalidate: ISR_CONFIG.galleryWorks.revalidate,
  },
} as const;