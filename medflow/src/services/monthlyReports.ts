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

import {
  collection,
  doc,
  addDoc,
  updateDoc,
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
  writeBatch,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore'
import { db } from './firebase'
import {
  PatientReport,
  MonthlyReportFilters,
  MonthlyReportSummary,
  SubmissionBatch,
  AmendmentRequest,
  ReportVersion,
  AuditEntry,
  ReportStatus,
  SubmissionStatus,
  } from '../types/patientReports'
import { isDemoMode } from '../utils/demo'

// ==========================================
// CONSTANTS
// ==========================================

const COLLECTIONS = {
  PATIENT_REPORTS: 'patient_reports',
  MONTHLY_SUMMARIES: 'monthly_summaries',
  SUBMISSION_BATCHES: 'submission_batches',
  AMENDMENT_REQUESTS: 'amendment_requests',
  REPORT_VERSIONS: 'report_versions'
} as const

const GOVERNMENT_SUBMISSION_DEADLINE_DAY = 10 // 10th of each month

// ==========================================
// DEMO DATA
// ==========================================

const demoMonthlyReports: PatientReport[] = []
const demoAmendmentRequests: AmendmentRequest[] = []
const demoSubmissionBatches: SubmissionBatch[] = []
// Demo subscribers for development
const demoMonthlySubscribers: Array<(data: Record<string, unknown>) => void> = []

function notifyDemoSubscribers(data: Record<string, unknown>) {
  demoMonthlySubscribers.forEach(callback => callback(data))
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Generates month string in YYYY-MM format
 */
export function getMonthString(date: Date): string {
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
}

/**
 * Gets the submission deadline for a given month
 */
export function getSubmissionDeadline(month: string): Date {
  const [year, monthNum] = month.split('-').map(Number)
  // Deadline is 10th of the following month
  const deadlineDate = new Date(year, monthNum, GOVERNMENT_SUBMISSION_DEADLINE_DAY)
  return deadlineDate
}

/**
 * Checks if a month is overdue for submission
 */
export function isMonthOverdue(month: string): boolean {
  const deadline = getSubmissionDeadline(month)
  return new Date() > deadline
}

/**
 * Creates audit entry for amendment actions
 */
function createAmendmentAuditEntry(
  action: AuditEntry['action'],
  userId: string,
  userRole: 'doctor' | 'nurse' | 'admin',
  changes?: Record<string, { from: unknown; to: unknown }>,
  amendmentReason?: string,
  reviewComments?: string
): Omit<AuditEntry, 'id'> {
  return {
    timestamp: Timestamp.now(),
    action,
    userId,
    userRole,
    changes,
    amendmentReason,
    reviewComments,
    metadata: {
      source: 'monthly_review',
      compliance: 'romanian_health_regulations'
    }
  }
}

// ==========================================
// MONTHLY AGGREGATION FUNCTIONS
// ==========================================

/**
 * Gets monthly report summary for a specific month
 */
export async function getMonthlyReportSummary(
  doctorId: string,
  month: string
): Promise<MonthlyReportSummary> {
  try {
    if (isDemoMode()) {
      const monthReports = demoMonthlyReports.filter(r => 
        r.userId === doctorId && r.reportMonth === month
      )

      const totalReports = monthReports.length
      const finalizedReports = monthReports.filter(r => r.status === 'final' || r.status === 'ready_for_submission').length
      const readyForSubmission = monthReports.filter(r => r.isReadyForSubmission).length
      const submittedReports = monthReports.filter(r => r.status === 'submitted').length
      const pendingAmendments = monthReports.filter(r => r.amendmentStatus === 'pending').length

      return {
        month,
        totalReports,
        finalizedReports,
        readyForSubmission,
        submittedReports,
        pendingAmendments,
        overdueReviews: 0,
        submissionDeadline: getSubmissionDeadline(month),
        completionRate: totalReports > 0 ? (finalizedReports / totalReports) * 100 : 0,
        reviewProgress: finalizedReports > 0 ? (readyForSubmission / finalizedReports) * 100 : 0,
        lastUpdated: Timestamp.now()
      }
    }

    // Check if summary exists in cache
    const summaryDoc = await getDoc(doc(db, COLLECTIONS.MONTHLY_SUMMARIES, `${doctorId}_${month}`))
    
    if (summaryDoc.exists()) {
      const data = summaryDoc.data() as MonthlyReportSummary
      
      // Check if cache is recent (less than 1 hour old)
      const cacheAge = Date.now() - data.lastUpdated.toDate().getTime()
      if (cacheAge < 3600000) { // 1 hour
        return data
      }
    }

    // Calculate fresh summary
    const reportsQuery = query(
      collection(db, COLLECTIONS.PATIENT_REPORTS),
      where('userId', '==', doctorId),
      where('reportMonth', '==', month)
    )

    const snapshot = await getDocs(reportsQuery)
    const reports = snapshot.docs.map(doc => doc.data() as PatientReport)

    const totalReports = reports.length
    const finalizedReports = reports.filter(r => r.status === 'final' || r.status === 'ready_for_submission').length
    const readyForSubmission = reports.filter(r => r.isReadyForSubmission).length
    const submittedReports = reports.filter(r => r.status === 'submitted').length
    const pendingAmendments = reports.filter(r => r.amendmentStatus === 'pending').length
    const overdueReviews = reports.filter(r => 
      r.status === 'final' && !r.isReadyForSubmission && isMonthOverdue(month)
    ).length

    const summary: MonthlyReportSummary = {
      month,
      totalReports,
      finalizedReports,
      readyForSubmission,
      submittedReports,
      pendingAmendments,
      overdueReviews,
      submissionDeadline: getSubmissionDeadline(month),
      completionRate: totalReports > 0 ? (finalizedReports / totalReports) * 100 : 0,
      reviewProgress: finalizedReports > 0 ? (readyForSubmission / finalizedReports) * 100 : 0,
      lastUpdated: Timestamp.now()
    }

    // Cache the summary
    await updateDoc(doc(db, COLLECTIONS.MONTHLY_SUMMARIES, `${doctorId}_${month}`), summary as any)

    return summary
  } catch (error) {
    console.error('Error getting monthly summary:', error)
    throw new Error('Eroare la obținerea sumarului lunar')
  }
}

/**
 * Gets reports for a specific month with filtering
 */
export async function getMonthlyReports(
  doctorId: string,
  filters: MonthlyReportFilters,
  limitCount: number = 100,
  lastDoc?: QueryDocumentSnapshot<DocumentData>
): Promise<{ reports: PatientReport[]; hasMore: boolean; lastDoc?: QueryDocumentSnapshot<DocumentData> }> {
  try {
    if (isDemoMode()) {
      let filteredReports = demoMonthlyReports.filter(r => 
        r.userId === doctorId && r.reportMonth === filters.month
      )

      // Apply additional filters
      if (filters.status?.length) {
        filteredReports = filteredReports.filter(r => filters.status!.includes(r.status))
      }

      if (filters.submissionStatus?.length) {
        filteredReports = filteredReports.filter(r => filters.submissionStatus!.includes(r.submissionStatus))
      }

      if (filters.needsReview) {
        filteredReports = filteredReports.filter(r => 
          r.status === 'final' && !r.isReadyForSubmission
        )
      }

      if (filters.hasAmendments) {
        filteredReports = filteredReports.filter(r => 
          r.amendmentStatus !== 'none'
        )
      }

      if (!filters.includeSubmitted) {
        filteredReports = filteredReports.filter(r => r.status !== 'submitted')
      }

      return {
        reports: filteredReports.slice(0, limitCount),
        hasMore: filteredReports.length > limitCount
      }
    }

    let q = query(
      collection(db, COLLECTIONS.PATIENT_REPORTS),
      where('userId', '==', doctorId),
      where('reportMonth', '==', filters.month),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )

    // Apply status filters
    if (filters.status?.length) {
      q = query(q, where('status', 'in', filters.status))
    }

    if (lastDoc) {
      q = query(q, startAfter(lastDoc))
    }

    const snapshot = await getDocs(q)
    const reports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PatientReport))

    // Apply additional client-side filters
    let filteredReports = reports

    if (filters.needsReview) {
      filteredReports = filteredReports.filter(r => 
        r.status === 'final' && !r.isReadyForSubmission
      )
    }

    if (filters.hasAmendments) {
      filteredReports = filteredReports.filter(r => 
        r.amendmentStatus !== 'none'
      )
    }

    if (!filters.includeSubmitted) {
      filteredReports = filteredReports.filter(r => r.status !== 'submitted')
    }

    return {
      reports: filteredReports,
      hasMore: snapshot.docs.length === limitCount,
      lastDoc: snapshot.docs[snapshot.docs.length - 1]
    }
  } catch (error) {
    console.error('Error getting monthly reports:', error)
    throw new Error('Eroare la obținerea rapoartelor lunare')
  }
}

