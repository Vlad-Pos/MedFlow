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
export { AIService, getAIService } from './aiService'
export { AppointmentLinksService } from './appointmentLinks'
export { AvailableSlotsService } from './availableSlots'
export { auth, db, storage } from './firebase'
export { FlaggingIntegrationService } from './flaggingIntegration'
export { startSubmissionScheduler, stopSubmissionScheduler } from './governmentSubmission'
export { InvitationService } from './invitationService'
export { getMonthlyReports, getMonthlyReportSummary } from './monthlyReports'
export { PatientNotificationPreferencesService } from './notificationPreferences'
export { NotificationSchedulerService } from './notificationScheduler'
export { NotificationSenderService } from './notificationSender'
export { showNotification, setGlobalNotificationCallback, clearGlobalNotificationCallback, isNotificationSystemAvailable } from './notificationService'
export { PatientFlaggingService } from './patientFlagging'
export { validateReportData, createReport, updateReport, finalizeReport, getReport, getReportsByAppointment, getReportsByDoctor, subscribeToReports, deleteReport, getReportTemplates, getReportStatistics } from './patientReports'
export { performanceMonitor } from './performanceMonitor'
export { RoleService } from './roleService'
export { default as StateManager } from './stateManager'
export { getNotificationPreferences, updateNotificationPreferences, createSubmissionNotification, subscribeToNotifications, getUnreadNotifications, markNotificationAsRead, sendPeriodReminders, setupNotificationTriggers, cleanupNotificationTriggers } from './submissionNotifications'

