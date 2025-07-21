// API Response Types
export interface APIResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// Media Types
export interface Media {
  id: number;
  attributes: {
    name: string;
    alternativeText?: string;
    caption?: string;
    width: number;
    height: number;
    formats?: {
      thumbnail?: MediaFormat;
      small?: MediaFormat;
      medium?: MediaFormat;
      large?: MediaFormat;
    };
    hash: string;
    ext: string;
    mime: string;
    size: number;
    url: string;
    previewUrl?: string;
    provider: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface MediaFormat {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  width: number;
  height: number;
  size: number;
  url: string;
}

// Category Types
export interface Category {
  id: number;
  attributes: {
    name: string;
    slug: string;
    description?: string;
    color?: string;
    createdAt: string;
    updatedAt: string;
  };
}

// Tag Types
export interface Tag {
  id: number;
  attributes: {
    name: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
  };
}

// Blog Post Types
export interface BlogPost {
  id: number;
  attributes: {
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    publishedAt: string;
    createdAt: string;
    updatedAt: string;
    viewCount?: number;
    featured?: boolean;
    featuredImage?: {
      data: Media | null;
    };
    category?: {
      data: Category | null;
    };
    tags?: {
      data: Tag[];
    };
    seo?: SEOComponent;
  };
}

// Gallery Work Types
export interface GalleryWork {
  id: number;
  attributes: {
    title: string;
    description?: string;
    featured: boolean;
    dimensions?: string;
    softwareUsed?: string[];
    createdAt: string;
    updatedAt: string;
    media: {
      data: Media[];
    };
    category?: {
      data: Category | null;
    };
    tags?: {
      data: Tag[];
    };
  };
}

// SEO Component Type
export interface SEOComponent {
  id: number;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  metaRobots?: string;
  structuredData?: any;
  metaViewport?: string;
  canonicalURL?: string;
  metaImage?: {
    data: Media | null;
  };
}

// API Query Parameters
export interface QueryParams {
  populate?: string | string[];
  filters?: Record<string, any>;
  sort?: string | string[];
  pagination?: {
    page?: number;
    pageSize?: number;
    start?: number;
    limit?: number;
  };
  fields?: string[];
  locale?: string;
}

// Component Props Types
export interface PageProps {
  params: Promise<{ [key: string]: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Navigation Types
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  description?: string;
  children?: NavItem[];
}

// Form Types
export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Animation Types
export interface AnimationConfig {
  initial?: any;
  animate?: any;
  exit?: any;
  transition?: any;
}

// Error Types
export interface APIError {
  status: number;
  name: string;
  message: string;
  details?: any;
}