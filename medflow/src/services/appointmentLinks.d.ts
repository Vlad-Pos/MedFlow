/**
 * Secure Appointment Link Service for MedFlow
 *
 * Generates and validates secure, time-limited confirmation and decline links
 * with comprehensive security measures and real-time appointment updates.
 *
 * @author MedFlow Team
 * @version 1.0
 */
import { Timestamp } from 'firebase/firestore';
import { AppointmentWithNotifications } from '../types/notifications';
/**
 * Secure link types
 */
export type AppointmentLinkType = 'confirm' | 'decline' | 'reschedule';
/**
 * Secure appointment link data
 */
export interface AppointmentLink {
    id: string;
    appointmentId: string;
    type: AppointmentLinkType;
    token: string;
    expiresAt: Timestamp;
    used: boolean;
    usedAt?: Timestamp;
    patientEmail?: string;
    createdAt: Timestamp;
    ipAddress?: string;
    userAgent?: string;
}
/**
 * Link validation result
 */
export interface LinkValidationResult {
    valid: boolean;
    expired: boolean;
    used: boolean;
    appointment?: AppointmentWithNotifications;
    error?: string;
}
/**
 * Patient response data
 */
export interface PatientResponse {
    appointmentId: string;
    action: 'confirmed' | 'declined' | 'rescheduled';
    timestamp: Timestamp;
    newDateTime?: Date;
    reason?: string;
    ipAddress?: string;
    userAgent?: string;
}
/**
 * AppointmentLinksService
 *
 * Handles generation, validation, and processing of secure appointment links
 * with comprehensive security measures and audit logging.
 */
export declare class AppointmentLinksService {
    /**
     * Generate secure confirmation and decline links for an appointment
     */
    static generateAppointmentLinks(appointmentId: string, patientEmail?: string, expiryHours?: number): Promise<{
        confirmLink: string;
        declineLink: string;
        confirmToken: string;
        declineToken: string;
    }>;
    /**
     * Validate an appointment link token
     */
    static validateAppointmentLink(token: string): Promise<LinkValidationResult>;
    /**
     * Process appointment confirmation
     */
    static confirmAppointment(token: string, metadata?: {
        ipAddress?: string;
        userAgent?: string;
    }): Promise<{
        success: boolean;
        appointment?: AppointmentWithNotifications;
        error?: string;
    }>;
    /**
     * Process appointment decline (initiates rescheduling flow)
     */
    static declineAppointment(token: string, metadata?: {
        ipAddress?: string;
        userAgent?: string;
    }): Promise<{
        success: boolean;
        appointment?: AppointmentWithNotifications;
        requiresRescheduling: boolean;
        error?: string;
    }>;
    /**
     * Reschedule appointment to new date/time
     */
    static rescheduleAppointment(appointmentId: string, newDateTime: Date, reason?: string, metadata?: {
        ipAddress?: string;
        userAgent?: string;
    }): Promise<{
        success: boolean;
        appointment?: AppointmentWithNotifications;
        error?: string;
    }>;
    /**
     * Generate secure token for appointment links
     */
    private static generateSecureToken;
    /**
     * Record patient response for audit purposes
     */
    private static recordPatientResponse;
    /**
     * Cancel pending notifications after confirmation
     */
    private static cancelPendingNotifications;
    /**
     * Reschedule notifications for new appointment time
     */
    private static rescheduleNotifications;
    /**
     * Clean up expired links (maintenance function)
     */
    static cleanupExpiredLinks(): Promise<void>;
    /**
     * Get link statistics for monitoring
     */
    static getLinkStatistics(userId: string, startDate: Date, endDate: Date): Promise<{
        totalLinks: number;
        confirmations: number;
        declines: number;
        expired: number;
        confirmationRate: number;
    }>;
}
export default AppointmentLinksService;
