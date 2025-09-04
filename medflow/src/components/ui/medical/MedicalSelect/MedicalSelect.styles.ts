import { SELECT_SIZE_CLASSES, SELECT_WIDTH_CLASSES, SELECT_LABEL_CLASSES, SELECT_REQUIRED_INDICATOR } from '../../core/Select/Select.styles'

export const MEDICAL_SELECT_SIZE_CLASSES = SELECT_SIZE_CLASSES
export const MEDICAL_SELECT_WIDTH_CLASSES = SELECT_WIDTH_CLASSES
export const MEDICAL_SELECT_LABEL_CLASSES = SELECT_LABEL_CLASSES
export const MEDICAL_SELECT_REQUIRED_INDICATOR = SELECT_REQUIRED_INDICATOR

export const MEDICAL_SELECT_BASE_CLASSES = 'rounded-lg text-white transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed appearance-none'

export const MEDICAL_SELECT_VARIANT_CLASSES = {
  default: 'bg-white/10 backdrop-blur border border-white/20 focus:border-[var(--medflow-brand-1)] focus:ring-2 focus:ring-[var(--medflow-brand-1)]/20',
  outlined: 'bg-transparent border-2 border-[var(--medflow-brand-1)]/30 focus:border-[var(--medflow-brand-1)] focus:ring-2 focus:ring-[var(--medflow-brand-1)]/20',
  filled: 'bg-white/5 border border-white/10 focus:border-[var(--medflow-brand-1)] focus:ring-[var(--medflow-brand-1)]/20',
  medical: 'bg-white/10 backdrop-blur border border-white/20 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20'
} as const

export const MEDICAL_SELECT_STATE_CLASSES = {
  default: '',
  error: 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
  success: 'border-green-500 focus:border-green-500 focus:ring-green-500/20',
  warning: 'border-orange-500 focus:border-orange-500 focus:ring-orange-500/20'
} as const

export const MEDICAL_SELECT_ICON_CLASSES = 'w-5 h-5'
export const MEDICAL_SELECT_ICON_POSITION_CLASSES = 'absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 pointer-events-none'

export const MEDICAL_SELECT_HELPER_TEXT_CLASSES = 'text-sm'
export const MEDICAL_SELECT_ERROR_CLASSES = 'text-red-400 flex items-center space-x-1'
export const MEDICAL_SELECT_SUCCESS_CLASSES = 'text-green-400 flex items-center space-x-1'
export const MEDICAL_SELECT_WARNING_CLASSES = 'text-orange-400 flex items-center space-x-1'
export const MEDICAL_SELECT_HELPER_CLASSES = 'text-white/60'
export const MEDICAL_SELECT_STATUS_INDICATOR = 'w-1 h-1 rounded-full'
export const MEDICAL_SELECT_STATUS_INDICATOR_COLORS = {
  error: 'bg-red-400',
  success: 'bg-green-400',
  warning: 'bg-orange-400'
} as const

export const MEDICAL_SELECT_OPTION_CLASSES = 'bg-white/10 text-white hover:bg-white/20 cursor-pointer'
export const MEDICAL_SELECT_PLACEHOLDER_CLASSES = 'text-white/50'
export const MEDICAL_SELECT_MEDICAL_ICON_CLASSES = 'text-[#8A7A9F]'
