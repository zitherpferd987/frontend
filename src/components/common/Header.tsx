'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NavItem } from '@/types';
import { EnhancedMobileNavigation, MobileMenuButton } from './EnhancedMobileNavigation';
import { useMobileDetection } from '@/hooks/use-mobile-detection';
import { useViewport } from '@/hooks/use-viewport';
import { useMobileOptimization } from '@/hooks/use-mobile-optimization';

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
  const { isMobile, isTouchDevice, deviceType } = useMobileDetection();
  const { safeAreaInsets, width } = useViewport();
  const mobileOptimization = useMobileOptimization();

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
        <nav className={cn(
          "container mx-auto",
          // Responsive padding
          width < 400 ? "px-3" : "px-4 sm:px-6 lg:px-8"
        )}>
          <div className={cn(
            'flex items-center justify-between',
            // Animation based on performance mode
            mobileOptimization.performanceMode === 'battery-saver' 
              ? 'transition-none' 
              : 'transition-all duration-300',
            // Responsive height
            isMobile ? 'h-14' : deviceType === 'tablet' ? 'h-15' : 'h-16'
          )}>
          {/* Logo */}
          <Link
            href="/"
            className={cn(
              "flex items-center font-bold text-foreground transition-colors touch-manipulation",
              // Responsive sizing
              isMobile ? "space-x-1.5 text-lg" : "space-x-2 text-xl",
              // Touch optimization
              isTouchDevice ? "min-h-touch p-2 -m-2" : "hover:text-foreground/80"
            )}
          >
            <div className={cn(
              "bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center",
              isMobile ? "w-7 h-7" : "w-8 h-8"
            )}>
              <span className={cn(
                "text-white font-bold",
                isMobile ? "text-xs" : "text-sm"
              )}>A</span>
            </div>
            <span className={isMobile ? "hidden xs:inline" : ""}>Animator</span>
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

          {/* Enhanced Mobile Menu Button */}
          <MobileMenuButton
            isOpen={isMobileMenuOpen}
            onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
          </div>
        </nav>
      </header>

      {/* Enhanced Mobile Navigation */}
      <EnhancedMobileNavigation
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />
    </>
  );
}