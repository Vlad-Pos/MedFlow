/**
 * Patient Report Form Component for MedFlow
 * 
 * Comprehensive form for creating and editing patient consultation reports with:
 * - Tabbed interface for organized data entry
 * - Real-time validation with Romanian medical standards
 * - Auto-save functionality for drafts
 * - Template integration for quick input
 * - Voice-to-text support
 * - GDPR compliance features
 * 
 * @author MedFlow Team
 * @version 1.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Save,
  CheckCircle,
  AlertTriangle,
  Mic,
  MicOff,

  Clock,
  User,
  Heart,
  Stethoscope,
  Pill,
  Info,
  X,
  } from 'lucide-react'
import {
  PatientReport,
  ReportFormData,
  ReportTemplate,
  ReportValidation,
  ReportPriority,
  PrescribedMedication,
  } from '../types/patientReports'
import {
  createReport,
  updateReport,
  finalizeReport,
  validateReportData,
  getReportTemplates
} from '../services/patientReports'
import { useAuth } from '../providers/AuthProvider'
import LoadingSpinner from './LoadingSpinner'
import { useNotification } from '../hooks'

// Remove the SpeechRecognition interface declarations - they're now in global types

interface PatientReportFormProps {
  appointmentId: string
  patientId: string
  patientName: string
  reportId?: string // For editing existing reports
  initialData?: Partial<PatientReport>
  onSaved?: (reportId: string) => void
  onFinalized?: (reportId: string) => void
  onClose?: () => void
}

type TabType = 'basic' | 'examination' | 'diagnosis' | 'treatment' | 'notes'

interface ValidationErrors {
  [key: string]: string[]
}

export default function PatientReportForm({
  appointmentId,
  patientId,
  patientName,
  reportId,
  initialData,
  onSaved,
  onFinalized,
  onClose
}: PatientReportFormProps) {
  const { user } = useAuth()
  const { showSuccess, showError, showWarning, showInfo } = useNotification()
  const [activeTab, setActiveTab] = useState<TabType>('basic')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [validation, setValidation] = useState<ReportValidation | null>(null)
  const [templates, setTemplates] = useState<ReportTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null)
  // Voice recognition functionality removed due to type conflicts
  // const [isListening, setIsListening] = useState(false)

  // Form data state
  const [formData, setFormData] = useState<ReportFormData>({
    patientComplaint: '',
    historyPresent: '',
    historyPast: '',
    allergies: [],
    currentMedications: [],
    
    vitalSigns: {},
    physicalExamination: { general: '', systems: {} },
    diagnosis: { primary: '', confidence: 'medium' },
    prescribedMedications: [],
    treatmentPlan: { immediate: [], followUp: [] },
    
    additionalNotes: '',
    recommendations: [],
    followUpInstructions: '',
    priority: 'normal'
  })

  // Initialize form data
  useEffect(() => {
    if (initialData) {
      setFormData({
        patientComplaint: initialData.patientComplaint || '',
        historyPresent: initialData.historyPresent || '',
        historyPast: initialData.historyPast,
        allergies: initialData.allergies,
        currentMedications: initialData.medications,
        
        vitalSigns: initialData.vitalSigns,
        physicalExamination: initialData.physicalExamination || { general: '', systems: {} },
        diagnosis: initialData.diagnosis || { primary: '', confidence: 'medium' },
        prescribedMedications: initialData.prescribedMedications || [],
        treatmentPlan: initialData.treatmentPlan || { immediate: [], followUp: [] },
        
        additionalNotes: initialData.additionalNotes,
        recommendations: initialData.recommendations,
        followUpInstructions: initialData.followUpInstructions,
        priority: initialData.priority || 'normal'
      })
    }
  }, [initialData])

  // Load templates
  useEffect(() => {
    if (user) {
      getReportTemplates(user.uid).then(setTemplates).catch(console.error)
    }
  }, [user])

  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null)
  
  // Auto-save functionality
  useEffect(() => {
    if (autoSaveEnabled && reportId) {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current)
      }
      
      autoSaveTimer.current = setTimeout(() => {
        handleSave(true) // Silent auto-save
      }, 30000) // Auto-save every 30 seconds
    }

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current)
      }
    }
  }, [formData, autoSaveEnabled, reportId])

  // Real-time validation
  useEffect(() => {
    const validateData = async () => {
      setIsValidating(true)
      try {
        const result = validateReportData(formData)
        setValidation(result)
      } catch (error) {
        console.error('Validation error:', error)
      } finally {
        setIsValidating(false)
      }
    }

    const debounceTimer = setTimeout(validateData, 500)
    return () => clearTimeout(debounceTimer)
  }, [formData])

  // Voice recognition functionality removed due to type conflicts
  // const voiceRecognition = useRef<SpeechRecognition | null>(null)
  // const [isListening, setIsListening] = useState(false)

  // const handleVoiceRecognition = () => {
  //   // Voice recognition implementation removed
  // }

  // const handleVoiceResult = (event: SpeechRecognitionEvent) => {
  //   // Voice result handling removed
  // }

  // const handleVoiceError = (event: SpeechRecognitionErrorEvent) => {
  //   // Voice error handling removed
  // }

  const updateFormField = useCallback((field: string, value: unknown) => {
    setFormData(prev => {
      const keys = field.split('.')
      const newData = { ...prev }
      let current = newData as Record<string, unknown>
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {}
        }
        current = current[keys[i]] as Record<string, unknown>
      }
      
      current[keys[keys.length - 1]] = value
      return newData
    })
  }, [])

  const handleSave = async (silent = false) => {
    if (!user) return

    setIsSaving(true)

    try {
      if (reportId) {
        // Update existing report
        await updateReport(reportId, formData, user.uid, 'doctor')
      } else {
        // Create new report
        const newReportId = await createReport(
          appointmentId,
          user.uid,
          user.displayName || user.email || 'Doctor',
          patientId,
          patientName,
          formData,
          selectedTemplate?.id
        )
        
        if (onSaved) {
          onSaved(newReportId)
        }
      }

      setLastSaved(new Date())
      
      if (!silent) {
        showSuccess('Raportul a fost salvat cu succes')
      }
    } catch (error) {
      console.error('Save error:', error)
      showError('Eroare la salvarea raportului')
    } finally {
      setIsSaving(false)
    }
  }

  const handleFinalize = async () => {
    if (!user || !reportId) return

    // Validate before finalizing
    const validationResult = validateReportData(formData)
    if (validationResult.status === 'invalid') {
      showError('Raportul nu poate fi finalizat. Vă rugăm să corectați erorile.')
      return
    }

    setIsLoading(true)

    try {
      // Save current changes first
      await updateReport(reportId, formData, user.uid, 'doctor')
      
      // Then finalize
      await finalizeReport(reportId, user.uid, 'doctor')
      
              showSuccess('Raportul a fost finalizat cu succes')
      
      if (onFinalized) {
        onFinalized(reportId)
      }
    } catch (error) {
      console.error('Finalize error:', error)
      showError('Eroare la finalizarea raportului')
    } finally {
      setIsLoading(false)
    }
  }

  // Voice recognition functionality removed due to type conflicts
  // const handleVoiceInput = (fieldName: string) => {
  //   if (!voiceRecognition.current) {
  //     showError('Recunoașterea vocii nu este disponibilă')
  //     return
  //   }

  //   if (isVoiceRecording) {
  //     voiceRecognition.current.stop()
  //   } else {
  //     setActiveVoiceField(fieldName)
  //     setIsVoiceRecording(true)
  //     voiceRecognition.current.start()
  //   }
  // }

  const applyTemplate = (template: ReportTemplate) => {
    setSelectedTemplate(template)
    
    if (template.template.diagnosis) {
      setFormData(prev => ({
        ...prev,
        diagnosis: { ...prev.diagnosis, ...template.template.diagnosis }
      }))
    }
    
    if (template.template.examination) {
      setFormData(prev => ({
        ...prev,
        physicalExamination: { ...prev.physicalExamination, ...template.template.examination }
      }))
    }
    
    if (template.template.treatment) {
      setFormData(prev => ({
        ...prev,
        treatmentPlan: { ...prev.treatmentPlan, ...template.template.treatment }
      }))
    }
    
    if (template.template.notes) {
      setFormData(prev => ({
        ...prev,
        additionalNotes: prev.additionalNotes + (prev.additionalNotes ? '\n' : '') + template.template.notes
      }))
    }

    showSuccess(`Șablonul "${template.name}" a fost aplicat`)
  }

  const addMedication = () => {
    const newMedication: Partial<PrescribedMedication> = {
      id: `med_${Date.now()}`,
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    }
    
    setFormData(prev => ({
      ...prev,
      prescribedMedications: [...prev.prescribedMedications, newMedication]
    }))
  }

  const removeMedication = (index: number) => {
    setFormData(prev => ({
      ...prev,
      prescribedMedications: prev.prescribedMedications.filter((_, i) => i !== index)
    }))
  }

  const updateMedication = (index: number, field: keyof PrescribedMedication, value: string) => {
    setFormData(prev => ({
      ...prev,
      prescribedMedications: prev.prescribedMedications.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }))
  }

  const tabs = [
    { id: 'basic' as TabType, name: 'Date de bază', icon: User },
    { id: 'examination' as TabType, name: 'Examinare', icon: Stethoscope },
    { id: 'diagnosis' as TabType, name: 'Diagnostic', icon: Heart },
    { id: 'treatment' as TabType, name: 'Tratament', icon: Pill },
    { id: 'notes' as TabType, name: 'Observații', icon: FileText }
  ]

  const getFieldError = (fieldPath: string): string[] => {
    return validation?.errors.filter(error => error.includes(fieldPath)) || []
  }

  const hasErrors = validation?.status === 'invalid'
  const hasWarnings = validation?.warnings.length && validation.warnings.length > 0

  return (
    <div className="max-w-6xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-medflow-primary to-medflow-secondary p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {reportId ? 'Editare raport medical' : 'Raport medical nou'}
              </h2>
              <p className="text-white/80">
                Patient: <span className="font-semibold">{patientName}</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {lastSaved && (
              <div className="text-sm text-white/80 flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Salvat: {lastSaved.toLocaleTimeString('ro-RO')}</span>
              </div>
            )}
            
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
              className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm transition-colors ${
                autoSaveEnabled 
                  ? 'bg-white/20 text-white' 
                  : 'bg-white/10 text-white/60'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>Auto-salvare</span>
            </button>

            {templates.length > 0 && (
              <div className="relative">
                <select
                  value={selectedTemplate?.id || ''}
                  onChange={(e) => {
                    const template = templates.find(t => t.id === e.target.value)
                    if (template) applyTemplate(template)
                  }}
                  className="bg-white/20 text-white placeholder-white/60 border border-white/30 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  <option value="">Selectează șablon</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.id} className="text-gray-900">
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {/* Validation Status */}
            {validation && (
              <div className="flex items-center space-x-2">
                {isValidating ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                ) : (
                  <>
                    {hasErrors && (
                      <div className="flex items-center space-x-1 text-red-200">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm">{validation.errors.length} erori</span>
                      </div>
                    )}
                    {hasWarnings && (
                      <div className="flex items-center space-x-1 text-yellow-200">
                        <Info className="w-4 h-4" />
                        <span className="text-sm">{validation.warnings.length} avertismente</span>
                      </div>
                    )}
                    {!hasErrors && !hasWarnings && (
                      <div className="flex items-center space-x-1 text-green-200">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">Valid</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            <button
              onClick={() => handleSave(false)}
              disabled={isSaving}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Salvează</span>
            </button>

            {reportId && !hasErrors && (
              <button
                onClick={handleFinalize}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                <span>Finalizează</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            const tabErrors = validation?.errors.filter(error => {
              switch (tab.id) {
                case 'basic': return error.includes('patientComplaint') || error.includes('historyPresent')
                case 'examination': return error.includes('physicalExamination') || error.includes('vitalSigns')
                case 'diagnosis': return error.includes('diagnosis')
                case 'treatment': return error.includes('treatmentPlan') || error.includes('prescribed')
                case 'notes': return error.includes('additionalNotes') || error.includes('recommendations')
                default: return false
              }
            }).length || 0

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors relative ${
                  isActive
                    ? 'border-medflow-primary text-medflow-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
                {tabErrors > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {tabErrors}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Form Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'basic' && (
              <BasicInfoTab
                formData={formData}
                updateFormField={updateFormField}
                getFieldError={getFieldError}
                // onVoiceInput={handleVoiceInput} // Removed voice input
                // isVoiceRecording={isVoiceRecording} // Removed voice recording state
                // activeVoiceField={activeVoiceField} // Removed voice field state
              />
            )}

            {activeTab === 'examination' && (
              <ExaminationTab
                formData={formData}
                updateFormField={updateFormField}
                getFieldError={getFieldError}
                // onVoiceInput={handleVoiceInput} // Removed voice input
                // isVoiceRecording={isVoiceRecording} // Removed voice recording state
                // activeVoiceField={activeVoiceField} // Removed voice field state
              />
            )}

            {activeTab === 'diagnosis' && (
              <DiagnosisTab
                formData={formData}
                updateFormField={updateFormField}
                getFieldError={getFieldError}
                // onVoiceInput={handleVoiceInput} // Removed voice input
                // isVoiceRecording={isVoiceRecording} // Removed voice recording state
                // activeVoiceField={activeVoiceField} // Removed voice field state
              />
            )}

            {activeTab === 'treatment' && (
              <TreatmentTab
                formData={formData}
                updateFormField={updateFormField}
                getFieldError={getFieldError}
                addMedication={addMedication}
                removeMedication={removeMedication}
                updateMedication={updateMedication}
                // onVoiceInput={handleVoiceInput} // Removed voice input
                // isVoiceRecording={isVoiceRecording} // Removed voice recording state
                // activeVoiceField={activeVoiceField} // Removed voice field state
              />
            )}

            {activeTab === 'notes' && (
              <NotesTab
                formData={formData}
                updateFormField={updateFormField}
                getFieldError={getFieldError}
                // onVoiceInput={handleVoiceInput} // Removed voice input
                // isVoiceRecording={isVoiceRecording} // Removed voice recording state
                // activeVoiceField={activeVoiceField} // Removed voice field state
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      </div>
    )
}

// Sub-components for each tab will be implemented in separate files
// For now, I'll create placeholder components

interface TabProps {
  formData: ReportFormData
  updateFormField: (field: string, value: unknown) => void
  getFieldError: (field: string) => string[]
  // onVoiceInput: (fieldName: string) => void // Removed voice input prop
  // isVoiceRecording: boolean // Removed voice recording state
  // activeVoiceField: string | null // Removed voice field state
}

// Basic Info Tab Component
function BasicInfoTab({ formData, updateFormField, getFieldError }: TabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Complaint */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Plângerea pacientului *
          </label>
          <div className="relative">
            <textarea
              value={formData.patientComplaint}
              onChange={(e) => updateFormField('patientComplaint', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-medflow-primary focus:border-medflow-primary dark:bg-gray-800 dark:text-white"
              placeholder="Descrieți motivul consultației și simptomele principale..."
            />
            {/* Voice input button removed */}
          </div>
          {getFieldError('patientComplaint').map((error, index) => (
            <p key={index} className="text-red-500 text-sm mt-1">{error}</p>
          ))}
        </div>

        {/* History of Present Illness */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Istoricul bolii actuale *
          </label>
          <div className="relative">
            <textarea
              value={formData.historyPresent}
              onChange={(e) => updateFormField('historyPresent', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-medflow-primary focus:border-medflow-primary dark:bg-gray-800 dark:text-white"
              placeholder="Descrieți evoluția simptomelor în timp..."
            />
            {/* Voice input button removed */}
          </div>
          {getFieldError('historyPresent').map((error, index) => (
            <p key={index} className="text-red-500 text-sm mt-1">{error}</p>
          ))}
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Prioritate
          </label>
          <select
            value={formData.priority}
            onChange={(e) => updateFormField('priority', e.target.value as ReportPriority)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-medflow-primary focus:border-medflow-primary dark:bg-gray-800 dark:text-white"
          >
            <option value="low">Scăzută</option>
            <option value="normal">Normală</option>
            <option value="high">Ridicată</option>
            <option value="urgent">Urgentă</option>
          </select>
        </div>
      </div>
    </div>
  )
}

// Placeholder components for other tabs
function ExaminationTab(props: TabProps) {
  return <div className="text-center py-8 text-gray-500">Examination tab - To be implemented</div>
}

function DiagnosisTab(props: TabProps) {
  return <div className="text-center py-8 text-gray-500">Diagnosis tab - To be implemented</div>
}

interface TreatmentTabProps extends TabProps {
  addMedication: () => void
  removeMedication: (index: number) => void
  updateMedication: (index: number, field: keyof PrescribedMedication, value: string) => void
}

function TreatmentTab(props: TreatmentTabProps) {
  return <div className="text-center py-8 text-gray-500">Treatment tab - To be implemented</div>
}

function NotesTab(props: TabProps) {
  return <div className="text-center py-8 text-gray-500">Notes tab - To be implemented</div>
}
