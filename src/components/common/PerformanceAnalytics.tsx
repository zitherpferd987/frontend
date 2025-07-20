'use client'

import { useEffect } from 'react'
import { performanceMonitor, measurePageLoad } from '@/lib/performance'
import { initializePerformanceMonitoring, PerformanceBudget } from '@/lib/performance-monitoring'
import WebVitalsOptimizer from '@/lib/web-vitals-optimization'

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    performanceMonitor?: any;
    performanceBudget?: PerformanceBudget;
  }
}

interface PerformanceAnalyticsProps {
  pageName: string
}

export default function PerformanceAnalytics({ pageName }: PerformanceAnalyticsProps) {
  useEffect(() => {
    // Initialize comprehensive performance monitoring
    const monitor = initializePerformanceMonitoring({
      enableAnalytics: process.env.NODE_ENV === 'production',
      enableConsoleLogging: process.env.NODE_ENV === 'development',
      enableLocalStorage: true,
      analyticsEndpoint: '/api/analytics/performance',
      sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    })

    // Initialize Web Vitals optimizer
    const optimizer = WebVitalsOptimizer.getInstance()
    
    // Initialize performance budget checker
    const budget = new PerformanceBudget()
    
    // Make available globally for debugging
    if (typeof window !== 'undefined') {
      window.performanceMonitor = monitor
      window.performanceBudget = budget
    }

    // Original page-specific monitoring
    const pageLoadMeasure = measurePageLoad(pageName)
    performanceMonitor.mark(`${pageName}-loaded`)
    
    const handleLoad = () => {
      pageLoadMeasure.complete()
      performanceMonitor.mark(`${pageName}-interactive`)
      
      // Check performance budget after page load
      setTimeout(() => {
        if (monitor) {
          const report = monitor.getPerformanceReport()
          const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
          const budgetResult = budget.checkBudget(report.metrics, resources)
          
          if (!budgetResult.passed) {
            console.warn(`Performance budget violations on ${pageName}:`, budgetResult.violations)
            
            if (process.env.NODE_ENV === 'production' && window.gtag) {
              window.gtag('event', 'performance_budget_violation', {
                event_category: 'Performance',
                event_label: `${pageName}: ${budgetResult.violations.join(', ')}`,
                value: budgetResult.score,
              })
            }
          }
        }
      }, 1000)
    }

    if (document.readyState === 'complete') {
      handleLoad()
    } else {
      window.addEventListener('load', handleLoad)
    }

    // Enhanced LCP monitoring
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        
        performanceMonitor.recordMetric({
          name: `${pageName}-lcp`,
          value: lastEntry.startTime,
          rating: lastEntry.startTime < 2500 ? 'good' : lastEntry.startTime < 4000 ? 'needs-improvement' : 'poor',
          timestamp: Date.now(),
        })
      })

      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
      } catch (error) {
        console.warn('LCP observer not supported:', error)
      }

      // Page-specific user journey tracking
      const trackPageSpecificJourneys = () => {
        if (pageName === 'blog-post') {
          let startTime = Date.now()
          let maxScroll = 0
          
          const trackScroll = () => {
            const scrollPercent = Math.round(
              (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
            )
            maxScroll = Math.max(maxScroll, scrollPercent)
          }
          
          window.addEventListener('scroll', trackScroll)
          
          const sendReadingAnalytics = () => {
            const readingTime = Date.now() - startTime
            
            if (window.gtag && readingTime > 5000) {
              window.gtag('event', 'blog_reading_time', {
                event_category: 'Engagement',
                value: Math.round(readingTime / 1000),
                custom_map: {
                  max_scroll_percent: maxScroll,
                  page_name: pageName,
                },
              })
            }
          }
          
          window.addEventListener('beforeunload', sendReadingAnalytics)
          document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
              sendReadingAnalytics()
            }
          })
        }
        
        if (pageName === 'gallery') {
          let galleryInteractions = 0
          
          const trackGalleryClick = () => {
            galleryInteractions++
          }
          
          document.addEventListener('click', (e) => {
            const target = e.target as HTMLElement
            if (target.closest('[data-gallery-item]')) {
              trackGalleryClick()
            }
          })
          
          const sendGalleryAnalytics = () => {
            if (window.gtag && galleryInteractions > 0) {
              window.gtag('event', 'gallery_interactions', {
                event_category: 'Engagement',
                value: galleryInteractions,
                custom_map: {
                  page_name: pageName,
                },
              })
            }
          }
          
          window.addEventListener('beforeunload', sendGalleryAnalytics)
        }
      }

      trackPageSpecificJourneys()

      return () => {
        lcpObserver.disconnect()
        window.removeEventListener('load', handleLoad)
        if (monitor) {
          monitor.cleanup()
        }
        if (optimizer) {
          optimizer.cleanup()
        }
      }
    }

    return () => {
      window.removeEventListener('load', handleLoad)
      if (monitor) {
        monitor.cleanup()
      }
      if (optimizer) {
        optimizer.cleanup()
      }
    }
  }, [pageName])

  return null
}

// Hook for performance monitoring in components
export function usePerformanceMonitoring(componentName: string) {
  useEffect(() => {
    const startTime = performance.now()
    performanceMonitor.mark(`${componentName}-mount-start`)

    return () => {
      const endTime = performance.now()
      const duration = endTime - startTime
      
      performanceMonitor.recordMetric({
        name: `${componentName}-mount-duration`,
        value: duration,
        rating: duration < 16 ? 'good' : duration < 50 ? 'needs-improvement' : 'poor',
        timestamp: Date.now(),
      })
      
      performanceMonitor.mark(`${componentName}-unmount`)
    }
  }, [componentName])
}