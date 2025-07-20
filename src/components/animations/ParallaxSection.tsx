'use client';

import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ReactNode, useRef } from 'react';

interface ParallaxSectionProps {
  children: ReactNode;
  speed?: number;
  className?: string;
  offset?: number[];
  range?: number[];
}

const ParallaxSection = ({
  children,
  speed = 0.5,
  className = '',
  offset = [0, 1],
  range = [0, -200],
}: ParallaxSectionProps) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: offset as any,
  });

  const y = useTransform(scrollYProgress, [0, 1], range);
  const springY = useSpring(y, { stiffness: 100, damping: 30 });

  return (
    <motion.div
      ref={ref}
      style={{ y: springY }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ParallaxSection;