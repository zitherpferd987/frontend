import { render, screen } from '@testing-library/react';
import { Footer } from '../Footer';

describe('Footer Component', () => {
  it('renders copyright information', () => {
    render(<Footer />);
    
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(currentYear.toString()))).toBeInTheDocument();
  });

  it('renders social media links', () => {
    render(<Footer />);
    
    // Check for social media links (adjust based on actual implementation)
    const socialLinks = screen.getAllByRole('link');
    expect(socialLinks.length).toBeGreaterThan(0);
  });

  it('renders navigation links', () => {
    render(<Footer />);
    
    expect(screen.getByText('首页')).toBeInTheDocument();
    expect(screen.getByText('博客')).toBeInTheDocument();
    expect(screen.getByText('画廊')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<Footer />);
    
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
  });

  it('renders contact information', () => {
    render(<Footer />);
    
    // Check for contact information (adjust based on actual implementation)
    const contactSection = screen.getByText(/联系/i);
    expect(contactSection).toBeInTheDocument();
  });
});