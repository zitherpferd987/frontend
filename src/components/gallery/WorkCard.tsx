'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { GalleryWork } from '@/types';
import { LazyImage } from './LazyImage';
import { PlayIcon, EyeIcon } from '@heroicons/react/24/outline';

interface WorkCardProps {
  work: GalleryWork;
  onClick: () => void;
  className?: string;
}

export function WorkCard({ work, onClick, className = '' }: WorkCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const primaryMedia = work.attributes.media.data[0];
  const isVideo = primaryMedia?.attributes.mime.startsWith('video/');
  const hasMultipleMedia = work.attributes.media.data.length > 1;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;

    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`group relative cursor-pointer ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 20,
        scale: { duration: 0.2 }
      }}
      style={{
        transformStyle: 'preserve-3d',
        transition: 'transform 0.1s ease-out',
      }}
    >
      {/* Main image container */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-foreground/5">
        {primaryMedia && (
          <LazyImage
            src={primaryMedia.attributes.url}
            alt={primaryMedia.attributes.alternativeText || work.attributes.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            onLoad={() => setImageLoaded(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            optimization={{
              quality: 85,
              format: 'webp',
              fit: 'cover'
            }}
            enableProgressiveLoading={true}
            showSkeleton={true}
          />
        )}

        {/* Loading skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-foreground/5 animate-pulse" />
        )}

        {/* Media type indicator */}
        {isVideo && (
          <div className="absolute top-3 left-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
            <PlayIcon className="w-3 h-3" />
            <span>Video</span>
          </div>
        )}

        {/* Multiple media indicator */}
        {hasMultipleMedia && (
          <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
            <EyeIcon className="w-3 h-3" />
            <span>{work.attributes.media.data.length}</span>
          </div>
        )}

        {/* Hover overlay */}
        <motion.div
          className="absolute inset-0 bg-black/60 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="text-white text-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ 
              y: isHovered ? 0 : 20, 
              opacity: isHovered ? 1 : 0 
            }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <EyeIcon className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm font-medium">View Details</p>
          </motion.div>
        </motion.div>

        {/* 3D shadow effect */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20 pointer-events-none"
          style={{
            transform: 'translateZ(-1px)',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
        />
      </div>

      {/* Work info */}
      <motion.div
        className="mt-4 space-y-2"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {work.attributes.title}
        </h3>
        
        {work.attributes.description && (
          <p className="text-sm text-foreground/70 line-clamp-2">
            {work.attributes.description}
          </p>
        )}

        {/* Tags */}
        {work.attributes.tags?.data && work.attributes.tags.data.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {work.attributes.tags.data.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="px-2 py-1 bg-foreground/10 text-foreground/70 text-xs rounded-full"
              >
                {tag.attributes.name}
              </span>
            ))}
            {work.attributes.tags.data.length > 3 && (
              <span className="px-2 py-1 bg-foreground/10 text-foreground/70 text-xs rounded-full">
                +{work.attributes.tags.data.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Software used */}
        {work.attributes.softwareUsed && work.attributes.softwareUsed.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {work.attributes.softwareUsed.slice(0, 2).map((software) => (
              <span
                key={software}
                className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
              >
                {software}
              </span>
            ))}
            {work.attributes.softwareUsed.length > 2 && (
              <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                +{work.attributes.softwareUsed.length - 2}
              </span>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}