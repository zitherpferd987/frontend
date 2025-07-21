'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useMobileGestures } from '@/hooks/use-mobile-gestures';
import { useViewport } from '@/hooks/use-viewport';
import { useMobileOptimization } from '@/hooks/use-mobile-optimization';
import { NavItem } from '@/types';

const navigation: NavItem[] = [
  { label: 'Home', href: '/', icon: '🏠' },
  { label: 'Blog', href: '/blog', icon: '📝' },
  { label: 'Gallery', href: '/gallery', icon: '🎨' },
];

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNavigation({ isOpen, onClose }: MobileNavigationProps) {
  const pathname = usePathname();
  const { safeAreaInsets, width } = useViewport();
  const mobileOptimization = useMobileOptimization();
  const [isClosing, setIsClosing] = useState(false);

  // Enhanced gesture support for closing menu
  const gestureRef = useMobileGestures<HTMLDivElement>({
    onSwipeUp: () => {
      if (isOpen) {
        handleClose();
      }
    },
    onSwipeRight: () => {
      if (isOpen) {
        handleClose();
      }
    },
    onSwipeDown: () => {
      // Allow swipe down to close from top area
      if (isOpen) {
        handleClose();
      }
    },
    onPanStart: (point) => {
      // Track pan start for potential close gesture
      console.debug('Pan start:', point);
    },
    onPan: (delta, point) => {
      // Provide visual feedback during pan
      if (Math.abs(delta.x) > 20 || Math.abs(delta.y) > 20) {
        // Add subtle visual feedback for potential close
      }
    },
    onPanEnd: (velocity) => {
      // Close if pan velocity is high enough
      if (velocity.x > 500 || velocity.y > 500) {
        handleClose();
      }
    },
    swipeThreshold: 30, // Reduced threshold for easier closing
    longPressDelay: 800,
    enableHapticFeedback: true,
  });

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: mobileOptimization.performanceMode === 'battery-saver' ? 0.1 : 0.3 
            }}
            className={cn(
              "fixed inset-0 z-40 mobile-nav-overlay",
              mobileOptimization.performanceMode === 'battery-saver' 
                ? "bg-black/60" 
                : "bg-black/50 backdrop-blur-sm"
            )}
            onClick={handleClose}
            role="button"
            aria-label="Close navigation menu"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
                handleClose();
              }
            }}
          />

          {/* Menu Panel */}
          <motion.div
            ref={gestureRef}
            initial={{ x: '100%' }}
            animate={{ x: isClosing ? '100%' : 0 }}
            exit={{ x: '100%' }}
            transition={{ 
              type: 'spring', 
              damping: 25, 
              stiffness: 200,
              duration: 0.3 
            }}
            className={cn(
              "fixed top-0 right-0 h-full bg-background/95 backdrop-blur-md border-l border-foreground/10 z-50 shadow-2xl",
              // Responsive width based on screen size
              width < 400 ? "w-full" : "w-80 max-w-[85vw]",
              // Performance optimizations
              mobileOptimization.performanceMode === 'battery-saver' && "backdrop-blur-none bg-background"
            )}
            style={{
              paddingTop: safeAreaInsets.top,
              paddingBottom: safeAreaInsets.bottom,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-foreground/10">
              <h2 className="text-lg font-semibold text-foreground">Menu</h2>
              <button
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-foreground/5 transition-colors touch-manipulation"
                aria-label="Close menu"
              >
                <svg
                  className="w-6 h-6 text-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 py-6">
              <ul className="space-y-2 px-6">
                {navigation.map((item, index) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                  >
                    <Link
                      href={item.href}
                      onClick={handleClose}
                      className={cn(
                        'flex items-center space-x-4 rounded-xl transition-all touch-manipulation min-h-touch-lg',
                        // Responsive padding
                        width < 400 ? 'p-3' : 'p-4',
                        // Animation duration based on performance mode
                        mobileOptimization.performanceMode === 'battery-saver' 
                          ? 'transition-none' 
                          : 'duration-200',
                        isActive(item.href)
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'text-foreground/70 hover:text-foreground hover:bg-foreground/5',
                        // Touch feedback
                        'active:scale-98 active:bg-foreground/10'
                      )}
                    >
                      <span className="text-2xl" role="img" aria-hidden="true">
                        {item.icon}
                      </span>
                      <span className="text-lg font-medium">{item.label}</span>
                      {isActive(item.href) && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="ml-auto w-2 h-2 bg-primary rounded-full"
                        />
                      )}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </nav>

            {/* Footer */}
            <div className="p-6 border-t border-foreground/10">
              <div className="text-center text-sm text-foreground/50">
                <p>Swipe up to close</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}