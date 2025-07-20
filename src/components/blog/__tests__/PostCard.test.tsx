import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PostCard } from '../PostCard';
import { BlogPost } from '@/types';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    article: ({ children, ...props }: any) => <article {...props}>{children}</article>,
  },
}));

// Mock Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

// Mock Next.js Link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

const mockPost: BlogPost = {
  id: 1,
  attributes: {
    title: 'Test Blog Post',
    slug: 'test-blog-post',
    content: 'This is a test blog post content with some text to test reading time calculation.',
    excerpt: 'This is a test excerpt',
    publishedAt: '2024-01-01T00:00:00.000Z',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    viewCount: 100,
    featured: true,
    featuredImage: {
      data: {
        id: 1,
        attributes: {
          name: 'test-image.jpg',
          alternativeText: 'Test image',
          caption: null,
          width: 800,
          height: 600,
          formats: {},
          hash: 'test_hash',
          ext: '.jpg',
          mime: 'image/jpeg',
          size: 100,
          url: '/uploads/test-image.jpg',
          previewUrl: null,
          provider: 'local',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      },
    },
    category: {
      data: {
        id: 1,
        attributes: {
          name: 'Technology',
          slug: 'technology',
          description: 'Tech posts',
          color: '#3B82F6',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      },
    },
    tags: {
      data: [
        {
          id: 1,
          attributes: {
            name: 'React',
            slug: 'react',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        },
        {
          id: 2,
          attributes: {
            name: 'TypeScript',
            slug: 'typescript',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        },
      ],
    },
  },
};

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('PostCard', () => {
  it('renders post information correctly', () => {
    renderWithQueryClient(<PostCard post={mockPost} />);

    expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
    expect(screen.getByText('This is a test excerpt')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('Featured')).toBeInTheDocument();
    expect(screen.getByText('#React')).toBeInTheDocument();
    expect(screen.getByText('#TypeScript')).toBeInTheDocument();
    expect(screen.getByText('100 views')).toBeInTheDocument();
  });

  it('renders without featured image', () => {
    const postWithoutImage = {
      ...mockPost,
      attributes: {
        ...mockPost.attributes,
        featuredImage: { data: null },
      },
    };

    renderWithQueryClient(<PostCard post={postWithoutImage} />);

    expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
    // Should render the fallback gradient background with first letter
    expect(screen.getByText('T')).toBeInTheDocument();
  });

  it('renders without category', () => {
    const postWithoutCategory = {
      ...mockPost,
      attributes: {
        ...mockPost.attributes,
        category: { data: null },
      },
    };

    renderWithQueryClient(<PostCard post={postWithoutCategory} />);

    expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
    expect(screen.queryByText('Technology')).not.toBeInTheDocument();
  });

  it('links to the correct blog post URL', () => {
    renderWithQueryClient(<PostCard post={mockPost} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/blog/test-blog-post');
  });
});