import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../Navbar'
import { RouteLoadingSpinner } from '../LoadingSpinner'
import PageTransition from '../PageTransition'
import { SkipToMainContent } from '../Accessibility'
import ScrollGradientBackground from '../ScrollGradientBackground'
import WebsiteGradientBackground from '../WebsiteGradientBackground'

export type BackgroundType = 'scroll' | 'website' | 'none'

export interface RouteLayoutProps {
  background: BackgroundType
  showNavbar?: boolean
  showPageTransition?: boolean
  containerClass?: string
  children: React.ReactNode
  className?: string
}

/**
 * Optimized RouteLayout Component
 * 
 * A unified layout wrapper that eliminates route duplication by providing
 * consistent structure for all routes with configurable options.
 * 
 * Features:
 * - Configurable background types (scroll, website, none)
 * - Optional navbar and page transitions
 * - Consistent accessibility features
 * - Performance optimized with proper memoization
 * - Clean, maintainable TypeScript interface
 */
const RouteLayout: React.FC<RouteLayoutProps> = React.memo(({
  background,
  showNavbar = false,
  showPageTransition = false,
  containerClass = 'min-h-screen text-white',
  children,
  className = ''
}) => {
  // Memoize the main content to prevent unnecessary re-renders
  const mainContent = useMemo(() => (
    <div className={`${containerClass} ${className}`}>
      <SkipToMainContent />
      {showNavbar && <Navbar />}
      <main id="main-content" className={showNavbar ? 'container-responsive py-6' : 'w-full'}>
        {showPageTransition ? (
          <PageTransition>
            {children}
          </PageTransition>
        ) : (
          children
        )}
      </main>
    </div>
  ), [containerClass, className, showNavbar, showPageTransition, children])

  // Memoize the background wrapper selection to prevent unnecessary re-renders
  const layoutContent = useMemo(() => {
    if (background === 'website') {
      return (
        <WebsiteGradientBackground>
          {mainContent}
        </WebsiteGradientBackground>
      )
    }

    if (background === 'scroll') {
      return (
        <ScrollGradientBackground>
          {mainContent}
        </ScrollGradientBackground>
      )
    }

    // No background wrapper
    return mainContent
  }, [background, mainContent])

  return layoutContent
})

RouteLayout.displayName = 'RouteLayout'

export default RouteLayout
