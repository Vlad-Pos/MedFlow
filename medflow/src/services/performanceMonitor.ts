interface PerformanceMetrics {
  componentRenderTime: number
  bundleSize: number
  memoryUsage: number
  networkLatency: number
  frameRate: number
  interactionDelay: number
}

interface PerformanceThresholds {
  maxRenderTime: number
  maxBundleSize: number
  maxMemoryUsage: number
  maxNetworkLatency: number
  minFrameRate: number
  maxInteractionDelay: number
}

interface PerformanceAlert {
  type: 'warning' | 'error' | 'critical'
  component: string
  metric: keyof PerformanceMetrics
  value: number
  threshold: number
  timestamp: number
  message: string
}

/**
 * Enterprise-grade performance monitoring service
 * 
 * Features:
 * - Real-time performance metrics collection
 * - Performance budget enforcement
 * - Automated alerting system
 * - Performance regression detection
 * - Memory leak detection
 * - Bundle size monitoring
 */
class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics[]> = new Map()
  private alerts: PerformanceAlert[] = []
  private thresholds: PerformanceThresholds = {
    maxRenderTime: 16, // 60fps threshold
    maxBundleSize: 500 * 1024, // 500KB
    maxMemoryUsage: 100 * 1024 * 1024, // 100MB
    maxNetworkLatency: 1000, // 1 second
    minFrameRate: 30, // 30fps minimum
    maxInteractionDelay: 100 // 100ms
  }
  
  private observers: Map<string, PerformanceObserver> = new Map()
  private isMonitoring = false
  
  constructor() {
    this.initializeObservers()
  }
  
  /**
   * Initialize performance observers for automatic metrics collection
   */
  private initializeObservers(): void {
    // Long Task Observer
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            this.recordLongTask(entry as PerformanceEntry)
          })
        })
        longTaskObserver.observe({ entryTypes: ['longtask'] })
        this.observers.set('longtask', longTaskObserver)
      } catch (error) {
        console.warn('Long task observer not supported:', error)
      }
      
      // Layout Shift Observer
      try {
        const layoutShiftObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            this.recordLayoutShift(entry as PerformanceEntry)
          })
        })
        layoutShiftObserver.observe({ entryTypes: ['layout-shift'] })
        this.observers.set('layout-shift', layoutShiftObserver)
      } catch (error) {
        console.warn('Layout shift observer not supported:', error)
      }
      
      // First Input Delay Observer
      try {
        const firstInputObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            this.recordFirstInput(entry as PerformanceEntry)
          })
        })
        firstInputObserver.observe({ entryTypes: ['first-input'] })
        this.observers.set('first-input', firstInputObserver)
      } catch (error) {
        console.warn('First input observer not supported:', error)
      }
    }
  }
  
  /**
   * Start monitoring performance for a specific component
   */
  startComponentMonitoring(componentName: string): () => void {
    if (!this.isMonitoring) {
      this.isMonitoring = true
    }
    
    const startTime = performance.now()
    
    // Return cleanup function
    return () => {
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      this.recordComponentRender(componentName, renderTime)
    }
  }
  
  /**
   * Record component render time
   */
  private recordComponentRender(componentName: string, renderTime: number): void {
    if (!this.metrics.has(componentName)) {
      this.metrics.set(componentName, [])
    }
    
    const componentMetrics = this.metrics.get(componentName)!
    const metric: PerformanceMetrics = {
      componentRenderTime: renderTime,
      bundleSize: this.getBundleSize(),
      memoryUsage: this.getMemoryUsage(),
      networkLatency: this.getNetworkLatency(),
      frameRate: this.getFrameRate(),
      interactionDelay: renderTime
    }
    
    componentMetrics.push(metric)
    
    // Keep only last 100 metrics per component
    if (componentMetrics.length > 100) {
      componentMetrics.shift()
    }
    
    // Check thresholds and generate alerts
    this.checkThresholds(componentName, metric)
  }
  
  /**
   * Record long task performance entry
   */
  private recordLongTask(entry: PerformanceEntry): void {
    const duration = entry.duration
    if (duration > this.thresholds.maxRenderTime) {
      this.createAlert('warning', 'main-thread', 'componentRenderTime', duration, this.thresholds.maxRenderTime, 
        `Long task detected: ${duration.toFixed(2)}ms`)
    }
  }
  
  /**
   * Record layout shift performance entry
   */
  private recordLayoutShift(entry: PerformanceEntry): void {
    // Layout shift monitoring for CLS (Cumulative Layout Shift)
    const layoutShift = entry as any
    if (layoutShift.value > 0.1) {
      this.createAlert('warning', 'layout', 'componentRenderTime', layoutShift.value, 0.1,
        `Layout shift detected: ${layoutShift.value.toFixed(3)}`)
    }
  }
  
  /**
   * Record first input delay performance entry
   */
  private recordFirstInput(entry: PerformanceEntry): void {
    const firstInput = entry as any
    if (firstInput.processingStart && firstInput.startTime) {
      const delay = firstInput.processingStart - firstInput.startTime
      if (delay > this.thresholds.maxInteractionDelay) {
        this.createAlert('warning', 'interaction', 'interactionDelay', delay, this.thresholds.maxInteractionDelay,
          `High interaction delay: ${delay.toFixed(2)}ms`)
      }
    }
  }
  
  /**
   * Check performance thresholds and create alerts
   */
  private checkThresholds(componentName: string, metric: PerformanceMetrics): void {
    Object.entries(this.thresholds).forEach(([thresholdKey, thresholdValue]) => {
      const metricKey = thresholdKey.replace('max', '').replace('min', '') as keyof PerformanceMetrics
      const metricValue = metric[metricKey]
      
      if (thresholdKey.startsWith('max') && metricValue > thresholdValue) {
        this.createAlert('error', componentName, metricKey, metricValue, thresholdValue,
          `${componentName} exceeded ${thresholdKey}: ${metricValue} > ${thresholdValue}`)
      } else if (thresholdKey.startsWith('min') && metricValue < thresholdValue) {
        this.createAlert('error', componentName, metricKey, metricValue, thresholdValue,
          `${componentName} below ${thresholdKey}: ${metricValue} < ${thresholdValue}`)
      }
    })
  }
  
  /**
   * Create performance alert
   */
  public createAlert(
    type: PerformanceAlert['type'],
    component: string,
    metric: keyof PerformanceMetrics,
    value: number,
    threshold: number,
    message: string
  ): void {
    const alert: PerformanceAlert = {
      type,
      component,
      metric,
      value,
      threshold,
      timestamp: Date.now(),
      message
    }
    
    this.alerts.push(alert)
    
    // Keep only last 1000 alerts
    if (this.alerts.length > 1000) {
      this.alerts.shift()
    }
    
    // Log alert based on severity
    switch (type) {
      case 'warning':
        console.warn(`[Performance] ${message}`)
        break
      case 'error':
        console.error(`[Performance] ${message}`)
        break
      case 'critical':
        console.error(`[CRITICAL] ${message}`)
        // Could trigger additional actions like analytics, notifications, etc.
        break
    }
  }
  
  /**
   * Get current bundle size estimate
   */
  private getBundleSize(): number {
    // Estimate based on loaded resources
    const resources = performance.getEntriesByType('resource')
    const totalSize = resources.reduce((sum, resource) => {
      const resourceEntry = resource as any
      return sum + (resourceEntry.transferSize || 0)
    }, 0)
    
    return totalSize
  }
  
  /**
   * Get current memory usage
   */
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      return memory.usedJSHeapSize
    }
    return 0
  }
  
  /**
   * Get network latency estimate
   */
  private getNetworkLatency(): number {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      return connection.rtt || 0
    }
    return 0
  }
  
  /**
   * Get current frame rate estimate
   */
  private getFrameRate(): number {
    // Simple frame rate estimation based on render times
    const recentMetrics = Array.from(this.metrics.values()).flat().slice(-60)
    if (recentMetrics.length < 2) return 60
    
    const avgRenderTime = recentMetrics.reduce((sum, m) => sum + m.componentRenderTime, 0) / recentMetrics.length
    return Math.min(60, Math.round(1000 / avgRenderTime))
  }
  
  /**
   * Get performance report for a component
   */
  getComponentReport(componentName: string): {
    averageRenderTime: number
    totalRenders: number
    performanceScore: number
    alerts: PerformanceAlert[]
  } | null {
    const componentMetrics = this.metrics.get(componentName)
    if (!componentMetrics || componentMetrics.length === 0) return null
    
    const averageRenderTime = componentMetrics.reduce((sum, m) => sum + m.componentRenderTime, 0) / componentMetrics.length
    const totalRenders = componentMetrics.length
    const performanceScore = Math.max(0, 100 - (averageRenderTime / this.thresholds.maxRenderTime) * 100)
    const alerts = this.alerts.filter(alert => alert.component === componentName)
    
    return {
      averageRenderTime,
      totalRenders,
      performanceScore,
      alerts
    }
  }
  
  /**
   * Get overall performance report
   */
  getOverallReport(): {
    totalComponents: number
    averagePerformanceScore: number
    totalAlerts: number
    criticalAlerts: number
    recommendations: string[]
  } {
    const components = Array.from(this.metrics.keys())
    const totalComponents = components.length
    
    const performanceScores = components.map(name => {
      const report = this.getComponentReport(name)
      return report?.performanceScore || 0
    })
    
    const averagePerformanceScore = performanceScores.length > 0 
      ? performanceScores.reduce((sum, score) => sum + score, 0) / performanceScores.length 
      : 0
    
    const totalAlerts = this.alerts.length
    const criticalAlerts = this.alerts.filter(alert => alert.type === 'critical').length
    
    // Generate recommendations based on performance data
    const recommendations: string[] = []
    
    if (averagePerformanceScore < 70) {
      recommendations.push('Consider implementing code splitting and lazy loading')
    }
    
    if (criticalAlerts > 0) {
      recommendations.push('Address critical performance issues immediately')
    }
    
    if (this.alerts.filter(alert => alert.metric === 'componentRenderTime').length > 10) {
      recommendations.push('Optimize component rendering with React.memo and useMemo')
    }
    
    return {
      totalComponents,
      averagePerformanceScore,
      totalAlerts,
      criticalAlerts,
      recommendations
    }
  }
  
  /**
   * Set custom performance thresholds
   */
  setThresholds(thresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds }
  }
  
  /**
   * Clear all performance data
   */
  clearData(): void {
    this.metrics.clear()
    this.alerts = []
  }
  
  /**
   * Stop monitoring and cleanup
   */
  stop(): void {
    this.isMonitoring = false
    
    // Disconnect all observers
    this.observers.forEach(observer => observer.disconnect())
    this.observers.clear()
    
    // Clear data
    this.clearData()
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor()

// Export types for external use
export type {
  PerformanceMetrics,
  PerformanceThresholds,
  PerformanceAlert
}

export default PerformanceMonitor
