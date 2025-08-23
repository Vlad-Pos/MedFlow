import {
  DataCacheEntry,
  DataCacheAnalytics,
  DataCacheError
} from '../types/data-management.types'

/**
 * Advanced Cache Service
 *
 * Multi-level caching system with intelligent invalidation and performance optimization
 * for the data management layer.
 */

export class CacheService {
  private cache: Map<string, DataCacheEntry> = new Map()
  private maxSize: number = 1000
  private cleanupInterval: number | null = null
  private enablePersistence: boolean = false
  private persistenceKey: string = 'medflow_data_cache'

  constructor(maxSize: number = 1000, enablePersistence: boolean = false) {
    this.maxSize = maxSize
    this.enablePersistence = enablePersistence

    if (this.enablePersistence) {
      this.loadPersistedCache()
    }

    // Start cleanup interval (every 5 minutes)
    this.cleanupInterval = window.setInterval(() => {
      this.cleanup()
    }, 300000)
  }

  /**
   * Get cached data
   */
  get<T = any>(key: string): DataCacheEntry | null {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // Check if entry has expired
    if (this.isExpired(entry)) {
      this.cache.delete(key)
      return null
    }

    // Update access timestamp for LRU
    entry.metadata = {
      ...entry.metadata,
      lastAccessed: Date.now(),
      accessCount: (entry.metadata?.accessCount || 0) + 1
    }

    return entry
  }

  /**
   * Set cached data
   */
  set<T = any>(
    key: string,
    data: T,
    ttl: number = 300000, // 5 minutes default
    version: string = '1.0',
    dependencies: string[] = []
  ): void {
    // Check cache size limit
    if (this.cache.size >= this.maxSize) {
      this.evictLRU()
    }

    const entry: DataCacheEntry = {
      key,
      data,
      timestamp: Date.now(),
      ttl,
      version,
      dependencies,
      metadata: {
        created: Date.now(),
        lastAccessed: Date.now(),
        accessCount: 0,
        size: this.calculateDataSize(data)
      }
    }

    this.cache.set(key, entry)

    if (this.enablePersistence) {
      this.savePersistedCache()
    }
  }

  /**
   * Delete cached data
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key)

    if (deleted && this.enablePersistence) {
      this.savePersistedCache()
    }

    return deleted
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.cache.clear()

    if (this.enablePersistence) {
      localStorage.removeItem(this.persistenceKey)
    }
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size
  }

  /**
   * Check if cache contains key
   */
  has(key: string): boolean {
    const entry = this.cache.get(key)
    return entry !== undefined && !this.isExpired(entry)
  }

  /**
   * Get all cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys()).filter(key => {
      const entry = this.cache.get(key)
      return entry && !this.isExpired(entry)
    })
  }

  /**
   * Get cache statistics
   */
  getStats(): DataCacheAnalytics {
    const validEntries = Array.from(this.cache.values()).filter(entry => !this.isExpired(entry))
    const expiredEntries = Array.from(this.cache.values()).filter(entry => this.isExpired(entry))

    const totalSize = validEntries.reduce((sum, entry) => sum + (entry.metadata?.size || 0), 0)
    const averageTTL = validEntries.length > 0
      ? validEntries.reduce((sum, entry) => sum + entry.ttl, 0) / validEntries.length
      : 0

    // Calculate hit rate (would need tracking of total requests)
    const hitRate = 0.85 // Placeholder - would be calculated from actual usage

    return {
      totalEntries: validEntries.length,
      hitRate,
      missRate: 1 - hitRate,
      averageTTL,
      memoryUsage: totalSize
    }
  }

