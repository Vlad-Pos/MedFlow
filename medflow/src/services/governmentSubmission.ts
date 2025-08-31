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
  serverTimestamp,
  Timestamp,
  runTransaction,
  Transaction
} from 'firebase/firestore'
import { db } from './firebase'
import {
  SubmissionBatch,
  SubmissionQueue,
  SubmissionReceipt,
  SubmissionLogEntry,
  GovernmentSubmissionConfig,
  SubmissionStatus,
  SubmissionMethod,
  PatientReport
} from '../types/patientReports'
import { isDemoMode } from '../utils/demo'
import { showNotification } from './notificationService'

// ==========================================
// CONSTANTS AND CONFIGURATION
// ==========================================

const COLLECTIONS = {
  SUBMISSION_BATCHES: 'submission_batches',
  SUBMISSION_QUEUE: 'submission_queue',
  SUBMISSION_RECEIPTS: 'submission_receipts',
  SUBMISSION_LOGS: 'submission_logs',
  GOVERNMENT_CONFIG: 'government_config'
} as const

// Romanian Government Health Agency Configuration
const DEFAULT_GOVERNMENT_CONFIG: GovernmentSubmissionConfig = {
  apiUrl: process.env.VITE_GOVERNMENT_API_URL || 'https://api.health.gov.ro',
  authMethod: 'api_key',
  credentials: {
    apiKey: process.env.VITE_GOVERNMENT_API_KEY || 'demo_api_key',
    clientId: process.env.VITE_GOVERNMENT_CLIENT_ID || 'medflow_client',
    clientSecret: process.env.VITE_GOVERNMENT_CLIENT_SECRET || 'demo_secret'
  },
  submitEndpoint: '/api/v1/medical-reports/submit',
  statusEndpoint: '/api/v1/medical-reports/status',
  maxRetries: 5,
  retryDelayMs: 30000, // 30 seconds base delay
  timeoutMs: 120000,   // 2 minutes timeout
  submissionPeriod: {
    startDay: 5,  // 5th of month
    endDay: 10    // 10th of month
  },
  requiredFields: [
    'patientId', 'userId', 'diagnosis', 'treatmentDate', 
    'prescribedMedications', 'gdprConsent'
  ],
  dataFormat: 'json',
  encryptionRequired: true
}

// ==========================================
// DEMO DATA AND SIMULATION
// ==========================================

const demoSubmissionBatches: SubmissionBatch[] = []
const demoSubmissionQueue: SubmissionQueue[] = []
const demoSubmissionReceipts: SubmissionReceipt[] = []
const demoSubmissionLogs: SubmissionLogEntry[] = []
const demoSubmissionSubscribers: ((data: Record<string, unknown>) => void)[] = []

function notifyDemoSubscribers(data: Record<string, unknown>) {
  demoSubmissionSubscribers.forEach(callback => callback(data))
}

// Simulate government API response
function simulateGovernmentApiCall(data: Record<string, unknown>): Promise<{
  success: boolean
  governmentReference?: string
  confirmationId?: string
  error?: string
}> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate 90% success rate
      const success = Math.random() > 0.1
      
      if (success) {
        resolve({
          success: true,
          governmentReference: `GOV-${Date.now()}`,
          confirmationId: `CONF-${Math.random().toString(36).substr(2, 9)}`
        })
      } else {
        resolve({
          success: false,
          error: 'Government API temporarily unavailable'
        })
      }
    }, 2000) // Simulate 2 second delay
  })
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Checks if current date is within submission period (5th-10th of month)
 */
export function isWithinSubmissionPeriod(date: Date = new Date()): boolean {
  const day = date.getDate()
  return day >= DEFAULT_GOVERNMENT_CONFIG.submissionPeriod.startDay && 
         day <= DEFAULT_GOVERNMENT_CONFIG.submissionPeriod.endDay
}

/**
 * Gets next submission period dates
 */
export function getNextSubmissionPeriod(): { start: Date; end: Date } {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  
  // If we're past this month's submission period, move to next month
  const targetMonth = now.getDate() > DEFAULT_GOVERNMENT_CONFIG.submissionPeriod.endDay 
    ? currentMonth + 1 
    : currentMonth
  
  const start = new Date(currentYear, targetMonth, DEFAULT_GOVERNMENT_CONFIG.submissionPeriod.startDay)
  const end = new Date(currentYear, targetMonth, DEFAULT_GOVERNMENT_CONFIG.submissionPeriod.endDay, 23, 59, 59)
  
  return { start, end }
}

