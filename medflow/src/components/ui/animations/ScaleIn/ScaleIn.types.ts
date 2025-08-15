import { ReactNode } from 'react'

export type ScaleInScale = 'small' | 'medium' | 'large'

export interface ScaleInProps {
  children: ReactNode
  scale?: ScaleInScale
  delay?: number
  duration?: number
  className?: string
  once?: boolean
  amount?: number
  custom?: number
}
