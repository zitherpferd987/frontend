'use client';

import { cn } from '@/lib/utils';

// Generic loading spinner
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: 'primary' | 'secondary' | 'white';
}

export function LoadingSpinner({ 
  size = 'md', 
  className,
  color = 'primary' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-foreground/60',
    white: 'text-white',
  };

  return (
    <div className={cn('animate-spin', sizeClasses[size], colorClasses[color], className)}>
      <svg
        className="w-full h-full"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
    </div>
  );
}

// Loading button state
interface LoadingButtonProps {
  loading: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export function LoadingButton({
  loading,
  children,
  className,
  disabled,
  onClick,
  type = 'button',
}: LoadingButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'relative inline-flex items-center justify-center px-4 py-2 rounded-md transition-colors',
        'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      {loading && (
        <LoadingSpinner size="sm" color="white" className="mr-2" />
      )}
      <span className={cn(loading && 'opacity-70')}>{children}</span>
    </button>
  );
}

// Skeleton components
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const baseClasses = 'bg-foreground/10';
  
  const variantClasses = {
    text: 'rounded',
    rectangular: 'rounded-md',
    circular: 'rounded-full',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-pulse', // Could implement wave animation with CSS
    none: '',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        variant === 'text' && !height && 'h-4',
        className
      )}
      style={style}
    />
  );
}

// Blog post card skeleton
export function BlogPostSkeleton() {
  return (
    <div className="bg-background border border-foreground/10 rounded-lg overflow-hidden">
      <Skeleton variant="rectangular" className="w-full h-48" />
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <Skeleton variant="rectangular" width={60} height={20} />
          <Skeleton variant="rectangular" width={80} height={20} />
        </div>
        <Skeleton variant="text" className="h-6 mb-2" />
        <Skeleton variant="text" className="h-6 mb-4 w-3/4" />
        <Skeleton variant="text" className="h-4 mb-2" />
        <Skeleton variant="text" className="h-4 mb-2" />
        <Skeleton variant="text" className="h-4 w-2/3 mb-4" />
        <div className="flex items-center justify-between">
          <Skeleton variant="text" width={100} height={16} />
          <Skeleton variant="text" width={80} height={16} />
        </div>
      </div>
    </div>
  );
}

// Gallery work card skeleton
export function GalleryWorkSkeleton() {
  return (
    <div className="bg-background border border-foreground/10 rounded-lg overflow-hidden">
      <Skeleton variant="rectangular" className="w-full aspect-square" />
      <div className="p-4">
        <Skeleton variant="text" className="h-5 mb-2" />
        <Skeleton variant="text" className="h-4 w-3/4 mb-3" />
        <div className="flex gap-2">
          <Skeleton variant="rectangular" width={50} height={20} />
          <Skeleton variant="rectangular" width={60} height={20} />
        </div>
      </div>
    </div>
  );
}

// List skeleton
interface ListSkeletonProps {
  count?: number;
  itemHeight?: number;
  className?: string;
}

export function ListSkeleton({ count = 5, itemHeight = 60, className }: ListSkeletonProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton
          key={index}
          variant="rectangular"
          height={itemHeight}
          className="w-full"
        />
      ))}
    </div>
  );
}

// Page loading overlay
interface PageLoadingProps {
  message?: string;
  className?: string;
}

export function PageLoading({ message = '加载中...', className }: PageLoadingProps) {
  return (
    <div className={cn(
      'fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center',
      className
    )}>
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-foreground/60">{message}</p>
      </div>
    </div>
  );
}

// Content loading placeholder
interface ContentLoadingProps {
  title?: string;
  description?: string;
  className?: string;
}

export function ContentLoading({
  title = '正在加载内容...',
  description = '请稍候，内容正在加载中',
  className,
}: ContentLoadingProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12', className)}>
      <LoadingSpinner size="lg" className="mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-2">{title}</h3>
      <p className="text-foreground/60 text-center max-w-md">{description}</p>
    </div>
  );
}

// Inline loading state
interface InlineLoadingProps {
  text?: string;
  className?: string;
}

export function InlineLoading({ text = '加载中...', className }: InlineLoadingProps) {
  return (
    <div className={cn('flex items-center gap-2 text-foreground/60', className)}>
      <LoadingSpinner size="sm" />
      <span className="text-sm">{text}</span>
    </div>
  );
}