/**
 * Subscribes to real-time monthly report updates
 */
export function subscribeToMonthlyReports(
  doctorId: string,
  month: string,
  callback: (reports: PatientReport[]) => void
): () => void {
  if (isDemoMode()) {
    // Convert callback to expected type
    const wrappedCallback = (data: Record<string, unknown>) => {
      if (data.reports && Array.isArray(data.reports)) {
        callback(data.reports as PatientReport[])
      }
    }
    demoMonthlySubscribers.push(wrappedCallback)
    
    return () => {
      const index = demoMonthlySubscribers.indexOf(wrappedCallback)
      if (index > -1) {
        demoMonthlySubscribers.splice(index, 1)
      }
    }
  }

  const q = query(
    collection(db, COLLECTIONS.PATIENT_REPORTS),
    where('userId', '==', doctorId),
    where('reportMonth', '==', month),
    orderBy('updatedAt', 'desc')
  )

  return onSnapshot(q, (snapshot) => {
    const reports = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PatientReport))
    
    callback(reports)
  }, (error) => {
    console.error('Error in monthly reports subscription:', error)
  })
}

// ==========================================
// AMENDMENT FUNCTIONS
// ==========================================

/**
 * Creates an amendment request for a finalized report
 */
export async function createAmendmentRequest(
  reportId: string,
  reason: string,
  proposedChanges: Record<string, unknown>,
  requestedBy: string,
  userRole: 'doctor' | 'nurse' = 'doctor',
  deadline?: Date
): Promise<string> {
  try {
    const amendmentRequest: Omit<AmendmentRequest, 'id'> = {
      reportId,
      requestedBy,
      requestedByRole: userRole,
      requestDate: Timestamp.now(),
      reason,
      proposedChanges,
      status: 'pending',
      deadline: deadline ? Timestamp.fromDate(deadline) : undefined
    }

    if (isDemoMode()) {
      const requestId = `amendment_${Date.now()}`
      const request: AmendmentRequest = { ...amendmentRequest, id: requestId }
      demoAmendmentRequests.push(request)
      
      // Update report status
      const reportIndex = demoMonthlyReports.findIndex(r => r.id === reportId)
      if (reportIndex > -1) {
        demoMonthlyReports[reportIndex].amendmentStatus = 'pending'
        demoMonthlyReports[reportIndex].amendmentRequests = [
          ...(demoMonthlyReports[reportIndex].amendmentRequests || []),
          requestId
        ]
      }
      
      notifyDemoSubscribers({ type: 'amendment_request_created', requestId })
      return requestId
    }

    const docRef = await addDoc(collection(db, COLLECTIONS.AMENDMENT_REQUESTS), amendmentRequest)

    // Update the report to reflect pending amendment
    await updateDoc(doc(db, COLLECTIONS.PATIENT_REPORTS, reportId), {
      amendmentStatus: 'pending',
      amendmentRequests: [...(await getDoc(doc(db, COLLECTIONS.PATIENT_REPORTS, reportId))).data()?.amendmentRequests || [], docRef.id],
      updatedAt: serverTimestamp()
    })

    return docRef.id
  } catch (error) {
    console.error('Error creating amendment request:', error)
    throw new Error('Eroare la crearea cererii de amendament')
  }
}

