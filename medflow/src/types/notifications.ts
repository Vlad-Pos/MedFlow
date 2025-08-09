/**
 * Notification System Types for MedFlow
 * 
 * Comprehensive type definitions for patient notification preferences,
 * GDPR compliance, and notification scheduling infrastructure.
 * 
 * @author MedFlow Team
 * @version 1.0
 */

import { Timestamp } from 'firebase/firestore'

// Patient notification channel preferences
export type NotificationChannel = 'email' | 'sms' | 'in_app'

// Notification timing preferences
export interface NotificationTiming {
  // First notification: 9 AM, one day prior to appointment
  firstNotification: {
    hoursBefore: number  // 24 hours
    timeOfDay: number    // 9 (9 AM)
  }
  // Second notification: 3 PM, same day as appointment
  secondNotification: {
    hoursBefore: number  // 6-8 hours typically
    timeOfDay: number    // 15 (3 PM)
  }
}

// GDPR consent tracking
export interface GDPRConsent {
  // Core data processing consent (required)
  dataProcessing: boolean
  consentDate: Timestamp
  
  // Marketing and communication consents (optional)
  marketingCommunications: boolean
  appointmentReminders: boolean
  
  // Technical consents
  analytics: boolean
  performanceTracking: boolean
  
  // Consent metadata
  ipAddress?: string // Anonymized for audit trail
  userAgent?: string
  consentVersion: string // Version of terms consented to
  
  // Withdrawal tracking
  withdrawn?: boolean
  withdrawalDate?: Timestamp
  withdrawalReason?: string
}

// Patient notification preferences
export interface PatientNotificationPreferences {
  // Unique patient identifier
  patientId: string
  
  // Contact information
  email?: string
  phoneNumber?: string // Romanian format: +40...
  
  // Notification channel preferences (at least one must be active)
  channels: {
    email: {
      enabled: boolean
      verified: boolean
      verificationDate?: Timestamp
    }
    sms: {
      enabled: boolean
      verified: boolean
      verificationDate?: Timestamp
    }
    inApp: {
      enabled: boolean
      // In-app notifications are always verified if user has account
    }
  }
  
  // Language preference (default: Romanian)
  language: 'ro' | 'en'
  
  // Notification timing preferences
  timing: NotificationTiming
  
  // GDPR compliance
  gdprConsent: GDPRConsent
  
  // Metadata
  createdAt: Timestamp
  updatedAt: Timestamp
  
  // Opt-out functionality
  globalOptOut: boolean
  optOutDate?: Timestamp
  optOutReason?: string
}

// Extended appointment interface with notification data
export interface AppointmentWithNotifications {
  id: string
  patientName: string
  patientEmail?: string
  patientPhone?: string
  dateTime: Date | Timestamp
  symptoms: string
  notes?: string
  status: 'scheduled' | 'completed' | 'no_show' | 'cancelled' | 'confirmed' | 'declined'
  doctorId: string
  
  // Notification tracking
  notifications: {
    // Patient preferences reference
    patientPreferencesId?: string
    
    // Notification delivery status
    firstNotification: {
      sent: boolean
      sentAt?: Timestamp
      channel?: NotificationChannel
      deliveryStatus?: 'delivered' | 'failed' | 'pending'
      errorMessage?: string
    }
    
    secondNotification: {
      sent: boolean
      sentAt?: Timestamp
      channel?: NotificationChannel
      deliveryStatus?: 'delivered' | 'failed' | 'pending'
      errorMessage?: string
    }
    
    // Patient response tracking
    confirmationReceived: boolean
    confirmationDate?: Timestamp
    confirmationMethod?: 'email' | 'sms' | 'in_app' | 'phone' | 'email_link'
    
    // Opt-out tracking for this specific appointment
    optedOut: boolean
    optOutDate?: Timestamp
    
    // Rescheduling tracking
    rescheduledAt?: Timestamp
    rescheduleReason?: string
  }
  
  // Enhanced metadata
  createdAt: Timestamp
  updatedAt: Timestamp
}

// Notification template data
export interface NotificationTemplateData {
  patientName: string
  appointmentDate: string
  appointmentTime: string
  doctorName: string
  clinicName: string
  clinicAddress: string
  confirmationLink: string
  
  // Optional fields
  symptoms?: string
  specialInstructions?: string
  emergencyContact?: string
}

// Notification delivery request
export interface NotificationDeliveryRequest {
  appointmentId: string
  patientPreferencesId: string
  channel: NotificationChannel
  templateData: NotificationTemplateData
  
  // Scheduling
  scheduledFor: Timestamp
  priority: 'high' | 'medium' | 'low'
  
  // Retry configuration
  maxRetries: number
  retryInterval: number // minutes
  
  // Tracking
  createdAt: Timestamp
}

// Notification delivery status
export interface NotificationDeliveryStatus {
  id: string
  appointmentId: string
  deliveryRequestId: string
  
  // Delivery details
  channel: NotificationChannel
  recipientEmail?: string
  recipientPhone?: string
  
  // Status tracking
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'cancelled'
  attemptNumber: number
  lastAttemptAt?: Timestamp
  deliveredAt?: Timestamp
  
  // Error handling
  errorCode?: string
  errorMessage?: string
  
  // Provider-specific details
  providerMessageId?: string // Email/SMS provider message ID
  providerResponse?: any
  
  // Metadata
  createdAt: Timestamp
  updatedAt: Timestamp
}

// Notification scheduler job
export interface NotificationSchedulerJob {
  id: string
  appointmentId: string
  notificationType: 'first' | 'second'
  
  // Scheduling details
  scheduledFor: Timestamp
  executeAt: Timestamp // Exact execution time (considering 9AM/3PM rules)
  
  // Job status
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'cancelled'
  
  // Execution tracking
  executedAt?: Timestamp
  completedAt?: Timestamp
  
  // Error handling
  errorMessage?: string
  retryCount: number
  maxRetries: number
  
  // Metadata
  createdAt: Timestamp
  updatedAt: Timestamp
}

// Romanian notification content
export interface RomanianNotificationContent {
  subject: string
  body: string
  smsText: string
  inAppTitle: string
  inAppBody: string
  
  // Confirmation actions
  confirmButton: string
  rescheduleButton: string
  cancelButton: string
  
  // Legal text (GDPR compliance)
  unsubscribeText: string
  privacyNotice: string
}

// Validation result for patient preferences
export interface PreferencesValidationResult {
  valid: boolean
  errors: {
    channels?: string
    email?: string
    phone?: string
    gdprConsent?: string
    general?: string
  }
  warnings?: string[]
}

// Statistics and analytics
export interface NotificationAnalytics {
  period: {
    startDate: Timestamp
    endDate: Timestamp
  }
  
  // Delivery statistics
  totalNotificationsSent: number
  deliveryRates: {
    email: { sent: number; delivered: number; failed: number }
    sms: { sent: number; delivered: number; failed: number }
    inApp: { sent: number; delivered: number; failed: number }
  }
  
  // Response rates
  confirmationRate: number
  optOutRate: number
  
  // GDPR compliance metrics
  consentRate: number
  withdrawalRate: number
  
  // Performance metrics
  averageDeliveryTime: number // seconds
  errorRate: number
}
