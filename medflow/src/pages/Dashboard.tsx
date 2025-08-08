import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { db } from '../services/firebase'
import { isDemoMode, subscribeToDemoAppointments } from '../utils/demo'
import { useAuth } from '../providers/AuthProvider'
import ModernCalendar from '../components/ModernCalendar'
import { motion } from 'framer-motion'
import { StatsCard } from '../components/AnimatedCard'
import { staggerContainer, staggerItem } from '../utils/animations'
import { Calendar, CheckCircle, Clock, XCircle } from 'lucide-react'

interface Appointment {
  id: string
  patientName: string
  dateTime: Date
  symptoms: string
  notes?: string
  status: 'scheduled' | 'completed' | 'no_show'
  doctorId: string
}

export default function Dashboard() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [fallbackActive, setFallbackActive] = useState(false)
  const [indexLink, setIndexLink] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) return

    if (isDemoMode()) {
      const unsubscribe = subscribeToDemoAppointments((demoAppointments) => {
        setAppointments(demoAppointments.map(appt => ({
          ...appt,
          dateTime: new Date(appt.dateTime?.toDate?.() || appt.dateTime)
        })))
        setFallbackActive(false)
        setIndexLink(null)
      })
      return unsubscribe
    }

    const q = query(
      collection(db, 'appointments'),
      where('doctorId', '==', user.uid),
      orderBy('dateTime', 'desc')
    )
    
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows: Appointment[] = snap.docs.map((d) => {
          const data = d.data() as any
          return {
            id: d.id,
            patientName: data.patientName,
            dateTime: new Date(data.dateTime?.toDate?.() || data.dateTime),
            symptoms: data.symptoms,
            notes: data.notes,
            status: data.status,
            doctorId: data.doctorId,
          }
        })
        setFallbackActive(false)
        setIndexLink(null)
        setAppointments(rows)
      },
      (error) => {
        console.error('Dashboard: Firestore snapshot error, falling back to sample data:', error)
        setFallbackActive(true)
        try {
          const msg: string = (error?.message || '') as string
          const match = msg.match(/https?:\/\/[^\s]+/)
          setIndexLink(match ? match[0] : null)
        } catch {}
      }
    )
    return () => unsub()
  }, [user])

  const handleAppointmentClick = (appointment: Appointment) => {
    navigate(`/appointments?edit=${appointment.id}`)
  }

  const handleTimeSlotClick = (date: Date) => {
    const iso = new Date(date.getTime() - date.getTimezoneOffset()*60000).toISOString().slice(0,16)
    navigate(`/appointments?new=${encodeURIComponent(iso)}`)
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header with stats */}
      <motion.div 
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid gap-6 md:grid-cols-4"
      >
        <motion.div variants={staggerItem}>
          <StatsCard
            title="Programări astăzi"
            value={appointments.filter(appt => {
              const today = new Date()
              const apptDate = new Date(appt.dateTime)
              return apptDate.toDateString() === today.toDateString()
            }).length}
            icon={<Calendar className="w-6 h-6" />}
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white"
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <StatsCard
            title="Finalizate"
            value={appointments.filter(appt => appt.status === 'completed').length}
            icon={<CheckCircle className="w-6 h-6" />}
            className="bg-gradient-to-br from-green-500 to-green-600 text-white"
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <StatsCard
            title="Programate"
            value={appointments.filter(appt => appt.status === 'scheduled').length}
            icon={<Clock className="w-6 h-6" />}
            className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white"
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <StatsCard
            title="Nu s-au prezentat"
            value={appointments.filter(appt => appt.status === 'no_show').length}
            icon={<XCircle className="w-6 h-6" />}
            className="bg-gradient-to-br from-red-500 to-red-600 text-white"
          />
        </motion.div>
      </motion.div>

      {/* Alerts */}
      {fallbackActive && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-amber-50 border border-amber-200 p-4 dark:bg-amber-900/20 dark:border-amber-800"
        >
          <div className="flex items-start">
            <svg className="w-5 h-5 text-amber-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Nu s-au putut încărca datele reale din Firestore
              </h3>
              <div className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                Se afișează date de exemplu.
                {indexLink && (
                  <div className="mt-1">
                    Creați indexul necesar: <a className="underline" href={indexLink} target="_blank" rel="noreferrer">Deschide consola Firebase</a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {isDemoMode() && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-blue-50 border border-blue-200 p-4 dark:bg-blue-900/20 dark:border-blue-800"
        >
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Mod demo activ
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                Datele sunt simulate pentru demonstrație.
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Modern Calendar */}
      <ModernCalendar
        onAppointmentClick={handleAppointmentClick}
        onTimeSlotClick={handleTimeSlotClick}
      />
    </motion.section>
  )
}