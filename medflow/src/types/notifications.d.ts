/**
 * Notification System Types for MedFlow
 *
 * Comprehensive type definitions for patient notification preferences,
 * GDPR compliance, and notification scheduling infrastructure.
 *
 * @author MedFlow Team
 * @version 1.0
 */
import { Timestamp } from 'firebase/firestore';
export type NotificationChannel = 'email' | 'sms' | 'in_app';
export interface NotificationTiming {
    firstNotification: {
        hoursBefore: number;
        timeOfDay: number;
    };
    secondNotification: {
        hoursBefore: number;
        timeOfDay: number;
    };
}
export interface GDPRConsent {
    dataProcessing: boolean;
    consentDate: Timestamp;
    marketingCommunications: boolean;
    appointmentReminders: boolean;
    analytics: boolean;
    performanceTracking: boolean;
    ipAddress?: string;
    userAgent?: string;
    consentVersion: string;
    withdrawn?: boolean;
    withdrawalDate?: Timestamp;
    withdrawalReason?: string;
}
export interface PatientNotificationPreferences {
    patientId: string;
    email?: string;
    phoneNumber?: string;
    channels: {
        email: {
            enabled: boolean;
            verified: boolean;
            verificationDate?: Timestamp;
        };
        sms: {
            enabled: boolean;
            verified: boolean;
            verificationDate?: Timestamp;
        };
        inApp: {
            enabled: boolean;
        };
    };
    language: 'ro' | 'en';
    timing: NotificationTiming;
    gdprConsent: GDPRConsent;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    globalOptOut: boolean;
    optOutDate?: Timestamp;
    optOutReason?: string;
}
export interface AppointmentWithNotifications {
    id: string;
    patientName: string;
    patientEmail?: string;
    patientPhone?: string;
    dateTime: Date | Timestamp;
    symptoms: string;
    notes?: string;
    status: 'scheduled' | 'completed' | 'no_show' | 'cancelled' | 'confirmed' | 'declined';
    doctorId: string;
    notifications: {
        patientPreferencesId?: string;
        firstNotification: {
            sent: boolean;
            sentAt?: Timestamp;
            channel?: NotificationChannel;
            deliveryStatus?: 'delivered' | 'failed' | 'pending';
            errorMessage?: string;
        };
        secondNotification: {
            sent: boolean;
            sentAt?: Timestamp;
            channel?: NotificationChannel;
            deliveryStatus?: 'delivered' | 'failed' | 'pending';
            errorMessage?: string;
        };
        confirmationReceived: boolean;
        confirmationDate?: Timestamp;
        confirmationMethod?: 'email' | 'sms' | 'in_app' | 'phone' | 'email_link';
        optedOut: boolean;
        optOutDate?: Timestamp;
        rescheduledAt?: Timestamp;
        rescheduleReason?: string;
    };
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
export interface NotificationTemplateData {
    patientName: string;
    appointmentDate: string;
    appointmentTime: string;
    doctorName: string;
    clinicName: string;
    clinicAddress: string;
    confirmationLink: string;
    symptoms?: string;
    specialInstructions?: string;
    emergencyContact?: string;
}
export interface NotificationDeliveryRequest {
    appointmentId: string;
    patientPreferencesId: string;
    channel: NotificationChannel;
    templateData: NotificationTemplateData;
    scheduledFor: Timestamp;
    priority: 'high' | 'medium' | 'low';
    maxRetries: number;
    retryInterval: number;
    createdAt: Timestamp;
}
export interface NotificationDeliveryStatus {
    id: string;
    appointmentId: string;
    deliveryRequestId: string;
    channel: NotificationChannel;
    recipientEmail?: string;
    recipientPhone?: string;
    status: 'pending' | 'sent' | 'delivered' | 'failed' | 'cancelled';
    attemptNumber: number;
    lastAttemptAt?: Timestamp;
    deliveredAt?: Timestamp;
    errorCode?: string;
    errorMessage?: string;
    providerMessageId?: string;
    providerResponse?: Record<string, unknown>;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
export interface NotificationSchedulerJob {
    id: string;
    appointmentId: string;
    notificationType: 'first' | 'second';
    scheduledFor: Timestamp;
    executeAt: Timestamp;
    status: 'pending' | 'executing' | 'completed' | 'failed' | 'cancelled';
    executedAt?: Timestamp;
    completedAt?: Timestamp;
    errorMessage?: string;
    retryCount: number;
    maxRetries: number;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
export interface RomanianNotificationContent {
    subject: string;
    body: string;
    smsText: string;
    inAppTitle: string;
    inAppBody: string;
    confirmButton: string;
    rescheduleButton: string;
    cancelButton: string;
    unsubscribeText: string;
    privacyNotice: string;
}
export interface PreferencesValidationResult {
    valid: boolean;
    errors: {
        channels?: string;
        email?: string;
        phone?: string;
        gdprConsent?: string;
        general?: string;
    };
    warnings?: string[];
}
export interface NotificationAnalytics {
    period: {
        startDate: Timestamp;
        endDate: Timestamp;
    };
    totalNotificationsSent: number;
    deliveryRates: {
        email: {
            sent: number;
            delivered: number;
            failed: number;
        };
        sms: {
            sent: number;
            delivered: number;
            failed: number;
        };
        inApp: {
            sent: number;
            delivered: number;
            failed: number;
        };
    };
    confirmationRate: number;
    optOutRate: number;
    consentRate: number;
    withdrawalRate: number;
    averageDeliveryTime: number;
    errorRate: number;
}
