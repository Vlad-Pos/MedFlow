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

import { Timestamp } from 'firebase/firestore'

// ==========================================
// CORE TYPES
// ==========================================

export type ReportStatus = 'draft' | 'final' | 'archived' | 'under_review' | 'ready_for_submission' | 'submitted'
export type ReportPriority = 'low' | 'normal' | 'high' | 'urgent'
export type ValidationStatus = 'valid' | 'invalid' | 'pending'
export type AmendmentStatus = 'none' | 'pending' | 'approved' | 'rejected'
export type SubmissionStatus = 'not_ready' | 'ready' | 'queued' | 'submitting' | 'submitted' | 'accepted' | 'rejected' | 'failed' | 'retry_pending'
export type SubmissionMethod = 'automatic' | 'manual' | 'retry'
export type GovernmentApiMethod = 'api_key' | 'oauth' | 'form_based'

// ==========================================
// MEDICAL DATA STRUCTURES
// ==========================================

export interface MedicalDiagnosis {
  primary: string // Primary diagnosis (ICD-10 code recommended)
  secondary?: string[] // Secondary diagnoses
  differential?: string[] // Differential diagnoses
  confidence: 'low' | 'medium' | 'high' // Diagnostic confidence
  notes?: string // Additional diagnostic notes
}

export interface PrescribedMedication {
  id: string // Unique medication ID
  name: string // Medication name
  dosage: string // Dosage (e.g., "500mg")
  frequency: string // Frequency (e.g., "2x daily")
  duration: string // Duration (e.g., "7 days")
  instructions: string // Special instructions
  activeIngredient?: string // Active ingredient
  contraindications?: string[] // Known contraindications
  sideEffects?: string[] // Potential side effects
}

export interface TreatmentPlan {
  immediate: string[] // Immediate treatment steps
  followUp: string[] // Follow-up care instructions
  lifestyle?: string[] // Lifestyle recommendations
  referrals?: string[] // Specialist referrals
  nextAppointment?: Date // Next appointment date
  estimatedRecovery?: string // Estimated recovery time
}

export interface VitalSigns {
  bloodPressure?: string // e.g., "120/80 mmHg"
  heartRate?: number // beats per minute
  temperature?: number // Celsius
  weight?: number // kg
  height?: number // cm
  oxygenSaturation?: number // percentage
  respiratoryRate?: number // breaths per minute
  notes?: string // Additional notes
}

export interface PhysicalExamination {
  general: string // General appearance and condition
  systems: {
    cardiovascular?: string
    respiratory?: string
    neurological?: string
    gastrointestinal?: string
    musculoskeletal?: string
    dermatological?: string
    other?: Record<string, string>
  }
  abnormalFindings?: string[] // List of abnormal findings
  notes?: string // Additional examination notes
}

// ==========================================
// VALIDATION STRUCTURE
// ==========================================

export interface ReportValidation {
  status: ValidationStatus
  errors: string[] // List of validation errors
  warnings: string[] // List of validation warnings
  missingFields: string[] // Required fields that are missing
  lastValidated: Timestamp // Last validation timestamp
  validatedBy?: string // System or user who validated
}

// ==========================================
// AUDIT TRAIL & VERSIONING
// ==========================================

export interface AuditEntry {
  id: string
  timestamp: Timestamp
  action: 'created' | 'updated' | 'finalized' | 'archived' | 'viewed' | 'printed' | 'exported' | 'amended' | 'reviewed' | 'approved' | 'submitted'
  userId: string // User who performed the action
  userRole: 'doctor' | 'nurse' | 'admin'
  changes?: Record<string, { from: unknown; to: unknown }> // What changed
  metadata?: Record<string, unknown> // Additional metadata
  ipAddress?: string // User's IP address
  userAgent?: string // Browser/device information
  amendmentReason?: string // Reason for amendment
  reviewComments?: string // Review comments
}

export interface ReportVersion {
  id: string
  versionNumber: number
  timestamp: Timestamp
  createdBy: string
  createdByRole: 'doctor' | 'nurse' | 'admin'
  changes: Record<string, { from: unknown; to: unknown }>
  reason: string
  isActive: boolean
  parentVersionId?: string
}

export interface AmendmentRequest {
  id: string
  reportId: string
  requestedBy: string
  requestedByRole: 'doctor' | 'nurse' | 'admin'
  requestDate: Timestamp
  reason: string
  proposedChanges: Record<string, unknown>
  status: AmendmentStatus
  reviewedBy?: string
  reviewedByRole?: 'doctor' | 'nurse' | 'admin'
  reviewDate?: Timestamp
  reviewComments?: string
  deadline?: Timestamp
}

// ==========================================
// QUICK INPUT FEATURES
// ==========================================

