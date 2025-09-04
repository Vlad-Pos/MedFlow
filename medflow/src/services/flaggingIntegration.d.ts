/**
 * Flagging Integration Service for MedFlow
 *
 * Integrates the patient flagging system with notification scheduling
 * to automatically flag patients based on non-response patterns.
 *
 * @author MedFlow Team
 * @version 1.0
 */
import { AppointmentWithNotifications } from '../types/notifications';
/**
 * FlaggingIntegrationService
 *
 * Provides integration points between the notification system
 * and patient flagging system for automatic flagging workflows.
 */
export declare class FlaggingIntegrationService {
    /**
     * Initialize the flagging integration system
     * This should be called when the app starts
     */
    static initialize(): Promise<void>;
    /**
     * Schedule periodic checks for patients that should be flagged
     * In production, this would be handled by a cloud function or server-side job
     */
    private static schedulePeriodicFlaggingCheck;
    /**
     * Perform the actual flagging check
     */
    private static performFlaggingCheck;
    /**
     * Notify doctors of new flags (placeholder for real-time updates)
     */
    private static notifyDoctorsOfNewFlags;
    /**
     * Check if a specific appointment should trigger flagging
     * This can be called immediately after appointment time passes
     */
    static checkAppointmentForImediateFlagging(appointment: AppointmentWithNotifications): Promise<boolean>;
    /**
     * Manually trigger flagging check for testing purposes
     */
    static triggerManualFlaggingCheck(): Promise<{
        success: boolean;
        newFlags: number;
        errors: string[];
    }>;
    /**
     * Get real-time flagging statistics
     */
    static getFlaggingStatistics(): Promise<{
        totalActiveFlags: number;
        flagsToday: number;
        flagsThisWeek: number;
        topReasons: Array<{
            reason: string;
            count: number;
        }>;
    }>;
    /**
     * Handle appointment status changes that might affect flagging
     */
    static handleAppointmentStatusChange(appointment: AppointmentWithNotifications, oldStatus: string, newStatus: string): Promise<void>;
    /**
     * Get flagged patients summary for dashboard widget
     */
    static getFlaggedPatientsSummary(doctorId: string): Promise<{
        totalFlagged: number;
        highRisk: number;
        needsAttention: number;
        recentFlags: Array<{
            patientName: string;
            flagDate: Date;
            reason: string;
        }>;
    }>;
}
export default FlaggingIntegrationService;
