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

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  Transaction,
  runTransaction,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore'
import { db } from './firebase'
import {
  PatientReport,
  ReportFormData,
  ReportFilters,
  ReportSummary,
  ReportStatistics,
  ReportTemplate,
  AuditEntry,
  ReportValidation,
  ReportValidationError,
  ReportStatus,
  ValidationStatus
} from '../types/patientReports'
import { isDemoMode } from '../utils/demo'

// ==========================================
// CONSTANTS
// ==========================================

const COLLECTIONS = {
  REPORTS: 'patient_reports',
  TEMPLATES: 'report_templates',
  VOICE_TRANSCRIPTIONS: 'voice_transcriptions',
  AUDIT_LOGS: 'report_audit_logs'
} as const

const VALIDATION_RULES = {
  MIN_COMPLAINT_LENGTH: 10,
  MIN_DIAGNOSIS_LENGTH: 5,
  MIN_TREATMENT_LENGTH: 10,
  MAX_TEXT_LENGTH: 5000,
  MAX_MEDICATIONS: 20,
  MAX_ALLERGIES: 50
} as const

// ==========================================
// VALIDATION FUNCTIONS
// ==========================================

/**
 * Validates report data according to medical and regulatory standards
 */
export function validateReportData(data: Partial<ReportFormData>): ReportValidation {
  const errors: string[] = []
  const warnings: string[] = []
  const missingFields: string[] = []

  // Required fields validation
  if (!data.patientComplaint?.trim()) {
    missingFields.push('patientComplaint')
    errors.push('Plângerea pacientului este obligatorie')
  } else if (data.patientComplaint.length < VALIDATION_RULES.MIN_COMPLAINT_LENGTH) {
    errors.push(`Plângerea pacientului trebuie să aibă cel puțin ${VALIDATION_RULES.MIN_COMPLAINT_LENGTH} caractere`)
  }

  if (!data.historyPresent?.trim()) {
    missingFields.push('historyPresent')
    errors.push('Istoricul bolii actuale este obligatoriu')
  }

  if (!data.physicalExamination?.general?.trim()) {
    missingFields.push('physicalExamination.general')
    errors.push('Examenul fizic general este obligatoriu')
  }

  if (!data.diagnosis?.primary?.trim()) {
    missingFields.push('diagnosis.primary')
    errors.push('Diagnosticul principal este obligatoriu')
  } else if (data.diagnosis.primary.length < VALIDATION_RULES.MIN_DIAGNOSIS_LENGTH) {
    errors.push(`Diagnosticul principal trebuie să aibă cel puțin ${VALIDATION_RULES.MIN_DIAGNOSIS_LENGTH} caractere`)
  }

  if (!data.treatmentPlan?.immediate?.length) {
    missingFields.push('treatmentPlan.immediate')
    errors.push('Planul de tratament imediat este obligatoriu')
  }

  // Length validations
  const textFields = [
    { field: 'patientComplaint', value: data.patientComplaint },
    { field: 'historyPresent', value: data.historyPresent },
    { field: 'historyPast', value: data.historyPast },
    { field: 'additionalNotes', value: data.additionalNotes }
  ]

  textFields.forEach(({ field, value }) => {
    if (value && value.length > VALIDATION_RULES.MAX_TEXT_LENGTH) {
      errors.push(`Câmpul ${field} nu poate depăși ${VALIDATION_RULES.MAX_TEXT_LENGTH} caractere`)
    }
  })

  // Medications validation
  if (data.prescribedMedications?.length) {
    if (data.prescribedMedications.length > VALIDATION_RULES.MAX_MEDICATIONS) {
      errors.push(`Nu se pot prescrie mai mult de ${VALIDATION_RULES.MAX_MEDICATIONS} medicamente`)
    }

    data.prescribedMedications.forEach((med, index) => {
      if (!med.name?.trim()) {
        errors.push(`Medicamentul ${index + 1}: Numele este obligatoriu`)
      }
      if (!med.dosage?.trim()) {
        errors.push(`Medicamentul ${index + 1}: Dozajul este obligatoriu`)
      }
      if (!med.frequency?.trim()) {
        errors.push(`Medicamentul ${index + 1}: Frecvența este obligatorie`)
      }
      if (!med.duration?.trim()) {
        errors.push(`Medicamentul ${index + 1}: Durata este obligatorie`)
      }
    })
  }

  // Allergies validation
  if (data.allergies?.length && data.allergies.length > VALIDATION_RULES.MAX_ALLERGIES) {
    errors.push(`Nu se pot specifica mai mult de ${VALIDATION_RULES.MAX_ALLERGIES} alergii`)
  }

  // Warnings for best practices
  if (!data.historyPast?.trim()) {
    warnings.push('Se recomandă completarea istoricului medical anterior')
  }

  if (!data.vitalSigns || Object.keys(data.vitalSigns).length === 0) {
    warnings.push('Se recomandă completarea semnelor vitale')
  }

  if (!data.followUpInstructions?.trim()) {
    warnings.push('Se recomandă specificarea instrucțiunilor de urmărire')
  }

  const status: ValidationStatus = errors.length > 0 ? 'invalid' : 'valid'

  return {
    status,
    errors,
    warnings,
    missingFields,
    lastValidated: Timestamp.now(),
    validatedBy: 'system'
  }
}