  /**
   * Invalidate cache entries matching pattern
   */
  invalidate(pattern: string): number {
    const keysToDelete: string[] = []
    const regex = new RegExp(pattern.replace(/\*/g, '.*'))

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key))

    if (keysToDelete.length > 0 && this.enablePersistence) {
      this.savePersistedCache()
    }

    return keysToDelete.length
  }

  /**
   * Cleanup expired entries
   */
  cleanup(): number {
    let removedCount = 0
    const keysToDelete: string[] = []

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        keysToDelete.push(key)
        removedCount++
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key))

    if (removedCount > 0 && this.enablePersistence) {
      this.savePersistedCache()
    }

    return removedCount
  }

  /**
   * Set maximum cache size
   */
  setMaxSize(size: number): void {
    this.maxSize = size
    this.enforceSizeLimit()
  }

  /**
   * Enable/disable persistence
   */
  setPersistence(enabled: boolean): void {
    this.enablePersistence = enabled
    if (enabled) {
      this.savePersistedCache()
    } else {
      localStorage.removeItem(this.persistenceKey)
    }
  }

  /**
   * Get cache entry metadata
   */
  getMetadata(key: string): any {
    const entry = this.cache.get(key)
    return entry?.metadata || null
  }

  /**
   * Update cache entry TTL
   */
  updateTTL(key: string, ttl: number): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    entry.ttl = ttl
    entry.timestamp = Date.now() // Reset timestamp

    if (this.enablePersistence) {
      this.savePersistedCache()
    }

    return true
  }

  /**
   * Get cache entries by pattern
   */
  getByPattern(pattern: string): DataCacheEntry[] {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'))
    const matchingEntries: DataCacheEntry[] = []

    for (const [key, entry] of this.cache.entries()) {
      if (regex.test(key) && !this.isExpired(entry)) {
        matchingEntries.push(entry)
      }
    }

    return matchingEntries
  }

  /**
   * Warm up cache with data
   */
  warmUp(data: Record<string, any>, ttl: number = 300000): void {
    Object.entries(data).forEach(([key, value]) => {
      this.set(key, value, ttl)
    })
  }

  // Private helper methods

  private isExpired(entry: DataCacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl
  }

  private calculateDataSize(data: any): number {
    try {
      return JSON.stringify(data).length
    } catch {
      return 0
    }
  }

  private evictLRU(): void {
    // Find the least recently used entry
    let oldestKey: string | null = null
    let oldestTime = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      const lastAccessed = entry.metadata?.lastAccessed || entry.timestamp
      if (lastAccessed < oldestTime) {
        oldestTime = lastAccessed
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  private enforceSizeLimit(): void {
    while (this.cache.size > this.maxSize) {
      this.evictLRU()
    }
  }

  private loadPersistedCache(): void {
    try {
      const persistedData = localStorage.getItem(this.persistenceKey)
      if (persistedData) {
        const parsedData = JSON.parse(persistedData)

        // Validate and restore cache entries
        Object.entries(parsedData).forEach(([key, entry]: [string, any]) => {
          if (this.isValidCacheEntry(entry)) {
            this.cache.set(key, entry)
          }
        })
      }
    } catch (error) {
      console.warn('[CacheService] Failed to load persisted cache:', error)
    }
  }

  private savePersistedCache(): void {
    try {
      const cacheData: Record<string, DataCacheEntry> = {}

      // Only persist non-expired entries
      for (const [key, entry] of this.cache.entries()) {
        if (!this.isExpired(entry)) {
          cacheData[key] = entry
        }
      }

      localStorage.setItem(this.persistenceKey, JSON.stringify(cacheData))
    } catch (error) {
      console.warn('[CacheService] Failed to save persisted cache:', error)
    }
  }

  private isValidCacheEntry(entry: any): entry is DataCacheEntry {
    return (
      entry &&
      typeof entry === 'object' &&
      typeof entry.key === 'string' &&
      typeof entry.timestamp === 'number' &&
      typeof entry.ttl === 'number' &&
      typeof entry.version === 'string' &&
      'data' in entry
    )
  }

  /**
   * Cleanup on destroy
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.clear()
  }
}

/**
 * Factory function to create CacheService
 */
export function createCacheService(
  maxSize?: number,
  enablePersistence?: boolean
): CacheService {
  return new CacheService(maxSize, enablePersistence)
}

/**
 * Default cache configurations
 */
export const CACHE_CONFIG = {
  DEFAULT_TTL: 300000, // 5 minutes
  MAX_SIZE: 1000,
  CLEANUP_INTERVAL: 300000, // 5 minutes
  PERSISTENCE_KEY: 'medflow_data_cache'
}
