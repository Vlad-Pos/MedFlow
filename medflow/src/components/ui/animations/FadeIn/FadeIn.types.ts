import { ReactNode } from 'react'

export type FadeInDirection = 'up' | 'down' | 'left' | 'right' | 'none'

export interface FadeInProps {
  children: ReactNode
  direction?: FadeInDirection
  delay?: number
  duration?: number
  className?: string
  once?: boolean
  amount?: number
  custom?: number
}
