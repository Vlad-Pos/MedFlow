import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  startOfWeek, 
  endOfWeek, 
  isToday, 
  isSameDay 
} from 'date-fns'
import { ro } from 'date-fns/locale'
import { 
  Calendar, 
  User, 
  FileText, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  Plus, 
  Eye, 
  Edit, 
  Save, 
  Send, 
  ChevronLeft, 
  ChevronRight, 
  X 
} from 'lucide-react'

// Professional interfaces for medical data
interface Patient {
  id: string
  name: string
  dateOfBirth?: Date
  phone?: string
  email?: string
  address?: string
  totalAppointments: number
  notes?: string
}

interface Appointment {
  id: string
  patientId: string
  patientName: string
  dateTime: Date
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled'
  notes?: string
}

interface ConsultationReport {
  symptoms: string
  diagnosis: string
  treatment: string
  additionalDetails: string
}

interface CalendarEvent {
  id: string
  day: number
  title: string
  description?: string
  startTime: string
  endTime: string
  patientName: string
}

// Professional demo data for testing
const demoPatients: Patient[] = [
  {
    id: '1',
    name: 'Maria Popescu',
    dateOfBirth: new Date('1985-03-15'),
    phone: '+40 721 234 567',
    email: 'maria.popescu@email.com',
    address: 'Strada Victoriei 15, București',
    totalAppointments: 12,
    notes: 'Patient with chronic condition, requires regular monitoring'
  },
  {
    id: '2',
    name: 'Ion Vasilescu',
    dateOfBirth: new Date('1978-11-22'),
    phone: '+40 722 345 678',
    email: 'ion.vasilescu@email.com',
    address: 'Bulevardul Unirii 45, București',
    totalAppointments: 8,
    notes: 'New patient, first consultation scheduled'
  },
  {
    id: '3',
    name: 'Elena Dumitrescu',
    dateOfBirth: new Date('1992-07-08'),
    phone: '+40 723 456 789',
    email: 'elena.dumitrescu@email.com',
    address: 'Strada Lipscani 23, București',
    totalAppointments: 15,
    notes: 'Regular patient, excellent treatment compliance'
  }
]

const demoAppointments: Appointment[] = [
  {
    id: '1',
    patientId: '1',
    patientName: 'Maria Popescu',
    dateTime: new Date(),
    status: 'confirmed',
    notes: 'Follow-up consultation'
  },
  {
    id: '2',
    patientId: '2',
    patientName: 'Ion Vasilescu',
    dateTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
    status: 'scheduled',
    notes: 'Initial consultation'
  }
]

const demoCalendarEvents: CalendarEvent[] = [
  {
    id: '1',
    day: new Date().getDate(),
    title: 'Maria Popescu',
    description: 'Follow-up consultation',
    startTime: '09:00',
    endTime: '09:30',
    patientName: 'Maria Popescu'
  },
  {
    id: '2',
    day: new Date().getDate(),
    title: 'Ion Vasilescu',
    description: 'Initial consultation',
    startTime: '11:00',
    endTime: '11:30',
    patientName: 'Ion Vasilescu'
  }
]

// Professional utility functions
const formatDateTime = (date: Date): string => {
  return format(date, 'HH:mm, EEEE, d MMMM yyyy', { locale: ro })
}

