/**
 * Monthly Reports Aggregation Service for MedFlow
 *
 * Comprehensive service for monthly report aggregation, review, and amendment with:
 * - Monthly report aggregation and filtering
 * - Amendment workflow with version control
 * - Submission readiness management
 * - Audit trail tracking for compliance
 * - Government submission preparation
 *
 * @author MedFlow Team
 * @version 1.0
 * @compliance GDPR, Romanian Health Data Regulations
 */
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { PatientReport, MonthlyReportFilters, MonthlyReportSummary } from '../types/patientReports';
/**
 * Generates month string in YYYY-MM format
 */
export declare function getMonthString(date: Date): string;
/**
 * Gets the submission deadline for a given month
 */
export declare function getSubmissionDeadline(month: string): Date;
/**
 * Checks if a month is overdue for submission
 */
export declare function isMonthOverdue(month: string): boolean;
/**
 * Gets monthly report summary for a specific month
 */
export declare function getMonthlyReportSummary(doctorId: string, month: string): Promise<MonthlyReportSummary>;
/**
 * Gets reports for a specific month with filtering
 */
export declare function getMonthlyReports(doctorId: string, filters: MonthlyReportFilters, limitCount?: number, lastDoc?: QueryDocumentSnapshot<DocumentData>): Promise<{
    reports: PatientReport[];
    hasMore: boolean;
    lastDoc?: QueryDocumentSnapshot<DocumentData>;
}>;
/**
 * Subscribes to real-time monthly report updates
 */
export declare function subscribeToMonthlyReports(doctorId: string, month: string, callback: (reports: PatientReport[]) => void): () => void;
/**
 * Creates an amendment request for a finalized report
 */
export declare function createAmendmentRequest(reportId: string, reason: string, proposedChanges: Record<string, unknown>, requestedBy: string, userRole?: 'doctor' | 'nurse', deadline?: Date): Promise<string>;
/**
 * Processes an amendment request (approve/reject)
 */
export declare function processAmendmentRequest(requestId: string, action: 'approve' | 'reject', reviewComments: string, reviewedBy: string, userRole?: 'doctor' | 'nurse'): Promise<void>;
/**
 * Applies approved amendments to a report
 */
export declare function applyAmendments(reportId: string, amendmentRequestId: string, userId: string, userRole?: 'doctor' | 'nurse'): Promise<void>;
/**
 * Marks a report as ready for submission
 */
export declare function markReportReadyForSubmission(reportId: string, reviewedBy: string, userRole?: 'doctor' | 'nurse'): Promise<void>;
/**
 * Creates a submission batch for government submission
 */
export declare function createSubmissionBatch(month: string, reportIds: string[], createdBy: string, notes?: string): Promise<string>;
/**
 * Submits a batch to government
 */
export declare function submitBatchToGovernment(batchId: string, governmentReference: string, submittedBy: string): Promise<void>;
/**
 * Bulk approve reports for submission
 */
export declare function bulkApproveReports(reportIds: string[], reviewedBy: string, userRole?: 'doctor' | 'nurse'): Promise<void>;
/**
 * Gets available months for reporting
 */
export declare function getAvailableMonths(doctorId: string): Promise<string[]>;
