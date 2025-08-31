import { DocumentData, Query } from 'firebase/firestore'
import { DataManager } from '../core/dataManager'

/**
 * Enhanced Data Management Types for Advanced Module Architecture
 *
 * These types provide comprehensive support for the advanced data management system
 * while maintaining backward compatibility with existing implementations.
 */

export interface DataManagerConfig {
  enableCaching: boolean
  cacheTTL: number
  enablePersistence: boolean
  enableOfflineSupport: boolean
  enablePerformanceMonitoring: boolean
  enableErrorRetry: boolean
  maxRetryAttempts: number
  retryDelay: number
  enableOptimisticUpdates: boolean
  enableRealTimeUpdates: boolean
  customSettings?: Record<string, any>
}

export interface DataQuery {
  collection: string
  filters?: DataFilter[]
  sorting?: DataSort[]
  pagination?: DataPagination
  realTime?: boolean
  cache?: boolean
}

export interface DataFilter {
  field: string
  operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'not-in' | 'array-contains' | 'array-contains-any'
  value: any
}

export interface DataSort {
  field: string
  direction: 'asc' | 'desc'
}

export interface DataPagination {
  limit: number
  offset?: number
  startAfter?: any
  endBefore?: any
}

export interface DataOperation {
  id: string
  type: 'read' | 'write' | 'update' | 'delete' | 'batch'
  collection: string
  timestamp: number
  userId?: string
  metadata?: Record<string, any>
}

export interface DataCacheEntry {
  key: string
  data: any
  timestamp: number
  ttl: number
  version: string
  dependencies?: string[]
  metadata?: Record<string, any>
}

export interface DataState {
  loading: Record<string, boolean>
  data: Record<string, any>
  errors: Record<string, DataError>
  cache: Map<string, DataCacheEntry>
  operations: DataOperation[]
  subscriptions: Map<string, DataSubscription>
}

export interface DataSubscription {
  id: string
  query: DataQuery
  callback: (data: any) => void
  unsubscribe?: () => void
  errorCallback?: (error: DataError) => void
}

export interface DataError {
  code: string
  message: string
  timestamp: number
  operation?: string
  retryCount?: number
  context?: Record<string, any>
  originalError?: any
}

export interface DataResult<T = any> {
  data: T
  loading: boolean
  error: DataError | null
  metadata?: {
    timestamp: number
    cacheHit?: boolean
    source: 'cache' | 'network' | 'memory'
    performance?: DataPerformanceMetrics
  }
}

export interface DataMutationResult<T = any> {
  data: T | null
  loading: boolean
  error: DataError | null
  success: boolean
  metadata?: {
    timestamp: number
    operationId: string
    performance?: DataPerformanceMetrics
  }
}

export interface DataPerformanceMetrics {
  startTime: number
  endTime: number
  duration: number
  operation: string
  cacheHit: boolean
  networkLatency?: number
  retryCount: number
  memoryUsage?: number
  componentLoadTime?: number
}

export interface DataAnalytics {
  operations: DataOperationAnalytics[]
  cache: DataCacheAnalytics
  errors: DataErrorAnalytics
  performance: DataPerformanceAnalytics
}

export interface DataOperationAnalytics {
  type: string
  count: number
  averageDuration: number
  successRate: number
  errorRate: number
}

export interface DataCacheAnalytics {
  totalEntries: number
  hitRate: number
  missRate: number
  averageTTL: number
  memoryUsage: number
}

export interface DataErrorAnalytics {
  totalErrors: number
  errorTypes: Record<string, number>
  retrySuccessRate: number
  averageRetryCount: number
}

export interface DataPerformanceAnalytics {
  averageResponseTime: number
  p95ResponseTime: number
  p99ResponseTime: number
  throughput: number
  memoryUsage: number
}

// Custom hook interfaces
export interface UseDataOptions {
  cache?: boolean
  realTime?: boolean
  retry?: boolean
  maxRetries?: number
  onSuccess?: (data: any) => void
  onError?: (error: DataError) => void
  transform?: (data: any) => any
  enabled?: boolean
}

export interface UseMutationOptions {
  optimisticUpdate?: boolean
  retry?: boolean
  maxRetries?: number
  onSuccess?: (data: any) => void
  onError?: (error: DataError) => void
  onSettled?: (data: any, error: DataError | null) => void
  transform?: (data: any) => any
}

