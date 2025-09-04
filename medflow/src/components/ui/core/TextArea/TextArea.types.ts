import { forwardRef, TextareaHTMLAttributes, ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

export type TextAreaSize = 'sm' | 'md' | 'lg'
export type TextAreaVariant = 'default' | 'outlined' | 'filled'
export type TextAreaState = 'default' | 'error' | 'success'

export interface TextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: string
  error?: string
  success?: string
  helperText?: string
  leftIcon?: LucideIcon
  rightIcon?: LucideIcon
  size?: TextAreaSize
  variant?: TextAreaVariant
  fullWidth?: boolean
  required?: boolean
  maxLength?: number
  showCharCount?: boolean
  aiSuggestion?: string
}

export interface TextAreaStyleProps {
  size: TextAreaSize
  variant: TextAreaVariant
  state: TextAreaState
  fullWidth: boolean
  hasLeftIcon: boolean
  hasRightIcon: boolean
  className: string
}

export interface TextAreaHelperTextProps {
  error?: string
  success?: string
  helperText?: string
  maxLength?: number
  currentLength?: number
  aiSuggestion?: string
}
