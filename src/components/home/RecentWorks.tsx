'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ScrollReveal } from '@/components/animations';

const RecentWorks = () => {
  const works = Array.from({ length: 6 }).map((_, index) => ({
    id: index + 1,
    title: `Animation Project ${index + 1}`,
    description: 'A stunning piece showcasing advanced animation techniques and creative storytelling.',
    category: index % 3 === 0 ? '3D Animation' : index % 3 === 1 ? 'Motion Graphics' : 'Digital Art',
    featured: index < 2,
  }));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut' as const,
      },
    },
  };

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-12">
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-foreground mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Featured Works
            </motion.h2>
            <motion.p
              className="text-lg text-foreground/70 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              A showcase of my latest animation projects and digital art pieces.
            </motion.p>
          </div>
        </ScrollReveal>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {works.map((work, index) => (
            <motion.div
              key={work.id}
              variants={itemVariants}
              className="group cursor-pointer"
              whileHover={{ y: -10 }}
            >
              <div className="relative overflow-hidden rounded-lg mb-4">
                <motion.div
                  className="aspect-video bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/30 flex items-center justify-center relative"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Animated background elements */}
                  <motion.div
                    className="absolute top-4 left-4 w-8 h-8 bg-primary/30 rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.2,
                    }}
                  />
                  <motion.div
                    className="absolute bottom-4 right-4 w-6 h-6 bg-secondary/30 rounded-full"
                    animate={{
                      scale: [1, 0.8, 1],
                      opacity: [0.3, 0.7, 0.3],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      delay: index * 0.3,
                    }}
                  />
                  
                  <motion.div
                    className="text-foreground/40 font-medium z-10"
                    whileHover={{ scale: 1.1, color: 'rgba(14, 165, 233, 0.8)' }}
                  >
                    Featured Work {index + 1}
                  </motion.div>
                  
                  {work.featured && (
                    <motion.div
                      className="absolute top-3 right-3 px-2 py-1 bg-primary text-white text-xs rounded-full font-medium"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      Featured
                    </motion.div>
                  )}
                </motion.div>
                
                {/* Hover overlay */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                >
                  <motion.button
                    className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg font-medium"
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.3)' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    View Details
                  </motion.button>
                </motion.div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-secondary/10 text-secondary text-xs rounded-full font-medium">
                    {work.category}
                  </span>
                </div>
                
                <motion.h3
                  className="font-semibold text-foreground group-hover:text-primary transition-colors"
                  whileHover={{ x: 5 }}
                >
                  {work.title}
                </motion.h3>
                
                <p className="text-foreground/60 text-sm leading-relaxed">
                  {work.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <ScrollReveal delay={0.4}>
          <div className="text-center mt-12">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/gallery"
                className="inline-flex items-center px-6 py-3 text-primary hover:text-primary/80 font-semibold transition-colors group"
              >
                View All Works
                <motion.span
                  className="ml-2"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </Link>
            </motion.div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default RecentWorks;