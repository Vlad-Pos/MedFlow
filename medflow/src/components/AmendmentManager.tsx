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
  FileText, 
  Edit3, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Plus,
  X,
  Send, 
  Undo2, 
  Calendar,
  User,
  History,
  Eye,
  Download,
  Printer,
  Share2,
  Lock,
  Unlock,
  Shield,
  FileCheck,
  FileX,
  FileEdit,
  FilePlus,
  FileMinus,
  FileSearch,
  FileClock,
  FileCode,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileSpreadsheet
} from 'lucide-react'
import { useAuth } from '../providers/AuthProvider'
import { useNotification } from '../hooks'
import LoadingSpinner from './LoadingSpinner'
import { 
  PatientReport, 
  AmendmentRequest, 
  AmendmentStatus,
  ReportVersion 
} from '../types/patientReports'
import { createAmendmentRequest, processAmendmentRequest, applyAmendments } from '../services/monthlyReports'

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
  currentValue: unknown
  proposedValue: unknown
}

interface AmendmentForm {
  reason: string
  changes: FieldChange[]
  deadline?: Date
}

interface EditableFields {
  patientComplaint: string
  historyPresent: string
  historyPast: string
  'diagnosis.primary': string
  'diagnosis.secondary': string
  additionalNotes: string
  followUpInstructions: string
}

