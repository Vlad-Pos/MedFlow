/**
 * Amendment Manager Component for MedFlow
 * 
 * Comprehensive amendment workflow management with:
 * - Create amendment requests for finalized reports
 * - Version control and change tracking
 * - Amendment approval/rejection workflow
 * - Audit trail for compliance
 * - GDPR-compliant data handling
 * 
 * @author MedFlow Team
 * @version 1.0
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Edit,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MessageSquare,
  User,
  Calendar,
  History,
  Plus,
  Eye,
  Send,
  X,
  Save,
  Undo2
} from 'lucide-react'
import {
  PatientReport,
  AmendmentRequest,
  ReportVersion,
  AmendmentStatus
} from '../types/patientReports'
import {
  createAmendmentRequest,
  processAmendmentRequest,
  applyAmendments
} from '../services/monthlyReports'
import { useAuth } from '../providers/AuthProvider'
import LoadingSpinner from './LoadingSpinner'
import { showNotification } from './Notification'
import { ConfirmationDialog } from './ConfirmationDialog'
import { formatDateTime } from '../utils/dateUtils'
import DesignWorkWrapper from '../../DesignWorkWrapper'

interface AmendmentManagerProps {
  report: PatientReport
  onAmendmentCreated?: (amendmentId: string) => void
  onAmendmentProcessed?: (amendmentId: string, action: 'approve' | 'reject') => void
  onAmendmentsApplied?: (reportId: string) => void
  onClose?: () => void
}

interface FieldChange {
  field: string
  label: string
  currentValue: any
  proposedValue: any
}

interface AmendmentForm {
  reason: string
  changes: FieldChange[]
  deadline?: Date
}

export default function AmendmentManager({
  report,
  onAmendmentCreated,
  onAmendmentProcessed,
  onAmendmentsApplied,
  onClose
}: AmendmentManagerProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'create' | 'pending' | 'history'>('create')
  const [isLoading, setIsLoading] = useState(false)
  const [pendingAmendments, setPendingAmendments] = useState<AmendmentRequest[]>([])
  const [reportVersions, setReportVersions] = useState<ReportVersion[]>([])
  
  // Amendment creation form
  const [amendmentForm, setAmendmentForm] = useState<AmendmentForm>({
    reason: '',
    changes: [],
    deadline: undefined
  })

  // Edit states
  const [editableFields, setEditableFields] = useState<Record<string, any>>({})
  const [hasChanges, setHasChanges] = useState(false)

  // Dialog states
  const [processDialog, setProcessDialog] = useState<{
    isOpen: boolean
    amendmentId: string | null
    action: 'approve' | 'reject' | null
    comments: string
    loading: boolean
  }>({
    isOpen: false,
    amendmentId: null,
    action: null,
    comments: '',
    loading: false
  })

  // Initialize editable fields from report
  useEffect(() => {
    setEditableFields({
      patientComplaint: report.patientComplaint,
      historyPresent: report.historyPresent,
      historyPast: report.historyPast || '',
      'diagnosis.primary': report.diagnosis.primary,
      'diagnosis.secondary': report.diagnosis.secondary || [],
      additionalNotes: report.additionalNotes || '',
      followUpInstructions: report.followUpInstructions || ''
    })
  }, [report])

  // Load pending amendments and versions
  useEffect(() => {
    // In a real implementation, these would be loaded from the backend
    // For now, we'll simulate with empty arrays
    setPendingAmendments([])
    setReportVersions(report.versions || [])
  }, [report])

  // Track changes
  useEffect(() => {
    const changes: FieldChange[] = []
    
    Object.keys(editableFields).forEach(field => {
      const currentValue = getNestedValue(report, field)
      const proposedValue = editableFields[field]
      
      if (JSON.stringify(currentValue) !== JSON.stringify(proposedValue)) {
        changes.push({
          field,
          label: getFieldLabel(field),
          currentValue,
          proposedValue
        })
      }
    })

    setAmendmentForm(prev => ({ ...prev, changes }))
    setHasChanges(changes.length > 0)
  }, [editableFields, report])

  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  const getFieldLabel = (field: string): string => {
    const labels: Record<string, string> = {
      'patientComplaint': 'Plângerea pacientului',
      'historyPresent': 'Istoricul bolii actuale',
      'historyPast': 'Istoricul medical anterior',
      'diagnosis.primary': 'Diagnosticul principal',
      'diagnosis.secondary': 'Diagnostice secundare',
      'additionalNotes': 'Observații suplimentare',
      'followUpInstructions': 'Instrucțiuni de urmărire'
    }
    return labels[field] || field
  }

  const handleFieldChange = (field: string, value: any) => {
    setEditableFields(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCreateAmendment = async () => {
    if (!user || !amendmentForm.reason.trim() || amendmentForm.changes.length === 0) {
      showNotification('Vă rugăm să completați motivul și să faceți cel puțin o modificare', 'warning')
      return
    }

    setIsLoading(true)

    try {
      const proposedChanges: Record<string, any> = {}
      amendmentForm.changes.forEach(change => {
        proposedChanges[change.field] = change.proposedValue
      })

      const amendmentId = await createAmendmentRequest(
        report.id,
        amendmentForm.reason,
        proposedChanges,
        user.uid,
        'doctor',
        amendmentForm.deadline
      )

      showNotification('Cererea de amendament a fost creată cu succes', 'success')
      
      if (onAmendmentCreated) {
        onAmendmentCreated(amendmentId)
      }

      // Reset form
      setAmendmentForm({
        reason: '',
        changes: [],
        deadline: undefined
      })
      
      // Switch to pending tab
      setActiveTab('pending')
    } catch (error) {
      console.error('Error creating amendment:', error)
      showNotification('Eroare la crearea amendamentului', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleProcessAmendment = async () => {
    if (!processDialog.amendmentId || !processDialog.action) return

    setProcessDialog(prev => ({ ...prev, loading: true }))

    try {
      await processAmendmentRequest(
        processDialog.amendmentId,
        processDialog.action,
        processDialog.comments,
        user!.uid,
        'doctor'
      )

      showNotification(
        `Amendamentul a fost ${processDialog.action === 'approve' ? 'aprobat' : 'respins'} cu succes`,
        'success'
      )

      if (onAmendmentProcessed) {
        onAmendmentProcessed(processDialog.amendmentId, processDialog.action)
      }

      setProcessDialog({
        isOpen: false,
        amendmentId: null,
        action: null,
        comments: '',
        loading: false
      })
    } catch (error) {
      console.error('Error processing amendment:', error)
      showNotification('Eroare la procesarea amendamentului', 'error')
      setProcessDialog(prev => ({ ...prev, loading: false }))
    }
  }

  const handleApplyAmendments = async (amendmentId: string) => {
    setIsLoading(true)

    try {
      await applyAmendments(report.id, amendmentId, user!.uid, 'doctor')
      showNotification('Amendamentele au fost aplicate cu succes', 'success')
      
      if (onAmendmentsApplied) {
        onAmendmentsApplied(report.id)
      }
    } catch (error) {
      console.error('Error applying amendments:', error)
      showNotification('Eroare la aplicarea amendamentelor', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const resetChanges = () => {
    setEditableFields({
      patientComplaint: report.patientComplaint,
      historyPresent: report.historyPresent,
      historyPast: report.historyPast || '',
      'diagnosis.primary': report.diagnosis.primary,
      'diagnosis.secondary': report.diagnosis.secondary || [],
      additionalNotes: report.additionalNotes || '',
      followUpInstructions: report.followUpInstructions || ''
    })
  }

  const getStatusIcon = (status: AmendmentStatus) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />
      default: return <FileText className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: AmendmentStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const tabs = [
    { id: 'create' as const, name: 'Creează amendament', icon: Plus },
    { id: 'pending' as const, name: 'Amendamente în curs', icon: Clock },
    { id: 'history' as const, name: 'Istoric versiuni', icon: History }
  ]

  return (
    <DesignWorkWrapper componentName="AmendmentManager">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden max-w-6xl w-full max-h-[90vh]">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Gestionare Amendamente</h2>
            <p className="text-blue-100">
              Raport pentru: <span className="font-semibold">{report.patientName}</span>
            </p>
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-blue-100 hover:text-white hover:bg-blue-600 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Status Info */}
        <div className="mt-4 flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Versiunea curentă: {report.currentVersion}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {getStatusIcon(report.amendmentStatus)}
            <span>
              Status amendament: {
                report.amendmentStatus === 'none' ? 'Fără amendamente' :
                report.amendmentStatus === 'pending' ? 'În curs' :
                report.amendmentStatus === 'approved' ? 'Aprobat' :
                'Respins'
              }
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6 overflow-y-auto max-h-[60vh]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'create' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Creează cerere de amendament
                  </h3>
                  
                  {report.status !== 'final' && report.status !== 'ready_for_submission' && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        <p className="text-yellow-800">
                          Amendamentele pot fi create doar pentru rapoartele finalizate sau pregătite pentru trimitere.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Reason Input */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Motivul amendamentului *
                    </label>
                    <textarea
                      value={amendmentForm.reason}
                      onChange={(e) => setAmendmentForm(prev => ({ ...prev, reason: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                      placeholder="Explicați motivul pentru care este necesar acest amendament..."
                    />
                  </div>

                  {/* Editable Fields */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Câmpuri editabile
                    </h4>

                    {/* Patient Complaint */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Plângerea pacientului
                      </label>
                      <textarea
                        value={editableFields.patientComplaint || ''}
                        onChange={(e) => handleFieldChange('patientComplaint', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                      />
                    </div>

                    {/* History Present */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Istoricul bolii actuale
                      </label>
                      <textarea
                        value={editableFields.historyPresent || ''}
                        onChange={(e) => handleFieldChange('historyPresent', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                      />
                    </div>

                    {/* Primary Diagnosis */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Diagnosticul principal
                      </label>
                      <input
                        type="text"
                        value={editableFields['diagnosis.primary'] || ''}
                        onChange={(e) => handleFieldChange('diagnosis.primary', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                      />
                    </div>

                    {/* Additional Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Observații suplimentare
                      </label>
                      <textarea
                        value={editableFields.additionalNotes || ''}
                        onChange={(e) => handleFieldChange('additionalNotes', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Changes Summary */}
                  {hasChanges && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-3">
                        Modificări propuse ({amendmentForm.changes.length})
                      </h4>
                      <div className="space-y-2">
                        {amendmentForm.changes.map((change, index) => (
                          <div key={index} className="text-sm">
                            <span className="font-medium text-blue-800">{change.label}:</span>
                            <div className="ml-4 mt-1">
                              <span className="text-red-600">- {JSON.stringify(change.currentValue)}</span>
                              <br />
                              <span className="text-green-600">+ {JSON.stringify(change.proposedValue)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-6">
                    <button
                      onClick={resetChanges}
                      disabled={!hasChanges}
                      className="flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Undo2 className="w-4 h-4" />
                      <span>Resetează modificările</span>
                    </button>

                    <button
                      onClick={handleCreateAmendment}
                      disabled={isLoading || !amendmentForm.reason.trim() || !hasChanges}
                      className="flex items-center space-x-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoading ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      <span>Creează amendamentul</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'pending' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Amendamente în curs de procesare
                </h3>

                {pendingAmendments.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Nu există amendamente în curs
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Toate amendamentele au fost procesate sau nu există cereri active.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingAmendments.map((amendment) => (
                      <div key={amendment.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(amendment.status)}`}>
                                {getStatusIcon(amendment.status)}
                                <span>
                                  {amendment.status === 'pending' ? 'În așteptare' :
                                   amendment.status === 'approved' ? 'Aprobat' :
                                   'Respins'}
                                </span>
                              </span>
                              
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {formatDateTime(amendment.requestDate.toDate())}
                              </span>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              <strong>Motiv:</strong> {amendment.reason}
                            </p>

                            <div className="text-sm">
                              <strong>Modificări propuse:</strong>
                              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                                {Object.keys(amendment.proposedChanges).map((field) => (
                                  <li key={field} className="text-gray-600 dark:text-gray-400">
                                    {getFieldLabel(field)}: {JSON.stringify(amendment.proposedChanges[field])}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {amendment.reviewComments && (
                              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Comentarii de revizuire:
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {amendment.reviewComments}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center space-x-2 ml-4">
                            {amendment.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => setProcessDialog({
                                    isOpen: true,
                                    amendmentId: amendment.id,
                                    action: 'approve',
                                    comments: '',
                                    loading: false
                                  })}
                                  className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                  title="Aprobă amendamentul"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() => setProcessDialog({
                                    isOpen: true,
                                    amendmentId: amendment.id,
                                    action: 'reject',
                                    comments: '',
                                    loading: false
                                  })}
                                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                  title="Respinge amendamentul"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}

                            {amendment.status === 'approved' && (
                              <button
                                onClick={() => handleApplyAmendments(amendment.id)}
                                disabled={isLoading}
                                className="flex items-center space-x-2 px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
                              >
                                {isLoading ? (
                                  <LoadingSpinner size="sm" />
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                                <span>Aplică</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Istoric versiuni raport
                </h3>

                {reportVersions.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Nu există istoric de versiuni
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Acest raport nu a fost încă modificat prin amendamente.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reportVersions.map((version) => (
                      <div key={version.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="font-medium text-gray-900 dark:text-white">
                                Versiunea {version.versionNumber}
                              </span>
                              
                              {version.isActive && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 rounded-full text-xs font-medium">
                                  Activă
                                </span>
                              )}
                              
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {formatDateTime(version.timestamp.toDate())}
                              </span>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              <strong>Creat de:</strong> {version.createdByRole === 'doctor' ? 'Doctor' : 'Asistent'}
                            </p>

                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              <strong>Motiv:</strong> {version.reason}
                            </p>

                            <div className="text-sm">
                              <strong>Modificări:</strong>
                              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                                {Object.keys(version.changes).map((field) => (
                                  <li key={field} className="text-gray-600 dark:text-gray-400">
                                    {getFieldLabel(field)}: 
                                    <span className="text-red-600 ml-2">- {JSON.stringify(version.changes[field].from)}</span>
                                    <br />
                                    <span className="text-green-600 ml-6">+ {JSON.stringify(version.changes[field].to)}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <button
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                            title="Vezi detalii versiune"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Process Amendment Dialog */}
      <ConfirmationDialog
        isOpen={processDialog.isOpen}
        onClose={() => setProcessDialog({
          isOpen: false,
          amendmentId: null,
          action: null,
          comments: '',
          loading: false
        })}
        onConfirm={handleProcessAmendment}
        title={`${processDialog.action === 'approve' ? 'Aprobă' : 'Respinge'} amendamentul`}
        message="Ești sigur că vrei să procesezi acest amendament?"
        confirmText={processDialog.action === 'approve' ? 'Aprobă' : 'Respinge'}
        cancelText="Anulează"
        type={processDialog.action === 'approve' ? 'success' : 'danger'}
        loading={processDialog.loading}
      >
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Comentarii (opțional)
          </label>
          <textarea
            value={processDialog.comments}
            onChange={(e) => setProcessDialog(prev => ({ ...prev, comments: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
            placeholder="Adaugă comentarii despre decizia ta..."
          />
        </div>
      </ConfirmationDialog>
    </DesignWorkWrapper>
  )
}
