/**
 * 🏥 MedFlow - Consultation Hub (Test Environment)
 * 
 * Complete consultation hub rebuild with 3-panel layout:
 * - LEFT PANEL: Mini calendar imported from /calendar
 * - RIGHT PANEL: Patient selection and current patient display
 * - BOTTOM PANEL: Report writing form
 * 
 * This is a safe testing environment for the new consultation workflow.
 * 
 * @author MedFlow Team
 * @version 3.0 - Consultation Hub
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isToday, isSameDay, addDays, subDays } from 'date-fns'
import { ro } from 'date-fns/locale'
import { Link } from 'react-router-dom'
import {
  Calendar,
  List,
  Plus,
  FileText,
  User,
  XCircle,
  Edit,
  CheckCircle,
  Clock,
  AlertTriangle,
  ClipboardList,
  Files,
  Search,
  Stethoscope,
  Heart,
  Activity,
  ChevronLeft,
  ChevronRight,
  X,
  Save,
  Send,
  Eye,
  Phone,
  Mail,
  MapPin,
  Calendar as CalendarIcon,
  Settings,
  Users,
  MapPin as LocationIcon
} from 'lucide-react'

// Import existing components from other pages
import { useAuth } from '../providers/AuthProvider'
import { isDemoMode } from '../utils/demo'
import { formatDateTime } from '../utils/dateUtils'

// Types
interface Patient {
  id: string
  name: string
  email?: string
  phone?: string
  dateOfBirth?: string
  lastVisit?: Date
  totalAppointments: number
  notes?: string
  address?: string
  createdAt?: Date
}

interface Appointment {
  id: string
  patientName: string
  patientId: string
  patientEmail?: string
  patientPhone?: string
  dateTime: Date
  symptoms: string
  notes?: string
  status: 'scheduled' | 'completed' | 'no_show' | 'confirmed' | 'declined'
  doctorId: string
}

interface ConsultationReport {
  id: string
  patientId: string
  appointmentId: string
  symptoms: string
  diagnosis: string
  treatment: string
  additionalDetails: string
  status: 'draft' | 'completed'
  createdAt: Date
  updatedAt: Date
}

interface CalendarEvent {
  id: number
  title: string
  startTime: string
  endTime: string
  color: string
  day: number
  description: string
  location: string
  attendees: string[]
  organizer: string
}

export default function TestAppointments() {
  const { user } = useAuth()
  
  // State management
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null)
  const [patients, setPatients] = useState<Patient[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Report form state
  const [reportForm, setReportForm] = useState({
    symptoms: '',
    diagnosis: '',
    treatment: '',
    additionalDetails: ''
  })
  
  // Calendar state - IMPORTED FROM /calendar
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [currentView, setCurrentView] = useState<'week' | 'month'>('week')
  const [showCreateEvent, setShowCreateEvent] = useState(false)
  
  // Calendar form state - IMPORTED FROM /calendar
  const [newEventTitle, setNewEventTitle] = useState('')
  const [newEventDate, setNewEventDate] = useState(new Date().toISOString().split('T')[0])
  const [newEventStartTime, setNewEventStartTime] = useState('09:00')
  const [newEventEndTime, setNewEventEndTime] = useState('10:00')
  const [newEventDescription, setNewEventDescription] = useState('')
  
  // Demo data for testing
  const demoPatients: Patient[] = [
    {
      id: '1',
      name: 'Ana Popescu',
      email: 'ana.popescu@email.com',
      phone: '0740123456',
      dateOfBirth: '1985-03-15',
      lastVisit: new Date('2024-01-15'),
      totalAppointments: 8,
      notes: 'Controale regulate pentru hipertensiune',
      address: 'București, Sector 1',
      createdAt: new Date('2023-06-15')
    },
    {
      id: '2',
      name: 'Ion Marinescu',
      email: 'ion.marinescu@email.com',
      phone: '0741234567',
      dateOfBirth: '1978-07-22',
      lastVisit: new Date('2024-01-12'),
      totalAppointments: 15,
      notes: 'Diabet zaharat tip 2, necesită monitorizare glicemie',
      address: 'Cluj-Napoca, str. Memorandumului 15',
      createdAt: new Date('2023-04-10')
    },
    {
      id: '3',
      name: 'Maria Ionescu',
      phone: '0742345678',
      dateOfBirth: '1990-11-10',
      lastVisit: new Date('2024-01-08'),
      totalAppointments: 3,
      address: 'Timișoara, bd. Liviu Rebreanu 45',
      createdAt: new Date('2023-12-01')
    },
    {
      id: '4',
      name: 'Gheorghe Dumitrescu',
      email: 'gheorghe.d@email.com',
      phone: '0743456789',
      dateOfBirth: '1965-05-30',
      lastVisit: new Date('2024-01-05'),
      totalAppointments: 22,
      notes: 'Pacient cronic, controale lunare obligatorii',
      address: 'Iași, str. Păcurari 12',
      createdAt: new Date('2022-08-20')
    },
    {
      id: '5',
      name: 'Elena Vasilescu',
      email: 'elena.v@email.com',
      phone: '0744567890',
      dateOfBirth: '1995-12-05',
      lastVisit: new Date('2024-01-20'),
      totalAppointments: 2,
      notes: 'Pacient nou, consultații pentru migrene',
      address: 'Constanța, str. Mircea cel Bătrân 8',
      createdAt: new Date('2024-01-01')
    }
  ]

  const demoAppointments: Appointment[] = [
    {
      id: '1',
      patientName: 'Ana Popescu',
      patientId: '1',
      patientEmail: 'ana.popescu@email.com',
      patientPhone: '0740123456',
      dateTime: new Date(new Date().setHours(9, 0, 0, 0)),
      symptoms: 'Palpitații, dispnee de efort',
      status: 'confirmed',
      doctorId: user?.uid || 'demo'
    },
    {
      id: '2',
      patientName: 'Ion Marinescu',
      patientId: '2',
      patientEmail: 'ion.marinescu@email.com',
      patientPhone: '0741234567',
      dateTime: new Date(new Date().setHours(11, 0, 0, 0)),
      symptoms: 'Control diabet zaharat',
      status: 'scheduled',
      doctorId: user?.uid || 'demo'
    },
    {
      id: '3',
      patientName: 'Maria Ionescu',
      patientId: '3',
      patientPhone: '0742345678',
      dateTime: new Date(new Date().setHours(14, 0, 0, 0)),
      symptoms: 'Migrene frecvente',
      status: 'scheduled',
      doctorId: user?.uid || 'demo'
    }
  ]

  // Calendar events - IMPORTED FROM /calendar
  const demoCalendarEvents: CalendarEvent[] = [
    {
      id: 1,
      title: "Consultație Popescu Maria",
      startTime: "09:00",
      endTime: "10:00",
      color: "bg-[#7A48BF]",
      day: 1,
      description: "Consultare cardiologie - control periodic",
      location: "Cabinet 3",
      attendees: ["Popescu Maria", "Dr. Ionescu"],
      organizer: "Dr. Ionescu",
    },
    {
      id: 2,
      title: "Analize sânge - Dumitrescu Ion",
      startTime: "12:00",
      endTime: "13:00",
      color: "bg-[#804AC8]",
      day: 1,
      description: "Recoltare sânge pentru analize complete",
      location: "Laborator",
      attendees: ["Dumitrescu Ion", "Asistenta Popa"],
      organizer: "Asistenta Popa",
    },
    {
      id: 3,
      title: "Vaccinare copil - Stanescu Andrei",
      startTime: "10:00",
      endTime: "11:00",
      color: "bg-[#8A7A9F]",
      day: 3,
      description: "Vaccinare rutină copil 2 ani",
      location: "Cabinet pediatrie",
      attendees: ["Stanescu Andrei", "Mama Stanescu"],
      organizer: "Dr. Popescu",
    }
  ]

  // Initialize data
  useEffect(() => {
    if (isDemoMode()) {
      setTimeout(() => {
        setPatients(demoPatients)
        setAppointments(demoAppointments)
        setCalendarEvents(demoCalendarEvents)
        setLoading(false)
      }, 800)
    } else {
      // TODO: Load from Firebase
      setLoading(false)
    }
  }, [])

  // Filter today's appointments
  useEffect(() => {
    const today = new Date()
    const filtered = appointments.filter(appt => 
      isSameDay(new Date(appt.dateTime), today)
    )
    setTodayAppointments(filtered)
  }, [appointments])

  // Calendar navigation functions - IMPORTED FROM /calendar
  const goToPreviousMonth = useCallback(() => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() - 1)
    setCurrentDate(newDate)
  }, [currentDate])

  const goToNextMonth = useCallback(() => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + 1)
    setCurrentDate(newDate)
  }, [currentDate])

  const goToPreviousWeek = useCallback(() => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() - 7)
    setCurrentDate(newDate)
  }, [currentDate])

  const goToNextWeek = useCallback(() => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + 7)
    setCurrentDate(newDate)
  }, [currentDate])

  // Calendar utility functions - IMPORTED FROM /calendar
  const getWeekDates = useCallback(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 })
    const end = endOfWeek(currentDate, { weekStartsOn: 1 })
    const dates = eachDayOfInterval({ start, end })
    return dates.map(date => date.getDate())
  }, [currentDate])

  const getMonthDates = useCallback(() => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    const dates = eachDayOfInterval({ start, end })
    return dates
  }, [currentDate])

  // Calendar event functions - IMPORTED FROM /calendar
  const createEvent = useCallback(() => {
    if (!newEventTitle.trim() || !newEventDate || !newEventStartTime || !newEventEndTime) {
      alert('Please fill in all required fields')
      return
    }

    const newEvent: CalendarEvent = {
      id: Date.now(),
      title: newEventTitle,
      startTime: newEventStartTime,
      endTime: newEventEndTime,
      color: "bg-[#7A48BF]",
      day: new Date(newEventDate).getDate(),
      description: newEventDescription,
      location: "Cabinet",
      attendees: [newEventTitle],
      organizer: "Dr. " + (user?.displayName || "User")
    }

    setCalendarEvents(prev => [...prev, newEvent])
    
    // Reset form
    setNewEventTitle('')
    setNewEventDate(new Date().toISOString().split('T')[0])
    setNewEventStartTime('09:00')
    setNewEventEndTime('10:00')
    setNewEventDescription('')
    
    setShowCreateEvent(false)
    
    // TODO: Sync with main calendar
    console.log('New event created:', newEvent)
  }, [newEventTitle, newEventDate, newEventStartTime, newEventEndTime, newEventDescription, user])

  // Patient selection functions
  const selectPatient = useCallback((patient: Patient) => {
    setCurrentPatient(patient)
    // Clear report form when selecting new patient
    setReportForm({
      symptoms: '',
      diagnosis: '',
      treatment: '',
      additionalDetails: ''
    })
  }, [])

  const searchPatients = useCallback((query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setPatients(demoPatients)
      return
    }
    
    const filtered = demoPatients.filter(patient =>
      patient.name.toLowerCase().includes(query.toLowerCase()) ||
      patient.email?.toLowerCase().includes(query.toLowerCase()) ||
      patient.phone?.includes(query)
    )
    setPatients(filtered)
  }, [])

  // Report form functions
  const handleReportFormChange = useCallback((field: keyof typeof reportForm, value: string) => {
    setReportForm(prev => ({ ...prev, [field]: value }))
  }, [])

  const saveReportDraft = useCallback(() => {
    if (!currentPatient) return
    
    const draft: ConsultationReport = {
      id: `draft-${Date.now()}`,
      patientId: currentPatient.id,
      appointmentId: '', // Will be linked when appointment is selected
      symptoms: reportForm.symptoms,
      diagnosis: reportForm.diagnosis,
      treatment: reportForm.treatment,
      additionalDetails: reportForm.additionalDetails,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    // TODO: Save to Firebase
    console.log('Saving draft report:', draft)
    
    // Show success message
    alert('Draft saved successfully!')
  }, [currentPatient, reportForm])

  const submitReport = useCallback(() => {
    if (!currentPatient) {
      alert('Please select a patient first')
      return
    }
    
    if (!reportForm.symptoms || !reportForm.diagnosis || !reportForm.treatment) {
      alert('Please fill in all required fields (symptoms, diagnosis, treatment)')
      return
    }
    
    const report: ConsultationReport = {
      id: `report-${Date.now()}`,
      patientId: currentPatient.id,
      appointmentId: '', // Will be linked when appointment is selected
      symptoms: reportForm.symptoms,
      diagnosis: reportForm.diagnosis,
      treatment: reportForm.treatment,
      additionalDetails: reportForm.additionalDetails,
      status: 'completed',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    // TODO: Save to Firebase and send to /reports
    console.log('Submitting report:', report)
    
    // Show success message
    alert('Report submitted successfully!')
    
    // Clear form
    setReportForm({
      symptoms: '',
      diagnosis: '',
      treatment: '',
      additionalDetails: ''
    })
  }, [currentPatient, reportForm])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading Consultation Hub...</div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Reîncearcă
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black text-white">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">
                🏥 Consultation Hub
              </h1>
              <p className="text-purple-200 mt-2">
                Complete patient consultation workflow with integrated calendar and reporting
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/appointments"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <span>← Back to Main Appointments</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - 3-Panel Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-200px)]">
          
          {/* LEFT PANEL - Mini Calendar (IMPORTED FROM /calendar) */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6 h-full">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-purple-400" />
                Mini Calendar
              </h2>
              
              {/* Calendar Controls - IMPORTED FROM /calendar */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentView('week')}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      currentView === 'week' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => setCurrentView('month')}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      currentView === 'month' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Month
                  </button>
                </div>
                
                <div className="flex space-x-1">
                  <button
                    onClick={currentView === 'week' ? goToPreviousWeek : goToPreviousMonth}
                    className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={currentView === 'week' ? goToNextWeek : goToNextMonth}
                    className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Calendar Display - IMPORTED FROM /calendar */}
              {currentView === 'week' ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-2">
                    {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
                      <div key={i} className="p-1">{day}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {getWeekDates().map((date, i) => (
                      <div
                        key={i}
                        className={`p-2 text-center rounded cursor-pointer transition-colors ${
                          isToday(new Date(currentDate.getFullYear(), currentDate.getMonth(), date))
                            ? 'bg-purple-600 text-white'
                            : 'hover:bg-gray-800'
                        }`}
                        onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), date))}
                      >
                        {date}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-2">
                    {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
                      <div key={i} className="p-1">{day}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {getMonthDates().map((date, i) => (
                      <div
                        key={i}
                        className={`p-2 text-center rounded cursor-pointer transition-colors text-sm ${
                          isToday(date)
                            ? 'bg-purple-600 text-white'
                            : 'hover:bg-gray-800'
                        }`}
                        onClick={() => setSelectedDate(date)}
                      >
                        {date.getDate()}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions - IMPORTED FROM /calendar */}
              <div className="mt-6 space-y-2">
                <button 
                  onClick={() => setShowCreateEvent(true)}
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
          </div>

          {/* RIGHT PANEL - Patient Management */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6 h-full">
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {currentPatient.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-white">Consulting: {currentPatient.name}</div>
                          <div className="text-sm text-gray-400">
                            {format(new Date(), 'EEEE, MMMM d, yyyy', { locale: ro })}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={saveReportDraft}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Draft
                        </button>
                        <button
                          onClick={submitReport}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Submit Report
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Report Form */}
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
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
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
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
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
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
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
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                    <button
                      onClick={() => setReportForm({
                        symptoms: '',
                        diagnosis: '',
                        treatment: '',
                        additionalDetails: ''
                      })}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Clear Form
                    </button>
                    <button
                      onClick={saveReportDraft}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Draft
                    </button>
                    <button
                      onClick={submitReport}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Submit Report
                    </button>
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

      {/* Create Event Modal - IMPORTED FROM /calendar */}
      {showCreateEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#100B1A] p-6 rounded-lg shadow-xl max-w-md w-full mx-4 border border-[#7A48BF]/20">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-2xl font-bold text-white">Programare Nouă</h3>
              <button
                onClick={() => setShowCreateEvent(false)}
                className="text-white/70 hover:text-white transition-colors p-2 -mr-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Nume pacient</label>
                <input
                  type="text"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#100B1A] border border-[#7A48BF]/30 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7A48BF]"
                  placeholder="Ex: Ion Popescu"
                />
              </div>
              
              <div>
                <label className="block text-white text-sm font-medium mb-2">Data Programării</label>
                <input
                  type="date"
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#100B1A] border border-[#7A48BF]/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#7A48BF]"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Ora Început</label>
                  <select
                    value={newEventStartTime}
                    onChange={(e) => setNewEventStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-[#100B1A] border border-[#7A48BF]/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#7A48BF]"
                  >
                    <option value="">Selectați ora</option>
                    {Array.from({ length: 13 }, (_, i) => i + 8).map(hour => [
                      <option key={`${hour}-00`} value={`${hour.toString().padStart(2, '0')}:00`}>
                        {hour.toString().padStart(2, '0')}:00
                      </option>,
                      <option key={`${hour}-30`} value={`${hour.toString().padStart(2, '0')}:30`}>
                        {hour.toString().padStart(2, '0')}:30
                      </option>
                    ]).flat()}
                  </select>
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Ora Sfârșit</label>
                  <select
                    value={newEventEndTime}
                    onChange={(e) => setNewEventEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-[#100B1A] border border-[#7A48BF]/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#7A48BF]"
                  >
                    <option value="">Selectați ora</option>
                    {Array.from({ length: 13 }, (_, i) => i + 8).map(hour => [
                      <option key={`${hour}-00`} value={`${hour.toString().padStart(2, '0')}:00`}>
                        {hour.toString().padStart(2, '0')}:00
                      </option>,
                      <option key={`${hour}-30`} value={`${hour.toString().padStart(2, '0')}:30`}>
                        {hour.toString().padStart(2, '0')}:30
                      </option>
                    ]).flat()}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-white text-sm font-medium mb-2">Descriere</label>
                <textarea
                  value={newEventDescription}
                  onChange={(e) => setNewEventDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-[#100B1A] border border-[#7A48BF]/30 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7A48BF]"
                  rows={3}
                  placeholder="Introduceți descrierea programării"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-between items-center">
              <button
                onClick={() => setShowCreateEvent(false)}
                className="px-4 py-2 text-white/70 hover:text-white transition-colors"
              >
                Anulează
              </button>
              <button 
                onClick={createEvent}
                className="px-4 py-2 bg-[#7A48BF] hover:bg-[#804AC8] text-white rounded-md transition-colors"
              >
                Creează Programarea
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper function for calculating age
function calculateAge(dateOfBirth: string): number {
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}
