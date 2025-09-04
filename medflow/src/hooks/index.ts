// Core hooks
export { useRole } from './useRole'
export { usePermissions } from './usePermissions'
export { useInvitations } from './useInvitations'
export { useKeyboardShortcuts } from './useKeyboardShortcuts'
export { useNotification } from './useNotification'
export { useFramerIntegration } from './useFramerIntegration'

// Performance optimization hooks
export { default as useCalendarCSS } from './useCalendarCSS'
export { default as useFirebaseOptimization } from './useFirebaseOptimization'
export { default as usePerformanceMonitoring } from './usePerformanceMonitoring'

// Responsive and UI hooks
export { 
  useResponsiveConsolidated,
  useBreakpoint,
  useTouchDevice,
  useViewport,
  useSafeArea,
  useScrollPosition,
  useOrientation,
  useResponsive
} from './useResponsiveConsolidated'
export type { ResponsiveState } from './useResponsiveConsolidated'

// Performance and animation hooks
export {
  usePerformance,
  usePerformanceMonitor,
  useDeviceCapabilities,
  usePerformanceConfig
} from './usePerformance'
export type { UsePerformanceReturn } from './usePerformance'

export { default as useAnimationPerformance } from './useAnimationPerformance'
export { default as useCalendarOptimization } from './useCalendarOptimization'
export { default as useScrollOptimized } from './useScrollOptimized'
export type { ScrollState, UseScrollOptimizedOptions } from './useScrollOptimized'

// Analytics and tracking hooks
export { useFeatureAnalytics } from './useFeatureAnalytics'
export { useEnhancedFramerIntegration } from './useEnhancedFramerIntegration'
export type { FeatureAnalyticsOptions } from './useFeatureAnalytics'
export type { FramerUserContext, FramerNavigationOptions, ConversionMetrics } from './useEnhancedFramerIntegration'
