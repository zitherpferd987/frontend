import { onCLS, onINP, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';

// Enhanced Web Vitals optimization class
export default class WebVitalsOptimizer {
  private static instance: WebVitalsOptimizer;
  private observers: (PerformanceObserver | IntersectionObserver)[] = [];
  private optimizations: Map<string, boolean> = new Map();

  static getInstance(): WebVitalsOptimizer {
    if (!WebVitalsOptimizer.instance) {
      WebVitalsOptimizer.instance = new WebVitalsOptimizer();
    }
    return WebVitalsOptimizer.instance;
  }

  initialize() {
    if (typeof window === 'undefined') return;

    this.optimizeLCP();
    this.optimizeFID();
    this.optimizeCLS();
    this.optimizeFCP();
    this.optimizeTTFB();
    this.setupResourceOptimization();
    this.setupFontOptimization();
    this.setupImageOptimization();
  }

  // Largest Contentful Paint optimization
  private optimizeLCP() {
    if (this.optimizations.get('lcp')) return;
    this.optimizations.set('lcp', true);

    // Preload LCP candidate resources
    const lcpCandidates = document.querySelectorAll(
      'img[data-priority="high"], video[data-priority="high"], [data-lcp-candidate]'
    );

    lcpCandidates.forEach(element => {
      if (element instanceof HTMLImageElement) {
        this.preloadImage(element.src, element.srcset);
      } else if (element instanceof HTMLVideoElement) {
        this.preloadVideo(element.src);
      }
    });

    // Optimize critical CSS delivery
    this.inlineCriticalCSS();

    // Remove render-blocking resources
    this.deferNonCriticalCSS();

    // Monitor LCP and optimize dynamically
    onLCP((metric) => {
      if (metric.value > 2500) {
        console.warn('Poor LCP detected:', metric.value);
        this.handlePoorLCP(metric);
      }
    });
  }

  // First Input Delay / Interaction to Next Paint optimization
  private optimizeFID() {
    if (this.optimizations.get('fid')) return;
    this.optimizations.set('fid', true);

    // Break up long tasks
    this.implementTaskScheduling();

    // Optimize event handlers
    this.optimizeEventHandlers();

    // Defer non-essential JavaScript
    this.deferNonEssentialJS();

    // Monitor INP (replacement for FID)
    onINP((metric) => {
      if (metric.value > 200) {
        console.warn('Poor INP detected:', metric.value);
        this.handlePoorINP(metric);
      }
    });
  }

  // Cumulative Layout Shift optimization
  private optimizeCLS() {
    if (this.optimizations.get('cls')) return;
    this.optimizations.set('cls', true);

    // Set dimensions for images and videos
    this.setMediaDimensions();

    // Reserve space for dynamic content
    this.reserveSpaceForDynamicContent();

    // Optimize font loading
    this.optimizeFontLoading();

    // Monitor layout shifts
    onCLS((metric) => {
      if (metric.value > 0.1) {
        console.warn('Poor CLS detected:', metric.value);
        this.handlePoorCLS(metric);
      }
    });
  }

  // First Contentful Paint optimization
  private optimizeFCP() {
    if (this.optimizations.get('fcp')) return;
    this.optimizations.set('fcp', true);

    // Inline critical CSS
    this.inlineCriticalCSS();

    // Preconnect to external domains
    this.addPreconnectHints();

    // Optimize resource loading order
    this.optimizeResourcePriority();

    onFCP((metric) => {
      if (metric.value > 1800) {
        console.warn('Poor FCP detected:', metric.value);
        this.handlePoorFCP(metric);
      }
    });
  }

  // Time to First Byte optimization
  private optimizeTTFB() {
    if (this.optimizations.get('ttfb')) return;
    this.optimizations.set('ttfb', true);

    // Enable service worker caching
    this.enableServiceWorkerCaching();

    // Prefetch critical resources
    this.prefetchCriticalResources();

    onTTFB((metric) => {
      if (metric.value > 800) {
        console.warn('Poor TTFB detected:', metric.value);
        this.handlePoorTTFB(metric);
      }
    });
  }

  // Resource optimization
  private setupResourceOptimization() {
    // Implement resource hints
    this.addResourceHints();

    // Optimize third-party resources
    this.optimizeThirdPartyResources();

    // Monitor resource loading
    this.monitorResourceLoading();
  }

  // Font optimization
  private setupFontOptimization() {
    // Preload critical fonts
    const criticalFonts = [
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
    ];

    criticalFonts.forEach(fontUrl => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = fontUrl;
      document.head.appendChild(link);
    });

    // Use font-display: swap
    const fontFaces = document.querySelectorAll('style');
    fontFaces.forEach(style => {
      if (style.textContent?.includes('@font-face')) {
        style.textContent = style.textContent.replace(
          /@font-face\s*{([^}]*)}/g,
          '@font-face{$1;font-display:swap;}'
        );
      }
    });
  }

  // Image optimization
  private setupImageOptimization() {
    // Implement lazy loading for images
    const images = document.querySelectorAll('img[data-lazy]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-lazy');
              imageObserver.unobserve(img);
            }
          }
        });
      }, {
        rootMargin: '50px'
      });

      images.forEach(img => imageObserver.observe(img));
      this.observers.push(imageObserver);
    }

    // Optimize image formats
    this.optimizeImageFormats();
  }

  // Helper methods
  private preloadImage(src: string, srcset?: string) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    if (srcset) link.setAttribute('imagesrcset', srcset);
    document.head.appendChild(link);
  }

  private preloadVideo(src: string) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'video';
    link.href = src;
    document.head.appendChild(link);
  }

  private inlineCriticalCSS() {
    const criticalCSS = `
      /* Critical above-the-fold styles */
      body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }
      .hero-banner { min-height: 100vh; display: flex; align-items: center; }
      .loading-spinner { animation: spin 1s linear infinite; }
      @keyframes spin { to { transform: rotate(360deg); } }
      
      /* Layout stability */
      img, video { height: auto; }
      .aspect-video { aspect-ratio: 16/9; }
      .aspect-square { aspect-ratio: 1/1; }
      
      /* Performance optimizations */
      * { box-sizing: border-box; }
      img { content-visibility: auto; }
    `;

    const style = document.createElement('style');
    style.textContent = criticalCSS;
    style.setAttribute('data-critical', 'true');
    document.head.insertBefore(style, document.head.firstChild);
  }

  private deferNonCriticalCSS() {
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]:not([data-critical])');
    
    stylesheets.forEach(link => {
      if (link instanceof HTMLLinkElement) {
        link.media = 'print';
        link.onload = () => {
          link.media = 'all';
        };
      }
    });
  }

  private implementTaskScheduling() {
    // Implement scheduler for breaking up long tasks
    const scheduler = {
      postTask: (callback: () => void, priority: 'user-blocking' | 'user-visible' | 'background' = 'user-visible') => {
        if ('scheduler' in window && 'postTask' in (window as any).scheduler) {
          return (window as any).scheduler.postTask(callback, { priority });
        } else {
          // Fallback to setTimeout
          return setTimeout(callback, 0);
        }
      }
    };

    // Make scheduler available globally
    (window as any).taskScheduler = scheduler;
  }

  private optimizeEventHandlers() {
    // Debounce scroll events
    let scrollTimeout: NodeJS.Timeout;
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    
    EventTarget.prototype.addEventListener = function(type, listener, options) {
      if (type === 'scroll' && typeof listener === 'function') {
        const debouncedListener = (event: Event) => {
          clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(() => listener(event), 16); // ~60fps
        };
        return originalAddEventListener.call(this, type, debouncedListener, options);
      }
      return originalAddEventListener.call(this, type, listener, options);
    };
  }

  private deferNonEssentialJS() {
    const scripts = document.querySelectorAll('script[data-defer]');
    
    scripts.forEach(script => {
      if (script instanceof HTMLScriptElement) {
        script.defer = true;
      }
    });
  }

  private setMediaDimensions() {
    const media = document.querySelectorAll('img:not([width]), video:not([width])');
    
    media.forEach(element => {
      if (element instanceof HTMLImageElement || element instanceof HTMLVideoElement) {
        // Set aspect ratio to prevent layout shift
        if (!element.style.aspectRatio) {
          element.style.aspectRatio = 'auto';
        }
      }
    });
  }

  private reserveSpaceForDynamicContent() {
    // Add skeleton placeholders for dynamic content
    const dynamicContainers = document.querySelectorAll('[data-dynamic-content]');
    
    dynamicContainers.forEach(container => {
      if (!container.hasChildNodes()) {
        const skeleton = document.createElement('div');
        skeleton.className = 'animate-pulse bg-gray-200 h-32 rounded';
        skeleton.setAttribute('data-skeleton', 'true');
        container.appendChild(skeleton);
      }
    });
  }

  private optimizeFontLoading() {
    // Preload critical fonts
    if ('fonts' in document) {
      document.fonts.ready.then(() => {
        console.log('Fonts loaded');
        // Remove font loading indicators
        document.querySelectorAll('[data-font-loading]').forEach(el => {
          el.removeAttribute('data-font-loading');
        });
      });
    }
  }

  private addPreconnectHints() {
    const domains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'
    ];

    domains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      document.head.appendChild(link);
    });
  }

  private optimizeResourcePriority() {
    // Set fetchpriority for critical resources
    const criticalImages = document.querySelectorAll('img[data-priority="high"]');
    criticalImages.forEach(img => {
      if (img instanceof HTMLImageElement) {
        img.setAttribute('fetchpriority', 'high');
      }
    });

    const nonCriticalImages = document.querySelectorAll('img:not([data-priority="high"])');
    nonCriticalImages.forEach(img => {
      if (img instanceof HTMLImageElement) {
        img.setAttribute('fetchpriority', 'low');
      }
    });
  }

  private enableServiceWorkerCaching() {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(error => {
        console.warn('Service worker registration failed:', error);
      });
    }
  }

  private prefetchCriticalResources() {
    const criticalResources = [
      '/api/blog-posts?pagination[page]=1&pagination[pageSize]=6',
      '/api/gallery-works?pagination[page]=1&pagination[pageSize]=9'
    ];

    criticalResources.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
    });
  }

  private addResourceHints() {
    const hints = [
      { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
      { rel: 'dns-prefetch', href: '//fonts.gstatic.com' },
      { rel: 'preconnect', href: process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337' },
    ];

    hints.forEach(hint => {
      const existing = document.querySelector(`link[rel="${hint.rel}"][href="${hint.href}"]`);
      if (!existing) {
        const link = document.createElement('link');
        link.rel = hint.rel;
        link.href = hint.href;
        document.head.appendChild(link);
      }
    });
  }

  private optimizeThirdPartyResources() {
    // Defer third-party scripts
    const thirdPartyScripts = document.querySelectorAll('script[src*="google"], script[src*="facebook"], script[src*="twitter"]');
    
    thirdPartyScripts.forEach(script => {
      if (script instanceof HTMLScriptElement) {
        script.defer = true;
        script.setAttribute('data-third-party', 'true');
      }
    });
  }

  private monitorResourceLoading() {
    if (!('PerformanceObserver' in window)) return;

    const resourceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry) => {
        const resource = entry as PerformanceResourceTiming;
        
        // Log slow resources
        if (resource.duration > 1000) {
          console.warn(`Slow resource: ${resource.name} (${resource.duration}ms)`);
        }
        
        // Log large resources
        if (resource.transferSize > 1024 * 1024) { // 1MB
          console.warn(`Large resource: ${resource.name} (${(resource.transferSize / 1024 / 1024).toFixed(2)}MB)`);
        }
      });
    });

    resourceObserver.observe({ entryTypes: ['resource'] });
    this.observers.push(resourceObserver);
  }

  private optimizeImageFormats() {
    // Convert images to WebP where supported
    if (this.supportsWebP()) {
      const images = document.querySelectorAll('img[data-webp]');
      images.forEach(img => {
        if (img instanceof HTMLImageElement && img.dataset.webp) {
          img.src = img.dataset.webp;
        }
      });
    }
  }

  private supportsWebP(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  // Error handlers for poor metrics
  private handlePoorLCP(metric: Metric) {
    // Implement LCP improvement strategies
    console.log('Implementing LCP improvements...');
    
    // Additional preloading
    this.preloadAdditionalResources();
    
    // Report to analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'poor_lcp', {
        event_category: 'Performance',
        value: Math.round(metric.value),
      });
    }
  }

  private handlePoorINP(metric: Metric) {
    console.log('Implementing INP improvements...');
    
    // Additional task scheduling
    this.implementAdditionalTaskScheduling();
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'poor_inp', {
        event_category: 'Performance',
        value: Math.round(metric.value),
      });
    }
  }

  private handlePoorCLS(metric: Metric) {
    console.log('Implementing CLS improvements...');
    
    // Additional layout stability measures
    this.implementAdditionalLayoutStability();
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'poor_cls', {
        event_category: 'Performance',
        value: Math.round(metric.value * 1000),
      });
    }
  }

  private handlePoorFCP(metric: Metric) {
    console.log('Implementing FCP improvements...');
    
    // Additional critical resource optimization
    this.optimizeAdditionalCriticalResources();
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'poor_fcp', {
        event_category: 'Performance',
        value: Math.round(metric.value),
      });
    }
  }

  private handlePoorTTFB(metric: Metric) {
    console.log('Implementing TTFB improvements...');
    
    // Additional caching strategies
    this.implementAdditionalCaching();
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'poor_ttfb', {
        event_category: 'Performance',
        value: Math.round(metric.value),
      });
    }
  }

  // Additional optimization methods
  private preloadAdditionalResources() {
    // Preload more critical resources
    const additionalResources = [
      '/api/featured',
      '/api/categories',
    ];

    additionalResources.forEach(url => {
      fetch(url, { method: 'HEAD' }).catch(() => {});
    });
  }

  private implementAdditionalTaskScheduling() {
    // More aggressive task scheduling
    const longTasks = document.querySelectorAll('[data-heavy-task]');
    
    longTasks.forEach(element => {
      if (element instanceof HTMLElement) {
        element.style.contentVisibility = 'auto';
      }
    });
  }

  private implementAdditionalLayoutStability() {
    // More layout stability measures
    const dynamicElements = document.querySelectorAll('[data-dynamic-height]');
    
    dynamicElements.forEach(element => {
      if (element instanceof HTMLElement) {
        element.style.minHeight = element.style.minHeight || '200px';
      }
    });
  }

  private optimizeAdditionalCriticalResources() {
    // More critical resource optimization
    const criticalScripts = document.querySelectorAll('script[data-critical]');
    
    criticalScripts.forEach(script => {
      if (script instanceof HTMLScriptElement) {
        script.setAttribute('fetchpriority', 'high');
      }
    });
  }

  private implementAdditionalCaching() {
    // More aggressive caching
    if ('caches' in window) {
      caches.open('performance-cache-v1').then(cache => {
        const criticalUrls = [
          '/',
          '/blog',
          '/gallery',
        ];
        
        cache.addAll(criticalUrls).catch(console.error);
      });
    }
  }

  // Cleanup method
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.optimizations.clear();
  }
}