/**
 * Processes an amendment request (approve/reject)
 */
export async function processAmendmentRequest(
  requestId: string,
  action: 'approve' | 'reject',
  reviewComments: string,
  reviewedBy: string,
  userRole: 'doctor' | 'nurse' = 'doctor'
): Promise<void> {
  try {
    if (isDemoMode()) {
      const requestIndex = demoAmendmentRequests.findIndex(r => r.id === requestId)
      if (requestIndex === -1) {
        throw new Error('Cererea de amendament nu a fost găsită')
      }

      const request = demoAmendmentRequests[requestIndex]
      demoAmendmentRequests[requestIndex] = {
        ...request,
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewedBy,
        reviewedByRole: userRole,
        reviewDate: Timestamp.now(),
        reviewComments
      }

      // Update report status
      const reportIndex = demoMonthlyReports.findIndex(r => r.id === request.reportId)
      if (reportIndex > -1) {
        demoMonthlyReports[reportIndex].amendmentStatus = action === 'approve' ? 'approved' : 'rejected'
      }

      notifyDemoSubscribers({ type: 'amendment_request_processed', requestId, action })
      return
    }

    await runTransaction(db, async (transaction: Transaction) => {
      const requestRef = doc(db, COLLECTIONS.AMENDMENT_REQUESTS, requestId)
      const requestDoc = await transaction.get(requestRef)
      
      if (!requestDoc.exists()) {
        throw new Error('Cererea de amendament nu a fost găsită')
      }

      const requestData = requestDoc.data() as AmendmentRequest
      
      // Update amendment request
      transaction.update(requestRef, {
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewedBy,
        reviewedByRole: userRole,
        reviewDate: serverTimestamp(),
        reviewComments
      })

      // Update report status
      transaction.update(doc(db, COLLECTIONS.PATIENT_REPORTS, requestData.reportId), {
        amendmentStatus: action === 'approve' ? 'approved' : 'rejected',
        updatedAt: serverTimestamp()
      })
    })
  } catch (error) {
    console.error('Error processing amendment request:', error)
    throw new Error('Eroare la procesarea cererii de amendament')
  }
}

