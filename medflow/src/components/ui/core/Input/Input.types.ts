import { forwardRef, InputHTMLAttributes, ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

export type InputSize = 'sm' | 'md' | 'lg'
export type InputVariant = 'default' | 'outlined' | 'filled'
export type InputState = 'default' | 'error' | 'success'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  success?: string
  helperText?: string
  leftIcon?: LucideIcon
  rightIcon?: LucideIcon
  size?: InputSize
  variant?: InputVariant
  fullWidth?: boolean
  required?: boolean
}

export interface InputStyleProps {
  size: InputSize
  variant: InputVariant
  state: InputState
  fullWidth: boolean
  hasLeftIcon: boolean
  hasRightIcon: boolean
  className: string
}

export interface InputHelperTextProps {
  error?: string
  success?: string
  helperText?: string
}
