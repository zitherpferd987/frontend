import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '页面未找到 - 动画师博客',
  description: '抱歉，您访问的页面不存在。',
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          {/* 404 Animation */}
          <div className="relative">
            <div className="text-8xl font-bold text-foreground/10 select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center animate-pulse">
                <svg
                  className="w-12 h-12 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.291-1.007-5.691-2.709M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            页面未找到
          </h1>
          <p className="text-foreground/60 mb-6 leading-relaxed">
            抱歉，您访问的页面不存在或已被移动。
            <br />
            请检查网址是否正确，或返回首页继续浏览。
          </p>
        </div>

        {/* Navigation suggestions */}
        <div className="space-y-4 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/"
              className="group p-4 border border-foreground/20 rounded-lg hover:bg-foreground/5 transition-all duration-200 hover:border-blue-500/50"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-medium text-foreground">首页</div>
                  <div className="text-sm text-foreground/60">返回主页</div>
                </div>
              </div>
            </Link>

            <Link
              href="/blog"
              className="group p-4 border border-foreground/20 rounded-lg hover:bg-foreground/5 transition-all duration-200 hover:border-green-500/50"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-medium text-foreground">博客</div>
                  <div className="text-sm text-foreground/60">技术文章</div>
                </div>
              </div>
            </Link>
          </div>

          <Link
            href="/gallery"
            className="group block p-4 border border-foreground/20 rounded-lg hover:bg-foreground/5 transition-all duration-200 hover:border-purple-500/50"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="font-medium text-foreground">作品画廊</div>
                <div className="text-sm text-foreground/60">动画作品展示</div>
              </div>
            </div>
          </Link>
        </div>

        {/* Additional actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 border border-foreground/20 text-foreground rounded-md hover:bg-foreground/5 transition-colors focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:ring-offset-2"
          >
            返回上一页
          </button>
          <Link
            href="/"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-center"
          >
            回到首页
          </Link>
        </div>

        {/* Search suggestion */}
        <div className="mt-8 pt-6 border-t border-foreground/10">
          <p className="text-sm text-foreground/60 mb-3">
            没找到您要的内容？试试搜索：
          </p>
          <div className="flex max-w-sm mx-auto">
            <input
              type="text"
              placeholder="搜索文章或作品..."
              className="flex-1 px-3 py-2 border border-foreground/20 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-background text-foreground"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const query = (e.target as HTMLInputElement).value;
                  if (query.trim()) {
                    window.location.href = `/blog?search=${encodeURIComponent(query)}`;
                  }
                }
              }}
            />
            <button
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                const query = input.value;
                if (query.trim()) {
                  window.location.href = `/blog?search=${encodeURIComponent(query)}`;
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}