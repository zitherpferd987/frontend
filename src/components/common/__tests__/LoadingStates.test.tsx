import { render, screen } from '@testing-library/react'
import { 
  LoadingSpinner, 
  SkeletonCard, 
  SkeletonText, 
  LoadingButton,
  PageLoader 
} from '../LoadingStates'

describe('Loading Components', () => {
  describe('LoadingSpinner', () => {
    it('renders with default size', () => {
      render(<LoadingSpinner />)
      const spinner = screen.getByRole('status')
      expect(spinner).toBeInTheDocument()
      expect(spinner).toHaveClass('w-8', 'h-8')
    })

    it('renders with custom size', () => {
      render(<LoadingSpinner size="lg" />)
      const spinner = screen.getByRole('status')
      expect(spinner).toHaveClass('w-12', 'h-12')
    })

    it('renders with custom color', () => {
      render(<LoadingSpinner color="red" />)
      const spinner = screen.getByRole('status')
      expect(spinner).toHaveClass('text-red-600')
    })

    it('includes accessibility label', () => {
      render(<LoadingSpinner />)
      expect(screen.getByLabelText('Loading...')).toBeInTheDocument()
    })
  })

  describe('SkeletonCard', () => {
    it('renders skeleton card structure', () => {
      render(<SkeletonCard />)
      const card = screen.getByTestId('skeleton-card')
      expect(card).toBeInTheDocument()
      expect(card).toHaveClass('animate-pulse')
    })

    it('renders with image when showImage is true', () => {
      render(<SkeletonCard showImage />)
      expect(screen.getByTestId('skeleton-image')).toBeInTheDocument()
    })

    it('does not render image when showImage is false', () => {
      render(<SkeletonCard showImage={false} />)
      expect(screen.queryByTestId('skeleton-image')).not.toBeInTheDocument()
    })
  })

  describe('SkeletonText', () => {
    it('renders with default lines', () => {
      render(<SkeletonText />)
      const lines = screen.getAllByTestId(/skeleton-line/)
      expect(lines).toHaveLength(3)
    })

    it('renders with custom number of lines', () => {
      render(<SkeletonText lines={5} />)
      const lines = screen.getAllByTestId(/skeleton-line/)
      expect(lines).toHaveLength(5)
    })

    it('applies animation class', () => {
      render(<SkeletonText />)
      const container = screen.getByTestId('skeleton-text')
      expect(container).toHaveClass('animate-pulse')
    })
  })

  describe('LoadingButton', () => {
    it('renders button with loading state', () => {
      render(<LoadingButton loading>Click me</LoadingButton>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('renders normal button when not loading', () => {
      render(<LoadingButton loading={false}>Click me</LoadingButton>)
      const button = screen.getByRole('button')
      expect(button).not.toBeDisabled()
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
      expect(button).toHaveTextContent('Click me')
    })

    it('applies custom className', () => {
      render(<LoadingButton className="custom-class">Button</LoadingButton>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
    })
  })

  describe('PageLoader', () => {
    it('renders full page loader', () => {
      render(<PageLoader />)
      const loader = screen.getByTestId('page-loader')
      expect(loader).toBeInTheDocument()
      expect(loader).toHaveClass('fixed', 'inset-0', 'z-50')
    })

    it('renders with custom message', () => {
      render(<PageLoader message="Loading content..." />)
      expect(screen.getByText('Loading content...')).toBeInTheDocument()
    })

    it('renders with default message', () => {
      render(<PageLoader />)
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
  })
})