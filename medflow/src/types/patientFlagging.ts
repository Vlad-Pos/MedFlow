/**
 * Patient Flagging System Types for MedFlow
 * 
 * Comprehensive type definitions for patient flagging, doctor alerts,
 * and compliance tracking with GDPR considerations.
 * 
 * @author MedFlow Team
 * @version 1.0
 */

import { Timestamp } from 'firebase/firestore'

/**
 * Severity levels for patient flags
 */
export type FlagSeverity = 'low' | 'medium' | 'high'

/**
 * Reasons for flagging a patient
 */
export type FlagReason = 
  | 'no_response_to_notifications'
  | 'multiple_no_shows'
  | 'repeated_late_cancellations'
  | 'appointment_abuse'
  | 'manual_flag'

/**
 * Patient flag status
 */
export type FlagStatus = 'active' | 'resolved' | 'dismissed' | 'appealed'

/**
 * Individual patient flag record
 */
export interface PatientFlag {
  id: string
  patientId: string
  patientName: string
  patientEmail?: string
  doctorId: string
  
  // Flag details
  reason: FlagReason
  severity: FlagSeverity
  status: FlagStatus
  description: string
  
  // Associated appointment (if applicable)
  appointmentId?: string
  appointmentDateTime?: Timestamp
  
  // Automatic flagging details
  notificationsSent: number
  lastNotificationSent?: Timestamp
  responseDeadline: Timestamp
  
  // Resolution details
  resolvedAt?: Timestamp
  resolvedBy?: string // Doctor ID who resolved
  resolutionNotes?: string
  
  // GDPR compliance
  dataRetentionExpiry: Timestamp
  patientNotified: boolean
  patientNotificationDate?: Timestamp
  
  // Metadata
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: 'system' | 'doctor' // Automatic vs manual flag
}

/**
 * Patient flagging summary for quick access
 */
export interface PatientFlagSummary {
  patientId: string
  patientName: string
  patientEmail?: string
  
  // Flag statistics
  totalFlags: number
  activeFlags: number
  resolvedFlags: number
  
  // Severity breakdown
  flagsBySeverity: {
    low: number
    medium: number
    high: number
  }
  
  // Recent activity
  lastFlagDate?: Timestamp
  lastResolutionDate?: Timestamp
  
  // Current risk level
  riskLevel: 'none' | 'low' | 'medium' | 'high'
  
  // GDPR compliance
  consentToTracking: boolean
  canBeContacted: boolean
  
  // Metadata
  firstFlagDate?: Timestamp
  lastUpdated: Timestamp
}

/**
 * Doctor alert for flagged patients
 */
export interface DoctorAlert {
  id: string
  doctorId: string
  
  // Alert details
  type: 'patient_flagged' | 'high_risk_patient' | 'repeated_offender'
  severity: 'info' | 'warning' | 'urgent'
  title: string
  message: string
  
  // Related data
  patientId: string
  patientName: string
  flagId?: string
  appointmentId?: string
  
  // Alert status
  read: boolean
  acknowledged: boolean
  dismissed: boolean
  
  // Action required
  requiresAction: boolean
  actionDeadline?: Timestamp
  
  // Metadata
  createdAt: Timestamp
  readAt?: Timestamp
  acknowledgedAt?: Timestamp
  dismissedAt?: Timestamp
}

/**
 * Flagging configuration for doctors/clinics
 */
export interface FlaggingConfiguration {
  doctorId: string
  
  // Automatic flagging rules
  enableAutoFlagging: boolean
  flagAfterMissedNotifications: number // Default: 2 (both notifications)
  flagSeverityForNoResponse: FlagSeverity // Default: 'medium'
  
  // Time-based rules
  responseTimeoutHours: number // Hours after second notification to flag
  appointmentGracePeriodMinutes: number // Grace period after appointment time
  
  // Alert preferences
  enableRealTimeAlerts: boolean
  enableEmailAlerts: boolean
  alertForSeverities: FlagSeverity[]
  
  // UI preferences
  highlightFlaggedPatients: boolean
  showFlagCountInLists: boolean
  flagDisplayColor: string // Hex color for UI indicators
  
  // Data retention (GDPR compliance)
  flagRetentionMonths: number // Default: 24 months
  autoResolveOldFlags: boolean
  
  // Metadata
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * Patient flagging analytics
 */
export interface FlaggingAnalytics {
  doctorId: string
  period: {
    startDate: Timestamp
    endDate: Timestamp
  }
  
