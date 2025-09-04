export const FADE_IN_VARIANTS = {
  hidden: {
    opacity: 0,
    y: 30
  },
  visible: {
    opacity: 1,
    y: 0
  }
} as const

export const FADE_IN_DIRECTION_VARIANTS = {
  up: {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  },
  down: {
    hidden: { opacity: 0, y: -30 },
    visible: { opacity: 1, y: 0 }
  },
  left: {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0 }
  },
  right: {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0 }
  },
  none: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  }
} as const

export const FADE_IN_TRANSITION = {
  duration: 0.6,
  ease: [0.25, 0.46, 0.45, 0.94]
} as const

export const FADE_IN_VIEWPORT = {
  once: true,
  amount: 0.3
} as const