const calculateAge = (birthDate: Date): number => {
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

// Professional Consultation Hub Component
const TestAppointments: React.FC = () => {
  // Professional state management
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null)
  const [patients, setPatients] = useState<Patient[]>(demoPatients)
  const [appointments, setAppointments] = useState<Appointment[]>(demoAppointments)
  const [searchQuery, setSearchQuery] = useState('')
  const [reportForm, setReportForm] = useState<ConsultationReport>({
    symptoms: '',
    diagnosis: '',
    treatment: '',
    additionalDetails: ''
  })
  const [showCreateEvent, setShowCreateEvent] = useState(false)
  
  // Professional form validation states
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({})
  const [isFormValid, setIsFormValid] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Professional computed values with memoization
  const todayAppointments = useMemo(() => {
    return appointments.filter(appointment => 
      isSameDay(appointment.dateTime, new Date())
    )
  }, [appointments])

  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return patients
    const query = searchQuery.toLowerCase()
    return patients.filter(patient => 
      patient.name.toLowerCase().includes(query) ||
      (patient.email && patient.email.toLowerCase().includes(query)) ||
      (patient.phone && patient.phone.includes(query))
    )
  }, [patients, searchQuery])

  const selectedDateEvents = useMemo(() => {
    return demoCalendarEvents.filter(event => event.day === selectedDate.getDate())
  }, [selectedDate, demoCalendarEvents])

  const patientStats = useMemo(() => {
    if (!currentPatient) return null
    return {
      totalAppointments: currentPatient.totalAppointments,
      lastVisit: appointments
        .filter(a => a.patientId === currentPatient.id)
        .sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime())[0]
    }
  }, [currentPatient, appointments])

  // Professional form validation
  const validateField = useCallback((field: keyof ConsultationReport, value: string): string[] => {
    const errors: string[] = []
    
    switch (field) {
      case 'symptoms':
        if (!value.trim()) errors.push('Symptoms are required')
        if (value.trim().length < 10) errors.push('Symptoms must be at least 10 characters')
        break
      case 'diagnosis':
        if (!value.trim()) errors.push('Diagnosis is required')
        if (value.trim().length < 5) errors.push('Diagnosis must be at least 5 characters')
        break
      case 'treatment':
        if (!value.trim()) errors.push('Treatment plan is required')
        if (value.trim().length < 10) errors.push('Treatment plan must be at least 10 characters')
        break
      case 'additionalDetails':
        // Optional field - no validation required
        break
    }
    
    return errors
  }, [])

  const validateForm = useCallback(() => {
    const errors: Record<string, string[]> = {}
    let isValid = true
    
    Object.keys(reportForm).forEach(field => {
      const fieldErrors = validateField(field as keyof ConsultationReport, reportForm[field as keyof ConsultationReport])
      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors
        isValid = false
      }
    })
    
    setFormErrors(errors)
    setIsFormValid(isValid)
    return isValid
  }, [reportForm, validateField])

  // Professional form handlers
  const handleReportFormChange = useCallback((field: keyof ConsultationReport, value: string) => {
    setReportForm(prev => ({ ...prev, [field]: value }))
    
    // Real-time validation
    const fieldErrors = validateField(field, value)
    setFormErrors(prev => ({
      ...prev,
      [field]: fieldErrors
    }))
    
    // Update overall form validity
    const newForm = { ...reportForm, [field]: value }
    const isValid = Object.keys(newForm).every(key => {
      const fieldKey = key as keyof ConsultationReport
      return validateField(fieldKey, newForm[fieldKey]).length === 0
    })
    setIsFormValid(isValid)
  }, [reportForm, validateField])

  // Professional patient management
  const selectPatient = useCallback((patient: Patient) => {
    setCurrentPatient(patient)
    // Clear form when switching patients
    setReportForm({
      symptoms: '',
      diagnosis: '',
      treatment: '',
      additionalDetails: ''
    })
    setFormErrors({})
    setIsFormValid(false)
  }, [])

  const searchPatients = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  // Professional report management
  const saveReportDraft = useCallback(async () => {
    if (!currentPatient) return
    
    try {
      setIsSubmitting(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // In real implementation, save to Firebase/localStorage
      console.log('Report draft saved:', { patient: currentPatient, report: reportForm })
      
      // Show success feedback
      alert('Report draft saved successfully')
    } catch (error) {
      console.error('Failed to save draft:', error)
      alert('Failed to save draft. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [currentPatient, reportForm])

  const submitReport = useCallback(async () => {
    if (!currentPatient || !isFormValid) return
    
    try {
      setIsSubmitting(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // In real implementation, submit to Firebase and update patient history
      console.log('Report submitted:', { patient: currentPatient, report: reportForm })
      
      // Clear form after successful submission
      setReportForm({
        symptoms: '',
        diagnosis: '',
        treatment: '',
        additionalDetails: ''
      })
      setFormErrors({})
      setIsFormValid(false)
      
      // Show success feedback
      alert('Consultation report submitted successfully')
    } catch (error) {
      console.error('Failed to submit report:', error)
      alert('Failed to submit report. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [currentPatient, reportForm, isFormValid])

  // Professional data synchronization
  const syncData = useCallback(async () => {
    try {
      // In real implementation, sync with Firebase
      // For now, use demo data
      setPatients(demoPatients)
      setAppointments(demoAppointments)
    } catch (error) {
      console.error('Failed to sync data:', error)
    }
  }, [])

  // Professional data loading
  useEffect(() => {
    syncData()
  }, [syncData])

  // Professional form validation on mount
  useEffect(() => {
    validateForm()
  }, [validateForm])

  // Professional MiniCalendar Component (Extracted from /calendar)
  const MiniCalendar: React.FC<{
    currentDate: Date
    selectedDate: Date
    events: CalendarEvent[]
    onDateSelect: (date: Date) => void
    onNewAppointment: () => void
    compact?: boolean
  }> = ({
    currentDate,
    selectedDate,
    events,
    onDateSelect,
    onNewAppointment,
    compact = false
  }) => {
    // State for mini calendar
    const [currentMonth, setCurrentMonth] = useState('')
    const [currentDateObj, setCurrentDateObj] = useState(currentDate)
    
    // Romanian week days
    const weekDays = ["L", "M", "M", "J", "V", "S", "D"]
    
    // Helper functions
    const capitalizeMonth = (text: string): string => {
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
    }

    const formatDateWithCapitalization = (date: Date, formatString: string): string => {
      try {
        const formatted = format(date, formatString, { locale: ro })
        return capitalizeMonth(formatted)
      } catch (error) {
        const formatted = format(date, formatString)
        return capitalizeMonth(formatted)
      }
    }

    // Navigation functions
    const goToPreviousMonth = useCallback(() => {
      const newDate = new Date(currentDateObj)
      newDate.setMonth(newDate.getMonth() - 1)
      setCurrentDateObj(newDate)
      setCurrentMonth(formatDateWithCapitalization(newDate, 'MMMM yyyy'))
    }, [currentDateObj])

    const goToNextMonth = useCallback(() => {
      const newDate = new Date(currentDateObj)
      newDate.setMonth(newDate.getMonth() + 1)
      setCurrentDateObj(newDate)
      setCurrentMonth(formatDateWithCapitalization(newDate, 'MMMM yyyy'))
    }, [currentDateObj])

    // Date selection handler
    const setCurrentDateHandler = useCallback((date: Date) => {
      setCurrentDateObj(date)
      setCurrentMonth(formatDateWithCapitalization(date, 'MMMM yyyy'))
      onDateSelect(date)
    }, [onDateSelect])

    // Initialize month display
    useEffect(() => {
      setCurrentMonth(formatDateWithCapitalization(currentDateObj, 'MMMM yyyy'))
    }, [currentDateObj])

    // Get events for a specific date
    const getEventsForDate = useCallback((date: Date) => {
      return events.filter(event => {
        const eventDate = new Date(currentDateObj.getFullYear(), currentDateObj.getMonth(), event.day)
        return isSameDay(eventDate, date)
      })
    }, [events, currentDateObj])

    return (
      <div className={`bg-gray-900/50 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6 ${compact ? 'h-auto' : ''}`}>
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-purple-400" />
          Mini Calendar
        </h2>
        
        {/* Mini Calendar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium">{currentMonth}</h3>
            <div className="flex gap-1">
              <motion.button
                className="p-1 text-white/70 hover:text-white transition-colors"
                onClick={goToPreviousMonth}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronLeft className="h-4 w-4" />
              </motion.button>
              <motion.button
                className="p-1 text-white/70 hover:text-white transition-colors"
                onClick={goToNextMonth}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRight className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
          
          {/* Week Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day, i) => (
              <div key={i} className="text-center text-white/50 text-xs py-1">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1" key={`mini-calendar-${currentDateObj.toDateString()}`}>
            {(() => {
              const firstDay = startOfMonth(currentDateObj)
              const lastDay = endOfMonth(currentDateObj)
              const startDate = startOfWeek(firstDay, { weekStartsOn: 1 })
              const endDate = endOfWeek(lastDay, { weekStartsOn: 1 })
              const days = eachDayOfInterval({ start: startDate, end: endDate })
              
              return days.map((date, i) => {
                const isCurrentMonth = date.getMonth() === currentDateObj.getMonth()
                const isTodayDate = isToday(date)
                const isSelectedDate = isSameDay(date, selectedDate)
                const dateEvents = getEventsForDate(date)
                
                return (
                  <motion.div
                    key={`${date.toDateString()}-${i}`}
                    className={`text-xs rounded-full w-7 h-7 flex items-center justify-center ${
                      isSelectedDate ? "bg-[#7A48BF] text-white" : 
                      isTodayDate ? "bg-[#8A7A9F] text-white" :
                      isCurrentMonth ? "text-white hover:bg-white/20" : "text-white/50"
                    } transition-colors cursor-pointer relative`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 400, 
                      damping: 17 
                    }}
                    onClick={() => setCurrentDateHandler(date)}
                    title={`${format(date, 'EEEE, MMMM d, yyyy', { locale: ro })}${dateEvents.length > 0 ? ` - ${dateEvents.length} appointment(s)` : ''}`}
                  >
                    {date.getDate()}
                    {/* Event indicator */}
                    {dateEvents.length > 0 && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-400 rounded-full"></div>
                    )}
                  </motion.div>
                )
              })
            })()}
          </div>
        </div>

        {/* Daily Schedule View */}
        <div className="mt-6">
          <h3 className="text-lg font-medium text-white mb-3">Daily Schedule</h3>
          <div className="bg-gray-800/50 rounded-lg p-4 max-h-[600px] overflow-y-scroll" style={{ border: '2px solid red' }}>
            {(() => {
              // Generate 24-hour time slots
              const timeSlots = Array.from({ length: 24 }, (_, i) => {
                const hour = i.toString().padStart(2, '0')
                const time = `${hour}:00`
                const events = selectedDateEvents.filter(event => event.startTime.startsWith(hour))
                return { time, events }
              })
              
              return timeSlots.map((slot, index) => (
                <div key={index} className="flex items-center py-2 border-b border-gray-700 last:border-b-0">
                  <div className="w-16 text-sm text-gray-400 font-mono">
                    {slot.time}
                  </div>
                  <div className="flex-1 ml-4">
                    {slot.events.length > 0 ? (
                      slot.events.map((event, eventIndex) => (
                        <div key={eventIndex} className="bg-purple-600/20 border border-purple-500/30 rounded-lg p-2 mb-2">
                          <div className="font-medium text-white text-sm">{event.title}</div>
                          <div className="text-gray-300 text-xs">{event.startTime} - {event.endTime}</div>
                          <div className="text-gray-400 text-xs">{event.description}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500 text-xs">No appointments</div>
                    )}
                  </div>
                </div>
              ))
            })()}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 space-y-2">
          <button 
            onClick={onNewAppointment}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Appointment
          </button>
          <button className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center">
            <Calendar className="w-4 h-4 mr-2" />
            View Full Calendar
          </button>
        </div>
      </div>
    )
  }

  // Professional Consultation Hub UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Consultation</h1>
            <p className="text-purple-300 text-lg">Professional medical consultation workflow</p>
          </div>
          <Link 
            to="/appointments" 
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
          >
            ← Back to Main Appointments
          </Link>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT PANEL - Mini Calendar */}
          <div className="lg:col-span-1">
            <MiniCalendar
              currentDate={currentDate}
              selectedDate={selectedDate}
              events={demoCalendarEvents}
              onDateSelect={setSelectedDate}
              onNewAppointment={() => setShowCreateEvent(true)}
              compact={false}
            />
          </div>

          {/* RIGHT PANEL - Patient Management */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-purple-400" />
                Patient Management
              </h2>

              {/* Patient Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search patients..."
                    value={searchQuery}
                    onChange={(e) => searchPatients(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Today's Appointments */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-3">Today's Appointments</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {todayAppointments.length === 0 ? (
                    <div className="text-gray-400 text-sm text-center py-4">No appointments today</div>
                  ) : (
                    todayAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                        onClick={() => {
                          const patient = patients.find(p => p.id === appointment.patientId)
                          if (patient) selectPatient(patient)
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-white">{appointment.patientName}</div>
                            <div className="text-sm text-gray-400">{formatDateTime(appointment.dateTime)}</div>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs ${
                            appointment.status === 'confirmed' ? 'bg-green-600 text-white' :
                            appointment.status === 'scheduled' ? 'bg-blue-600 text-white' :
                            'bg-gray-600 text-white'
                          }`}>
                            {appointment.status}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Current Patient Display */}
              {currentPatient ? (
                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                    <User className="w-5 h-5 mr-2 text-purple-400" />
                    Current Patient
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {currentPatient.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{currentPatient.name}</div>
                        <div className="text-sm text-gray-400">
                          {currentPatient.dateOfBirth ? `${calculateAge(currentPatient.dateOfBirth)} years old` : 'Age not specified'}
                        </div>
                      </div>
                    </div>

                    {currentPatient.phone && (
                      <div className="flex items-center space-x-2 text-sm text-gray-300">
                        <Phone className="w-4 h-4 text-purple-400" />
                        <span>{currentPatient.phone}</span>
                      </div>
                    )}

                    {currentPatient.email && (
                      <div className="flex items-center space-x-2 text-sm text-gray-300">
                        <Mail className="w-4 h-4 text-purple-400" />
                        <span>{currentPatient.email}</span>
                      </div>
                    )}

                    {currentPatient.address && (
                      <div className="flex items-center space-x-2 text-sm text-gray-300">
                        <MapPin className="w-4 h-4 text-purple-400" />
                        <span>{currentPatient.address}</span>
                      </div>
                    )}

                    <div className="flex items-center space-x-2 text-sm text-gray-300">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      <span>{currentPatient.totalAppointments} total appointments</span>
                    </div>

                    {currentPatient.notes && (
                      <div className="text-sm text-gray-300">
                        <div className="font-medium mb-1">Notes:</div>
                        <div>{currentPatient.notes}</div>
                      </div>
                    )}

                    <div className="flex space-x-2 pt-2">
                      <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
                        <Eye className="w-3 h-3 inline mr-1" />
                        View History
                      </button>
                      <button className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors">
                        <Edit className="w-3 h-3 inline mr-1" />
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <User className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                  <div>Select a patient to begin consultation</div>
                </div>
              )}
            </div>
          </div>

          {/* BOTTOM PANEL - Report Writing (Full Width) */}
          <div className="lg:col-span-3">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-purple-400" />
                Consultation Report
              </h2>

              {currentPatient ? (
                <div className="space-y-6">
                  {/* Patient Info Header */}
                  <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {currentPatient.name.charAt(0)}
                      </div>
                      <div className="font-semibold text-white">Consulting: {currentPatient.name}</div>
                    </div>
                  </div>

                  {/* Report Form with Professional Validation */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Symptoms <span className="text-red-400">*</span>
                        </label>
                        <textarea
                          value={reportForm.symptoms}
                          onChange={(e) => handleReportFormChange('symptoms', e.target.value)}
                          placeholder="Describe patient symptoms..."
                          rows={4}
                          className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                            formErrors.symptoms && formErrors.symptoms.length > 0
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-gray-700 focus:ring-purple-500'
                          }`}
                        />
                        {formErrors.symptoms && formErrors.symptoms.length > 0 && (
                          <div className="mt-1 space-y-1">
                            {formErrors.symptoms.map((error, index) => (
                              <div key={index} className="text-red-400 text-sm flex items-center">
                                <span className="w-1 h-1 bg-red-400 rounded-full mr-2"></span>
                                {error}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Diagnosis <span className="text-red-400">*</span>
                        </label>
                        <textarea
                          value={reportForm.diagnosis}
                          onChange={(e) => handleReportFormChange('diagnosis', e.target.value)}
                          placeholder="Enter diagnosis..."
                          rows={3}
                          className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                            formErrors.diagnosis && formErrors.diagnosis.length > 0
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-gray-700 focus:ring-purple-500'
                          }`}
                        />
                        {formErrors.diagnosis && formErrors.diagnosis.length > 0 && (
                          <div className="mt-1 space-y-1">
                            {formErrors.diagnosis.map((error, index) => (
                              <div key={index} className="text-red-400 text-sm flex items-center">
                                <span className="w-1 h-1 bg-red-400 rounded-full mr-2"></span>
                                {error}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Treatment <span className="text-red-400">*</span>
                        </label>
                        <textarea
                          value={reportForm.treatment}
                          onChange={(e) => handleReportFormChange('treatment', e.target.value)}
                          placeholder="Describe treatment plan..."
                          rows={3}
                          className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                            formErrors.treatment && formErrors.treatment.length > 0
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-gray-700 focus:ring-purple-500'
                          }`}
                        />
                        {formErrors.treatment && formErrors.treatment.length > 0 && (
                          <div className="mt-1 space-y-1">
                            {formErrors.treatment.map((error, index) => (
                              <div key={index} className="text-red-400 text-sm flex items-center">
                                <span className="w-1 h-1 bg-red-400 rounded-full mr-2"></span>
                                {error}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Additional Details
                        </label>
                        <textarea
                          value={reportForm.additionalDetails}
                          onChange={(e) => handleReportFormChange('additionalDetails', e.target.value)}
                          placeholder="Additional notes, recommendations, follow-up instructions..."
                          rows={4}
                          className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                            formErrors.additionalDetails && formErrors.additionalDetails.length > 0
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-gray-700 focus:ring-purple-500'
                          }`}
                        />
                        {formErrors.additionalDetails && formErrors.additionalDetails.length > 0 && (
                          <div className="mt-1 space-y-1">
                            {formErrors.additionalDetails.map((error, index) => (
                              <div key={index} className="text-red-400 text-sm flex items-center">
                                <span className="w-1 h-1 bg-red-400 rounded-full mr-2"></span>
                                {error}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Form Actions with Professional Validation */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                    {/* Form Status */}
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${isFormValid ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className={`text-sm ${isFormValid ? 'text-green-400' : 'text-red-400'}`}>
                          {isFormValid ? 'Form is valid' : 'Form has errors'}
                        </span>
                      </div>
                      {Object.keys(formErrors).length > 0 && (
                        <span className="text-sm text-gray-400">
                          {Object.values(formErrors).flat().length} validation error(s)
                        </span>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setReportForm({
                            symptoms: '',
                            diagnosis: '',
                            treatment: '',
                            additionalDetails: ''
                          })
                          setFormErrors({})
                          setIsFormValid(false)
                        }}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Clear Form
                      </button>
                      <button
                        onClick={saveReportDraft}
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {isSubmitting ? 'Saving...' : 'Save Draft'}
                      </button>
                      <button
                        onClick={submitReport}
                        disabled={!isFormValid || isSubmitting}
                        className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
                          isFormValid && !isSubmitting
                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                            : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                        }`}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {isSubmitting ? 'Submitting...' : 'Submit Report'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <div className="text-lg mb-2">No Patient Selected</div>
                  <div>Select a patient from the right panel to begin writing a consultation report</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestAppointments
