'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'page' | 'component' | 'global';
}

interface State {
  hasError: boolean;
  error?: Error;
  errorId?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return { hasError: true, error, errorId };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Report error to monitoring service
    this.reportError(error, errorInfo);
    
    this.props.onError?.(error, errorInfo);
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // In a real app, you would send this to an error reporting service
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      level: this.props.level || 'component'
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Report');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Report:', errorReport);
      console.groupEnd();
    }

    // Here you would typically send to your error reporting service
    // Example: Sentry, LogRocket, Bugsnag, etc.
  };

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({ hasError: false, error: undefined, errorId: undefined });
    }
  };

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          errorId={this.state.errorId}
          level={this.props.level}
          retryCount={this.retryCount}
          maxRetries={this.maxRetries}
          onRetry={this.handleRetry}
          onReload={this.handleReload}
          className={this.props.className}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  errorId?: string;
  level?: 'page' | 'component' | 'global';
  retryCount: number;
  maxRetries: number;
  onRetry: () => void;
  onReload: () => void;
  className?: string;
}

function ErrorFallback({ 
  error, 
  errorId, 
  level = 'component',
  retryCount, 
  maxRetries, 
  onRetry, 
  onReload, 
  className 
}: ErrorFallbackProps) {
  const isGlobalError = level === 'global';
  const canRetry = retryCount < maxRetries;

  const getErrorMessage = () => {
    if (level === 'global') {
      return 'The application encountered a critical error. Please reload the page.';
    }
    if (level === 'page') {
      return 'This page failed to load properly. Please try refreshing or navigate to another page.';
    }
    return 'This component failed to load. You can try again or continue browsing.';
  };

  const getErrorTitle = () => {
    if (level === 'global') return 'Application Error';
    if (level === 'page') return 'Page Error';
    return 'Something went wrong';
  };

  return (
    <div className={cn(
      'flex items-center justify-center p-8',
      isGlobalError ? 'min-h-screen bg-background' : 'min-h-[400px]',
      className
    )}>
      <div className="text-center max-w-md">
        <div className="mb-6">
          <div className={cn(
            'mx-auto mb-4 rounded-full flex items-center justify-center',
            isGlobalError 
              ? 'w-20 h-20 bg-red-100 dark:bg-red-900/20' 
              : 'w-16 h-16 bg-red-100 dark:bg-red-900/20'
          )}>
            <svg
              className={cn(
                'text-red-600 dark:text-red-400',
                isGlobalError ? 'w-10 h-10' : 'w-8 h-8'
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className={cn(
            'font-semibold text-foreground mb-2',
            isGlobalError ? 'text-2xl' : 'text-xl'
          )}>
            {getErrorTitle()}
          </h2>
          <p className="text-foreground/60 mb-6">
            {getErrorMessage()}
          </p>
          
          {errorId && (
            <p className="text-xs text-foreground/40 mb-4">
              Error ID: {errorId}
            </p>
          )}
        </div>

        {process.env.NODE_ENV === 'development' && error && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-sm text-foreground/60 hover:text-foreground">
              Error Details (Development)
            </summary>
            <div className="mt-2 p-4 bg-foreground/5 rounded-md text-xs text-foreground/80 overflow-auto max-h-40">
              <div className="font-semibold mb-2">Message:</div>
              <div className="mb-4">{error.message}</div>
              {error.stack && (
                <>
                  <div className="font-semibold mb-2">Stack Trace:</div>
                  <pre className="whitespace-pre-wrap">{error.stack}</pre>
                </>
              )}
            </div>
          </details>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {canRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Try Again {retryCount > 0 && `(${maxRetries - retryCount} left)`}
            </button>
          )}
          <button
            onClick={onReload}
            className="px-4 py-2 border border-foreground/20 text-foreground rounded-md hover:bg-foreground/5 transition-colors focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:ring-offset-2"
          >
            {isGlobalError ? 'Reload Application' : 'Reload Page'}
          </button>
          {!isGlobalError && (
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 text-foreground/60 hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:ring-offset-2 rounded-md"
            >
              Go Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Hook for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Error caught by error handler:', error, errorInfo);
    // You can add error reporting service here
  };
}

// Simple error fallback for specific components
interface SimpleErrorFallbackProps {
  message?: string;
  className?: string;
  onRetry?: () => void;
}

export function SimpleErrorFallback({ 
  message = 'Something went wrong', 
  className,
  onRetry 
}: SimpleErrorFallbackProps) {
  return (
    <div className={cn('flex items-center justify-center p-8 text-center', className)}>
      <div>
        <div className="w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
          <svg
            className="w-6 h-6 text-red-600 dark:text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-foreground/60 mb-4">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}