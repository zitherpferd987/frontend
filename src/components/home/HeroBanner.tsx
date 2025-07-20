'use client';

import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useMobileDetection } from '@/hooks/use-mobile-detection';
import { useViewport } from '@/hooks/use-viewport';

const HeroBanner = () => {
  const [mounted, setMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const prefersReducedMotion = useReducedMotion();
  const { scrollY } = useScroll();
  
  // Parallax transforms (disabled if user prefers reduced motion)
  const y1 = useTransform(scrollY, [0, 1000], prefersReducedMotion ? [0, 0] : [0, -200]);
  const y2 = useTransform(scrollY, [0, 1000], prefersReducedMotion ? [0, 0] : [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], prefersReducedMotion ? [1, 1] : [1, 0]);
  const scale = useTransform(scrollY, [0, 300], prefersReducedMotion ? [1, 1] : [1, 0.8]);
  
  // Spring animations for smooth parallax
  const springY1 = useSpring(y1, { stiffness: 100, damping: 30 });
  const springY2 = useSpring(y2, { stiffness: 100, damping: 30 });

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
      if (prefersReducedMotion) return;
      
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      setMousePosition({
        x: (clientX - innerWidth / 2) / innerWidth,
        y: (clientY - innerHeight / 2) / innerHeight,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [prefersReducedMotion]);

  if (!mounted) return null;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background Layers */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20"
        style={{ y: springY1 }}
      />
      
      {/* Floating Elements with Mouse Parallax */}
      <motion.div
        className="absolute top-20 left-10 w-20 h-20 md:w-24 md:h-24 bg-primary/10 rounded-full blur-xl will-change-transform"
        style={{ x: mouseX, y: mouseY }}
        animate={{
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute top-40 right-20 w-32 h-32 md:w-40 md:h-40 bg-secondary/10 rounded-full blur-xl will-change-transform"
        style={{ x: mouseXNeg, y: mouseYNeg }}
        animate={{
          y: [0, 20, 0],
          scale: [1, 0.9, 1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
      
      <motion.div
        className="absolute bottom-40 left-1/4 w-16 h-16 md:w-20 md:h-20 bg-primary/15 rounded-full blur-lg will-change-transform"
        style={{ x: mouseXSmall, y: mouseYSmall }}
        animate={{
          x: [0, 30, 0],
          y: [0, -15, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
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
        {/* Animated Title */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-foreground mb-6 leading-tight">
            <motion.span
              className="block will-change-transform"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{ x: titleMouseX }}
            >
              Creative
            </motion.span>
            <motion.span
              className="block text-primary will-change-transform"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              style={{ x: titleMouseXNeg }}
            >
              Animation
            </motion.span>
            <motion.span
              className="block text-secondary will-change-transform"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              style={{ y: titleMouseY }}
            >
              Studio
            </motion.span>
          </motion.h1>
        </motion.div>

        {/* Animated Subtitle */}
        <motion.p
          className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-foreground/70 mb-8 max-w-4xl mx-auto leading-relaxed px-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
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

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center px-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
        >
          <motion.div
            whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
            whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
            className="will-change-transform"
          >
            <Link
              href="/gallery"
              className="group relative inline-block w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-primary text-white rounded-lg font-semibold overflow-hidden transition-all duration-300 text-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label="View my animation gallery"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary to-secondary"
                initial={{ x: '-100%' }}
                whileHover={{ x: prefersReducedMotion ? '-100%' : 0 }}
                transition={{ duration: 0.3 }}
              />
              <span className="relative z-10">View Gallery</span>
            </Link>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
            whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
            className="will-change-transform"
          >
            <Link
              href="/blog"
              className="group inline-block w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border border-foreground/20 text-foreground rounded-lg font-semibold hover:bg-foreground/5 transition-all duration-300 backdrop-blur-sm text-center focus:outline-none focus:ring-2 focus:ring-foreground/50 focus:ring-offset-2"
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