  // Flag statistics
  totalFlags: number
  newFlags: number
  resolvedFlags: number
  activeFlags: number
  
  // Breakdown by reason
  flagsByReason: Record<FlagReason, number>
  
  // Breakdown by severity
  flagsBySeverity: Record<FlagSeverity, number>
  
  // Patient statistics
  uniquePatientsFlags: number
  repeatOffenders: number // Patients with 3+ flags
  
  // Resolution statistics
  averageResolutionTime: number // Hours
  resolutionRate: number // Percentage
  
  // Trends
  flagTrend: 'increasing' | 'decreasing' | 'stable'
  topReasons: { reason: FlagReason; count: number }[]
  
  // Compliance metrics
  gdprCompliantFlags: number
  expiredFlags: number
}

/**
 * Flag audit log for compliance
 */
export interface FlagAuditLog {
  id: string
  flagId: string
  patientId: string
  doctorId: string
  
  // Action details
  action: 'created' | 'updated' | 'resolved' | 'dismissed' | 'data_access' | 'data_deleted'
  performedBy: string // User ID
  performedByType: 'doctor' | 'system' | 'admin'
  
  // Change details
  oldValue?: unknown
  newValue?: unknown
  changeReason?: string
  
  // Legal compliance
  legalBasis: string // GDPR legal basis
  patientConsent: boolean
  
  // Metadata
  ipAddress?: string
  userAgent?: string
  timestamp: Timestamp
}

/**
 * Patient flag appeal/dispute
 */
export interface PatientFlagAppeal {
  id: string
  flagId: string
  patientId: string
  
  // Appeal details
  reason: string
  evidence?: string
  submittedBy: 'patient' | 'guardian' | 'representative'
  
  // Status
  status: 'pending' | 'under_review' | 'approved' | 'rejected'
  reviewedBy?: string // Doctor/Admin ID
  reviewedAt?: Timestamp
  reviewNotes?: string
  
  // Resolution
  decision: 'flag_removed' | 'flag_modified' | 'appeal_denied'
  decisionReason?: string
  
  // Metadata
  submittedAt: Timestamp
  resolvedAt?: Timestamp
}

/**
 * GDPR compliance data for patient flags
 */
export interface PatientFlagGDPRData {
  patientId: string
  
  // Consent tracking
  consentToFlagging: boolean
  consentDate?: Timestamp
  consentWithdrawn: boolean
  withdrawalDate?: Timestamp
  
  // Data subject rights
  dataAccessRequests: {
    requestDate: Timestamp
    fulfilledDate?: Timestamp
    requestType: 'access' | 'rectification' | 'erasure' | 'portability' | 'restrict'
  }[]
  
  // Right to be forgotten
  erasureRequested: boolean
  erasureDate?: Timestamp
  erasureReason?: string
  
  // Legal basis for processing
  legalBasis: 'legitimate_interest' | 'consent' | 'contract' | 'legal_obligation'
  
  // Data retention
  retentionExpiry: Timestamp
  autoDeleteScheduled: boolean
  
  // Metadata
  createdAt: Timestamp
  lastUpdated: Timestamp
}

/**
 * Real-time flag event for UI updates
 */
export interface FlagEvent {
  type: 'flag_created' | 'flag_updated' | 'flag_resolved' | 'alert_created'
  flagId?: string
  alertId?: string
  patientId: string
  doctorId: string
  data: Record<string, unknown>
  timestamp: Timestamp
}

/**
 * Validation result for flagging operations
 */
export interface FlaggingValidationResult {
  valid: boolean
  canFlag: boolean
  gdprCompliant: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Patient flag display configuration for UI
 */
export interface FlagDisplayConfig {
  showInPatientList: boolean
  showInAppointmentView: boolean
  showInCalendar: boolean
  
  // Visual indicators
  highlightColor: string
  flagIconColor: string
  showFlagCount: boolean
  showSeverityIndicator: boolean
  
  // Information disclosure
  showFlagReason: boolean
  showLastFlagDate: boolean
  allowFlagHistory: boolean
  
  // Privacy settings
  restrictSensitiveFlags: boolean
  requireConfirmationForAccess: boolean
}

/**
 * Notification template data for flagging alerts
 */
export interface FlaggingNotificationData {
  doctorName: string
  patientName: string
  flagReason: string
  flagSeverity: FlagSeverity
  appointmentDateTime?: string
  flagCount: number
  clinicName: string
  actionRequired?: string
  flagId: string
}