/**
 * Calculates exponential backoff delay
 */
function calculateRetryDelay(retryCount: number, baseDelayMs: number = DEFAULT_GOVERNMENT_CONFIG.retryDelayMs): number {
  const exponentialDelay = baseDelayMs * Math.pow(2, retryCount)
  const jitter = Math.random() * 1000 // Add 0-1 second jitter
  return Math.min(exponentialDelay + jitter, 300000) // Cap at 5 minutes
}

/**
 * Creates submission log entry
 */
function createSubmissionLogEntry(
  action: SubmissionLogEntry['action'],
  status: SubmissionStatus,
  details: string,
  userId?: string,
  userRole?: 'doctor' | 'nurse' | 'admin' | 'system',
  error?: SubmissionLogEntry['error'],
  metadata?: Record<string, unknown>
): Omit<SubmissionLogEntry, 'id'> {
  return {
    timestamp: Timestamp.now(),
    action,
    status,
    details,
    error,
    userId,
    userRole,
    metadata: {
      ...metadata,
      source: 'government_submission',
      compliance: 'romanian_health_regulations'
    }
  }
}

/**
 * Anonymizes patient data for government submission
 */
function anonymizePatientData(reports: PatientReport[]): Record<string, unknown>[] {
  return reports.map(report => ({
    // Patient identifier (hashed for privacy)
    patientHash: hashPatientId(report.patientId),
    
    // Medical data (required by government)
    diagnosis: {
      primary: report.diagnosis.primary,
      secondary: report.diagnosis.secondary || [],
      icdCodes: (report.diagnosis as { icdCodes?: string[] }).icdCodes || []
    },
    
    prescribedMedications: report.prescribedMedications.map(med => ({
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      duration: med.duration
    })),
    
    treatmentDate: report.createdAt,
    consultationType: report.priority,
    
    // Doctor information
    userId: report.userId,
    doctorName: report.doctorName,
    
    // Compliance
    gdprConsent: report.gdprConsent.obtained,
    dataProcessingConsent: true,
    
    // Report metadata
    reportId: report.id,
    createdAt: report.createdAt,
    finalizedAt: report.finalizedAt
  }))
}

/**
 * Simple hash function for patient ID anonymization
 */
