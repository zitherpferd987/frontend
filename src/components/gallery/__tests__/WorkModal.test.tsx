import { render, screen, fireEvent } from '@testing-library/react'
import { WorkModal } from '../WorkModal'

// Mock the MediaViewer component
jest.mock('../MediaViewer', () => ({
  MediaViewer: ({ media }: { media: any }) => (
    <div data-testid="media-viewer">{media.alternativeText}</div>
  )
}))

const mockWork = {
  id: 1,
  title: 'Test Animation',
  description: 'A test animation project with detailed description',
  media: [
    { url: '/video.mp4', alternativeText: 'Test Video', mime: 'video/mp4' },
    { url: '/image.jpg', alternativeText: 'Test Image', mime: 'image/jpeg' }
  ],
  category: { name: 'Animation', slug: 'animation' },
  tags: [
    { name: 'Motion Graphics', slug: 'motion-graphics' },
    { name: '3D', slug: '3d' }
  ],
  createdAt: '2024-01-01T00:00:00.000Z',
  dimensions: '1920x1080',
  software: ['After Effects', 'Cinema 4D']
}

describe('WorkModal Component', () => {
  const mockOnClose = jest.fn()

  beforeEach(() => {
    mockOnClose.mockClear()
    // Mock document.body.style for scroll lock
    Object.defineProperty(document.body, 'style', {
      writable: true,
      value: { overflow: '' }
    })
  })

  it('renders modal when open', () => {
    render(<WorkModal work={mockWork} isOpen={true} onClose={mockOnClose} />)
    
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Test Animation')).toBeInTheDocument()
    expect(screen.getByText('A test animation project with detailed description')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<WorkModal work={mockWork} isOpen={false} onClose={mockOnClose} />)
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    render(<WorkModal work={mockWork} isOpen={true} onClose={mockOnClose} />)
    
    const closeButton = screen.getByLabelText('Close modal')
    fireEvent.click(closeButton)
    
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when backdrop is clicked', () => {
    render(<WorkModal work={mockWork} isOpen={true} onClose={mockOnClose} />)
    
    const backdrop = screen.getByTestId('modal-backdrop')
    fireEvent.click(backdrop)
    
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when Escape key is pressed', () => {
    render(<WorkModal work={mockWork} isOpen={true} onClose={mockOnClose} />)
    
    fireEvent.keyDown(document, { key: 'Escape' })
    
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('renders media viewer', () => {
    render(<WorkModal work={mockWork} isOpen={true} onClose={mockOnClose} />)
    
    expect(screen.getByTestId('media-viewer')).toBeInTheDocument()
  })

  it('renders work metadata', () => {
    render(<WorkModal work={mockWork} isOpen={true} onClose={mockOnClose} />)
    
    expect(screen.getByText('Animation')).toBeInTheDocument()
    expect(screen.getByText('1920x1080')).toBeInTheDocument()
    expect(screen.getByText('After Effects')).toBeInTheDocument()
    expect(screen.getByText('Cinema 4D')).toBeInTheDocument()
  })

  it('renders tags', () => {
    render(<WorkModal work={mockWork} isOpen={true} onClose={mockOnClose} />)
    
    expect(screen.getByText('Motion Graphics')).toBeInTheDocument()
    expect(screen.getByText('3D')).toBeInTheDocument()
  })

  it('locks body scroll when open', () => {
    render(<WorkModal work={mockWork} isOpen={true} onClose={mockOnClose} />)
    
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('restores body scroll when closed', () => {
    const { rerender } = render(<WorkModal work={mockWork} isOpen={true} onClose={mockOnClose} />)
    
    expect(document.body.style.overflow).toBe('hidden')
    
    rerender(<WorkModal work={mockWork} isOpen={false} onClose={mockOnClose} />)
    
    expect(document.body.style.overflow).toBe('')
  })

  it('handles work without optional fields', () => {
    const minimalWork = {
      id: 1,
      title: 'Minimal Work',
      description: 'Basic description',
      media: [{ url: '/image.jpg', alternativeText: 'Image', mime: 'image/jpeg' }],
      category: { name: 'Design', slug: 'design' },
      tags: [],
      createdAt: '2024-01-01T00:00:00.000Z'
    }
    
    render(<WorkModal work={minimalWork} isOpen={true} onClose={mockOnClose} />)
    
    expect(screen.getByText('Minimal Work')).toBeInTheDocument()
    expect(screen.getByText('Basic description')).toBeInTheDocument()
  })

  it('prevents modal content click from closing modal', () => {
    render(<WorkModal work={mockWork} isOpen={true} onClose={mockOnClose} />)
    
    const modalContent = screen.getByRole('dialog')
    fireEvent.click(modalContent)
    
    expect(mockOnClose).not.toHaveBeenCalled()
  })
})