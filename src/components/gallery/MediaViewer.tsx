'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Media } from '@/types';
import { LazyImage } from './LazyImage';
import { 
  PlayIcon, 
  PauseIcon, 
  SpeakerWaveIcon, 
  SpeakerXMarkIcon,
  ArrowsPointingOutIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon
} from '@heroicons/react/24/outline';

interface MediaViewerProps {
  media: Media;
  className?: string;
  autoPlay?: boolean;
  controls?: boolean;
}

export function MediaViewer({ 
  media, 
  className = '', 
  autoPlay = false,
  controls = true 
}: MediaViewerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isVideo = media.attributes.mime.startsWith('video/');
  const isImage = media.attributes.mime.startsWith('image/');

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.5, 5));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.5, 0.5));
  };

  const resetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative bg-black flex items-center justify-center overflow-hidden ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Media content */}
      <div
        className="relative max-w-full max-h-full"
        style={{
          transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
          cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
          transition: isDragging ? 'none' : 'transform 0.3s ease',
        }}
      >
        {isVideo ? (
          <video
            ref={videoRef}
            src={media.attributes.url}
            className="max-w-full max-h-full object-contain"
            muted={isMuted}
            loop
            playsInline
            onLoadedData={() => {
              if (autoPlay && videoRef.current) {
                videoRef.current.play();
              }
            }}
          />
        ) : isImage ? (
          <img
            src={media.attributes.url}
            alt={media.attributes.alternativeText || ''}
            className="max-w-full max-h-full object-contain"
            draggable={false}
          />
        ) : (
          <div className="flex items-center justify-center w-64 h-64 bg-foreground/10 rounded-lg">
            <p className="text-foreground/60">Unsupported media type</p>
          </div>
        )}
      </div>

      {/* Controls overlay */}
      {controls && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Video controls */}
          {isVideo && (
            <div className="absolute bottom-4 left-4 flex items-center space-x-2">
              <button
                onClick={togglePlay}
                className="p-2 bg-black/70 text-white rounded-full hover:bg-black/90 transition-colors"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <PauseIcon className="w-5 h-5" />
                ) : (
                  <PlayIcon className="w-5 h-5" />
                )}
              </button>
              
              <button
                onClick={toggleMute}
                className="p-2 bg-black/70 text-white rounded-full hover:bg-black/90 transition-colors"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <SpeakerXMarkIcon className="w-5 h-5" />
                ) : (
                  <SpeakerWaveIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          )}

          {/* Zoom controls */}
          {isImage && (
            <div className="absolute bottom-4 right-4 flex items-center space-x-2">
              <button
                onClick={handleZoomOut}
                className="p-2 bg-black/70 text-white rounded-full hover:bg-black/90 transition-colors"
                aria-label="Zoom out"
                disabled={zoom <= 0.5}
              >
                <MagnifyingGlassMinusIcon className="w-5 h-5" />
              </button>
              
              <button
                onClick={resetZoom}
                className="px-3 py-2 bg-black/70 text-white text-sm rounded-full hover:bg-black/90 transition-colors"
              >
                {Math.round(zoom * 100)}%
              </button>
              
              <button
                onClick={handleZoomIn}
                className="p-2 bg-black/70 text-white rounded-full hover:bg-black/90 transition-colors"
                aria-label="Zoom in"
                disabled={zoom >= 5}
              >
                <MagnifyingGlassPlusIcon className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Fullscreen button */}
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 p-2 bg-black/70 text-white rounded-full hover:bg-black/90 transition-colors"
            aria-label="Toggle fullscreen"
          >
            <ArrowsPointingOutIcon className="w-5 h-5" />
          </button>

          {/* Media info */}
          <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
            {isVideo ? 'Video' : 'Image'} • {media.attributes.ext.toUpperCase()}
          </div>
        </motion.div>
      )}

      {/* Loading indicator */}
      {isVideo && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin opacity-50" />
        </div>
      )}
    </div>
  );
}