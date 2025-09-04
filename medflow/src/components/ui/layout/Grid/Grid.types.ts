import { ReactNode } from 'react'

export type GridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 12
export type GridGap = 'none' | 'sm' | 'md' | 'lg' | 'xl'
export type GridAlignment = 'start' | 'center' | 'end' | 'stretch'
export type GridJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'

export interface GridProps {
  children: ReactNode
  columns?: GridColumns
  gap?: GridGap
  responsive?: boolean
  alignment?: GridAlignment
  justify?: GridJustify
  className?: string
}

export interface GridItemProps {
  children: ReactNode
  span?: number
  className?: string
}
