'use client';

import { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global application error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
          <div className="text-center max-w-md">
            <div className="mb-8">
              {/* Critical Error Animation */}
              <div className="relative">
                <div className="text-8xl font-bold text-gray-200 dark:text-gray-700 select-none">
                  ⚠️
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                应用程序错误
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                应用程序遇到了一个严重错误，无法继续运行。
                <br />
                请刷新页面或稍后重试。
              </p>
              
              {process.env.NODE_ENV === 'development' && error.message && (
                <details className="mb-6 text-left">
                  <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                    错误详情 (开发模式)
                  </summary>
                  <div className="mt-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-md text-xs text-gray-800 dark:text-gray-200 overflow-auto max-h-40">
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
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  刷新页面
                </button>
              </div>
              
              <a
                href="/"
                className="inline-block px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded-md"
              >
                返回首页
              </a>
            </div>

            {/* Emergency contact */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                如果问题持续存在，这可能是一个严重的系统错误。
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-500">
                错误时间: {new Date().toLocaleString('zh-CN')}
                {error.digest && (
                  <>
                    <br />
                    错误ID: {error.digest}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}