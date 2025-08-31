import {
  DataManagerConfig,
  DataQuery,
  DataResult,
  DataMutationResult,
  DataError,
  DataOperation,
  DataService,
  DataAnalytics,
  DataManagerError,
  DataNetworkError,
  DataValidationError,
  DataRetryConfig
} from '../types/data-management.types'
import { CacheService } from '../cache/cacheService'
import { DataStateService } from '../state/stateService'
import { DataAnalyticsService } from '../analytics/analyticsService'

/**
 * Core Data Manager
 *
 * Advanced data management system with caching, state management, and analytics
 * while maintaining backward compatibility with existing services.
 */

export class DataManager implements DataService {
  private config: DataManagerConfig
  private cacheService: CacheService
  private stateService: DataStateService
  private analyticsService: DataAnalyticsService
  private retryConfig: DataRetryConfig

  constructor(
    config: DataManagerConfig,
    cacheService: CacheService,
    stateService: DataStateService,
    analyticsService: DataAnalyticsService
  ) {
    this.config = config
    this.cacheService = cacheService
    this.stateService = stateService
    this.analyticsService = analyticsService

    this.retryConfig = {
      enabled: config.enableErrorRetry,
      maxAttempts: config.maxRetryAttempts,
      delay: config.retryDelay,
      backoffMultiplier: 1.5,
      maxDelay: 30000
    }
  }

  /**
   * Get data with caching and error handling
   */
  async get<T = any>(query: DataQuery): Promise<DataResult<T>> {
    const operationId = this.generateOperationId('read', query.collection)
    const startTime = performance.now()

    try {
      // Track operation start
      this.trackOperation({
        id: operationId,
        type: 'read',
        collection: query.collection,
        timestamp: Date.now(),
        userId: 'anonymous', // Would come from auth context
        metadata: { query }
      })

      // Set loading state
      this.stateService.setLoading(operationId, true)

      // Check cache first
      if (query.cache !== false && this.config.enableCaching) {
        const cacheKey = this.generateCacheKey(query)
        const cachedEntry = this.cacheService.get<T>(cacheKey)

        if (cachedEntry) {
          const result: DataResult<T> = {
            data: cachedEntry.data,
            loading: false,
            error: null,
            metadata: {
              timestamp: Date.now(),
              cacheHit: true,
              source: 'cache',
              performance: this.calculatePerformanceMetrics(startTime)
            }
          }

          this.stateService.setData(operationId, result.data)
          this.stateService.setLoading(operationId, false)

          // Track successful cache hit
          this.analyticsService.trackPerformance('cache_hit', {
            startTime,
            endTime: performance.now(),
            duration: performance.now() - startTime,
            operation: 'cache_hit',
            cacheHit: true,
            retryCount: 0
          })

          return result
        }
      }

      // Fetch from network
      const networkResult = await this.fetchFromNetwork<T>(query, operationId)

      // Cache the result if caching is enabled
      if (query.cache !== false && this.config.enableCaching && networkResult.data) {
        const cacheKey = this.generateCacheKey(query)
        this.cacheService.set(cacheKey, networkResult.data, this.config.cacheTTL)
      }

      const endTime = performance.now()
      const result: DataResult<T> = {
        ...networkResult,
        metadata: {
          timestamp: Date.now(),
          cacheHit: false,
          source: 'network',
          performance: this.calculatePerformanceMetrics(startTime, endTime)
        }
      }

      this.stateService.setData(operationId, result.data)
      this.stateService.setLoading(operationId, false)

      // Track successful network fetch
      this.analyticsService.trackPerformance('network_fetch', {
        startTime,
        endTime,
        duration: endTime - startTime,
        operation: 'network_fetch',
        cacheHit: false,
        retryCount: 0
      })

      return result

    } catch (error) {
      const dataError = this.createDataError(error, operationId, 'read')
      this.stateService.setError(operationId, dataError)
      this.stateService.setLoading(operationId, false)

      // Track error
      this.analyticsService.trackError(dataError)

      const result: DataResult<T> = {
        data: null as any,
        loading: false,
        error: dataError,
        metadata: {
          timestamp: Date.now(),
          cacheHit: false,
          source: 'network',
          performance: this.calculatePerformanceMetrics(startTime)
        }
      }

      return result
    }
  }

  /**
   * Get data by ID
   */
  async getById<T = any>(collection: string, id: string): Promise<DataResult<T>> {
    const query: DataQuery = {
      collection,
      filters: [{ field: 'id', operator: '==', value: id }],
      cache: true
    }

    const result = await this.get<T>(query)
    return result
  }