/**
 * Creates an audit entry for tracking report changes
 */
function createAuditEntry(
  action: AuditEntry['action'],
  userId: string,
  userRole: 'doctor' | 'nurse' | 'admin',
  changes?: Record<string, { from: unknown; to: unknown }>,
  metadata?: Record<string, unknown>
): Omit<AuditEntry, 'id'> {
  return {
    timestamp: Timestamp.now(),
    action,
    userId,
    userRole,
    changes,
    metadata
  }
}

// ==========================================
// DEMO MODE SUPPORT
// ==========================================

const demoReports: PatientReport[] = []
const demoReportSubscribers: ((reports: PatientReport[]) => void)[] = []

function notifyDemoSubscribers() {
  demoReportSubscribers.forEach(callback => callback([...demoReports]))
}

// ==========================================
// CORE REPORT OPERATIONS
// ==========================================

/**
 * Creates a new patient report (draft state)
 */
export async function createReport(
  appointmentId: string,
  doctorId: string,
  doctorName: string,
  patientId: string,
  patientName: string,
  formData: ReportFormData,
  templateId?: string
): Promise<string> {
  try {
    const validation = validateReportData(formData)
    
    const auditEntry = createAuditEntry('created', doctorId, 'doctor', undefined, {
      appointmentId,
      templateId,
      validationStatus: validation.status
    })

          const now = new Date()
      const reportMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`
      
      const reportData: Omit<PatientReport, 'id'> = {
        appointmentId,
        patientId,
        patientName,
        doctorId,
        doctorName,
        status: 'draft',
        priority: formData.priority,
        version: 1,
        
        patientComplaint: formData.patientComplaint,
        historyPresent: formData.historyPresent,
        historyPast: formData.historyPast,
        allergies: formData.allergies || [],
        medications: formData.currentMedications || [],
        
        vitalSigns: formData.vitalSigns,
        physicalExamination: {
          general: formData.physicalExamination?.general || '',
          systems: formData.physicalExamination?.systems || {}
        },
        diagnosis: {
          primary: formData.diagnosis?.primary || '',
          confidence: formData.diagnosis?.confidence || 'medium'
        },
        prescribedMedications: formData.prescribedMedications?.map((med, index) => ({
          id: `med_${Date.now()}_${index}`,
          name: med.name || '',
          dosage: med.dosage || '',
          frequency: med.frequency || '',
          duration: med.duration || '',
          instructions: med.instructions || ''
        })) || [],
        treatmentPlan: {
          immediate: formData.treatmentPlan?.immediate || [],
          followUp: formData.treatmentPlan?.followUp || []
        },
        
        additionalNotes: formData.additionalNotes,
        recommendations: formData.recommendations || [],
        followUpInstructions: formData.followUpInstructions,
        
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        
        // New monthly aggregation fields
        currentVersion: 1,
        amendmentStatus: 'none',
        submissionStatus: 'not_ready',
        reportMonth,
        reportYear: now.getFullYear(),
        isReadyForSubmission: false,
        
        validation,
        auditTrail: [{ ...auditEntry, id: `audit_${Date.now()}` }],
        
        templateId,
        
        gdprConsent: {
          obtained: true,
          timestamp: Timestamp.now(),
          consentText: 'Pacientul și-a dat consimțământul pentru procesarea datelor medicale conform GDPR.'
        }
      }

    if (isDemoMode()) {
      const reportId = `report_${Date.now()}`
      const report: PatientReport = { ...reportData, id: reportId }
      demoReports.push(report)
      notifyDemoSubscribers()
      return reportId
    }

    const docRef = await addDoc(collection(db, COLLECTIONS.REPORTS), reportData)
    return docRef.id
  } catch (error) {
    console.error('Error creating report:', error)
    throw new Error('Eroare la crearea raportului medical')
  }
}

/**
 * Updates an existing report
 */
export async function updateReport(
  reportId: string,
  formData: Partial<ReportFormData>,
  userId: string,
  userRole: 'doctor' | 'nurse' = 'doctor'
): Promise<void> {
  try {
    if (isDemoMode()) {
      const reportIndex = demoReports.findIndex(r => r.id === reportId)
      if (reportIndex === -1) {
        throw new Error('Raportul nu a fost găsit')
      }

      const existingReport = demoReports[reportIndex]
      const validation = validateReportData(formData)
      
      const auditEntry = createAuditEntry('updated', userId, userRole, undefined, {
        fieldsUpdated: Object.keys(formData),
        validationStatus: validation.status
      })

      const updatedReport = {
        ...existingReport,
        ...formData,
        version: existingReport.version + 1,
        updatedAt: Timestamp.now(),
        validation,
        auditTrail: [...existingReport.auditTrail, { ...auditEntry, id: `audit_${Date.now()}` }]
      }

      demoReports[reportIndex] = updatedReport as any
      notifyDemoSubscribers()
      return
    }

    await runTransaction(db, async (transaction: Transaction) => {
      const reportRef = doc(db, COLLECTIONS.REPORTS, reportId)
      const reportDoc = await transaction.get(reportRef)
      
      if (!reportDoc.exists()) {
        throw new Error('Raportul nu a fost găsit')
      }

      const existingData = reportDoc.data() as PatientReport
      const validation = validateReportData(formData)
      
      const auditEntry = createAuditEntry('updated', userId, userRole, undefined, {
        fieldsUpdated: Object.keys(formData),
        validationStatus: validation.status
      })

      const updateData = {
        ...formData,
        version: existingData.version + 1,
        updatedAt: serverTimestamp(),
        validation,
        auditTrail: [...existingData.auditTrail, { ...auditEntry, id: `audit_${Date.now()}` }]
      }

      transaction.update(reportRef, updateData)
    })
  } catch (error) {
    console.error('Error updating report:', error)
    throw new Error('Eroare la actualizarea raportului medical')
  }
}

/**
 * Finalizes a report (changes status from draft to final)
 */
export async function finalizeReport(
  reportId: string,
  userId: string,
  userRole: 'doctor' | 'nurse' = 'doctor'
): Promise<void> {
  try {
    if (isDemoMode()) {
      const reportIndex = demoReports.findIndex(r => r.id === reportId)
      if (reportIndex === -1) {
        throw new Error('Raportul nu a fost găsit')
      }

      const existingReport = demoReports[reportIndex]
      
      // Validate report before finalizing
      const validation = validateReportData(existingReport)
      if (validation.status === 'invalid') {
        throw new ReportValidationError(validation.errors.map(error => ({
          code: 'VALIDATION_ERROR',
          message: error,
          severity: 'error' as const
        })))
      }

      const auditEntry = createAuditEntry('finalized', userId, userRole, {
        status: { from: existingReport.status, to: 'final' }
      })

      const finalizedReport: PatientReport = {
        ...existingReport,
        status: 'final',
        finalizedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        validation: { ...validation, status: 'valid' },
        auditTrail: [...existingReport.auditTrail, { ...auditEntry, id: `audit_${Date.now()}` }]
      }

      demoReports[reportIndex] = finalizedReport
      notifyDemoSubscribers()
      return
    }

    await runTransaction(db, async (transaction: Transaction) => {
      const reportRef = doc(db, COLLECTIONS.REPORTS, reportId)
      const reportDoc = await transaction.get(reportRef)
      
      if (!reportDoc.exists()) {
        throw new Error('Raportul nu a fost găsit')
      }

      const existingData = reportDoc.data() as PatientReport
      
      // Validate report before finalizing
      const validation = validateReportData(existingData)
      if (validation.status === 'invalid') {
        throw new ReportValidationError(validation.errors.map(error => ({
          code: 'VALIDATION_ERROR',
          message: error,
          severity: 'error' as const
        })))
      }

      const auditEntry = createAuditEntry('finalized', userId, userRole, {
        status: { from: existingData.status, to: 'final' }
      })

      const updateData = {
        status: 'final' as ReportStatus,
        finalizedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        validation: { ...validation, status: 'valid' as ValidationStatus },
        auditTrail: [...existingData.auditTrail, { ...auditEntry, id: `audit_${Date.now()}` }]
      }

      transaction.update(reportRef, updateData)
    })
  } catch (error) {
    if (error instanceof ReportValidationError) {
      throw error
    }
    console.error('Error finalizing report:', error)
    throw new Error('Eroare la finalizarea raportului medical')
  }
}

/**
 * Gets a report by ID
 */
export async function getReport(reportId: string): Promise<PatientReport | null> {
  try {
    if (isDemoMode()) {
      return demoReports.find(r => r.id === reportId) || null
    }

    const reportDoc = await getDoc(doc(db, COLLECTIONS.REPORTS, reportId))
    if (!reportDoc.exists()) {
      return null
    }

    return { id: reportDoc.id, ...reportDoc.data() } as PatientReport
  } catch (error) {
    console.error('Error getting report:', error)
    throw new Error('Eroare la obținerea raportului medical')
  }
}

/**
 * Gets reports for a specific appointment
 */
export async function getReportsByAppointment(appointmentId: string): Promise<PatientReport[]> {
  try {
    if (isDemoMode()) {
      return demoReports.filter(r => r.appointmentId === appointmentId)
    }

    const q = query(
      collection(db, COLLECTIONS.REPORTS),
      where('appointmentId', '==', appointmentId),
      orderBy('createdAt', 'desc')
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PatientReport))
  } catch (error) {
    console.error('Error getting reports by appointment:', error)
    throw new Error('Eroare la obținerea rapoartelor pentru programare')
  }
}

/**
 * Gets reports for a specific doctor with filtering and pagination
 */
export async function getReportsByDoctor(
  doctorId: string,
  filters?: ReportFilters,
  limitCount: number = 50,
  lastDoc?: QueryDocumentSnapshot<DocumentData>
): Promise<{ reports: ReportSummary[]; hasMore: boolean; lastDoc?: QueryDocumentSnapshot<DocumentData> }> {
  try {
    if (isDemoMode()) {
      let filteredReports = demoReports.filter(r => r.doctorId === doctorId)
      
      // Apply filters
      if (filters) {
        if (filters.status?.length) {
          filteredReports = filteredReports.filter(r => filters.status!.includes(r.status))
        }
        if (filters.priority?.length) {
          filteredReports = filteredReports.filter(r => filters.priority!.includes(r.priority))
        }
        if (filters.patientName) {
          filteredReports = filteredReports.filter(r => 
            r.patientName.toLowerCase().includes(filters.patientName!.toLowerCase())
          )
        }
        if (filters.dateRange) {
          filteredReports = filteredReports.filter(r => {
            const reportDate = r.createdAt.toDate()
            return reportDate >= filters.dateRange!.start && reportDate <= filters.dateRange!.end
          })
        }
      }

      const summaries: ReportSummary[] = filteredReports
        .slice(0, limitCount)
        .map(r => ({
          id: r.id,
          appointmentId: r.appointmentId,
          patientName: r.patientName,
          diagnosis: r.diagnosis.primary,
          status: r.status,
          priority: r.priority,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
          doctorName: r.doctorName
        }))

      return {
        reports: summaries,
        hasMore: filteredReports.length > limitCount
      }
    }

    let q = query(
      collection(db, COLLECTIONS.REPORTS),
      where('doctorId', '==', doctorId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )

    // Apply filters
    if (filters?.status?.length) {
      q = query(q, where('status', 'in', filters.status))
    }

    if (lastDoc) {
      q = query(q, startAfter(lastDoc))
    }

    const snapshot = await getDocs(q)
    
    const reports: ReportSummary[] = snapshot.docs.map(doc => {
      const data = doc.data() as PatientReport
      return {
        id: doc.id,
        appointmentId: data.appointmentId,
        patientName: data.patientName,
        diagnosis: data.diagnosis.primary,
        status: data.status,
        priority: data.priority,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        doctorName: data.doctorName
      }
    })

    return {
      reports,
      hasMore: snapshot.docs.length === limitCount,
      lastDoc: snapshot.docs[snapshot.docs.length - 1]
    }
  } catch (error) {
    console.error('Error getting reports by doctor:', error)
    throw new Error('Eroare la obținerea rapoartelor doctorului')
  }
}

/**
 * Subscribes to real-time updates for reports
 */
export function subscribeToReports(
  doctorId: string,
  callback: (reports: PatientReport[]) => void,
  filters?: ReportFilters
): () => void {
  if (isDemoMode()) {
    demoReportSubscribers.push(callback)
    callback(demoReports.filter(r => r.doctorId === doctorId))
    
    return () => {
      const index = demoReportSubscribers.indexOf(callback)
      if (index > -1) {
        demoReportSubscribers.splice(index, 1)
      }
    }
  }

  const q = query(
    collection(db, COLLECTIONS.REPORTS),
    where('doctorId', '==', doctorId),
    orderBy('updatedAt', 'desc')
  )

  return onSnapshot(q, (snapshot) => {
    const reports = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PatientReport))
    
    callback(reports)
  }, (error) => {
    console.error('Error in reports subscription:', error)
  })
}

/**
 * Deletes a report (only for drafts, archived reports cannot be deleted)
 */
export async function deleteReport(
  reportId: string,
  userId: string,
  userRole: 'doctor' | 'nurse' = 'doctor'
): Promise<void> {
  try {
    if (isDemoMode()) {
      const reportIndex = demoReports.findIndex(r => r.id === reportId)
      if (reportIndex === -1) {
        throw new Error('Raportul nu a fost găsit')
      }

      const report = demoReports[reportIndex]
      if (report.status !== 'draft') {
        throw new Error('Doar rapoartele în stadiul de ciornă pot fi șterse')
      }

      demoReports.splice(reportIndex, 1)
      notifyDemoSubscribers()
      return
    }

    await runTransaction(db, async (transaction: Transaction) => {
      const reportRef = doc(db, COLLECTIONS.REPORTS, reportId)
      const reportDoc = await transaction.get(reportRef)
      
      if (!reportDoc.exists()) {
        throw new Error('Raportul nu a fost găsit')
      }

      const reportData = reportDoc.data() as PatientReport
      if (reportData.status !== 'draft') {
        throw new Error('Doar rapoartele în stadiul de ciornă pot fi șterse')
      }

      transaction.delete(reportRef)
    })
  } catch (error) {
    console.error('Error deleting report:', error)
    throw new Error('Eroare la ștergerea raportului medical')
  }
}

// ==========================================
// TEMPLATE OPERATIONS
// ==========================================

/**
 * Gets available report templates for a doctor
 */
export async function getReportTemplates(doctorId: string): Promise<ReportTemplate[]> {
  try {
    if (isDemoMode()) {
      // Return demo templates
      return [
        {
          id: 'template_general',
          name: 'Consultație generală',
          category: 'general',
          template: {
            examination: {
              general: 'Pacient în stare generală bună, cooperant',
              systems: {
                cardiovascular: 'Fără particularități patologice',
                respiratory: 'Murmur vezicular prezent bilateral'
              }
            }
          },
          isPublic: true,
          createdBy: 'system',
          usage: 45,
          tags: ['general', 'routine'],
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        }
      ]
    }

    const q = query(
      collection(db, COLLECTIONS.TEMPLATES),
      where('isPublic', '==', true)
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ReportTemplate))
  } catch (error) {
    console.error('Error getting templates:', error)
    return []
  }
}

// ==========================================
// STATISTICS
// ==========================================

/**
 * Gets report statistics for a doctor
 */
export async function getReportStatistics(doctorId: string): Promise<ReportStatistics> {
  try {
    if (isDemoMode()) {
      const doctorReports = demoReports.filter(r => r.doctorId === doctorId)
      
      const byStatus = doctorReports.reduce((acc, report) => {
        acc[report.status] = (acc[report.status] || 0) + 1
        return acc
      }, {} as Record<ReportStatus, number>)

      const byPriority = doctorReports.reduce((acc, report) => {
        acc[report.priority] = (acc[report.priority] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      return {
        total: doctorReports.length,
        byStatus: { ...byStatus, draft: 0, final: 0, archived: 0, submitted: 0, under_review: 0, ready_for_submission: 0 },
        byPriority: { low: 0, normal: 0, high: 0, urgent: 0, ...byPriority },
        avgCompletionTime: 2.5, // Demo value
        pendingDrafts: byStatus.draft || 0,
        overdueReports: 0 // Demo value
      }
    }

    // Implementation for real Firebase would be here
    // For now, return demo statistics
    return {
      total: 0,
      byStatus: { draft: 0, final: 0, archived: 0, submitted: 0, under_review: 0, ready_for_submission: 0 },
      byPriority: { low: 0, normal: 0, high: 0, urgent: 0 },
      avgCompletionTime: 0,
      pendingDrafts: 0,
      overdueReports: 0
    }
  } catch (error) {
    console.error('Error getting statistics:', error)
    throw new Error('Eroare la obținerea statisticilor')
  }
}
