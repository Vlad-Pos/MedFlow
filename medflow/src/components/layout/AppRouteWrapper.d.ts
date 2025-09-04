import React from 'react'
import { BackgroundType, RouteLayoutProps } from './RouteLayout'

export interface AppRouteWrapperProps extends Omit<RouteLayoutProps, 'children'> {
  component: React.LazyExoticComponent<React.ComponentType<any>>
  fallback?: React.ReactNode
}

declare const AppRouteWrapper: React.FC<AppRouteWrapperProps>
export default AppRouteWrapper
