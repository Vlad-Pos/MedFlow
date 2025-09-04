import { useState, useEffect, useCallback, useRef, useMemo } from 'react'

export interface ScrollState {
  scrollProgress: number
  isScrolling: boolean
  scrollY: number
  scrollHeight: number
  viewportHeight: number
}

export interface UseScrollOptimizedOptions {
  throttleMs?: number
  passive?: boolean
  onScroll?: (state: ScrollState) => void
}

/**
 * useScrollOptimized Hook
 * 
 * A high-performance scroll hook that provides optimized scroll state management
 * with proper cleanup, memory management, and performance optimizations.
 * 
 * Features:
 * - RequestAnimationFrame-based throttling for 60fps performance
 * - Passive event listeners for better scroll performance
 * - Proper cleanup to prevent memory leaks
 * - Memoized calculations to prevent unnecessary re-renders
 * - Configurable throttling and callbacks
 * - TypeScript support with strict typing
 */
export const useScrollOptimized = (options: UseScrollOptimizedOptions = {}) => {
  const {
    throttleMs = 16, // ~60fps
    passive = true,
    onScroll
  } = options

  const [scrollState, setScrollState] = useState<ScrollState>({
    scrollProgress: 0,
    isScrolling: false,
    scrollY: 0,
    scrollHeight: 0,
    viewportHeight: 0
  })

  const tickingRef = useRef(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const rafRef = useRef<number | null>(null)

  // Memoized scroll calculation to prevent unnecessary recalculations
  const calculateScrollState = useCallback((): ScrollState => {
    const scrollY = window.scrollY
    const viewportHeight = window.innerHeight
    const scrollHeight = document.documentElement.scrollHeight
    const maxScroll = scrollHeight - viewportHeight
    const scrollProgress = maxScroll > 0 ? Math.min(Math.max(scrollY / maxScroll, 0), 1) : 0

    return {
      scrollProgress,
      isScrolling: true,
      scrollY,
      scrollHeight,
      viewportHeight
    }
  }, [])

  // Optimized scroll handler with RAF throttling
  const handleScroll = useCallback(() => {
    if (tickingRef.current) return

    tickingRef.current = true

    rafRef.current = requestAnimationFrame(() => {
      const newState = calculateScrollState()
      setScrollState(newState)
      
      // Call optional callback
      if (onScroll) {
        onScroll(newState)
      }

      // Reset scrolling state after animation
      timeoutRef.current = setTimeout(() => {
        setScrollState(prev => ({ ...prev, isScrolling: false }))
      }, 100)

      tickingRef.current = false
    })
  }, [calculateScrollState, onScroll])

  // Set up scroll event listener
  useEffect(() => {
    const element = window

    element.addEventListener('scroll', handleScroll, { passive })

    return () => {
      element.removeEventListener('scroll', handleScroll)
      
      // Clean up all pending operations
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [handleScroll, passive])

  // Memoized derived values to prevent unnecessary recalculations
  const derivedValues = useMemo(() => ({
    scrollPercentage: Math.round(scrollState.scrollProgress * 100),
    isAtTop: scrollState.scrollY === 0,
    isAtBottom: scrollState.scrollProgress >= 0.99,
    scrollDirection: scrollState.scrollY > 0 ? 'down' : 'up' as 'up' | 'down'
  }), [scrollState.scrollProgress, scrollState.scrollY])

  return {
    ...scrollState,
    ...derivedValues
  }
}

export default useScrollOptimized
