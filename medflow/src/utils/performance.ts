/**
 * Enhanced Performance Utilities for MedFlow
 * 
 * Features:
 * - Advanced GPU acceleration and optimization
 * - Memory leak prevention and cleanup
 * - Performance monitoring and metrics
 * - Asset preloading and optimization
 * - Debounced and throttled event handlers
 * - SSR-safe operations
 */

// Performance configuration
export const PERFORMANCE_CONFIG = {
  // Animation and transition settings
  animation: {
    duration: 300, // ms
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    fps: 60,
    reducedMotion: true
  },
  
  // Debounce and throttle delays
  delays: {
    scroll: 16, // ~60fps
    resize: 150,
    input: 300,
    network: 1000
  },
  
  // Memory management
  memory: {
    maxEventListeners: 100,
    cleanupInterval: 30000, // 30 seconds
    maxAnimationFrames: 1000
  },
  
  // Asset preloading
  preload: {
    critical: ['/src/assets/medflow-logo.svg'],
    fonts: ['/src/assets/fonts/inter-var.woff2'],
    images: ['/src/assets/hero-bg.jpg']
  }
} as const

// Performance metrics interface
export interface PerformanceMetrics {
  fps: number
  memoryUsage?: number
  loadTime: number
  renderTime: number
  eventListeners: number
  animations: number
}

// GPU acceleration for animations
export const enableGPUAcceleration = (selector = '*') => {
  if (typeof window === 'undefined') return

  const style = document.createElement('style')
  style.textContent = `
    ${selector} {
      transform: translateZ(0);
      will-change: transform, opacity;
      backface-visibility: hidden;
      perspective: 1000px;
    }
    
    /* Optimize for 60fps animations */
    @media (prefers-reduced-motion: no-preference) {
      .fade-in,
      .hero-title,
      .section,
      [class*="motion-"],
      [class*="animate-"] {
        animation-duration: ${PERFORMANCE_CONFIG.animation.duration}ms;
        transition-duration: ${PERFORMANCE_CONFIG.animation.duration}ms;
        transition-timing-function: ${PERFORMANCE_CONFIG.animation.easing};
      }
    }
    
    /* Disable animations on slow devices */
    @media (max-width: 768px) and (max-height: 1024px) {
      .fade-in {
        animation: none !important;
        opacity: 1 !important;
        transform: none !important;
      }
    }
    
    /* Optimize for high-DPI displays */
    @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
      .high-dpi {
        image-rendering: -webkit-optimize-contrast;
        image-rendering: crisp-edges;
      }
    }
  `
  
  // Remove existing performance styles
  const existingStyle = document.getElementById('medflow-performance-styles')
  if (existingStyle) {
    existingStyle.remove()
  }
  
  style.id = 'medflow-performance-styles'
  document.head.appendChild(style)
}

// Enhanced asset preloading
export const preloadCriticalAssets = (assets?: string[]) => {
  if (typeof window === 'undefined') return

  const assetsToPreload = assets || PERFORMANCE_CONFIG.preload.critical
  
  assetsToPreload.forEach(asset => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = asset
    link.as = asset.includes('.woff') ? 'font' : 'image'
    link.crossOrigin = 'anonymous'
    document.head.appendChild(link)
  })
}

// Advanced debounced scroll handler
export const createDebouncedScrollHandler = (
  callback: () => void, 
  delay = PERFORMANCE_CONFIG.delays.scroll,
  options: { passive?: boolean; capture?: boolean } = {}
) => {
  let timeoutId: NodeJS.Timeout
  let lastCall = 0
  
  return (event?: Event) => {
    const now = Date.now()
    
    if (now - lastCall < delay) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = setTimeout(() => {
      callback()
      lastCall = now
    }, delay)
  }
}

// Throttled event handler
export const createThrottledHandler = (
  callback: () => void,
  delay = PERFORMANCE_CONFIG.delays.scroll
) => {
  let lastCall = 0
  
  return (event?: Event) => {
    const now = Date.now()
    
    if (now - lastCall >= delay) {
      callback()
      lastCall = now
    }
  }
}

