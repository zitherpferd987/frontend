import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-foreground/20 border-t-primary',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

interface LoadingPageProps {
  message?: string;
}

export function LoadingPage({ message = 'Loading...' }: LoadingPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-foreground/60">{message}</p>
      </div>
    </div>
  );
}

interface LoadingSectionProps {
  message?: string;
  className?: string;
}

export function LoadingSection({ message = 'Loading...', className }: LoadingSectionProps) {
  return (
    <div className={cn('flex items-center justify-center py-12', className)}>
      <div className="text-center">
        <LoadingSpinner className="mx-auto mb-2" />
        <p className="text-foreground/60 text-sm">{message}</p>
      </div>
    </div>
  );
}