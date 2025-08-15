export const INPUT_SIZE_CLASSES = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3 text-base',
  lg: 'px-5 py-4 text-lg'
} as const

export const INPUT_VARIANT_CLASSES = {
  default: 'bg-white/10 backdrop-blur border border-white/20 focus:border-[var(--medflow-brand-1)] focus:ring-2 focus:ring-[var(--medflow-brand-1)]/20',
  outlined: 'bg-transparent border-2 border-[var(--medflow-brand-1)]/30 focus:border-[var(--medflow-brand-1)] focus:ring-2 focus:ring-[var(--medflow-brand-1)]/20',
  filled: 'bg-white/5 border border-white/10 focus:border-[var(--medflow-brand-1)] focus:ring-[var(--medflow-brand-1)]/20'
} as const

export const INPUT_STATE_CLASSES = {
  default: '',
  error: 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
  success: 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
} as const

export const INPUT_BASE_CLASSES = 'rounded-lg text-white placeholder-white/50 transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed'

export const INPUT_WIDTH_CLASSES = {
  default: '',
  full: 'w-full'
} as const

export const INPUT_LABEL_CLASSES = 'block text-white font-medium text-sm'
export const INPUT_REQUIRED_INDICATOR = 'text-red-400 ml-1'
export const INPUT_ICON_CLASSES = 'w-5 h-5'
export const INPUT_ICON_POSITION_CLASSES = 'absolute top-1/2 transform -translate-y-1/2 text-white/50'

export const INPUT_HELPER_TEXT_CLASSES = 'text-sm'
export const INPUT_ERROR_CLASSES = 'text-red-400 flex items-center space-x-1'
export const INPUT_SUCCESS_CLASSES = 'text-green-400 flex items-center space-x-1'
export const INPUT_HELPER_CLASSES = 'text-white/60'
export const INPUT_STATUS_INDICATOR = 'w-1 h-1 rounded-full'
export const INPUT_STATUS_INDICATOR_COLORS = {
  error: 'bg-red-400',
  success: 'bg-green-400'
} as const
