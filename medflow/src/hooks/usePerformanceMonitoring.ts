import { useEffect, useRef, useCallback, useState } from 'react'

interface PerformanceMetric {
  name: string
  startTime: number
  endTime?: number
  duration?: number
  metadata?: Record<string, any>
}

interface PerformanceReport {
  totalMetrics: number
  averageDuration: number
  slowestOperation: PerformanceMetric | null
  fastestOperation: PerformanceMetric | null
  operationsByDuration: PerformanceMetric[]
  memoryUsage?: number
  renderCount: number
}

/**
 * Hook for monitoring application performance and identifying bottlenecks
 * 
 * Features:
 * - Component render timing
 * - Operation performance tracking
 * - Memory usage monitoring
 * - Performance reporting
 * - Automatic cleanup
 */
export function usePerformanceMonitoring(componentName: string) {
  const metrics = useRef<Map<string, PerformanceMetric>>(new Map())
  const renderCount = useRef(0)
  const startTime = useRef(performance.now())
  const [performanceReport, setPerformanceReport] = useState<PerformanceReport | null>(null)

  // Track component render
  useEffect(() => {
    renderCount.current++
    const renderTime = performance.now() - startTime.current
    
    metrics.current.set(`render_${renderCount.current}`, {
      name: `${componentName}_render`,
      startTime: startTime.current,
      endTime: performance.now(),
      duration: renderTime,
      metadata: { renderNumber: renderCount.current }
    })
  })

  // Start timing an operation
  const startOperation = useCallback((operationName: string, metadata?: Record<string, any>) => {
    const metric: PerformanceMetric = {
      name: operationName,
      startTime: performance.now(),
      metadata
    }
    metrics.current.set(operationName, metric)
    return operationName
  }, [])

  // End timing an operation
  const endOperation = useCallback((operationName: string) => {
    const metric = metrics.current.get(operationName)
    if (metric) {
      metric.endTime = performance.now()
      metric.duration = metric.endTime - metric.startTime
    }
  }, [])

  // Time an async operation
  const timeAsyncOperation = useCallback(async <T>(
    operationName: string,
    operation: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> => {
    const metricName = startOperation(operationName, metadata)
    
    try {
      const result = await operation()
      endOperation(metricName)
      return result
    } catch (error) {
      endOperation(metricName)
      throw error
    }
  }, [startOperation, endOperation])

  // Generate performance report
  const generateReport = useCallback((): PerformanceReport => {
    const allMetrics = Array.from(metrics.current.values())
    const completedMetrics = allMetrics.filter(m => m.duration !== undefined)
    
    if (completedMetrics.length === 0) {
      return {
        totalMetrics: allMetrics.length,
        averageDuration: 0,
        slowestOperation: null,
        fastestOperation: null,
        operationsByDuration: [],
        renderCount: renderCount.current
      }
    }

    const totalDuration = completedMetrics.reduce((sum, m) => sum + (m.duration || 0), 0)
    const averageDuration = totalDuration / completedMetrics.length
    
    const sortedByDuration = [...completedMetrics].sort((a, b) => (b.duration || 0) - (a.duration || 0))
    const slowestOperation = sortedByDuration[0]
    const fastestOperation = sortedByDuration[sortedByDuration.length - 1]

    // Get memory usage if available
    let memoryUsage: number | undefined
    if ('memory' in performance) {
      const memory = (performance as any).memory
      memoryUsage = memory.usedJSHeapSize / 1024 / 1024 // Convert to MB
    }

    return {
      totalMetrics: allMetrics.length,
      averageDuration,
      slowestOperation,
      fastestOperation,
      operationsByDuration: sortedByDuration,
      memoryUsage,
      renderCount: renderCount.current
    }
  }, [])

  // Get current performance metrics
  const getCurrentMetrics = useCallback(() => {
    return Array.from(metrics.current.values())
  }, [])

  // Clear performance data
  const clearMetrics = useCallback(() => {
    metrics.current.clear()
    renderCount.current = 0
    startTime.current = performance.now()
    setPerformanceReport(null)
  }, [])

  // Auto-generate report every 10 seconds in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const interval = setInterval(() => {
        const report = generateReport()
        setPerformanceReport(report)
        
        // Log slow operations
        if (report.slowestOperation && report.slowestOperation.duration && report.slowestOperation.duration > 100) {
          console.warn(`Slow operation detected: ${report.slowestOperation.name} took ${report.slowestOperation.duration.toFixed(2)}ms`)
        }
      }, 10000)

      return () => clearInterval(interval)
    }
  }, [generateReport])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Generate final report before cleanup
      const finalReport = generateReport()
      if (process.env.NODE_ENV === 'development') {
        console.log(`Performance Report for ${componentName}:`, finalReport)
      }
    }
  }, [componentName, generateReport])

  return {
    startOperation,
    endOperation,
    timeAsyncOperation,
    generateReport,
    getCurrentMetrics,
    clearMetrics,
    performanceReport,
    renderCount: renderCount.current
  }
}

export default usePerformanceMonitoring
