import { render } from '@testing-library/react'
import { SEO } from '../SEO'

// Mock Next.js Head component
jest.mock('next/head', () => {
  return function Head({ children }: { children: React.ReactNode }) {
    return <div data-testid="head">{children}</div>
  }
})

describe('SEO Component', () => {
  const defaultProps = {
    title: 'Test Title',
    description: 'Test description',
    canonical: 'https://example.com/test'
  }

  it('renders basic meta tags correctly', () => {
    const { container } = render(<SEO {...defaultProps} />)
    
    expect(container.querySelector('title')).toHaveTextContent('Test Title')
    expect(container.querySelector('meta[name="description"]')).toHaveAttribute(
      'content',
      'Test description'
    )
    expect(container.querySelector('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://example.com/test'
    )
  })

  it('renders Open Graph meta tags', () => {
    const props = {
      ...defaultProps,
      ogImage: 'https://example.com/image.jpg',
      ogType: 'article' as const
    }
    
    const { container } = render(<SEO {...props} />)
    
    expect(container.querySelector('meta[property="og:title"]')).toHaveAttribute(
      'content',
      'Test Title'
    )
    expect(container.querySelector('meta[property="og:description"]')).toHaveAttribute(
      'content',
      'Test description'
    )
    expect(container.querySelector('meta[property="og:image"]')).toHaveAttribute(
      'content',
      'https://example.com/image.jpg'
    )
    expect(container.querySelector('meta[property="og:type"]')).toHaveAttribute(
      'content',
      'article'
    )
  })

  it('renders Twitter Card meta tags', () => {
    const props = {
      ...defaultProps,
      twitterCard: 'summary_large_image' as const,
      twitterSite: '@example'
    }
    
    const { container } = render(<SEO {...props} />)
    
    expect(container.querySelector('meta[name="twitter:card"]')).toHaveAttribute(
      'content',
      'summary_large_image'
    )
    expect(container.querySelector('meta[name="twitter:site"]')).toHaveAttribute(
      'content',
      '@example'
    )
  })

  it('renders structured data when provided', () => {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Test Article'
    }
    
    const props = {
      ...defaultProps,
      structuredData
    }
    
    const { container } = render(<SEO {...props} />)
    
    const scriptTag = container.querySelector('script[type="application/ld+json"]')
    expect(scriptTag).toBeInTheDocument()
    expect(scriptTag?.textContent).toBe(JSON.stringify(structuredData))
  })

  it('handles missing optional props gracefully', () => {
    const minimalProps = {
      title: 'Minimal Title'
    }
    
    expect(() => render(<SEO {...minimalProps} />)).not.toThrow()
  })
})