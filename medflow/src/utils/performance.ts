/**
 * Performance monitoring utilities for MedFlow
 */

interface PerformanceMetric {
  name: string
  value: number
  unit: string
  timestamp: number
  metadata?: Record<string, any>
}

interface UserInteraction {
  action: string
  component: string
  timestamp: number
  duration?: number
  success?: boolean
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private interactions: UserInteraction[] = []
  private observers: Set<(metric: PerformanceMetric) => void> = new Set()

  // Track page load performance
  trackPageLoad(pageName: string) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (navigation) {
      this.addMetric('page_load_time', navigation.loadEventEnd - navigation.loadEventStart, 'ms', {
        page: pageName,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
      })
    }
  }

  // Track component render time
  trackComponentRender(componentName: string, renderTime: number) {
    this.addMetric('component_render_time', renderTime, 'ms', { component: componentName })
  }

  // Track user interactions
  trackInteraction(action: string, component: string, duration?: number, success?: boolean) {
    const interaction: UserInteraction = {
      action,
      component,
      timestamp: Date.now(),
      duration,
      success
    }
    this.interactions.push(interaction)
    
    // Also add as metric for analysis
    if (duration) {
      this.addMetric('interaction_duration', duration, 'ms', { action, component, success })
    }
  }

  // Track API calls
  trackApiCall(endpoint: string, duration: number, success: boolean, statusCode?: number) {
    this.addMetric('api_call_duration', duration, 'ms', {
      endpoint,
      success,
      statusCode
    })
  }

  // Track memory usage
  trackMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      this.addMetric('memory_used', memory.usedJSHeapSize, 'bytes')
      this.addMetric('memory_total', memory.totalJSHeapSize, 'bytes')
      this.addMetric('memory_limit', memory.jsHeapSizeLimit, 'bytes')
    }
  }

  // Add custom metric
  addMetric(name: string, value: number, unit: string, metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      metadata
    }
    
    this.metrics.push(metric)
    
    // Notify observers
    this.observers.forEach(observer => observer(metric))
    
    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Performance Metric: ${name} = ${value}${unit}`, metadata)
    }
  }

  // Get metrics for a specific time range
  getMetrics(startTime?: number, endTime?: number): PerformanceMetric[] {
    let filtered = this.metrics
    
    if (startTime) {
      filtered = filtered.filter(m => m.timestamp >= startTime)
    }
    
    if (endTime) {
      filtered = filtered.filter(m => m.timestamp <= endTime)
    }
    
    return filtered
  }

  // Get interactions for a specific time range
  getInteractions(startTime?: number, endTime?: number): UserInteraction[] {
    let filtered = this.interactions
    
    if (startTime) {
      filtered = filtered.filter(i => i.timestamp >= startTime)
    }
    
    if (endTime) {
      filtered = filtered.filter(i => i.timestamp <= endTime)
    }
    
    return filtered
  }

  // Subscribe to new metrics
  subscribe(observer: (metric: PerformanceMetric) => void) {
    this.observers.add(observer)
    return () => this.observers.delete(observer)
  }

  // Get performance summary
  getSummary(): Record<string, any> {
    const now = Date.now()
    const lastHour = now - (60 * 60 * 1000)
    
    const recentMetrics = this.getMetrics(lastHour)
    const recentInteractions = this.getInteractions(lastHour)
    
    return {
      totalMetrics: this.metrics.length,
      totalInteractions: this.interactions.length,
      recentMetrics: recentMetrics.length,
      recentInteractions: recentInteractions.length,
      averagePageLoadTime: this.calculateAverage(recentMetrics.filter(m => m.name === 'page_load_time')),
      averageApiCallDuration: this.calculateAverage(recentMetrics.filter(m => m.name === 'api_call_duration')),
      successRate: this.calculateSuccessRate(recentInteractions)
    }
  }

  private calculateAverage(metrics: PerformanceMetric[]): number {
    if (metrics.length === 0) return 0
    const sum = metrics.reduce((acc, m) => acc + m.value, 0)
    return sum / metrics.length
  }

  private calculateSuccessRate(interactions: UserInteraction[]): number {
    if (interactions.length === 0) return 0
    const successful = interactions.filter(i => i.success !== false).length
    return (successful / interactions.length) * 100
  }

  // Clear old data (keep last 7 days)
  cleanup() {
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
    this.metrics = this.metrics.filter(m => m.timestamp > weekAgo)
    this.interactions = this.interactions.filter(i => i.timestamp > weekAgo)
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor()

// Auto-cleanup every hour
setInterval(() => {
  performanceMonitor.cleanup()
}, 60 * 60 * 1000)

// Track initial page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    performanceMonitor.trackPageLoad(window.location.pathname)
  })
}

// React Hook for tracking component performance
export function usePerformanceTracking(componentName: string) {
  const startTime = performance.now()
  
  return {
    trackRender: () => {
      const renderTime = performance.now() - startTime
      performanceMonitor.trackComponentRender(componentName, renderTime)
    },
    trackInteraction: (action: string, duration?: number, success?: boolean) => {
      performanceMonitor.trackInteraction(action, componentName, duration, success)
    }
  }
}

// Utility for tracking API calls
export function trackApiCall(endpoint: string, duration: number, success: boolean, statusCode?: number) {
  performanceMonitor.trackApiCall(endpoint, duration, success, statusCode)
}

// Export types
export type { PerformanceMetric, UserInteraction }
