// Navigation Components - Backward Compatible
export { default as AnalyticsTab } from './AnalyticsTab'
export { default as NavigationManager, useNavigationItems } from './NavigationManager'

// Enhanced Navigation System (Phase 4)
export { NavigationManager as NavigationManagerV4, useNavigationItems as useNavigationItemsV4, createNavigationManager, useAdvancedNavigation } from './NavigationManagerV4'

// Navigation Types and Interfaces
export type {
  NavigationItem,
  NavigationContext,
  NavigationAnalytics,
  NavigationMetadata,
  NavigationState,
  NavigationConfig,
  NavigationEvent,
  NavigationItemBuilder,
  NavigationCondition
} from './types/navigation.types'

// Navigation Core
export {
  NavigationItemsManager,
  createNavigationItemsManager,
  createDefaultNavigationContext
} from './core/navigationItems'

// Navigation Guards
export {
  NavigationGuardsManager,
  createNavigationGuardsManager
} from './guards/navigationGuards'
export type {
  NavigationGuardResult,
  NavigationGuardEvaluation
} from './guards/navigationGuards'

// Navigation State
export {
  NavigationStateManager,
  createNavigationStateManager
} from './state/navigationState'

// Navigation Analytics
export {
  NavigationAnalyticsManager,
  createNavigationAnalyticsManager,
  getGlobalNavigationAnalytics,
  clearGlobalNavigationAnalytics
} from './analytics/navigationAnalytics'
export type {
  NavigationAnalyticsSummary,
  NavigationInsights
} from './analytics/navigationAnalytics'

// Navigation Utils
export {
  NavigationUtilsManager,
  createNavigationUtilsManager,
  validateNavigationPath,
  validateNavigationLabel,
  validateNavigationPriority,
  sanitizeNavigationText,
  generateNavigationId,
  compareNavigationItems,
  groupNavigationItemsByPriority
} from './utils/navigationUtils'

// Legacy Components (preserved for compatibility)
export { default as NavigationManagerV2 } from './NavigationManagerV2'
export { default as NavigationManagerV3 } from './NavigationManagerV3'
export { default as NavigationTest } from './NavigationTest'
export { default as SimpleNavigationTest } from './SimpleNavigationTest'
export { default as MinimalNavigationTest } from './MinimalNavigationTest'
export { default as NavigationDebug } from './NavigationDebug'
export { default as AuthTest } from './AuthTest'
export { default as EnvironmentTest } from './EnvironmentTest'
