import { render, screen } from '@testing-library/react'
import { WorkGrid } from '../WorkGrid'

// Mock the WorkCard component
jest.mock('../WorkCard', () => ({
  WorkCard: ({ work }: { work: any }) => (
    <div data-testid="work-card">{work.title}</div>
  )
}))

const mockWorks = [
  {
    id: 1,
    title: 'Animation Project 1',
    description: 'First animation project',
    media: [{ url: '/image1.jpg', alternativeText: 'Image 1' }],
    category: { name: 'Animation', slug: 'animation' },
    tags: []
  },
  {
    id: 2,
    title: 'Design Project 1',
    description: 'First design project',
    media: [{ url: '/image2.jpg', alternativeText: 'Image 2' }],
    category: { name: 'Design', slug: 'design' },
    tags: []
  },
  {
    id: 3,
    title: 'Animation Project 2',
    description: 'Second animation project',
    media: [{ url: '/image3.jpg', alternativeText: 'Image 3' }],
    category: { name: 'Animation', slug: 'animation' },
    tags: []
  }
]

describe('WorkGrid Component', () => {
  it('renders loading state', () => {
    render(<WorkGrid works={[]} loading={true} />)
    expect(screen.getByText('Loading works...')).toBeInTheDocument()
  })

  it('renders empty state when no works', () => {
    render(<WorkGrid works={[]} loading={false} />)
    expect(screen.getByText('No works found.')).toBeInTheDocument()
  })

  it('renders works correctly', () => {
    render(<WorkGrid works={mockWorks} loading={false} />)
    
    expect(screen.getByText('Animation Project 1')).toBeInTheDocument()
    expect(screen.getByText('Design Project 1')).toBeInTheDocument()
    expect(screen.getByText('Animation Project 2')).toBeInTheDocument()
    expect(screen.getAllByTestId('work-card')).toHaveLength(3)
  })

  it('applies masonry grid layout classes', () => {
    const { container } = render(<WorkGrid works={mockWorks} loading={false} />)
    
    const grid = container.querySelector('.columns-1')
    expect(grid).toBeInTheDocument()
    expect(grid).toHaveClass('md:columns-2', 'lg:columns-3', 'xl:columns-4')
  })

  it('applies correct gap and spacing', () => {
    const { container } = render(<WorkGrid works={mockWorks} loading={false} />)
    
    const grid = container.querySelector('.columns-1')
    expect(grid).toHaveClass('gap-6', 'space-y-6')
  })

  it('handles single work item', () => {
    const singleWork = [mockWorks[0]]
    render(<WorkGrid works={singleWork} loading={false} />)
    
    expect(screen.getByText('Animation Project 1')).toBeInTheDocument()
    expect(screen.getAllByTestId('work-card')).toHaveLength(1)
  })

  it('maintains responsive design classes', () => {
    const { container } = render(<WorkGrid works={mockWorks} loading={false} />)
    
    const grid = container.querySelector('.columns-1')
    expect(grid).toHaveClass(
      'columns-1',
      'md:columns-2', 
      'lg:columns-3', 
      'xl:columns-4'
    )
  })
})