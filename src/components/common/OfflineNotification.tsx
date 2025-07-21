'use client';

import { useOnlineStatus } from '@/hooks/use-online-status';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface OfflineNotificationProps {
  className?: string;
}

export function OfflineNotification({ className }: OfflineNotificationProps) {
  const { isOnline, wasOffline, downtime } = useOnlineStatus();
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (wasOffline && isOnline) {
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [wasOffline, isOnline]);

  const formatDowntime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes > 0) {
      return `${minutes}分${seconds % 60}秒`;
    }
    return `${seconds}秒`;
  };

  // Show offline notification
  if (!isOnline) {
    return (
      <div className={cn(
        'fixed top-0 left-0 right-0 z-50 bg-red-600 text-white px-4 py-3 text-center text-sm font-medium shadow-lg',
        'transform transition-transform duration-300 ease-in-out',
        className
      )}>
        <div className="flex items-center justify-center gap-2">
          <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 109.75 9.75A9.75 9.75 0 0012 2.25z" />
          </svg>
          <span>网络连接已断开，请检查您的网络设置</span>
        </div>
      </div>
    );
  }

  // Show reconnected notification
  if (showReconnected) {
    return (
      <div className={cn(
        'fixed top-0 left-0 right-0 z-50 bg-green-600 text-white px-4 py-3 text-center text-sm font-medium shadow-lg',
        'transform transition-transform duration-300 ease-in-out',
        className
      )}>
        <div className="flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            网络连接已恢复
            {downtime > 0 && ` (离线时长: ${formatDowntime(downtime)})`}
          </span>
        </div>
      </div>
    );
  }

  return null;
}

// Offline indicator for specific components
interface OfflineIndicatorProps {
  className?: string;
  showWhenOnline?: boolean;
}

export function OfflineIndicator({ className, showWhenOnline = false }: OfflineIndicatorProps) {
  const { isOnline } = useOnlineStatus();

  if (isOnline && !showWhenOnline) {
    return null;
  }

  return (
    <div className={cn(
      'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
      isOnline 
        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      className
    )}>
      <div className={cn(
        'w-2 h-2 rounded-full',
        isOnline ? 'bg-green-500' : 'bg-red-500 animate-pulse'
      )} />
      <span>{isOnline ? '在线' : '离线'}</span>
    </div>
  );
}

// Offline fallback content
interface OfflineFallbackProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

export function OfflineFallback({ children, fallback, className }: OfflineFallbackProps) {
  const { isOnline } = useOnlineStatus();

  if (!isOnline) {
    return (
      <div className={cn('text-center py-8', className)}>
        {fallback || (
          <div>
            <div className="w-16 h-16 mx-auto mb-4 bg-foreground/10 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 109.75 9.75A9.75 9.75 0 0012 2.25z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">网络连接不可用</h3>
            <p className="text-foreground/60 mb-4">
              此内容需要网络连接才能显示。请检查您的网络设置后重试。
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              重新加载
            </button>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
}