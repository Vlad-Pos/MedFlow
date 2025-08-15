/**
 * Consolidated Responsive Hook for MedFlow
 * 
 * This hook consolidates all responsive functionality into a single optimized hook,
 * eliminating duplicate event listeners and implementing proper debouncing and cleanup.
 * 
 * Features:
 * - Responsive breakpoints and device detection
 * - Viewport dimensions and orientation
 * - Touch device detection
 * - Safe area insets
 * - Scroll position tracking
 * - Optimized event handling with debouncing
 * - Proper cleanup to prevent memory leaks
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const {
 *     isMobile,
 *     isTablet,
 *     isDesktop,
 *     breakpoint,
 *     width,
 *     height,
 *     isTouchDevice,
 *     orientation,
 *     safeArea,
 *     scrollPosition
 *   } = useResponsiveConsolidated()
 *   
 *   // Use responsive values in your component
 * }
 * ```
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { responsive, performance } from '../utils/responsive'

// Consolidated responsive state interface
export interface ResponsiveState {
  // Device detection
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isTouchDevice: boolean
  
  // Breakpoint and dimensions
  breakpoint: string
  width: number
  height: number
  
  // Orientation
  orientation: 'portrait' | 'landscape'
  
  // Safe area insets (mobile)
  safeArea: {
    top: number
    bottom: number
    left: number
    right: number
  }
  
  // Scroll position
  scrollPosition: {
    x: number
    y: number
  }
}

// Event handler types
type EventHandler = () => void

export function useResponsiveConsolidated(): ResponsiveState {
  // Consolidated state
  const [state, setState] = useState<ResponsiveState>(() => ({
    isMobile: responsive.isMobile(),
    isTablet: responsive.isTablet(),
    isDesktop: responsive.isDesktop(),
    isTouchDevice: responsive.isTouchDevice(),
    breakpoint: responsive.getBreakpoint(),
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    orientation: typeof window !== 'undefined' 
      ? (window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
      : 'portrait',
    safeArea: { top: 0, bottom: 0, left: 0, right: 0 },
    scrollPosition: { x: 0, y: 0 }
  }))

  // Refs for cleanup and optimization
  const resizeTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const scrollTimeoutRef = useRef<number | undefined>(undefined)
  const isScrollingRef = useRef(false)

  // Update safe area insets
  const updateSafeArea = useCallback(() => {
    if (typeof window === 'undefined') return
    
    const style = getComputedStyle(document.documentElement)
    const safeArea = {
      top: parseInt(style.getPropertyValue('--sat') || '0'),
      bottom: parseInt(style.getPropertyValue('--sab') || '0'),
      left: parseInt(style.getPropertyValue('--sal') || '0'),
      right: parseInt(style.getPropertyValue('--sar') || '0')
    }
    
    setState(prev => ({ ...prev, safeArea }))
  }, [])

  // Update scroll position with throttling
  const updateScrollPosition = useCallback(() => {
    if (typeof window === 'undefined' || isScrollingRef.current) return
    
    isScrollingRef.current = true
    scrollTimeoutRef.current = requestAnimationFrame(() => {
      setState(prev => ({
        ...prev,
        scrollPosition: {
          x: window.pageXOffset,
          y: window.pageYOffset
        }
      }))
      isScrollingRef.current = false
    })
  }, [])

  // Consolidated resize handler with debouncing
  const handleResize = useCallback(() => {
    // Clear existing timeout
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current)
    }

    // Set new timeout for debounced update
    resizeTimeoutRef.current = setTimeout(() => {
      if (typeof window === 'undefined') return

      setState(prev => ({
        isMobile: responsive.isMobile(),
        isTablet: responsive.isTablet(),
        isDesktop: responsive.isDesktop(),
        isTouchDevice: responsive.isTouchDevice(),
        breakpoint: responsive.getBreakpoint(),
        width: window.innerWidth,
        height: window.innerHeight,
        orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
        safeArea: prev.safeArea, // Use previous state to avoid dependency loop
        scrollPosition: prev.scrollPosition // Use previous state to avoid dependency loop
      }))
      
      // Update safe area after resize
      updateSafeArea()
    }, performance.debounceDelay)
  }, [updateSafeArea]) // Remove state dependencies to prevent infinite loop

  // Touch device detection handler
  const handleTouchDeviceCheck = useCallback(() => {
    const isTouchDevice = responsive.isTouchDevice()
    setState(prev => ({ ...prev, isTouchDevice }))
  }, [])

  // Setup event listeners
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Add event listeners
    window.addEventListener('resize', handleResize, { passive: true })
    window.addEventListener('orientationchange', handleResize, { passive: true })
    window.addEventListener('focus', handleTouchDeviceCheck)
    window.addEventListener('scroll', updateScrollPosition, { passive: true })

    // Initial updates
    updateSafeArea()
    handleTouchDeviceCheck()

    // Cleanup function
    return () => {
      // Remove event listeners
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
      window.removeEventListener('focus', handleTouchDeviceCheck)
      window.removeEventListener('scroll', updateScrollPosition)

      // Clear timeouts and animation frames
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current)
      }
      if (scrollTimeoutRef.current) {
        cancelAnimationFrame(scrollTimeoutRef.current)
      }
    }
  }, [handleResize, handleTouchDeviceCheck, updateScrollPosition, updateSafeArea])

  // Update safe area when orientation changes
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleOrientationChange = () => {
      // Small delay to ensure orientation change is complete
      setTimeout(updateSafeArea, 100)
    }

    window.addEventListener('orientationchange', handleOrientationChange)
    
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [updateSafeArea])

  return state
}

// Convenience hooks for specific use cases
export function useBreakpoint(): string {
  const { breakpoint } = useResponsiveConsolidated()
  return breakpoint
}

export function useTouchDevice(): boolean {
  const { isTouchDevice } = useResponsiveConsolidated()
  return isTouchDevice
}

export function useViewport() {
  const { width, height } = useResponsiveConsolidated()
  return { width, height }
}

export function useSafeArea() {
  const { safeArea } = useResponsiveConsolidated()
  return safeArea
}

export function useScrollPosition() {
  const { scrollPosition } = useResponsiveConsolidated()
  return scrollPosition
}

export function useOrientation(): 'portrait' | 'landscape' {
  const { orientation } = useResponsiveConsolidated()
  return orientation
}

// Legacy hook for backward compatibility
export function useResponsive() {
  const { isMobile, isTablet, isDesktop, isTouchDevice, breakpoint, width, height } = useResponsiveConsolidated()
  return { isMobile, isTablet, isDesktop, isTouchDevice, breakpoint, width, height }
}
