import { ReactNode } from 'react'

export type CardSize = 'sm' | 'md' | 'lg' | 'xl'
export type CardVariant = 'default' | 'elevated' | 'outlined' | 'filled'

export interface CardProps {
  children: ReactNode
  size?: CardSize
  variant?: CardVariant
  className?: string
  onClick?: () => void
  hoverable?: boolean
}

export interface CardHeaderProps {
  children: ReactNode
  className?: string
}

export interface CardContentProps {
  children: ReactNode
  className?: string
}

export interface CardFooterProps {
  children: ReactNode
  className?: string
}

export interface CardTitleProps {
  children: ReactNode
  className?: string
}

export interface CardSubtitleProps {
  children: ReactNode
  className?: string
}
