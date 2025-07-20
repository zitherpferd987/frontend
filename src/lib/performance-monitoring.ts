import { onCLS, onINP, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';

// Performance monitoring configuration
export interface PerformanceConfig {
  enableAnalytics: boolean;
  enableConsoleLogging: boolean;
  enableLocalStorage: boolean;
  analyticsEndpoint?: string;
  sampleRate: number;
}

export interface PerformanceMetric extends Metric {
  url: string;
  timestamp: number;
  userAgent: string;
  connection?: string;
  deviceMemory?: number;
  hardwareConcurrency?: number;
}

export interface PagePerformanceData {
  url: string;
  loadTime: number;
  domContentLoaded: number;
  firstPaint: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  timeToFirstByte: number;
  resourceCount: number;
  transferSize: number;
  timestamp: number;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private config: PerformanceConfig;
  private metrics: Map<string, PerformanceMetric> = new Map();
  private pageData: PagePerformanceData | null = null;
  private observers: PerformanceObserver[] = [];

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      enableAnalytics: true,
      enableConsoleLogging: process.env.NODE_ENV === 'development',
      enableLocalStorage: true,
      sampleRate: 1.0,
      ...config,
    };
  }

  static getInstance(config?: Partial<PerformanceConfig>): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor(config);
    }
    return PerformanceMonitor.instance;
  }

  // Initialize performance monitoring
  initialize() {
    if (typeof window === 'undefined') return;

    // Sample rate check
    if (Math.random() > this.config.sampleRate) return;

    this.collectWebVitals();
    this.collectPageMetrics();
    this.monitorResourceLoading();
    this.monitorUserInteractions();
    this.setupPerformanceObservers();
    
    // Collect data when page is about to unload
    window.addEventListener('beforeunload', () => {
      this.sendBeacon();
    });

    // Collect data on visibility change (for mobile)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.sendBeacon();
      }
    });
  }

  // Collect Core Web Vitals
  private collectWebVitals() {
    onCLS((metric) => this.handleMetric(metric));
    onINP((metric) => this.handleMetric(metric)); // INP replaced FID
    onFCP((metric) => this.handleMetric(metric));
    onLCP((metric) => this.handleMetric(metric));
    onTTFB((metric) => this.handleMetric(metric));
  }

  // Handle individual metrics
  private handleMetric(metric: Metric) {
    const enhancedMetric: PerformanceMetric = {
      ...metric,
      url: window.location.href,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      connection: this.getConnectionInfo(),
      deviceMemory: (navigator as any).deviceMemory,
      hardwareConcurrency: navigator.hardwareConcurrency,
    };

    this.metrics.set(metric.name, enhancedMetric);

    if (this.config.enableConsoleLogging) {
      console.log(`${metric.name}: ${metric.value}`, enhancedMetric);
    }

    // Send individual metrics to analytics
    if (this.config.enableAnalytics) {
      this.sendMetricToAnalytics(enhancedMetric);
    }

    // Store in localStorage for debugging
    if (this.config.enableLocalStorage) {
      this.storeMetricLocally(enhancedMetric);
    }
  }

  // Collect comprehensive page metrics
  private collectPageMetrics() {
    if (!('performance' in window)) return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');
    const resources = performance.getEntriesByType('resource');

    const firstPaint = paint.find(entry => entry.name === 'first-paint')?.startTime || 0;
    const firstContentfulPaint = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;

    this.pageData = {
      url: window.location.href,
      loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      firstPaint,
      firstContentfulPaint,
      largestContentfulPaint: this.metrics.get('LCP')?.value || 0,
      firstInputDelay: this.metrics.get('FID')?.value || 0,
      cumulativeLayoutShift: this.metrics.get('CLS')?.value || 0,
      timeToFirstByte: navigation.responseStart - navigation.requestStart,
      resourceCount: resources.length,
      transferSize: resources.reduce((total, resource) => total + (resource.transferSize || 0), 0),
      timestamp: Date.now(),
    };

    if (this.config.enableConsoleLogging) {
      console.table(this.pageData);
    }
  }

  // Monitor resource loading performance
  private monitorResourceLoading() {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry) => {
        const resource = entry as PerformanceResourceTiming;
        
        // Log slow resources
        if (resource.duration > 1000) {
          console.warn(`Slow resource: ${resource.name} (${resource.duration}ms)`);
          
          this.sendResourceMetric({
            name: resource.name,
            duration: resource.duration,
            transferSize: resource.transferSize,
            type: this.getResourceType(resource.name),
            timestamp: Date.now(),
          });
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
    this.observers.push(observer);
  }

  // Monitor user interactions
  private monitorUserInteractions() {
    const interactionMetrics = {
      clicks: 0,
      scrolls: 0,
      keystrokes: 0,
      touches: 0,
    };

    // Track clicks
    document.addEventListener('click', () => {
      interactionMetrics.clicks++;
    });

    // Track scrolls
    let scrollTimeout: NodeJS.Timeout;
    document.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        interactionMetrics.scrolls++;
      }, 100);
    });

    // Track keystrokes
    document.addEventListener('keydown', () => {
      interactionMetrics.keystrokes++;
    });

    // Track touches
    document.addEventListener('touchstart', () => {
      interactionMetrics.touches++;
    });

    // Send interaction data periodically
    setInterval(() => {
      if (Object.values(interactionMetrics).some(count => count > 0)) {
        this.sendInteractionMetrics(interactionMetrics);
        // Reset counters
        Object.keys(interactionMetrics).forEach(key => {
          (interactionMetrics as any)[key] = 0;
        });
      }
    }, 30000); // Every 30 seconds
  }

  // Setup additional performance observers
  private setupPerformanceObservers() {
    if (!('PerformanceObserver' in window)) return;

    // Monitor long tasks
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry) => {
          if (entry.duration > 50) {
            console.warn(`Long task detected: ${entry.duration}ms`);
            
            this.sendLongTaskMetric({
              duration: entry.duration,
              startTime: entry.startTime,
              timestamp: Date.now(),
            });
          }
        });
      });

      longTaskObserver.observe({ entryTypes: ['longtask'] });
      this.observers.push(longTaskObserver);
    } catch (error) {
      // Long task observer not supported
    }

    // Monitor memory usage
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        
        if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
          console.warn('High memory usage detected');
          
          this.sendMemoryMetric({
            usedJSHeapSize: memory.usedJSHeapSize,
            totalJSHeapSize: memory.totalJSHeapSize,
            jsHeapSizeLimit: memory.jsHeapSizeLimit,
            timestamp: Date.now(),
          });
        }
      }, 10000); // Every 10 seconds
    }
  }

  // Get connection information
  private getConnectionInfo(): string {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (connection) {
      return `${connection.effectiveType || 'unknown'} (${connection.downlink || 'unknown'}Mbps)`;
    }
    
    return 'unknown';
  }

  // Get resource type from URL
  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|otf)$/)) return 'font';
    if (url.includes('/api/')) return 'api';
    return 'other';
  }

  // Send metric to analytics
  private sendMetricToAnalytics(metric: PerformanceMetric) {
    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'web_vitals', {
        event_category: 'Performance',
        event_label: metric.name,
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        custom_map: {
          metric_id: metric.id,
          metric_url: metric.url,
        },
      });
    }

    // Custom analytics endpoint
    if (this.config.analyticsEndpoint) {
      fetch(this.config.analyticsEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric),
      }).catch(console.error);
    }
  }

  // Send resource metric
  private sendResourceMetric(resource: any) {
    if (this.config.analyticsEndpoint) {
      fetch(`${this.config.analyticsEndpoint}/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resource),
      }).catch(console.error);
    }
  }

  // Send interaction metrics
  private sendInteractionMetrics(interactions: any) {
    if (this.config.analyticsEndpoint) {
      fetch(`${this.config.analyticsEndpoint}/interactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...interactions,
          url: window.location.href,
          timestamp: Date.now(),
        }),
      }).catch(console.error);
    }
  }

  // Send long task metric
  private sendLongTaskMetric(task: any) {
    if (this.config.analyticsEndpoint) {
      fetch(`${this.config.analyticsEndpoint}/longtasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...task,
          url: window.location.href,
        }),
      }).catch(console.error);
    }
  }

  // Send memory metric
  private sendMemoryMetric(memory: any) {
    if (this.config.analyticsEndpoint) {
      fetch(`${this.config.analyticsEndpoint}/memory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...memory,
          url: window.location.href,
        }),
      }).catch(console.error);
    }
  }

  // Store metric locally for debugging
  private storeMetricLocally(metric: PerformanceMetric) {
    try {
      const stored = localStorage.getItem('performance-metrics') || '[]';
      const metrics = JSON.parse(stored);
      
      metrics.push(metric);
      
      // Keep only last 100 metrics
      if (metrics.length > 100) {
        metrics.splice(0, metrics.length - 100);
      }
      
      localStorage.setItem('performance-metrics', JSON.stringify(metrics));
    } catch (error) {
      // localStorage not available or full
    }
  }

  // Send beacon data on page unload
  private sendBeacon() {
    if (!navigator.sendBeacon || !this.config.analyticsEndpoint) return;

    const data = {
      metrics: Object.fromEntries(this.metrics),
      pageData: this.pageData,
      timestamp: Date.now(),
    };

    navigator.sendBeacon(
      `${this.config.analyticsEndpoint}/beacon`,
      JSON.stringify(data)
    );
  }

  // Get performance report
  getPerformanceReport() {
    return {
      metrics: Object.fromEntries(this.metrics),
      pageData: this.pageData,
      timestamp: Date.now(),
      connection: this.getConnectionInfo(),
      deviceInfo: {
        userAgent: navigator.userAgent,
        deviceMemory: (navigator as any).deviceMemory,
        hardwareConcurrency: navigator.hardwareConcurrency,
        platform: navigator.platform,
      },
    };
  }

  // Clean up observers
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Performance budget checker
export class PerformanceBudget {
  private budgets = {
    LCP: 2500,    // 2.5s
    FID: 100,     // 100ms
    CLS: 0.1,     // 0.1
    FCP: 1800,    // 1.8s
    TTFB: 800,    // 800ms
    totalSize: 2 * 1024 * 1024, // 2MB
    imageSize: 1 * 1024 * 1024,  // 1MB
    scriptSize: 500 * 1024,      // 500KB
    styleSize: 100 * 1024,       // 100KB
  };

