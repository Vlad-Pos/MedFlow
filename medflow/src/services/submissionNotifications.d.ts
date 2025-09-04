/**
 * Submission Notifications Service for MedFlow
 *
 * Real-time notification system for government submission status updates:
 * - In-app notifications for submission events
 * - Email notifications (optional)
 * - SMS notifications (optional)
 * - Push notifications for mobile apps
 * - Notification preferences management
 * - GDPR-compliant notification handling
 *
 * @author MedFlow Team
 * @version 1.0
 */
import { Timestamp } from 'firebase/firestore';
import { SubmissionStatus } from '../types/patientReports';
export interface NotificationPreferences {
    userId: string;
    inApp: boolean;
    email: boolean;
    emailAddress?: string;
    sms: boolean;
    phoneNumber?: string;
    push: boolean;
    submissionSuccess: boolean;
    submissionFailure: boolean;
    submissionRetry: boolean;
    submissionScheduled: boolean;
    periodReminders: boolean;
    updatedAt: Timestamp;
}
export interface SubmissionNotification {
    id: string;
    userId: string;
    type: 'submission_success' | 'submission_failure' | 'submission_retry' | 'submission_scheduled' | 'period_reminder' | 'manual_action_required';
    title: string;
    message: string;
    data?: Record<string, unknown>;
    read: boolean;
    sent: boolean;
    sentAt?: Timestamp;
    createdAt: Timestamp;
    channels: {
        inApp: boolean;
        email: boolean;
        sms: boolean;
        push: boolean;
    };
    batchId?: string;
    submissionStatus?: SubmissionStatus;
    governmentReference?: string;
    priority: 'low' | 'normal' | 'high' | 'critical';
    urgent: boolean;
    gdprCompliant: boolean;
    retentionDays: number;
}
export interface EmailNotification {
    to: string;
    subject: string;
    body: string;
    html?: string;
    attachments?: Array<{
        filename: string;
        content: string;
        contentType: string;
    }>;
}
export interface SMSNotification {
    to: string;
    message: string;
}
/**
 * Gets notification preferences for a user
 */
export declare function getNotificationPreferences(userId: string): Promise<NotificationPreferences>;
/**
 * Updates notification preferences for a user
 */
export declare function updateNotificationPreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<void>;
/**
 * Creates a submission notification
 */
export declare function createSubmissionNotification(userId: string, type: SubmissionNotification['type'], batchId: string, submissionStatus: SubmissionStatus, additionalData?: Record<string, unknown>): Promise<string>;
/**
 * Subscribes to real-time notifications for a user
 */
export declare function subscribeToNotifications(userId: string, callback: (notification: SubmissionNotification) => void): () => void;
/**
 * Gets unread notifications for a user
 */
export declare function getUnreadNotifications(userId: string): Promise<SubmissionNotification[]>;
/**
 * Marks notification as read
 */
export declare function markNotificationAsRead(notificationId: string): Promise<void>;
/**
 * Sends period reminder notifications
 */
export declare function sendPeriodReminders(): Promise<void>;
/**
 * Sets up automated notification triggers
 */
export declare function setupNotificationTriggers(): void;
/**
 * Cleans up notification triggers
 */
export declare function cleanupNotificationTriggers(): void;
