import { ReactNode } from 'react'

export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'
export type ContainerPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl'
export type ContainerMargin = 'none' | 'sm' | 'md' | 'lg' | 'xl'

export interface ContainerProps {
  children: ReactNode
  size?: ContainerSize
  padding?: ContainerPadding
  margin?: ContainerMargin
  className?: string
  center?: boolean
  flex?: boolean
}
