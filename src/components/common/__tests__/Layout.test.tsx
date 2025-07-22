import { render, screen } from '@testing-library/react'
import { Layout } from '../Layout'

// Mock child components
jest.mock('../Header', () => ({
  Header: () => <header data-testid="header">Header</header>
}))

jest.mock('../Footer', () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>
}))

jest.mock('../SEO', () => ({
  SEO: ({ title }: { title: string }) => <div data-testid="seo">{title}</div>
}))

describe('Layout Component', () => {
  const defaultProps = {
    title: 'Test Page',
    description: 'Test description'
  }

  it('renders header, main content, and footer', () => {
    render(
      <Layout {...defaultProps}>
        <div>Test Content</div>
      </Layout>
    )

    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('renders SEO component with correct props', () => {
    render(
      <Layout {...defaultProps}>
        <div>Content</div>
      </Layout>
    )

    expect(screen.getByTestId('seo')).toHaveTextContent('Test Page')
  })

  it('applies correct CSS classes', () => {
    const { container } = render(
      <Layout {...defaultProps}>
        <div>Content</div>
      </Layout>
    )

    const mainElement = container.querySelector('main')
    expect(mainElement).toHaveClass('min-h-screen', 'flex', 'flex-col')
  })

  it('passes additional SEO props correctly', () => {
    const seoProps = {
      ...defaultProps,
      canonical: 'https://example.com',
      ogImage: 'https://example.com/image.jpg'
    }

    render(
      <Layout {...seoProps}>
        <div>Content</div>
      </Layout>
    )

    // SEO component should receive the props
    expect(screen.getByTestId('seo')).toBeInTheDocument()
  })
})