// Service interfaces
export interface DataService {
  get<T = any>(query: DataQuery): Promise<DataResult<T>>
  getById<T = any>(collection: string, id: string): Promise<DataResult<T>>
  create<T = any>(collection: string, data: any): Promise<DataMutationResult<T>>
  update<T = any>(collection: string, id: string, data: any): Promise<DataMutationResult<T>>
  delete(collection: string, id: string): Promise<DataMutationResult<void>>
  subscribe(query: DataQuery, callback: (data: any) => void): () => void
  batch(operations: DataBatchOperation[]): Promise<DataMutationResult<any[]>>
}

export interface DataBatchOperation {
  type: 'create' | 'update' | 'delete'
  collection: string
  id?: string
  data?: any
}

export interface CacheService {
  get<T = any>(key: string): DataCacheEntry | null
  set<T = any>(key: string, data: T, ttl?: number): void
  delete(key: string): boolean
  clear(): void
  cleanup(): number
  getStats(): DataCacheAnalytics
  invalidate(pattern: string): number
}

export interface StateService {
  getState(): DataState
  setLoading(key: string, loading: boolean): void
  setData<T = any>(key: string, data: T): void
  setError(key: string, error: DataError): void
  clearError(key: string): void
  subscribeToState(key: string, callback: (data: any) => void): () => void
  getSubscription(id: string): DataSubscription | undefined
  unsubscribe(id: string): void
}

export interface AnalyticsService {
  trackOperation(operation: DataOperation): void
  trackError(error: DataError): void
  trackPerformance(operation: string, metrics: DataPerformanceMetrics): void
  getAnalytics(): DataAnalytics
  exportAnalytics(): string
  clearAnalytics(): void
}

// Error classes
export class DataManagerError extends Error {
  constructor(
    message: string,
    public code: string,
    public operation?: string,
    public context?: Record<string, any>
  ) {
    super(message)
    this.name = 'DataManagerError'
  }
}

export class DataCacheError extends DataManagerError {
  constructor(
    message: string,
    public cacheKey: string,
    public context?: Record<string, any>
  ) {
    super(message, 'CACHE_ERROR', undefined, context)
    this.name = 'DataCacheError'
  }
}

export class DataNetworkError extends DataManagerError {
  constructor(
    message: string,
    public operation: string,
    public retryCount: number,
    public context?: Record<string, any>
  ) {
    super(message, 'NETWORK_ERROR', operation, context)
    this.name = 'DataNetworkError'
  }
}

export class DataValidationError extends DataManagerError {
  constructor(
    message: string,
    public field: string,
    public value: any,
    public context?: Record<string, any>
  ) {
    super(message, 'VALIDATION_ERROR', undefined, context)
    this.name = 'DataValidationError'
  }
}

// Utility types for better type safety
export type DataServiceMethod = keyof DataService
export type DataCacheMethod = keyof CacheService
export type DataStateMethod = keyof StateService
export type DataAnalyticsMethod = keyof AnalyticsService

// Configuration types
export interface DataRetryConfig {
  enabled: boolean
  maxAttempts: number
  delay: number
  backoffMultiplier: number
  maxDelay: number
}

export interface DataOfflineConfig {
  enabled: boolean
  maxQueueSize: number
  syncInterval: number
  conflictResolution: 'client-wins' | 'server-wins' | 'manual'
}

export interface DataValidationConfig {
  enabled: boolean
  schemas: Record<string, DataSchema>
  strictMode: boolean
}

export interface DataSchema {
  collection: string
  fields: Record<string, DataFieldSchema>
  requiredFields: string[]
  indexes: string[]
}

export interface DataFieldSchema {
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object'
  required: boolean
  default?: any
  validation?: {
    min?: number
    max?: number
    pattern?: string
    enum?: any[]
  }
}

// Hook return types
export interface UseDataReturn<T = any> extends DataResult<T> {
  refetch: () => Promise<void>
  invalidate: () => void
}

export interface UseMutationReturn<TData = any, TVariables = any> {
  mutate: (variables: TVariables) => Promise<DataMutationResult<TData>>
  mutateAsync: (variables: TVariables) => Promise<TData>
  result: DataMutationResult<TData>
}

// Context and provider types
export interface DataManagerContextValue {
  dataManager: DataManager
  config: DataManagerConfig
}

export interface DataProviderProps {
  config?: Partial<DataManagerConfig>
  children: React.ReactNode
}
