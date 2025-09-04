export const SLIDE_IN_VARIANTS = {
  hidden: {
    y: 50,
    opacity: 0
  },
  visible: {
    y: 0,
    opacity: 1
  }
} as const

export const SLIDE_IN_DIRECTION_VARIANTS = {
  up: {
    hidden: { y: 50, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  },
  down: {
    hidden: { y: -50, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  },
  left: {
    hidden: { x: 50, opacity: 0 },
    visible: { x: 0, opacity: 1 }
  },
  right: {
    hidden: { x: -50, opacity: 0 },
    visible: { x: 0, opacity: 1 }
  }
} as const

export const SLIDE_IN_TRANSITION = {
  duration: 0.6,
  ease: [0.25, 0.46, 0.45, 0.94]
} as const

export const SLIDE_IN_VIEWPORT = {
  once: true,
  margin: '-50px'
} as const