export default function AmendmentManager({
  report,
  onAmendmentCreated,
  onAmendmentProcessed,
  onAmendmentsApplied,
  onClose
}: AmendmentManagerProps) {
  const { user } = useAuth()
  const { showSuccess, showError, showWarning, showInfo } = useNotification()
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'applied' | 'create' | 'history'>('pending')
  const [amendments, setAmendments] = useState<AmendmentRequest[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [amendmentForm, setAmendmentForm] = useState<AmendmentForm>({
    reason: '',
    changes: []
  })
  const [editableFields, setEditableFields] = useState<EditableFields>({
    patientComplaint: '',
    historyPresent: '',
    historyPast: '',
    'diagnosis.primary': '',
    'diagnosis.secondary': '',
    additionalNotes: '',
    followUpInstructions: ''
  })
  const [hasChanges, setHasChanges] = useState(false)
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

  // Mock data for demo purposes
  const [pendingAmendments, setPendingAmendments] = useState<AmendmentRequest[]>([])
  const [reportVersions, setReportVersions] = useState<ReportVersion[]>([])

  // Load amendments
  useEffect(() => {
    loadAmendments()
  }, [])

  // Initialize editable fields
  useEffect(() => {
    setEditableFields({
      patientComplaint: report.patientComplaint || '',
      historyPresent: report.historyPresent || '',
      historyPast: report.historyPast || '',
      'diagnosis.primary': report.diagnosis.primary || '',
      'diagnosis.secondary': Array.isArray(report.diagnosis.secondary) ? report.diagnosis.secondary.join(', ') : (report.diagnosis.secondary || ''),
      additionalNotes: report.additionalNotes || '',
      followUpInstructions: report.followUpInstructions || ''
    })
  }, [report])

  // Track changes
  useEffect(() => {
    let hasAnyChanges = false
    Object.keys(editableFields).forEach(field => {
      const currentValue = getNestedValue(report, field)
      const proposedValue = editableFields[field as keyof EditableFields]
      
      if (JSON.stringify(currentValue) !== JSON.stringify(proposedValue)) {
        hasAnyChanges = true
      }
    })
    setHasChanges(hasAnyChanges)
  }, [editableFields, report])

  const getNestedValue = (obj: PatientReport, path: string): unknown => {
    return path.split('.').reduce((current, key) => {
      if (current && typeof current === 'object' && key in current) {
        return (current as Record<string, unknown>)[key]
      }
      return undefined
    }, obj as unknown)
  }

  const getFieldLabel = (field: string): string => {
    const labels: Record<string, string> = {
      patientComplaint: 'Plângerea pacientului',
      historyPresent: 'Istoricul bolii actuale',
      historyPast: 'Istoricul medical anterior',
      'diagnosis.primary': 'Diagnosticul principal',
      'diagnosis.secondary': 'Diagnostice secundare',
      additionalNotes: 'Note suplimentare',
      followUpInstructions: 'Instrucțiuni de follow-up'
    }
    return labels[field] || field
  }

  const handleFieldChange = (field: string, value: unknown) => {
    setEditableFields(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const loadAmendments = async () => {
    // This would load amendments from the backend
    // For now, we'll use an empty array
    setAmendments([])
    setPendingAmendments([])
    setReportVersions([])
  }

  const handleCreateAmendment = async () => {
    if (!amendmentForm.reason.trim()) {
      showError('Vă rugăm să specificați motivul amendamentului.')
      return
    }

    if (!hasChanges) {
      showError('Nu există modificări de salvat.')
      return
    }

    setIsLoading(true)

    try {
      const changes: FieldChange[] = []
      Object.keys(editableFields).forEach(field => {
        const currentValue = getNestedValue(report, field)
        const proposedValue = editableFields[field as keyof EditableFields]
        
        if (JSON.stringify(currentValue) !== JSON.stringify(proposedValue)) {
          changes.push({
            field,
            label: getFieldLabel(field),
            currentValue,
            proposedValue
          })
        }
      })

      const amendmentId = await createAmendmentRequest(
        report.id,
        amendmentForm.reason,
        changes.reduce((acc, change) => ({
          ...acc,
          [change.field]: { from: change.currentValue, to: change.proposedValue }
        }), {}),
        user!.uid,
        'doctor',
        amendmentForm.deadline
      )
      
      showSuccess('Cererea de amendament a fost creată cu succes.')
      
      if (onAmendmentCreated) {
        onAmendmentCreated(amendmentId)
      }

      // Reset form
      setAmendmentForm({ reason: '', changes: [] })
      setActiveTab('pending')
      
    } catch (error) {
      console.error('Error creating amendment:', error)
      showError('Eroare la crearea cererii de amendament.')
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

      showSuccess(
        `Amendamentul a fost ${processDialog.action === 'approve' ? 'aprobat' : 'respins'} cu succes`
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
      showError('Eroare la procesarea amendamentului')
      setProcessDialog(prev => ({ ...prev, loading: false }))
    }
  }

  const handleApplyAmendments = async (amendmentId: string) => {
    setIsLoading(true)

    try {
      await applyAmendments(report.id, amendmentId, user!.uid, 'doctor')
      showSuccess('Amendamentele au fost aplicate cu succes')
      
      if (onAmendmentsApplied) {
        onAmendmentsApplied(report.id)
      }
    } catch (error) {
      console.error('Error applying amendments:', error)
      showError('Eroare la aplicarea amendamentelor')
    } finally {
      setIsLoading(false)
    }
  }

  const resetChanges = () => {
    setEditableFields({
      patientComplaint: report.patientComplaint || '',
      historyPresent: report.historyPresent || '',
      historyPast: report.historyPast || '',
      'diagnosis.primary': report.diagnosis.primary || '',
      'diagnosis.secondary': Array.isArray(report.diagnosis.secondary) ? report.diagnosis.secondary.join(', ') : (report.diagnosis.secondary || ''),
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

  // Helper function to format date/time
  const formatDateTime = (date: Date): string => {
    return date.toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
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

                    {/* Secondary Diagnosis */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Diagnostice secundare
                      </label>
                      <input
                        type="text"
                        value={editableFields['diagnosis.secondary'] || ''}
                        onChange={(e) => handleFieldChange('diagnosis.secondary', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                        placeholder="Separate prin virgulă"
                      />
                    </div>

                    {/* Additional Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Note suplimentare
                      </label>
                      <textarea
                        value={editableFields.additionalNotes || ''}
                        onChange={(e) => handleFieldChange('additionalNotes', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                      />
                    </div>

                    {/* Follow-up Instructions */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Instrucțiuni de follow-up
                      </label>
                      <textarea
                        value={editableFields.followUpInstructions || ''}
                        onChange={(e) => handleFieldChange('followUpInstructions', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={resetChanges}
                      disabled={!hasChanges}
                      className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Undo2 className="w-4 h-4" />
                      <span>Resetează modificările</span>
                    </button>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setActiveTab('pending')}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                      >
                        Anulează
                      </button>
                      
                      <button
                        onClick={handleCreateAmendment}
                        disabled={!hasChanges || !amendmentForm.reason.trim() || isLoading}
                        className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                                {formatDateTime(amendment.requestDate instanceof Date ? amendment.requestDate : new Date(amendment.requestDate.seconds * 1000))}
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
                                className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title="Aplică amendamentele"
                              >
                                <FileCheck className="w-4 h-4" />
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
                                {formatDateTime(version.timestamp instanceof Date ? version.timestamp : new Date(version.timestamp.seconds * 1000))}
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
      {processDialog.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {processDialog.action === 'approve' ? 'Aprobă' : 'Respinge'} amendamentul
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Comentarii (opțional)
              </label>
              <textarea
                value={processDialog.comments}
                onChange={(e) => setProcessDialog(prev => ({ ...prev, comments: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                placeholder="Adăugați comentarii despre decizia dvs..."
              />
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setProcessDialog({
                  isOpen: false,
                  amendmentId: null,
                  action: null,
                  comments: '',
                  loading: false
                })}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Anulează
              </button>
              
              <button
                onClick={handleProcessAmendment}
                disabled={processDialog.loading}
                className={`px-4 py-2 text-white rounded-lg transition-colors ${
                  processDialog.action === 'approve' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {processDialog.loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  processDialog.action === 'approve' ? 'Aprobă' : 'Respinge'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
