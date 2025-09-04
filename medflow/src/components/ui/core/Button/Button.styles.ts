export const BUTTON_BASE_CLASSES = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

export const BUTTON_SIZE_CLASSES = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-base',
  lg: 'px-6 py-3 text-lg',
  xl: 'px-8 py-4 text-xl'
} as const

export const BUTTON_VARIANT_CLASSES = {
  primary: 'bg-[var(--medflow-brand-7)] text-white hover:bg-[var(--medflow-brand-6)] focus:ring-[var(--medflow-brand-1)]/50 shadow-lg hover:shadow-xl hover:shadow-[var(--medflow-brand-1)]/25',
  secondary: 'bg-[var(--medflow-brand-2)] text-white hover:bg-[var(--medflow-brand-3)] focus:ring-[var(--medflow-brand-1)]/50',
  outline: 'border-2 border-[var(--medflow-brand-1)] text-[var(--medflow-brand-1)] hover:bg-[var(--medflow-brand-1)] hover:text-white focus:ring-[var(--medflow-brand-1)]/50',
  ghost: 'text-[var(--medflow-brand-1)] hover:bg-[var(--medflow-brand-1)]/10 focus:ring-[var(--medflow-brand-1)]/50',
  danger: 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 focus:ring-red-500/50'
} as const

export const BUTTON_WIDTH_CLASSES = {
  default: '',
  full: 'w-full'
} as const

export const BUTTON_ICON_CLASSES = 'w-4 h-4'
export const BUTTON_ICON_SPACING = {
  left: 'mr-2',
  right: 'ml-2'
} as const

export const BUTTON_LOADING_CLASSES = 'w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2'
