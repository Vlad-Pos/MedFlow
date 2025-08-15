export const GRID_BASE_CLASSES = 'grid'

export const GRID_COLUMNS_CLASSES = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  12: 'grid-cols-12'
} as const

export const GRID_GAP_CLASSES = {
  none: '',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8'
} as const

export const GRID_RESPONSIVE_CLASSES = {
  sm: 'sm:grid-cols-2',
  md: 'md:grid-cols-3',
  lg: 'lg:grid-cols-4',
  xl: 'xl:grid-cols-6'
} as const

export const GRID_ALIGNMENT_CLASSES = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch'
} as const

export const GRID_JUSTIFY_CLASSES = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly'
} as const
