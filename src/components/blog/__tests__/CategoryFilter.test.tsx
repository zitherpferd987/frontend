import { render, screen, fireEvent } from '@testing-library/react'
import { CategoryFilter } from '../CategoryFilter'

const mockCategories = [
  { id: 1, name: 'All', slug: 'all' },
  { id: 2, name: 'Technology', slug: 'technology' },
  { id: 3, name: 'Design', slug: 'design' },
  { id: 4, name: 'Animation', slug: 'animation' }
]

describe('CategoryFilter Component', () => {
  const mockOnCategoryChange = jest.fn()

  beforeEach(() => {
    mockOnCategoryChange.mockClear()
  })

  it('renders all categories', () => {
    render(
      <CategoryFilter 
        categories={mockCategories}
        selectedCategory="all"
        onCategoryChange={mockOnCategoryChange}
      />
    )

    expect(screen.getByText('All')).toBeInTheDocument()
    expect(screen.getByText('Technology')).toBeInTheDocument()
    expect(screen.getByText('Design')).toBeInTheDocument()
    expect(screen.getByText('Animation')).toBeInTheDocument()
  })

  it('highlights selected category', () => {
    render(
      <CategoryFilter 
        categories={mockCategories}
        selectedCategory="technology"
        onCategoryChange={mockOnCategoryChange}
      />
    )

    const techButton = screen.getByText('Technology')
    expect(techButton).toHaveClass('bg-blue-600', 'text-white')
  })

  it('calls onCategoryChange when category is clicked', () => {
    render(
      <CategoryFilter 
        categories={mockCategories}
        selectedCategory="all"
        onCategoryChange={mockOnCategoryChange}
      />
    )

    fireEvent.click(screen.getByText('Design'))
    expect(mockOnCategoryChange).toHaveBeenCalledWith('design')
  })

  it('does not call onCategoryChange when same category is clicked', () => {
    render(
      <CategoryFilter 
        categories={mockCategories}
        selectedCategory="design"
        onCategoryChange={mockOnCategoryChange}
      />
    )

    fireEvent.click(screen.getByText('Design'))
    expect(mockOnCategoryChange).not.toHaveBeenCalled()
  })

  it('applies correct styling to unselected categories', () => {
    render(
      <CategoryFilter 
        categories={mockCategories}
        selectedCategory="technology"
        onCategoryChange={mockOnCategoryChange}
      />
    )

    const designButton = screen.getByText('Design')
    expect(designButton).toHaveClass('bg-gray-200', 'text-gray-700')
    expect(designButton).not.toHaveClass('bg-blue-600', 'text-white')
  })

  it('handles empty categories array', () => {
    render(
      <CategoryFilter 
        categories={[]}
        selectedCategory=""
        onCategoryChange={mockOnCategoryChange}
      />
    )

    const container = screen.getByRole('group')
    expect(container).toBeInTheDocument()
    expect(container.children).toHaveLength(0)
  })

  it('is accessible with proper ARIA labels', () => {
    render(
      <CategoryFilter 
        categories={mockCategories}
        selectedCategory="all"
        onCategoryChange={mockOnCategoryChange}
      />
    )

    const filterGroup = screen.getByRole('group')
    expect(filterGroup).toHaveAttribute('aria-label', 'Filter posts by category')
    
    const buttons = screen.getAllByRole('button')
    buttons.forEach(button => {
      expect(button).toHaveAttribute('type', 'button')
    })
  })
})