// Memory leak prevention with enhanced cleanup
export const cleanupAnimations = () => {
  if (typeof window === 'undefined') return

  // Cancel all animation frames
  let frameId = 1
  while (frameId <= PERFORMANCE_CONFIG.memory.maxAnimationFrames) {
    cancelAnimationFrame(frameId)
    frameId++
  }

  // Remove event listeners more safely
  const events = ['scroll', 'resize', 'mousemove', 'touchstart', 'touchmove']
  events.forEach(event => {
    try {
      // Try to remove event listeners safely
      if (typeof window.removeEventListener === 'function') {
        // This is a best-effort cleanup since we can't track all listeners
        window.removeEventListener(event, () => {})
      }
    } catch (error) {
      console.warn(`Could not cleanup ${event} listeners:`, error)
    }
  })

  // Clear any remaining timeouts (limited range to avoid infinite loops)
  for (let i = 1; i <= 1000; i++) {
    try {
      clearTimeout(i)
    } catch (error) {
      // Ignore errors for invalid timeout IDs
    }
  }
}

// Performance monitoring
export const createPerformanceMonitor = () => {
  if (typeof window === 'undefined') return null

  let frameCount = 0
  let lastTime = performance.now()
  let fps = 0

  const measureFPS = () => {
    frameCount++
    const currentTime = performance.now()
    
    if (currentTime - lastTime >= 1000) {
      fps = Math.round((frameCount * 1000) / (currentTime - lastTime))
      frameCount = 0
      lastTime = currentTime
    }
    
    requestAnimationFrame(measureFPS)
  }

  const getMetrics = (): PerformanceMetrics => {
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart
    const memory = (performance as any).memory
    
    return {
      fps,
      memoryUsage: memory ? memory.usedJSHeapSize : undefined,
      loadTime,
      renderTime: performance.now(),
      eventListeners: 0, // Would need to track this separately
      animations: document.querySelectorAll('[class*="animate-"], [class*="motion-"]').length
    }
  }

  // Start monitoring
  requestAnimationFrame(measureFPS)

  return {
    getMetrics,
    stop: () => {
      frameCount = 0
      fps = 0
    }
  }
}

// Network performance optimization
export const optimizeNetworkRequests = () => {
  if (typeof window === 'undefined') return

  // Enable resource hints
  const resourceHints = [
    { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
    { rel: 'preconnect', href: '//fonts.googleapis.com' },
    { rel: 'preconnect', href: '//fonts.gstatic.com', crossorigin: 'anonymous' }
  ]

  resourceHints.forEach(hint => {
    const link = document.createElement('link')
    link.rel = hint.rel
    link.href = hint.href
    if (hint.crossorigin) {
      link.crossOrigin = hint.crossorigin
    }
    document.head.appendChild(link)
  })
}

// Initialize all performance optimizations
export const initPerformanceOptimizations = () => {
  if (typeof window === 'undefined') return

  try {
    // Enable GPU acceleration
    enableGPUAcceleration()
    
    // Preload critical assets
    preloadCriticalAssets()
    
    // Optimize network requests
    optimizeNetworkRequests()
    
    // Create performance monitor
    const performanceMonitor = createPerformanceMonitor()
    
    // Defer non-critical operations
    if (window.requestIdleCallback) {
      window.requestIdleCallback(() => {
        console.log('Performance optimizations initialized')
        
        // Log initial metrics
        if (performanceMonitor) {
          setTimeout(() => {
            const metrics = performanceMonitor.getMetrics()
            console.log('Initial performance metrics:', metrics)
          }, 2000)
        }
      })
    }

    return {
      cleanup: cleanupAnimations,
      monitor: performanceMonitor,
      getMetrics: performanceMonitor?.getMetrics || (() => ({} as PerformanceMetrics))
    }
  } catch (error) {
    console.warn('Performance optimizations failed to initialize:', error)
    return null
  }
}

// Utility function to check if device supports advanced features
export const checkDeviceCapabilities = () => {
  if (typeof window === 'undefined') return {}

  return {
    supportsWebGL: !!window.WebGLRenderingContext,
    supportsWebGL2: !!window.WebGL2RenderingContext,
    supportsWebWorkers: !!window.Worker,
    supportsServiceWorker: 'serviceWorker' in navigator,
    supportsIntersectionObserver: 'IntersectionObserver' in window,
    supportsResizeObserver: 'ResizeObserver' in window,
    supportsPerformanceObserver: 'PerformanceObserver' in window,
    deviceMemory: (navigator as any).deviceMemory || 'unknown',
    hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
    connection: (navigator as any).connection?.effectiveType || 'unknown'
  }
}