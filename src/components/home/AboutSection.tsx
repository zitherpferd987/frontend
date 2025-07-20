'use client';

import { motion } from 'framer-motion';
import { ScrollReveal } from '@/components/animations';

const AboutSection = () => {
  const skills = [
    { name: 'Animation', level: 95, color: 'from-primary to-primary/60' },
    { name: 'Digital Art', level: 90, color: 'from-secondary to-secondary/60' },
    { name: '3D Modeling', level: 85, color: 'from-primary to-secondary' },
    { name: 'Motion Graphics', level: 88, color: 'from-secondary to-primary' },
    { name: 'Web Development', level: 80, color: 'from-primary/80 to-secondary/80' },
  ];

  const technologies = [
    'Blender', 'After Effects', 'Cinema 4D', 'Photoshop', 
    'React', 'Next.js', 'TypeScript', 'Framer Motion'
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-16">
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-foreground mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              About the Studio
            </motion.h2>
            <motion.p
              className="text-lg text-foreground/70 mb-8 leading-relaxed max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              This is a creative space dedicated to exploring the intersection of animation,
              technology, and storytelling. Here you&apos;ll find my latest works, technical insights,
              and the journey of bringing digital art to life.
            </motion.p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Skills Section */}
          <ScrollReveal direction="left">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-8">Skills & Expertise</h3>
              <div className="space-y-6">
                {skills.map((skill, index) => (
                  <motion.div
                    key={skill.name}
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-foreground">{skill.name}</span>
                      <motion.span
                        className="text-sm text-foreground/60"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                        viewport={{ once: true }}
                      >
                        {skill.level}%
                      </motion.span>
                    </div>
                    <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full bg-gradient-to-r ${skill.color} rounded-full`}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        transition={{ duration: 1, delay: 0.3 + index * 0.1, ease: 'easeOut' }}
                        viewport={{ once: true }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Technologies Section */}
          <ScrollReveal direction="right">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-8">Technologies & Tools</h3>
              <div className="grid grid-cols-2 gap-4">
                {technologies.map((tech, index) => (
                  <motion.div
                    key={tech}
                    className="group p-4 bg-foreground/5 rounded-lg border border-foreground/10 hover:border-primary/30 transition-all duration-300"
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    viewport={{ once: true }}
                    whileHover={{ 
                      scale: 1.05, 
                      backgroundColor: 'rgba(14, 165, 233, 0.05)',
                      borderColor: 'rgba(14, 165, 233, 0.3)'
                    }}
                  >
                    <motion.span
                      className="text-foreground/80 font-medium group-hover:text-primary transition-colors"
                      whileHover={{ scale: 1.1 }}
                    >
                      {tech}
                    </motion.span>
                  </motion.div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Animated Stats */}
        <ScrollReveal delay={0.4}>
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: 50, label: 'Projects Completed', suffix: '+' },
              { number: 3, label: 'Years Experience', suffix: '+' },
              { number: 25, label: 'Happy Clients', suffix: '+' },
              { number: 100, label: 'Animations Created', suffix: '+' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <motion.div
                  className="text-3xl md:text-4xl font-bold text-primary mb-2"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1, type: 'spring' }}
                  viewport={{ once: true }}
                >
                  <motion.span
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    {stat.number}{stat.suffix}
                  </motion.span>
                </motion.div>
                <p className="text-foreground/60 text-sm font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default AboutSection;