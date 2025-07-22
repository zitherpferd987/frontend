import { render, screen } from '@testing-library/react'
import { ScrollReveal } from '../ScrollReveal'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  },
  useInView: () => true,
  useAnimation: () => ({
    start: jest.fn()
  })
}))

describe('ScrollReveal Component', () => {
  it('renders children correctly', () => {
    render(
      <ScrollReveal>
        <div>Test Content</div>
      </ScrollReveal>
    )

    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('applies default animation direction', () => {
    const { container } = render(
      <ScrollReveal>
        <div>Content</div>
      </ScrollReveal>
    )

    const wrapper = container.firstChild
    expect(wrapper).toBeInTheDocument()
  })

  it('accepts custom animation direction', () => {
    render(
      <ScrollReveal direction="right">
        <div>Content</div>
      </ScrollReveal>
    )

    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('accepts custom delay', () => {
    render(
      <ScrollReveal delay={0.5}>
        <div>Content</div>
      </ScrollReveal>
    )

    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('accepts custom duration', () => {
    render(
      <ScrollReveal duration={1.0}>
        <div>Content</div>
      </ScrollReveal>
    )

    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('handles multiple children', () => {
    render(
      <ScrollReveal>
        <div>First</div>
        <div>Second</div>
      </ScrollReveal>
    )

    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
  })
})