  /**
   * Create new data
   */
  async create<T = any>(collection: string, data: any): Promise<DataMutationResult<T>> {
    const operationId = this.generateOperationId('write', collection)
    const startTime = performance.now()

    try {
      // Validate data
      this.validateData(data, collection)

      // Track operation
      this.trackOperation({
        id: operationId,
        type: 'write',
        collection,
        timestamp: Date.now(),
        userId: 'anonymous',
        metadata: { data }
      })

      // Set loading state
      this.stateService.setLoading(operationId, true)

      // Optimistic update if enabled
      if (this.config.enableOptimisticUpdates) {
        this.performOptimisticUpdate(collection, data)
      }

      // Perform create operation
      const result = await this.performCreateOperation<T>(collection, data, operationId)

      // Invalidate related caches
      this.invalidateRelatedCaches(collection)

      // Update state
      this.stateService.setData(operationId, result.data)
      this.stateService.setLoading(operationId, false)

      // Track success
      this.analyticsService.trackPerformance('create_operation', {
        startTime,
        endTime: performance.now(),
        duration: performance.now() - startTime,
        operation: 'create_operation',
        cacheHit: false,
        retryCount: 0
      })

      return {
        ...result,
        metadata: {
          timestamp: Date.now(),
          operationId,
          performance: this.calculatePerformanceMetrics(startTime)
        }
      }

    } catch (error) {
      const dataError = this.createDataError(error, operationId, 'write')
      this.stateService.setError(operationId, dataError)
      this.stateService.setLoading(operationId, false)

      this.analyticsService.trackError(dataError)

      return {
        data: null,
        loading: false,
        error: dataError,
        success: false,
        metadata: {
          timestamp: Date.now(),
          operationId,
          performance: this.calculatePerformanceMetrics(startTime)
        }
      }
    }
  }

  /**
   * Update existing data
   */
  async update<T = any>(collection: string, id: string, data: any): Promise<DataMutationResult<T>> {
    const operationId = this.generateOperationId('update', collection)
    const startTime = performance.now()

    try {
      // Validate data
      this.validateData(data, collection)

      // Track operation
      this.trackOperation({
        id: operationId,
        type: 'update',
        collection,
        timestamp: Date.now(),
        userId: 'anonymous',
        metadata: { id, data }
      })

      // Set loading state
      this.stateService.setLoading(operationId, true)

      // Optimistic update if enabled
      if (this.config.enableOptimisticUpdates) {
        this.performOptimisticUpdate(collection, { id, ...data }, true)
      }

      // Perform update operation
      const result = await this.performUpdateOperation<T>(collection, id, data, operationId)

      // Invalidate related caches
      this.invalidateRelatedCaches(collection, id)

      // Update state
      this.stateService.setData(operationId, result.data)
      this.stateService.setLoading(operationId, false)

      // Track success
      this.analyticsService.trackPerformance('update_operation', {
        startTime,
        endTime: performance.now(),
        duration: performance.now() - startTime,
        operation: 'update_operation',
        cacheHit: false,
        retryCount: 0
      })

      return {
        ...result,
        metadata: {
          timestamp: Date.now(),
          operationId,
          performance: this.calculatePerformanceMetrics(startTime)
        }
      }

    } catch (error) {
      const dataError = this.createDataError(error, operationId, 'update')
      this.stateService.setError(operationId, dataError)
      this.stateService.setLoading(operationId, false)

      this.analyticsService.trackError(dataError)

      return {
        data: null,
        loading: false,
        error: dataError,
        success: false,
        metadata: {
          timestamp: Date.now(),
          operationId,
          performance: this.calculatePerformanceMetrics(startTime)
        }
      }
    }
  }

  /**
   * Delete data
   */
  async delete(collection: string, id: string): Promise<DataMutationResult<void>> {
    const operationId = this.generateOperationId('delete', collection)
    const startTime = performance.now()

    try {
      // Track operation
      this.trackOperation({
        id: operationId,
        type: 'delete',
        collection,
        timestamp: Date.now(),
        userId: 'anonymous',
        metadata: { id }
      })

      // Set loading state
      this.stateService.setLoading(operationId, true)

      // Perform delete operation
      const result = await this.performDeleteOperation(collection, id, operationId)

      // Invalidate related caches
      this.invalidateRelatedCaches(collection, id)

      // Update state
      this.stateService.setLoading(operationId, false)

      // Track success
      this.analyticsService.trackPerformance('delete_operation', {
        startTime,
        endTime: performance.now(),
        duration: performance.now() - startTime,
        operation: 'delete_operation',
        cacheHit: false,
        retryCount: 0
      })

      return {
        ...result,
        metadata: {
          timestamp: Date.now(),
          operationId,
          performance: this.calculatePerformanceMetrics(startTime)
        }
      }

    } catch (error) {
      const dataError = this.createDataError(error, operationId, 'delete')
      this.stateService.setError(operationId, dataError)
      this.stateService.setLoading(operationId, false)

      this.analyticsService.trackError(dataError)

      return {
        data: null,
        loading: false,
        error: dataError,
        success: false,
        metadata: {
          timestamp: Date.now(),
          operationId,
          performance: this.calculatePerformanceMetrics(startTime)
        }
      }
    }
  }

