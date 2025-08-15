/**
 * Enhanced Modern Calendar Component for MedFlow
 * 
 * Features:
 * - Real-time Firebase Firestore synchronization
 * - MedFlow branding with professional medical styling
 * - Responsive design for all devices (mobile, tablet, desktop)
 * - Accessibility support with ARIA labels and keyboard navigation
 * - Status-based color coding for appointments
 * - Smart appointment management with confirmations
 * - Loading states and comprehensive error handling
 * - AI integration placeholders for future smart scheduling
 * 
 * 💡 IMPORTANT: Before modifying this component, please read:
 * - MedFlow/BRAND_IDENTITY.md (brand colors and styling)
 * - MedFlow/DEVELOPMENT_GUIDE.md (component architecture)
 * This ensures your changes maintain MedFlow's professional standards.
 * 
 * @author MedFlow Team
 * @version 2.0
 */

import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday, addDays, subDays, startOfMonth, endOfMonth, eachWeekOfInterval, isSameMonth } from 'date-fns'
import { ro } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ChevronLeft, ChevronRight, X, Edit, Trash2, AlertTriangle, Wifi, WifiOff, Brain, Zap } from 'lucide-react'
import { useAuth } from '../providers/AuthProvider'
import { isDemoMode, subscribeToDemoAppointments, addDemoAppointment, deleteDemoAppointment } from '../utils/demo'
import { collection, onSnapshot, orderBy, query, where, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../services/firebase'
import LoadingSpinner from './LoadingSpinner'
interface Appointment {
  id: string
  patientName: string
  dateTime: Date
  symptoms: string
  notes?: string
  status: 'scheduled' | 'completed' | 'no_show'
  doctorId: string
}

interface ModernCalendarProps {
  onAppointmentClick?: (appointment: Appointment) => void
  onTimeSlotClick?: (date: Date, time: string) => void
}

// Enhanced state interface for better error handling and loading states
interface CalendarState {
  loading: boolean
  error: string | null
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting'
  lastSyncTime: Date | null
}

const ModernCalendar = memo(({ onAppointmentClick, onTimeSlotClick }: ModernCalendarProps) => {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [view, setView] = useState<'week' | 'month'>('week')
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [quickAddData, setQuickAddData] = useState({
    patientName: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '09:00',
    symptoms: ''
  })
  
  // Enhanced state management for better UX
  const [calendarState, setCalendarState] = useState<CalendarState>({
    loading: true,
    error: null,
    connectionStatus: 'connected',
    lastSyncTime: null
  })
  
  // AI feature flags (for future implementation)
  const [aiFeatures] = useState({
    smartScheduling: false, // Will be enabled when AI scheduling is implemented
    conflictDetection: true,
    patientInsights: false, // Future: AI-powered patient history analysis
    scheduleOptimization: false // Future: AI-optimized scheduling suggestions
  })

  // Time slots for the day - memoized
  const timeSlots = useMemo(() => {
    const slots = []
    for (let hour = 8; hour <= 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
      slots.push(`${hour.toString().padStart(2, '0')}:30`)
    }
    return slots
  }, [])

  // Get calendar data - memoized
  const calendarData = useMemo(() => {
    if (view === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 })
      const end = endOfWeek(currentDate, { weekStartsOn: 1 })
      return eachDayOfInterval({ start, end })
    } else {
      const start = startOfMonth(currentDate)
      const end = endOfMonth(currentDate)
      const weeks = eachWeekOfInterval({ start, end }, { weekStartsOn: 1 })
      return weeks.map(week => eachDayOfInterval({ start: week, end: addDays(week, 6) }))
    }
  }, [currentDate, view])

  // Filter appointments for current date view - memoized
  const filteredAppointments = useMemo(() => {
    if (view === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 })
      const end = endOfWeek(currentDate, { weekStartsOn: 1 })
      return appointments.filter(appt => {
        const apptDate = new Date(appt.dateTime)
        return apptDate >= start && apptDate <= end
      })
    } else {
      const start = startOfMonth(currentDate)
      const end = endOfMonth(currentDate)
      return appointments.filter(appt => {
        const apptDate = new Date(appt.dateTime)
        return apptDate >= start && apptDate <= end
      })
    }
  }, [appointments, currentDate, view])

  // Memoized appointment handlers
  const handleQuickAdd = useCallback(async () => {
    if (!user || !quickAddData.patientName.trim()) return

    const dateTime = new Date(`${quickAddData.date}T${quickAddData.time}`)
    
    const appointment = {
      doctorId: user.uid,
      patientName: quickAddData.patientName.trim(),
      dateTime,
      symptoms: quickAddData.symptoms.trim() || 'Programare rapidă',
      notes: quickAddData.symptoms.trim() || 'Programare rapidă',
      status: 'scheduled' as const
    }

    if (isDemoMode()) {
      addDemoAppointment(appointment)
    } else {
      // Add to Firestore
      const { addDoc, collection } = await import('firebase/firestore')
      await addDoc(collection(db, 'appointments'), appointment)
    }

    setQuickAddData({
      patientName: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: '09:00',
      symptoms: ''
    })
    setShowQuickAdd(false)
  }, [user, quickAddData])

  const handleDeleteAppointment = useCallback(async (id: string) => {
    if (!confirm('Ștergeți programarea?')) return

    if (isDemoMode()) {
      deleteDemoAppointment(id)
    } else {
      await deleteDoc(doc(db, 'appointments', id))
    }
  }, [])

  // Enhanced status functions with MedFlow branding colors
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-medflow-primary' // MedFlow primary color for scheduled
      case 'completed': return 'bg-emerald-500' // Success green for completed
      case 'no_show': return 'bg-red-500' // Error red for no-show
      default: return 'bg-medflow-background' // MedFlow background for unknown
    }
  }, [])

  const getStatusTextColor = useCallback((status: string) => {
    switch (status) {
      case 'scheduled': return 'text-white'
      case 'completed': return 'text-white' 
      case 'no_show': return 'text-white'
      default: return 'text-white'
    }
  }, [])

  const getStatusText = useCallback((status: string) => {
    switch (status) {
      case 'scheduled': return 'Programat'
      case 'completed': return 'Finalizat'
      case 'no_show': return 'Nu s-a prezentat'
      default: return status
    }
  }, [])

  // Memoized navigation handlers
  const handlePrevious = useCallback(() => {
    setCurrentDate(prev => subDays(prev, view === 'week' ? 7 : 30))
  }, [view])

  const handleNext = useCallback(() => {
    setCurrentDate(prev => addDays(prev, view === 'week' ? 7 : 30))
  }, [view])

  // Enhanced Firebase listener with comprehensive error handling and loading states
  useEffect(() => {
    if (!user) {
      setCalendarState(prev => ({ ...prev, loading: false }))
      return
    }

    setCalendarState(prev => ({ ...prev, loading: true, error: null }))

    if (isDemoMode()) {
      const unsubscribe = subscribeToDemoAppointments((demoAppointments: any[]) => {
        setAppointments(demoAppointments.map((appt: any) => ({
          ...appt,
          dateTime: appt.dateTime
        })))
        setCalendarState(prev => ({ 
          ...prev, 
          loading: false, 
          connectionStatus: 'connected',
          lastSyncTime: new Date()
        }))
      })
      return unsubscribe
    }

    // Create a broader query that gets all appointments for the doctor
    // We'll filter by date in the component logic instead of in the query
    try {
      const q = query(
        collection(db, 'appointments'),
        where('doctorId', '==', user.uid),
        orderBy('dateTime', 'asc')
      )
      
      const unsub = onSnapshot(q, 
        (snap) => {
          try {
            const rows = snap.docs.map(d => ({
              id: d.id,
              ...d.data(),
              dateTime: new Date(d.data().dateTime)
            })) as Appointment[]
            
            setAppointments(rows)
            setCalendarState(prev => ({ 
              ...prev, 
              loading: false, 
              error: null,
              connectionStatus: 'connected',
              lastSyncTime: new Date()
            }))
          } catch (error) {
            console.error('ModernCalendar: Error processing appointment data:', error)
            setCalendarState(prev => ({ 
              ...prev, 
              loading: false, 
              error: 'Eroare la procesarea datelor programărilor',
              connectionStatus: 'disconnected'
            }))
          }
        },
        (error) => {
          console.error('ModernCalendar: Firebase listener error:', error)
          setCalendarState(prev => ({ 
            ...prev, 
            loading: false, 
            error: 'Eroare la conexiunea cu baza de date. Verificați internetul.',
            connectionStatus: 'disconnected'
          }))
          
          // Attempt to reconnect after 5 seconds
          setTimeout(() => {
            setCalendarState(prev => ({ ...prev, connectionStatus: 'reconnecting' }))
          }, 5000)
        }
      )
      
      return () => unsub()
    } catch (error) {
      console.error('ModernCalendar: Error setting up Firebase query:', error)
      setCalendarState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Eroare la configurarea interogării datelor',
        connectionStatus: 'disconnected'
      }))
    }
  }, [user]) // Removed currentDate dependency to fix infinite loop

  return (
    <div className="space-y-6">
        {/* Enhanced Header with MedFlow Branding */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Calendar Medical
            </h2>
            
            {/* Connection Status Indicator */}
            <div className="flex items-center space-x-2">
              {calendarState.connectionStatus === 'connected' && (
                <div className="flex items-center space-x-1 text-emerald-600">
                  <Wifi className="w-4 h-4" />
                  <span className="text-xs font-medium">Conectat</span>
                </div>
              )}
              {calendarState.connectionStatus === 'disconnected' && (
                <div className="flex items-center space-x-1 text-red-600">
                  <WifiOff className="w-4 h-4" />
                  <span className="text-xs font-medium">Deconectat</span>
                </div>
              )}
              {calendarState.connectionStatus === 'reconnecting' && (
                <div className="flex items-center space-x-1 text-orange-600">
                  <LoadingSpinner size="sm" />
                  <span className="text-xs font-medium">Reconectare...</span>
                </div>
              )}
            </div>
            
            {/* AI Features Indicator */}
            {aiFeatures.smartScheduling && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-medflow-primary/10 rounded-full">
                <Brain className="w-3 h-3 text-medflow-primary" />
                <span className="text-xs text-medflow-primary font-medium">AI Activ</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
            {/* View Toggle */}
            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setView('week')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  view === 'week'
                    ? 'bg-medflow-primary text-white'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                Săptămână
              </button>
              <button
                onClick={() => setView('month')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  view === 'month'
                    ? 'bg-medflow-primary text-white'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                Lună
              </button>
            </div>
            
            {/* Navigation Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevious}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Săptămâna/Luna anterioară"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <span className="text-lg font-medium text-gray-900 dark:text-white min-w-[140px] text-center">
                {format(currentDate, 'MMMM yyyy', { locale: ro })}
              </span>
              
              <button
                onClick={handleNext}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Săptămâna/Luna următoare"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            
            {/* Quick Add Button with AI Enhancement */}
            <button
              onClick={() => setShowQuickAdd(true)}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-medflow-primary text-white rounded-lg hover:bg-medflow-secondary transition-colors shadow-md hover:shadow-lg"
              disabled={calendarState.loading}
            >
              <Plus className="w-4 h-4" />
              <span>Programare rapidă</span>
                           {aiFeatures.smartScheduling && (
               <span title="Asistență AI disponibilă">
                 <Zap className="w-3 h-3 ml-1" />
               </span>
             )}
            </button>
          </div>
        </div>

        {/* Error and Loading States */}
        <AnimatePresence>
          {calendarState.error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800"
            >
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-red-800 dark:text-red-300">
                  Eroare de conectare
                </h4>
                <p className="text-sm text-red-700 dark:text-red-400">
                  {calendarState.error}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Integration Placeholder */}
        {aiFeatures.smartScheduling && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-medflow-primary/5 border border-medflow-primary/10 rounded-lg p-3"
          >
            <div className="flex items-center space-x-2 text-medflow-primary">
              <Brain className="w-4 h-4" />
              <span className="text-sm font-medium">
                🤖 Asistența AI pentru programare este activă - detectare conflicte și sugestii optime
              </span>
            </div>
          </motion.div>
        )}

        {/* Enhanced Quick Add Modal with MedFlow Branding */}
        <AnimatePresence>
          {showQuickAdd && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowQuickAdd(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-800"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-medflow-primary/10 rounded-lg">
                      <Plus className="w-5 h-5 text-medflow-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Programare rapidă
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Adăugați o programare nouă rapid
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowQuickAdd(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Închide dialogul"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* AI Assistance Placeholder */}
                {aiFeatures.smartScheduling && (
                  <div className="mb-4 p-3 bg-medflow-primary/5 border border-medflow-primary/10 rounded-lg">
                    <div className="flex items-center space-x-2 text-medflow-primary">
                      <Brain className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        🤖 Asistența AI vă poate sugera ore optime pentru această programare
                      </span>
                    </div>
                  </div>
                )}
                
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleQuickAdd(); }}>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Nume pacient *
                    </label>
                    <input
                      type="text"
                      value={quickAddData.patientName}
                      onChange={(e) => setQuickAddData({ ...quickAddData, patientName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medflow-primary focus:border-medflow-primary dark:bg-gray-800 dark:border-gray-700 transition-colors"
                      placeholder="Ex: Ion Popescu"
                      required
                      aria-describedby="patient-name-help"
                    />
                    <p id="patient-name-help" className="text-xs text-gray-500 mt-1">
                      Introduceți numele complet al pacientului
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Data *
                      </label>
                      <input
                        type="date"
                        value={quickAddData.date}
                        onChange={(e) => setQuickAddData({ ...quickAddData, date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medflow-primary focus:border-medflow-primary dark:bg-gray-800 dark:border-gray-700 transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Ora *
                      </label>
                      <input
                        type="time"
                        value={quickAddData.time}
                        onChange={(e) => setQuickAddData({ ...quickAddData, time: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medflow-primary focus:border-medflow-primary dark:bg-gray-800 dark:border-gray-700 transition-colors"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Motivul consultației (opțional)
                    </label>
                    <textarea
                      value={quickAddData.symptoms}
                      onChange={(e) => setQuickAddData({ ...quickAddData, symptoms: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medflow-primary focus:border-medflow-primary dark:bg-gray-800 dark:border-gray-700 transition-colors resize-none"
                      rows={3}
                      placeholder="Ex: Dureri de cap frecvente, control de rutină..."
                      aria-describedby="symptoms-help"
                    />
                    <p id="symptoms-help" className="text-xs text-gray-500 mt-1">
                      Adăugați o scurtă descriere a motivului consultației
                    </p>
                  </div>
                  
                  <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => setShowQuickAdd(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                    >
                      Anulează
                    </button>
                    <button
                      type="submit"
                      disabled={!quickAddData.patientName.trim()}
                      className="flex-1 px-4 py-2 bg-medflow-primary text-white rounded-lg hover:bg-medflow-secondary transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <Plus className="w-4 h-4" />
                        <span>Creează programare</span>
                      </div>
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Calendar Grid with Loading States */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-lg">
          {calendarState.loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="loader mb-4"></div>
                <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
                  Se încarcă calendarul medical...
                </p>
              </div>
            </div>
          ) : view === 'week' ? (
            <WeekView
              days={calendarData as Date[]}
              appointments={filteredAppointments}
              timeSlots={timeSlots}
              onAppointmentClick={onAppointmentClick}
              onTimeSlotClick={onTimeSlotClick}
              onDeleteAppointment={handleDeleteAppointment}
              getStatusColor={getStatusColor}
              getStatusTextColor={getStatusTextColor}
              getStatusText={getStatusText}
              loading={calendarState.loading}
            />
          ) : (
            <MonthView
              weeks={calendarData as Date[][]}
              appointments={filteredAppointments}
              onAppointmentClick={onAppointmentClick}
              onDeleteAppointment={handleDeleteAppointment}
              getStatusColor={getStatusColor}
              getStatusTextColor={getStatusTextColor}
              getStatusText={getStatusText}
              loading={calendarState.loading}
            />
          )}
        </div>
      </div>
    )
})

export default ModernCalendar

interface WeekViewProps {
  days: Date[]
  appointments: Appointment[]
  timeSlots: string[]
  onAppointmentClick?: (appointment: Appointment) => void
  onTimeSlotClick?: (date: Date, time: string) => void
  onDeleteAppointment: (id: string) => void
  getStatusColor: (status: string) => string
  getStatusTextColor: (status: string) => string
  getStatusText: (status: string) => string
  loading: boolean
}

function WeekView({
  days,
  appointments,
  timeSlots,
  onAppointmentClick,
  onTimeSlotClick,
  onDeleteAppointment,
  getStatusColor,
  getStatusTextColor,
  getStatusText,
  loading
}: WeekViewProps) {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null)

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px] lg:min-w-full">
        {/* Header */}
        <div className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-800">
          <div className="p-3"></div>
          {days.map((day, index) => (
            <div key={index} className="p-3 text-center border-l border-gray-200 dark:border-gray-800">
              <div className={`text-sm font-medium ${isToday(day) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                {format(day, 'EEE', { locale: ro })}
              </div>
              <div className={`text-lg ${isToday(day) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>

        {/* Time slots */}
        <div className="grid grid-cols-8">
          <div className="border-r border-gray-200 dark:border-gray-800">
            {timeSlots.map((time, index) => (
              <div key={index} className="h-12 border-b border-gray-100 dark:border-gray-800 flex items-center justify-end pr-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">{time}</span>
              </div>
            ))}
          </div>
          
          {days.map((day, dayIndex) => (
            <div key={dayIndex} className="relative border-r border-gray-200 dark:border-gray-800">
              {timeSlots.map((time, timeIndex) => {
                const slotKey = `${format(day, 'yyyy-MM-dd')}-${time}`
                const dayAppointments = appointments.filter(appt => {
                  const apptTime = format(appt.dateTime, 'HH:mm')
                  return isSameDay(appt.dateTime, day) && apptTime === time
                })

                return (
                  <div
                    key={timeIndex}
                    className={`h-12 border-b border-gray-100 dark:border-gray-800 relative transition-colors ${
                      selectedTimeSlot === slotKey 
                        ? 'bg-blue-50 dark:bg-blue-900/20' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                    onClick={() => {
                      setSelectedTimeSlot(slotKey)
                      onTimeSlotClick?.(day, time)
                    }}
                    onTouchStart={() => setSelectedTimeSlot(slotKey)}
                    onTouchEnd={() => setTimeout(() => setSelectedTimeSlot(null), 150)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Slot ${time} pentru ${format(day, 'EEEE, d MMMM', { locale: ro })}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onTimeSlotClick?.(day, time)
                      }
                    }}
                  >
                    {/* Appointments in this time slot */}
                    {dayAppointments.map((appointment) => (
                      <motion.div
                        key={appointment.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`absolute left-1 right-1 top-1 bottom-1 rounded-md p-2 text-xs cursor-pointer group ${
                          getStatusColor(appointment.status)
                        } ${getStatusTextColor(appointment.status)}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          onAppointmentClick?.(appointment)
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label={`Programare ${appointment.patientName} - ${getStatusText(appointment.status)}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            onAppointmentClick?.(appointment)
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium truncate">{appointment.patientName}</div>
                          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onAppointmentClick?.(appointment)
                              }}
                              className="p-1 hover:bg-white/20 rounded focus:outline-none focus:ring-2 focus:ring-white"
                              aria-label="Editează programarea"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onDeleteAppointment(appointment.id)
                              }}
                              className="p-1 hover:bg-white/20 rounded focus:outline-none focus:ring-2 focus:ring-white"
                              aria-label="Șterge programarea"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div className="text-xs opacity-90">{getStatusText(appointment.status)}</div>
                      </motion.div>
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface MonthViewProps {
  weeks: Date[][]
  appointments: Appointment[]
  onAppointmentClick?: (appointment: Appointment) => void
  onDeleteAppointment: (id: string) => void
  getStatusColor: (status: string) => string
  getStatusTextColor: (status: string) => string
  getStatusText: (status: string) => string
  loading: boolean
}

function MonthView({
  weeks,
  appointments,
  onAppointmentClick,
  onDeleteAppointment,
  getStatusColor,
  getStatusTextColor,
  getStatusText,
  loading
}: MonthViewProps) {
  return (
    <div>
      {/* Month header */}
      <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-800">
        {['Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm', 'Dum'].map((day) => (
          <div key={day} className="p-3 text-center text-sm font-medium text-gray-900 dark:text-white">
            {day}
          </div>
        ))}
      </div>

      {/* Month grid */}
      <div className="grid grid-cols-7">
        {weeks.flat().map((day, index) => {
          const dayAppointments = appointments.filter(appt => isSameDay(appt.dateTime, day))
          
          return (
            <div
              key={index}
              className={`min-h-[120px] p-2 border-r border-b border-gray-200 dark:border-gray-800 ${
                !isSameMonth(day, new Date()) ? 'bg-gray-50 dark:bg-gray-900/50' : ''
              }`}
            >
              <div className={`text-sm font-medium mb-1 ${
                isToday(day) 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : !isSameMonth(day, new Date())
                  ? 'text-gray-400'
                  : 'text-gray-900 dark:text-white'
              }`}>
                {format(day, 'd')}
              </div>
              
              <div className="space-y-1">
                {dayAppointments.slice(0, 3).map((appointment) => (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-1 rounded text-xs cursor-pointer group ${getStatusColor(appointment.status)} ${getStatusTextColor(appointment.status)}`}
                    onClick={() => onAppointmentClick?.(appointment)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Programare ${appointment.patientName} - ${getStatusText(appointment.status)}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onAppointmentClick?.(appointment)
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate font-medium">{appointment.patientName}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteAppointment(appointment.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-white/20 rounded focus:outline-none focus:ring-2 focus:ring-white"
                        aria-label="Șterge programarea"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-xs opacity-90">{getStatusText(appointment.status)}</div>
                  </motion.div>
                ))}
                
                {dayAppointments.length > 3 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    +{dayAppointments.length - 3} mai multe
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
