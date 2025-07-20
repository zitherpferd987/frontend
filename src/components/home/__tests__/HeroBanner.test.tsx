import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HeroBanner from '../HeroBanner';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  useScroll: () => ({ scrollY: { get: () => 0 } }),
  useTransform: () => ({ get: () => 0 }),
  useSpring: () => ({ get: () => 0 }),
  AnimatePresence: ({ children }: any) => children,
}));

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

// Mock the reduced motion hook
jest.mock('@/hooks/use-reduced-motion', () => ({
  useReducedMotion: () => false,
}));

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: jest.fn(),
  writable: true,
});

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const renderWithQueryClient = (component: React.ReactElement) => {
  const testQueryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={testQueryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('HeroBanner', () => {
  it('renders the main title correctly', () => {
    renderWithQueryClient(<HeroBanner />);
    
    expect(screen.getByText('Creative')).toBeInTheDocument();
    expect(screen.getByText('Animation')).toBeInTheDocument();
    expect(screen.getByText('Studio')).toBeInTheDocument();
  });

  it('renders the subtitle with animated text', () => {
    renderWithQueryClient(<HeroBanner />);
    
    expect(screen.getByText(/Welcome to my creative space/)).toBeInTheDocument();
    expect(screen.getByText('animation meets technology')).toBeInTheDocument();
  });

  it('renders skill tags', () => {
    renderWithQueryClient(<HeroBanner />);
    
    expect(screen.getByText('3D Animation')).toBeInTheDocument();
    expect(screen.getByText('Motion Graphics')).toBeInTheDocument();
    expect(screen.getByText('Digital Art')).toBeInTheDocument();
    expect(screen.getByText('Web Development')).toBeInTheDocument();
  });

  it('renders action buttons with correct links', () => {
    renderWithQueryClient(<HeroBanner />);
    
    const galleryLink = screen.getByRole('link', { name: /view gallery/i });
    const blogLink = screen.getByRole('link', { name: /read blog/i });
    
    expect(galleryLink).toHaveAttribute('href', '/gallery');
    expect(blogLink).toHaveAttribute('href', '/blog');
  });

  it('renders scroll indicator with accessibility features', () => {
    renderWithQueryClient(<HeroBanner />);
    
    const scrollIndicator = screen.getByRole('button', { name: /scroll down to see more content/i });
    expect(scrollIndicator).toBeInTheDocument();
    expect(scrollIndicator).toHaveAttribute('tabIndex', '0');
  });

  it('handles scroll indicator click', () => {
    renderWithQueryClient(<HeroBanner />);
    
    const scrollIndicator = screen.getByRole('button', { name: /scroll down to see more content/i });
    fireEvent.click(scrollIndicator);
    
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  });

  it('handles scroll indicator keyboard navigation', () => {
    renderWithQueryClient(<HeroBanner />);
    
    const scrollIndicator = screen.getByRole('button', { name: /scroll down to see more content/i });
    
    // Test Enter key
    fireEvent.keyDown(scrollIndicator, { key: 'Enter' });
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: window.innerHeight,
      behavior: 'smooth'
    });

    // Test Space key
    fireEvent.keyDown(scrollIndicator, { key: ' ' });
    expect(window.scrollTo).toHaveBeenCalledTimes(2);
  });

  it('renders with proper responsive classes', () => {
    renderWithQueryClient(<HeroBanner />);
    
    const title = screen.getByText('Creative');
    expect(title.parentElement).toHaveClass('text-4xl', 'sm:text-5xl', 'md:text-6xl', 'lg:text-7xl', 'xl:text-8xl');
  });
});