  /**
   * Subscribe to real-time data updates
   */
  subscribe(query: DataQuery, callback: (data: any) => void): () => void {
    const subscriptionId = this.generateOperationId('subscribe', query.collection)

    const unsubscribe = this.stateService.subscribeToState(
      this.generateCacheKey(query),
      callback
    )

    // Store subscription reference
    const subscription = this.stateService.getSubscription(subscriptionId)
    if (subscription) {
      subscription.unsubscribe = unsubscribe
    }

    return () => {
      this.stateService.unsubscribe(subscriptionId)
    }
  }

  /**
   * Batch operations
   */
  async batch(operations: any[]): Promise<DataMutationResult<any[]>> {
    // Implementation would handle batch operations
    // For now, return a placeholder implementation
    return {
      data: [],
      loading: false,
      error: null,
      success: true,
      metadata: {
        timestamp: Date.now(),
        operationId: this.generateOperationId('batch', 'multiple'),
        performance: this.calculatePerformanceMetrics(performance.now())
      }
    }
  }

  // Private helper methods

  private async fetchFromNetwork<T>(query: DataQuery, operationId: string): Promise<DataResult<T>> {
    // This would integrate with existing Firebase services
    // For now, return a placeholder implementation
    return {
      data: null as any,
      loading: false,
      error: null
    }
  }

  private async performCreateOperation<T>(collection: string, data: any, operationId: string): Promise<DataMutationResult<T>> {
    // This would integrate with existing Firebase services
    // For now, return a placeholder implementation
    return {
      data: null as any,
      loading: false,
      error: null,
      success: true
    }
  }

  private async performUpdateOperation<T>(collection: string, id: string, data: any, operationId: string): Promise<DataMutationResult<T>> {
    // This would integrate with existing Firebase services
    // For now, return a placeholder implementation
    return {
      data: null as any,
      loading: false,
      error: null,
      success: true
    }
  }

  private async performDeleteOperation(collection: string, id: string, operationId: string): Promise<DataMutationResult<void>> {
    // This would integrate with existing Firebase services
    // For now, return a placeholder implementation
    return {
      data: null,
      loading: false,
      error: null,
      success: true
    }
  }

  private validateData(data: any, collection: string): void {
    // Basic validation - would be enhanced with schema validation
    if (!data || typeof data !== 'object') {
      throw new DataValidationError('Invalid data format', 'data', data)
    }
  }

  private performOptimisticUpdate(collection: string, data: any, isUpdate: boolean = false): void {
    // Implementation for optimistic updates
  }

  private invalidateRelatedCaches(collection: string, id?: string): void {
    // Invalidate cache entries related to this collection
    const pattern = id ? `${collection}_${id}` : collection
    this.cacheService.invalidate(pattern)
  }

  private generateOperationId(type: string, collection: string): string {
    return `${type}_${collection}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateCacheKey(query: DataQuery): string {
    const filters = query.filters?.map(f => `${f.field}_${f.operator}_${f.value}`).join('_') || ''
    const sorting = query.sorting?.map(s => `${s.field}_${s.direction}`).join('_') || ''
    return `${query.collection}_${filters}_${sorting}`
  }

  private createDataError(error: any, operationId: string, operation: string): DataError {
    return {
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message || 'An unknown error occurred',
      timestamp: Date.now(),
      operation,
      context: { operationId },
      originalError: error
    }
  }

  private trackOperation(operation: DataOperation): void {
    this.analyticsService.trackOperation(operation)
  }

  private calculatePerformanceMetrics(startTime: number, endTime?: number): any {
    const end = endTime || performance.now()
    return {
      startTime,
      endTime: end,
      duration: end - startTime,
      cacheHit: false,
      retryCount: 0
    }
  }

  // Configuration and utility methods

  updateConfig(newConfig: Partial<DataManagerConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  getConfig(): DataManagerConfig {
    return this.config
  }

  getAnalytics(): DataAnalytics {
    return this.analyticsService.getAnalytics()
  }

  clearCache(): void {
    this.cacheService.clear()
  }

  getCacheStats(): any {
    return this.cacheService.getStats()
  }

  getState(): any {
    return this.stateService.getState()
  }
}

/**
 * Default DataManager configuration
 */
export const DEFAULT_DATA_MANAGER_CONFIG: DataManagerConfig = {
  enableCaching: true,
  cacheTTL: 300000, // 5 minutes
  enablePersistence: false,
  enableOfflineSupport: false,
  enablePerformanceMonitoring: true,
  enableErrorRetry: true,
  maxRetryAttempts: 3,
  retryDelay: 1000,
  enableOptimisticUpdates: false,
  enableRealTimeUpdates: true
}

/**
 * Factory function to create DataManager
 */
export function createDataManager(
  config: DataManagerConfig,
  cacheService: CacheService,
  stateService: DataStateService,
  analyticsService: DataAnalyticsService
): DataManager {
  return new DataManager(config, cacheService, stateService, analyticsService)
}
