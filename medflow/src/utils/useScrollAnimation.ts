import { useInView } from 'framer-motion'
import { useRef } from 'react'

export function useScrollAnimation(threshold = 0.1) {
  const ref = useRef(null)
  const isInView = useInView(ref, { 
    once: true, 
    amount: threshold 
  })

  return { ref, isInView }
}

// Hook for staggered animations
export function useStaggerAnimation(delay = 0.1) {
  const ref = useRef(null)
  const isInView = useInView(ref, { 
    once: true, 
    amount: 0.1 
  })

  return { 
    ref, 
    isInView,
    staggerDelay: delay
  }
}

// Hook for parallax effect
export function useParallaxAnimation(speed = 0.5) {
  const ref = useRef(null)
  const isInView = useInView(ref, { 
    once: false, 
    amount: 0 
  })

  return { 
    ref, 
    isInView,
    parallaxSpeed: speed
  }
}

// Hook for infinite scroll animation
export function useInfiniteScrollAnimation() {
  const ref = useRef(null)
  const isInView = useInView(ref, { 
    once: false, 
    amount: 0.5 
  })

  return { ref, isInView }
}
