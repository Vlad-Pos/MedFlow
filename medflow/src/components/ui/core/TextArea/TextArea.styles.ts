export const TEXTAREA_BASE_CLASSES = 'rounded-lg text-white placeholder-white/50 transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed resize-none'

export const TEXTAREA_SIZE_CLASSES = {
  sm: 'px-3 py-2 text-sm min-h-[80px]',
  md: 'px-4 py-3 text-base min-h-[100px]',
  lg: 'px-5 py-4 text-lg min-h-[120px]'
} as const

export const TEXTAREA_VARIANT_CLASSES = {
  default: 'bg-white/10 backdrop-blur border border-white/20 focus:border-[var(--medflow-brand-1)] focus:ring-2 focus:ring-[var(--medflow-brand-1)]/20',
  outlined: 'bg-transparent border-2 border-[var(--medflow-brand-1)]/30 focus:border-[var(--medflow-brand-1)] focus:ring-2 focus:ring-[var(--medflow-brand-1)]/20',
  filled: 'bg-white/5 border border-white/10 focus:border-[var(--medflow-brand-1)] focus:ring-[var(--medflow-brand-1)]/20'
} as const

export const TEXTAREA_STATE_CLASSES = {
  default: '',
  error: 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
  success: 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
} as const

export const TEXTAREA_WIDTH_CLASSES = {
  default: '',
  full: 'w-full'
} as const

export const TEXTAREA_LABEL_CLASSES = 'block text-white font-medium text-sm'
export const TEXTAREA_REQUIRED_INDICATOR = 'text-red-400 ml-1'
export const TEXTAREA_ICON_CLASSES = 'w-5 h-5'
export const TEXTAREA_ICON_POSITION_CLASSES = 'absolute top-1/2 transform -translate-y-1/2 text-white/50'

export const TEXTAREA_HELPER_TEXT_CLASSES = 'text-sm'
export const TEXTAREA_ERROR_CLASSES = 'text-red-400 flex items-center space-x-1'
export const TEXTAREA_SUCCESS_CLASSES = 'text-green-400 flex items-center space-x-1'
export const TEXTAREA_HELPER_CLASSES = 'text-white/60'
export const TEXTAREA_STATUS_INDICATOR = 'w-1 h-1 rounded-full'
export const TEXTAREA_STATUS_INDICATOR_COLORS = {
  error: 'bg-red-400',
  success: 'bg-green-400'
} as const

export const TEXTAREA_CHAR_COUNT_CLASSES = 'text-xs text-white/50 text-right'
export const TEXTAREA_AI_SUGGESTION_CLASSES = 'text-xs text-[var(--medflow-brand-1)] bg-[var(--medflow-brand-1)]/10 p-2 rounded border border-[var(--medflow-brand-1)]/20'
