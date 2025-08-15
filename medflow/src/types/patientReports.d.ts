/**
 * Patient Reports Type Definitions for MedFlow
 *
 * Comprehensive type system for patient consultation reports with:
 * - Draft and final states with audit tracking
 * - GDPR-compliant data structures
 * - Romanian medical data standards
 * - Extensible design for future AI integration
 *
 * @author MedFlow Team
 * @version 1.0
 * @compliance GDPR, Romanian Health Data Regulations
 */
import { Timestamp } from 'firebase/firestore';
export type ReportStatus = 'draft' | 'final' | 'archived' | 'under_review' | 'ready_for_submission' | 'submitted';
export type ReportPriority = 'low' | 'normal' | 'high' | 'urgent';
export type ValidationStatus = 'valid' | 'invalid' | 'pending';
export type AmendmentStatus = 'none' | 'pending' | 'approved' | 'rejected';
export type SubmissionStatus = 'not_ready' | 'ready' | 'queued' | 'submitting' | 'submitted' | 'accepted' | 'rejected' | 'failed' | 'retry_pending';
export type SubmissionMethod = 'automatic' | 'manual' | 'retry';
export type GovernmentApiMethod = 'api_key' | 'oauth' | 'form_based';
export interface MedicalDiagnosis {
    primary: string;
    secondary?: string[];
    differential?: string[];
    confidence: 'low' | 'medium' | 'high';
    notes?: string;
}
export interface PrescribedMedication {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
    activeIngredient?: string;
    contraindications?: string[];
    sideEffects?: string[];
}
export interface TreatmentPlan {
    immediate: string[];
    followUp: string[];
    lifestyle?: string[];
    referrals?: string[];
    nextAppointment?: Date;
    estimatedRecovery?: string;
}
export interface VitalSigns {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
    oxygenSaturation?: number;
    respiratoryRate?: number;
    notes?: string;
}
export interface PhysicalExamination {
    general: string;
    systems: {
        cardiovascular?: string;
        respiratory?: string;
        neurological?: string;
        gastrointestinal?: string;
        musculoskeletal?: string;
        dermatological?: string;
        other?: Record<string, string>;
    };
    abnormalFindings?: string[];
    notes?: string;
}
export interface ReportValidation {
    status: ValidationStatus;
    errors: string[];
    warnings: string[];
    missingFields: string[];
    lastValidated: Timestamp;
    validatedBy?: string;
}
export interface AuditEntry {
    id: string;
    timestamp: Timestamp;
    action: 'created' | 'updated' | 'finalized' | 'archived' | 'viewed' | 'printed' | 'exported' | 'amended' | 'reviewed' | 'approved' | 'submitted';
    userId: string;
    userRole: 'doctor' | 'nurse' | 'admin';
    changes?: Record<string, {
        from: unknown;
        to: unknown;
    }>;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    amendmentReason?: string;
    reviewComments?: string;
}
export interface ReportVersion {
    id: string;
    versionNumber: number;
    timestamp: Timestamp;
    createdBy: string;
    createdByRole: 'doctor' | 'nurse' | 'admin';
    changes: Record<string, {
        from: unknown;
        to: unknown;
    }>;
    reason: string;
    isActive: boolean;
    parentVersionId?: string;
}
export interface AmendmentRequest {
    id: string;
    reportId: string;
    requestedBy: string;
    requestedByRole: 'doctor' | 'nurse' | 'admin';
    requestDate: Timestamp;
    reason: string;
    proposedChanges: Record<string, unknown>;
    status: AmendmentStatus;
    reviewedBy?: string;
    reviewedByRole?: 'doctor' | 'nurse' | 'admin';
    reviewDate?: Timestamp;
    reviewComments?: string;
    deadline?: Timestamp;
}
export interface ReportTemplate {
    id: string;
    name: string;
    category: 'general' | 'specialty' | 'emergency' | 'routine';
    specialty?: string;
    template: {
        diagnosis?: Partial<MedicalDiagnosis>;
        examination?: Partial<PhysicalExamination>;
        treatment?: Partial<TreatmentPlan>;
        notes?: string;
    };
    isPublic: boolean;
    createdBy: string;
    usage: number;
    tags: string[];
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
export interface VoiceTranscription {
    id: string;
    reportId: string;
    audioUrl?: string;
    transcript: string;
    confidence: number;
    language: 'ro' | 'en';
    processingStatus: 'pending' | 'completed' | 'failed';
    createdAt: Timestamp;
    processedAt?: Timestamp;
}
export interface PatientReport {
    id: string;
    appointmentId: string;
    patientId: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
    status: ReportStatus;
    priority: ReportPriority;
    version: number;
    patientComplaint: string;
    historyPresent: string;
    historyPast?: string;
    allergies?: string[];
    medications?: string[];
    vitalSigns?: VitalSigns;
    physicalExamination: PhysicalExamination;
    diagnosis: MedicalDiagnosis;
    prescribedMedications: PrescribedMedication[];
    treatmentPlan: TreatmentPlan;
    additionalNotes?: string;
    recommendations?: string[];
    followUpInstructions?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    finalizedAt?: Timestamp;
    archivedAt?: Timestamp;
    validation: ReportValidation;
    auditTrail: AuditEntry[];
    currentVersion: number;
    versions?: ReportVersion[];
    amendmentStatus: AmendmentStatus;
    amendmentRequests?: string[];
    submissionStatus: SubmissionStatus;
    reviewedBy?: string;
    reviewedAt?: Timestamp;
    submittedAt?: Timestamp;
    submissionDeadline?: Timestamp;
    governmentReference?: string;
    reportMonth: string;
    reportYear: number;
    isReadyForSubmission: boolean;
    submissionBatch?: string;
    templateId?: string;
    voiceTranscriptions?: string[];
    aiAnalysis?: {
        enabled: boolean;
        riskAssessment?: string;
        drugInteractions?: string[];
        suggestions?: string[];
        confidence?: number;
    };
    gdprConsent: {
        obtained: boolean;
        timestamp: Timestamp;
        consentText: string;
        patientSignature?: string;
    };
    encryptionMetadata?: {
        encrypted: boolean;
        algorithm?: string;
        keyVersion?: string;
    };
}
export interface ReportFilters {
    status?: ReportStatus[];
    priority?: ReportPriority[];
    doctorId?: string;
    patientName?: string;
    dateRange?: {
        start: Date;
        end: Date;
    };
    diagnosis?: string;
    hasFollowUp?: boolean;
    submissionStatus?: SubmissionStatus[];
    amendmentStatus?: AmendmentStatus[];
    isReadyForSubmission?: boolean;
    reportMonth?: string;
    reportYear?: number;
}
export interface MonthlyReportFilters extends ReportFilters {
    month: string;
    includeSubmitted?: boolean;
    needsReview?: boolean;
    hasAmendments?: boolean;
}
export interface ReportSearchQuery {
    query: string;
    filters?: ReportFilters;
    sortBy?: 'date' | 'priority' | 'patient' | 'status';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
}
export interface ReportSummary {
    id: string;
    appointmentId: string;
    patientName: string;
    diagnosis: string;
    status: ReportStatus;
    priority: ReportPriority;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    doctorName: string;
}
export interface ReportStatistics {
    total: number;
    byStatus: Record<ReportStatus, number>;
    byPriority: Record<ReportPriority, number>;
    avgCompletionTime: number;
    pendingDrafts: number;
    overdueReports: number;
    bySubmissionStatus?: Record<SubmissionStatus, number>;
    readyForSubmission?: number;
    needingReview?: number;
    withAmendments?: number;
}
export interface MonthlyReportSummary {
    month: string;
    totalReports: number;
    finalizedReports: number;
    readyForSubmission: number;
    submittedReports: number;
    pendingAmendments: number;
    overdueReviews: number;
    submissionDeadline?: Date;
    completionRate: number;
    reviewProgress: number;
    lastUpdated: Timestamp;
}
export interface SubmissionBatch {
    id: string;
    month: string;
    createdBy: string;
    createdAt: Timestamp;
    reportIds: string[];
    status: 'preparing' | 'ready' | 'queued' | 'submitting' | 'submitted' | 'accepted' | 'rejected' | 'failed' | 'retry_pending';
    submittedAt?: Timestamp;
    submissionMethod: SubmissionMethod;
    governmentReference?: string;
    confirmationId?: string;
    notes?: string;
    rejectionReason?: string;
    retryCount: number;
    lastRetryAt?: Timestamp;
    maxRetries: number;
    nextRetryAt?: Timestamp;
    submissionUrl?: string;
    submissionData?: Record<string, unknown>;
    encryptionDetails?: {
        algorithm: string;
        keyVersion: string;
        checksum: string;
    };
    submissionLog: SubmissionLogEntry[];
    gdprCompliant: boolean;
    dataAnonymized: boolean;
}
export interface SubmissionLogEntry {
    id: string;
    timestamp: Timestamp;
    action: 'created' | 'queued' | 'submitting' | 'submitted' | 'accepted' | 'rejected' | 'failed' | 'retry_scheduled' | 'retry_attempted' | 'cancelled';
    status: SubmissionStatus;
    details: string;
    error?: {
        code: string;
        message: string;
        stack?: string;
        recoverable: boolean;
    };
    userId?: string;
    userRole?: 'doctor' | 'nurse' | 'admin' | 'system';
    metadata?: Record<string, unknown>;
}
export interface GovernmentSubmissionConfig {
    apiUrl: string;
    authMethod: GovernmentApiMethod;
    credentials: {
        apiKey?: string;
        clientId?: string;
        clientSecret?: string;
        username?: string;
        password?: string;
    };
    submitEndpoint: string;
    statusEndpoint: string;
    maxRetries: number;
    retryDelayMs: number;
    timeoutMs: number;
    submissionPeriod: {
        startDay: number;
        endDay: number;
    };
    requiredFields: string[];
    dataFormat: 'json' | 'xml' | 'form';
    encryptionRequired: boolean;
}
export interface SubmissionQueue {
    id: string;
    batchId: string;
    priority: 'high' | 'normal' | 'low';
    scheduledAt: Timestamp;
    createdAt: Timestamp;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    retryCount: number;
    lastError?: string;
    lockExpiry?: Timestamp;
    processedBy?: string;
}
export interface SubmissionReceipt {
    id: string;
    batchId: string;
    submissionId: string;
    governmentReference: string;
    confirmationId: string;
    submittedAt: Timestamp;
    submittedBy: string;
    reportCount: number;
    checksum: string;
    status: 'received' | 'processing' | 'accepted' | 'rejected';
    receiptData: Record<string, unknown>;
}
export interface ReportFormData {
    patientComplaint: string;
    historyPresent: string;
    historyPast?: string;
    allergies?: string[];
    currentMedications?: string[];
    vitalSigns?: Partial<VitalSigns>;
    physicalExamination: Partial<PhysicalExamination>;
    diagnosis: Partial<MedicalDiagnosis>;
    prescribedMedications: Partial<PrescribedMedication>[];
    treatmentPlan: Partial<TreatmentPlan>;
    additionalNotes?: string;
    recommendations?: string[];
    followUpInstructions?: string;
    priority: ReportPriority;
}
export interface ReportError {
    code: string;
    message: string;
    field?: string;
    severity: 'error' | 'warning';
}
export declare class ReportValidationError extends Error {
    errors: ReportError[];
    constructor(errors: ReportError[]);
}
