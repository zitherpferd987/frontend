'use client'

import { useEffect } from 'react'
import { sendToAnalytics, WebVitalsMetric } from '@/lib/performance'

export default function WebVitals() {
  useEffect(() => {
    // Dynamically import web-vitals to avoid SSR issues
    import('web-vitals').then((webVitals) => {
      // Track Core Web Vitals using the correct v5 API
      if (webVitals.onCLS) {
        webVitals.onCLS((metric) => {
          sendToAnalytics(metric as WebVitalsMetric)
        })
      }

      if (webVitals.onINP) {
        webVitals.onINP((metric) => {
          sendToAnalytics(metric as WebVitalsMetric)
        })
      }

      if (webVitals.onFCP) {
        webVitals.onFCP((metric) => {
          sendToAnalytics(metric as WebVitalsMetric)
        })
      }

      if (webVitals.onLCP) {
        webVitals.onLCP((metric) => {
          sendToAnalytics(metric as WebVitalsMetric)
        })
      }

      if (webVitals.onTTFB) {
        webVitals.onTTFB((metric) => {
          sendToAnalytics(metric as WebVitalsMetric)
        })
      }
    }).catch(error => {
      console.warn('Failed to load web-vitals:', error)
    })
  }, [])

  // This component doesn't render anything
  return null
}

// Hook for using Web Vitals in components
export function useWebVitals() {
  useEffect(() => {
    let mounted = true

    const trackVitals = async () => {
      if (!mounted) return

      try {
        const webVitals = await import('web-vitals')
        
        if (webVitals.onCLS) {
          webVitals.onCLS((metric) => {
            if (mounted) sendToAnalytics(metric as WebVitalsMetric)
          })
        }

        if (webVitals.onINP) {
          webVitals.onINP((metric) => {
            if (mounted) sendToAnalytics(metric as WebVitalsMetric)
          })
        }

        if (webVitals.onFCP) {
          webVitals.onFCP((metric) => {
            if (mounted) sendToAnalytics(metric as WebVitalsMetric)
          })
        }

        if (webVitals.onLCP) {
          webVitals.onLCP((metric) => {
            if (mounted) sendToAnalytics(metric as WebVitalsMetric)
          })
        }

        if (webVitals.onTTFB) {
          webVitals.onTTFB((metric) => {
            if (mounted) sendToAnalytics(metric as WebVitalsMetric)
          })
        }
      } catch (error) {
        console.warn('Web Vitals tracking failed:', error)
      }
    }

    trackVitals()

    return () => {
      mounted = false
    }
  }, [])
}