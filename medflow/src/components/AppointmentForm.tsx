/**
 * Enhanced Appointment Form Component for MedFlow
 * 
 * Features:
 * - Comprehensive input validation with Romanian error messages
 * - Real-time Firebase Firestore integration with immediate dashboard updates
 * - Professional medical styling with MedFlow branding
 * - Full responsiveness and accessibility for all devices
 * - AI integration placeholders for symptom analysis and smart suggestions
 * - Robust error handling and loading states
 * - Romanian localization for medical professionals
 * 
 * @author MedFlow Team
 * @version 2.0
 */

import { useEffect, useState, useCallback, useMemo } from 'react'
import { Timestamp, addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../providers/AuthProvider'
import { isDemoMode, addDemoAppointment, updateDemoAppointment, getDemoAppointments } from '../utils/demo'
import { motion, AnimatePresence } from 'framer-motion'
import NotificationSchedulerService from '../services/notificationScheduler'
import { AppointmentWithNotifications } from '../types/notifications'
import { 
  User, 
  Calendar, 
  Clock, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Save,
  Brain,
  Zap,
  Shield,
  Activity,
  Stethoscope,
  Mail,
  MessageSquare
} from 'lucide-react'
import { formatDateForInput } from '../utils/dateUtils'
import { 
  validateAppointmentForm, 
  sanitizeAppointmentInput, 
  mapFirebaseErrorToMessage,
  analyzeSymptoms,
  suggestOptimalAppointmentTimes,
  AppointmentFormData,
  AppointmentFormErrors
} from '../utils/appointmentValidation'
import { 
  MedicalTextInput, 
  MedicalTextArea, 
  MedicalDateTimeInput, 
  MedicalSelectInput 
} from './AppointmentFormInput'
import LoadingSpinner from './LoadingSpinner'

export type AppointmentStatus = 'scheduled' | 'completed' | 'no_show'

export interface Appointment {
  id?: string
  doctorId: string
  patientName: string
  dateTime: Date
  symptoms: string
  notes?: string
  status: AppointmentStatus
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

interface AppointmentFormProps {
  appointmentId?: string
  onSaved?: () => void
  initialData?: {
    patientName?: string
    dateTime?: string
    symptoms?: string
    notes?: string
  }
}

export default function AppointmentForm({ 
  appointmentId, 
  onSaved, 
  initialData 
}: AppointmentFormProps) {
  const { user } = useAuth()
  
  // Enhanced form state with real-time validation
  const [formData, setFormData] = useState<AppointmentFormData>({
    patientName: initialData?.patientName || '',
    patientEmail: '',
    patientPhone: '',
    dateTime: initialData?.dateTime || '',
    symptoms: initialData?.symptoms || '',
    notes: initialData?.notes || '',
    status: 'scheduled'
  })
  
  const [errors, setErrors] = useState<AppointmentFormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  
  // AI features state (for future implementation)
  const [aiAnalysis, setAiAnalysis] = useState<any>(null)
  const [showAISuggestions, setShowAISuggestions] = useState(false)
  const [optimalTimes, setOptimalTimes] = useState<string[]>([])
  
  // Progress tracking for better UX
  const [saveProgress, setSaveProgress] = useState(0)

  // Enhanced data loading with better error handling
  useEffect(() => {
    async function loadAppointment() {
      if (!appointmentId) {
        // Initialize with optimal time suggestions for new appointments
        const suggestions = suggestOptimalAppointmentTimes()
        setOptimalTimes(suggestions)
        return
      }
      
      setIsLoading(true)
      setErrors({})
      
      try {
        if (isDemoMode()) {
          const demoAppointments = getDemoAppointments()
          const appointment = demoAppointments.find(a => a.id === appointmentId)
          if (appointment) {
            const appointmentDate = new Date(appointment.dateTime?.toDate?.() || appointment.dateTime)
            const dateTimeString = formatDateForInput(appointmentDate) + 'T' + appointmentDate.toTimeString().slice(0, 5)
            
            setFormData({
              patientName: appointment.patientName || '',
              patientEmail: appointment.patientEmail || '',
              patientPhone: appointment.patientPhone || '',
              dateTime: dateTimeString,
              symptoms: appointment.symptoms || '',
              notes: appointment.notes || '',
              status: (appointment.status as AppointmentStatus) || 'scheduled'
            })
          } else {
            setErrors({ general: 'Programarea nu a fost găsită în datele demo' })
          }
        } else {
          const ref = doc(db, 'appointments', appointmentId)
          const snap = await getDoc(ref)
          
          if (snap.exists()) {
            const data = snap.data() as any
            const appointmentDate = new Date(data.dateTime?.toDate?.() || data.dateTime)
            const dateTimeString = formatDateForInput(appointmentDate) + 'T' + appointmentDate.toTimeString().slice(0, 5)
            
            setFormData({
              patientName: data.patientName || '',
              patientEmail: data.patientEmail || '',
              patientPhone: data.patientPhone || '',
              dateTime: dateTimeString,
              symptoms: data.symptoms || '',
              notes: data.notes || '',
              status: (data.status as AppointmentStatus) || 'scheduled'
            })
          } else {
            setErrors({ general: 'Programarea nu a fost găsită în baza de date' })
          }
        }
      } catch (err) {
        console.error('Error loading appointment:', err)
        setErrors({ general: mapFirebaseErrorToMessage(err) })
      } finally {
        setIsLoading(false)
      }
    }
    
    loadAppointment()
  }, [appointmentId])
  
  // Real-time validation as user types
  useEffect(() => {
    if (Object.keys(touched).length === 0) return
    
    const { errors: newErrors } = validateAppointmentForm(formData)
    setErrors(newErrors)
  }, [formData, touched])
  
  // AI symptom analysis (placeholder for future AI integration)
  useEffect(() => {
    if (formData.symptoms.length > 20) {
      const analysis = analyzeSymptoms(formData.symptoms)
      setAiAnalysis(analysis)
    } else {
      setAiAnalysis(null)
    }
  }, [formData.symptoms])

  // Enhanced form handlers with better UX
  const handleFieldChange = useCallback((field: keyof AppointmentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: sanitizeAppointmentInput(value) }))
    setTouched(prev => ({ ...prev, [field]: true }))
    setSubmitSuccess(false) // Clear success state when user starts editing
  }, [])

  const handleFieldBlur = useCallback((field: keyof AppointmentFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }, [])

  // Enhanced submit handler with progress tracking
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      setErrors({ general: 'Sesiunea a expirat. Vă rugăm să vă autentificați din nou.' })
      return
    }

    // Mark all fields as touched for validation display
    setTouched({
      patientName: true,
      dateTime: true,
      symptoms: true,
      notes: true
    })

    // Validate form
    const validation = validateAppointmentForm(formData)
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    setIsSubmitting(true)
    setErrors({})
    setSaveProgress(0)

    try {
      // Progress simulation for better UX
      const progressInterval = setInterval(() => {
        setSaveProgress(prev => Math.min(prev + 20, 90))
      }, 100)

      const payload: any = {
        doctorId: user.uid,
        patientName: formData.patientName.trim(),
        patientEmail: formData.patientEmail?.trim() || '',
        patientPhone: formData.patientPhone?.trim() || '',
        dateTime: new Date(formData.dateTime),
        symptoms: formData.symptoms.trim(),
        notes: formData.notes.trim(),
        status: formData.status,
        updatedAt: serverTimestamp(),
      }

      let savedAppointmentId = appointmentId

      if (isDemoMode()) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        if (!appointmentId) {
          const demoAppointment = addDemoAppointment(payload)
          savedAppointmentId = demoAppointment.id
        } else {
          updateDemoAppointment(appointmentId, payload)
        }
      } else {
        if (!appointmentId) {
          // Initialize notification tracking for new appointments
          payload.createdAt = serverTimestamp()
          payload.notifications = {
            firstNotification: { sent: false },
            secondNotification: { sent: false },
            confirmationReceived: false,
            optedOut: false
          }
          
          const docRef = await addDoc(collection(db, 'appointments'), payload)
          savedAppointmentId = docRef.id
        } else {
          const ref = doc(db, 'appointments', appointmentId)
          await updateDoc(ref, payload)
        }
      }

      // Schedule notification reminders for new appointments or reschedule for updated ones
      if (savedAppointmentId && !isDemoMode()) {
        try {
          const appointmentWithNotifications: AppointmentWithNotifications = {
            id: savedAppointmentId,
            patientName: payload.patientName,
            patientEmail: formData.patientEmail || '', // Add patient email field if available
            dateTime: payload.dateTime,
            symptoms: payload.symptoms,
            notes: payload.notes,
            status: payload.status,
            doctorId: payload.doctorId,
            notifications: payload.notifications || {
              firstNotification: { sent: false },
              secondNotification: { sent: false },
              confirmationReceived: false,
              optedOut: false
            },
            createdAt: payload.createdAt || serverTimestamp() as any,
            updatedAt: payload.updatedAt
          }

          if (!appointmentId) {
            // Schedule notifications for new appointment
            await NotificationSchedulerService.scheduleAppointmentNotifications(appointmentWithNotifications)
            console.log('Notification reminders scheduled for new appointment')
          } else {
            // Reschedule notifications for updated appointment
            await NotificationSchedulerService.rescheduleAppointmentNotifications(
              savedAppointmentId, 
              new Date(formData.dateTime)
            )
            console.log('Notification reminders rescheduled for updated appointment')
          }
        } catch (notificationError) {
          console.warn('Failed to schedule notification reminders:', notificationError)
          // Don't fail the appointment save if notification scheduling fails
        }
      }

      clearInterval(progressInterval)
      setSaveProgress(100)

      // Success feedback
      setSubmitSuccess(true)
      
      // Clear form after successful save (only for new appointments)
      if (!appointmentId) {
        setTimeout(() => {
          setFormData({
            patientName: '',
            patientEmail: '',
            patientPhone: '',
            dateTime: '',
            symptoms: '',
            notes: '',
            status: 'scheduled'
          })
          setTouched({})
          setSubmitSuccess(false)
        }, 1500)
      }

      // Notify parent component
      setTimeout(() => {
        onSaved?.()
      }, appointmentId ? 500 : 1500)

    } catch (err) {
      console.error('Error saving appointment:', err)
      setErrors({ general: mapFirebaseErrorToMessage(err) })
      setSaveProgress(0)
    } finally {
      setIsSubmitting(false)
    }
  }, [user, formData, appointmentId, onSaved])

  // Memoized computed values
  const isFormValid = useMemo(() => {
    const validation = validateAppointmentForm(formData)
    return validation.isValid
  }, [formData])

  const statusOptions = useMemo(() => [
    { value: 'scheduled', label: 'Programat', icon: <Clock className="w-4 h-4" /> },
    { value: 'completed', label: 'Finalizat', icon: <CheckCircle className="w-4 h-4" /> },
    { value: 'no_show', label: 'Nu s-a prezentat', icon: <XCircle className="w-4 h-4" /> }
  ], [])

  // Enhanced loading state with professional styling
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center py-12"
      >
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Se încarcă formularul de programare...
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg">
      {/* Professional Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-medflow-primary/10 rounded-lg">
            <Stethoscope className="w-6 h-6 text-medflow-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {appointmentId ? 'Editare Programare' : 'Programare Nouă'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {appointmentId ? 'Modificați detaliile programării existente' : 'Completați formularul pentru o programare nouă'}
            </p>
          </div>
        </div>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-6 space-y-8"
        onSubmit={handleSubmit}
        noValidate
      >
        {/* General Error Message */}
        <AnimatePresence>
          {errors.general && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center space-x-3 rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <h4 className="font-medium">Eroare</h4>
                <span className="text-sm">{errors.general}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Message */}
        <AnimatePresence>
          {submitSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center space-x-3 rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300"
            >
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <h4 className="font-medium">Succes!</h4>
                <span className="text-sm">
                  Programarea a fost {appointmentId ? 'actualizată' : 'creată'} cu succes
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Analysis Display */}
        <AnimatePresence>
          {aiAnalysis && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`rounded-lg border p-4 ${
                aiAnalysis.severity === 'urgent' 
                  ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
                  : aiAnalysis.severity === 'medium'
                  ? 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-300'
                  : 'bg-medflow-primary/5 border-medflow-primary/20 text-medflow-primary'
              }`}
            >
              <div className="flex items-start space-x-3">
                <Brain className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-sm">Analiză AI a Simptomelor</h4>
                  {aiAnalysis.suggestions?.map((suggestion: string, index: number) => (
                    <p key={index} className="text-xs mt-1">{suggestion}</p>
                  ))}
                  {aiAnalysis.redFlags?.map((flag: string, index: number) => (
                    <p key={index} className="text-xs mt-1 font-medium">⚠️ {flag}</p>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Patient Name */}
        <MedicalTextInput
          label="Nume pacient"
          value={formData.patientName}
          onChange={(value) => handleFieldChange('patientName', value)}
          onBlur={() => handleFieldBlur('patientName')}
          error={touched.patientName ? errors.patientName : undefined}
          required
          icon={<User className="w-4 h-4" />}
          placeholder="Ex: Ion Popescu"
          maxLength={100}
          autoComplete="name"
        />

        {/* Patient Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MedicalTextInput
            label="Email pacient (pentru notificări)"
            value={formData.patientEmail || ''}
            onChange={(value) => handleFieldChange('patientEmail', value)}
            onBlur={() => handleFieldBlur('patientEmail')}
            error={touched.patientEmail ? errors.patientEmail : undefined}
            icon={<Mail className="w-4 h-4" />}
            placeholder="exemplu@email.com"
            maxLength={100}
            autoComplete="email"
            type="email"
          />

          <MedicalTextInput
            label="Telefon pacient (pentru SMS)"
            value={formData.patientPhone || ''}
            onChange={(value) => handleFieldChange('patientPhone', value)}
            onBlur={() => handleFieldBlur('patientPhone')}
            error={touched.patientPhone ? errors.patientPhone : undefined}
            icon={<MessageSquare className="w-4 h-4" />}
            placeholder="+40123456789"
            maxLength={15}
            autoComplete="tel"
            type="tel"
          />
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MedicalDateTimeInput
            label="Data programării"
            type="date"
            value={formData.dateTime.split('T')[0] || ''}
            onChange={(value) => {
              const time = formData.dateTime.split('T')[1] || '09:00'
              handleFieldChange('dateTime', `${value}T${time}`)
            }}
            onBlur={() => handleFieldBlur('dateTime')}
            error={touched.dateTime ? errors.dateTime : undefined}
            required
            min={new Date().toISOString().split('T')[0]}
          />

          <MedicalDateTimeInput
            label="Ora programării"
            type="time"
            value={formData.dateTime.split('T')[1] || '09:00'}
            onChange={(value) => {
              const date = formData.dateTime.split('T')[0] || new Date().toISOString().split('T')[0]
              handleFieldChange('dateTime', `${date}T${value}`)
            }}
            onBlur={() => handleFieldBlur('dateTime')}
            error={touched.dateTime ? errors.dateTime : undefined}
            required
            step="900" // 15 minute intervals
            aiSuggestions={optimalTimes}
            showAISuggestions={!appointmentId && optimalTimes.length > 0}
          />
        </div>

        {/* Symptoms */}
        <MedicalTextArea
          label="Simptome și motivul consultației"
          value={formData.symptoms}
          onChange={(value) => handleFieldChange('symptoms', value)}
          onBlur={() => handleFieldBlur('symptoms')}
          error={touched.symptoms ? errors.symptoms : undefined}
          required
          icon={<Activity className="w-4 h-4" />}
          placeholder="Descrieți detaliat simptomele pacientului, durata, intensitatea și orice alte observații relevante..."
          rows={5}
          maxLength={2000}
          resize={true}
        />

        {/* Notes */}
        <MedicalTextArea
          label="Note suplimentare (opțional)"
          value={formData.notes}
          onChange={(value) => handleFieldChange('notes', value)}
          onBlur={() => handleFieldBlur('notes')}
          error={touched.notes ? errors.notes : undefined}
          icon={<FileText className="w-4 h-4" />}
          placeholder="Observații suplimentare, instrucțiuni speciale, istoric medical relevant..."
          rows={3}
          maxLength={1000}
          resize={true}
        />

        {/* Status Selection */}
        <MedicalSelectInput
          label="Status programare"
          value={formData.status}
          onChange={(value) => handleFieldChange('status', value as AppointmentStatus)}
          options={statusOptions}
          icon={<Shield className="w-4 h-4" />}
        />

        {/* Progress Bar for Submission */}
        <AnimatePresence>
          {isSubmitting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Salvare în progres...
                </span>
                <span className="text-sm font-medium text-medflow-primary">
                  {saveProgress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <motion.div
                  className="bg-medflow-primary h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${saveProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isSubmitting || !isFormValid}
          className={`w-full flex items-center justify-center space-x-3 px-6 py-4 rounded-lg font-semibold text-lg transition-all duration-200 ${
            isSubmitting
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : !isFormValid
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-medflow-primary text-white hover:bg-medflow-secondary focus:ring-2 focus:ring-medflow-primary focus:ring-offset-2 shadow-lg hover:shadow-xl'
          }`}
          whileHover={!isSubmitting && isFormValid ? { scale: 1.02 } : {}}
          whileTap={!isSubmitting && isFormValid ? { scale: 0.98 } : {}}
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Se salvează...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>
                {appointmentId ? 'Actualizează programarea' : 'Creează programarea'}
              </span>
            </>
          )}
        </motion.button>

        {/* AI Integration Notice */}
        <div className="bg-medflow-primary/5 border border-medflow-primary/10 rounded-lg p-4">
          <div className="flex items-center space-x-3 text-medflow-primary">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">
              🤖 Funcționalități AI pentru optimizarea programărilor vor fi disponibile în curând
            </span>
          </div>
        </div>
      </motion.form>
    </div>
  )
}