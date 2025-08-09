/**
 * Enhanced Dashboard Component for MedFlow
 * 
 * Features:
 * - Real-time appointment statistics with MedFlow branding
 * - Enhanced error handling and loading states
 * - Professional medical dashboard styling
 * - AI integration placeholders for future analytics
 * - Responsive design for all devices
 * - Accessibility support with ARIA labels
 * 
 * @author MedFlow Team
 * @version 2.0
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { db } from '../services/firebase'
import { isDemoMode, subscribeToDemoAppointments } from '../utils/demo'
import { useAuth } from '../providers/AuthProvider'
import ModernCalendar from '../components/ModernCalendar'
import LoadingSpinner from '../components/LoadingSpinner'
import { motion, AnimatePresence } from 'framer-motion'
import { StatsCard } from '../components/AnimatedCard'
import DoctorAlerts from '../components/DoctorAlerts'
import SmartRecommendations from '../components/SmartRecommendations'
import { staggerContainer, staggerItem } from '../utils/animations'
import { Calendar, CheckCircle, Clock, XCircle, TrendingUp, Brain, AlertTriangle, Activity } from 'lucide-react'

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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  
  // AI analytics placeholder (for future implementation)
  const [aiInsights] = useState({
    enabled: false, // Will be enabled when AI analytics are implemented
    trendAnalysis: false,
    patientInsights: false,
    scheduleOptimization: false
  })

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    if (isDemoMode()) {
      const unsubscribe = subscribeToDemoAppointments((demoAppointments) => {
        setAppointments(demoAppointments.map(appt => ({
          ...appt,
          dateTime: new Date(appt.dateTime?.toDate?.() || appt.dateTime)
        })))
        setFallbackActive(false)
        setIndexLink(null)
        setLoading(false)
      })
      return unsubscribe
    }

    try {
      const q = query(
        collection(db, 'appointments'),
        where('doctorId', '==', user.uid),
        orderBy('dateTime', 'desc')
      )
      
      const unsub = onSnapshot(
        q,
        (snap) => {
          try {
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
            setLoading(false)
            setError(null)
          } catch (processingError) {
            console.error('Dashboard: Error processing appointment data:', processingError)
            setError('Eroare la procesarea datelor programărilor')
            setLoading(false)
          }
        },
        (firebaseError) => {
          console.error('Dashboard: Firestore snapshot error:', firebaseError)
          setFallbackActive(true)
          setError('Eroare la conectarea cu baza de date. Se afișează date de demonstrație.')
          setLoading(false)
          
          try {
            const msg: string = (firebaseError?.message || '') as string
            const match = msg.match(/https?:\/\/[^\s]+/)
            setIndexLink(match ? match[0] : null)
          } catch {}
        }
      )
      return () => unsub()
    } catch (setupError) {
      console.error('Dashboard: Error setting up Firebase query:', setupError)
      setError('Eroare la configurarea sincronizării datelor')
      setLoading(false)
    }
  }, [user])

  const handleAppointmentClick = (appointment: Appointment) => {
    navigate(`/appointments?edit=${appointment.id}`)
  }

  const handleTimeSlotClick = (date: Date) => {
    const iso = new Date(date.getTime() - date.getTimezoneOffset()*60000).toISOString().slice(0,16)
    navigate(`/appointments?new=${encodeURIComponent(iso)}`)
  }

  // Calculate enhanced statistics
  const todaysAppointments = appointments.filter(appt => {
    const today = new Date()
    const apptDate = new Date(appt.dateTime)
    return apptDate.toDateString() === today.toDateString()
  })
  
  const completedAppointments = appointments.filter(appt => appt.status === 'completed')
  const scheduledAppointments = appointments.filter(appt => appt.status === 'scheduled')
  const noShowAppointments = appointments.filter(appt => appt.status === 'no_show')
  
  // Calculate completion rate for AI insights
  const totalAppointments = completedAppointments.length + noShowAppointments.length
  const completionRate = totalAppointments > 0 ? (completedAppointments.length / totalAppointments * 100).toFixed(1) : '0'

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Se încarcă dashboard-ul medical...
          </p>
        </div>
      </div>
    )
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Enhanced Header with Professional Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard Medical
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitorizarea activității și programărilor medicale
          </p>
        </div>
        
        {/* AI Insights Placeholder */}
        {aiInsights.enabled && (
          <div className="flex items-center space-x-2 px-4 py-2 bg-medflow-primary/10 rounded-lg border border-medflow-primary/20">
            <Brain className="w-4 h-4 text-medflow-primary" />
            <span className="text-sm text-medflow-primary font-medium">
              Analiză AI activă
            </span>
          </div>
        )}
      </div>

      {/* Error State */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center space-x-3 p-4 bg-orange-50 border border-orange-200 rounded-lg dark:bg-orange-900/20 dark:border-orange-800"
          >
            <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-orange-800 dark:text-orange-300">
                Atenție
              </h4>
              <p className="text-sm text-orange-700 dark:text-orange-400">
                {error}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Statistics Cards with MedFlow Branding */}
      <motion.div 
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={staggerItem}>
          <StatsCard
            title="Programări astăzi"
            value={todaysAppointments.length}
            icon={<Calendar className="w-6 h-6" />}
            className="bg-gradient-to-br from-medflow-primary to-medflow-secondary text-white shadow-lg hover:shadow-xl"
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <StatsCard
            title="Consultații finalizate"
            value={completedAppointments.length}
            icon={<CheckCircle className="w-6 h-6" />}
            className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg hover:shadow-xl"
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <StatsCard
            title="În așteptare"
            value={scheduledAppointments.length}
            icon={<Clock className="w-6 h-6" />}
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl"
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <StatsCard
            title="Rata de finalizare"
            value={`${completionRate}%`}
            icon={<TrendingUp className="w-6 h-6" />}
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-xl"
          />
        </motion.div>
      </motion.div>

      {/* AI Analytics Placeholder */}
      {aiInsights.enabled && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-medflow-primary/5 border border-medflow-primary/10 rounded-xl p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Brain className="w-6 h-6 text-medflow-primary" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Analiză AI și Tendințe
            </h3>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-medflow-primary" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Activitate săptămână
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                🤖 Analiză tendințe de programări va fi disponibilă aici
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-medflow-primary" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Predicții ocupare
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                🤖 Predicții AI pentru orele optime vor fi afișate aici
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <Brain className="w-4 h-4 text-medflow-primary" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Insights pacienți
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                🤖 Analiză comportament pacienți va fi disponibilă aici
              </p>
            </div>
          </div>
        </motion.div>
      )}

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

             {/* Smart Recommendations Section */}
       <motion.div
         initial={{ opacity: 0, y: 10 }}
         animate={{ opacity: 1, y: 0 }}
         className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
       >
         <div className="p-6">
           <SmartRecommendations 
             appointments={appointments}
             timeRange="week"
             maxRecommendations={5}
           />
         </div>
       </motion.div>

       {/* Alerts and Calendar Grid */}
       <div className="grid gap-6 lg:grid-cols-3">
         {/* Doctor Alerts */}
         <div className="lg:col-span-1">
           <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
             <div className="p-6 border-b border-gray-200 dark:border-gray-700">
               <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                 <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
                 Alerte și Notificări
               </h2>
             </div>
             <div className="p-6">
               <DoctorAlerts 
                 showUnreadOnly={true}
                 maxItems={5}
                 compact={true}
               />
             </div>
           </div>
         </div>
         
         {/* Modern Calendar */}
         <div className="lg:col-span-2">
           <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
             <div className="p-6 border-b border-gray-200 dark:border-gray-700">
               <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                 Calendar Programări
               </h2>
             </div>
             <div className="p-6">
               <ModernCalendar
                 onAppointmentClick={handleAppointmentClick}
                 onTimeSlotClick={handleTimeSlotClick}
               />
             </div>
           </div>
         </div>
       </div>
    </motion.section>
  )
}