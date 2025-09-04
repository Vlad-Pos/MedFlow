import { useCallback, useRef, useEffect } from 'react'
import { collection, query, where, orderBy, limit, getDocs, DocumentData, QuerySnapshot } from 'firebase/firestore'
import { db } from '../services/firebase'

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

interface FirebaseCache {
  [key: string]: CacheEntry<any>
}

/**
 * Hook for optimizing Firebase operations with intelligent caching
 * 
 * Features:
 * - In-memory caching with TTL
 * - Batch query optimization
 * - Connection pooling simulation
 * - Performance monitoring
 */
export function useFirebaseOptimization() {
  const cache = useRef<FirebaseCache>({})
  const queryQueue = useRef<Set<string>>(new Set())
  const performanceMetrics = useRef<{
    cacheHits: number
    cacheMisses: number
    queryTime: number[]
    totalQueries: number
  }>({
    cacheHits: 0,
    cacheMisses: 0,
    queryTime: [],
    totalQueries: 0
  })

  // Cache TTL in milliseconds (5 minutes default)
  const DEFAULT_TTL = 5 * 60 * 1000

  // Clean expired cache entries
  const cleanExpiredCache = useCallback(() => {
    const now = Date.now()
    Object.keys(cache.current).forEach(key => {
      const entry = cache.current[key]
      if (now - entry.timestamp > entry.ttl) {
        delete cache.current[key]
      }
    })
  }, [])

  // Generate cache key from query parameters
  const generateCacheKey = useCallback((collectionName: string, queryParams: any): string => {
    return `${collectionName}:${JSON.stringify(queryParams)}`
  }, [])

  // Optimized query function with caching
  const optimizedQuery = useCallback(async <T = DocumentData>(
    collectionName: string,
    queryParams: {
      where?: Array<{ field: string; operator: any; value: any }>
      orderBy?: Array<{ field: string; direction?: 'asc' | 'desc' }>
      limit?: number
    } = {},
    options: {
      ttl?: number
      forceRefresh?: boolean
      useCache?: boolean
    } = {}
  ): Promise<T[]> => {
    const startTime = performance.now()
    const cacheKey = generateCacheKey(collectionName, queryParams)
    const { ttl = DEFAULT_TTL, forceRefresh = false, useCache = true } = options

    // Check cache first (unless force refresh is requested)
    if (useCache && !forceRefresh && cache.current[cacheKey]) {
      const entry = cache.current[cacheKey]
      if (Date.now() - entry.timestamp < entry.ttl) {
        performanceMetrics.current.cacheHits++
        return entry.data
      }
    }

    // Prevent duplicate queries
    if (queryQueue.current.has(cacheKey)) {
      // Wait for existing query to complete
      return new Promise((resolve) => {
        const checkCache = () => {
          if (cache.current[cacheKey]) {
            resolve(cache.current[cacheKey].data)
          } else {
            setTimeout(checkCache, 100)
          }
        }
        checkCache()
      })
    }

    queryQueue.current.add(cacheKey)
    performanceMetrics.current.cacheMisses++

    try {
      // Build Firestore query
      let q: any = collection(db, collectionName)
      
      if (queryParams.where) {
        queryParams.where.forEach(({ field, operator, value }) => {
          q = query(q, where(field, operator, value))
        })
      }
      
      if (queryParams.orderBy) {
        queryParams.orderBy.forEach(({ field, direction = 'asc' }) => {
          q = query(q, orderBy(field, direction))
        })
      }
      
      if (queryParams.limit) {
        q = query(q, limit(queryParams.limit))
      }

      // Execute query
      const querySnapshot: QuerySnapshot = await getDocs(q)
      const results = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[]

      // Cache results
      cache.current[cacheKey] = {
        data: results,
        timestamp: Date.now(),
        ttl
      }

      return results
    } catch (error) {
      console.error('Firebase query error:', error)
      throw error
    } finally {
      queryQueue.current.delete(cacheKey)
      const endTime = performance.now()
      performanceMetrics.current.queryTime.push(endTime - startTime)
      performanceMetrics.current.totalQueries++
    }
  }, [generateCacheKey])

  // Batch multiple queries for better performance
  const batchQuery = useCallback(async <T = DocumentData>(
    queries: Array<{
      collectionName: string
      queryParams: any
      options?: any
    }>
  ): Promise<T[][]> => {
    const results = await Promise.all(
      queries.map(({ collectionName, queryParams, options }) =>
        optimizedQuery<T>(collectionName, queryParams, options)
      )
    )
    return results
  }, [optimizedQuery])

  // Clear cache for specific collection or all
  const clearCache = useCallback((collectionName?: string) => {
    if (collectionName) {
      Object.keys(cache.current).forEach(key => {
        if (key.startsWith(`${collectionName}:`)) {
          delete cache.current[key]
        }
      })
    } else {
      cache.current = {}
    }
  }, [])

  // Get performance metrics
  const getPerformanceMetrics = useCallback(() => {
    const avgQueryTime = performanceMetrics.current.queryTime.length > 0
      ? performanceMetrics.current.queryTime.reduce((a, b) => a + b, 0) / performanceMetrics.current.queryTime.length
      : 0

    return {
      cacheHits: performanceMetrics.current.cacheHits,
      cacheMisses: performanceMetrics.current.cacheMisses,
      cacheHitRate: performanceMetrics.current.cacheHits / (performanceMetrics.current.cacheHits + performanceMetrics.current.cacheMisses),
      averageQueryTime: avgQueryTime,
      totalQueries: performanceMetrics.current.totalQueries,
      cacheSize: Object.keys(cache.current).length
    }
  }, [])

  // Clean expired cache entries periodically
  useEffect(() => {
    const interval = setInterval(cleanExpiredCache, 60000) // Clean every minute
    return () => clearInterval(interval)
  }, [cleanExpiredCache])

  return {
    optimizedQuery,
    batchQuery,
    clearCache,
    getPerformanceMetrics,
    cacheSize: Object.keys(cache.current).length
  }
}

export default useFirebaseOptimization
