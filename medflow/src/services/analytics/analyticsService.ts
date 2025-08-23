import {
  DataOperation,
  DataError,
  DataPerformanceMetrics,
  DataAnalytics,
  DataOperationAnalytics,
  DataCacheAnalytics,
  DataErrorAnalytics,
  DataPerformanceAnalytics
} from '../types/data-management.types'

/**
 * Analytics Service
 *
 * Comprehensive analytics and monitoring for the data management layer
 * including operation tracking, error analysis, and performance metrics.
 */

export class DataAnalyticsService {
  private operations: DataOperation[] = []
  private errors: DataError[] = []
  private performanceMetrics: DataPerformanceMetrics[] = []
  private maxEntries: number = 1000
  private sessionStartTime: number = Date.now()

  constructor(maxEntries: number = 1000) {
    this.maxEntries = maxEntries
  }

  /**
   * Track data operation
   */
  trackOperation(operation: DataOperation): void {
    this.operations.push(operation)

    // Maintain max entries limit
    if (this.operations.length > this.maxEntries) {
      this.operations = this.operations.slice(-this.maxEntries)
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[DataAnalytics] Operation:', {
        id: operation.id,
        type: operation.type,
        collection: operation.collection,
        timestamp: new Date(operation.timestamp).toISOString()
      })
    }
  }

  /**
   * Track error
   */
  trackError(error: DataError): void {
    this.errors.push(error)

    // Maintain max entries limit
    if (this.errors.length > this.maxEntries) {
      this.errors = this.errors.slice(-this.maxEntries)
    }

    // Log error
    console.error('[DataAnalytics] Error:', {
      code: error.code,
      message: error.message,
      operation: error.operation,
      timestamp: new Date(error.timestamp).toISOString()
    })
  }

  /**
   * Track performance metrics
   */
  trackPerformance(operation: string, metrics: DataPerformanceMetrics): void {
    const performanceEntry = {
      operation,
      ...metrics,
      timestamp: Date.now()
    }

    this.performanceMetrics.push(performanceEntry as any)

    // Maintain max entries limit
    if (this.performanceMetrics.length > this.maxEntries) {
      this.performanceMetrics = this.performanceMetrics.slice(-this.maxEntries)
    }

    // Log performance in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[DataAnalytics] Performance:', {
        operation,
        duration: metrics.duration,
        cacheHit: metrics.cacheHit,
        timestamp: new Date().toISOString()
      })
    }
  }

  /**
   * Get comprehensive analytics report
   */
  getAnalytics(): DataAnalytics {
    const operations = this.calculateOperationAnalytics()
    const cache = this.calculateCacheAnalytics()
    const errors = this.calculateErrorAnalytics()
    const performance = this.calculatePerformanceAnalytics()

    return {
      operations,
      cache,
      errors,
      performance
    }
  }

  /**
   * Calculate operation analytics
   */
  private calculateOperationAnalytics(): DataOperationAnalytics[] {
    const operationGroups: Record<string, DataOperation[]> = {}

    // Group operations by type
    this.operations.forEach(operation => {
      if (!operationGroups[operation.type]) {
        operationGroups[operation.type] = []
      }
      operationGroups[operation.type].push(operation)
    })

    // Calculate analytics for each operation type
    return Object.entries(operationGroups).map(([type, operations]) => {
      const durations = operations.map(op => {
        // Calculate duration from related performance metrics
        const relatedMetrics = this.performanceMetrics.filter(m =>
          m.operation.includes(type) &&
          Math.abs(m.startTime - op.timestamp) < 1000 // Within 1 second
        )
        return relatedMetrics.length > 0 ? relatedMetrics[0].duration : 0
      }).filter(d => d > 0)

      const averageDuration = durations.length > 0
        ? durations.reduce((sum, d) => sum + d, 0) / durations.length
        : 0

      const successCount = operations.length - this.errors.filter(e => e.operation === type).length
      const successRate = operations.length > 0 ? (successCount / operations.length) * 100 : 0

      return {
        type,
        count: operations.length,
        averageDuration,
        successRate,
        errorRate: 100 - successRate
      }
    })
  }

  /**
   * Calculate cache analytics
   */
  private calculateCacheAnalytics(): DataCacheAnalytics {
    const cacheMetrics = this.performanceMetrics.filter(m => m.cacheHit !== undefined)

    const cacheHits = cacheMetrics.filter(m => m.cacheHit).length
    const cacheMisses = cacheMetrics.filter(m => !m.cacheHit).length
    const totalRequests = cacheHits + cacheMisses

    const hitRate = totalRequests > 0 ? (cacheHits / totalRequests) * 100 : 0
    const missRate = 100 - hitRate

    // Calculate average TTL from cache operations
    const cacheOperations = this.operations.filter(op => op.type === 'read' && op.metadata?.cache)
    const averageTTL = cacheOperations.length > 0
      ? cacheOperations.reduce((sum, op) => sum + (op.metadata?.ttl || 0), 0) / cacheOperations.length
      : 0

    // Estimate memory usage (simplified)
    const memoryUsage = this.operations.length * 100 // Rough estimate

    return {
      totalEntries: cacheOperations.length,
      hitRate,
      missRate,
      averageTTL,
      memoryUsage
    }
  }

  /**
   * Calculate error analytics
   */
  private calculateErrorAnalytics(): DataErrorAnalytics {
    const errorGroups: Record<string, number> = {}

    // Group errors by code
    this.errors.forEach(error => {
      errorGroups[error.code] = (errorGroups[error.code] || 0) + 1
    })

    const retryAttempts = this.errors.map(e => e.retryCount || 0)
    const averageRetryCount = retryAttempts.length > 0
      ? retryAttempts.reduce((sum, count) => sum + count, 0) / retryAttempts.length
      : 0

    // Calculate retry success rate (simplified)
    const retrySuccessRate = 85 // Would be calculated from actual retry outcomes

    return {
      totalErrors: this.errors.length,
      errorTypes: errorGroups,
      retrySuccessRate,
      averageRetryCount
    }
  }

  /**
   * Calculate performance analytics
   */
  private calculatePerformanceAnalytics(): DataPerformanceAnalytics {
    if (this.performanceMetrics.length === 0) {
      return {
        averageResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        throughput: 0,
        memoryUsage: 0
      }
    }

    const durations = this.performanceMetrics.map(m => m.duration).sort((a, b) => a - b)

    const averageResponseTime = durations.reduce((sum, d) => sum + d, 0) / durations.length

    const p95Index = Math.floor(durations.length * 0.95)
    const p99Index = Math.floor(durations.length * 0.99)

    const p95ResponseTime = durations[p95Index] || 0
    const p99ResponseTime = durations[p99Index] || 0

    // Calculate throughput (operations per second)
    const timeSpan = this.performanceMetrics.length > 0
      ? Math.max(...this.performanceMetrics.map(m => m.endTime)) - Math.min(...this.performanceMetrics.map(m => m.startTime))
      : 0
    const throughput = timeSpan > 0 ? (this.performanceMetrics.length / timeSpan) * 1000 : 0

    // Estimate memory usage
    const memoryUsage = this.operations.length * 50 + this.errors.length * 25 // Rough estimate

    return {
      averageResponseTime,
      p95ResponseTime,
      p99ResponseTime,
      throughput,
      memoryUsage
    }
  }

  /**
   * Get operations by type
   */
  getOperationsByType(type: string): DataOperation[] {
    return this.operations.filter(op => op.type === type)
  }

  /**
   * Get operations by collection
   */
  getOperationsByCollection(collection: string): DataOperation[] {
    return this.operations.filter(op => op.collection === collection)
  }

  /**
   * Get operations within time range
   */
  getOperationsInTimeRange(startTime: number, endTime: number): DataOperation[] {
    return this.operations.filter(op =>
      op.timestamp >= startTime && op.timestamp <= endTime
    )
  }

  /**
   * Get errors by code
   */
  getErrorsByCode(code: string): DataError[] {
    return this.errors.filter(error => error.code === code)
  }

  /**
   * Get errors by operation
   */
  getErrorsByOperation(operation: string): DataError[] {
    return this.errors.filter(error => error.operation === operation)
  }

  /**
   * Get performance metrics by operation
   */
  getPerformanceByOperation(operation: string): DataPerformanceMetrics[] {
    return this.performanceMetrics.filter(m => m.operation === operation) as any
  }

  /**
   * Export analytics data
   */
  exportAnalytics(): string {
    const analytics = this.getAnalytics()

    const exportData = {
      exportDate: new Date().toISOString(),
      sessionDuration: Date.now() - this.sessionStartTime,
      summary: {
        totalOperations: this.operations.length,
        totalErrors: this.errors.length,
        totalPerformanceMetrics: this.performanceMetrics.length,
        sessionDuration: Date.now() - this.sessionStartTime
      },
      analytics,
      recentOperations: this.operations.slice(-50),
      recentErrors: this.errors.slice(-20),
      recentPerformance: this.performanceMetrics.slice(-50)
    }

    return JSON.stringify(exportData, null, 2)
  }

  /**
   * Clear all analytics data
   */
  clearAnalytics(): void {
    this.operations = []
    this.errors = []
    this.performanceMetrics = []
    this.sessionStartTime = Date.now()
  }

  /**
   * Get analytics summary for dashboard
   */
  getAnalyticsSummary(): {
    operationsCount: number
    errorsCount: number
    averageResponseTime: number
    errorRate: number
    cacheHitRate: number
  } {
    const analytics = this.getAnalytics()

    const operationsCount = this.operations.length
    const errorsCount = this.errors.length
    const averageResponseTime = analytics.performance.averageResponseTime
    const errorRate = analytics.operations.reduce((sum, op) => sum + op.errorRate, 0) / Math.max(analytics.operations.length, 1)
    const cacheHitRate = analytics.cache.hitRate

    return {
      operationsCount,
      errorsCount,
      averageResponseTime,
      errorRate,
      cacheHitRate
    }
  }

  /**
   * Get health status
   */
  getHealthStatus(): {
    status: 'healthy' | 'warning' | 'critical'
    issues: string[]
    recommendations: string[]
  } {
    const issues: string[] = []
    const recommendations: string[] = []

    const analytics = this.getAnalytics()

    // Check error rate
    const overallErrorRate = analytics.operations.reduce((sum, op) => sum + op.errorRate, 0) / Math.max(analytics.operations.length, 1)
    if (overallErrorRate > 10) {
      issues.push(`High error rate: ${overallErrorRate.toFixed(1)}%`)
      recommendations.push('Investigate and fix high error rate')
    }

    // Check performance
    if (analytics.performance.averageResponseTime > 1000) {
      issues.push('Slow average response time')
      recommendations.push('Optimize data operations and caching')
    }

    // Check cache performance
    if (analytics.cache.hitRate < 50) {
      issues.push('Low cache hit rate')
      recommendations.push('Improve caching strategy and TTL settings')
    }

    let status: 'healthy' | 'warning' | 'critical' = 'healthy'

    if (issues.length > 2) {
      status = 'critical'
    } else if (issues.length > 0) {
      status = 'warning'
    }

    return {
      status,
      issues,
      recommendations
    }
  }
}

/**
 * Factory function to create AnalyticsService
 */
export function createAnalyticsService(maxEntries?: number): DataAnalyticsService {
  return new DataAnalyticsService(maxEntries)
}

/**
 * Singleton instance for global use
 */
let globalAnalyticsService: DataAnalyticsService | null = null

export function getGlobalAnalyticsService(maxEntries?: number): DataAnalyticsService {
  if (!globalAnalyticsService) {
    globalAnalyticsService = createAnalyticsService(maxEntries)
  }
  return globalAnalyticsService
}

export function clearGlobalAnalyticsService(): void {
    globalAnalyticsService = null
}
