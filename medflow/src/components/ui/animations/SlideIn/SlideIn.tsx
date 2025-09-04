import React, { memo } from 'react'
import { motion } from 'framer-motion'
import { SlideInProps, SlideInDirection } from './SlideIn.types'
import { SLIDE_IN_DIRECTION_VARIANTS, SLIDE_IN_TRANSITION, SLIDE_IN_VIEWPORT } from './SlideIn.variants'

const SlideIn = memo<SlideInProps>(({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  distance = 50,
  className = '',
  ...props
}) => {
  const variants = SLIDE_IN_DIRECTION_VARIANTS[direction]
  const viewport = { ...SLIDE_IN_VIEWPORT }
  const transition = { ...SLIDE_IN_TRANSITION, duration, delay }

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      transition={transition}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
})

SlideIn.displayName = 'SlideIn'

export default SlideIn
