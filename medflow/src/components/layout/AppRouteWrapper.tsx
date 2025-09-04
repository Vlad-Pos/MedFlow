import React, { Suspense, useMemo } from 'react'
import { RouteLoadingSpinner } from '../LoadingSpinner'
import RouteLayout, { BackgroundType, RouteLayoutProps } from './RouteLayout'

export interface AppRouteWrapperProps extends Omit<RouteLayoutProps, 'children'> {
  component: React.LazyExoticComponent<React.ComponentType<any>>
  fallback?: React.ReactNode
}

/**
 * Optimized AppRouteWrapper Component
 * 
 * A specialized wrapper that combines lazy loading, suspense, and RouteLayout
 * to provide a clean, consistent interface for route definitions.
 * 
 * Features:
 * - Automatic lazy loading with suspense
 * - Consistent fallback handling
 * - Clean route definition syntax
 * - Performance optimized with proper memoization
 * - Type-safe props inheritance
 */
const AppRouteWrapper: React.FC<AppRouteWrapperProps> = React.memo(({
  component: Component,
  fallback = <RouteLoadingSpinner />,
  ...routeLayoutProps
}) => {
  // Memoize the component to prevent unnecessary re-renders
  const memoizedComponent = useMemo(() => (
    <Suspense fallback={fallback}>
      <Component />
    </Suspense>
  ), [Component, fallback])

  return (
    <RouteLayout {...routeLayoutProps}>
      {memoizedComponent}
    </RouteLayout>
  )
})

AppRouteWrapper.displayName = 'AppRouteWrapper'

export default AppRouteWrapper
