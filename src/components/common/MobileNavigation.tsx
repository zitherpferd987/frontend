'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTouchGestures } from '@/hooks/use-touch-gestures';
import { useViewport } from '@/hooks/use-viewport';
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
  const { safeAreaInsets } = useViewport();
  const [isClosing, setIsClosing] = useState(false);

  // Touch gesture support for closing menu
  const gestureRef = useTouchGestures<HTMLDivElement>({
    onSwipeUp: () => {
      if (isOpen) {
        handleClose();
      }
    },
    threshold: 100,
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
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={handleClose}
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
            className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-background/95 backdrop-blur-md border-l border-foreground/10 z-50 shadow-2xl"
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
                        'flex items-center space-x-4 p-4 rounded-xl transition-all duration-200 touch-manipulation',
                        isActive(item.href)
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'text-foreground/70 hover:text-foreground hover:bg-foreground/5'
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