import { render, screen } from '@testing-library/react'
import { PostList } from '../PostList'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock the PostCard component
jest.mock('../PostCard', () => ({
  PostCard: ({ post }: { post: any }) => (
    <div data-testid="post-card">{post.title}</div>
  )
}))

// Mock the Pagination component
jest.mock('../Pagination', () => ({
  Pagination: ({ currentPage, totalPages }: { currentPage: number; totalPages: number }) => (
    <div data-testid="pagination">{currentPage} of {totalPages}</div>
  )
}))

const mockPosts = [
  {
    id: 1,
    title: 'First Post',
    slug: 'first-post',
    excerpt: 'First post excerpt',
    publishedAt: '2024-01-01',
    featuredImage: null,
    category: { name: 'Tech', slug: 'tech' },
    tags: []
  },
  {
    id: 2,
    title: 'Second Post',
    slug: 'second-post',
    excerpt: 'Second post excerpt',
    publishedAt: '2024-01-02',
    featuredImage: null,
    category: { name: 'Design', slug: 'design' },
    tags: []
  }
]

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('PostList Component', () => {
  it('renders loading state', () => {
    const Wrapper = createWrapper()
    render(
      <Wrapper>
        <PostList posts={[]} loading={true} />
      </Wrapper>
    )

    expect(screen.getByText('Loading posts...')).toBeInTheDocument()
  })

  it('renders empty state when no posts', () => {
    const Wrapper = createWrapper()
    render(
      <Wrapper>
        <PostList posts={[]} loading={false} />
      </Wrapper>
    )

    expect(screen.getByText('No posts found.')).toBeInTheDocument()
  })

  it('renders posts correctly', () => {
    const Wrapper = createWrapper()
    render(
      <Wrapper>
        <PostList posts={mockPosts} loading={false} />
      </Wrapper>
    )

    expect(screen.getByText('First Post')).toBeInTheDocument()
    expect(screen.getByText('Second Post')).toBeInTheDocument()
    expect(screen.getAllByTestId('post-card')).toHaveLength(2)
  })

  it('renders pagination when provided', () => {
    const Wrapper = createWrapper()
    render(
      <Wrapper>
        <PostList 
          posts={mockPosts} 
          loading={false}
          currentPage={1}
          totalPages={3}
        />
      </Wrapper>
    )

    expect(screen.getByTestId('pagination')).toBeInTheDocument()
    expect(screen.getByText('1 of 3')).toBeInTheDocument()
  })

  it('does not render pagination when not provided', () => {
    const Wrapper = createWrapper()
    render(
      <Wrapper>
        <PostList posts={mockPosts} loading={false} />
      </Wrapper>
    )

    expect(screen.queryByTestId('pagination')).not.toBeInTheDocument()
  })

  it('applies correct CSS classes', () => {
    const Wrapper = createWrapper()
    const { container } = render(
      <Wrapper>
        <PostList posts={mockPosts} loading={false} />
      </Wrapper>
    )

    const postGrid = container.querySelector('.grid')
    expect(postGrid).toBeInTheDocument()
    expect(postGrid).toHaveClass('gap-8')
  })
})