import { useState, useEffect, useCallback } from 'react'

interface AnimationPerformanceConfig {
  enableAnimations: boolean
  isReducedMotion: boolean
  animationDuration: number
  staggerDelay: number
  viewportMargin: string
}

interface UseAnimationPerformanceReturn {
  config: AnimationPerformanceConfig
  shouldAnimate: (componentName?: string) => boolean
  getOptimizedVariants: <T>(variants: T, fallback?: T) => T
  getOptimizedTransition: (baseTransition: any) => any
}

/**
 * Enterprise-grade animation performance hook
 * 
 * Features:
 * - Automatic reduced motion detection
 * - Performance-based animation configuration
 * - Memory leak prevention
 * - Battery life optimization
 * - Accessibility compliance
 */
export const useAnimationPerformance = (): UseAnimationPerformanceReturn => {
  const [config, setConfig] = useState<AnimationPerformanceConfig>({
    enableAnimations: true,
    isReducedMotion: false,
    animationDuration: 0.3,
    staggerDelay: 0.1,
    viewportMargin: '50px'
  })

  // Detect reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    
    const updateReducedMotion = (e: MediaQueryListEvent | MediaQueryList) => {
      const isReduced = e.matches
      setConfig(prev => ({
        ...prev,
        isReducedMotion: isReduced,
        enableAnimations: !isReduced,
        animationDuration: isReduced ? 0 : 0.3,
        staggerDelay: isReduced ? 0 : 0.1
      }))
    }

    // Initial check
    updateReducedMotion(mediaQuery)

    // Listen for changes
    mediaQuery.addEventListener('change', updateReducedMotion)
    
    return () => mediaQuery.removeEventListener('change', updateReducedMotion)
  }, [])

  // Detect performance capabilities
  useEffect(() => {
    const checkPerformance = () => {
      // Check if device is low-end
      const isLowEnd = navigator.hardwareConcurrency < 4 || 
                      (navigator as any).deviceMemory < 4 ||
                      (navigator as any).connection?.effectiveType === 'slow-2g' ||
                      (navigator as any).connection?.effectiveType === '2g'

      // Check battery status if available
      const checkBattery = async () => {
        try {
          // @ts-ignore - Battery API is experimental
          const battery = await navigator.getBattery?.()
          if (battery && battery.level < 0.2) {
            setConfig(prev => ({
              ...prev,
              enableAnimations: false,
              animationDuration: 0,
              staggerDelay: 0
            }))
            return
          }
        } catch {
          // Battery API not available, continue with other checks
        }

        if (isLowEnd) {
          setConfig(prev => ({
            ...prev,
            animationDuration: 0.15,
            staggerDelay: 0.05,
            viewportMargin: '100px'
          }))
        }
      }

      checkBattery()
    }

    checkPerformance()
    
    // Re-check on connection change
    if ((navigator as any).connection) {
      (navigator as any).connection.addEventListener('change', checkPerformance)
      return () => (navigator as any).connection?.removeEventListener('change', checkPerformance)
    }
  }, [])

  // Determine if animations should run for specific components
  const shouldAnimate = useCallback((componentName?: string): boolean => {
    if (!config.enableAnimations) return false
    if (config.isReducedMotion) return false
    
    // Performance-critical components can be disabled in low-end scenarios
    if (componentName === 'calendar' && config.animationDuration < 0.2) return false
    if (componentName === 'list' && config.staggerDelay < 0.05) return false
    
    return true
  }, [config])

  // Get optimized animation variants
  const getOptimizedVariants = useCallback(<T>(variants: T, fallback?: T): T => {
    if (!shouldAnimate()) {
      return fallback || variants
    }
    
    // Optimize variants based on performance config
    if (typeof variants === 'object' && variants !== null) {
      const optimized = { ...variants }
      
      // Reduce animation complexity for low-end devices
      if (config.animationDuration < 0.2) {
        Object.keys(optimized).forEach(key => {
          const variant = (optimized as any)[key]
          if (variant && typeof variant === 'object' && variant.transition) {
            (optimized as any)[key] = {
              ...variant,
              transition: {
                ...variant.transition,
                duration: Math.min(variant.transition.duration || 0.3, 0.15)
              }
            }
          }
        })
      }
      
      return optimized
    }
    
    return variants
  }, [shouldAnimate, config])

  // Get optimized transition settings
  const getOptimizedTransition = useCallback((baseTransition: any): any => {
    if (!shouldAnimate()) {
      return { duration: 0 }
    }
    
    return {
      ...baseTransition,
      duration: config.animationDuration,
      delay: baseTransition.delay || 0
    }
  }, [shouldAnimate, config])

  return {
    config,
    shouldAnimate,
    getOptimizedVariants,
    getOptimizedTransition
  }
}

export default useAnimationPerformance
