import { api } from './api';
import { BlogPost, GalleryWork, Category, Tag, APIResponse } from '@/types';

// Blog Post Queries
export const blogQueries = {
  // Get all blog posts
  getAll: async (params?: {
    page?: number;
    pageSize?: number;
    category?: string;
    tag?: string;
    featured?: boolean;
    search?: string;
  }) => {
    const filters: any = {};
    
    if (params?.category) {
      filters.category = { slug: { $eq: params.category } };
    }
    
    if (params?.tag) {
      filters.tags = { slug: { $eq: params.tag } };
    }
    
    if (params?.featured !== undefined) {
      filters.featured = { $eq: params.featured };
    }
    
    if (params?.search) {
      filters.$or = [
        { title: { $containsi: params.search } },
        { excerpt: { $containsi: params.search } },
        { content: { $containsi: params.search } },
      ];
    }

    return api.get<BlogPost[]>('/blog-posts', {
      populate: ['featuredImage', 'category', 'tags'],
      filters,
      sort: ['publishedAt:desc'],
      pagination: {
        page: params?.page || 1,
        pageSize: params?.pageSize || 10,
      },
    });
  },

  // Get single blog post by slug
  getBySlug: async (slug: string) => {
    return api.get<BlogPost[]>('/blog-posts', {
      populate: ['featuredImage', 'category', 'tags', 'seo'],
      filters: {
        slug: { $eq: slug },
      },
    });
  },

  // Get featured blog posts
  getFeatured: async (limit: number = 3) => {
    return api.get<BlogPost[]>('/blog-posts', {
      populate: ['featuredImage', 'category'],
      filters: {
        featured: { $eq: true },
      },
      sort: ['publishedAt:desc'],
      pagination: {
        pageSize: limit,
      },
    });
  },

  // Get recent blog posts
  getRecent: async (limit: number = 5) => {
    return api.get<BlogPost[]>('/blog-posts', {
      populate: ['featuredImage', 'category'],
      sort: ['publishedAt:desc'],
      pagination: {
        pageSize: limit,
      },
    });
  },

  // Get related posts
  getRelated: async (postId: number, categoryId?: number, limit: number = 3) => {
    const filters: any = {
      id: { $ne: postId },
    };
    
    if (categoryId) {
      filters.category = { id: { $eq: categoryId } };
    }

    return api.get<BlogPost[]>('/blog-posts', {
      populate: ['featuredImage', 'category'],
      filters,
      sort: ['publishedAt:desc'],
      pagination: {
        pageSize: limit,
      },
    });
  },
};

// Gallery Work Queries
export const galleryQueries = {
  // Get all gallery works
  getAll: async (params?: {
    page?: number;
    pageSize?: number;
    category?: string;
    tag?: string;
    featured?: boolean;
  }) => {
    const filters: any = {};
    
    if (params?.category) {
      filters.category = { slug: { $eq: params.category } };
    }
    
    if (params?.tag) {
      filters.tags = { slug: { $eq: params.tag } };
    }
    
    if (params?.featured !== undefined) {
      filters.featured = { $eq: params.featured };
    }

    return api.get<GalleryWork[]>('/gallery-works', {
      populate: ['media', 'category', 'tags'],
      filters,
      sort: ['createdAt:desc'],
      pagination: {
        page: params?.page || 1,
        pageSize: params?.pageSize || 12,
      },
    });
  },

  // Get single gallery work
  getById: async (id: number) => {
    return api.get<GalleryWork>(`/gallery-works/${id}`, {
      populate: ['media', 'category', 'tags'],
    });
  },

  // Get featured gallery works
  getFeatured: async (limit: number = 6) => {
    return api.get<GalleryWork[]>('/gallery-works', {
      populate: ['media', 'category'],
      filters: {
        featured: { $eq: true },
      },
      sort: ['createdAt:desc'],
      pagination: {
        pageSize: limit,
      },
    });
  },

  // Get recent gallery works
  getRecent: async (limit: number = 8) => {
    return api.get<GalleryWork[]>('/gallery-works', {
      populate: ['media', 'category'],
      sort: ['createdAt:desc'],
      pagination: {
        pageSize: limit,
      },
    });
  },
};

// Category Queries
export const categoryQueries = {
  // Get all categories
  getAll: async () => {
    return api.get<Category[]>('/categories', {
      sort: ['name:asc'],
    });
  },

  // Get category by slug
  getBySlug: async (slug: string) => {
    return api.get<Category[]>('/categories', {
      filters: {
        slug: { $eq: slug },
      },
    });
  },
};

// Tag Queries
export const tagQueries = {
  // Get all tags
  getAll: async () => {
    return api.get<Tag[]>('/tags', {
      sort: ['name:asc'],
    });
  },

  // Get popular tags
  getPopular: async (limit: number = 20) => {
    return api.get<Tag[]>('/tags', {
      sort: ['name:asc'],
      pagination: {
        pageSize: limit,
      },
    });
  },
};

// Search Queries
export const searchQueries = {
  // Global search
  search: async (query: string, type?: 'posts' | 'works') => {
    if (type === 'posts') {
      return blogQueries.getAll({ search: query });
    } else if (type === 'works') {
      // For gallery works, we'll search in title and description
      return api.get<GalleryWork[]>('/gallery-works', {
        populate: ['media', 'category'],
        filters: {
          $or: [
            { title: { $containsi: query } },
            { description: { $containsi: query } },
          ],
        },
        sort: ['createdAt:desc'],
      });
    } else {
      // Search both posts and works
      const [posts, works] = await Promise.all([
        blogQueries.getAll({ search: query }),
        api.get<GalleryWork[]>('/gallery-works', {
          populate: ['media', 'category'],
          filters: {
            $or: [
              { title: { $containsi: query } },
              { description: { $containsi: query } },
            ],
          },
          sort: ['createdAt:desc'],
        }),
      ]);
      
      return { posts, works };
    }
  },
};