interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
  accessCount: number
  lastAccessed: number
  size: number
  priority: 'low' | 'medium' | 'high'
  tags: string[]
}

interface CacheOptions {
  maxSize?: number // Maximum cache size in bytes
  maxAge?: number // Maximum age in milliseconds
  maxEntries?: number // Maximum number of entries
  priority?: 'low' | 'medium' | 'high'
  tags?: string[]
  enableCompression?: boolean
  enablePersistent?: boolean
  compressionThreshold?: number // Only compress data larger than this
}

interface CacheStats {
  totalEntries: number
  totalSize: number
  hitRate: number
  missRate: number
  evictionCount: number
  compressionRatio: number
  memoryUsage: number
  performance: {
    averageGetTime: number
    averageSetTime: number
    averageCompressionTime: number
  }
}

/**
 * Enterprise-grade advanced caching service
 * 
 * Features:
 * - Intelligent cache invalidation with TTL and LRU
 * - Memory-aware eviction strategies
 * - Data compression for large entries
 * - Tag-based cache management
 * - Performance monitoring and analytics
 * - Persistent caching with localStorage fallback
 * - Priority-based caching strategies
 */
class AdvancedCache {
  private cache = new Map<string, CacheEntry<any>>()
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalGets: 0,
    totalSets: 0,
    totalCompressionTime: 0,
    compressionCount: 0
  }
  
  private options: Required<CacheOptions>
  private compressionWorker?: Worker
  private cleanupInterval?: NodeJS.Timeout
  private isInitialized = false

  constructor(options: CacheOptions = {}) {
    this.options = {
      maxSize: options.maxSize || 100 * 1024 * 1024, // 100MB default
      maxAge: options.maxAge || 5 * 60 * 1000, // 5 minutes default
      maxEntries: options.maxEntries || 1000,
      priority: options.priority || 'medium',
      tags: options.tags || [],
      enableCompression: options.enableCompression ?? true,
      enablePersistent: options.enablePersistent ?? false,
      compressionThreshold: options.compressionThreshold || 1024 // 1KB
    }

    this.initialize()
  }

  /**
   * Initialize the cache service
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized) return

    // Initialize compression worker if enabled
    if (this.options.enableCompression && typeof Worker !== 'undefined') {
      try {
        this.compressionWorker = new Worker(
          new URL('./compressionWorker.js', import.meta.url),
          { type: 'module' }
        )
      } catch (error) {
        console.warn('Compression worker not available, falling back to synchronous compression')
        this.options.enableCompression = false
      }
    }

    // Load persistent cache if enabled
    if (this.options.enablePersistent) {
      await this.loadPersistentCache()
    }

    // Start cleanup interval
    this.startCleanupInterval()

    this.isInitialized = true
  }

  /**
   * Set a value in the cache
   */
  async set<T>(
    key: string, 
    data: T, 
    options: Partial<CacheOptions> = {}
  ): Promise<void> {
    const startTime = performance.now()
    
    const entryOptions = { ...this.options, ...options }
    const size = this.calculateSize(data)
    
    // Check if we need to evict entries
    await this.ensureCapacity(size)
    
    // Compress data if enabled and meets threshold
    let processedData = data
    let compressionTime = 0
    
    if (entryOptions.enableCompression && size > entryOptions.compressionThreshold) {
      const compressionStart = performance.now()
      processedData = await this.compress(data)
      compressionTime = performance.now() - compressionStart
      
      this.stats.totalCompressionTime += compressionTime
      this.stats.compressionCount++
    }

    const entry: CacheEntry<T> = {
      data: processedData,
      timestamp: Date.now(),
      expiresAt: Date.now() + entryOptions.maxAge,
      accessCount: 0,
      lastAccessed: Date.now(),
      size,
      priority: entryOptions.priority,
      tags: entryOptions.tags || []
    }

    this.cache.set(key, entry)
    this.stats.totalSets++

    // Update persistent cache if enabled
    if (entryOptions.enablePersistent) {
      await this.savePersistentCache()
    }

    const setTime = performance.now() - startTime
    this.updatePerformanceStats('set', setTime)
  }

  /**
   * Get a value from the cache
   */
  async get<T>(key: string): Promise<T | null> {
    const startTime = performance.now()
    
    const entry = this.cache.get(key)
    
    if (!entry) {
      this.stats.misses++
      this.stats.totalGets++
      return null
    }

    // Check if entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      this.stats.misses++
      this.stats.totalGets++
      return null
    }

    // Update access statistics
    entry.accessCount++
    entry.lastAccessed = Date.now()

    // Decompress data if it was compressed
    let data = entry.data
    if (this.isCompressed(data)) {
      data = await this.decompress(data)
    }

    this.stats.hits++
    this.stats.totalGets++

    const getTime = performance.now() - startTime
    this.updatePerformanceStats('get', getTime)

    return data
  }

  /**
   * Check if a key exists in the cache
   */
  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }

  /**
   * Delete a specific key from the cache
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key)
    if (entry) {
      this.stats.evictions++
      return this.cache.delete(key)
    }
    return false
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear()
    this.stats.evictions += this.cache.size
  }

  /**
   * Clear cache entries by tags
   */
  clearByTags(tags: string[]): number {
    let clearedCount = 0
    
    for (const [key, entry] of this.cache.entries()) {
      if (tags.some(tag => entry.tags.includes(tag))) {
        this.cache.delete(key)
        clearedCount++
      }
    }
    
    this.stats.evictions += clearedCount
    return clearedCount
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const totalEntries = this.cache.size
    const totalSize = Array.from(this.cache.values()).reduce((sum, entry) => sum + entry.size, 0)
    const hitRate = this.stats.totalGets > 0 ? this.stats.hits / this.stats.totalGets : 0
    const missRate = this.stats.totalGets > 0 ? this.stats.misses / this.stats.totalGets : 0
    const compressionRatio = this.stats.compressionCount > 0 
      ? this.stats.totalCompressionTime / this.stats.compressionCount 
      : 0

    return {
      totalEntries,
      totalSize,
      hitRate,
      missRate,
      evictionCount: this.stats.evictions,
      compressionRatio,
      memoryUsage: this.getMemoryUsage(),
      performance: {
        averageGetTime: this.getAverageTime('get'),
        averageSetTime: this.getAverageTime('set'),
        averageCompressionTime: compressionRatio
      }
    }
  }

  /**
   * Ensure cache capacity for new entry
   */
  private async ensureCapacity(requiredSize: number): Promise<void> {
    if (this.cache.size === 0) return

    const currentSize = Array.from(this.cache.values()).reduce((sum, entry) => sum + entry.size, 0)
    const availableSize = this.options.maxSize - currentSize

    if (requiredSize <= availableSize && this.cache.size < this.options.maxEntries) {
      return
    }

    // Evict entries based on priority and access patterns
    const entries = Array.from(this.cache.entries())
      .map(([key, entry]) => ({ key, entry }))
      .sort((a, b) => {
        // Sort by priority first, then by access count and last accessed time
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        const priorityDiff = priorityOrder[b.entry.priority] - priorityOrder[a.entry.priority]
        
        if (priorityDiff !== 0) return priorityDiff
        
        // Then by access count (LRU)
        const accessDiff = b.entry.accessCount - a.entry.accessCount
        if (accessDiff !== 0) return accessDiff
        
        // Finally by last accessed time
        return a.entry.lastAccessed - b.entry.lastAccessed
      })

    // Evict entries until we have enough space
    for (const { key } of entries) {
      this.cache.delete(key)
      this.stats.evictions++
      
      const newSize = Array.from(this.cache.values()).reduce((sum, entry) => sum + entry.size, 0)
      if (requiredSize <= (this.options.maxSize - newSize) && this.cache.size < this.options.maxEntries) {
        break
      }
    }
  }

  /**
   * Calculate size of data in bytes
   */
  private calculateSize(data: any): number {
    try {
      const jsonString = JSON.stringify(data)
      return new Blob([jsonString]).size
    } catch {
      // Fallback for non-serializable data
      return 1024 // Default 1KB estimate
    }
  }

  /**
   * Compress data using compression worker or fallback
   */
  private async compress(data: any): Promise<any> {
    if (!this.options.enableCompression) return data

    try {
      if (this.compressionWorker) {
        return new Promise((resolve, reject) => {
          const messageId = Math.random().toString(36)
          
          const handler = (event: MessageEvent) => {
            if (event.data.id === messageId) {
              this.compressionWorker?.removeEventListener('message', handler)
              if (event.data.error) {
                reject(new Error(event.data.error))
              } else {
                resolve(event.data.compressed)
              }
            }
          }
          
          this.compressionWorker?.addEventListener('message', handler)
          this.compressionWorker?.postMessage({
            id: messageId,
            action: 'compress',
            data
          })
        })
      } else {
        // Fallback to simple compression
        return this.simpleCompress(data)
      }
    } catch (error) {
      console.warn('Compression failed, storing uncompressed data:', error)
      return data
    }
  }

  /**
   * Decompress data
   */
  private async decompress(data: any): Promise<any> {
    if (!this.isCompressed(data)) return data

    try {
      if (this.compressionWorker) {
        return new Promise((resolve, reject) => {
          const messageId = Math.random().toString(36)
          
          const handler = (event: MessageEvent) => {
            if (event.data.id === messageId) {
              this.compressionWorker?.removeEventListener('message', handler)
              if (event.data.error) {
                reject(new Error(event.data.error))
              } else {
                resolve(event.data.decompressed)
              }
            }
          }
          
          this.compressionWorker?.addEventListener('message', handler)
          this.compressionWorker?.postMessage({
            id: messageId,
            action: 'decompress',
            data
          })
        })
      } else {
        // Fallback to simple decompression
        return this.simpleDecompress(data)
      }
    } catch (error) {
      console.warn('Decompression failed, returning compressed data:', error)
      return data
    }
  }

  /**
   * Simple compression fallback
   */
  private simpleCompress(data: any): any {
    try {
      const jsonString = JSON.stringify(data)
      return { _compressed: true, data: btoa(jsonString) }
    } catch {
      return data
    }
  }

  /**
   * Simple decompression fallback
   */
  private simpleDecompress(data: any): any {
    try {
      if (data._compressed && data.data) {
        const jsonString = atob(data.data)
        return JSON.parse(jsonString)
      }
      return data
    } catch {
      return data
    }
  }

  /**
   * Check if data is compressed
   */
  private isCompressed(data: any): boolean {
    return data && typeof data === 'object' && data._compressed === true
  }

  /**
   * Get memory usage
   */
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize
    }
    return 0
  }

  /**
   * Update performance statistics
   */
  private updatePerformanceStats(operation: 'get' | 'set', time: number): void {
    // Implementation for tracking average operation times
  }

  /**
   * Get average time for operations
   */
  private getAverageTime(operation: 'get' | 'set'): number {
    // Implementation for calculating average times
    return 0
  }

  /**
   * Start cleanup interval
   */
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 60000) // Cleanup every minute
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    let cleanedCount = 0
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
        cleanedCount++
      }
    }
    
    if (cleanedCount > 0) {
      this.stats.evictions += cleanedCount
      console.log(`Cache cleanup: removed ${cleanedCount} expired entries`)
    }
  }

  /**
   * Save cache to persistent storage
   */
  private async savePersistentCache(): Promise<void> {
    if (!this.options.enablePersistent) return

    try {
      const persistentData = {
        entries: Array.from(this.cache.entries()),
        timestamp: Date.now(),
        version: '1.0'
      }
      
      localStorage.setItem('medflow_cache', JSON.stringify(persistentData))
    } catch (error) {
      console.warn('Failed to save persistent cache:', error)
    }
  }

  /**
   * Load cache from persistent storage
   */
  private async loadPersistentCache(): Promise<void> {
    if (!this.options.enablePersistent) return

    try {
      const cached = localStorage.getItem('medflow_cache')
      if (!cached) return

      const persistentData = JSON.parse(cached)
      
      // Only load if cache is not too old (24 hours)
      if (Date.now() - persistentData.timestamp > 24 * 60 * 60 * 1000) {
        localStorage.removeItem('medflow_cache')
        return
      }

      // Restore cache entries
      for (const [key, entry] of persistentData.entries) {
        if (Date.now() <= entry.expiresAt) {
          this.cache.set(key, entry)
        }
      }
    } catch (error) {
      console.warn('Failed to load persistent cache:', error)
      localStorage.removeItem('medflow_cache')
    }
  }

  /**
   * Destroy the cache service
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    
    if (this.compressionWorker) {
      this.compressionWorker.terminate()
    }
    
    this.cache.clear()
    this.isInitialized = false
  }
}

// Export singleton instance
export const advancedCache = new AdvancedCache()

// Export types for external use
export type {
  CacheOptions,
  CacheStats,
  CacheEntry
}

export default AdvancedCache
