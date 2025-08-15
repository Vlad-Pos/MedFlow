import { BUTTON_BASE_CLASSES, BUTTON_SIZE_CLASSES, BUTTON_WIDTH_CLASSES } from '../../core/Button/Button.styles'

export const MEDICAL_BUTTON_BASE_CLASSES = BUTTON_BASE_CLASSES

export const MEDICAL_BUTTON_SIZE_CLASSES = BUTTON_SIZE_CLASSES

export const MEDICAL_BUTTON_WIDTH_CLASSES = BUTTON_WIDTH_CLASSES

export const MEDICAL_BUTTON_VARIANT_CLASSES = {
  primary: 'bg-[var(--medflow-brand-7)] text-white hover:bg-[var(--medflow-brand-6)] focus:ring-[var(--medflow-brand-1)]/50 shadow-lg hover:shadow-xl hover:shadow-[var(--medflow-brand-1)]/25',
  secondary: 'bg-[var(--medflow-brand-2)] text-white hover:bg-[var(--medflow-brand-3)] focus:ring-[var(--medflow-brand-1)]/50',
  outline: 'border-2 border-[var(--medflow-brand-1)] text-[var(--medflow-brand-1)] hover:bg-[var(--medflow-brand-1)] hover:text-white focus:ring-[var(--medflow-brand-1)]/50',
  ghost: 'text-[var(--medflow-brand-1)] hover:bg-[var(--medflow-brand-1)]/10 focus:ring-[var(--medflow-brand-1)]/50',
  danger: 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 focus:ring-red-500/50',
  medical: 'bg-gradient-to-r from-[#10B981] to-[#059669] text-white hover:from-[#059669] hover:to-[#047857] focus:ring-[#10B981]/50 shadow-lg hover:shadow-xl hover:shadow-[#10B981]/25',
  emergency: 'bg-gradient-to-r from-[#EF4444] to-[#DC2626] text-white hover:from-[#DC2626] hover:to-[#B91C1C] focus:ring-[#EF4444]/50 shadow-lg hover:shadow-xl hover:shadow-[#EF4444]/25'
} as const

export const MEDICAL_BUTTON_ICON_CLASSES = 'w-4 h-4'
export const MEDICAL_BUTTON_ICON_SPACING = {
  left: 'mr-2',
  right: 'ml-2'
} as const

export const MEDICAL_BUTTON_LOADING_CLASSES = 'w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2'

export const MEDICAL_BUTTON_MEDICAL_ICON_CLASSES = 'w-5 h-5 text-white/90'
