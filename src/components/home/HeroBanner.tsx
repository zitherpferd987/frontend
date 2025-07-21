'use client';

import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useMobileDetection } from '@/hooks/use-mobile-detection';
import { useViewport } from '@/hooks/use-viewport';
import { cn } from '@/lib/utils';

const HeroBanner = () => {
  const [mounted, setMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const prefersReducedMotion = useReducedMotion();
  const { isMobile, isTouchDevice, deviceType } = useMobileDetection();
  const { scrollY } = useScroll();
  
  // Reduce parallax intensity on mobile for better performance
  const parallaxIntensity = isMobile ? 0.3 : 1;
  const shouldUseParallax = !prefersReducedMotion && !isMobile;
  
  // Parallax transforms (disabled if user prefers reduced motion or on mobile)
  const y1 = useTransform(scrollY, [0, 1000], shouldUseParallax ? [0, -200 * parallaxIntensity] : [0, 0]);
  const y2 = useTransform(scrollY, [0, 1000], shouldUseParallax ? [0, -100 * parallaxIntensity] : [0, 0]);
  const opacity = useTransform(scrollY, [0, 300], shouldUseParallax ? [1, 0] : [1, 1]);
  const scale = useTransform(scrollY, [0, 300], shouldUseParallax ? [1, 0.8] : [1, 1]);
  
  // Spring animations for smooth parallax (lighter on mobile)
  const springConfig = isMobile 
    ? { stiffness: 50, damping: 20 } 
    : { stiffness: 100, damping: 30 };
  const springY1 = useSpring(y1, springConfig);
  const springY2 = useSpring(y2, springConfig);

  // Mouse parallax effect transforms
  const mouseX = useTransform(() => mousePosition.x * 10);
  const mouseY = useTransform(() => mousePosition.y * 10);
  const mouseXNeg = useTransform(() => mousePosition.x * -5);
  const mouseYNeg = useTransform(() => mousePosition.y * -5);
  const mouseXSmall = useTransform(() => mousePosition.x * 3);
  const mouseYSmall = useTransform(() => mousePosition.y * 3);
  const mouseXTiny = useTransform(() => mousePosition.x * -2);
  const mouseYMed = useTransform(() => mousePosition.y * 4);
  const mouseXLarge = useTransform(() => mousePosition.x * 6);
  const mouseYSmallNeg = useTransform(() => mousePosition.y * -3);
  const titleMouseX = useTransform(() => mousePosition.x * 50);
  const titleMouseXNeg = useTransform(() => mousePosition.x * -30);
  const titleMouseY = useTransform(() => mousePosition.y * 20);

  useEffect(() => {
    setMounted(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      // Disable mouse parallax on mobile/touch devices for better performance
      if (prefersReducedMotion || isTouchDevice) return;
      
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      setMousePosition({
        x: (clientX - innerWidth / 2) / innerWidth,
        y: (clientY - innerHeight / 2) / innerHeight,
      });
    };

    // Only add mouse listener on non-touch devices
    if (!isTouchDevice) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    
    return () => {
      if (!isTouchDevice) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [prefersReducedMotion, isTouchDevice]);

  if (!mounted) return null;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background Layers */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20"
        style={{ y: springY1 }}
      />
      
      {/* Floating Elements with Mouse Parallax - Optimized for mobile */}
      <motion.div
        className={cn(
          "absolute bg-primary/10 rounded-full blur-xl will-change-transform",
          isMobile 
            ? "top-16 left-6 w-16 h-16" 
            : "top-20 left-10 w-20 h-20 md:w-24 md:h-24"
        )}
        style={isTouchDevice ? {} : { x: mouseX, y: mouseY }}
        animate={{
          y: isMobile ? [0, -10, 0] : [0, -20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: isMobile ? 6 : 4,
          repeat: prefersReducedMotion ? 0 : Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className={cn(
          "absolute bg-secondary/10 rounded-full blur-xl will-change-transform",
          isMobile 
            ? "top-32 right-6 w-24 h-24" 
            : "top-40 right-20 w-32 h-32 md:w-40 md:h-40"
        )}
        style={isTouchDevice ? {} : { x: mouseXNeg, y: mouseYNeg }}
        animate={{
          y: isMobile ? [0, 10, 0] : [0, 20, 0],
          scale: [1, 0.9, 1],
        }}
        transition={{
          duration: isMobile ? 7 : 5,
          repeat: prefersReducedMotion ? 0 : Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
      
      <motion.div
        className={cn(
          "absolute bg-primary/15 rounded-full blur-lg will-change-transform",
          isMobile 
            ? "bottom-32 left-1/4 w-12 h-12" 
            : "bottom-40 left-1/4 w-16 h-16 md:w-20 md:h-20"
        )}
        style={isTouchDevice ? {} : { x: mouseXSmall, y: mouseYSmall }}
        animate={{
          x: isMobile ? [0, 15, 0] : [0, 30, 0],
          y: isMobile ? [0, -8, 0] : [0, -15, 0],
        }}
        transition={{
          duration: isMobile ? 8 : 6,
          repeat: prefersReducedMotion ? 0 : Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />

      {/* Additional floating elements for richer animation */}
      <motion.div
        className="absolute top-1/3 left-1/3 w-8 h-8 bg-secondary/20 rounded-full blur-md will-change-transform hidden md:block"
        style={{ x: mouseXTiny, y: mouseYMed }}
        animate={{
          rotate: [0, 360],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      <motion.div
        className="absolute bottom-1/3 right-1/3 w-12 h-12 bg-primary/8 rounded-full blur-lg will-change-transform hidden md:block"
        style={{ x: mouseXLarge, y: mouseYSmallNeg }}
        animate={{
          y: [0, -25, 0],
          opacity: [0.3, 0.8, 0.3],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3
        }}
      />

      {/* Main Content */}
      <motion.div 
        className="relative z-10 text-center px-4 max-w-5xl mx-auto"
        style={{ opacity, scale }}
      >
        {/* Animated Title - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: isMobile ? 30 : 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: isMobile ? 0.6 : 0.8, ease: "easeOut" }}
        >
          <motion.h1 className={cn(
            "font-bold text-foreground mb-6 leading-tight",
            isMobile 
              ? "text-3xl sm:text-4xl" 
              : "text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl"
          )}>
            <motion.span
              className="block will-change-transform"
              initial={{ opacity: 0, x: isMobile ? -30 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: isMobile ? 0.6 : 0.8, delay: 0.2 }}
              style={isTouchDevice ? {} : { x: titleMouseX }}
            >
              Creative
            </motion.span>
            <motion.span
              className="block text-primary will-change-transform"
              initial={{ opacity: 0, x: isMobile ? 30 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: isMobile ? 0.6 : 0.8, delay: 0.4 }}
              style={isTouchDevice ? {} : { x: titleMouseXNeg }}
            >
              Animation
            </motion.span>
            <motion.span
              className="block text-secondary will-change-transform"
              initial={{ opacity: 0, y: isMobile ? 30 : 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: isMobile ? 0.6 : 0.8, delay: 0.6 }}
              style={isTouchDevice ? {} : { y: titleMouseY }}
            >
              Studio
            </motion.span>
          </motion.h1>
        </motion.div>

        {/* Animated Subtitle - Mobile Optimized */}
        <motion.p
          className={cn(
            "text-foreground/70 mb-8 max-w-4xl mx-auto leading-relaxed px-4",
            isMobile 
              ? "text-base sm:text-lg" 
              : "text-lg sm:text-xl md:text-2xl lg:text-3xl"
          )}
          initial={{ opacity: 0, y: isMobile ? 20 : 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: isMobile ? 0.6 : 0.8, delay: 0.8 }}
        >
          Welcome to my creative space where{' '}
          <motion.span
            className="text-primary font-semibold will-change-auto"
            animate={{ 
              color: prefersReducedMotion ? '#0ea5e9' : ['#0ea5e9', '#d946ef', '#0ea5e9'] 
            }}
            transition={{ 
              duration: prefersReducedMotion ? 0 : 3, 
              repeat: prefersReducedMotion ? 0 : Infinity 
            }}
          >
            animation meets technology
          </motion.span>
          . Explore my works, read technical insights, and discover the art of digital storytelling.
        </motion.p>

        {/* Skills Animation */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-12 px-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          {['3D Animation', 'Motion Graphics', 'Digital Art', 'Web Development'].map((skill, index) => (
            <motion.span
              key={skill}
              className="px-3 sm:px-4 py-2 bg-foreground/5 backdrop-blur-sm rounded-full text-sm sm:text-base text-foreground/80 border border-foreground/10 will-change-transform"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
              whileHover={{ 
                scale: prefersReducedMotion ? 1 : 1.05, 
                backgroundColor: 'rgba(14, 165, 233, 0.1)',
                borderColor: 'rgba(14, 165, 233, 0.3)'
              }}
              whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
            >
              {skill}
            </motion.span>
          ))}
        </motion.div>

        {/* Action Buttons - Touch Optimized */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center px-4"
          initial={{ opacity: 0, y: isMobile ? 20 : 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: isMobile ? 0.6 : 0.8, delay: 1.4 }}
        >
          <motion.div
            whileHover={{ scale: prefersReducedMotion || isTouchDevice ? 1 : 1.05 }}
            whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
            className="will-change-transform"
          >
            <Link
              href="/gallery"
              className={cn(
                "group relative inline-block w-full sm:w-auto bg-primary text-white rounded-lg font-semibold overflow-hidden transition-all duration-300 text-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                isTouchDevice 
                  ? "px-8 py-4 text-lg touch-manipulation" 
                  : "px-6 sm:px-8 py-3 sm:py-4"
              )}
              aria-label="View my animation gallery"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary to-secondary"
                initial={{ x: '-100%' }}
                whileHover={{ x: prefersReducedMotion || isTouchDevice ? '-100%' : 0 }}
                transition={{ duration: 0.3 }}
              />
              <span className="relative z-10">View Gallery</span>
            </Link>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: prefersReducedMotion || isTouchDevice ? 1 : 1.05 }}
            whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
            className="will-change-transform"
          >
            <Link
              href="/blog"
              className={cn(
                "group inline-block w-full sm:w-auto border border-foreground/20 text-foreground rounded-lg font-semibold hover:bg-foreground/5 transition-all duration-300 backdrop-blur-sm text-center focus:outline-none focus:ring-2 focus:ring-foreground/50 focus:ring-offset-2",
                isTouchDevice 
                  ? "px-8 py-4 text-lg touch-manipulation" 
                  : "px-6 sm:px-8 py-3 sm:py-4"
              )}
              aria-label="Read my technical blog"
            >
              Read Blog
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full p-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.8 }}
          role="button"
          aria-label="Scroll down to see more content"
          tabIndex={0}
          onClick={() => {
            window.scrollTo({ 
              top: window.innerHeight, 
              behavior: 'smooth' 
            });
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              window.scrollTo({ 
                top: window.innerHeight, 
                behavior: 'smooth' 
              });
            }
          }}
        >
          <motion.div
            className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-foreground/30 rounded-full flex justify-center will-change-auto"
            animate={{ 
              borderColor: prefersReducedMotion 
                ? 'rgba(14,165,233,0.6)' 
                : ['rgba(255,255,255,0.3)', 'rgba(14,165,233,0.6)', 'rgba(255,255,255,0.3)'] 
            }}
            transition={{ 
              duration: prefersReducedMotion ? 0 : 2, 
              repeat: prefersReducedMotion ? 0 : Infinity 
            }}
          >
            <motion.div
              className="w-0.5 h-2 sm:w-1 sm:h-3 bg-foreground/50 rounded-full mt-1.5 sm:mt-2 will-change-transform"
              animate={{ 
                y: prefersReducedMotion ? 0 : [0, 8, 0] 
              }}
              transition={{ 
                duration: prefersReducedMotion ? 0 : 1.5, 
                repeat: prefersReducedMotion ? 0 : Infinity 
              }}
            />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Parallax Background Elements */}
      <motion.div
        className="absolute inset-0 pointer-events-none will-change-transform"
        style={{ y: springY2 }}
      >
        <div className="absolute top-1/4 left-1/4 w-1 h-1 sm:w-2 sm:h-2 bg-primary/40 rounded-full" />
        <div className="absolute top-1/3 right-1/3 w-0.5 h-0.5 sm:w-1 sm:h-1 bg-secondary/40 rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-2 h-2 sm:w-3 sm:h-3 bg-primary/30 rounded-full" />
        <div className="absolute bottom-1/3 left-1/3 w-0.5 h-0.5 sm:w-1 sm:h-1 bg-secondary/30 rounded-full" />
        <div className="absolute top-1/2 left-1/6 w-1 h-1 bg-primary/20 rounded-full hidden sm:block" />
        <div className="absolute top-3/4 right-1/6 w-1.5 h-1.5 bg-secondary/25 rounded-full hidden sm:block" />
      </motion.div>

      {/* Performance optimization: Preload critical resources */}
      <div className="sr-only">
        <span>Creative Animation Studio - Digital Art and Motion Graphics</span>
      </div>
    </section>
  );
};

export default HeroBanner;