/**
 * usePerformance Hook for MedFlow
 * 
 * This hook provides easy access to performance utilities and monitoring capabilities.
 * It automatically initializes performance optimizations and provides real-time metrics.
 * 
 * Features:
 * - Automatic performance optimization initialization
 * - Real-time performance monitoring
 * - Device capability detection
 * - Memory usage tracking
 * - FPS monitoring
 * - Automatic cleanup on unmount
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const {
 *     metrics,
 *     deviceCapabilities,
 *     enableOptimizations,
 *     cleanup
 *   } = usePerformance()
 *   
 *   // Use performance data in your component
 *   console.log('Current FPS:', metrics.fps)
 * }
 * ```
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  initPerformanceOptimizations,
  checkDeviceCapabilities,
  PERFORMANCE_CONFIG,
  type PerformanceMetrics
} from '../utils/performance'

export interface UsePerformanceReturn {
  // Performance metrics
  metrics: PerformanceMetrics
  
  // Device capabilities
  deviceCapabilities: ReturnType<typeof checkDeviceCapabilities>
  
  // Performance utilities
  enableOptimizations: () => void
  cleanup: () => void
  
  // Configuration
  config: typeof PERFORMANCE_CONFIG
  
  // Status
  isInitialized: boolean
  isLoading: boolean
}

export function usePerformance(): UsePerformanceReturn {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    loadTime: 0,
    renderTime: 0,
    eventListeners: 0,
    animations: 0
  })
  
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // Refs for cleanup
  const performanceInstanceRef = useRef<ReturnType<typeof initPerformanceOptimizations> | null>(null)
  const metricsIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const animationFrameRef = useRef<number | undefined>(undefined)
  
  // Initialize performance optimizations
  const enableOptimizations = useCallback(() => {
    if (typeof window === 'undefined' || isInitialized) return
    
    try {
      setIsLoading(true)
      
      // Initialize performance optimizations
      const instance = initPerformanceOptimizations()
      performanceInstanceRef.current = instance
      
      if (instance) {
        setIsInitialized(true)
        
        // Start metrics collection
        const updateMetrics = () => {
          const currentMetrics = instance.getMetrics()
          setMetrics(currentMetrics)
          
          // Schedule next update
          metricsIntervalRef.current = setTimeout(updateMetrics, 1000) // Update every second
        }
        
        // Initial metrics update
        updateMetrics()
      }
    } catch (error) {
      console.warn('Failed to initialize performance optimizations:', error)
    } finally {
      setIsLoading(false)
    }
  }, [isInitialized])
  
  // Cleanup function
  const cleanup = useCallback(() => {
    try {
      // Stop metrics collection
      if (metricsIntervalRef.current) {
        clearTimeout(metricsIntervalRef.current)
      }
      
      // Stop animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      
      // Stop performance monitor
      if (performanceInstanceRef.current?.monitor) {
        performanceInstanceRef.current.monitor.stop()
      }
      
      // Run cleanup
      if (performanceInstanceRef.current?.cleanup) {
        performanceInstanceRef.current.cleanup()
      }
      
      // Reset state
      setIsInitialized(false)
      setMetrics({
        fps: 0,
        loadTime: 0,
        renderTime: 0,
        eventListeners: 0,
        animations: 0
      })
      
      performanceInstanceRef.current = null
    } catch (error) {
      console.warn('Error during performance cleanup:', error)
    }
  }, [])
  
  // Initialize on mount
  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return
    
    // Initialize optimizations
    enableOptimizations()
    
    // Cleanup on unmount
    return () => {
      cleanup()
    }
  }, [enableOptimizations, cleanup])
  
  // Get device capabilities
  const deviceCapabilities = checkDeviceCapabilities()
  
  return {
    metrics,
    deviceCapabilities,
    enableOptimizations,
    cleanup,
    config: PERFORMANCE_CONFIG,
    isInitialized,
    isLoading
  }
}

// Convenience hook for performance monitoring only
export function usePerformanceMonitor() {
  const { metrics, isInitialized } = usePerformance()
  
  return {
    metrics,
    isInitialized,
    hasData: isInitialized && metrics.fps > 0
  }
}

// Hook for device capabilities only
export function useDeviceCapabilities() {
  const { deviceCapabilities } = usePerformance()
  
  return deviceCapabilities
}

// Hook for performance configuration
export function usePerformanceConfig() {
  const { config } = usePerformance()
  
  return config
}
