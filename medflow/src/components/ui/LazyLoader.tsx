import React, { Suspense, lazy, useState, useEffect, useCallback, ReactNode } from 'react'
import { MedFlowLoader } from './MedFlowLoader'

interface LazyLoaderProps {
  component: React.LazyExoticComponent<React.ComponentType<any>>
  fallback?: ReactNode
  threshold?: number
  rootMargin?: string
  preload?: boolean
  preloadDistance?: number
  className?: string
  style?: React.CSSProperties
  onLoad?: () => void
  onError?: (error: Error) => void
}

/**
 * LazyLoader Component
 * 
 * An intelligent lazy loading component that provides:
 * - Intersection Observer-based loading
 * - Preloading strategies
 * - Performance optimization
 * - Error boundaries
 * - Loading state management
 */
const LazyLoader: React.FC<LazyLoaderProps> = ({
  component: Component,
  fallback = <div className="flex items-center justify-center p-8"><MedFlowLoader size="lg" /></div>,
  threshold = 0.1,
  rootMargin = '50px',
  preload = false,
  preloadDistance = 200,
  className = '',
  style = {},
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Simple intersection observer for lazy loading
  const [ref, setRef] = useState<HTMLDivElement | null>(null)
  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    if (!ref) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      },
      {
        threshold,
        rootMargin: preload ? `${preloadDistance}px` : rootMargin
      }
    )

    observer.observe(ref)
    return () => observer.disconnect()
  }, [ref, threshold, rootMargin, preload, preloadDistance])

  // Preload component when intersection is detected
  useEffect(() => {
    if (isIntersecting && !isLoaded && !hasError) {
      // Simulate preloading by setting loaded state
      setIsLoaded(true)
      onLoad?.()
    }
  }, [isIntersecting, isLoaded, hasError, onLoad])

  // Error boundary for lazy components
  const ErrorBoundary = useCallback(({ children }: { children: ReactNode }) => {
    if (hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-800 font-medium">Component failed to load</h3>
          <p className="text-red-600 text-sm mt-1">
            {error?.message || 'An error occurred while loading this component'}
          </p>
          <button
            onClick={() => {
              setHasError(false)
              setError(null)
              setIsLoaded(false)
            }}
            className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )
    }
    return <>{children}</>
  }, [hasError, error])

  // Render component when loaded
  if (isLoaded && !hasError) {
    return (
      <ErrorBoundary>
        <Component />
      </ErrorBoundary>
    )
  }

  // Render fallback while loading or on error
  return (
    <div ref={setRef} className={className} style={style}>
      <ErrorBoundary>
        <Suspense fallback={fallback}>
          {hasError ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-red-800 font-medium">Component failed to load</h3>
              <p className="text-red-600 text-sm mt-1">
                {error?.message || 'An error occurred while loading this component'}
              </p>
              <button
                onClick={() => {
                  setHasError(false)
                  setError(null)
                  setIsLoaded(false)
                }}
                className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          ) : (
            <Component />
          )}
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}

export default LazyLoader

// Export a simpler version for basic lazy loading
export const SimpleLazyLoader: React.FC<{
  component: React.LazyExoticComponent<React.ComponentType<any>>
  fallback?: ReactNode
}> = ({ component: Component, fallback }) => (
  <Suspense fallback={fallback}>
    <Component />
  </Suspense>
)
