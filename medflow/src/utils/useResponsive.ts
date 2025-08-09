import { useState, useEffect } from 'react'
import { responsive } from './responsive'

interface ResponsiveState {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isTouchDevice: boolean
  breakpoint: string
  width: number
  height: number
}

export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>({
    isMobile: responsive.isMobile(),
    isTablet: responsive.isTablet(),
    isDesktop: responsive.isDesktop(),
    isTouchDevice: responsive.isTouchDevice(),
    breakpoint: responsive.getBreakpoint(),
    width: window.innerWidth,
    height: window.innerHeight
  })

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setState({
          isMobile: responsive.isMobile(),
          isTablet: responsive.isTablet(),
          isDesktop: responsive.isDesktop(),
          isTouchDevice: responsive.isTouchDevice(),
          breakpoint: responsive.getBreakpoint(),
          width: window.innerWidth,
          height: window.innerHeight
        })
      }, 150) // Debounce resize events
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
      clearTimeout(timeoutId)
    }
  }, [])

  return state
}

// Hook for responsive breakpoints
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState(responsive.getBreakpoint())

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setBreakpoint(responsive.getBreakpoint())
      }, 150)
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
      clearTimeout(timeoutId)
    }
  }, [])

  return breakpoint
}

// Hook for touch device detection
export function useTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = useState(responsive.isTouchDevice())

  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice(responsive.isTouchDevice())
    }

    // Check on mount and when window gains focus
    checkTouchDevice()
    window.addEventListener('focus', checkTouchDevice)

    return () => {
      window.removeEventListener('focus', checkTouchDevice)
    }
  }, [])

  return isTouchDevice
}

// Hook for viewport dimensions
export function useViewport() {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        })
      }, 100)
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
      clearTimeout(timeoutId)
    }
  }, [])

  return dimensions
}

// Hook for safe area insets (mobile)
export function useSafeArea() {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  })

  useEffect(() => {
    const updateSafeArea = () => {
      const style = getComputedStyle(document.documentElement)
      setSafeArea({
        top: parseInt(style.getPropertyValue('--sat') || '0'),
        bottom: parseInt(style.getPropertyValue('--sab') || '0'),
        left: parseInt(style.getPropertyValue('--sal') || '0'),
        right: parseInt(style.getPropertyValue('--sar') || '0')
      })
    }

    updateSafeArea()
    window.addEventListener('resize', updateSafeArea)
    window.addEventListener('orientationchange', updateSafeArea)

    return () => {
      window.removeEventListener('resize', updateSafeArea)
      window.removeEventListener('orientationchange', updateSafeArea)
    }
  }, [])

  return safeArea
}

// Hook for scroll position
export function useScrollPosition() {
  const [scrollPosition, setScrollPosition] = useState({
    x: 0,
    y: 0
  })

  useEffect(() => {
    let ticking = false

    const updateScrollPosition = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrollPosition({
            x: window.pageXOffset,
            y: window.pageYOffset
          })
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', updateScrollPosition, { passive: true })

    return () => {
      window.removeEventListener('scroll', updateScrollPosition)
    }
  }, [])

  return scrollPosition
}

// Hook for device orientation
export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
  )

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(
        window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      )
    }

    window.addEventListener('resize', handleOrientationChange)
    window.addEventListener('orientationchange', handleOrientationChange)

    return () => {
      window.removeEventListener('resize', handleOrientationChange)
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [])

  return orientation
}