export interface ReportTemplate {
  id: string
  name: string
  category: 'general' | 'specialty' | 'emergency' | 'routine'
  specialty?: string // Medical specialty (e.g., "cardiology", "dermatology")
  template: {
    diagnosis?: Partial<MedicalDiagnosis>
    examination?: Partial<PhysicalExamination>
    treatment?: Partial<TreatmentPlan>
    notes?: string
  }
  isPublic: boolean // Available to all doctors or private
  createdBy: string // Doctor who created the template
  usage: number // How many times this template was used
  tags: string[] // Searchable tags
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface VoiceTranscription {
  id: string
  reportId: string
  audioUrl?: string // Optional: store audio file
  transcript: string // Transcribed text
  confidence: number // Transcription confidence (0-1)
  language: 'ro' | 'en' // Romanian or English
  processingStatus: 'pending' | 'completed' | 'failed'
  createdAt: Timestamp
  processedAt?: Timestamp
}

// ==========================================
// MAIN REPORT STRUCTURE
// ==========================================

export interface PatientReport {
  // ===== CORE IDENTIFICATION =====
  id: string
  appointmentId: string // Link to appointment
  patientId: string // Patient identifier (email or unique ID)
  patientName: string // Patient full name
  doctorId: string // Doctor who created the report
  doctorName: string // Doctor full name
  
  // ===== STATUS & WORKFLOW =====
  status: ReportStatus
  priority: ReportPriority
  version: number // Version control for edits
  
  // ===== MEDICAL CONTENT =====
  patientComplaint: string // Chief complaint from patient
  historyPresent: string // History of present illness
  historyPast?: string // Past medical history
  allergies?: string[] // Known allergies
  medications?: string[] // Current medications
  
  vitalSigns?: VitalSigns // Measured vital signs
  physicalExamination: PhysicalExamination // Physical exam findings
  diagnosis: MedicalDiagnosis // Medical diagnosis
  prescribedMedications: PrescribedMedication[] // Prescribed medications
  treatmentPlan: TreatmentPlan // Treatment plan
  
  additionalNotes?: string // Any additional notes
  recommendations?: string[] // Recommendations for patient
  followUpInstructions?: string // Follow-up care instructions
  
  // ===== METADATA =====
  createdAt: Timestamp
  updatedAt: Timestamp
  finalizedAt?: Timestamp // When report was finalized
  archivedAt?: Timestamp // When report was archived
  
  // ===== VALIDATION & QUALITY =====
  validation: ReportValidation
  
  // ===== AUDIT & COMPLIANCE =====
  auditTrail: AuditEntry[] // Complete audit trail
  
  // ===== VERSIONING & AMENDMENTS =====
  currentVersion: number // Current version number
  versions?: ReportVersion[] // Version history
  amendmentStatus: AmendmentStatus // Amendment status
  amendmentRequests?: string[] // IDs of amendment requests
  
  // ===== SUBMISSION & REVIEW =====
  submissionStatus: SubmissionStatus // Government submission status
  reviewedBy?: string // Doctor who reviewed for submission
  reviewedAt?: Timestamp // When reviewed for submission
  submittedAt?: Timestamp // When submitted to government
  submissionDeadline?: Timestamp // Deadline for submission
  governmentReference?: string // Government submission reference
  
  // ===== MONTHLY AGGREGATION =====
  reportMonth: string // YYYY-MM format for easy aggregation
  reportYear: number // Year for aggregation
  isReadyForSubmission: boolean // Ready for government submission
  submissionBatch?: string // Batch ID for group submission
  
  // ===== QUICK INPUT FEATURES =====
  templateId?: string // Template used to create report
  voiceTranscriptions?: string[] // IDs of voice transcriptions
  
  // ===== FUTURE EXTENSIBILITY =====
  aiAnalysis?: {
    enabled: boolean
    riskAssessment?: string
    drugInteractions?: string[]
    suggestions?: string[]
    confidence?: number
  }
  
  // ===== GDPR COMPLIANCE =====
  gdprConsent: {
    obtained: boolean
    timestamp: Timestamp
    consentText: string
    patientSignature?: string // Digital signature if available
  }
  
