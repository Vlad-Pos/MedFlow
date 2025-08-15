import { forwardRef, SelectHTMLAttributes, ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

export type SelectSize = 'sm' | 'md' | 'lg'
export type SelectVariant = 'default' | 'outlined' | 'filled'
export type SelectState = 'default' | 'error' | 'success'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string
  error?: string
  success?: string
  helperText?: string
  options: SelectOption[]
  placeholder?: string
  size?: SelectSize
  variant?: SelectVariant
  fullWidth?: boolean
  required?: boolean
  icon?: LucideIcon
}

export interface SelectStyleProps {
  size: SelectSize
  variant: SelectVariant
  state: SelectState
  fullWidth: boolean
  hasIcon: boolean
  className: string
}

export interface SelectHelperTextProps {
  error?: string
  success?: string
  helperText?: string
}
