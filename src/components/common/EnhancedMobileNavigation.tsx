'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useMobileGestures } from '@/hooks/use-mobile-gestures';
import { useViewport } from '@/hooks/use-viewport';
import { useMobileOptimization } from '@/hooks/use-mobile-optimization';
import { useMobileDetection } from '@/hooks/use-mobile-detection';
import { TouchFriendlyInteraction } from './TouchFriendlyInteraction';
import { NavItem } from '@/types';

const navigation: NavItem[] = [
  { label: 'Home', href: '/', icon: '🏠', description: 'Welcome & Portfolio' },
  { label: 'Blog', href: '/blog', icon: '📝', description: 'Technical Articles' },
  { label: 'Gallery', href: '/gallery', icon: '🎨', description: 'Animation Works' },
];

interface EnhancedMobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
}

export function EnhancedMobileNavigation({ 
  isOpen, 
  onClose, 
  onToggle 
}: EnhancedMobileNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { safeAreaInsets, width, height } = useViewport();
  const { isMobile, isTouchDevice, isIOS } = useMobileDetection();
  const mobileOptimization = useMobileOptimization();
  
  const [isClosing, setIsClosing] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);
  const [showGestureHint, setShowGestureHint] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const dragX = useMotionValue(0);
  const dragOpacity = useTransform(dragX, [0, width * 0.3], [1, 0]);
  const dragScale = useTransform(dragX, [0, width * 0.3], [1, 0.95]);

  // Enhanced gesture handling with drag-to-close
  const gestureRef = useMobileGestures({
    onSwipeRight: () => {
      if (isOpen) {
        handleClose();
      }
    },
    onSwipeUp: () => {
      if (isOpen) {
        handleClose();
      }
    },
    onSwipeDown: () => {
      if (isOpen) {
        handleClose();
      }
    },
    onPanStart: (point) => {
      setShowGestureHint(false);
    },
    onPan: (delta, point) => {
      // Update drag progress for visual feedback
      const progress = Math.abs(delta.x) / (width * 0.3);
      setDragProgress(Math.min(progress, 1));
      
      // Update drag position
      if (delta.x > 0) {
        dragX.set(delta.x);
      }
    },
    onPanEnd: (velocity) => {
      const shouldClose = velocity.x > 300 || dragProgress > 0.5;
      
      if (shouldClose) {
        handleClose();
      } else {
        // Snap back
        dragX.set(0);
        setDragProgress(0);
      }
    },
    swipeThreshold: 30,
    enableHapticFeedback: true,
  });

  const handleClose = useCallback(() => {
    setIsClosing(true);
    dragX.set(0);
    setDragProgress(0);
    
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  }, [onClose, dragX]);

  const handleNavigation = useCallback((href: string) => {
    handleClose();
    
    // Add a small delay to allow close animation
    setTimeout(() => {
      router.push(href);
    }, 150);
  }, [handleClose, router]);

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  // Show gesture hint after menu opens
  useEffect(() => {
    if (isOpen && isTouchDevice) {
      const timer = setTimeout(() => {
        setShowGestureHint(true);
      }, 1000);
      
      const hideTimer = setTimeout(() => {
        setShowGestureHint(false);
      }, 4000);

      return () => {
        clearTimeout(timer);
        clearTimeout(hideTimer);
      };
    }
  }, [isOpen, isTouchDevice]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${window.scrollY}px`;

      return () => {
        document.body.style.overflow = originalStyle;
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
        window.scrollTo(0, parseInt(document.body.style.top || '0') * -1);
      };
    }
  }, [isOpen]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          handleClose();
          break;
        case 'ArrowDown':
        case 'ArrowUp':
          e.preventDefault();
          // Focus management for keyboard navigation
          break;
        case 'Enter':
        case ' ':
          // Handle enter/space on focused items
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Enhanced Backdrop with gesture support */}
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
            style={{ opacity: dragOpacity }}
          />

          {/* Enhanced Menu Panel with drag support */}
          <motion.div
            ref={gestureRef as React.RefObject<HTMLDivElement>}
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
              width < 400 ? "w-full" : "w-80 max-w-[85vw]",
              mobileOptimization.performanceMode === 'battery-saver' && "backdrop-blur-none bg-background"
            )}
            style={{
              paddingTop: safeAreaInsets.top,
              paddingBottom: safeAreaInsets.bottom,
              x: dragX,
              scale: dragScale,
            }}
            drag="x"
            dragConstraints={{ left: 0, right: width * 0.5 }}
            dragElastic={0.2}
            onDrag={(event, info: PanInfo) => {
              const progress = info.offset.x / (width * 0.3);
              setDragProgress(Math.min(Math.max(progress, 0), 1));
            }}
            onDragEnd={(event, info: PanInfo) => {
              const shouldClose = info.offset.x > width * 0.2 || info.velocity.x > 500;
              
              if (shouldClose) {
                handleClose();
              }
            }}
          >
            {/* Header with enhanced close button */}
            <div className="flex items-center justify-between p-6 border-b border-foreground/10">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Menu</h2>
                  <p className="text-xs text-foreground/60">Navigate your way</p>
                </div>
              </div>
              
              <TouchFriendlyInteraction
                onTap={handleClose}
                className="p-2 rounded-full hover:bg-foreground/5 transition-colors"
                touchFeedbackType="scale"
                enableHapticFeedback
              >
                <svg
                  className="w-6 h-6 text-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span className="sr-only">Close menu</span>
              </TouchFriendlyInteraction>
            </div>

            {/* Enhanced Navigation Links */}
            <nav className="flex-1 py-6" role="navigation" aria-label="Mobile navigation">
              <ul className="space-y-2 px-6">
                {navigation.map((item, index) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                  >
                    <TouchFriendlyInteraction
                      onTap={() => handleNavigation(item.href)}
                      className={cn(
                        'flex items-center space-x-4 rounded-xl transition-all min-h-touch-lg w-full',
                        width < 400 ? 'p-3' : 'p-4',
                        mobileOptimization.performanceMode === 'battery-saver' 
                          ? 'transition-none' 
                          : 'duration-200',
                        isActive(item.href)
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'text-foreground/70 hover:text-foreground hover:bg-foreground/5',
                      )}
                      touchFeedbackType="highlight"
                      enableHapticFeedback
                    >
                      <span className="text-2xl" role="img" aria-hidden="true">
                        {item.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-lg font-medium truncate">{item.label}</div>
                        {item.description && (
                          <div className="text-sm text-foreground/50 truncate">
                            {item.description}
                          </div>
                        )}
                      </div>
                      {isActive(item.href) && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="w-2 h-2 bg-primary rounded-full"
                          transition={{ duration: 0.2 }}
                        />
                      )}
                    </TouchFriendlyInteraction>
                  </motion.li>
                ))}
              </ul>
            </nav>

            {/* Enhanced Footer with gesture hints */}
            <div className="p-6 border-t border-foreground/10">
              <AnimatePresence>
                {showGestureHint && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-4 p-3 bg-primary/10 rounded-lg"
                  >
                    <div className="flex items-center space-x-2 text-primary text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Swipe right or drag to close</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="text-center text-sm text-foreground/50 space-y-1">
                <p>Swipe gestures enabled</p>
                <div className="flex justify-center space-x-4 text-xs">
                  <span>↑ Close</span>
                  <span>→ Close</span>
                  <span>↓ Close</span>
                </div>
              </div>

              {/* Drag progress indicator */}
              {dragProgress > 0 && (
                <div className="mt-3">
                  <div className="w-full bg-foreground/10 rounded-full h-1">
                    <motion.div
                      className="bg-primary h-1 rounded-full"
                      style={{ width: `${dragProgress * 100}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                  <p className="text-xs text-center text-foreground/50 mt-1">
                    {dragProgress > 0.5 ? 'Release to close' : 'Keep dragging'}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Enhanced Mobile Menu Button with gesture feedback
interface MobileMenuButtonProps {
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export function MobileMenuButton({ isOpen, onToggle, className = '' }: MobileMenuButtonProps) {
  const { isMobile } = useMobileDetection();
  const mobileOptimization = useMobileOptimization();

  return (
    <TouchFriendlyInteraction
      onTap={onToggle}
      className={cn(
        'md:hidden rounded-md flex items-center justify-center mobile-focus-visible',
        mobileOptimization.performanceMode === 'battery-saver' 
          ? 'transition-none' 
          : 'transition-all duration-200',
        'min-h-[44px] min-w-[44px] p-2',
        'hover:bg-foreground/5 border border-transparent hover:border-foreground/10',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        className
      )}
      touchFeedbackType="scale"
      enableHapticFeedback
      aria-label={isOpen ? 'Close mobile menu' : 'Open mobile menu'}
      aria-expanded={isOpen}
    >
      <div className="relative w-6 h-6 flex flex-col justify-center items-center">
        <motion.span
          className="block bg-foreground rounded-full w-5 h-0.5"
          animate={{
            rotate: isOpen ? 45 : 0,
            y: isOpen ? 6 : 0,
          }}
          transition={{
            duration: mobileOptimization.performanceMode === 'battery-saver' ? 0.1 : 0.3,
            ease: 'easeInOut',
          }}
        />
        <motion.span
          className="block bg-foreground rounded-full w-5 h-0.5 mt-1"
          animate={{
            opacity: isOpen ? 0 : 1,
            scale: isOpen ? 0 : 1,
          }}
          transition={{
            duration: mobileOptimization.performanceMode === 'battery-saver' ? 0.1 : 0.3,
            ease: 'easeInOut',
          }}
        />
        <motion.span
          className="block bg-foreground rounded-full w-5 h-0.5 mt-1"
          animate={{
            rotate: isOpen ? -45 : 0,
            y: isOpen ? -6 : 0,
          }}
          transition={{
            duration: mobileOptimization.performanceMode === 'battery-saver' ? 0.1 : 0.3,
            ease: 'easeInOut',
          }}
        />
      </div>
    </TouchFriendlyInteraction>
  );
}