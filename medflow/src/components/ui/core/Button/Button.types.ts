import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'
export type ButtonIconPosition = 'left' | 'right'
export type ButtonType = 'button' | 'submit' | 'reset'

export interface ButtonProps {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  icon?: LucideIcon
  iconPosition?: ButtonIconPosition
  onClick?: () => void
  type?: ButtonType
  className?: string
  fullWidth?: boolean
  href?: string
  target?: string
}

export interface ButtonStyleProps {
  variant: ButtonVariant
  size: ButtonSize
  fullWidth: boolean
  disabled: boolean
  loading: boolean
  className: string
}
