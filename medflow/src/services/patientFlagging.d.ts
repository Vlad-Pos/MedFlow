/**
 * Patient Flagging Service for MedFlow
 *
 * Handles automatic patient flagging based on non-response to notifications,
 * doctor alerts, and GDPR-compliant flag management.
 *
 * @author MedFlow Team
 * @version 1.0
 */
import { PatientFlag, PatientFlagSummary, DoctorAlert } from '../types/patientFlagging';
/**
 * PatientFlaggingService
 *
 * Comprehensive service for managing patient flags, doctor alerts,
 * and compliance with GDPR and Romanian medical regulations.
 */
export declare class PatientFlaggingService {
    /**
     * Check appointments for patients who should be flagged
     * Called by scheduled job to identify non-responsive patients
     */
    static checkAppointmentsForFlagging(): Promise<{
        processedAppointments: number;
        newFlags: number;
        errors: string[];
    }>;
    /**
     * Determine if a patient should be flagged based on their appointment response
     */
    private static shouldPatientBeFlagged;
    /**
     * Create an automatic flag for a non-responsive patient
     */
    private static createAutomaticFlag;
    /**
     * Create doctor alert for flagged patient
     */
    private static createDoctorAlert;
    /**
     * Get patient flag summary with statistics
     */
    static getPatientFlagSummary(patientId: string): Promise<PatientFlagSummary | null>;
    /**
     * Get all flags for a patient
     */
    static getPatientFlags(patientId: string, includeResolved?: boolean): Promise<PatientFlag[]>;
    /**
     * Get doctor alerts
     */
    static getDoctorAlerts(userId: string, unreadOnly?: boolean): Promise<DoctorAlert[]>;
    /**
     * Mark doctor alert as read
     */
    static markAlertAsRead(alertId: string): Promise<void>;
    /**
     * Resolve a patient flag
     */
    static resolvePatientFlag(flagId: string, resolutionNotes: string, resolvedBy: string): Promise<void>;
    /**
     * Get doctor's flagging configuration
     */
    private static getDoctorFlaggingConfig;
    /**
     * Update patient flag summary statistics
     */
    private static updatePatientFlagSummary;
    /**
     * Validate GDPR compliance for flagging operations
     */
    private static validateGDPRCompliance;
    /**
     * Log audit trail for flag operations (GDPR compliance)
     */
    private static logFlagAudit;
    /**
     * Helper methods
     */
    private static getPatientId;
    private static countNotificationsSent;
    private static getLastNotificationTime;
    private static generateFlagDescription;
    private static getPatientFlagForAppointment;
    /**
     * Get flagged patients for a doctor with UI display information
     */
    static getFlaggedPatientsForDoctor(userId: string): Promise<{
        patientId: string;
        patientName: string;
        flagCount: number;
        riskLevel: 'none' | 'low' | 'medium' | 'high';
        lastFlagDate?: Date;
    }[]>;
}
export default PatientFlaggingService;
