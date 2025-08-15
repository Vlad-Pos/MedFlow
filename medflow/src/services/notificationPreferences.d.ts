/**
 * Patient Notification Preferences Service for MedFlow
 *
 * Manages patient notification preferences, GDPR consent tracking,
 * and preference validation with Romanian regulations compliance.
 *
 * @author MedFlow Team
 * @version 1.0
 */
import { PatientNotificationPreferences, GDPRConsent, NotificationChannel, PreferencesValidationResult } from '../types/notifications';
/**
 * PatientNotificationPreferencesService
 *
 * Provides comprehensive management of patient notification preferences
 * with GDPR compliance and Romanian regulatory requirements.
 */
export declare class PatientNotificationPreferencesService {
    /**
     * Get patient notification preferences by patient ID
     */
    static getPatientPreferences(patientId: string): Promise<PatientNotificationPreferences | null>;
    /**
     * Create or update patient notification preferences
     */
    static upsertPatientPreferences(preferences: Partial<PatientNotificationPreferences> & {
        patientId: string;
    }): Promise<PatientNotificationPreferences>;
    /**
     * Update GDPR consent for a patient
     */
    static updateGDPRConsent(patientId: string, consent: Partial<GDPRConsent>, metadata?: {
        ipAddress?: string;
        userAgent?: string;
    }): Promise<void>;
    /**
     * Withdraw GDPR consent (patient opt-out)
     */
    static withdrawGDPRConsent(patientId: string, reason?: string, metadata?: {
        ipAddress?: string;
        userAgent?: string;
    }): Promise<void>;
    /**
     * Verify a notification channel (email or SMS)
     */
    static verifyNotificationChannel(patientId: string, channel: 'email' | 'sms'): Promise<void>;
    /**
     * Get patients with active notification preferences for appointment reminders
     */
    static getPatientsWithActiveNotifications(): Promise<PatientNotificationPreferences[]>;
    /**
     * Validate patient notification preferences
     */
    static validatePreferences(preferences: Partial<PatientNotificationPreferences>): PreferencesValidationResult;
    /**
     * Check if patient has valid preferences for receiving notifications
     */
    static canReceiveNotifications(patientId: string): Promise<{
        canReceive: boolean;
        availableChannels: NotificationChannel[];
        reason?: string;
    }>;
}
export default PatientNotificationPreferencesService;
