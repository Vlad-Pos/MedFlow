import React, { memo } from 'react'
import { motion } from 'framer-motion'
import { FadeInProps, FadeInDirection } from './FadeIn.types'
import { FADE_IN_DIRECTION_VARIANTS, FADE_IN_TRANSITION, FADE_IN_VIEWPORT } from './FadeIn.variants'

const FadeIn = memo<FadeInProps>(({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  className = '',
  once = true,
  amount = 0.3,
  custom
}) => {
  const variants = FADE_IN_DIRECTION_VARIANTS[direction]
  const viewport = { ...FADE_IN_VIEWPORT, once, amount }
  const transition = { ...FADE_IN_TRANSITION, duration, delay, custom }

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      transition={transition}
      className={className}
    >
      {children}
    </motion.div>
  )
})

FadeIn.displayName = 'FadeIn'

export default FadeIn
