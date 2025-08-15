/**
 * Patient Flagging System Types for MedFlow
 *
 * Comprehensive type definitions for patient flagging, doctor alerts,
 * and compliance tracking with GDPR considerations.
 *
 * @author MedFlow Team
 * @version 1.0
 */
import { Timestamp } from 'firebase/firestore';
/**
 * Severity levels for patient flags
 */
export type FlagSeverity = 'low' | 'medium' | 'high';
/**
 * Reasons for flagging a patient
 */
export type FlagReason = 'no_response_to_notifications' | 'multiple_no_shows' | 'repeated_late_cancellations' | 'appointment_abuse' | 'manual_flag';
/**
 * Patient flag status
 */
export type FlagStatus = 'active' | 'resolved' | 'dismissed' | 'appealed';
/**
 * Individual patient flag record
 */
export interface PatientFlag {
    id: string;
    patientId: string;
    patientName: string;
    patientEmail?: string;
    doctorId: string;
    reason: FlagReason;
    severity: FlagSeverity;
    status: FlagStatus;
    description: string;
    appointmentId?: string;
    appointmentDateTime?: Timestamp;
    notificationsSent: number;
    lastNotificationSent?: Timestamp;
    responseDeadline: Timestamp;
    resolvedAt?: Timestamp;
    resolvedBy?: string;
    resolutionNotes?: string;
    dataRetentionExpiry: Timestamp;
    patientNotified: boolean;
    patientNotificationDate?: Timestamp;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    createdBy: 'system' | 'doctor';
}
/**
 * Patient flagging summary for quick access
 */
export interface PatientFlagSummary {
    patientId: string;
    patientName: string;
    patientEmail?: string;
    totalFlags: number;
    activeFlags: number;
    resolvedFlags: number;
    flagsBySeverity: {
        low: number;
        medium: number;
        high: number;
    };
    lastFlagDate?: Timestamp;
    lastResolutionDate?: Timestamp;
    riskLevel: 'none' | 'low' | 'medium' | 'high';
    consentToTracking: boolean;
    canBeContacted: boolean;
    firstFlagDate?: Timestamp;
    lastUpdated: Timestamp;
}
/**
 * Doctor alert for flagged patients
 */
export interface DoctorAlert {
    id: string;
    doctorId: string;
    type: 'patient_flagged' | 'high_risk_patient' | 'repeated_offender';
    severity: 'info' | 'warning' | 'urgent';
    title: string;
    message: string;
    patientId: string;
    patientName: string;
    flagId?: string;
    appointmentId?: string;
    read: boolean;
    acknowledged: boolean;
    dismissed: boolean;
    requiresAction: boolean;
    actionDeadline?: Timestamp;
    createdAt: Timestamp;
    readAt?: Timestamp;
    acknowledgedAt?: Timestamp;
    dismissedAt?: Timestamp;
}
/**
 * Flagging configuration for doctors/clinics
 */
export interface FlaggingConfiguration {
    doctorId: string;
    enableAutoFlagging: boolean;
    flagAfterMissedNotifications: number;
    flagSeverityForNoResponse: FlagSeverity;
    responseTimeoutHours: number;
    appointmentGracePeriodMinutes: number;
    enableRealTimeAlerts: boolean;
    enableEmailAlerts: boolean;
    alertForSeverities: FlagSeverity[];
    highlightFlaggedPatients: boolean;
    showFlagCountInLists: boolean;
    flagDisplayColor: string;
    flagRetentionMonths: number;
    autoResolveOldFlags: boolean;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
/**
 * Patient flagging analytics
 */
export interface FlaggingAnalytics {
    doctorId: string;
    period: {
        startDate: Timestamp;
        endDate: Timestamp;
    };
    totalFlags: number;
    newFlags: number;
    resolvedFlags: number;
    activeFlags: number;
    flagsByReason: Record<FlagReason, number>;
    flagsBySeverity: Record<FlagSeverity, number>;
    uniquePatientsFlags: number;
    repeatOffenders: number;
    averageResolutionTime: number;
    resolutionRate: number;
    flagTrend: 'increasing' | 'decreasing' | 'stable';
    topReasons: {
        reason: FlagReason;
        count: number;
    }[];
    gdprCompliantFlags: number;
    expiredFlags: number;
}
/**
 * Flag audit log for compliance
 */
export interface FlagAuditLog {
    id: string;
    flagId: string;
    patientId: string;
    doctorId: string;
    action: 'created' | 'updated' | 'resolved' | 'dismissed' | 'data_access' | 'data_deleted';
    performedBy: string;
    performedByType: 'doctor' | 'system' | 'admin';
    oldValue?: unknown;
    newValue?: unknown;
    changeReason?: string;
    legalBasis: string;
    patientConsent: boolean;
    ipAddress?: string;
    userAgent?: string;
    timestamp: Timestamp;
}
/**
 * Patient flag appeal/dispute
 */
export interface PatientFlagAppeal {
    id: string;
    flagId: string;
    patientId: string;
    reason: string;
    evidence?: string;
    submittedBy: 'patient' | 'guardian' | 'representative';
    status: 'pending' | 'under_review' | 'approved' | 'rejected';
    reviewedBy?: string;
    reviewedAt?: Timestamp;
    reviewNotes?: string;
    decision: 'flag_removed' | 'flag_modified' | 'appeal_denied';
    decisionReason?: string;
    submittedAt: Timestamp;
    resolvedAt?: Timestamp;
}
/**
 * GDPR compliance data for patient flags
 */
export interface PatientFlagGDPRData {
    patientId: string;
    consentToFlagging: boolean;
    consentDate?: Timestamp;
    consentWithdrawn: boolean;
    withdrawalDate?: Timestamp;
    dataAccessRequests: {
        requestDate: Timestamp;
        fulfilledDate?: Timestamp;
        requestType: 'access' | 'rectification' | 'erasure' | 'portability';
    }[];
    erasureRequested: boolean;
    erasureDate?: Timestamp;
    erasureReason?: string;
    legalBasis: 'legitimate_interest' | 'consent' | 'contract' | 'legal_obligation';
    retentionExpiry: Timestamp;
    autoDeleteScheduled: boolean;
    createdAt: Timestamp;
    lastUpdated: Timestamp;
}
/**
 * Real-time flag event for UI updates
 */
export interface FlagEvent {
    type: 'flag_created' | 'flag_updated' | 'flag_resolved' | 'alert_created';
    flagId?: string;
    alertId?: string;
    patientId: string;
    doctorId: string;
    data: Record<string, unknown>;
    timestamp: Timestamp;
}
/**
 * Validation result for flagging operations
 */
export interface FlaggingValidationResult {
    valid: boolean;
    canFlag: boolean;
    gdprCompliant: boolean;
    errors: string[];
    warnings: string[];
}
/**
 * Patient flag display configuration for UI
 */
export interface FlagDisplayConfig {
    showInPatientList: boolean;
    showInAppointmentView: boolean;
    showInCalendar: boolean;
    highlightColor: string;
    flagIconColor: string;
    showFlagCount: boolean;
    showSeverityIndicator: boolean;
    showFlagReason: boolean;
    showLastFlagDate: boolean;
    allowFlagHistory: boolean;
    restrictSensitiveFlags: boolean;
    requireConfirmationForAccess: boolean;
}
/**
 * Notification template data for flagging alerts
 */
export interface FlaggingNotificationData {
    doctorName: string;
    patientName: string;
    flagReason: string;
    flagSeverity: FlagSeverity;
    appointmentDateTime?: string;
    flagCount: number;
    clinicName: string;
    actionRequired?: string;
    flagId: string;
}