  checkBudget(metrics: any, resources?: PerformanceResourceTiming[]) {
    const violations: string[] = [];

    // Check Core Web Vitals
    Object.entries(this.budgets).forEach(([metric, budget]) => {
      if (metrics[metric] && metrics[metric].value > budget) {
        violations.push(`${metric}: ${metrics[metric].value} > ${budget}`);
      }
    });

    // Check resource sizes
    if (resources) {
      const resourceSizes = this.calculateResourceSizes(resources);
      
      Object.entries(resourceSizes).forEach(([type, size]) => {
        const budget = this.budgets[`${type}Size` as keyof typeof this.budgets];
        if (budget && size > budget) {
          violations.push(`${type} size: ${size} bytes > ${budget} bytes`);
        }
      });
    }

    return {
      passed: violations.length === 0,
      violations,
      score: Math.max(0, 100 - violations.length * 10),
    };
  }

  private calculateResourceSizes(resources: PerformanceResourceTiming[]) {
    const sizes = {
      total: 0,
      image: 0,
      script: 0,
      style: 0,
    };

    resources.forEach(resource => {
      const size = resource.transferSize || 0;
      sizes.total += size;

      if (resource.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
        sizes.image += size;
      } else if (resource.name.includes('.js')) {
        sizes.script += size;
      } else if (resource.name.includes('.css')) {
        sizes.style += size;
      }
    });

    return sizes;
  }
}

// Initialize performance monitoring
export function initializePerformanceMonitoring(config?: Partial<PerformanceConfig>) {
  if (typeof window === 'undefined') return null;

  const monitor = PerformanceMonitor.getInstance(config);
  monitor.initialize();
  
  return monitor;
}

// PerformanceMonitor is already exported above