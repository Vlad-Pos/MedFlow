/**
 * Patient Reports Service for MedFlow
 *
 * Comprehensive Firebase service for patient consultation reports with:
 * - Full CRUD operations with real-time updates
 * - Draft and final state management
 * - Comprehensive audit logging
 * - GDPR-compliant data handling
 * - Romanian health data regulation compliance
 * - Voice transcription integration
 * - Template management
 *
 * @author MedFlow Team
 * @version 1.0
 * @compliance GDPR, Romanian Health Data Regulations
 */
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { PatientReport, ReportFormData, ReportFilters, ReportSummary, ReportStatistics, ReportTemplate, ReportValidation } from '../types/patientReports';
/**
 * Validates report data according to medical and regulatory standards
 */
export declare function validateReportData(data: Partial<ReportFormData>): ReportValidation;
/**
 * Creates a new patient report (draft state)
 */
export declare function createReport(appointmentId: string, userId: string, doctorName: string, patientId: string, patientName: string, formData: ReportFormData, templateId?: string): Promise<string>;
/**
 * Updates an existing report
 */
export declare function updateReport(reportId: string, formData: Partial<ReportFormData>, userId: string, userRole?: 'doctor' | 'nurse'): Promise<void>;
/**
 * Finalizes a report (changes status from draft to final)
 */
export declare function finalizeReport(reportId: string, userId: string, userRole?: 'doctor' | 'nurse'): Promise<void>;
/**
 * Gets a report by ID
 */
export declare function getReport(reportId: string): Promise<PatientReport | null>;
/**
 * Gets reports for a specific appointment
 */
export declare function getReportsByAppointment(appointmentId: string): Promise<PatientReport[]>;
/**
 * Gets reports for a specific doctor with filtering and pagination
 */
export declare function getReportsByDoctor(userId: string, filters?: ReportFilters, limitCount?: number, lastDoc?: QueryDocumentSnapshot<DocumentData>): Promise<{
    reports: ReportSummary[];
    hasMore: boolean;
    lastDoc?: QueryDocumentSnapshot<DocumentData>;
}>;
/**
 * Subscribes to real-time updates for reports
 */
export declare function subscribeToReports(userId: string, callback: (reports: PatientReport[]) => void, filters?: ReportFilters): () => void;
/**
 * Deletes a report (only for drafts, archived reports cannot be deleted)
 */
export declare function deleteReport(reportId: string, userId: string, userRole?: 'doctor' | 'nurse'): Promise<void>;
/**
 * Gets available report templates for a doctor
 */
export declare function getReportTemplates(userId: string): Promise<ReportTemplate[]>;
/**
 * Gets report statistics for a doctor
 */
export declare function getReportStatistics(userId: string): Promise<ReportStatistics>;
