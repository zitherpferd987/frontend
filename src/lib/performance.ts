// Performance monitoring and Core Web Vitals tracking
export interface PerformanceMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  timestamp: number
}

export interface WebVitalsMetric {
  id: string
  name: 'CLS' | 'INP' | 'FCP' | 'LCP' | 'TTFB'
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  navigationType?: string
}

// Core Web Vitals thresholds
const THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  INP: { good: 200, poor: 500 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
}

export function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS]
  if (!threshold) return 'good'
  
  if (value <= threshold.good) return 'good'
  if (value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}

// Send metrics to analytics
export function sendToAnalytics(metric: WebVitalsMetric) {
  // In production, send to your analytics service
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vitals:', metric)
  }
  
  // Example: Send to Google Analytics 4
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      custom_map: {
        metric_rating: metric.rating,
        metric_delta: metric.delta,
      },
    })
  }
}

// Performance observer for custom metrics
export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private observer: PerformanceObserver | null = null

  constructor() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.initializeObserver()
    }
  }

  private initializeObserver() {
    try {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric({
            name: entry.name,
            value: entry.duration || entry.startTime,
            rating: 'good', // Will be calculated based on thresholds
            timestamp: Date.now(),
          })
        }
      })

      // Observe different types of performance entries
      this.observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] })
    } catch (error) {
      console.warn('Performance Observer not supported:', error)
    }
  }

  recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric)
    
    // Keep only last 100 metrics to prevent memory leaks
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100)
    }
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics]
  }

  // Measure custom performance marks
  mark(name: string) {
    if (typeof window !== 'undefined' && window.performance?.mark) {
      window.performance.mark(name)
    }
  }

  measure(name: string, startMark: string, endMark?: string) {
    if (typeof window !== 'undefined' && window.performance?.measure) {
      try {
        window.performance.measure(name, startMark, endMark)
        const measure = window.performance.getEntriesByName(name, 'measure')[0]
        if (measure) {
          this.recordMetric({
            name,
            value: measure.duration,
            rating: measure.duration < 100 ? 'good' : measure.duration < 300 ? 'needs-improvement' : 'poor',
            timestamp: Date.now(),
          })
        }
      } catch (error) {
        console.warn('Performance measure failed:', error)
      }
    }
  }

  // Get Core Web Vitals summary
  getWebVitalsSummary() {
    const vitals = this.metrics.filter(m => 
      ['CLS', 'INP', 'FCP', 'LCP', 'TTFB'].includes(m.name)
    )
    
    return vitals.reduce((acc, metric) => {
      acc[metric.name] = {
        value: metric.value,
        rating: getRating(metric.name, metric.value),
        timestamp: metric.timestamp,
      }
      return acc
    }, {} as Record<string, { value: number; rating: string; timestamp: number }>)
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor()

// Resource loading performance
export function measureResourceLoading(url: string, type: 'image' | 'script' | 'style' = 'image') {
  const startTime = performance.now()
  
  return {
    complete: () => {
      const endTime = performance.now()
      const duration = endTime - startTime
      
      performanceMonitor.recordMetric({
        name: `${type}-load-${url.split('/').pop()}`,
        value: duration,
        rating: duration < 200 ? 'good' : duration < 500 ? 'needs-improvement' : 'poor',
        timestamp: Date.now(),
      })
    }
  }
}

// Page load performance
export function measurePageLoad(pageName: string) {
  const startTime = performance.now()
  
  return {
    complete: () => {
      const endTime = performance.now()
      const duration = endTime - startTime
      
      performanceMonitor.recordMetric({
        name: `page-load-${pageName}`,
        value: duration,
        rating: duration < 1000 ? 'good' : duration < 2500 ? 'needs-improvement' : 'poor',
        timestamp: Date.now(),
      })
    }
  }
}

// Declare gtag for TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}