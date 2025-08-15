export interface ScrollState {
  scrollProgress: number
  isScrolling: boolean
  scrollY: number
  scrollHeight: number
  viewportHeight: number
}

export interface UseScrollOptimizedOptions {
  throttleMs?: number
  passive?: boolean
  onScroll?: (state: ScrollState) => void
}

export declare const useScrollOptimized: (options?: UseScrollOptimizedOptions) => ScrollState & {
  scrollPercentage: number
  isAtTop: boolean
  isAtBottom: boolean
  scrollDirection: 'up' | 'down'
}

export default useScrollOptimized
