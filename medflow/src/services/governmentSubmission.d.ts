/**
 * Government Submission Service for MedFlow
 *
 * Secure, automated submission system for monthly patient reports to Romanian government health agency:
 * - Automated submission workflow with scheduling
 * - Secure transmission with encryption and authentication
 * - Robust retry mechanism with exponential backoff
 * - Comprehensive audit logging for compliance
 * - GDPR and Romanian health data compliance
 * - Real-time status tracking and notifications
 *
 * @author MedFlow Team
 * @version 1.0
 * @compliance GDPR, Romanian Health Data Regulations, Government API Standards
 */
import { SubmissionReceipt, SubmissionLogEntry, SubmissionStatus, SubmissionMethod, PatientReport } from '../types/patientReports';
/**
 * Checks if current date is within submission period (5th-10th of month)
 */
export declare function isWithinSubmissionPeriod(date?: Date): boolean;
/**
 * Gets next submission period dates
 */
export declare function getNextSubmissionPeriod(): {
    start: Date;
    end: Date;
};
/**
 * Queues a submission batch for government submission
 */
export declare function queueSubmissionBatch(batchId: string, submissionMethod?: SubmissionMethod, priority?: 'high' | 'normal' | 'low', scheduledAt?: Date): Promise<string>;
/**
 * Processes the submission queue
 */
export declare function processSubmissionQueue(): Promise<void>;
/**
 * Submits a batch to the government API
 */
export declare function submitBatchToGovernment(batchId: string, reports: PatientReport[], submittedBy: string): Promise<SubmissionReceipt>;
/**
 * Manually retries a failed submission
 */
export declare function retryFailedSubmission(batchId: string, userId: string, userRole?: 'doctor' | 'nurse' | 'admin'): Promise<void>;
/**
 * Gets submission status for a batch
 */
export declare function getSubmissionStatus(batchId: string): Promise<{
    status: SubmissionStatus;
    submissionLog: SubmissionLogEntry[];
    receipt?: SubmissionReceipt;
    nextRetryAt?: Date;
}>;
/**
 * Subscribes to submission status updates
 */
export declare function subscribeToSubmissionUpdates(batchId: string, callback: (status: SubmissionStatus, logEntry?: SubmissionLogEntry) => void): () => void;
/**
 * Schedules automatic submission for eligible batches
 */
export declare function scheduleAutomaticSubmission(): Promise<void>;
/**
 * Gets submission statistics for monitoring
 */
export declare function getSubmissionStatistics(): Promise<{
    totalBatches: number;
    pendingSubmissions: number;
    successfulSubmissions: number;
    failedSubmissions: number;
    retryingSubmissions: number;
    averageSubmissionTime: number;
}>;
/**
 * Starts the automatic submission scheduler
 */
export declare function startSubmissionScheduler(): void;
/**
 * Stops the automatic submission scheduler
 */
export declare function stopSubmissionScheduler(): void;
