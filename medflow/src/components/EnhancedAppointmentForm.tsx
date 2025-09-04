/**
 * Enhanced Appointment Form Component with Patient Management Integration
 * 
 * This component integrates the unified patient management system with the appointment form.
 * It replaces the basic patient input fields with advanced patient search and creation.
 * 
 * @author MedFlow Team
 * @version 2.0
 */

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Clock, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Save,
  Plus,
  Calendar,
  Activity,
  Stethoscope,
  Mail,
  MessageSquare,
  Loader2
} from 'lucide-react'
import { Timestamp, addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../providers/AuthProvider'
import { isDemoMode, addDemoAppointment, updateDemoAppointment, DemoAppointment } from '../utils/demo'
import NotificationSchedulerService from '../services/notificationScheduler'
import { AppointmentWithNotifications } from '../types/notifications'
import { Patient } from '../types/patient'
import { patientService } from '../services/patientService'
import PatientSearch from './PatientSearch'
import PatientCreationForm from './PatientCreationForm'
import { 
  validateAppointmentForm, 
  AppointmentFormData,
  AppointmentFormErrors
} from '../utils/appointmentValidation'

export type AppointmentStatus = 'scheduled' | 'completed' | 'no_show'

export interface Appointment {
  id?: string
  doctorId: string
  patientId?: string  // New: Reference to patient document
  patientName: string
  patientEmail?: string
  patientPhone?: string
  patientCNP?: string  // New: CNP from patient record
  dateTime: Date
  symptoms: string
  notes?: string
  status: AppointmentStatus
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

interface EnhancedAppointmentFormProps {
  appointmentId?: string
  onSaved?: () => void
  initialData?: {
    patientName?: string
    dateTime?: string
    symptoms?: string
    notes?: string
  }
}

export default function EnhancedAppointmentForm({ 
  appointmentId, 
  onSaved, 
  initialData 
}: EnhancedAppointmentFormProps) {
  const { user } = useAuth()
  
  // Enhanced form state with patient integration
  const [formData, setFormData] = useState<AppointmentFormData>({
    patientName: initialData?.patientName || '',
    patientEmail: '',
    patientPhone: '',
    dateTime: initialData?.dateTime || '',
    symptoms: initialData?.symptoms || '',
    notes: initialData?.notes || '',
    status: 'scheduled'
  })

  // Patient management state
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [showPatientCreation, setShowPatientCreation] = useState(false)
  const [isCreatingPatient, setIsCreatingPatient] = useState(false)

  // Form state management
  const [errors, setErrors] = useState<AppointmentFormErrors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof AppointmentFormData, boolean>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [saveProgress, setSaveProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

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
            
            // Load patient data if patientId exists
            if (data.patientId) {
              try {
                const patient = await patientService.getPatient(data.patientId)
                if (patient) {
                  setSelectedPatient(patient)
                  setFormData({
                    patientName: patient.personalInfo.fullName,
                    patientEmail: patient.contactInfo.email || '',
                    patientPhone: patient.contactInfo.phone || '',
                    dateTime: data.dateTime ? formatDateForInput(data.dateTime.toDate()) : '',
                    symptoms: data.symptoms || '',
                    notes: data.notes || '',
                    status: data.status || 'scheduled'
                  })
                }
              } catch (error) {
                console.error('Error loading patient data:', error)
                // Fallback to basic patient data
                setFormData({
                  patientName: data.patientName || '',
                  patientEmail: data.patientEmail || '',
                  patientPhone: data.patientPhone || '',
                  dateTime: data.dateTime ? formatDateForInput(data.dateTime.toDate()) : '',
                  symptoms: data.symptoms || '',
                  notes: data.notes || '',
                  status: data.status || 'scheduled'
                })
              }
            } else {
              // Legacy appointment without patient reference
              setFormData({
                patientName: data.patientName || '',
                patientEmail: data.patientEmail || '',
                patientPhone: data.patientPhone || '',
                dateTime: data.dateTime ? formatDateForInput(data.dateTime.toDate()) : '',
                symptoms: data.symptoms || '',
                notes: data.notes || '',
                status: data.status || 'scheduled'
              })
            }
            
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

  // Handle patient selection
  const handlePatientSelect = useCallback((patient: Patient | null) => {
    setSelectedPatient(patient)
    
    if (patient) {
      // Auto-fill form with patient data
      setFormData(prev => ({
        ...prev,
        patientName: patient.personalInfo.fullName,
        patientEmail: patient.contactInfo.email || '',
        patientPhone: patient.contactInfo.phone || ''
      }))
      
      // Clear patient-related errors
      setErrors(prev => ({
        ...prev,
        patientName: undefined,
        patientEmail: undefined,
        patientPhone: undefined
      }))
    } else {
      // Clear patient data
      setFormData(prev => ({
        ...prev,
        patientName: '',
        patientEmail: '',
        patientPhone: ''
      }))
    }
  }, [])

  // Handle patient creation
  const handlePatientCreated = useCallback((patient: Patient) => {
    setSelectedPatient(patient)
    setShowPatientCreation(false)
    setIsCreatingPatient(false)
    
    // Auto-fill form with new patient data
    setFormData(prev => ({
      ...prev,
      patientName: patient.personalInfo.fullName,
      patientEmail: patient.contactInfo.email || '',
      patientPhone: patient.contactInfo.phone || ''
    }))
  }, [])

  // Enhanced form submission with patient integration
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
        // Enhanced appointment data with patient integration
        const appointmentData = {
          doctorId: user.uid,
          patientId: selectedPatient?.id, // Reference to patient document
          patientName: formData.patientName,
          patientEmail: formData.patientEmail,
          patientPhone: formData.patientPhone,
          patientCNP: selectedPatient?.personalInfo.cnp, // CNP from patient record
          dateTime: new Date(formData.dateTime),
          symptoms: formData.symptoms,
          notes: formData.notes,
          status: formData.status,
          createdAt: new Date(),
          updatedAt: new Date()
        }

        if (!appointmentId) {
          // Create new appointment
          const docRef = await addDoc(collection(db, 'appointments'), appointmentData)
          savedAppointmentId = docRef.id
          console.log('✅ New appointment created successfully:', docRef.id)
        } else {
          // Update existing appointment
          const ref = doc(db, 'appointments', appointmentId)
          const updateData = {
            ...appointmentData,
            createdAt: undefined // Don't update creation date
          }
          delete updateData.createdAt
          
          await updateDoc(ref, updateData)
          console.log('✅ Appointment updated successfully:', appointmentId)
        }
      }

      // Schedule notification reminders
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
            await NotificationSchedulerService.scheduleAppointmentNotifications(appointmentWithNotifications)
            console.log('Notification reminders scheduled for new appointment')
          } else {
            await NotificationSchedulerService.rescheduleAppointmentNotifications(
              savedAppointmentId, 
              new Date(formData.dateTime)
            )
            console.log('Notification reminders rescheduled for updated appointment')
          }
        } catch (notificationError) {
          console.warn('Failed to schedule notification reminders:', notificationError)
        }
      }

      clearInterval(progressInterval)
      setSaveProgress(100)

      // Success feedback
      setSubmitSuccess(true)
      setTimeout(() => {
        setSubmitSuccess(false)
        onSaved?.()
      }, 2000)

    } catch (error) {
      console.error('Error saving appointment:', error)
      setErrors({ general: 'Eroare la salvarea programării' })
    } finally {
      setIsSubmitting(false)
    }
  }, [user, formData, selectedPatient, appointmentId, onSaved])

  // Handle field changes
  const handleFieldChange = useCallback((field: keyof AppointmentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }, [errors])

  // Handle field blur
  const handleFieldBlur = useCallback((field: keyof AppointmentFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    
    // Validate field on blur
    const validation = validateAppointmentForm(formData)
    if (validation.errors[field]) {
      setErrors(prev => ({ ...prev, [field]: validation.errors[field] }))
    }
  }, [formData])

  // Form validation
  const isFormValid = formData.patientName.trim() && 
                     formData.dateTime && 
                     formData.symptoms.trim()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-medflow-primary" />
        <span className="ml-2 text-gray-600">Se încarcă datele...</span>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <motion.form
        onSubmit={handleSubmit}
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            {appointmentId ? 'Editează Programarea' : 'Programare Nouă'}
          </h2>
        </div>

        {/* Error Message */}
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

        {/* Patient Selection Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5" />
              Pacient
            </h3>
            {!selectedPatient && (
              <button
                type="button"
                onClick={() => setShowPatientCreation(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-medflow-primary text-white rounded-lg hover:bg-medflow-primary-dark transition-colors"
              >
                <Plus className="w-4 h-4" />
                Pacient Nou
              </button>
            )}
          </div>

          {showPatientCreation ? (
            <PatientCreationForm
              onPatientCreated={handlePatientCreated}
              onCancel={() => setShowPatientCreation(false)}
            />
          ) : (
            <PatientSearch
              onPatientSelect={handlePatientSelect}
              selectedPatient={selectedPatient}
              placeholder="Căutați pacient după nume, CNP, email sau telefon..."
            />
          )}

          {/* Patient Info Display */}
          {selectedPatient && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-green-50 border border-green-200 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <h4 className="font-medium text-green-800">
                      {selectedPatient.personalInfo.fullName}
                    </h4>
                    <div className="text-sm text-green-600 space-y-1">
                      {selectedPatient.personalInfo.cnp && (
                        <p>CNP: {selectedPatient.personalInfo.cnp}</p>
                      )}
                      {selectedPatient.contactInfo.phone && (
                        <p>Telefon: {selectedPatient.contactInfo.phone}</p>
                      )}
                      {selectedPatient.contactInfo.email && (
                        <p>Email: {selectedPatient.contactInfo.email}</p>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handlePatientSelect(null)}
                  className="text-green-600 hover:text-green-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Appointment Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Detalii Programare
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date and Time */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Data și ora programării *
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={formData.dateTime}
                  onChange={(e) => handleFieldChange('dateTime', e.target.value)}
                  onBlur={() => handleFieldBlur('dateTime')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-medflow-primary focus:border-medflow-primary ${
                    touched.dateTime && errors.dateTime ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                />
                <Clock className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
              </div>
              {touched.dateTime && errors.dateTime && (
                <p className="mt-1 text-sm text-red-600">{errors.dateTime}</p>
              )}
            </div>

            {/* Symptoms */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Simptome *
              </label>
              <div className="relative">
                <textarea
                  value={formData.symptoms}
                  onChange={(e) => handleFieldChange('symptoms', e.target.value)}
                  onBlur={() => handleFieldBlur('symptoms')}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-medflow-primary focus:border-medflow-primary ${
                    touched.symptoms && errors.symptoms ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Descrieți simptomele pacientului..."
                  required
                />
                <Activity className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
              </div>
              {touched.symptoms && errors.symptoms && (
                <p className="mt-1 text-sm text-red-600">{errors.symptoms}</p>
              )}
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Note suplimentare
              </label>
              <div className="relative">
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleFieldChange('notes', e.target.value)}
                  onBlur={() => handleFieldBlur('notes')}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medflow-primary focus:border-medflow-primary"
                  placeholder="Note suplimentare despre programare..."
                />
                <FileText className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
              </div>
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
}

// Utility function for date formatting
function formatDateForInput(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  
  return `${year}-${month}-${day}T${hours}:${minutes}`
}