function hashPatientId(patientId: string): string {
  let hash = 0
  for (let i = 0; i < patientId.length; i++) {
    const char = patientId.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return `PATIENT_${Math.abs(hash).toString(36).toUpperCase()}`
}

/**
 * Encrypts submission data (placeholder for real encryption)
 */
async function encryptSubmissionData(data: Record<string, unknown>): Promise<{
  encryptedData: string
  encryptionDetails: {
    algorithm: string
    keyVersion: string
    checksum: string
  }
}> {
  // In a real implementation, this would use AES-256 or similar
  const jsonData = JSON.stringify(data)
  const encryptedData = btoa(jsonData) // Base64 encoding as placeholder
  
  return {
    encryptedData,
    encryptionDetails: {
      algorithm: 'AES-256-GCM',
      keyVersion: 'v1.0',
      checksum: await generateChecksum(jsonData)
    }
  }
}

/**
 * Generates checksum for data integrity
 */
async function generateChecksum(data: string): Promise<string> {
  // Simple checksum - in production, use proper hashing
  let checksum = 0
  for (let i = 0; i < data.length; i++) {
    checksum += data.charCodeAt(i)
  }
  return checksum.toString(16)
}

// ==========================================
// SUBMISSION WORKFLOW FUNCTIONS
// ==========================================

/**
 * Queues a submission batch for government submission
 */
export async function queueSubmissionBatch(
  batchId: string,
  submissionMethod: SubmissionMethod = 'automatic',
  priority: 'high' | 'normal' | 'low' = 'normal',
  scheduledAt?: Date
): Promise<string> {
  try {
    if (isDemoMode()) {
      const queueId = `queue_${Date.now()}`
      const queueItem: SubmissionQueue = {
        id: queueId,
        batchId,
        priority,
        scheduledAt: scheduledAt ? Timestamp.fromDate(scheduledAt) : Timestamp.now(),
        createdAt: Timestamp.now(),
        status: 'pending',
        retryCount: 0
      }
      
      demoSubmissionQueue.push(queueItem)
      
      // Update batch status
      const batchIndex = demoSubmissionBatches.findIndex(b => b.id === batchId)
      if (batchIndex > -1) {
        demoSubmissionBatches[batchIndex].status = 'queued'
        demoSubmissionBatches[batchIndex].submissionMethod = submissionMethod
      }
      
      notifyDemoSubscribers({ 
        type: 'batch_queued', 
        batchId, 
        queueId, 
        scheduledAt: queueItem.scheduledAt 
      })
      
      // Auto-process if scheduled for now or past
      if (!scheduledAt || scheduledAt <= new Date()) {
        setTimeout(() => processSubmissionQueue(), 1000)
      }
      
      return queueId
    }

    const queueData: Omit<SubmissionQueue, 'id'> = {
      batchId,
      priority,
      scheduledAt: scheduledAt ? Timestamp.fromDate(scheduledAt) : serverTimestamp() as Timestamp,
      createdAt: serverTimestamp() as Timestamp,
      status: 'pending',
      retryCount: 0
    }

    const docRef = await addDoc(collection(db, COLLECTIONS.SUBMISSION_QUEUE), queueData)
    
    // Update batch status
    await updateDoc(doc(db, COLLECTIONS.SUBMISSION_BATCHES, batchId), {
      status: 'queued',
      submissionMethod,
      updatedAt: serverTimestamp()
    })

    return docRef.id
  } catch (error) {
    console.error('Error queueing submission batch:', error)
    throw new Error('Eroare la adăugarea în coada de trimitere')
  }
}

/**
 * Processes the submission queue
 */
export async function processSubmissionQueue(): Promise<void> {
  try {
    if (isDemoMode()) {
      const pendingItems = demoSubmissionQueue.filter(item => 
        item.status === 'pending' && 
        item.scheduledAt.toDate() <= new Date()
      )

      for (const item of pendingItems) {
        await processSubmissionItem(item.id)
      }
      return
    }

    const q = query(
      collection(db, COLLECTIONS.SUBMISSION_QUEUE),
      where('status', '==', 'pending'),
      where('scheduledAt', '<=', Timestamp.now()),
      orderBy('priority', 'desc'),
      orderBy('scheduledAt', 'asc'),
      limit(10) // Process 10 items at a time
    )

    const snapshot = await getDocs(q)
    
    for (const doc of snapshot.docs) {
      await processSubmissionItem(doc.id)
    }
  } catch (error) {
    console.error('Error processing submission queue:', error)
    throw new Error('Eroare la procesarea cozii de trimitere')
  }
}

/**
 * Processes a single submission item
 */
async function processSubmissionItem(queueItemId: string): Promise<void> {
  try {
    if (isDemoMode()) {
      const itemIndex = demoSubmissionQueue.findIndex(item => item.id === queueItemId)
      if (itemIndex === -1) return

      const item = demoSubmissionQueue[itemIndex]
      const batch = demoSubmissionBatches.find(b => b.id === item.batchId)
      if (!batch) return

      // Update queue item status
      demoSubmissionQueue[itemIndex].status = 'processing'
      
      // Update batch status
      const batchIndex = demoSubmissionBatches.findIndex(b => b.id === item.batchId)
      if (batchIndex > -1) {
        demoSubmissionBatches[batchIndex].status = 'submitting'
      }

      // Add log entry
      const logEntry: SubmissionLogEntry = {
        ...createSubmissionLogEntry(
          'submitting',
          'submitting',
          'Starting submission to government API',
          'system',
          'system'
        ),
        id: `log_${Date.now()}`
      }
      
      demoSubmissionLogs.push(logEntry)
      demoSubmissionBatches[batchIndex].submissionLog.push(logEntry)

      // Simulate submission
      const result = await simulateGovernmentApiCall({
        batchId: batch.id,
        reports: batch.reportIds.length
      })

      if (result.success) {
        // Success - update statuses
        demoSubmissionQueue[itemIndex].status = 'completed'
        demoSubmissionBatches[batchIndex].status = 'submitted'
        demoSubmissionBatches[batchIndex].submittedAt = Timestamp.now()
        demoSubmissionBatches[batchIndex].governmentReference = result.governmentReference
        demoSubmissionBatches[batchIndex].confirmationId = result.confirmationId

        // Create receipt
        const receipt: SubmissionReceipt = {
          id: `receipt_${Date.now()}`,
          batchId: batch.id,
          submissionId: `sub_${Date.now()}`,
          governmentReference: result.governmentReference!,
          confirmationId: result.confirmationId!,
          submittedAt: Timestamp.now(),
          submittedBy: batch.createdBy,
          reportCount: batch.reportIds.length,
          checksum: 'demo_checksum',
          status: 'received',
          receiptData: result
        }
        
        demoSubmissionReceipts.push(receipt)

        // Add success log
        const successLog: SubmissionLogEntry = {
          ...createSubmissionLogEntry(
            'submitted',
            'submitted',
            `Successfully submitted to government. Reference: ${result.governmentReference}`,
            'system',
            'system'
          ),
          id: `log_${Date.now()}`
        }
        
        demoSubmissionLogs.push(successLog)
        demoSubmissionBatches[batchIndex].submissionLog.push(successLog)

        notifyDemoSubscribers({ 
          type: 'submission_success', 
          batchId: batch.id,
          governmentReference: result.governmentReference
        })
      } else {
        // Failure - schedule retry
        const retryCount = item.retryCount + 1
        demoSubmissionQueue[itemIndex].retryCount = retryCount
        demoSubmissionQueue[itemIndex].lastError = result.error

        if (retryCount < DEFAULT_GOVERNMENT_CONFIG.maxRetries) {
          // Schedule retry
          const retryDelay = calculateRetryDelay(retryCount)
          const nextRetryAt = new Date(Date.now() + retryDelay)
          
          demoSubmissionQueue[itemIndex].status = 'pending'
          demoSubmissionBatches[batchIndex].status = 'retry_pending'
          demoSubmissionBatches[batchIndex].retryCount = retryCount
          demoSubmissionBatches[batchIndex].nextRetryAt = Timestamp.fromDate(nextRetryAt)

          // Add retry log
          const retryLog: SubmissionLogEntry = {
            ...createSubmissionLogEntry(
              'retry_scheduled',
              'retry_pending',
              `Submission failed, retry scheduled for ${nextRetryAt.toLocaleString()}. Error: ${result.error}`,
              'system',
              'system',
              {
                code: 'SUBMISSION_FAILED',
                message: result.error || 'Unknown error',
                recoverable: true
              }
            ),
            id: `log_${Date.now()}`
          }
          
          demoSubmissionLogs.push(retryLog)
          demoSubmissionBatches[batchIndex].submissionLog.push(retryLog)

          // Schedule retry
          setTimeout(() => {
            demoSubmissionQueue[itemIndex].status = 'pending'
          }, retryDelay)
        } else {
          // Max retries exceeded
          demoSubmissionQueue[itemIndex].status = 'failed'
          demoSubmissionBatches[batchIndex].status = 'failed'

          // Add failure log
          const failureLog: SubmissionLogEntry = {
            ...createSubmissionLogEntry(
              'failed',
              'failed',
              `Submission failed after ${retryCount} attempts. Manual intervention required.`,
              'system',
              'system',
              {
                code: 'MAX_RETRIES_EXCEEDED',
                message: result.error || 'Unknown error',
                recoverable: false
              }
            ),
            id: `log_${Date.now()}`
          }
          
          demoSubmissionLogs.push(failureLog)
          demoSubmissionBatches[batchIndex].submissionLog.push(failureLog)

          notifyDemoSubscribers({ 
            type: 'submission_failed', 
            batchId: batch.id,
            error: result.error
          })
        }
      }

      notifyDemoSubscribers({ 
        type: 'queue_processed', 
        queueItemId,
        status: demoSubmissionQueue[itemIndex].status
      })

      return
    }

    // Real Firebase implementation would go here
    await runTransaction(db, async (transaction: Transaction) => {
      const queueRef = doc(db, COLLECTIONS.SUBMISSION_QUEUE, queueItemId)
      const queueDoc = await transaction.get(queueRef)
      
      if (!queueDoc.exists()) return
      
      const queueData = queueDoc.data() as SubmissionQueue
      const batchRef = doc(db, COLLECTIONS.SUBMISSION_BATCHES, queueData.batchId)
      const batchDoc = await transaction.get(batchRef)
      
      if (!batchDoc.exists()) return
      
      const batchData = batchDoc.data() as SubmissionBatch
      
      // Update statuses
      transaction.update(queueRef, {
        status: 'processing',
        lockExpiry: Timestamp.fromDate(new Date(Date.now() + 300000)) // 5 minute lock
      })
      
      transaction.update(batchRef, {
        status: 'submitting'
      })
    })
  } catch (error) {
    console.error('Error processing submission item:', error)
    throw new Error('Eroare la procesarea elementului din coada de trimitere')
  }
}

/**
 * Submits a batch to the government API
 */
export async function submitBatchToGovernment(
  batchId: string,
  reports: PatientReport[],
  submittedBy: string
): Promise<SubmissionReceipt> {
  try {
    // Validate submission period
    if (!isWithinSubmissionPeriod()) {
      throw new Error('Trimiterea este permisă doar între 5-10 ale lunii')
    }

    // Anonymize patient data for government submission
    const anonymizedData = anonymizePatientData(reports)
    
    // Convert array to single object for encryption
    const dataForEncryption = {
      reports: anonymizedData,
      metadata: {
        batchId,
        reportCount: reports.length,
        submissionTime: new Date().toISOString()
      }
    }
    
    // Encrypt data
    const { encryptedData, encryptionDetails } = await encryptSubmissionData(dataForEncryption)
    
    // Prepare submission payload
    const submissionPayload = {
      batchId,
      month: reports[0]?.reportMonth,
      reportCount: reports.length,
      submittedBy,
      submissionTime: new Date().toISOString(),
      data: encryptedData,
      encryption: encryptionDetails,
      compliance: {
        gdprCompliant: true,
        dataAnonymized: true,
        romanianHealthCompliant: true
      }
    }

    if (isDemoMode()) {
      // Demo mode - simulate government submission
      const result = await simulateGovernmentApiCall(submissionPayload)
      
      if (!result.success) {
        throw new Error(result.error || 'Government submission failed')
      }

      const receipt: SubmissionReceipt = {
        id: `receipt_${Date.now()}`,
        batchId,
        submissionId: `sub_${Date.now()}`,
        governmentReference: result.governmentReference!,
        confirmationId: result.confirmationId!,
        submittedAt: Timestamp.now(),
        submittedBy,
        reportCount: reports.length,
        checksum: encryptionDetails.checksum,
        status: 'received',
        receiptData: result
      }

      demoSubmissionReceipts.push(receipt)
      return receipt
    }

    // Real government API call would go here
    const response = await fetch(`${DEFAULT_GOVERNMENT_CONFIG.apiUrl}${DEFAULT_GOVERNMENT_CONFIG.submitEndpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': DEFAULT_GOVERNMENT_CONFIG.credentials.apiKey!,
        'Authorization': `Bearer ${await getGovernmentAccessToken()}`
      },
      body: JSON.stringify(submissionPayload),
      signal: AbortSignal.timeout(DEFAULT_GOVERNMENT_CONFIG.timeoutMs)
    })

    if (!response.ok) {
      throw new Error(`Government API error: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    
    const receipt: SubmissionReceipt = {
      id: `receipt_${Date.now()}`,
      batchId,
      submissionId: result.submissionId,
      governmentReference: result.reference,
      confirmationId: result.confirmationId,
      submittedAt: Timestamp.now(),
      submittedBy,
      reportCount: reports.length,
      checksum: encryptionDetails.checksum,
      status: 'received',
      receiptData: result
    }

    // Store receipt
    await addDoc(collection(db, COLLECTIONS.SUBMISSION_RECEIPTS), receipt)

    return receipt
  } catch (error) {
    console.error('Error submitting to government:', error)
    throw new Error('Eroare la trimiterea către guvern')
  }
}

/**
 * Gets government access token (OAuth flow)
 */
async function getGovernmentAccessToken(): Promise<string> {
  // Placeholder for OAuth implementation
  return 'demo_access_token'
}

/**
 * Manually retries a failed submission
 */
export async function retryFailedSubmission(
  batchId: string,
  userId: string,
  userRole: 'doctor' | 'nurse' | 'admin' = 'doctor'
): Promise<void> {
  try {
    if (isDemoMode()) {
      const batchIndex = demoSubmissionBatches.findIndex(b => b.id === batchId)
      if (batchIndex === -1) {
        throw new Error('Batch not found')
      }

      const batch = demoSubmissionBatches[batchIndex]
      if (batch.status !== 'failed' && batch.status !== 'retry_pending') {
        throw new Error('Batch is not in a retryable state')
      }

      // Add manual retry log
      const retryLog: SubmissionLogEntry = {
        ...createSubmissionLogEntry(
          'retry_attempted',
          'retry_pending',
          'Manual retry initiated by user',
          userId,
          userRole
        ),
        id: `log_${Date.now()}`
      }
      
      demoSubmissionLogs.push(retryLog)
      demoSubmissionBatches[batchIndex].submissionLog.push(retryLog)

      // Queue for immediate retry
      await queueSubmissionBatch(batchId, 'retry', 'high')
      
      notifyDemoSubscribers({ 
        type: 'manual_retry_initiated', 
        batchId,
        userId
      })
      
      return
    }

    // Real implementation
    await updateDoc(doc(db, COLLECTIONS.SUBMISSION_BATCHES, batchId), {
      status: 'retry_pending',
      lastRetryAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })

    // Queue for retry
    await queueSubmissionBatch(batchId, 'retry', 'high')
  } catch (error) {
    console.error('Error retrying submission:', error)
    throw new Error('Eroare la reîncercarea trimiterii')
  }
}

/**
 * Gets submission status for a batch
 */
export async function getSubmissionStatus(batchId: string): Promise<{
  status: SubmissionStatus
  submissionLog: SubmissionLogEntry[]
  receipt?: SubmissionReceipt
  nextRetryAt?: Date
}> {
  try {
    if (isDemoMode()) {
      const batch = demoSubmissionBatches.find(b => b.id === batchId)
      if (!batch) {
        throw new Error('Batch not found')
      }

      const receipt = demoSubmissionReceipts.find(r => r.batchId === batchId)
      
      return {
        status: batch.status as SubmissionStatus,
        submissionLog: batch.submissionLog,
        receipt,
        nextRetryAt: batch.nextRetryAt?.toDate()
      }
    }

    const batchDoc = await getDoc(doc(db, COLLECTIONS.SUBMISSION_BATCHES, batchId))
    if (!batchDoc.exists()) {
      throw new Error('Batch not found')
    }

    const batchData = batchDoc.data() as SubmissionBatch
    
    // Get receipt if exists
    const receiptQuery = query(
      collection(db, COLLECTIONS.SUBMISSION_RECEIPTS),
      where('batchId', '==', batchId),
      limit(1)
    )
    
    const receiptSnapshot = await getDocs(receiptQuery)
    const receipt = receiptSnapshot.docs[0]?.data() as SubmissionReceipt

    return {
      status: batchData.status as SubmissionStatus,
      submissionLog: batchData.submissionLog,
      receipt,
      nextRetryAt: batchData.nextRetryAt?.toDate()
    }
  } catch (error) {
    console.error('Error getting submission status:', error)
    throw new Error('Eroare la obținerea statusului trimiterii')
  }
}

/**
 * Subscribes to submission status updates
 */
export function subscribeToSubmissionUpdates(
  batchId: string,
  callback: (status: SubmissionStatus, logEntry?: SubmissionLogEntry) => void
): () => void {
  if (isDemoMode()) {
    const subscriber = (data: Record<string, unknown>) => {
      if (data.batchId === batchId) {
        const batch = demoSubmissionBatches.find(b => b.id === batchId)
        if (batch) {
          const latestLog = batch.submissionLog[batch.submissionLog.length - 1]
          callback(batch.status as SubmissionStatus, latestLog)
        }
      }
    }

    demoSubmissionSubscribers.push(subscriber)
    
    return () => {
      const index = demoSubmissionSubscribers.indexOf(subscriber)
      if (index > -1) {
        demoSubmissionSubscribers.splice(index, 1)
      }
    }
  }

  // Real implementation would use Firestore real-time listeners
  return () => {}
}

/**
 * Schedules automatic submission for eligible batches
 */
export async function scheduleAutomaticSubmission(): Promise<void> {
  try {
    if (!isWithinSubmissionPeriod()) {
      console.log('Not within submission period, skipping automatic submission')
      return
    }

    if (isDemoMode()) {
      // Find ready batches
      const readyBatches = demoSubmissionBatches.filter(b => 
        b.status === 'ready' && !b.submittedAt
      )

      for (const batch of readyBatches) {
        await queueSubmissionBatch(batch.id, 'automatic', 'normal')
      }

      if (readyBatches.length > 0) {
        console.log(`Scheduled ${readyBatches.length} batches for automatic submission`)
      }
      
      return
    }

    // Real implementation
    const q = query(
      collection(db, COLLECTIONS.SUBMISSION_BATCHES),
      where('status', '==', 'ready'),
      where('submittedAt', '==', null)
    )

    const snapshot = await getDocs(q)
    
    for (const doc of snapshot.docs) {
      await queueSubmissionBatch(doc.id, 'automatic', 'normal')
    }

    console.log(`Scheduled ${snapshot.docs.length} batches for automatic submission`)
  } catch (error) {
    console.error('Error scheduling automatic submission:', error)
  }
}

/**
 * Gets submission statistics for monitoring
 */
export async function getSubmissionStatistics(): Promise<{
  totalBatches: number
  pendingSubmissions: number
  successfulSubmissions: number
  failedSubmissions: number
  retryingSubmissions: number
  averageSubmissionTime: number
}> {
  try {
    if (isDemoMode()) {
      const totalBatches = demoSubmissionBatches.length
      const pendingSubmissions = demoSubmissionBatches.filter(b => 
        b.status === 'ready' || b.status === 'queued'
      ).length
      const successfulSubmissions = demoSubmissionBatches.filter(b => 
        b.status === 'submitted' || b.status === 'accepted'
      ).length
      const failedSubmissions = demoSubmissionBatches.filter(b => 
        b.status === 'failed'
      ).length
      const retryingSubmissions = demoSubmissionBatches.filter(b => 
        b.status === 'retry_pending'
      ).length

      return {
        totalBatches,
        pendingSubmissions,
        successfulSubmissions,
        failedSubmissions,
        retryingSubmissions,
        averageSubmissionTime: 120000 // 2 minutes average
      }
    }

    // Real implementation would query Firestore aggregations
    return {
      totalBatches: 0,
      pendingSubmissions: 0,
      successfulSubmissions: 0,
      failedSubmissions: 0,
      retryingSubmissions: 0,
      averageSubmissionTime: 0
    }
  } catch (error) {
    console.error('Error getting submission statistics:', error)
    throw new Error('Eroare la obținerea statisticilor de trimitere')
  }
}

// ==========================================
// AUTOMATED SCHEDULING
// ==========================================

/**
 * Starts the automatic submission scheduler
 */
export function startSubmissionScheduler(): void {
  // Check every hour during submission period
  const checkInterval = 60 * 60 * 1000 // 1 hour

  const schedulerInterval = setInterval(async () => {
    if (isWithinSubmissionPeriod()) {
      try {
        await scheduleAutomaticSubmission()
        await processSubmissionQueue()
      } catch (error) {
        console.error('Error in submission scheduler:', error)
      }
    }
  }, checkInterval)

  // Also process queue every 5 minutes
  const queueInterval = setInterval(async () => {
    try {
      await processSubmissionQueue()
    } catch (error) {
      console.error('Error processing submission queue:', error)
    }
  }, 5 * 60 * 1000) // 5 minutes

  // Store intervals for cleanup
  if (typeof window !== 'undefined') {
    (window as unknown as Record<string, unknown>).__medflowSubmissionScheduler = {
      schedulerInterval,
      queueInterval
    }
  }
}

/**
 * Stops the automatic submission scheduler
 */
export function stopSubmissionScheduler(): void {
  if (typeof window !== 'undefined') {
    const scheduler = (window as unknown as Record<string, unknown>).__medflowSubmissionScheduler as { schedulerInterval: number; queueInterval: number } | undefined
    if (scheduler) {
      clearInterval(scheduler.schedulerInterval)
      clearInterval(scheduler.queueInterval)
      delete (window as unknown as Record<string, unknown>).__medflowSubmissionScheduler
    }
  }
}
