import { onCLS, onINP, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';

// Core Web Vitals thresholds
export const WEB_VITALS_THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 }, // Largest Contentful Paint
  FID: { good: 100, needsImprovement: 300 },   // First Input Delay
  CLS: { good: 0.1, needsImprovement: 0.25 },  // Cumulative Layout Shift
  FCP: { good: 1800, needsImprovement: 3000 }, // First Contentful Paint
  TTFB: { good: 800, needsImprovement: 1800 }, // Time to First Byte
} as const;

// Performance optimization utilities
export class WebVitalsOptimizer {
  private static instance: WebVitalsOptimizer;
  private metrics: Map<string, Metric> = new Map();
  private observers: Map<string, PerformanceObserver> = new Map();

  static getInstance(): WebVitalsOptimizer {
    if (!WebVitalsOptimizer.instance) {
      WebVitalsOptimizer.instance = new WebVitalsOptimizer();
    }
    return WebVitalsOptimizer.instance;
  }

  // Initialize Core Web Vitals monitoring
  initializeMonitoring() {
    if (typeof window === 'undefined') return;

    // Monitor all Core Web Vitals
    onCLS(this.handleMetric.bind(this));
    onINP(this.handleMetric.bind(this)); // INP replaced FID
    onFCP(this.handleMetric.bind(this));
    onLCP(this.handleMetric.bind(this));
    onTTFB(this.handleMetric.bind(this));

    // Initialize performance optimizations
    this.optimizeLCP();
    this.optimizeFID();
    this.optimizeCLS();
    this.optimizeFCP();
    this.optimizeTTFB();
  }

  private handleMetric(metric: Metric) {
    this.metrics.set(metric.name, metric);
    
    // Send to analytics
    this.sendToAnalytics(metric);
    
    // Log performance issues in development
    if (process.env.NODE_ENV === 'development') {
      const threshold = this.getThreshold(metric.name);
      if (threshold && metric.value > threshold.needsImprovement) {
        console.warn(`Poor ${metric.name}: ${metric.value}ms (threshold: ${threshold.good}ms)`);
      }
    }
  }

  private getThreshold(metricName: string) {
    return WEB_VITALS_THRESHOLDS[metricName as keyof typeof WEB_VITALS_THRESHOLDS];
  }

