import { ReactNode } from 'react'
import { HTMLMotionProps } from 'framer-motion'

export type SlideInDirection = 'up' | 'down' | 'left' | 'right'

export interface SlideInProps extends Omit<HTMLMotionProps<'div'>, 'initial' | 'whileInView' | 'viewport' | 'transition'> {
  children: ReactNode
  direction?: SlideInDirection
  delay?: number
  duration?: number
  distance?: number
  className?: string
}
