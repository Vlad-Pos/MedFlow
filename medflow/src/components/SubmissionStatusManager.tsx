/**
 * Submission Status Manager Component for MedFlow
 * 
 * Comprehensive interface for monitoring and managing government submissions:
 * - Real-time submission status monitoring
 * - Manual retry capabilities for failed submissions
 * - Submission receipts and confirmation tracking
 * - Comprehensive audit log viewing
 * - Automated submission scheduling
 * 
 * @author MedFlow Team
 * @version 1.0
 */

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Eye,
  Calendar,
  FileText,
  Activity,
  Zap,
  Shield,
  Server,
  Timer,
  Settings,
  Play,
  Pause,
  RotateCcw,
  AlertOctagon,
  CheckSquare,
  Info
} from 'lucide-react'
import {
  SubmissionBatch,
  SubmissionReceipt,
  SubmissionLogEntry,
  SubmissionStatus,
  SubmissionQueue
} from '../types/patientReports'
import {
  getSubmissionStatus,
  subscribeToSubmissionUpdates,
  retryFailedSubmission,
  queueSubmissionBatch,
  getSubmissionStatistics,
  isWithinSubmissionPeriod,
  getNextSubmissionPeriod,
  scheduleAutomaticSubmission,
  processSubmissionQueue
} from '../services/governmentSubmission'
import { useAuth } from '../providers/AuthProvider'
import LoadingSpinner from './LoadingSpinner'
import { showNotification } from './Notification'
import { ConfirmationDialog } from './ConfirmationDialog'
import { formatDateTime } from '../utils/dateUtils'

interface SubmissionStatusManagerProps {
  batchId?: string
  onClose?: () => void
  showFullInterface?: boolean
}

interface SubmissionStats {
  totalBatches: number
  pendingSubmissions: number
  successfulSubmissions: number
  failedSubmissions: number
  retryingSubmissions: number
  averageSubmissionTime: number
}

