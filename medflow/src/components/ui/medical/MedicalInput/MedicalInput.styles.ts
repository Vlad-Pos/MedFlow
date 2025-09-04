import { INPUT_SIZE_CLASSES, INPUT_WIDTH_CLASSES, INPUT_LABEL_CLASSES, INPUT_REQUIRED_INDICATOR } from '../../core/Input/Input.styles'

export const MEDICAL_INPUT_SIZE_CLASSES = INPUT_SIZE_CLASSES
export const MEDICAL_INPUT_WIDTH_CLASSES = INPUT_WIDTH_CLASSES
export const MEDICAL_INPUT_LABEL_CLASSES = INPUT_LABEL_CLASSES
export const MEDICAL_INPUT_REQUIRED_INDICATOR = INPUT_REQUIRED_INDICATOR

export const MEDICAL_INPUT_BASE_CLASSES = 'rounded-lg transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed'

export const MEDICAL_INPUT_VARIANT_CLASSES = {
  default: 'bg-white/10 backdrop-blur border border-white/20 focus:border-[var(--medflow-brand-1)] focus:ring-2 focus:ring-[var(--medflow-brand-1)]/20',
  outlined: 'bg-transparent border-2 border-[var(--medflow-brand-1)]/30 focus:border-[var(--medflow-brand-1)] focus:ring-2 focus:ring-[var(--medflow-brand-1)]/20',
  filled: 'bg-white/5 border border-white/10 focus:border-[var(--medflow-brand-1)] focus:ring-[var(--medflow-brand-1)]/20',
  medical: 'bg-white/10 backdrop-blur border border-white/20 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20'
} as const

export const MEDICAL_INPUT_STATE_CLASSES = {
  default: '',
  error: 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
  success: 'border-green-500 focus:border-green-500 focus:ring-green-500/20',
  warning: 'border-orange-500 focus:border-orange-500 focus:ring-orange-500/20'
} as const

export const MEDICAL_INPUT_ICON_CLASSES = 'w-5 h-5'
export const MEDICAL_INPUT_ICON_POSITION_CLASSES = 'absolute top-1/2 transform -translate-y-1/2 text-white/50'

export const MEDICAL_INPUT_HELPER_TEXT_CLASSES = 'text-sm'
export const MEDICAL_INPUT_ERROR_CLASSES = 'text-red-400 flex items-center space-x-1'
export const MEDICAL_INPUT_SUCCESS_CLASSES = 'text-green-400 flex items-center space-x-1'
export const MEDICAL_INPUT_WARNING_CLASSES = 'text-orange-400 flex items-center space-x-1'
export const MEDICAL_INPUT_HELPER_CLASSES = 'text-white/60'
export const MEDICAL_INPUT_STATUS_INDICATOR = 'w-1 h-1 rounded-full'
export const MEDICAL_INPUT_STATUS_INDICATOR_COLORS = {
  error: 'bg-red-400',
  success: 'bg-green-400',
  warning: 'bg-orange-400'
} as const

export const MEDICAL_INPUT_AI_SUGGESTION_CLASSES = 'text-xs text-[var(--medflow-brand-1)] bg-[var(--medflow-brand-1)]/10 p-2 rounded border border-[var(--medflow-brand-1)]/20'
export const MEDICAL_INPUT_MEDICAL_ICON_CLASSES = 'text-[var(--medflow-brand-1)]'