  // ===== SECURITY =====
  encryptionMetadata?: {
    encrypted: boolean
    algorithm?: string
    keyVersion?: string
  }
}

// ==========================================
// FILTER & SEARCH TYPES
// ==========================================

export interface ReportFilters {
  status?: ReportStatus[]
  priority?: ReportPriority[]
  doctorId?: string
  patientName?: string
  dateRange?: {
    start: Date
    end: Date
  }
  diagnosis?: string
  hasFollowUp?: boolean
  submissionStatus?: SubmissionStatus[]
  amendmentStatus?: AmendmentStatus[]
  isReadyForSubmission?: boolean
  reportMonth?: string // YYYY-MM format
  reportYear?: number
}

export interface MonthlyReportFilters extends ReportFilters {
  month: string // YYYY-MM format - required for monthly views
  includeSubmitted?: boolean
  needsReview?: boolean
  hasAmendments?: boolean
}

export interface ReportSearchQuery {
  query: string
  filters?: ReportFilters
  sortBy?: 'date' | 'priority' | 'patient' | 'status'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

// ==========================================
// API RESPONSE TYPES
// ==========================================

export interface ReportSummary {
  id: string
  appointmentId: string
  patientName: string
  diagnosis: string
  status: ReportStatus
  priority: ReportPriority
  createdAt: Timestamp
  updatedAt: Timestamp
  doctorName: string
}

export interface ReportStatistics {
  total: number
  byStatus: Record<ReportStatus, number>
  byPriority: Record<ReportPriority, number>
  avgCompletionTime: number // Average time to finalize (in hours)
  pendingDrafts: number
  overdueReports: number
  bySubmissionStatus?: Record<SubmissionStatus, number>
  readyForSubmission?: number
  needingReview?: number
  withAmendments?: number
}

export interface MonthlyReportSummary {
  month: string // YYYY-MM format
  totalReports: number
  finalizedReports: number
  readyForSubmission: number
  submittedReports: number
  pendingAmendments: number
  overdueReviews: number
  submissionDeadline?: Date
  completionRate: number // Percentage of finalized reports
  reviewProgress: number // Percentage reviewed for submission
  lastUpdated: Timestamp
}

export interface SubmissionBatch {
  id: string
  month: string // YYYY-MM format
  createdBy: string
  createdAt: Timestamp
  reportIds: string[]
  status: 'preparing' | 'ready' | 'queued' | 'submitting' | 'submitted' | 'accepted' | 'rejected' | 'failed' | 'retry_pending'
  submittedAt?: Timestamp
  submissionMethod: SubmissionMethod
  governmentReference?: string
  confirmationId?: string
  notes?: string
  rejectionReason?: string
  
  // Retry and error handling
  retryCount: number
  lastRetryAt?: Timestamp
  maxRetries: number
  nextRetryAt?: Timestamp
  
  // Submission details
  submissionUrl?: string
  submissionData?: Record<string, unknown>
  encryptionDetails?: {
    algorithm: string
    keyVersion: string
    checksum: string
  }
  
  // Audit and compliance
  submissionLog: SubmissionLogEntry[]
  gdprCompliant: boolean
  dataAnonymized: boolean
}

export interface SubmissionLogEntry {
  id: string
  timestamp: Timestamp
  action: 'created' | 'queued' | 'submitting' | 'submitted' | 'accepted' | 'rejected' | 'failed' | 'retry_scheduled' | 'retry_attempted' | 'cancelled'
  status: SubmissionStatus
  details: string
  error?: {
    code: string
    message: string
    stack?: string
    recoverable: boolean
  }
  userId?: string
  userRole?: 'doctor' | 'nurse' | 'admin' | 'system'
  metadata?: Record<string, unknown>
}

export interface GovernmentSubmissionConfig {
  apiUrl: string
  authMethod: GovernmentApiMethod
  credentials: {
    apiKey?: string
    clientId?: string
    clientSecret?: string
    username?: string
    password?: string
  }
  submitEndpoint: string
  statusEndpoint: string
  maxRetries: number
  retryDelayMs: number
  timeoutMs: number
  submissionPeriod: {
    startDay: number // 5th
    endDay: number   // 10th
  }
  requiredFields: string[]
  dataFormat: 'json' | 'xml' | 'form'
  encryptionRequired: boolean
}

export interface SubmissionQueue {
  id: string
  batchId: string
  priority: 'high' | 'normal' | 'low'
  scheduledAt: Timestamp
  createdAt: Timestamp
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  retryCount: number
  lastError?: string
  lockExpiry?: Timestamp
  processedBy?: string
}

export interface SubmissionReceipt {
  id: string
  batchId: string
  submissionId: string
  governmentReference: string
  confirmationId: string
  submittedAt: Timestamp
  submittedBy: string
  reportCount: number
  checksum: string
  status: 'received' | 'processing' | 'accepted' | 'rejected'
  receiptData: Record<string, unknown>
}

// ==========================================
// FORM DATA TYPES
// ==========================================

export interface ReportFormData {
  patientComplaint: string
  historyPresent: string
  historyPast?: string
  allergies?: string[]
  currentMedications?: string[]
  
  vitalSigns?: Partial<VitalSigns>
  physicalExamination: Partial<PhysicalExamination>
  diagnosis: Partial<MedicalDiagnosis>
  prescribedMedications: Partial<PrescribedMedication>[]
  treatmentPlan: Partial<TreatmentPlan>
  
  additionalNotes?: string
  recommendations?: string[]
  followUpInstructions?: string
  priority: ReportPriority
}

// ==========================================
// ERROR TYPES
// ==========================================

export interface ReportError {
  code: string
  message: string
  field?: string
  severity: 'error' | 'warning'
}

export class ReportValidationError extends Error {
  public errors: ReportError[]
  
  constructor(errors: ReportError[]) {
    super(`Report validation failed: ${errors.length} error(s)`)
    this.errors = errors
    this.name = 'ReportValidationError'
  }
}