  private sendToAnalytics(metric: Metric) {
    // Send to Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', metric.name, {
        event_category: 'Web Vitals',
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        event_label: metric.id,
        non_interaction: true,
      });
    }

    // Send to custom analytics endpoint
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/analytics/web-vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: metric.name,
          value: metric.value,
          id: metric.id,
          url: window.location.href,
          timestamp: Date.now(),
        }),
      }).catch(console.error);
    }
  }

  // Optimize Largest Contentful Paint (LCP)
  private optimizeLCP() {
    // Preload critical resources
    this.preloadCriticalResources();
    
    // Optimize images
    this.optimizeImages();
    
    // Monitor LCP elements
    this.monitorLCPElements();
  }

  // Optimize First Input Delay (FID)
  private optimizeFID() {
    // Break up long tasks
    this.breakUpLongTasks();
    
    // Use web workers for heavy computations
    this.initializeWebWorkers();
    
    // Optimize event handlers
    this.optimizeEventHandlers();
  }

  // Optimize Cumulative Layout Shift (CLS)
  private optimizeCLS() {
    // Reserve space for dynamic content
    this.reserveSpaceForDynamicContent();
    
    // Monitor layout shifts
    this.monitorLayoutShifts();
    
    // Optimize font loading
    this.optimizeFontLoading();
  }

  // Optimize First Contentful Paint (FCP)
  private optimizeFCP() {
    // Inline critical CSS
    this.inlineCriticalCSS();
    
    // Optimize resource loading
    this.optimizeResourceLoading();
  }

  // Optimize Time to First Byte (TTFB)
  private optimizeTTFB() {
    // Implement service worker caching
    this.implementServiceWorkerCaching();
    
    // Optimize API calls
    this.optimizeAPICalls();
  }

  private preloadCriticalResources() {
    const criticalResources = [
      // Critical fonts
      '/fonts/inter-var.woff2',
      '/fonts/jetbrains-mono-var.woff2',
      // Critical images
      '/images/hero-bg.webp',
      // Critical API endpoints
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/blog-posts?pagination[page]=1&pagination[pageSize]=3`,
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      
      if (resource.includes('.woff2')) {
        link.as = 'font';
        link.type = 'font/woff2';
        link.crossOrigin = 'anonymous';
      } else if (resource.includes('.webp') || resource.includes('.jpg') || resource.includes('.png')) {
        link.as = 'image';
      } else if (resource.includes('/api/')) {
        link.as = 'fetch';
        link.crossOrigin = 'anonymous';
      }
      
      document.head.appendChild(link);
    });
  }

  private optimizeImages() {
    // Add loading="lazy" to images below the fold
    const images = document.querySelectorAll('img:not([loading])');
    images.forEach((img, index) => {
      if (index > 2) { // First 3 images load eagerly
        img.setAttribute('loading', 'lazy');
      }
    });

    // Add aspect ratio to prevent layout shift
    const unstyledImages = document.querySelectorAll('img:not([width]):not([height])');
    unstyledImages.forEach(img => {
      (img as HTMLImageElement).style.aspectRatio = '16/9';
    });
  }

  private monitorLCPElements() {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      
      if (lastEntry?.element) {
        // Optimize the LCP element
        this.optimizeLCPElement(lastEntry.element);
      }
    });

    observer.observe({ type: 'largest-contentful-paint', buffered: true });
    this.observers.set('lcp', observer);
  }

  private optimizeLCPElement(element: Element) {
    // Add priority hints
    if (element.tagName === 'IMG') {
      element.setAttribute('fetchpriority', 'high');
      element.setAttribute('loading', 'eager');
    }
    
    // Preload if it's a background image
    const bgImage = window.getComputedStyle(element).backgroundImage;
    if (bgImage && bgImage !== 'none') {
      const imageUrl = bgImage.slice(5, -2); // Remove url(" and ")
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = imageUrl;
      link.as = 'image';
      document.head.appendChild(link);
    }
  }

  private breakUpLongTasks() {
    // Use scheduler.postTask if available, otherwise setTimeout
    const scheduler = (window as any).scheduler;
    
    if (scheduler?.postTask) {
      // Use modern scheduler API
      this.scheduleWithPriority = (callback: () => void, priority: 'user-blocking' | 'user-visible' | 'background' = 'user-visible') => {
        scheduler.postTask(callback, { priority });
      };
    } else {
      // Fallback to setTimeout with MessageChannel for better performance
      this.scheduleWithPriority = (callback: () => void) => {
        const channel = new MessageChannel();
        channel.port2.onmessage = () => callback();
        channel.port1.postMessage(null);
      };
    }
  }

  private scheduleWithPriority: (callback: () => void, priority?: 'user-blocking' | 'user-visible' | 'background') => void = () => {};

  private initializeWebWorkers() {
    // Initialize web worker for heavy computations
    if ('Worker' in window) {
      const workerScript = `
        self.onmessage = function(e) {
          const { type, data } = e.data;
          
          switch(type) {
            case 'IMAGE_PROCESSING':
              // Process images in worker
              self.postMessage({ type: 'IMAGE_PROCESSED', data: processImage(data) });
              break;
            case 'DATA_PROCESSING':
              // Process large datasets
              self.postMessage({ type: 'DATA_PROCESSED', data: processData(data) });
              break;
          }
        };
        
        function processImage(imageData) {
          // Image processing logic
          return imageData;
        }
        
        function processData(data) {
          // Data processing logic
          return data;
        }
      `;
      
      const blob = new Blob([workerScript], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      
      try {
        const worker = new Worker(workerUrl);
        (window as any).performanceWorker = worker;
      } catch (error) {
        console.warn('Failed to initialize web worker:', error);
      }
    }
  }

  private optimizeEventHandlers() {
    // Use passive event listeners for scroll and touch events
    const passiveEvents = ['scroll', 'touchstart', 'touchmove', 'wheel'];
    
    passiveEvents.forEach(eventType => {
      document.addEventListener(eventType, () => {}, { passive: true });
    });

    // Debounce resize events
    let resizeTimeout: NodeJS.Timeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        // Handle resize
        window.dispatchEvent(new Event('optimizedResize'));
      }, 100);
    });
  }

  private reserveSpaceForDynamicContent() {
    // Add CSS to reserve space for common dynamic elements
    const style = document.createElement('style');
    style.textContent = `
      /* Reserve space for images without dimensions */
      img:not([width]):not([height]) {
        aspect-ratio: 16/9;
        width: 100%;
        height: auto;
      }
      
      /* Reserve space for lazy-loaded content */
      .lazy-placeholder {
        min-height: 200px;
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
      }
      
      @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      
      /* Prevent layout shift from web fonts */
      .font-loading {
        font-display: swap;
        visibility: hidden;
      }
      
      .font-loaded .font-loading {
        visibility: visible;
      }
    `;
    document.head.appendChild(style);
  }

  private monitorLayoutShifts() {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      let clsValue = 0;
      
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      
      if (clsValue > 0.1) {
        console.warn('High CLS detected:', clsValue);
        // Implement fixes for high CLS
        this.fixLayoutShifts();
      }
    });

    observer.observe({ type: 'layout-shift', buffered: true });
    this.observers.set('cls', observer);
  }

  private fixLayoutShifts() {
    // Add dimensions to images without them
    const images = document.querySelectorAll('img:not([width]):not([height])');
    images.forEach(img => {
      const rect = img.getBoundingClientRect();
      if (rect.width && rect.height) {
        img.setAttribute('width', rect.width.toString());
        img.setAttribute('height', rect.height.toString());
      }
    });
  }

  private optimizeFontLoading() {
    // Use font-display: swap for better performance
    const fontFaces = document.querySelectorAll('@font-face') as any;
    fontFaces.forEach((fontFace: any) => {
      if (!fontFace.style.fontDisplay) {
        fontFace.style.fontDisplay = 'swap';
      }
    });

    // Preload critical fonts
    const criticalFonts = [
      '/fonts/inter-var.woff2',
      '/fonts/jetbrains-mono-var.woff2',
    ];

    criticalFonts.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = font;
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }

  private inlineCriticalCSS() {
    // This would typically be done at build time
    // Here we ensure critical styles are loaded first
    const criticalStyles = `
      /* Critical above-the-fold styles */
      body { margin: 0; font-family: var(--font-geist-sans), sans-serif; }
      .hero-section { min-height: 100vh; }
      .loading-spinner { 
        width: 40px; height: 40px; 
        border: 4px solid #f3f3f3;
        border-top: 4px solid #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    `;

    const style = document.createElement('style');
    style.textContent = criticalStyles;
    document.head.insertBefore(style, document.head.firstChild);
  }

  private optimizeResourceLoading() {
    // Implement resource hints
    const resourceHints = [
      { rel: 'dns-prefetch', href: process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
    ];

    resourceHints.forEach(hint => {
      const link = document.createElement('link');
      link.rel = hint.rel;
      link.href = hint.href;
      if (hint.crossOrigin) {
        link.crossOrigin = hint.crossOrigin;
      }
      document.head.appendChild(link);
    });
  }

  private implementServiceWorkerCaching() {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered:', registration);
        })
        .catch(error => {
          console.log('SW registration failed:', error);
        });
    }
  }

  private optimizeAPICalls() {
    // Implement request deduplication
    const requestCache = new Map();
    
    (window as any).optimizedFetch = async (url: string, options?: RequestInit) => {
      const cacheKey = `${url}-${JSON.stringify(options)}`;
      
      if (requestCache.has(cacheKey)) {
        return requestCache.get(cacheKey);
      }
      
      const promise = fetch(url, options);
      requestCache.set(cacheKey, promise);
      
      // Clear cache after 5 minutes
      setTimeout(() => {
        requestCache.delete(cacheKey);
      }, 5 * 60 * 1000);
      
      return promise;
    };
  }

  // Get current metrics
  getMetrics() {
    return Object.fromEntries(this.metrics);
  }

  // Clean up observers
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// Initialize on page load
if (typeof window !== 'undefined') {
  const optimizer = WebVitalsOptimizer.getInstance();
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      optimizer.initializeMonitoring();
    });
  } else {
    optimizer.initializeMonitoring();
  }
}

export default WebVitalsOptimizer;