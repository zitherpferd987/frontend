'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          {/* Error Animation */}
          <div className="relative">
            <div className="text-8xl font-bold text-foreground/10 select-none">
              500
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center animate-pulse">
                <svg
                  className="w-12 h-12 text-red-600 dark:text-red-400"
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
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            服务器错误
          </h1>
          <p className="text-foreground/60 mb-6 leading-relaxed">
            抱歉，服务器遇到了一个错误。
            <br />
            我们正在努力解决这个问题，请稍后重试。
          </p>
          
          {process.env.NODE_ENV === 'development' && error.message && (
            <details className="mb-6 text-left">
              <summary className="cursor-pointer text-sm text-foreground/60 hover:text-foreground">
                错误详情 (开发模式)
              </summary>
              <div className="mt-2 p-4 bg-foreground/5 rounded-md text-xs text-foreground/80 overflow-auto max-h-40">
                <div className="font-semibold mb-2">错误信息:</div>
                <div className="mb-4">{error.message}</div>
                {error.stack && (
                  <>
                    <div className="font-semibold mb-2">堆栈跟踪:</div>
                    <pre className="whitespace-pre-wrap">{error.stack}</pre>
                  </>
                )}
                {error.digest && (
                  <>
                    <div className="font-semibold mb-2">错误ID:</div>
                    <div>{error.digest}</div>
                  </>
                )}
              </div>
            </details>
          )}
        </div>

        {/* Action buttons */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              重试
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 border border-foreground/20 text-foreground rounded-md hover:bg-foreground/5 transition-colors focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:ring-offset-2"
            >
              刷新页面
            </button>
          </div>
          
          <Link
            href="/"
            className="inline-block px-6 py-2 text-foreground/60 hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:ring-offset-2 rounded-md"
          >
            返回首页
          </Link>
        </div>

        {/* Help information */}
        <div className="pt-6 border-t border-foreground/10">
          <p className="text-sm text-foreground/60 mb-3">
            如果问题持续存在，您可以：
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-center gap-2 text-foreground/60">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>稍后重试</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-foreground/60">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.291-1.007-5.691-2.709M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span>清除浏览器缓存</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-foreground/60">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>联系技术支持</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}