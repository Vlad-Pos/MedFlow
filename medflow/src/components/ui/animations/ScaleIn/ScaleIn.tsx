import React, { memo } from 'react'
import { motion } from 'framer-motion'
import { ScaleInProps, ScaleInScale } from './ScaleIn.types'
import { SCALE_IN_SCALE_VARIANTS, SCALE_IN_TRANSITION, SCALE_IN_VIEWPORT } from './ScaleIn.variants'

const ScaleIn = memo<ScaleInProps>(({
  children,
  scale = 'medium',
  delay = 0,
  duration = 0.5,
  className = '',
  once = true,
  amount = 0.3,
  custom
}) => {
  const variants = SCALE_IN_SCALE_VARIANTS[scale]
  const viewport = { ...SCALE_IN_VIEWPORT, once, amount }
  const transition = { ...SCALE_IN_TRANSITION, duration, delay, custom }

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

ScaleIn.displayName = 'ScaleIn'

export default ScaleIn
