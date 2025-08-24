/**
 * Appointment Response Component for MedFlow
 * 
 * Features:
 * - Public appointment confirmation/cancellation page
 * - Token-based secure access without authentication
 * - Patient-friendly interface for appointment actions
 * - Integration with appointment management system
 * - Feedback collection and analytics
 * - NEW: Advanced reschedule appointment functionality with v0 calendar
 * 
 * @author MedFlow Team
 * @version 2.2
 */

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  CheckCircle, 
  XCircle, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Mail,
  User,
  Stethoscope,
  AlertTriangle,
  ThumbsUp,
  MessageSquare,
  Heart,
  Shield,
  RefreshCw
} from 'lucide-react'
import { fadeInVariants, cardVariants } from '../utils/animations'
import LoadingSpinner from '../components/LoadingSpinner'
import { RescheduleCalendar } from '../components/reschedule'
import { submitRescheduleRequest } from '../services/appointmentService'

interface AppointmentInfo {
  id: string
  patientName: string
  patientEmail: string
  patientPhone: string
  doctorName: string
  doctorSpecialty: string
  dateTime: Date
  duration: number
  location: string
  symptoms: string
  notes?: string
  status: 'confirmed' | 'pending' | 'cancelled'
  confirmationDeadline: Date
}

interface ResponseData {
  action: 'confirm' | 'cancel' | 'reschedule'
  feedback?: string
  rating?: number
  reason?: string
  newDateTime?: Date
}

