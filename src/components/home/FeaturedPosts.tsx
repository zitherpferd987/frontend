'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ScrollReveal } from '@/components/animations';

const FeaturedPosts = () => {
  const posts = Array.from({ length: 3 }).map((_, index) => ({
    id: index + 1,
    title: `Advanced Animation Techniques ${index + 1}`,
    excerpt: 'Discover the latest techniques in digital animation and motion graphics that will elevate your creative projects.',
    date: `Jan ${index + 15}, 2024`,
    readTime: `${5 + index} min read`,
    category: index === 0 ? 'Tutorial' : index === 1 ? 'Insights' : 'Tips',
  }));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut' as const,
      },
    },
  };

  return (
    <section className="py-20 px-4 bg-foreground/5">
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
              Latest Insights
            </motion.h2>
            <motion.p
              className="text-lg text-foreground/70 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Technical articles, tutorials, and thoughts on animation and digital art.
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
          {posts.map((post, index) => (
            <motion.article
              key={post.id}
              variants={itemVariants}
              className="group bg-background rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300"
              whileHover={{ y: -5 }}
            >
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30"
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.div
                  className="relative z-10 text-foreground/60 font-semibold"
                  initial={{ opacity: 0.6 }}
                  whileHover={{ opacity: 1 }}
                >
                  Blog Post {index + 1}
                </motion.div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
                    {post.category}
                  </span>
                </div>
                
                <h3 className="font-semibold text-foreground mb-3 text-lg group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                
                <p className="text-foreground/60 text-sm mb-4 leading-relaxed">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between text-sm text-foreground/50">
                  <time>{post.date}</time>
                  <span>{post.readTime}</span>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>

        <ScrollReveal delay={0.4}>
          <div className="text-center mt-12">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/blog"
                className="inline-flex items-center px-6 py-3 text-primary hover:text-primary/80 font-semibold transition-colors group"
              >
                Read All Posts
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

export default FeaturedPosts;