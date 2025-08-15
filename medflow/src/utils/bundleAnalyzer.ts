/**
 * Bundle Analyzer Utility
 * 
 * Provides utilities for analyzing bundle size, performance metrics,
 * and identifying optimization opportunities in production builds.
 */

interface BundleMetrics {
  totalSize: number
  totalSizeFormatted: string
  chunkCount: number
  largestChunk: {
    name: string
    size: number
    sizeFormatted: string
  }
  chunks: Array<{
    name: string
    size: number
    sizeFormatted: string
    percentage: number
  }>
  recommendations: string[]
}

/**
 * Analyze the current bundle and provide optimization recommendations
 */
export function analyzeBundle(): BundleMetrics {
  const metrics: BundleMetrics = {
    totalSize: 0,
    totalSizeFormatted: '0 B',
    chunkCount: 0,
    largestChunk: { name: '', size: 0, sizeFormatted: '0 B' },
    chunks: [],
    recommendations: []
  }

  try {
    // Get performance timing data
    const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const resourceTiming = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    
    // Calculate total bundle size from resource timing
    const jsResources = resourceTiming.filter(resource => 
      resource.name.includes('.js') && 
      resource.name.includes(window.location.origin)
    )
    
    metrics.totalSize = jsResources.reduce((total, resource) => {
      const size = resource.transferSize || resource.encodedBodySize || 0
      return total + size
    }, 0)
    
    metrics.totalSizeFormatted = formatBytes(metrics.totalSize)
    metrics.chunkCount = jsResources.length

    // Analyze individual chunks
    jsResources.forEach(resource => {
      const size = resource.transferSize || resource.encodedBodySize || 0
      const name = resource.name.split('/').pop() || 'unknown'
      const percentage = (size / metrics.totalSize) * 100
      
      metrics.chunks.push({
        name,
        size,
        sizeFormatted: formatBytes(size),
        percentage: Math.round(percentage * 100) / 100
      })
    })

    // Sort chunks by size and find largest
    metrics.chunks.sort((a, b) => b.size - a.size)
    if (metrics.chunks.length > 0) {
      metrics.largestChunk = {
        name: metrics.chunks[0].name,
        size: metrics.chunks[0].size,
        sizeFormatted: metrics.chunks[0].sizeFormatted
      }
    }

    // Generate optimization recommendations
    metrics.recommendations = generateRecommendations(metrics, navigationTiming)

  } catch (error) {
    console.warn('Bundle analysis failed:', error)
    metrics.recommendations.push('Bundle analysis failed - check console for details')
  }

  return metrics
}

/**
 * Format bytes to human-readable format
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Generate optimization recommendations based on metrics
 */
function generateRecommendations(metrics: BundleMetrics, navigationTiming: PerformanceNavigationTiming): string[] {
  const recommendations: string[] = []

  // Bundle size recommendations
  if (metrics.totalSize > 500 * 1024) { // > 500KB
    recommendations.push('Bundle size is large (>500KB) - consider code splitting and tree shaking')
  }
  
  if (metrics.chunkCount > 10) {
    recommendations.push('High chunk count detected - consider consolidating small chunks')
  }

  if (metrics.largestChunk.size > 200 * 1024) { // > 200KB
    recommendations.push(`Largest chunk "${metrics.largestChunk.name}" is very large - consider splitting`)
  }

  // Performance timing recommendations
  if (navigationTiming) {
    const domContentLoaded = navigationTiming.domContentLoadedEventEnd - navigationTiming.domContentLoadedEventStart
    const loadComplete = navigationTiming.loadEventEnd - navigationTiming.loadEventStart
    
    if (domContentLoaded > 1000) {
      recommendations.push('DOM content loaded slowly - optimize JavaScript execution')
    }
    
    if (loadComplete > 2000) {
      recommendations.push('Page load complete slowly - optimize resource loading')
    }
  }

  // Chunk analysis recommendations
  const largeChunks = metrics.chunks.filter(chunk => chunk.size > 100 * 1024) // > 100KB
  if (largeChunks.length > 3) {
    recommendations.push('Multiple large chunks detected - implement aggressive code splitting')
  }

  // Add general recommendations if none specific
  if (recommendations.length === 0) {
    recommendations.push('Bundle appears well-optimized - continue monitoring performance')
  }

  return recommendations
}

/**
 * Get detailed performance metrics for a specific component or feature
 */
export function analyzeComponentPerformance(componentName: string): {
  renderTime: number
  memoryUsage?: number
  recommendations: string[]
} {
  const metrics = {
    renderTime: 0,
    memoryUsage: undefined as number | undefined,
    recommendations: [] as string[]
  }

  try {
    // Get component-specific performance data
    const componentEntries = performance.getEntriesByName(`${componentName}_render`)
    if (componentEntries.length > 0) {
      const lastEntry = componentEntries[componentEntries.length - 1] as PerformanceMeasure
      metrics.renderTime = lastEntry.duration
    }

    // Get memory usage if available
    if ('memory' in performance) {
      const memory = (performance as any).memory
      metrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024 // Convert to MB
    }

    // Generate component-specific recommendations
    if (metrics.renderTime > 16) { // > 16ms (60fps threshold)
      metrics.recommendations.push(`Component render time (${metrics.renderTime.toFixed(2)}ms) exceeds 60fps threshold`)
    }
    
    if (metrics.memoryUsage && metrics.memoryUsage > 50) { // > 50MB
      metrics.recommendations.push(`High memory usage (${metrics.memoryUsage.toFixed(2)}MB) - check for memory leaks`)
    }

  } catch (error) {
    console.warn('Component performance analysis failed:', error)
    metrics.recommendations.push('Performance analysis failed - check console for details')
  }

  return metrics
}

/**
 * Export bundle analysis to console in development
 */
export function logBundleAnalysis(): void {
  if (process.env.NODE_ENV === 'development') {
    const analysis = analyzeBundle()
    
    console.group('📊 Bundle Analysis')
    console.log('Total Size:', analysis.totalSizeFormatted)
    console.log('Chunk Count:', analysis.chunkCount)
    console.log('Largest Chunk:', analysis.largestChunk.name, analysis.largestChunk.sizeFormatted)
    
    if (analysis.chunks.length > 0) {
      console.group('Chunk Breakdown')
      analysis.chunks.forEach(chunk => {
        console.log(`${chunk.name}: ${chunk.sizeFormatted} (${chunk.percentage}%)`)
      })
      console.groupEnd()
    }
    
    if (analysis.recommendations.length > 0) {
      console.group('🚀 Optimization Recommendations')
      analysis.recommendations.forEach(rec => console.log('•', rec))
      console.groupEnd()
    }
    
    console.groupEnd()
  }
}

export default {
  analyzeBundle,
  analyzeComponentPerformance,
  logBundleAnalysis
}
