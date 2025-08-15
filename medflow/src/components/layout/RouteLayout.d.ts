import React from 'react'

export type BackgroundType = 'scroll' | 'website' | 'none'

export interface RouteLayoutProps {
  background: BackgroundType
  showNavbar?: boolean
  showPageTransition?: boolean
  containerClass?: string
  children: React.ReactNode
  className?: string
}

declare const RouteLayout: React.FC<RouteLayoutProps>
export default RouteLayout
