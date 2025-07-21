'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { getErrorMessage, getErrorType, shouldShowRetryButton } from '@/lib/error-handling';
import { LoadingButton } from './LoadingStates';

interface ErrorFeedbackProps {
  error: unknown;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  variant?: 'inline' | 'card' | 'banner';
  showDetails?: boolean;
  context?: string;
}

export function ErrorFeedback({
  error,
  onRetry,
  onDismiss,
  className,
  variant = 'card',
  showDetails = false,
  context,
}: ErrorFeedbackProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [showFullError, setShowFullError] = useState(false);

  const errorMessage = getErrorMessage(error);
  const errorType = getErrorType(error);
  const canRetry = shouldShowRetryButton(error);

  const handleRetry = async () => {
    if (!onRetry) return;
    
    setIsRetrying(true);
    try {
      await onRetry();
    } catch (retryError) {
      console.error('Retry failed:', retryError);
    } finally {
      setIsRetrying(false);
    }
  };

  const getErrorIcon = () => {
    switch (errorType) {
      case 'network':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 109.75 9.75A9.75 9.75 0 0012 2.25z" />
          </svg>
        );
      case 'server':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
          </svg>
        );
      case 'client':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getErrorTitle = () => {
    switch (errorType) {
      case 'network':
        return '网络连接错误';
      case 'server':
        return '服务器错误';
      case 'client':
        return '请求错误';
      default:
        return '发生错误';
    }
  };

  const getErrorDescription = () => {
    switch (errorType) {
      case 'network':
        return '无法连接到服务器，请检查您的网络连接';
      case 'server':
        return '服务器暂时无法处理请求，请稍后重试';
      case 'client':
        return '请求格式有误，请刷新页面重试';
      default:
        return '发生了意外错误，请重试或联系支持';
    }
  };

  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center gap-2 text-red-600 dark:text-red-400', className)}>
        {getErrorIcon()}
        <span className="text-sm">{errorMessage}</span>
        {canRetry && onRetry && (
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="text-xs underline hover:no-underline disabled:opacity-50"
          >
            {isRetrying ? '重试中...' : '重试'}
          </button>
        )}
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={cn(
        'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4',
        className
      )}>
        <div className="flex items-start gap-3">
          <div className="text-red-600 dark:text-red-400 mt-0.5">
            {getErrorIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
              {getErrorTitle()}
            </h4>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              {getErrorDescription()}
            </p>
            {context && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                上下文: {context}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {canRetry && onRetry && (
              <LoadingButton
                loading={isRetrying}
                onClick={handleRetry}
                className="text-xs px-3 py-1 bg-red-600 hover:bg-red-700"
              >
                重试
              </LoadingButton>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Card variant (default)
  return (
    <div className={cn(
      'bg-background border border-red-200 dark:border-red-800 rounded-lg p-6 text-center',
      className
    )}>
      <div className="w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
        <div className="text-red-600 dark:text-red-400">
          {getErrorIcon()}
        </div>
      </div>
      
      <h3 className="text-lg font-medium text-foreground mb-2">
        {getErrorTitle()}
      </h3>
      
      <p className="text-foreground/60 mb-4">
        {getErrorDescription()}
      </p>

      {showDetails && (
        <details className="mb-4 text-left">
          <summary className="cursor-pointer text-sm text-foreground/60 hover:text-foreground">
            错误详情
          </summary>
          <div className="mt-2 p-3 bg-foreground/5 rounded text-xs text-foreground/80 overflow-auto max-h-32">
            <pre className="whitespace-pre-wrap">{errorMessage}</pre>
          </div>
        </details>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {canRetry && onRetry && (
          <LoadingButton
            loading={isRetrying}
            onClick={handleRetry}
            className="bg-blue-600 hover:bg-blue-700"
          >
            重试
          </LoadingButton>
        )}
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 border border-foreground/20 text-foreground rounded-md hover:bg-foreground/5 transition-colors"
        >
          刷新页面
        </button>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="px-4 py-2 text-foreground/60 hover:text-foreground transition-colors"
          >
            关闭
          </button>
        )}
      </div>
    </div>
  );
}

// Toast-style error notification
interface ErrorToastProps {
  error: unknown;
  onDismiss: () => void;
  duration?: number;
}

export function ErrorToast({ error, onDismiss, duration = 5000 }: ErrorToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useState(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onDismiss, 300); // Wait for animation
    }, duration);

    return () => clearTimeout(timer);
  });

  const errorMessage = getErrorMessage(error);
  const errorType = getErrorType(error);

  return (
    <div className={cn(
      'fixed top-4 right-4 z-50 max-w-sm bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded-lg shadow-lg p-4',
      'transform transition-all duration-300 ease-in-out',
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    )}>
      <div className="flex items-start gap-3">
        <div className="text-red-600 dark:text-red-400 mt-0.5">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">
            {errorType === 'network' ? '网络错误' : '操作失败'}
          </p>
          <p className="text-xs text-foreground/60 mt-1 line-clamp-2">
            {errorMessage}
          </p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onDismiss, 300);
          }}
          className="text-foreground/40 hover:text-foreground/60"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}