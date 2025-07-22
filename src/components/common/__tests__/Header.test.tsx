import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '../Header';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('Header Component', () => {
  it('renders navigation links correctly', () => {
    render(<Header />);
    
    expect(screen.getByText('首页')).toBeInTheDocument();
    expect(screen.getByText('博客')).toBeInTheDocument();
    expect(screen.getByText('画廊')).toBeInTheDocument();
  });

  it('shows mobile menu when hamburger is clicked', () => {
    render(<Header />);
    
    const hamburgerButton = screen.getByRole('button', { name: /menu/i });
    fireEvent.click(hamburgerButton);
    
    // Mobile menu should be visible
    const mobileMenu = screen.getByTestId('mobile-menu');
    expect(mobileMenu).toBeInTheDocument();
  });

  it('highlights active navigation item', () => {
    render(<Header />);
    
    const homeLink = screen.getByText('首页').closest('a');
    expect(homeLink).toHaveClass('text-blue-600');
  });

  it('closes mobile menu when navigation item is clicked', () => {
    render(<Header />);
    
    // Open mobile menu
    const hamburgerButton = screen.getByRole('button', { name: /menu/i });
    fireEvent.click(hamburgerButton);
    
    // Click on a navigation item
    const blogLink = screen.getByText('博客');
    fireEvent.click(blogLink);
    
    // Mobile menu should be closed
    const mobileMenu = screen.queryByTestId('mobile-menu');
    expect(mobileMenu).not.toBeInTheDocument();
  });

  it('is accessible with keyboard navigation', () => {
    render(<Header />);
    
    const homeLink = screen.getByText('首页');
    homeLink.focus();
    
    expect(homeLink).toHaveFocus();
    
    // Test tab navigation
    fireEvent.keyDown(homeLink, { key: 'Tab' });
    const blogLink = screen.getByText('博客');
    expect(blogLink).toHaveFocus();
  });
});