// Analytics and Tracking Services
export { utmTracking } from './utmTracking';
export { featureAnalytics } from './featureAnalytics';
export type { UTMParams, TrackingData, ConversionFunnel } from './utmTracking';
export type { FeatureEvent, FeatureUsage, UserBehavior } from './featureAnalytics';

// Enhanced Data Management Layer (Phase 4)
export {
  DataManager,
  createDataManager,
  DEFAULT_DATA_MANAGER_CONFIG
} from './core/dataManager'
export type {
  DataManagerConfig,
  DataQuery,
  DataResult,
  DataMutationResult,
  DataError,
  DataOperation,
  DataAnalytics,
  DataService,
  DataManagerError,
  DataNetworkError,
  DataValidationError
} from './types/data-management.types'

// Cache Service
export {
  CacheService,
  createCacheService,
  CACHE_CONFIG
} from './cache/cacheService'
export type {
  DataCacheEntry,
  DataCacheAnalytics
} from './types/data-management.types'

// State Service
export {
  DataStateService,
  createStateService,
  getGlobalStateService,
  clearGlobalStateService
} from './state/stateService'
export type {
  DataState,
  DataSubscription
} from './types/data-management.types'

// Analytics Service
export {
  DataAnalyticsService,
  createAnalyticsService,
  getGlobalAnalyticsService,
  clearGlobalAnalyticsService
} from './analytics/analyticsService'
export type {
  DataOperationAnalytics,
  DataErrorAnalytics,
  DataPerformanceAnalytics,
  DataPerformanceMetrics
} from './types/data-management.types'

// Legacy Services (preserved for compatibility)
export { advancedCache } from './advancedCache'
export { aiService } from './aiService'
export { appointmentLinks } from './appointmentLinks'
export { availableSlots } from './availableSlots'
export { firebase } from './firebase'
export { flaggingIntegration } from './flaggingIntegration'
export { governmentSubmission } from './governmentSubmission'
export { invitationService } from './invitationService'
export { monthlyReports } from './monthlyReports'
export { notificationPreferences } from './notificationPreferences'
export { notificationScheduler } from './notificationScheduler'
export { notificationSender } from './notificationSender'
export { notificationService } from './notificationService'
export { patientFlagging } from './patientFlagging'
export { patientReports } from './patientReports'
export { performanceMonitor } from './performanceMonitor'
export { roleService } from './roleService'
export { stateManager } from './stateManager'
export { submissionNotifications } from './submissionNotifications'
export { utmTracking } from './utmTracking'
export { featureAnalytics } from './featureAnalytics'
