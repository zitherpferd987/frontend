// Core Web Vitals optimization utilities
import { performanceMonitor } from './performance'

// Cumulative Layout Shift (CLS) optimization
export function optimizeCLS() {
  // Prevent layout shifts from images
  const images = document.querySelectorAll('img:not([width]):not([height])')
  images.forEach((img) => {
    if (img instanceof HTMLImageElement && !img.complete) {
      // Add aspect ratio to prevent layout shift
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const image = entry.target as HTMLImageElement
            image.style.aspectRatio = 'auto'
            observer.unobserve(image)
          }
        })
      })
      observer.observe(img)
    }
  })

  // Prevent layout shifts from web fonts
  if ('fonts' in document) {
    document.fonts.ready.then(() => {
      performanceMonitor.mark('fonts-loaded')
    })
  }
}

// Largest Contentful Paint (LCP) optimization
export function optimizeLCP() {
  // Preload critical resources
  const criticalImages = document.querySelectorAll('img[data-priority="high"]')
  criticalImages.forEach((img) => {
    if (img instanceof HTMLImageElement) {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = img.src
      document.head.appendChild(link)
    }
  })

  // Optimize critical CSS
  const criticalCSS = document.querySelector('style[data-critical]')
  if (criticalCSS) {
    criticalCSS.setAttribute('media', 'all')
  }
}

// First Input Delay (FID) optimization
export function optimizeFID() {
  // Break up long tasks
  function yieldToMain() {
    return new Promise(resolve => {
      setTimeout(resolve, 0)
    })
  }

  // Optimize event handlers
  const heavyEventHandlers = new WeakMap()
  
  function optimizeEventHandler(element: Element, event: string, handler: EventListener) {
    const optimizedHandler = async (e: Event) => {
      await yieldToMain()
      handler(e)
    }
    
    heavyEventHandlers.set(element, optimizedHandler)
    element.addEventListener(event, optimizedHandler)
  }

  return { yieldToMain, optimizeEventHandler }
}

// First Contentful Paint (FCP) optimization
export function optimizeFCP() {
  // Inline critical CSS
  const criticalCSS = `
    /* Critical above-the-fold styles */
    body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }
    .hero-banner { min-height: 100vh; display: flex; align-items: center; }
    .loading-spinner { animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `

  const style = document.createElement('style')
  style.textContent = criticalCSS
  style.setAttribute('data-critical', 'true')
  document.head.insertBefore(style, document.head.firstChild)

  // Preconnect to external domains
  const preconnectDomains = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'
  ]

  preconnectDomains.forEach(domain => {
    const link = document.createElement('link')
    link.rel = 'preconnect'
    link.href = domain
    document.head.appendChild(link)
  })
}

// Time to First Byte (TTFB) optimization helpers
export function optimizeTTFB() {
  // Service worker for caching
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    navigator.serviceWorker.register('/sw.js').catch(error => {
      console.warn('Service worker registration failed:', error)
    })
  }

  // Prefetch critical resources
  const prefetchResources = [
    '/api/blog-posts?pagination[page]=1&pagination[pageSize]=6',
    '/api/gallery-works?pagination[page]=1&pagination[pageSize]=9'
  ]

  prefetchResources.forEach(url => {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = url
    document.head.appendChild(link)
  })
}

// Resource hints for performance
export function addResourceHints() {
  const hints = [
    { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
    { rel: 'dns-prefetch', href: '//fonts.gstatic.com' },
    { rel: 'preconnect', href: process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337' },
  ]

  hints.forEach(hint => {
    const existing = document.querySelector(`link[rel="${hint.rel}"][href="${hint.href}"]`)
    if (!existing) {
      const link = document.createElement('link')
      link.rel = hint.rel
      link.href = hint.href
      document.head.appendChild(link)
    }
  })
}

// Initialize all Core Web Vitals optimizations
export function initializeCoreWebVitalsOptimizations() {
  // Run optimizations when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runOptimizations)
  } else {
    runOptimizations()
  }

  function runOptimizations() {
    try {
      optimizeFCP()
      optimizeLCP()
      optimizeCLS()
      optimizeFID()
      optimizeTTFB()
      addResourceHints()
      
      performanceMonitor.mark('core-web-vitals-optimizations-complete')
    } catch (error) {
      console.warn('Core Web Vitals optimization failed:', error)
    }
  }
}

// Performance budget checker
export function checkPerformanceBudget() {
  const budget = {
    maxBundleSize: 1024 * 1024, // 1MB
    maxImageSize: 500 * 1024,   // 500KB
    maxFCP: 1800,               // 1.8s
    maxLCP: 2500,               // 2.5s
    maxCLS: 0.1,                // 0.1
    maxFID: 100,                // 100ms
  }

  const violations: string[] = []

  // Check bundle size (approximate)
  const scripts = document.querySelectorAll('script[src]')
  let totalScriptSize = 0
  
  scripts.forEach(script => {
    if (script instanceof HTMLScriptElement && script.src.includes('/_next/static/')) {
      // Estimate size based on typical Next.js bundle patterns
      totalScriptSize += 200 * 1024 // Rough estimate
    }
  })

  if (totalScriptSize > budget.maxBundleSize) {
    violations.push(`Bundle size exceeds budget: ${(totalScriptSize / 1024).toFixed(0)}KB > ${(budget.maxBundleSize / 1024).toFixed(0)}KB`)
  }

  // Check image sizes
  const images = document.querySelectorAll('img')
  images.forEach(img => {
    if (img instanceof HTMLImageElement && img.naturalWidth > 0) {
      // Estimate file size based on dimensions (rough approximation)
      const estimatedSize = img.naturalWidth * img.naturalHeight * 0.5 // Very rough estimate
      if (estimatedSize > budget.maxImageSize) {
        violations.push(`Large image detected: ${img.src} (estimated ${(estimatedSize / 1024).toFixed(0)}KB)`)
      }
    }
  })

  if (violations.length > 0) {
    console.warn('Performance budget violations:', violations)
    return { passed: false, violations }
  }

  return { passed: true, violations: [] }
}