/**
 * Applies approved amendments to a report
 */
export async function applyAmendments(
  reportId: string,
  amendmentRequestId: string,
  userId: string,
  userRole: 'doctor' | 'nurse' = 'doctor'
): Promise<void> {
  try {
    if (isDemoMode()) {
      const requestIndex = demoAmendmentRequests.findIndex(r => r.id === amendmentRequestId)
      const reportIndex = demoMonthlyReports.findIndex(r => r.id === reportId)
      
      if (requestIndex === -1 || reportIndex === -1) {
        throw new Error('Raportul sau cererea nu a fost găsită')
      }

      const request = demoAmendmentRequests[requestIndex]
      const report = demoMonthlyReports[reportIndex]

      if (request.status !== 'approved') {
        throw new Error('Doar amendamentele aprobate pot fi aplicate')
      }

      // Create version before applying changes
      const version: ReportVersion = {
        id: `version_${Date.now()}`,
        versionNumber: report.currentVersion + 1,
        timestamp: Timestamp.now(),
        createdBy: userId,
        createdByRole: userRole,
        changes: request.proposedChanges as Record<string, { from: unknown; to: unknown }>,
        reason: request.reason,
        isActive: true,
        parentVersionId: `version_${report.currentVersion}`
      }

      // Apply changes to report
      Object.keys(request.proposedChanges).forEach(key => {
        if (key in report) {
          (report as unknown as Record<string, unknown>)[key] = request.proposedChanges[key]
        }
      })

      // Update report metadata
      demoMonthlyReports[reportIndex] = {
        ...report,
        currentVersion: version.versionNumber,
        amendmentStatus: 'none',
        updatedAt: Timestamp.now(),
        versions: [...(report.versions || []), version],
        auditTrail: [
          ...report.auditTrail,
          {
            ...createAmendmentAuditEntry('amended', userId, userRole, request.proposedChanges as Record<string, { from: unknown; to: unknown }>, request.reason),
            id: `audit_${Date.now()}`
          }
        ]
      }

      // Mark amendment request as applied
      demoAmendmentRequests[requestIndex].status = 'approved'

      notifyDemoSubscribers({ type: 'amendments_applied', reportId })
      return
    }

    await runTransaction(db, async (transaction: Transaction) => {
      const reportRef = doc(db, COLLECTIONS.PATIENT_REPORTS, reportId)
      const requestRef = doc(db, COLLECTIONS.AMENDMENT_REQUESTS, amendmentRequestId)
      
      const reportDoc = await transaction.get(reportRef)
      const requestDoc = await transaction.get(requestRef)
      
      if (!reportDoc.exists() || !requestDoc.exists()) {
        throw new Error('Raportul sau cererea nu a fost găsită')
      }

      const reportData = reportDoc.data() as PatientReport
      const requestData = requestDoc.data() as AmendmentRequest

      if (requestData.status !== 'approved') {
        throw new Error('Doar amendamentele aprobate pot fi aplicate')
      }

      // Create version record
      const version: Omit<ReportVersion, 'id'> = {
        versionNumber: reportData.currentVersion + 1,
        timestamp: serverTimestamp() as Timestamp,
        createdBy: userId,
        createdByRole: userRole,
        changes: requestData.proposedChanges as Record<string, { from: unknown; to: unknown }>,
        reason: requestData.reason,
        isActive: true,
        parentVersionId: `version_${reportData.currentVersion}`
      }

      const versionRef = await addDoc(collection(db, COLLECTIONS.REPORT_VERSIONS), version)

      // Apply changes to report
      const updatedData = { ...reportData }
      Object.keys(requestData.proposedChanges).forEach(key => {
        if (key in updatedData) {
          (updatedData as Record<string, unknown>)[key] = requestData.proposedChanges[key]
        }
      })

      // Update report
      transaction.update(reportRef, {
        ...requestData.proposedChanges,
        currentVersion: reportData.currentVersion + 1,
        amendmentStatus: 'none',
        updatedAt: serverTimestamp(),
        versions: [...(reportData.versions || []), versionRef.id],
        auditTrail: [
          ...reportData.auditTrail,
          {
            ...createAmendmentAuditEntry('amended', userId, userRole, requestData.proposedChanges as Record<string, { from: unknown; to: unknown }>, requestData.reason),
            id: `audit_${Date.now()}`
          }
        ]
      })
    })
  } catch (error) {
    console.error('Error applying amendments:', error)
    throw new Error('Eroare la aplicarea amendamentelor')
  }
}

