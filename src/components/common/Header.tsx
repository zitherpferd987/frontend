'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NavItem } from '@/types';
import { MobileNavigation } from './MobileNavigation';
import { useMobileDetection } from '@/hooks/use-mobile-detection';
import { useViewport } from '@/hooks/use-viewport';

const navigation: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Blog', href: '/blog' },
  { label: 'Gallery', href: '/gallery' },
];

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isMobile, isTouchDevice } = useMobileDetection();
  const { safeAreaInsets } = useViewport();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled
            ? 'bg-background/80 backdrop-blur-md border-b border-foreground/10'
            : 'bg-transparent',
          className
        )}
        style={{
          paddingTop: isMobile ? safeAreaInsets.top : 0,
        }}
      >
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className={cn(
            'flex items-center justify-between transition-all duration-300',
            isMobile ? 'h-14' : 'h-16'
          )}>
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 text-xl font-bold text-foreground hover:text-foreground/80 transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span>Animator</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-foreground/80',
                  isActive(item.href)
                    ? 'text-foreground border-b-2 border-blue-500'
                    : 'text-foreground/60'
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className={cn(
              'md:hidden rounded-md transition-colors touch-manipulation',
              isTouchDevice ? 'p-3' : 'p-2',
              'hover:bg-foreground/5 active:bg-foreground/10'
            )}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <div className={cn(
              'flex flex-col justify-center items-center',
              isTouchDevice ? 'w-7 h-7' : 'w-6 h-6'
            )}>
              <span
                className={cn(
                  'block bg-foreground transition-all duration-300',
                  isTouchDevice ? 'w-6 h-0.5' : 'w-5 h-0.5',
                  isMobileMenuOpen ? 'rotate-45 translate-y-1' : ''
                )}
              />
              <span
                className={cn(
                  'block bg-foreground transition-all duration-300 mt-1',
                  isTouchDevice ? 'w-6 h-0.5' : 'w-5 h-0.5',
                  isMobileMenuOpen ? 'opacity-0' : ''
                )}
              />
              <span
                className={cn(
                  'block bg-foreground transition-all duration-300 mt-1',
                  isTouchDevice ? 'w-6 h-0.5' : 'w-5 h-0.5',
                  isMobileMenuOpen ? '-rotate-45 -translate-y-1' : ''
                )}
              />
            </div>
          </button>
          </div>
        </nav>
      </header>

      {/* Mobile Navigation */}
      <MobileNavigation
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
}