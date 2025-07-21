'use client';

import { ReactNode, useEffect, useState } from 'react';
import { motion, AnimatePresence, Variants, useAnimation, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useMobileDetection } from '@/hooks/use-mobile-detection';
import { useViewport } from '@/hooks/use-viewport';
import { useMobileOptimization } from '@/hooks/use-mobile-optimization';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/utils';

interface MobileAnimationProps {
  children: ReactNode;
  className?: string;
  type?: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scale' | 'rotate' | 'bounce';
  delay?: number;
  duration?: number;
  stagger?: number;
  threshold?: number;
  once?: boolean;
  disabled?: boolean;
}

// Mobile-optimized animation variants
const getMobileVariants = (
  type: string,
  isMobile: boolean,
  performanceMode: 'high' | 'balanced' | 'battery-saver'
): Variants => {
  const isLowPerformance = performanceMode === 'battery-saver';
  const reducedDistance = isMobile ? 10 : 20;
  const normalDistance = isMobile ? 20 : 40;
  
  const baseVariants: Record<string, Variants> = {
    fadeIn: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    },
    slideUp: {
      hidden: { opacity: 0, y: isLowPerformance ? reducedDistance : normalDistance },
      visible: { opacity: 1, y: 0 },
    },
    slideDown: {
      hidden: { opacity: 0, y: isLowPerformance ? -reducedDistance : -normalDistance },
      visible: { opacity: 1, y: 0 },
    },
    slideLeft: {
      hidden: { opacity: 0, x: isLowPerformance ? reducedDistance : normalDistance },
      visible: { opacity: 1, x: 0 },
    },
    slideRight: {
      hidden: { opacity: 0, x: isLowPerformance ? -reducedDistance : -normalDistance },
      visible: { opacity: 1, x: 0 },
    },
    scale: {
      hidden: { opacity: 0, scale: isLowPerformance ? 0.95 : 0.8 },
      visible: { opacity: 1, scale: 1 },
    },
    rotate: {
      hidden: { opacity: 0, rotate: isLowPerformance ? 5 : 15 },
      visible: { opacity: 1, rotate: 0 },
    },
    bounce: {
      hidden: { opacity: 0, y: isLowPerformance ? reducedDistance : normalDistance },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: {
          type: isLowPerformance ? 'tween' : 'spring',
          bounce: isLowPerformance ? 0 : 0.4,
        }
      },
    },
  };

  return baseVariants[type] || baseVariants.fadeIn;
};

export function MobileOptimizedAnimation({
  children,
  className = '',
  type = 'fadeIn',
  delay = 0,
  duration,
  stagger = 0,
  threshold = 0.1,
  once = true,
  disabled = false,
}: MobileAnimationProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount: threshold });
  const controls = useAnimation();
  
  const { isMobile, isTouchDevice } = useMobileDetection();
  const { width } = useViewport();
  const prefersReducedMotion = useReducedMotion();
  const mobileOptimization = useMobileOptimization();

  // Determine optimal animation duration
  const getOptimalDuration = () => {
    if (duration) return duration;
    
    switch (mobileOptimization.performanceMode) {
      case 'battery-saver':
        return 0.1;
      case 'balanced':
        return isMobile ? 0.3 : 0.5;
      case 'high':
        return isMobile ? 0.4 : 0.6;
      default:
        return 0.3;
    }
  };

  const variants = getMobileVariants(type, isMobile, mobileOptimization.performanceMode);
  const animationDuration = getOptimalDuration();

  useEffect(() => {
    if (disabled || prefersReducedMotion) {
      controls.set('visible');
      return;
    }

    if (isInView) {
      controls.start('visible');
    } else if (!once) {
      controls.start('hidden');
    }
  }, [isInView, controls, disabled, prefersReducedMotion, once]);

  // Skip animation entirely if disabled or reduced motion preferred
  if (disabled || prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={cn('mobile-optimized-animation', className)}
      initial="hidden"
      animate={controls}
      variants={variants}
      transition={{
        duration: animationDuration,
        delay,
        ease: mobileOptimization.performanceMode === 'high' ? 'easeOut' : 'linear',
        // Use transform3d for hardware acceleration
        type: mobileOptimization.performanceMode === 'battery-saver' ? 'tween' : 'spring',
        stiffness: isMobile ? 100 : 150,
        damping: isMobile ? 20 : 25,
      }}
      style={{
        // Force hardware acceleration
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        perspective: 1000,
        // Optimize for mobile rendering
        willChange: 'transform, opacity',
      }}
    >
      {children}
    </motion.div>
  );
}

// Staggered animation container for lists
interface MobileStaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  animationType?: 'fadeIn' | 'slideUp' | 'scale';
}

export function MobileStaggerContainer({
  children,
  className = '',
  staggerDelay = 0.1,
  animationType = 'slideUp',
}: MobileStaggerContainerProps) {
  const { isMobile } = useMobileDetection();
  const mobileOptimization = useMobileOptimization();
  const prefersReducedMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : (isMobile ? staggerDelay * 0.5 : staggerDelay),
        delayChildren: prefersReducedMotion ? 0 : 0.1,
      },
    },
  };

  const itemVariants = getMobileVariants(animationType, isMobile, mobileOptimization.performanceMode);

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn('mobile-stagger-container', className)}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {Array.isArray(children) 
        ? children.map((child, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              transition={{
                duration: mobileOptimization.performanceMode === 'battery-saver' ? 0.1 : (isMobile ? 0.3 : 0.5),
                ease: 'easeOut',
              }}
            >
              {child}
            </motion.div>
          ))
        : <motion.div variants={itemVariants}>{children}</motion.div>
      }
    </motion.div>
  );
}