// ==========================================
// SUBMISSION MANAGEMENT FUNCTIONS
// ==========================================

/**
 * Marks a report as ready for submission
 */
export async function markReportReadyForSubmission(
  reportId: string,
  reviewedBy: string,
  userRole: 'doctor' | 'nurse' = 'doctor'
): Promise<void> {
  try {
    if (isDemoMode()) {
      const reportIndex = demoMonthlyReports.findIndex(r => r.id === reportId)
      if (reportIndex === -1) {
        throw new Error('Raportul nu a fost găsit')
      }

      demoMonthlyReports[reportIndex] = {
        ...demoMonthlyReports[reportIndex],
        isReadyForSubmission: true,
        reviewedBy,
        reviewedAt: Timestamp.now(),
        status: 'ready_for_submission' as ReportStatus,
        submissionStatus: 'ready' as SubmissionStatus,
        auditTrail: [
          ...demoMonthlyReports[reportIndex].auditTrail,
          {
            ...createAmendmentAuditEntry('reviewed', reviewedBy, userRole, undefined, undefined, 'Report approved for submission'),
            id: `audit_${Date.now()}`
          }
        ]
      }

      notifyDemoSubscribers({ type: 'report_ready_for_submission', reportId })
      return
    }

    await updateDoc(doc(db, COLLECTIONS.PATIENT_REPORTS, reportId), {
      isReadyForSubmission: true,
      reviewedBy,
      reviewedAt: serverTimestamp(),
      status: 'ready_for_submission',
      submissionStatus: 'ready',
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error marking report ready for submission:', error)
    throw new Error('Eroare la marcarea raportului pentru trimitere')
  }
}

/**
 * Creates a submission batch for government submission
 */
export async function createSubmissionBatch(
  month: string,
  reportIds: string[],
  createdBy: string,
  notes?: string
): Promise<string> {
  try {
        const batchData: Omit<SubmissionBatch, 'id'> = {
      month,
      createdBy,
      createdAt: Timestamp.now(),
      reportIds,
      status: 'preparing',
      notes,
      gdprCompliant: true,
      retryCount: 0,
      maxRetries: 3,
      submissionMethod: 'manual',
      submissionLog: [],
      dataAnonymized: false
    }

    if (isDemoMode()) {
      const batchId = `batch_${Date.now()}`
      const batch: SubmissionBatch = { ...batchData, id: batchId }
      demoSubmissionBatches.push(batch)

      // Update reports with batch ID
      reportIds.forEach(reportId => {
        const reportIndex = demoMonthlyReports.findIndex(r => r.id === reportId)
        if (reportIndex > -1) {
          demoMonthlyReports[reportIndex].submissionBatch = batchId
        }
      })

      notifyDemoSubscribers({ type: 'submission_batch_created', batchId })
      return batchId
    }

    const docRef = await addDoc(collection(db, COLLECTIONS.SUBMISSION_BATCHES), batchData)

    // Update reports with batch ID
    const batch = writeBatch(db)
    reportIds.forEach(reportId => {
      batch.update(doc(db, COLLECTIONS.PATIENT_REPORTS, reportId), {
        submissionBatch: docRef.id,
        updatedAt: serverTimestamp()
      })
    })
    await batch.commit()

    return docRef.id
  } catch (error) {
    console.error('Error creating submission batch:', error)
    throw new Error('Eroare la crearea lotului de trimitere')
  }
}

/**
 * Submits a batch to government
 */
export async function submitBatchToGovernment(
  batchId: string,
  governmentReference: string,
  submittedBy: string
): Promise<void> {
  try {
    if (isDemoMode()) {
      const batchIndex = demoSubmissionBatches.findIndex(b => b.id === batchId)
      if (batchIndex === -1) {
        throw new Error('Lotul nu a fost găsit')
      }

      const batch = demoSubmissionBatches[batchIndex]
      demoSubmissionBatches[batchIndex] = {
        ...batch,
        status: 'submitted',
        submittedAt: Timestamp.now(),
        governmentReference
      }

      // Update all reports in batch
      batch.reportIds.forEach(reportId => {
        const reportIndex = demoMonthlyReports.findIndex(r => r.id === reportId)
        if (reportIndex > -1) {
          demoMonthlyReports[reportIndex] = {
            ...demoMonthlyReports[reportIndex],
            status: 'submitted' as ReportStatus,
            submissionStatus: 'submitted' as SubmissionStatus,
            submittedAt: Timestamp.now(),
            governmentReference
          }
        }
      })

      notifyDemoSubscribers({ type: 'batch_submitted', batchId })
      return
    }

    await runTransaction(db, async (transaction: Transaction) => {
      const batchRef = doc(db, COLLECTIONS.SUBMISSION_BATCHES, batchId)
      const batchDoc = await transaction.get(batchRef)
      
      if (!batchDoc.exists()) {
        throw new Error('Lotul nu a fost găsit')
      }

      const batchData = batchDoc.data() as SubmissionBatch

      // Update batch status
      transaction.update(batchRef, {
        status: 'submitted',
        submittedAt: serverTimestamp(),
        governmentReference
      })

      // Update all reports in batch
      batchData.reportIds.forEach(reportId => {
        transaction.update(doc(db, COLLECTIONS.PATIENT_REPORTS, reportId), {
          status: 'submitted',
          submissionStatus: 'submitted',
          submittedAt: serverTimestamp(),
          governmentReference,
          updatedAt: serverTimestamp()
        })
      })
    })
  } catch (error) {
    console.error('Error submitting batch to government:', error)
    throw new Error('Eroare la trimiterea către guvern')
  }
}

// ==========================================
// BULK OPERATIONS
// ==========================================

/**
 * Bulk approve reports for submission
 */
export async function bulkApproveReports(
  reportIds: string[],
  reviewedBy: string,
  userRole: 'doctor' | 'nurse' = 'doctor'
): Promise<void> {
  try {
    if (isDemoMode()) {
      reportIds.forEach(reportId => {
        const reportIndex = demoMonthlyReports.findIndex(r => r.id === reportId)
        if (reportIndex > -1) {
          demoMonthlyReports[reportIndex] = {
            ...demoMonthlyReports[reportIndex],
            isReadyForSubmission: true,
            reviewedBy,
            reviewedAt: Timestamp.now(),
            status: 'ready_for_submission' as ReportStatus,
            submissionStatus: 'ready' as SubmissionStatus
          }
        }
      })

      notifyDemoSubscribers({ type: 'bulk_approve_completed', reportIds })
      return
    }

    const batch = writeBatch(db)
    
    reportIds.forEach(reportId => {
      batch.update(doc(db, COLLECTIONS.PATIENT_REPORTS, reportId), {
        isReadyForSubmission: true,
        reviewedBy,
        reviewedAt: serverTimestamp(),
        status: 'ready_for_submission',
        submissionStatus: 'ready',
        updatedAt: serverTimestamp()
      })
    })

    await batch.commit()
  } catch (error) {
    console.error('Error bulk approving reports:', error)
    throw new Error('Eroare la aprobarea în masă')
  }
}

/**
 * Gets available months for reporting
 */
export async function getAvailableMonths(doctorId: string): Promise<string[]> {
  try {
    if (isDemoMode()) {
      const months = Array.from(new Set(
        demoMonthlyReports
          .filter(r => r.userId === doctorId)
          .map(r => r.reportMonth)
      )).sort().reverse()
      
      return months
    }

    const q = query(
      collection(db, COLLECTIONS.PATIENT_REPORTS),
      where('userId', '==', doctorId),
      orderBy('reportMonth', 'desc')
    )

    const snapshot = await getDocs(q)
    const months = Array.from(new Set(
      snapshot.docs.map(doc => doc.data().reportMonth)
    )).filter(Boolean).sort().reverse()

    return months
  } catch (error) {
    console.error('Error getting available months:', error)
    return []
  }
}
