/**
 * Enhanced Appointment Form Component for MedFlow - FIXED VERSION
 * 
 * Features:
 * - Comprehensive input validation with Romanian error messages
 * - Real-time Firebase Firestore integration with immediate dashboard updates
 * - Professional medical styling with MedFlow branding
 * - Full responsiveness and accessibility for all devices
 * - AI integration placeholders for symptom analysis and smart suggestions
 * - Robust error handling and loading states
 * - Romanian localization for medical professionals
 * - FIXED: Logic error in handleSubmit function for editing appointments
 * 
 * @author MedFlow Team
 * @version 2.1 - Fixed
 */

import { useEffect, useState, useCallback, useMemo } from 'react'
import { Timestamp, addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../providers/AuthProvider'
import { isDemoMode, addDemoAppointment, updateDemoAppointment, getDemoAppointments, DemoAppointment } from '../utils/demo'
import { motion, AnimatePresence } from 'framer-motion'
import NotificationSchedulerService from '../services/notificationScheduler'
import { AppointmentWithNotifications } from '../types/notifications'
import { 
  User, 
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
  FormInput
} from './forms'
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

// Define the AI analysis type
interface AIAnalysis {
  severity?: 'low' | 'medium' | 'high' | 'urgent'
  suggestions?: string[]
  redFlags?: string[]
  relatedConditions?: string[]
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

  // Form state management
  const [errors, setErrors] = useState<AppointmentFormErrors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof AppointmentFormData, boolean>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [saveProgress, setSaveProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null)

  // Load existing appointment data for editing
  useEffect(() => {
    const loadAppointmentData = async () => {
      if (appointmentId && !isDemoMode()) {
        setIsLoading(true)
        try {
          const appointmentRef = doc(db, 'appointments', appointmentId)
          const appointmentSnap = await getDoc(appointmentRef)
          
          if (appointmentSnap.exists()) {
            const data = appointmentSnap.data()
            setFormData({
              patientName: data.patientName || '',
              patientEmail: data.patientEmail || '',
              patientPhone: data.patientPhone || '',
              dateTime: data.dateTime ? formatDateForInput(data.dateTime.toDate()) : '',
              symptoms: data.symptoms || '',
              notes: data.notes || '',
              status: data.status || 'scheduled'
            })
            console.log('✅ Appointment data loaded for editing:', data)
          }
        } catch (error) {
          console.error('Error loading appointment data:', error)
          setErrors({ general: 'Eroare la încărcarea datelor programării' })
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadAppointmentData()
  }, [appointmentId])

  // Enhanced form submission with proper create/edit logic
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      setErrors({ general: 'Trebuie să fiți autentificat pentru a crea o programare' })
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

      let savedAppointmentId = appointmentId

      if (isDemoMode()) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        if (!appointmentId) {
          // Create new appointment data
          const appointmentData: Omit<DemoAppointment, 'id'> = {
            doctorId: user.uid,
            patientName: formData.patientName,
            dateTime: new Date(formData.dateTime),
            symptoms: formData.symptoms,
            notes: formData.notes,
            status: formData.status as 'scheduled' | 'completed' | 'no_show',
            createdAt: new Date(),
            updatedAt: new Date()
          }
          const newAppointment = await addDemoAppointment(appointmentData)
          savedAppointmentId = newAppointment
        } else {
          // Update existing appointment
          const updateData: Partial<DemoAppointment> = {
            patientName: formData.patientName,
            dateTime: new Date(formData.dateTime),
            symptoms: formData.symptoms,
            notes: formData.notes,
            status: formData.status as 'scheduled' | 'completed' | 'no_show'
          }
          updateDemoAppointment(appointmentId, updateData)
        }
      } else {
        // FIXED: Proper logic for create vs edit operations
        if (!appointmentId) {
          // Create new appointment
          const appointmentData = {
            doctorId: user.uid,
            patientName: formData.patientName,
            patientEmail: formData.patientEmail,
            patientPhone: formData.patientPhone,
            dateTime: new Date(formData.dateTime),
            symptoms: formData.symptoms,
            notes: formData.notes,
            status: formData.status,
            createdAt: new Date(),
            updatedAt: new Date()
          }
          
          const docRef = await addDoc(collection(db, 'appointments'), appointmentData)
          savedAppointmentId = docRef.id
          console.log('✅ New appointment created successfully:', docRef.id)
        } else {
          // Update existing appointment
          const ref = doc(db, 'appointments', appointmentId)
          const updateData = {
            patientName: formData.patientName,
            patientEmail: formData.patientEmail,
            patientPhone: formData.patientPhone,
            dateTime: new Date(formData.dateTime),
            symptoms: formData.symptoms,
            notes: formData.notes,
            status: formData.status,
            updatedAt: new Date()
          }
          
          await updateDoc(ref, updateData)
          console.log('✅ Appointment updated successfully:', appointmentId)
        }
      }

      // Schedule notification reminders for new appointments or reschedule for updated ones
      if (savedAppointmentId && !isDemoMode()) {
        try {
          const appointmentWithNotifications: AppointmentWithNotifications = {
            id: savedAppointmentId,
            patientName: formData.patientName,
            patientEmail: formData.patientEmail || '',
            dateTime: new Date(formData.dateTime),
            symptoms: formData.symptoms,
            notes: formData.notes,
            status: formData.status,
            doctorId: user.uid,
            notifications: {
              firstNotification: { sent: false },
              secondNotification: { sent: false },
              confirmationReceived: false,
              optedOut: false
            },
            createdAt: serverTimestamp() as Timestamp,
            updatedAt: serverTimestamp() as Timestamp
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
          <div className="loader mb-4"></div>
          <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
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
              className="flex items-center space-x-3 rounded-lg bg-green-50 border border-green-200 p-4 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300"
            >
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <h4 className="font-medium">Succes!</h4>
                <span className="text-sm">
                  {appointmentId 
                    ? 'Programarea a fost actualizată cu succes!' 
                    : 'Programarea a fost creată cu succes!'
                  }
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Patient Name */}
          <div className="md:col-span-2">
            <FormInput
              label="Numele pacientului"
              name="patientName"
              value={formData.patientName}
              onChange={(value) => handleFieldChange('patientName', value)}
              onBlur={() => handleFieldBlur('patientName')}
              error={touched.patientName ? errors.patientName : undefined}
              required
              icon={<User className="w-4 h-4" />}
            />
          </div>

          {/* Patient Email */}
          <div>
            <FormInput
              label="Email pacient"
              name="patientEmail"
              type="email"
              value={formData.patientEmail}
              onChange={(value) => handleFieldChange('patientEmail', value)}
              onBlur={() => handleFieldBlur('patientEmail')}
              error={touched.patientEmail ? errors.patientEmail : undefined}
              icon={<Mail className="w-4 h-4" />}
            />
          </div>

          {/* Patient Phone */}
          <div>
            <FormInput
              label="Telefon pacient"
              name="patientPhone"
              type="tel"
              value={formData.patientPhone}
              onChange={(value) => handleFieldChange('patientPhone', value)}
              onBlur={() => handleFieldBlur('patientPhone')}
              error={touched.patientPhone ? errors.patientPhone : undefined}
              icon={<MessageSquare className="w-4 h-4" />}
            />
          </div>

          {/* Date and Time */}
          <div className="md:col-span-2">
            <FormInput
              label="Data și ora programării"
              name="dateTime"
              type="datetime-local"
              value={formData.dateTime}
              onChange={(value) => handleFieldChange('dateTime', value)}
              onBlur={() => handleFieldBlur('dateTime')}
              error={touched.dateTime ? errors.dateTime : undefined}
              required
              icon={<Clock className="w-4 h-4" />}
            />
          </div>

          {/* Symptoms */}
          <div className="md:col-span-2">
            <FormInput
              label="Simptome"
              name="symptoms"
              value={formData.symptoms}
              onChange={(value) => handleFieldChange('symptoms', value)}
              onBlur={() => handleFieldBlur('symptoms')}
              error={touched.symptoms ? errors.symptoms : undefined}
              required
              multiline
              rows={3}
              icon={<Activity className="w-4 h-4" />}
            />
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <FormInput
              label="Note suplimentare"
              name="notes"
              value={formData.notes}
              onChange={(value) => handleFieldChange('notes', value)}
              onBlur={() => handleFieldBlur('notes')}
              error={touched.notes ? errors.notes : undefined}
              multiline
              rows={2}
              icon={<FileText className="w-4 h-4" />}
            />
          </div>

          {/* Status */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status programare
            </label>
            <div className="grid grid-cols-3 gap-3">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleFieldChange('status', option.value)}
                  className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border transition-colors ${
                    formData.status === option.value
                      ? 'border-medflow-primary bg-medflow-primary/10 text-medflow-primary'
                      : 'border-gray-300 dark:border-gray-600 hover:border-medflow-primary/50'
                  }`}
                >
                  {option.icon}
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-4">
            {isSubmitting && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-4 h-4 border-2 border-medflow-primary border-t-transparent rounded-full animate-spin"></div>
                <span>Se salvează... {saveProgress}%</span>
              </div>
            )}
          </div>

          <motion.button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
              isFormValid && !isSubmitting
                ? 'bg-medflow-primary text-white hover:bg-medflow-primary/90 shadow-lg hover:shadow-xl'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
            whileHover={isFormValid && !isSubmitting ? { scale: 1.02 } : {}}
            whileTap={isFormValid && !isSubmitting ? { scale: 0.98 } : {}}
          >
            <Save className="w-4 h-4" />
            <span>
              {isSubmitting 
                ? 'Se salvează...' 
                : appointmentId 
                  ? 'Actualizează programarea' 
                  : 'Creează programarea'
              }
            </span>
          </motion.button>
        </div>
      </motion.form>
    </div>
  )

  // Helper functions (these would need to be implemented)
  function handleFieldChange(field: keyof AppointmentFormData, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  function handleFieldBlur(field: keyof AppointmentFormData) {
    // Validate field on blur
    const validation = validateAppointmentForm(formData)
    if (validation.errors[field]) {
      setErrors(prev => ({ ...prev, [field]: validation.errors[field] }))
    }
  }
}


