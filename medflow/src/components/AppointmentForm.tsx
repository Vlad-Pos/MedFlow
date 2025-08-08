import { useEffect, useState } from 'react'
import { Timestamp, addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../providers/AuthProvider'
import { isDemoMode, addDemoAppointment, updateDemoAppointment, getDemoAppointments } from '../utils/demo'
import { motion } from 'framer-motion'
import { User, Calendar, Clock, FileText, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { formatDateForInput } from '../utils/dateUtils'

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

export default function AppointmentForm({ appointmentId, onSaved }: { appointmentId?: string, onSaved?: () => void }) {
  const { user } = useAuth()
  const [patientName, setPatientName] = useState('')
  const [dateTime, setDateTime] = useState<string>('')
  const [symptoms, setSymptoms] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<AppointmentStatus>('scheduled')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function load() {
      if (!appointmentId) return
      
      setIsLoading(true)
      
      if (isDemoMode()) {
        // Load from demo appointments
        const demoAppointments = getDemoAppointments()
        const appointment = demoAppointments.find(a => a.id === appointmentId)
        if (appointment) {
          setPatientName(appointment.patientName || '')
          setDateTime(formatDateForInput(new Date(appointment.dateTime?.toDate?.() || appointment.dateTime)) + 'T' + new Date(appointment.dateTime?.toDate?.() || appointment.dateTime).toTimeString().slice(0, 5))
          setSymptoms(appointment.symptoms || '')
          setNotes(appointment.notes || '')
          setStatus((appointment.status as AppointmentStatus) || 'scheduled')
        }
        setIsLoading(false)
        return
      }
      
      try {
        const ref = doc(db, 'appointments', appointmentId)
        const snap = await getDoc(ref)
        if (snap.exists()) {
          const data = snap.data() as any
          setPatientName(data.patientName || '')
          setDateTime(formatDateForInput(new Date(data.dateTime?.toDate?.() || data.dateTime)) + 'T' + new Date(data.dateTime?.toDate?.() || data.dateTime).toTimeString().slice(0, 5))
          setSymptoms(data.symptoms || '')
          setNotes(data.notes || '')
          setStatus((data.status as AppointmentStatus) || 'scheduled')
        }
      } catch (err) {
        console.error('Error loading appointment:', err)
        setError('Eroare la încărcarea programării')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [appointmentId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    
    if (!user) { 
      setError('Autentificare necesară')
      setIsSubmitting(false)
      return 
    }
    if (!patientName.trim()) { 
      setError('Introduceți numele pacientului')
      setIsSubmitting(false)
      return 
    }
    if (!dateTime) { 
      setError('Selectați data și ora')
      setIsSubmitting(false)
      return 
    }
    if (!symptoms.trim()) { 
      setError('Completați simptomele')
      setIsSubmitting(false)
      return 
    }

    try {
      const payload: any = {
        doctorId: user.uid,
        patientName: patientName.trim(),
        dateTime: new Date(dateTime),
        symptoms: symptoms.trim(),
        notes: notes.trim() || '',
        status,
        updatedAt: serverTimestamp(),
      }
      
      if (isDemoMode()) {
        if (!appointmentId) {
          // Create new demo appointment
          addDemoAppointment(payload)
        } else {
          // Update existing demo appointment
          updateDemoAppointment(appointmentId, payload)
        }
      } else {
        if (!appointmentId) {
          payload.createdAt = serverTimestamp()
          await addDoc(collection(db, 'appointments'), payload)
        } else {
          const ref = doc(db, 'appointments', appointmentId)
          await updateDoc(ref, payload)
        }
      }
      
      // Clear form after successful save
      if (!appointmentId) {
        setPatientName('')
        setDateTime('')
        setSymptoms('')
        setNotes('')
        setStatus('scheduled')
      }
      
      onSaved?.()
    } catch (err) {
      console.error('Error saving appointment:', err)
      setError('Salvarea programării a eșuat. Încercați din nou.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusIcon = (status: AppointmentStatus) => {
    switch (status) {
      case 'scheduled': return <Clock className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'no_show': return <XCircle className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'no_show': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
    }
  }

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center py-8"
      >
        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Se încarcă...</span>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
      onSubmit={handleSubmit}
    >
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300"
        >
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </motion.div>
      )}

      {/* Patient Name */}
      <div className="space-y-2">
        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <User className="w-4 h-4" />
          <span>Nume pacient</span>
        </label>
        <input
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-colors"
          value={patientName}
          onChange={e => setPatientName(e.target.value)}
          placeholder="Introduceți numele pacientului"
          required
        />
      </div>

      {/* Date and Time */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Calendar className="w-4 h-4" />
            <span>Data</span>
          </label>
          <input
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-colors"
            value={dateTime.split('T')[0] || ''}
            onChange={e => {
              const time = dateTime.split('T')[1] || '09:00'
              setDateTime(`${e.target.value}T${time}`)
            }}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Clock className="w-4 h-4" />
            <span>Ora</span>
          </label>
          <input
            type="time"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-colors"
            value={dateTime.split('T')[1] || '09:00'}
            onChange={e => {
              const date = dateTime.split('T')[0] || new Date().toISOString().split('T')[0]
              setDateTime(`${date}T${e.target.value}`)
            }}
            required
          />
        </div>
      </div>

      {/* Symptoms */}
      <div className="space-y-2">
        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <FileText className="w-4 h-4" />
          <span>Simptome</span>
        </label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-colors resize-none"
          rows={4}
          value={symptoms}
          onChange={e => setSymptoms(e.target.value)}
          placeholder="Descrieți simptomele pacientului..."
          required
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <FileText className="w-4 h-4" />
          <span>Note (opțional)</span>
        </label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-colors resize-none"
          rows={3}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Note suplimentare..."
        />
      </div>

      {/* Status */}
      <div className="space-y-2">
        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <span>Status</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['scheduled', 'completed', 'no_show'] as AppointmentStatus[]).map((statusOption) => (
            <button
              key={statusOption}
              type="button"
              onClick={() => setStatus(statusOption)}
              className={`flex items-center justify-center space-x-2 p-3 rounded-lg border transition-colors ${
                status === statusOption
                  ? `${getStatusColor(statusOption)} border-current`
                  : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {getStatusIcon(statusOption)}
              <span className="text-sm font-medium">
                {statusOption === 'scheduled' ? 'Programat' : 
                 statusOption === 'completed' ? 'Finalizat' : 'Nu s-a prezentat'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={isSubmitting}
        className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors ${
          isSubmitting
            ? 'bg-gray-400 text-white cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        }`}
        whileHover={!isSubmitting ? { scale: 1.02 } : {}}
        whileTap={!isSubmitting ? { scale: 0.98 } : {}}
      >
        {isSubmitting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Salvează...</span>
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4" />
            <span>{appointmentId ? 'Actualizează' : 'Creează'} programarea</span>
          </>
        )}
      </motion.button>
    </motion.form>
  )
}