export default function SubmissionStatusManager({
  batchId,
  onClose,
  showFullInterface = true
}: SubmissionStatusManagerProps) {
  const { user } = useAuth()
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('not_ready')
  const [submissionLog, setSubmissionLog] = useState<SubmissionLogEntry[]>([])
  const [receipt, setReceipt] = useState<SubmissionReceipt | undefined>()
  const [nextRetryAt, setNextRetryAt] = useState<Date | undefined>()
  const [isLoading, setIsLoading] = useState(true)
  const [isRetrying, setIsRetrying] = useState(false)
  const [submissionStats, setSubmissionStats] = useState<SubmissionStats | null>(null)
  const [isWithinPeriod, setIsWithinPeriod] = useState(false)
  const [nextPeriod, setNextPeriod] = useState<{ start: Date; end: Date } | null>(null)
  const [expandedLogEntry, setExpandedLogEntry] = useState<string | null>(null)

  // Dialog states
  const [retryDialog, setRetryDialog] = useState<{
    isOpen: boolean
    loading: boolean
  }>({
    isOpen: false,
    loading: false
  })

  const [scheduleDialog, setScheduleDialog] = useState<{
    isOpen: boolean
    loading: boolean
  }>({
    isOpen: false,
    loading: false
  })

  // Load submission data
  const loadSubmissionData = useCallback(async () => {
    if (!batchId) return

    try {
      setIsLoading(true)
      const statusData = await getSubmissionStatus(batchId)
      
      setSubmissionStatus(statusData.status)
      setSubmissionLog(statusData.submissionLog)
      setReceipt(statusData.receipt)
      setNextRetryAt(statusData.nextRetryAt)
    } catch (error) {
      console.error('Error loading submission data:', error)
      showNotification('Eroare la încărcarea datelor de trimitere', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [batchId])

  // Load statistics
  const loadStatistics = useCallback(async () => {
    try {
      const stats = await getSubmissionStatistics()
      setSubmissionStats(stats)
    } catch (error) {
      console.error('Error loading statistics:', error)
    }
  }, [])

  // Check submission period
  useEffect(() => {
    const checkPeriod = () => {
      setIsWithinPeriod(isWithinSubmissionPeriod())
      setNextPeriod(getNextSubmissionPeriod())
    }

    checkPeriod()
    const interval = setInterval(checkPeriod, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [])

  // Load data on mount
  useEffect(() => {
    loadSubmissionData()
    if (showFullInterface) {
      loadStatistics()
    }
  }, [loadSubmissionData, showFullInterface, loadStatistics])

  // Subscribe to real-time updates
  useEffect(() => {
    if (!batchId) return

    const unsubscribe = subscribeToSubmissionUpdates(batchId, (status, logEntry) => {
      setSubmissionStatus(status)
      
      if (logEntry) {
        setSubmissionLog(prev => [...prev, logEntry])
      }
      
      // Reload full data on status change
      loadSubmissionData()
    })

    return unsubscribe
  }, [batchId, loadSubmissionData])

  const handleManualRetry = async () => {
    if (!batchId || !user) return

    setRetryDialog(prev => ({ ...prev, loading: true }))

    try {
      await retryFailedSubmission(batchId, user.uid, 'doctor')
      showNotification('Reîncercarea a fost inițiată cu succes', 'success')
      setRetryDialog({ isOpen: false, loading: false })
      loadSubmissionData()
    } catch (error) {
      console.error('Error retrying submission:', error)
      showNotification('Eroare la reîncercarea trimiterii', 'error')
      setRetryDialog(prev => ({ ...prev, loading: false }))
    }
  }

  const handleScheduleAutoSubmission = async () => {
    setScheduleDialog(prev => ({ ...prev, loading: true }))

    try {
      await scheduleAutomaticSubmission()
      await processSubmissionQueue()
      showNotification('Trimiterea automată a fost programată cu succes', 'success')
      setScheduleDialog({ isOpen: false, loading: false })
      loadStatistics()
    } catch (error) {
      console.error('Error scheduling submission:', error)
      showNotification('Eroare la programarea trimiterii automate', 'error')
      setScheduleDialog(prev => ({ ...prev, loading: false }))
    }
  }

  const getStatusIcon = (status: SubmissionStatus) => {
    switch (status) {
      case 'not_ready': return <Clock className="w-5 h-5 text-gray-500" />
      case 'ready': return <CheckSquare className="w-5 h-5 text-blue-500" />
      case 'queued': return <Timer className="w-5 h-5 text-orange-500" />
      case 'submitting': return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
      case 'submitted': return <Send className="w-5 h-5 text-green-500" />
      case 'accepted': return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'rejected': return <XCircle className="w-5 h-5 text-red-500" />
      case 'failed': return <AlertOctagon className="w-5 h-5 text-red-600" />
      case 'retry_pending': return <RotateCcw className="w-5 h-5 text-yellow-500" />
      default: return <Activity className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: SubmissionStatus) => {
    switch (status) {
      case 'not_ready': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
      case 'ready': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'queued': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
      case 'submitting': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'submitted': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'accepted': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300'
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      case 'retry_pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const getStatusText = (status: SubmissionStatus) => {
    switch (status) {
      case 'not_ready': return 'Nu este pregătit'
      case 'ready': return 'Pregătit pentru trimitere'
      case 'queued': return 'În coadă'
      case 'submitting': return 'Se trimite...'
      case 'submitted': return 'Trimis'
      case 'accepted': return 'Acceptat'
      case 'rejected': return 'Respins'
      case 'failed': return 'Eșuat'
      case 'retry_pending': return 'Așteptare reîncercare'
      default: return status
    }
  }

  const getLogActionIcon = (action: SubmissionLogEntry['action']) => {
    switch (action) {
      case 'created': return <FileText className="w-4 h-4" />
      case 'queued': return <Timer className="w-4 h-4" />
      case 'submitting': return <Send className="w-4 h-4" />
      case 'submitted': return <CheckCircle className="w-4 h-4" />
      case 'accepted': return <CheckCircle className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      case 'failed': return <AlertTriangle className="w-4 h-4" />
      case 'retry_scheduled': return <Clock className="w-4 h-4" />
      case 'retry_attempted': return <RotateCcw className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const canRetry = submissionStatus === 'failed' || submissionStatus === 'retry_pending'
  const canSchedule = isWithinPeriod && (submissionStatus === 'ready' || submissionStatus === 'queued')

  if (isLoading && batchId) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Se încarcă statusul trimiterii...
          </p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header with Submission Period Status */}
      {showFullInterface && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Status Trimitere Guvern
            </h2>
            
            <div className="flex items-center space-x-3">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                isWithinPeriod 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
              }`}>
                <Calendar className="w-4 h-4" />
                <span>
                  {isWithinPeriod ? 'Perioada de trimitere activă' : 'În afara perioadei de trimitere'}
                </span>
              </div>
              
              {canSchedule && (
                <button
                  onClick={() => setScheduleDialog({ isOpen: true, loading: false })}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  <span>Programează trimiterea</span>
                </button>
              )}
            </div>
          </div>

          {/* Submission Period Info */}
          {nextPeriod && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Perioada curentă/următoare:
                </span>
                <p className="text-gray-600 dark:text-gray-400">
                  {nextPeriod.start.toLocaleDateString('ro-RO')} - {nextPeriod.end.toLocaleDateString('ro-RO')}
                </p>
              </div>
              
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Status sistem:
                </span>
                <p className="text-gray-600 dark:text-gray-400">
                  {isWithinPeriod ? 'Acceptă trimiteri' : 'Trimiterea suspendată'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Statistics Dashboard */}
      {showFullInterface && submissionStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Loturi</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {submissionStats.totalBatches}
                </p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">În așteptare</p>
                <p className="text-2xl font-bold text-orange-600">
                  {submissionStats.pendingSubmissions}
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Trimise cu succes</p>
                <p className="text-2xl font-bold text-green-600">
                  {submissionStats.successfulSubmissions}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Eșuate</p>
                <p className="text-2xl font-bold text-red-600">
                  {submissionStats.failedSubmissions}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Reîncercări</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {submissionStats.retryingSubmissions}
                </p>
              </div>
              <RotateCcw className="w-8 h-8 text-yellow-500" />
            </div>
          </motion.div>
        </div>
      )}

      {/* Individual Batch Status */}
      {batchId && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Status Lot: {batchId}
              </h3>
              
              <span className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(submissionStatus)}`}>
                {getStatusIcon(submissionStatus)}
                <span>{getStatusText(submissionStatus)}</span>
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={loadSubmissionData}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                title="Actualizează status"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              {canRetry && (
                <button
                  onClick={() => setRetryDialog({ isOpen: true, loading: false })}
                  className="flex items-center space-x-2 px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reîncearcă</span>
                </button>
              )}
            </div>
          </div>

          {/* Receipt Information */}
          {receipt && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-green-900">Confirmare Trimitere</h4>
                  <div className="mt-2 text-sm text-green-800 space-y-1">
                    <p><strong>Referință guvern:</strong> {receipt.governmentReference}</p>
                    <p><strong>ID confirmare:</strong> {receipt.confirmationId}</p>
                    <p><strong>Trimis la:</strong> {formatDateTime(receipt.submittedAt.toDate())}</p>
                    <p><strong>Număr rapoarte:</strong> {receipt.reportCount}</p>
                  </div>
                </div>
                
                <button
                  className="flex items-center space-x-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  title="Descarcă chitanța"
                >
                  <Download className="w-4 h-4" />
                  <span>Descarcă</span>
                </button>
              </div>
            </div>
          )}

          {/* Next Retry Information */}
          {nextRetryAt && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Timer className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-900">Următoarea reîncercare programată</p>
                  <p className="text-sm text-yellow-800">
                    {formatDateTime(nextRetryAt)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submission Log */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-4">Istoric Trimitere</h4>
            
            {submissionLog.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Nu există istoric pentru acest lot
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {submissionLog.map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className={`p-2 rounded-full ${
                      entry.error ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {getLogActionIcon(entry.action)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {entry.details}
                        </p>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {formatDateTime(entry.timestamp.toDate())}
                          </span>
                          
                          {entry.error && (
                            <button
                              onClick={() => setExpandedLogEntry(
                                expandedLogEntry === entry.id ? null : entry.id
                              )}
                              className="text-red-600 hover:text-red-700"
                              title="Vezi detalii eroare"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {entry.userId && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          De către: {entry.userRole === 'system' ? 'Sistem' : entry.userRole}
                        </p>
                      )}

                      {/* Expanded Error Details */}
                      <AnimatePresence>
                        {expandedLogEntry === entry.id && entry.error && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 p-3 bg-red-50 border border-red-200 rounded"
                          >
                            <div className="text-sm">
                              <p className="font-medium text-red-900">Detalii eroare:</p>
                              <p className="text-red-800 mt-1">
                                <strong>Cod:</strong> {entry.error.code}
                              </p>
                              <p className="text-red-800">
                                <strong>Mesaj:</strong> {entry.error.message}
                              </p>
                              <p className="text-red-800">
                                <strong>Recuperabil:</strong> {entry.error.recoverable ? 'Da' : 'Nu'}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual Retry Dialog */}
      <ConfirmationDialog
        isOpen={retryDialog.isOpen}
        onClose={() => setRetryDialog({ isOpen: false, loading: false })}
        onConfirm={handleManualRetry}
        title="Confirmă reîncercarea trimiterii"
        message="Ești sigur că vrei să reîncerci trimiterea acestui lot? Procesul va fi adăugat în coada de trimitere cu prioritate înaltă."
        confirmText="Reîncearcă trimiterea"
        cancelText="Anulează"
        type="warning"
        loading={retryDialog.loading}
      />

      {/* Schedule Submission Dialog */}
      <ConfirmationDialog
        isOpen={scheduleDialog.isOpen}
        onClose={() => setScheduleDialog({ isOpen: false, loading: false })}
        onConfirm={handleScheduleAutoSubmission}
        title="Programează trimiterea automată"
        message="Ești sigur că vrei să programezi trimiterea automată pentru toate loturile pregătite? Această acțiune va procesa coada de trimitere."
        confirmText="Programează trimiterea"
        cancelText="Anulează"
        type="primary"
        loading={scheduleDialog.loading}
      />
    </motion.div>
  )
}