// Mobile-optimized page transition
interface MobilePageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function MobilePageTransition({ children, className = '' }: MobilePageTransitionProps) {
  const { isMobile } = useMobileDetection();
  const mobileOptimization = useMobileOptimization();
  const prefersReducedMotion = useReducedMotion();

  const pageVariants: Variants = {
    initial: prefersReducedMotion ? {} : {
      opacity: 0,
      y: isMobile ? 10 : 20,
    },
    in: {
      opacity: 1,
      y: 0,
    },
    out: prefersReducedMotion ? {} : {
      opacity: 0,
      y: isMobile ? -10 : -20,
    },
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: mobileOptimization.performanceMode === 'battery-saver' ? 0.1 : (isMobile ? 0.3 : 0.5),
  };

  return (
    <motion.div
      className={cn('mobile-page-transition', className)}
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
}

// Mobile-optimized scroll reveal
interface MobileScrollRevealProps {
  children: ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
}

export function MobileScrollReveal({
  children,
  className = '',
  threshold = 0.1,
  rootMargin = '0px 0px -100px 0px',
}: MobileScrollRevealProps) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const { isMobile } = useMobileDetection();
  const mobileOptimization = useMobileOptimization();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold,
        rootMargin: isMobile ? '0px 0px -50px 0px' : rootMargin,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold, rootMargin, isMobile]);

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={cn('mobile-scroll-reveal', className)}
      initial={{ opacity: 0, y: isMobile ? 20 : 40 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: isMobile ? 20 : 40 }}
      transition={{
        duration: mobileOptimization.performanceMode === 'battery-saver' ? 0.1 : (isMobile ? 0.4 : 0.6),
        ease: 'easeOut',
      }}
    >
      {children}
    </motion.div>
  );
}

// Mobile-optimized loading animation
interface MobileLoadingAnimationProps {
  type?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function MobileLoadingAnimation({
  type = 'spinner',
  size = 'md',
  className = '',
}: MobileLoadingAnimationProps) {
  const { isMobile } = useMobileDetection();
  const mobileOptimization = useMobileOptimization();
  const prefersReducedMotion = useReducedMotion();

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const animationDuration = mobileOptimization.performanceMode === 'battery-saver' ? 2 : 1;

  if (prefersReducedMotion) {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <div className={cn('bg-primary rounded-full', sizeClasses[size])} />
      </div>
    );
  }

  switch (type) {
    case 'spinner':
      return (
        <div className={cn('flex items-center justify-center', className)}>
          <motion.div
            className={cn('border-2 border-primary border-t-transparent rounded-full', sizeClasses[size])}
            animate={{ rotate: 360 }}
            transition={{
              duration: animationDuration,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </div>
      );

    case 'dots':
      return (
        <div className={cn('flex items-center justify-center space-x-1', className)}>
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-2 h-2 bg-primary rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: animationDuration,
                repeat: Infinity,
                delay: index * 0.2,
              }}
            />
          ))}
        </div>
      );

    case 'pulse':
      return (
        <div className={cn('flex items-center justify-center', className)}>
          <motion.div
            className={cn('bg-primary rounded-full', sizeClasses[size])}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: animationDuration,
              repeat: Infinity,
            }}
          />
        </div>
      );

    case 'skeleton':
      return (
        <div className={cn('animate-pulse bg-foreground/10 rounded', className)}>
          <div className="h-4 bg-foreground/20 rounded w-3/4 mb-2" />
          <div className="h-4 bg-foreground/20 rounded w-1/2" />
        </div>
      );

    default:
      return null;
  }
}

// Hook for mobile animation utilities
export const useMobileAnimation = () => {
  const { isMobile, isTouchDevice } = useMobileDetection();
  const mobileOptimization = useMobileOptimization();
  const prefersReducedMotion = useReducedMotion();

  return {
    // Animation configuration
    shouldAnimate: !prefersReducedMotion && mobileOptimization.performanceMode !== 'battery-saver',
    
    // Optimal durations
    getQuickDuration: () => isMobile ? 0.2 : 0.3,
    getNormalDuration: () => isMobile ? 0.3 : 0.5,
    getSlowDuration: () => isMobile ? 0.5 : 0.8,
    
    // Stagger delays
    getStaggerDelay: () => isMobile ? 0.05 : 0.1,
    
    // Easing functions
    getEasing: () => mobileOptimization.performanceMode === 'high' ? 'easeOut' : 'linear',
    
    // Transform distances
    getSlideDistance: () => isMobile ? 20 : 40,
    getScaleAmount: () => isMobile ? 0.95 : 0.8,
    
    // Performance optimizations
    getTransformStyle: () => ({
      transform: 'translateZ(0)',
      backfaceVisibility: 'hidden' as const,
      perspective: 1000,
      willChange: 'transform, opacity',
    }),
    
    // Utility functions
    createMobileVariants: (type: string) => getMobileVariants(type, isMobile, mobileOptimization.performanceMode),
    
    shouldUseSpring: () => mobileOptimization.performanceMode === 'high' && !isMobile,
    
    getOptimalFrameRate: () => {
      switch (mobileOptimization.performanceMode) {
        case 'battery-saver': return 30;
        case 'balanced': return isMobile ? 30 : 60;
        case 'high': return 60;
        default: return 60;
      }
    },
  };
};