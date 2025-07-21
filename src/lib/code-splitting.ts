import dynamic from 'next/dynamic';
import { ComponentType, ReactElement, Suspense, useState, useEffect, useRef, createElement } from 'react';

// Advanced code splitting utilities
export interface LazyLoadOptions {
  loading?: () => ReactElement;
  ssr?: boolean;
  suspense?: boolean;
  preload?: boolean;
}

// Route-based code splitting with preloading
export class RouteCodeSplitter {
  private static preloadedRoutes = new Set<string>();
  
  static preloadRoute(routePath: string) {
    if (this.preloadedRoutes.has(routePath)) return;
    
    this.preloadedRoutes.add(routePath);
    
    // Preload route components
    switch (routePath) {
      case '/blog':
        import('@/app/blog/page');
        import('@/components/blog/PostList');
        break;
      case '/gallery':
        import('@/app/gallery/page');
        import('@/components/gallery/WorkGrid');
        break;
      case '/blog/[slug]':
        import('@/components/blog/PostDetail');
        import('@/components/blog/CodeBlock');
        break;
      case '/gallery/[id]':
        import('@/components/gallery/WorkModal');
        import('@/components/gallery/MediaViewer');
        break;
    }
  }
  
  static preloadOnHover(element: HTMLElement, routePath: string) {
    let timeoutId: NodeJS.Timeout;
    
    const handleMouseEnter = () => {
      timeoutId = setTimeout(() => {
        this.preloadRoute(routePath);
      }, 100); // Small delay to avoid unnecessary preloads
    };
    
    const handleMouseLeave = () => {
      clearTimeout(timeoutId);
    };
    
    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(timeoutId);
    };
  }
}

// Component-level code splitting with intersection observer
export function createLazyComponent<T extends object>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  options: LazyLoadOptions = {}
) {
  const {
    loading = () => createElement('div', { className: 'animate-pulse bg-gray-200 h-32 rounded' }),
    ssr = true,
    suspense = false,
  } = options;

  const LazyComponent = dynamic(importFn, {
    loading,
    ssr,
  });

  return LazyComponent;
}

// Intersection observer based lazy loading
export function withIntersectionObserver<T extends object>(
  Component: ComponentType<T>,
  options: IntersectionObserverInit = {}
) {
  return function IntersectionObserverWrapper(props: T) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        },
        {
          threshold: 0.1,
          rootMargin: '50px',
          ...options,
        }
      );

      if (ref.current) {
        observer.observe(ref.current);
      }

      return () => observer.disconnect();
    }, []);

    return createElement('div', { ref }, 
      isVisible 
        ? createElement(Component, props)
        : createElement('div', { className: 'animate-pulse bg-gray-200 h-32 rounded' })
    );
  };
}

// Bundle splitting configuration
export const BUNDLE_SPLITTING_CONFIG = {
  // Vendor chunks
  vendors: {
    react: ['react', 'react-dom'],
    animation: ['framer-motion'],
    ui: ['lucide-react'],
    utils: ['clsx', 'tailwind-merge'],
  },
  
  // Page chunks
  pages: {
    home: ['@/components/home'],
    blog: ['@/components/blog'],
    gallery: ['@/components/gallery'],
  },
  
  // Feature chunks
  features: {
    analytics: ['@/lib/performance', '@/lib/analytics'],
    media: ['@/lib/media-service', '@/lib/image-optimization'],
    animations: ['@/components/animations'],
  },
};

// Dynamic import with retry logic
export async function dynamicImportWithRetry<T>(
  importFn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await importFn();
    } catch (error) {
      if (i === retries - 1) throw error;
      
      console.warn(`Import failed, retrying... (${i + 1}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
  
  throw new Error('All import retries failed');
}

// Preload critical resources
export function preloadCriticalResources() {
  if (typeof window === 'undefined') return;
  
  // Preload critical CSS
  const criticalStyles = [
    '/globals.css',
  ];
  
  criticalStyles.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    document.head.appendChild(link);
  });
  
  // Preload critical fonts
  const criticalFonts = [
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  ];
  
  criticalFonts.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    document.head.appendChild(link);
  });
  
  // Preload critical images
  const criticalImages = document.querySelectorAll('img[data-priority="high"]');
  criticalImages.forEach(img => {
    if (img instanceof HTMLImageElement) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = img.src;
      document.head.appendChild(link);
    }
  });
}

// Module federation for micro-frontends (future enhancement)
export class ModuleFederation {
  private static loadedModules = new Map<string, any>();
  
  static async loadRemoteModule(
    remoteName: string,
    moduleName: string,
    fallback?: ComponentType
  ) {
    const key = `${remoteName}/${moduleName}`;
    
    if (this.loadedModules.has(key)) {
      return this.loadedModules.get(key);
    }
    
    try {
      // This would be used with Module Federation in a micro-frontend setup
      const module = await dynamicImportWithRetry(
        () => import(/* webpackIgnore: true */ `${remoteName}/${moduleName}`)
      );
      
      this.loadedModules.set(key, module);
      return module;
    } catch (error) {
      console.error(`Failed to load remote module ${key}:`, error);
      return fallback || null;
    }
  }
}

// Performance-aware code splitting
export function createPerformanceAwareLazyComponent<T extends object>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  options: LazyLoadOptions & {
    priority?: 'high' | 'medium' | 'low';
    maxLoadTime?: number;
  } = {}
) {
  const {
    priority = 'medium',
    maxLoadTime = 5000,
    ...lazyOptions
  } = options;
  
  return dynamic(
    async () => {
      const startTime = performance.now();
      
      try {
        const module = await Promise.race([
          importFn(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Load timeout')), maxLoadTime)
          ),
        ]);
        
        const loadTime = performance.now() - startTime;
        
        // Report performance metrics
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'component_load_time', {
            event_category: 'Performance',
            event_label: `${priority}_priority_component`,
            value: Math.round(loadTime),
          });
        }
        
        return module;
      } catch (error) {
        console.error('Component loading failed:', error);
        throw error;
      }
    },
    {
      ...lazyOptions,
      loading: lazyOptions.loading || (() => 
        createElement('div', { 
          className: `animate-pulse bg-gray-200 rounded ${
            priority === 'high' ? 'h-64' : priority === 'medium' ? 'h-32' : 'h-16'
          }` 
        })
      ),
    }
  );
}