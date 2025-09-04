export const CARD_BASE_CLASSES = 'bg-white/10 backdrop-blur border border-white/20 text-white rounded-xl shadow-sm transition-all duration-200 hover:shadow-md'

export const CARD_SIZE_CLASSES = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8'
} as const

export const CARD_VARIANT_CLASSES = {
  default: 'bg-white/10 backdrop-blur border border-white/20',
  elevated: 'bg-white/20 backdrop-blur border border-white/30 shadow-lg',
  outlined: 'bg-transparent border-2 border-white/30',
  filled: 'bg-white/5 border border-white/10'
} as const

export const CARD_HOVER_CLASSES = {
  default: 'hover:bg-white/15 hover:border-white/30',
  elevated: 'hover:bg-white/25 hover:border-white/40 hover:shadow-xl',
  outlined: 'hover:bg-white/5 hover:border-white/50',
  filled: 'hover:bg-white/10 hover:border-white/20'
} as const

export const CARD_HEADER_CLASSES = 'border-b border-white/10 pb-3 mb-3'
export const CARD_CONTENT_CLASSES = 'py-3'
export const CARD_FOOTER_CLASSES = 'border-t border-white/10 pt-3 mt-3'
export const CARD_TITLE_CLASSES = 'text-lg font-semibold text-white mb-2'
export const CARD_SUBTITLE_CLASSES = 'text-sm text-white/60 mb-3'
