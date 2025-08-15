export const SCALE_IN_VARIANTS = {
  hidden: {
    scale: 0.8,
    opacity: 0
  },
  visible: {
    scale: 1,
    opacity: 1
  }
} as const

export const SCALE_IN_SCALE_VARIANTS = {
  small: {
    hidden: { scale: 0.5, opacity: 0 },
    visible: { scale: 1, opacity: 1 }
  },
  medium: {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1 }
  },
  large: {
    hidden: { scale: 0.3, opacity: 0 },
    visible: { scale: 1, opacity: 1 }
  }
} as const

export const SCALE_IN_TRANSITION = {
  duration: 0.5,
  ease: [0.25, 0.46, 0.45, 0.94]
} as const

export const SCALE_IN_VIEWPORT = {
  once: true,
  amount: 0.3
} as const
