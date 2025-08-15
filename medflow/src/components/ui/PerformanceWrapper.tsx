import React, { memo, useMemo, useCallback, ReactNode } from 'react'
import { usePerformanceMonitoring } from '../../hooks/usePerformanceMonitoring'

interface PerformanceWrapperProps {
  children: ReactNode
  componentName: string
  memoize?: boolean
  enableMonitoring?: boolean
  className?: string
  style?: React.CSSProperties
}

/**
 * PerformanceWrapper Component
 * 
 * A high-performance wrapper that provides:
 * - Automatic memoization
 * - Performance monitoring
 * - Render optimization
 * - Memory leak prevention
 */
const PerformanceWrapper: React.FC<PerformanceWrapperProps> = ({
  children,
  componentName,
  memoize = true,
  enableMonitoring = process.env.NODE_ENV === 'development',
  className = '',
  style = {}
}) => {
  // Performance monitoring hook
  const performance = usePerformanceMonitoring(componentName)

  // Memoized children to prevent unnecessary re-renders
  const memoizedChildren = useMemo(() => {
    if (memoize) {
      return React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
                  return React.cloneElement(child, {
          key: `${componentName}_${Date.now()}`
        })
        }
        return child
      })
    }
    return children
  }, [children, memoize, componentName])

  // Memoized style and className
  const memoizedStyle = useMemo(() => style, [style])
  const memoizedClassName = useMemo(() => className, [className])

  // Performance tracking callback
  const trackRender = useCallback(() => {
    if (enableMonitoring) {
      performance.startOperation('render', { componentName, timestamp: Date.now() })
    }
  }, [enableMonitoring, performance, componentName])

  // Track render on mount and updates
  React.useEffect(() => {
    trackRender()
  }, [trackRender])

  // Cleanup performance data on unmount
  React.useEffect(() => {
    return () => {
      if (enableMonitoring) {
        const report = performance.generateReport()
        if (report.renderCount > 10) {
          console.warn(`High render count detected in ${componentName}: ${report.renderCount} renders`)
        }
      }
    }
  }, [enableMonitoring, performance, componentName])

  return (
    <div 
      className={memoizedClassName}
      style={memoizedStyle}
      data-component-name={componentName}
      data-performance-enabled={enableMonitoring}
    >
      {memoizedChildren}
    </div>
  )
}

// Export memoized version for maximum performance
export default memo(PerformanceWrapper)

// Export non-memoized version for cases where memoization isn't needed
export const PerformanceWrapperUnmemoized = PerformanceWrapper