export default function AppointmentResponse() {
  const { token } = useParams<{ token: string }>()
  const [appointment, setAppointment] = useState<AppointmentInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [response, setResponse] = useState<ResponseData | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  
  // NEW: Reschedule state
  const [showReschedule, setShowReschedule] = useState(false)
  const [rescheduleReason, setRescheduleReason] = useState('')

  // Simulate fetching appointment data based on token
  useEffect(() => {
    const fetchAppointmentData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Mock appointment data based on token
        if (token === 'invalid-token') {
          throw new Error('Token invalid sau expirat')
        }

        const mockAppointment: AppointmentInfo = {
          id: 'apt-123',
          patientName: 'Ion Popescu',
          patientEmail: 'ion.popescu@email.com',
          patientPhone: '+40 721 123 456',
          doctorName: 'Dr. Maria Ionescu',
          doctorSpecialty: 'Cardiologie',
          dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          duration: 45,
          location: 'Cabinet Medical MedFlow, Str. Sănătății 123, București',
          symptoms: 'Control de rutină cardiologic, palpitații ocazionale',
          notes: 'Vă rugăm să aduceți rezultatele analizelor recente',
          status: 'pending',
          confirmationDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day from now
        }

        setAppointment(mockAppointment)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Eroare la încărcarea datelor')
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchAppointmentData()
    } else {
      setError('Token lipsă')
      setLoading(false)
    }
  }, [token])

  const handleResponse = async (action: 'confirm' | 'cancel' | 'reschedule', data?: Partial<ResponseData>) => {
    if (!appointment) return

    setSubmitting(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      const responseData: ResponseData = {
        action,
        ...data
      }

      setResponse(responseData)
      setSubmitted(true)

      // Update appointment status
      if (action === 'reschedule' && data?.newDateTime) {
        setAppointment(prev => prev ? {
          ...prev,
          dateTime: data.newDateTime!,
          status: 'confirmed'
        } : null)
      } else {
        setAppointment(prev => prev ? {
          ...prev,
          status: action === 'confirm' ? 'confirmed' : 'cancelled'
        } : null)
      }

    } catch (err) {
      setError('Eroare la procesarea răspunsului')
    } finally {
      setSubmitting(false)
    }
  }

  const handleFeedbackSubmit = (feedback: string, rating: number) => {
    setResponse(prev => prev ? { ...prev, feedback, rating } : null)
    setShowFeedback(false)
  }

  // NEW: Handle reschedule from v0 calendar
  const handleRescheduleFromCalendar = async (selectedDate: Date, selectedTime: string) => {
    if (!appointment) return
    
    setSubmitting(true)
    
    try {
      // Parse the time string (format: "09:00 - 09:45")
      const [startTime] = selectedTime.split(' - ')
      const [hours, minutes] = startTime.split(':').map(Number)
      
      const newDateTime = new Date(selectedDate)
      newDateTime.setHours(hours, minutes, 0, 0)
      
      // Submit reschedule request to the service
      const success = await submitRescheduleRequest({
        appointmentId: appointment.id,
        newDateTime,
        reason: rescheduleReason,
        patientName: appointment.patientName,
        patientEmail: appointment.patientEmail
      })
      
      if (success) {
        // Update local state and show success
        handleResponse('reschedule', {
          newDateTime,
          reason: rescheduleReason
        })
        setShowReschedule(false)
      } else {
        setError('Eroare la procesarea cererii de reprogramare. Vă rugăm să încercați din nou.')
      }
    } catch (error) {
      console.error('Error during reschedule:', error)
      setError('Eroare la procesarea cererii de reprogramare. Vă rugăm să încercați din nou.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loader mb-4"></div>
          <p className="text-lg font-medium text-[var(--medflow-text-tertiary)] dark:text-gray-400">
            Se încarcă informațiile programării...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          variants={fadeInVariants}
          initial="initial"
          animate="animate"
          className="text-center max-w-md mx-auto p-8"
        >
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[var(--medflow-text-primary)] dark:text-white mb-2">
            Eroare
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error}
          </p>
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-200">
              Dacă aveți probleme, vă rugăm să contactați cabinetul medical direct.
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          variants={fadeInVariants}
          initial="initial"
          animate="animate"
          className="text-center"
        >
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[var(--medflow-text-primary)] dark:text-white mb-2">
            Programare negăsită
          </h1>
          <p className="text-[var(--medflow-text-tertiary)] dark:text-gray-400">
            Nu am putut găsi programarea solicitată.
          </p>
        </motion.div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          variants={fadeInVariants}
          initial="initial"
          animate="animate"
          className="text-center max-w-lg mx-auto p-8"
        >
          <div className="mb-6">
            {response?.action === 'confirm' ? (
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
            ) : response?.action === 'reschedule' ? (
              <RefreshCw className="w-20 h-20 text-blue-500 mx-auto" />
            ) : (
              <XCircle className="w-20 h-20 text-red-500 mx-auto" />
            )}
          </div>
          
          <h1 className="text-3xl font-bold text-[var(--medflow-text-primary)] dark:text-white mb-4">
            {response?.action === 'confirm' 
              ? 'Programare confirmată!' 
              : response?.action === 'reschedule'
              ? 'Reprogramare confirmată!'
              : 'Programare anulată'
            }
          </h1>
          
          <div className="rounded-xl p-6 border border-[var(--medflow-border)] dark:border-gray-700 mb-6">
            <h3 className="font-semibold text-[var(--medflow-text-primary)] dark:text-white mb-3">
              Detalii programare:
            </h3>
            <div className="space-y-2 text-sm text-[var(--medflow-text-tertiary)] dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>{appointment.patientName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{appointment.dateTime.toLocaleDateString('ro-RO')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>{appointment.dateTime.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Stethoscope className="w-4 h-4" />
                <span>Dr. {appointment.doctorName} - {appointment.doctorSpecialty}</span>
              </div>
            </div>
          </div>

          {response?.action === 'confirm' ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                  Ce urmează:
                </h4>
                <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  <li>• Veți primi un email de confirmare</li>
                  <li>• Vor fi trimise reminder-uri automate</li>
                  <li>• Contactați cabinetul pentru întrebări</li>
                </ul>
              </div>

              {!showFeedback && (
                <button
                  onClick={() => setShowFeedback(true)}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>Lăsați feedback despre experiența dvs.</span>
                </button>
              )}
            </div>
          ) : response?.action === 'reschedule' ? (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                Reprogramare confirmată
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Programarea dvs. a fost reprogramată cu succes. Veți primi un email de confirmare cu noua dată.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                Programare anulată
              </h4>
              <p className="text-sm text-red-700 dark:text-red-300">
                Dacă doriți să reprogramați, vă rugăm să contactați cabinetul medical.
              </p>
            </div>
          )}

          {/* Feedback Form */}
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-6 bg-[var(--medflow-surface-elevated)] dark:bg-[var(--medflow-surface-dark)] rounded-xl border border-[var(--medflow-border)] dark:border-gray-700"
            >
              <h4 className="font-semibold text-[var(--medflow-text-primary)] dark:text-white mb-4">
                Cum a fost experiența dvs.?
              </h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--medflow-text-secondary)] dark:text-gray-300 mb-2">
                    Evaluare generală:
                  </label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        className="p-2 text-yellow-400 hover:text-yellow-500 transition-colors"
                      >
                        <Heart className="w-6 h-6 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[var(--medflow-text-secondary)] dark:text-gray-300 mb-2">
                    Comentarii (opțional):
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-[var(--medflow-border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-[var(--medflow-surface-dark)] dark:border-gray-600"
                    rows={3}
                    placeholder="Spuneți-ne cum putem îmbunătăți experiența..."
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleFeedbackSubmit('Great experience!', 5)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Trimite feedback
                  </button>
                  <button
                    onClick={() => setShowFeedback(false)}
                    className="px-4 py-2 text-[var(--medflow-text-tertiary)] dark:text-gray-400 hover:text-[var(--medflow-text-primary)] dark:hover:text-gray-200 transition-colors"
                  >
                    Anulează
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Contact Info */}
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Contact cabinet medical</span>
            </h4>
            <div className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
              <div className="flex items-center space-x-2">
                <Phone className="w-3 h-3" />
                <span>+40 21 123 4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-3 h-3" />
                <span>contact@medflow.ro</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-3 h-3" />
                <span>Str. Sănătății 123, București</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          variants={fadeInVariants}
          initial="initial"
          animate="animate"
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-[var(--medflow-text-primary)] dark:text-white mb-2">
              Confirmarea programării
            </h1>
            <p className="text-[var(--medflow-text-tertiary)] dark:text-gray-400">
              Vă rugăm să confirmați, să anulați sau să reprogramați programarea de mai jos
            </p>
          </div>

          {/* Appointment Details */}
          <motion.div
            variants={cardVariants}
            className="bg-[var(--medflow-surface-elevated)] dark:bg-[var(--medflow-surface-dark)] rounded-xl p-6 border border-[var(--medflow-border)] dark:border-gray-700 shadow-lg"
          >
            <h3 className="text-lg font-semibold text-[var(--medflow-text-primary)] dark:text-white mb-4">
              Detalii programare
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-[var(--medflow-text-muted)]" />
                <div>
                  <p className="font-medium text-[var(--medflow-text-primary)] dark:text-white">
                    {appointment.patientName}
                  </p>
                  <p className="text-sm text-[var(--medflow-text-tertiary)] dark:text-gray-400">
                    {appointment.patientEmail} • {appointment.patientPhone}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Stethoscope className="w-5 h-5 text-[var(--medflow-text-muted)]" />
                <div>
                  <p className="font-medium text-[var(--medflow-text-primary)] dark:text-white">
                    {appointment.doctorName}
                  </p>
                  <p className="text-sm text-[var(--medflow-text-tertiary)] dark:text-gray-400">
                    {appointment.doctorSpecialty}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-[var(--medflow-text-muted)]" />
                <div>
                  <p className="font-medium text-[var(--medflow-text-primary)] dark:text-white">
                    {appointment.dateTime.toLocaleDateString('ro-RO', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p className="text-sm text-[var(--medflow-text-tertiary)] dark:text-gray-400">
                    Ora: {appointment.dateTime.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })} 
                    • Durată: {appointment.duration} minute
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-[var(--medflow-text-muted)] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-[var(--medflow-text-primary)] dark:text-white">Locația</p>
                  <p className="text-sm text-[var(--medflow-text-tertiary)] dark:text-gray-400">
                    {appointment.location}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <MessageSquare className="w-5 h-5 text-[var(--medflow-text-muted)] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-[var(--medflow-text-primary)] dark:text-white">Motivul consultației</p>
                  <p className="text-sm text-[var(--medflow-text-tertiary)] dark:text-gray-400">
                    {appointment.symptoms}
                  </p>
                  {appointment.notes && (
                    <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>Notă importantă:</strong> {appointment.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Deadline Warning */}
          <motion.div
            variants={cardVariants}
            className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
          >
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Vă rugăm să răspundeți până pe{' '}
                <strong>
                  {appointment.confirmationDeadline.toLocaleDateString('ro-RO')} la {' '}
                  {appointment.confirmationDeadline.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                </strong>
              </p>
            </div>
          </motion.div>

          {/* NEW: Advanced Reschedule Interface with v0 Calendar */}
          {showReschedule && (
            <motion.div
              variants={cardVariants}
              className="bg-[var(--medflow-surface-elevated)] dark:bg-[var(--medflow-surface-dark)] rounded-xl p-6 border border-[var(--medflow-border)] dark:border-gray-700 shadow-lg"
            >
              <h3 className="text-lg font-semibold text-[var(--medflow-text-primary)] dark:text-white mb-4">
                Reprogramare programare
              </h3>
              
              {/* Reschedule Reason */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[var(--medflow-text-secondary)] dark:text-gray-300 mb-2">
                  Motivul reprogramării (opțional):
                </label>
                <textarea
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--medflow-border)] rounded-lg focus:ring-2 focus:ring-[var(--medflow-brand-1)] focus:border-[var(--medflow-brand-1)] dark:bg-[var(--medflow-surface-dark)] dark:border-gray-600"
                  rows={3}
                  placeholder="De ce doriți să reprogramați?"
                />
              </div>
              
              {/* v0 Reschedule Calendar */}
              <div className="mb-6">
                <RescheduleCalendar 
                  experience={{
                    title: "Reprogramare programare medicală",
                    dates: [
                      {
                        id: "1",
                        label: "Astăzi",
                        date: new Date().toISOString().split('T')[0],
                        dateRange: "Disponibil"
                      },
                      {
                        id: "2", 
                        label: "Mâine",
                        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        dateRange: "Disponibil"
                      }
                    ]
                  }}
                  onReschedule={handleRescheduleFromCalendar}
                  excludeAppointmentId={appointment.id}
                  appointmentDetails={{
                    patientName: appointment.patientName,
                    doctorName: appointment.doctorName,
                    doctorSpecialty: appointment.doctorSpecialty,
                    location: appointment.location
                  }}
                />
              </div>
              
              {/* Reschedule Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowReschedule(false)}
                  className="px-6 py-3 text-[var(--medflow-text-tertiary)] dark:text-gray-400 hover:text-[var(--medflow-text-primary)] dark:hover:text-gray-200 transition-colors"
                >
                  Anulează
                </button>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            variants={cardVariants}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <button
              onClick={() => handleResponse('confirm')}
              disabled={submitting}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Confirm programarea</span>
                </>
              )}
            </button>
            
            <button
              onClick={() => setShowReschedule(true)}
              disabled={submitting}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-[var(--medflow-brand-1)] text-white rounded-lg hover:bg-[var(--medflow-brand-2)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Reprogramează</span>
            </button>
            
            <button
              onClick={() => handleResponse('cancel')}
              disabled={submitting}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <XCircle className="w-5 h-5" />
                  <span>Anulează programarea</span>
                </>
              )}
            </button>
          </motion.div>

          {/* Footer */}
          <div className="text-center text-sm text-[var(--medflow-text-muted)] dark:text-gray-400">
            <p>
              Acest link este securizat și personal. Nu îl distribuiți altor persoane.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}