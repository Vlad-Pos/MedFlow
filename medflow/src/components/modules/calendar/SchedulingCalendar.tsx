/**
 * 🏥 MedFlow - Scheduling Calendar Component
 * 
 * Enhanced scheduling calendar with MedFlow brand integration
 * and complete Romanian localization support.
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns'
import { ro } from 'date-fns/locale'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Settings,
  Clock,
  MapPin,
  Users,
  User,
  Calendar as CalendarIcon,
  X
} from 'lucide-react'

// Enhanced UI Components Integration
import { LoadingSpinner } from '../../ui/feedback/LoadingSpinner'
import { AnimatedButton, IconButton } from '../../ui/buttons/AnimatedButton'
import { ErrorBoundary } from '../../ui/feedback/ErrorBoundary'
import FadeContent from '../../ui/animations/FadeContent'
import EventCard from './EventCard'


// Firebase and appointment utilities
import { auth, db } from '../../../services/firebase'
import { getAppointmentsForDateRange, createAppointment, updateAppointment, deleteAppointment } from '../../../utils/appointmentUtils'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'

// Validation utilities
import { validateCNP, extractBirthDateFromCNP } from '../../../utils/cnpValidation'
import { COUNTRIES, DEFAULT_COUNTRY } from '../../../utils/phoneValidation'

// Types for calendar events
export interface CalendarEvent {
  id: number                    // Display ID (preserved for backward compatibility)
  firebaseId?: string          // NEW: Firebase document ID for CRUD operations
  title: string
  startTime: string
  endTime: string
  color: string
  day: number
  description: string
  location: string
  attendees: string[]
  organizer: string
  // New patient information fields
  patientCNP?: string
  patientEmail?: string
  patientPhone?: string
  patientBirthDate?: Date
}

/**
 * SchedulingCalendar Component
 * 
 * Enhanced scheduling calendar with MedFlow brand integration
 * and complete Romanian language support.
 */
export function SchedulingCalendar() {
  // Helper function to capitalize month names
  const capitalizeMonth = (text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
  }

  // Robust date formatting function that ensures capitalization
  const formatDateWithCapitalization = (date: Date, formatString: string): string => {
    try {
      // Try with Romanian locale first
      const formatted = format(date, formatString, { locale: ro })
      return capitalizeMonth(formatted)
    } catch (error) {
      // Fallback to English if Romanian locale fails
      const formatted = format(date, formatString)
      return capitalizeMonth(formatted)
    }
  }

  // Force capitalization for month names - direct fix
  const forceCapitalizeMonth = (date: Date): string => {
    const day = date.getDate()
    const month = date.getMonth()
    const year = date.getFullYear()
    
    // Romanian month names
    const romanianMonths = [
      'ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie',
      'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'
    ]
    
    const monthName = romanianMonths[month]
    const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1)
    
    return `${day} ${capitalizedMonth} ${year}`
  }

  // NEW: Batch state update function for performance optimization
  const batchUpdateEvents = useCallback((updates: Array<{ id: number; updates: Partial<CalendarEvent> }>) => {
    setEvents(prevEvents => {
      const eventMap = new Map(prevEvents.map(event => [event.id, event]))
      
      updates.forEach(({ id, updates: eventUpdates }) => {
        const existingEvent = eventMap.get(id)
        if (existingEvent) {
          eventMap.set(id, { ...existingEvent, ...eventUpdates })
        }
      })
      
      return Array.from(eventMap.values())
    })
  }, [])

  // Romanian medical appointment statuses and categories
  const APPOINTMENT_STATUS = {
    SCHEDULED: 'Programat',
    CONFIRMED: 'Confirmat',
    COMPLETED: 'Completat',
    CANCELLED: 'Anulat',
    NO_SHOW: 'Nu s-a prezentat'
  } as const

  const APPOINTMENT_CATEGORIES = {
    CONSULTATION: 'Consultație',
    LABORATORY: 'Laborator',
    IMAGING: 'Imagistică',
    VACCINATION: 'Vaccinare',
    SURGERY: 'Chirurgie',
    EMERGENCY: 'Urgență',
    FOLLOW_UP: 'Control',
    PREVENTIVE: 'Preventiv'
  } as const

  const APPOINTMENT_PRIORITIES = {
    LOW: 'Scăzută',
    MEDIUM: 'Medie',
    HIGH: 'Ridicată',
    URGENT: 'Urgentă'
  } as const

  // State management
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentView, setCurrentView] = useState<'day' | 'week' | 'month'>('week')
  const [currentDateObj, setCurrentDateObj] = useState(new Date())
  const [currentMonth, setCurrentMonth] = useState(() => {
    return formatDateWithCapitalization(new Date(), 'MMMM yyyy')
  })
  const [currentDate, setCurrentDate] = useState(() => {
    return forceCapitalizeMonth(new Date())
  })
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showCreateEvent, setShowCreateEvent] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(false)
  const [isEditingEvent, setIsEditingEvent] = useState(false)
  
  // NEW: Loading states for Firebase operations
  const [isCreatingEvent, setIsCreatingEvent] = useState(false)
  const [isUpdatingEvent, setIsUpdatingEvent] = useState(false)
  const [isDeletingEvent, setIsDeletingEvent] = useState(false)
  const [isReschedulingEvent, setIsReschedulingEvent] = useState(false)
  
  // Helper function to set current date with proper capitalization
  const setCurrentDateWithCapitalization = useCallback((date: Date) => {
    setCurrentDate(forceCapitalizeMonth(date))
    setCurrentMonth(formatDateWithCapitalization(date, 'MMMM yyyy'))
  }, [])

  // Go to today function that properly navigates calendar views
  const goToToday = useCallback(() => {
    const today = new Date()
    setCurrentDateObj(today)
    setCurrentDate(forceCapitalizeMonth(today))
    setCurrentMonth(formatDateWithCapitalization(today, 'MMMM yyyy'))
  }, [])
  
  // Performance optimization: respect user's motion preferences
  const prefersReducedMotion = useReducedMotion()
  
  // NEW: Focus management for accessibility
  const mainCalendarRef = useRef<HTMLDivElement>(null)
  const createEventButtonRef = useRef<HTMLButtonElement>(null)
  
  // Focus management when view changes
  useEffect(() => {
    if (mainCalendarRef.current) {
      mainCalendarRef.current.focus()
    }
  }, [currentView])
  
  // Initialize current date and month on component mount
  useEffect(() => {
    const now = new Date()
    setCurrentDateObj(now)
    setCurrentDate(forceCapitalizeMonth(now))
    setCurrentMonth(formatDateWithCapitalization(now, 'MMMM yyyy'))
    setIsLoaded(true)
    
    // Fetch appointments from Firebase on initial load
    fetchAppointmentsFromFirebase()
  }, [])

  // Function to fetch appointments from Firebase and convert to calendar events
  const fetchAppointmentsFromFirebase = useCallback(() => {
    if (!auth.currentUser?.uid) {
      console.log('No authenticated user, using demo events')
      // Fallback to demo events if no user is authenticated (PRESERVED)
      setEvents([
        {
          id: 1,
          title: "Consultație Popescu Maria",
          startTime: "09:00",
          endTime: "10:00",
          color: getEventColor(1),
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
          color: getEventColor(2),
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
          color: getEventColor(3),
          day: 3,
          description: "Vaccinare rutină copil 2 ani",
          location: "Cabinet pediatrie",
          attendees: ["Stanescu Andrei", "Mama Stanescu"],
          organizer: "Dr. Popescu",
        },
        {
          id: 4,
          title: "Control ginecologie - Vasilescu Elena",
          startTime: "14:00",
          endTime: "15:00",
          color: getEventColor(4),
          day: 2,
          description: "Control periodic ginecologie",
          location: "Cabinet 5",
          attendees: ["Vasilescu Elena", "Dr. Dumitrescu"],
          organizer: "Dr. Dumitrescu",
        },
        {
          id: 5,
          title: "Consultație psihiatrie - Marin Ion",
          startTime: "13:00",
          endTime: "14:30",
          color: getEventColor(5),
          day: 4,
          description: "Sesiune psihoterapie",
          location: "Cabinet psihiatrie",
          attendees: ["Marin Ion", "Dr. Marin"],
          organizer: "Dr. Marin",
        },
      ]);
      return;
    }

    try {
      // Calculate date range for current view using currentDateObj from state
      let startDate: Date, endDate: Date
      
      switch (currentView) {
        case 'day':
          startDate = new Date(currentDateObj);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(currentDateObj);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'week':
          startDate = startOfWeek(currentDateObj, { weekStartsOn: 1 });
          endDate = endOfWeek(currentDateObj, { weekStartsOn: 1 });
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'month':
          startDate = startOfMonth(currentDateObj);
          endDate = endOfMonth(currentDateObj);
          endDate.setHours(23, 59, 59, 999);
          break;
        default:
          startDate = new Date(currentDateObj);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(currentDateObj);
          endDate.setHours(23, 59, 59, 999);
      }

      // Create real-time listener (NEW: Enhanced with ModernCalendar approach)
      const q = query(
        collection(db, 'appointments'),
        where('userId', '==', auth.currentUser.uid),
        where('dateTime', '>=', startDate),
        where('dateTime', '<=', endDate),
        orderBy('dateTime', 'asc')
      )

      // Return unsubscribe function for cleanup (NEW: Real-time listener)
      return onSnapshot(q, 
        (snapshot) => {
          try {
            const appointments = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              dateTime: doc.data().dateTime.toDate(),
              createdAt: doc.data().createdAt?.toDate(),
              updatedAt: doc.data().updatedAt?.toDate(),
              patientBirthDate: doc.data().patientBirthDate ? doc.data().patientBirthDate.toDate() : undefined
            }))

                          // Transform to CalendarEvent format (PRESERVED LOGIC)
              const calendarEvents: CalendarEvent[] = appointments.map((appointment: any, index: number) => {
                // NEW: Calculate end time based on actual duration
                const duration = appointment.duration || 60; // Default to 60 minutes if no duration
                const endTime = new Date(appointment.dateTime.getTime() + duration * 60 * 1000).toTimeString().slice(0, 5);
                
                return {
                  id: index + 1, // Generate unique ID for display
                  firebaseId: appointment.id, // NEW: Store Firebase document ID
                  title: appointment.patientName,
                  startTime: appointment.dateTime.toTimeString().slice(0, 5), // Extract HH:MM
                  endTime: endTime, // Use calculated end time based on duration
                  color: getEventColor(index + 1),
                  day: appointment.dateTime.getDay() === 0 ? 7 : appointment.dateTime.getDay(), // Keep for backward compatibility
                  description: appointment.symptoms || `Programare pentru ${appointment.patientName}`,
                  location: "Cabinet principal",
                  attendees: [appointment.patientName],
                  organizer: "Medicul curant",
                  // NEW: Enhanced patient information fields (PRESERVED)
                  patientCNP: appointment.patientCNP,
                  patientEmail: appointment.patientEmail,
                  patientPhone: appointment.patientPhone,
                  patientBirthDate: appointment.patientBirthDate,
                                 }
               })

            setEvents(calendarEvents);
          } catch (error) {
            console.error('Error processing appointment data:', error);
            // Fallback to demo events on error (PRESERVED)
            setEvents([
              {
                id: 1,
                title: "Consultație Demo",
                startTime: "09:00",
                endTime: "10:00",
                color: getEventColor(1),
                day: 1,
                description: "Programare demonstrativă",
                location: "Cabinet demo",
                attendees: ["Pacient Demo"],
                organizer: "Dr. Demo",
              }
            ]);
          }
        },
        (error) => {
          console.error('Firebase listener error:', error);
          // Fallback to demo events on error (PRESERVED)
          setEvents([
            {
              id: 1,
              title: "Consultație Demo",
              startTime: "09:00",
              endTime: "10:00",
              color: getEventColor(1),
              day: 1,
              description: "Programare demonstrativă",
              location: "Cabinet demo",
              attendees: ["Pacient Demo"],
              organizer: "Dr. Demo",
            }
          ]);
        }
      )
    } catch (error) {
      console.error('Error setting up Firebase query:', error);
      // Fallback to demo events on error (PRESERVED)
      setEvents([
        {
          id: 1,
          title: "Consultație Demo",
          startTime: "09:00",
          endTime: "10:00",
          color: getEventColor(1),
          day: 1,
          description: "Programare demonstrativă",
          location: "Cabinet demo",
          attendees: ["Pacient Demo"],
          organizer: "Dr. Demo",
        }
      ]);
    }
  }, [currentView, currentDateObj, auth.currentUser?.uid]);

  // Refetch appointments when date or view changes
  useEffect(() => {
    if (isLoaded) {
      const unsubscribe = fetchAppointmentsFromFirebase()
      // Cleanup function to unsubscribe from Firebase listener
      return () => {
        if (unsubscribe && typeof unsubscribe === 'function') {
          unsubscribe()
        }
      }
    }
  }, [currentDateObj, currentView, isLoaded, fetchAppointmentsFromFirebase])

  // Navigation functions for calendar controls
  const goToPreviousMonth = useCallback(() => {
    const newDate = new Date(currentDateObj)
    newDate.setMonth(newDate.getMonth() - 1)
    setCurrentDateObj(newDate)
    setCurrentDateWithCapitalization(newDate)
  }, [currentDateObj, setCurrentDateWithCapitalization])

  const goToNextMonth = useCallback(() => {
    const newDate = new Date(currentDateObj)
    newDate.setMonth(newDate.getMonth() + 1)
    setCurrentDateObj(newDate)
    setCurrentDateWithCapitalization(newDate)
  }, [currentDateObj, setCurrentDateWithCapitalization])

  const setView = useCallback((view: 'day' | 'week' | 'month') => {
    setCurrentView(view)
  }, [])

  // Day and week navigation functions
  const goToPreviousDay = useCallback(() => {
    const newDate = new Date(currentDateObj)
    newDate.setDate(newDate.getDate() - 1)
    setCurrentDateObj(newDate)
    setCurrentDateWithCapitalization(newDate)
  }, [currentDateObj, setCurrentDateWithCapitalization])

  const goToNextDay = useCallback(() => {
    const newDate = new Date(currentDateObj)
    newDate.setDate(newDate.getDate() + 1)
    setCurrentDateObj(newDate)
    setCurrentDateWithCapitalization(newDate)
  }, [currentDateObj, setCurrentDateWithCapitalization])

  const goToPreviousWeek = useCallback(() => {
    const newDate = new Date(currentDateObj)
    newDate.setDate(newDate.getDate() - 7)
    setCurrentDateObj(newDate)
    setCurrentDateWithCapitalization(newDate)
  }, [currentDateObj, setCurrentDateWithCapitalization])

  const goToNextWeek = useCallback(() => {
    const newDate = new Date(currentDateObj)
    newDate.setDate(newDate.getDate() + 7)
    setCurrentDateObj(newDate)
    setCurrentDateWithCapitalization(newDate)
  }, [currentDateObj, setCurrentDateWithCapitalization])

  // Smart navigation functions based on current view
  const goToPrevious = useCallback(() => {
    switch (currentView) {
      case 'day':
        goToPreviousDay()
        break
      case 'week':
        goToPreviousWeek()
        break
      case 'month':
        goToPreviousMonth()
        break
    }
  }, [currentView, goToPreviousDay, goToPreviousWeek, goToPreviousMonth])

  const goToNext = useCallback(() => {
    switch (currentView) {
      case 'day':
        goToNextDay()
        break
      case 'week':
        goToNextWeek()
        break
      case 'month':
        goToNextMonth()
        break
    }
  }, [currentView, goToNextDay, goToNextWeek, goToNextMonth])

  // Form state for creating new events
  const [newEventTitle, setNewEventTitle] = useState('')
  const [newEventDate, setNewEventDate] = useState(new Date().toISOString().split('T')[0])
  const [newEventStartTime, setNewEventStartTime] = useState('09:00')
  const [newEventDuration, setNewEventDuration] = useState('30') // NEW: Duration state
  const [newEventEndTime, setNewEventEndTime] = useState('09:30') // Updated default
  const [newEventDescription, setNewEventDescription] = useState('')
  
  // New fields for patient information
  const [newEventCNP, setNewEventCNP] = useState('')
  const [newEventEmail, setNewEventEmail] = useState('')
  const [newEventPhone, setNewEventPhone] = useState('')
  const [newEventCountryCode, setNewEventCountryCode] = useState('RO')

  // NEW: Update end time when duration or start time changes
  useEffect(() => {
    if (newEventStartTime && newEventDuration) {
      const endTime = calculateEndTimeFromDuration(newEventStartTime, parseInt(newEventDuration))
      setNewEventEndTime(endTime)
    }
  }, [newEventStartTime, newEventDuration])
  
  // Form state for editing existing events
  const [editEventTitle, setEditEventTitle] = useState('')
  const [editEventStartTime, setEditEventStartTime] = useState('')
  const [editEventEndTime, setEditEventEndTime] = useState('')
  const [editEventDescription, setEditEventDescription] = useState('')
  const [editEventLocation, setEditEventLocation] = useState('')
  
  // Enhanced patient information fields for editing
  const [editEventCNP, setEditEventCNP] = useState('')
  const [editEventEmail, setEditEventEmail] = useState('')
  const [editEventPhone, setEditEventPhone] = useState('')
  const [editEventBirthDate, setEditEventBirthDate] = useState('')

  // Enhanced brand color system with smooth transitions
  const enhancedEventColors = [
    "bg-[#7A48BF]",      // Primary - Secondary Floating Button
    "bg-[#804AC8]",      // Secondary - Secondary Normal Button  
    "bg-[#8A7A9F]",      // Accent - Logo Color
    "bg-gradient-to-r from-[#7A48BF] to-[#804AC8]", // Gradient - Brand Blend
    "bg-[#25153A]",      // Dark Purple - Gradient
    "bg-[#231A2F]"      // Plum Purple - Extra Color 1
  ]

  // Dynamic color assignment with brand consistency
  const getEventColor = (eventId: number) => {
    return enhancedEventColors[eventId % enhancedEventColors.length]
  }

  // Helper function to extract modal background color from event color
  const getModalColor = (eventColor: string) => {
    if (eventColor.includes('gradient')) {
      // For gradients, extract the first solid color
      const fromMatch = eventColor.match(/from-\[([^\]]+)\]/)
      if (fromMatch) {
        return `bg-[${fromMatch[1]}]`
      }
      // Fallback to primary brand color
      return 'bg-[#7A48BF]'
    }
    // For simple colors, extract the base color class
    return eventColor.split(' ')[0]
  }

  // Sample calendar events with Romanian medical appointments
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: 1,
      title: "Consultație Popescu Maria",
      startTime: "09:00",
      endTime: "10:00",
      color: getEventColor(1),
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
      color: getEventColor(2),
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
      color: getEventColor(3),
      day: 3,
      description: "Vaccinare rutină copil 2 ani",
      location: "Cabinet pediatrie",
      attendees: ["Stanescu Andrei", "Mama Stanescu"],
      organizer: "Dr. Popescu",
    },
    {
      id: 4,
      title: "Control ginecologie - Vasilescu Elena",
      startTime: "14:00",
      endTime: "15:00",
      color: getEventColor(4),
      day: 2,
      description: "Control periodic ginecologie",
      location: "Cabinet 5",
      attendees: ["Vasilescu Elena", "Dr. Dumitrescu"],
      organizer: "Dr. Dumitrescu",
    },
    {
      id: 5,
      title: "Consultație psihiatrie - Marin Ion",
      startTime: "13:00",
      endTime: "14:30",
      color: getEventColor(5),
      day: 4,
      description: "Sesiune psihoterapie",
      location: "Cabinet psihiatrie",
      attendees: ["Marin Ion", "Dr. Marin"],
      organizer: "Dr. Marin",
    },
  ])

  // Calendar configuration with Romanian week days
  const weekDays = ["L", "M", "M", "J", "V", "S", "D"] // Romanian abbreviations
  const timeSlots = Array.from({ length: 15 }, (_, i) => i + 8) // 8 AM to 10 PM (22:00)

  // Generate dynamic week dates for the current week
  const getWeekDates = () => {
    const startDate = startOfWeek(currentDateObj, { weekStartsOn: 1 })
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      return date.getDate()
    })
  }

  // Helper function to calculate end time from duration
  const calculateEndTimeFromDuration = (startTime: string, duration: number) => {
    const start = new Date(`2000-01-01T${startTime}:00`)
    const end = new Date(start.getTime() + duration * 60000)
    return end.toTimeString().slice(0, 5)
  }

  // NEW: Helper function to check if event is perfectly aligned with grid
  const isEventAlignedWithGrid = (startTime: string, endTime: string) => {
    const start = Number.parseInt(startTime.split(":")[0]) + Number.parseInt(startTime.split(":")[1]) / 60
    const end = Number.parseInt(endTime.split(":")[0]) + Number.parseInt(endTime.split(":")[1]) / 60
    const duration = end - start
    
    // Check if duration aligns with 15-minute intervals (0.25 hours)
    const durationInQuarters = duration * 4 // Convert to 15-minute units
    return Number.isInteger(durationInQuarters)
  }

  // NEW: Helper function to get enhanced event card classes based on alignment
  const getEnhancedEventCardClasses = (event: CalendarEvent) => {
    const start = Number.parseInt(event.startTime.split(":")[0]) + Number.parseInt(event.startTime.split(":")[1]) / 60
    const end = Number.parseInt(event.endTime.split(":")[0]) + Number.parseInt(event.endTime.split(":")[1]) / 60
    const duration = end - start
    
    // Responsive padding based on card size
    let paddingClass = "p-2"
    if (duration <= 0.25) { // 15 minutes or less
      paddingClass = "p-1"
    } else if (duration <= 0.34) { // 20 minutes (slightly more tolerance)
      paddingClass = "pt-0 pb-2 px-1.5" // Removed top padding completely for perfect centering
    }
    
    const baseClasses = `${event.color} rounded-md ${paddingClass} text-white text-xs shadow-md cursor-pointer`
    const isAligned = isEventAlignedWithGrid(event.startTime, event.endTime)
    
    if (isAligned) {
      // Aligned events: solid border with brand color
      return `${baseClasses} border-2 border-white/20`
    } else {
      // Non-aligned events: dotted border with brand color
      return `${baseClasses} border-2 border-dashed border-white/30`
    }
  }

  // NEW: Helper function to get responsive text classes based on event duration
  const getResponsiveTextClasses = (event: CalendarEvent) => {
    const start = Number.parseInt(event.startTime.split(":")[0]) + Number.parseInt(event.startTime.split(":")[1]) / 60
    const end = Number.parseInt(event.endTime.split(":")[0]) + Number.parseInt(event.endTime.split(":")[1]) / 60
    const duration = end - start
    

    
    if (duration <= 0.25) { // 15 minutes or less
      return {
        container: "flex justify-between items-center min-h-0",
        nameContainer: "flex flex-col justify-center flex-1 min-w-0",
        textClass: "font-medium text-[8px] leading-tight truncate text-white",
        timeClass: "font-medium text-[8px] leading-tight text-right flex-shrink-0 ml-1 text-white self-start"
      }
    } else if (duration <= 0.34) { // 20 minutes (slightly more tolerance)
      return {
        container: "flex justify-between items-start min-h-0",
        nameContainer: "flex flex-col justify-center flex-1 min-w-0",
        textClass: "font-medium text-[9px] leading-tight truncate text-white",
        timeClass: "font-medium text-[9px] leading-tight text-right flex-shrink-0 ml-1 text-white self-start"
      }
    } else if (duration <= 0.5) { // 30 minutes
      return {
        container: "flex justify-between items-start min-h-0",
        nameContainer: "flex flex-col justify-center flex-1 min-w-0",
        textClass: "font-medium text-[10px] leading-tight truncate text-white",
        timeClass: "font-medium text-[10px] leading-tight text-right flex-shrink-0 ml-1 text-white"
      }
    } else { // 45+ minutes
      return {
        container: "flex justify-between items-start",
        nameContainer: "flex flex-col justify-center flex-1 min-w-0",
        textClass: "font-medium text-xs leading-tight truncate text-white",
        timeClass: "font-medium text-xs leading-tight text-right flex-shrink-0 ml-1 text-white"
      }
    }
  }

  // NEW: Helper function to format time for display
  const formatTimeForDisplay = (time: string) => {
    // Remove leading zeros for cleaner display
    const [hours, minutes] = time.split(':')
    return `${parseInt(hours)}:${minutes}`
  }

  // NEW: Helper function to parse and format patient names
  const parsePatientName = (fullName: string) => {
    const names = fullName.trim().split(/\s+/)
    
    if (names.length === 1) {
      return {
        firstName: names[0],
        lastName: null,
        isSingleName: true
      }
    } else if (names.length >= 2) {
      return {
        firstName: names[0],
        lastName: names.slice(1).join(' '), // Handle multiple last names
        isSingleName: false
      }
    } else {
      return {
        firstName: fullName,
        lastName: null,
        isSingleName: true
      }
    }
  }

  // Helper function to calculate event position and height
  const calculateEventStyle = (startTime: string, endTime: string) => {
    const start = Number.parseInt(startTime.split(":")[0]) + Number.parseInt(startTime.split(":")[1]) / 60
    const end = Number.parseInt(endTime.split(":")[0]) + Number.parseInt(endTime.split(":")[1]) / 60
    const top = (start - 8) * 80 // 80px per hour
    const height = (end - start) * 80
    return { top: `${top}px`, height: `${height}px` }
  }

  // NEW: Helper function to calculate new time from drag position
  const calculateNewTimeFromDrag = (dragY: number, dayIndex: number) => {
    // Calculate new hour and minute from drag position
    const newHour = Math.floor(dragY / 80) + 8 // 80px per hour, starting at 8 AM
    const newMinute = Math.floor((dragY % 80) / 80 * 60)
    
    // Ensure time is within valid range (8:00 - 22:00)
    if (newHour < 8 || newHour >= 22) {
      return null
    }
    
    // Calculate new date if dragged to different day
    const newDay = dayIndex + 1
    const newDate = new Date(currentDateObj)
    newDate.setDate(newDate.getDate() + (newDay - newDate.getDay()))
    newDate.setHours(newHour, newMinute, 0, 0)
    
    // Format new time strings
    const newStartTime = `${newHour.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}`
    const newEndTime = new Date(newDate.getTime() + 60 * 60 * 1000).toTimeString().slice(0, 5)
    
    return {
      newStartTime,
      newEndTime,
      newDay,
      newDate
    }
  }

  // Sample my calendars with Romanian medical categories
  const [myCalendars, setMyCalendars] = useState([
    { id: 1, name: "Programări generale", color: "bg-[#7A48BF]", isEditing: false },
    { id: 2, name: "Urgențe", color: "bg-[#804AC8]", isEditing: false },
    { id: 3, name: "Controluri", color: "bg-[#7A48BF]", isEditing: false },
    { id: 4, name: "Analize", color: "bg-[#804AC8]", isEditing: false },
  ])

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
  }

  // Calendar editing functions
  const startEditingCalendar = (calendarId: number) => {
    setMyCalendars(prev => prev.map(cal => 
      cal.id === calendarId ? { ...cal, isEditing: true } : cal
    ))
  }

  const saveCalendarChanges = (calendarId: number, newName: string, newColor: string) => {
    setMyCalendars(prev => prev.map(cal => 
      cal.id === calendarId ? { ...cal, name: newName, color: newColor, isEditing: false } : cal
    ))
  }

  const cancelCalendarEditing = (calendarId: number) => {
    setMyCalendars(prev => prev.map(cal => 
      cal.id === calendarId ? { ...cal, isEditing: false } : cal
    ))
  }

  // Calendar color update function (currently unused but available for future use)
  const updateCalendarColor = (calendarId: number, newColor: string) => {
    setMyCalendars(prev => prev.map(cal => 
      cal.id === calendarId ? { ...cal, color: newColor } : cal
    ))
  }

  // Handle setting current date from mini-calendar (currently unused but available for future use)
  const setCurrentDateHandler = useCallback((date: Date) => {
    setCurrentDateObj(date)
    setCurrentDateWithCapitalization(date)
  }, [setCurrentDateWithCapitalization])

  const handleCreateEvent = () => {
    setShowCreateEvent(true)
    // Reset form state when opening
    setNewEventTitle('')
    // Set the date to the currently selected date from the calendar
    // Fix timezone issue by using local date formatting
    const year = currentDateObj.getFullYear()
    const month = String(currentDateObj.getMonth() + 1).padStart(2, '0')
    const day = String(currentDateObj.getDate()).padStart(2, '0')
    setNewEventDate(`${year}-${month}-${day}`)
    setNewEventStartTime('09:00')
    setNewEventDuration('30') // Reset to default duration
    setNewEventEndTime('09:30') // Reset to match default duration
    setNewEventDescription('')
    // Reset new patient information fields
    setNewEventCNP('')
    setNewEventEmail('')
    setNewEventPhone('')
    setNewEventCountryCode('RO')
  }

  const createEvent = async () => {
    if (!newEventTitle || !newEventDate || !newEventStartTime || !newEventEndTime) {
      return // Don't create event without required fields (PRESERVED)
    }

    // Check if user is authenticated (PRESERVED)
    if (!auth.currentUser) {
      alert('Trebuie să fiți autentificat pentru a crea o programare')
      return
    }
    
    // NEW: Set loading state
    setIsCreatingEvent(true)

    try {
      // Parse the selected date and time (PRESERVED LOGIC)
      const selectedDate = new Date(newEventDate)
      const [hours, minutes] = newEventStartTime.split(':').map(Number)
      const appointmentDateTime = new Date(selectedDate)
      appointmentDateTime.setHours(hours, minutes, 0, 0)

      // Extract birth date from CNP if provided (PRESERVED LOGIC)
      const birthDate = newEventCNP ? extractBirthDateFromCNP(newEventCNP) : null

      // Format phone number with country code if provided (PRESERVED LOGIC)
      const formattedPhone = newEventPhone ? `${newEventCountryCode}${newEventPhone}` : undefined

      // Create appointment data for Firebase (PRESERVED LOGIC)
      const appointmentData = {
        patientName: newEventTitle,
        patientEmail: newEventEmail || undefined,
        patientPhone: formattedPhone,
        patientCNP: newEventCNP || undefined,
        patientBirthDate: birthDate || undefined,
        dateTime: appointmentDateTime,
        duration: parseInt(newEventDuration), // NEW: Add duration to Firebase
        symptoms: newEventDescription || `Programare pentru ${newEventTitle}`,
        notes: newEventDescription || undefined,
        status: 'scheduled' as const,
        userId: auth.currentUser.uid,
        createdBy: auth.currentUser.uid,
      }

      // Create appointment in Firebase (ENHANCED ERROR HANDLING)
      const appointmentId = await createAppointment(appointmentData)

      // Create local event for display (PRESERVED LOGIC)
      const dayOfWeek = selectedDate.getDay()
      const adjustedDay = dayOfWeek === 0 ? 7 : dayOfWeek

      const newEvent: CalendarEvent = {
        id: Math.max(...events.map(e => e.id)) + 1,
        firebaseId: appointmentId,  // NEW: Store Firebase document ID
        title: newEventTitle,
        startTime: newEventStartTime,
        endTime: newEventEndTime,
        color: getEventColor(Math.max(...events.map(e => e.id)) + 1),
        day: adjustedDay,
        description: newEventDescription || `Programare pentru ${newEventTitle}`,
        location: "Cabinet principal",
        attendees: [],
        organizer: "Medicul curant",
        patientCNP: newEventCNP || undefined,
        patientEmail: newEventEmail || undefined,
        patientPhone: formattedPhone,
        patientBirthDate: birthDate || undefined,
      }

      // Update local state (PRESERVED)
      setEvents(prevEvents => [...prevEvents, newEvent])
      
      // Close modal and reset form (PRESERVED)
      setShowCreateEvent(false)
      setNewEventTitle('')
      setNewEventDate('')
      setNewEventStartTime('09:00')
      setNewEventDuration('30') // Reset to default duration
      setNewEventEndTime('09:30') // Reset to match default duration
      setNewEventDescription('')
      // Reset new fields
      setNewEventCNP('')
      setNewEventEmail('')
      setNewEventPhone('')
      setNewEventCountryCode('RO')

      // Show success message (PRESERVED)
      alert('Programarea a fost creată cu succes!')
    } catch (error) {
      console.error('Error creating appointment:', error)
      
      // Enhanced error handling (NEW: Better user feedback)
      let errorMessage = 'Eroare la crearea programării. Vă rugăm să încercați din nou.'
      
      if (error && typeof error === 'object' && 'message' in error) {
        const firebaseError = error as any
        if (firebaseError.code === 'permission-denied') {
          errorMessage = 'Nu aveți permisiunea de a crea programări. Contactați administratorul.'
        } else if (firebaseError.code === 'unavailable') {
          errorMessage = 'Serviciul este temporar indisponibil. Încercați din nou în câteva minute.'
        }
      }
      
      alert(errorMessage)
    } finally {
      // NEW: Reset loading state
      setIsCreatingEvent(false)
    }
  }

  const deleteEvent = async () => {
    if (selectedEvent) {
      // NEW: Set loading state
      setIsDeletingEvent(true)
      
      try {
        // Delete from Firebase (NEW: Full Firebase integration)
        if (selectedEvent.firebaseId) {
          // Delete from Firebase
          await deleteAppointment(selectedEvent.firebaseId)
          console.log('Appointment deleted from Firebase successfully')
        } else {
          console.warn('No Firebase ID found for event, deleting from local state only')
        }
        
        // Update local state (PRESERVED)
        setEvents(prevEvents => prevEvents.filter(event => event.id !== selectedEvent.id))
        setSelectedEvent(null)
        setIsEditingEvent(false)
        
        // Show success message (NEW: Better user feedback)
        console.log('Event deleted successfully')
      } catch (error) {
        console.error('Error deleting event:', error)
        
        // Enhanced error handling (NEW: Better user feedback)
        let errorMessage = 'Eroare la ștergerea programării. Vă rugăm să încercați din nou.'
        
        if (error && typeof error === 'object' && 'message' in error) {
          const firebaseError = error as any
          if (firebaseError.code === 'permission-denied') {
            errorMessage = 'Nu aveți permisiunea de a șterge programări. Contactați administratorul.'
          } else if (firebaseError.code === 'unavailable') {
            errorMessage = 'Serviciul este temporar indisponibil. Încercați din nou în câteva minute.'
          }
        }
        
        alert(errorMessage)
      } finally {
        // NEW: Reset loading state
        setIsDeletingEvent(false)
      }
    }
  }

  const startEditingEvent = () => {
    if (selectedEvent) {
      setEditEventTitle(selectedEvent.title)
      setEditEventStartTime(selectedEvent.startTime)
      setEditEventEndTime(selectedEvent.endTime)
      setEditEventDescription(selectedEvent.description)
      setEditEventLocation(selectedEvent.location)
      
      // Enhanced patient information fields
      setEditEventCNP(selectedEvent.patientCNP || '')
      setEditEventEmail(selectedEvent.patientEmail || '')
      setEditEventPhone(selectedEvent.patientPhone || '')
      setEditEventBirthDate(selectedEvent.patientBirthDate ? selectedEvent.patientBirthDate.toISOString().split('T')[0] : '')
      
      setIsEditingEvent(true)
    }
  }

  const saveEventChanges = async () => {
    if (selectedEvent && editEventTitle && editEventStartTime && editEventEndTime) {
      // Store original event for rollback
      const originalEvent = { ...selectedEvent }
      
      // NEW: Set loading state
      setIsUpdatingEvent(true)
      
      try {
        // Create updated event data (PRESERVED LOGIC)
        const updatedEvent: CalendarEvent = {
          ...selectedEvent,
          title: editEventTitle,
          startTime: editEventStartTime,
          endTime: editEventEndTime,
          description: editEventDescription,
          location: editEventLocation,
          
          // Enhanced patient information fields (PRESERVED)
          patientCNP: editEventCNP || undefined,
          patientEmail: editEventEmail || undefined,
          patientPhone: editEventPhone || undefined,
          patientBirthDate: editEventBirthDate ? new Date(editEventBirthDate) : undefined,
        }

        // Update Firebase (NEW: Full Firebase integration)
        if (selectedEvent.firebaseId) {
          // Prepare appointment data for Firebase update
          const updatedAppointmentData = {
            patientName: editEventTitle,
            patientEmail: editEventEmail || undefined,
            patientPhone: editEventPhone || undefined,
            patientCNP: editEventCNP || undefined,
            patientBirthDate: editEventBirthDate ? new Date(editEventBirthDate) : undefined,
            symptoms: editEventDescription || `Programare pentru ${editEventTitle}`,
            notes: editEventDescription || undefined,
            updatedAt: new Date()
          }
          
          // Update in Firebase
          await updateAppointment(selectedEvent.firebaseId, updatedAppointmentData)
          console.log('Appointment updated in Firebase successfully')
        } else {
          console.warn('No Firebase ID found for event, updating local state only')
        }
        
        // Update local state (PRESERVED)
        setEvents(prevEvents => 
          prevEvents.map(event => 
            event.id === selectedEvent.id ? updatedEvent : event
          )
        )

        setSelectedEvent(updatedEvent)
        setIsEditingEvent(false)
        
        // Show success message (NEW: Better user feedback)
        console.log('Event updated successfully')
      } catch (error) {
        console.error('Error updating event:', error)
        
        // NEW: Rollback to original state on error
        setEvents(prevEvents => 
          prevEvents.map(event => 
            event.id === selectedEvent.id ? originalEvent : event
          )
        )
        setSelectedEvent(originalEvent)
        
        // Enhanced error handling (NEW: Better user feedback)
        let errorMessage = 'Eroare la actualizarea programării. Vă rugăm să încercați din nou.'
        
        if (error && typeof error === 'object' && 'message' in error) {
          const firebaseError = error as any
          if (firebaseError.code === 'permission-denied') {
            errorMessage = 'Nu aveți permisiunea de a actualiza programări. Contactați administratorul.'
          } else if (firebaseError.code === 'unavailable') {
            errorMessage = 'Serviciul este temporar indisponibil. Încercați din nou în câteva minute.'
          }
        }
        
        alert(errorMessage)
      } finally {
        // NEW: Reset loading state
        setIsUpdatingEvent(false)
      }
    }
  }

  const cancelEditing = () => {
    setIsEditingEvent(false)
    setEditEventTitle('')
    setEditEventStartTime('')
    setEditEventEndTime('')
    setEditEventDescription('')
    setEditEventLocation('')
    
    // Reset enhanced patient information fields
    setEditEventCNP('')
    setEditEventEmail('')
    setEditEventPhone('')
    setEditEventBirthDate('')
  }

  // Render functions for different calendar views
  const renderDayView = () => {
    const selectedDate = currentDateObj
    const dayEvents = events.filter(event => {
      const eventDate = new Date()
      eventDate.setDate(event.day)
      return eventDate.toDateString() === selectedDate.toDateString()
    })

    return (
      <div className="bg-[#100B1A]/60 backdrop-blur-lg rounded-xl border border-[#7A48BF]/20 shadow-xl p-6">
        <div className="text-center flex flex-col justify-center items-center min-h-[120px]">
          <h2 className="text-2xl font-bold text-white mb-2">
            {capitalizeMonth(format(selectedDate, 'EEEE, d MMMM yyyy', { locale: ro }))}
          </h2>
          <p className="text-white/70">Programări pentru această zi</p>
        </div>
        
        <div className="space-y-4">
          {dayEvents.length === 0 ? (
            <div className="text-center py-8">
              <CalendarIcon className="h-12 w-12 text-white/30 mx-auto mb-4" />
              <p className="text-white/50">Nu sunt programări pentru această zi</p>
            </div>
          ) : (
            dayEvents.map(event => (
              <div
                key={event.id}
                className={`${event.color} rounded-lg p-4 text-white cursor-pointer transition-transform hover:scale-105`}
                onClick={() => handleEventClick(event)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{event.title}</h3>
                  <span className="text-sm opacity-80">
                    {event.startTime} - {event.endTime}
                  </span>
                </div>
                <p className="text-sm opacity-80 mb-2">{event.description}</p>
                <div className="flex items-center gap-4 text-xs opacity-70">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {event.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {event.attendees.length} participanți
                  </span>
                </div>
                
                {/* Enhanced Patient Information Section */}
                {(event.patientCNP || event.patientEmail || event.patientPhone || event.patientBirthDate) && (
                  <div className="mt-3 pt-3 border-t border-white/20">
                    <h4 className="text-xs font-medium text-white/70 mb-2 flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Informații Pacient:
                    </h4>
                    <div className="space-y-1">
                      {event.patientCNP && (
                        <div className="text-xs text-white/60">CNP: {event.patientCNP}</div>
                      )}
                      {event.patientEmail && (
                        <div className="text-xs text-white/60">Email: {event.patientEmail}</div>
                      )}
                      {event.patientPhone && (
                        <div className="text-xs text-white/60">Telefon: {event.patientPhone}</div>
                      )}
                      {event.patientBirthDate && (
                        <div className="text-xs text-white/60">Data nașterii: {event.patientBirthDate.toLocaleDateString('ro-RO')}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  const renderMonthView = () => {
    const month = currentDateObj.getMonth()
    
    const firstDay = startOfMonth(currentDateObj)
    const lastDay = endOfMonth(currentDateObj)
    const startDate = startOfWeek(firstDay, { weekStartsOn: 1 })
    const endDate = endOfWeek(lastDay, { weekStartsOn: 1 })
    const days = eachDayOfInterval({ start: startDate, end: endDate })
    
    // Filter events for current month
    const monthEvents = events.filter(event => {
      const eventDate = new Date()
      eventDate.setDate(event.day)
      return eventDate.getMonth() === month
    })

    return (
      <div className="bg-[#100B1A]/60 backdrop-blur-lg rounded-xl border border-[#7A48BF]/20 shadow-xl p-6">
        {/* Month Header */}
        <div className="grid grid-cols-7 gap-1 mb-4 flex items-center">
          {weekDays.map(day => (
            <div key={day} className="text-center text-white/70 font-medium py-2 text-sm">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, i) => {
            const isCurrentMonth = date.getMonth() === month
            const isToday = date.toDateString() === new Date().toDateString()
            const dayEvents = monthEvents.filter(event => {
              const eventDate = new Date()
              eventDate.setDate(event.day)
              return eventDate.toDateString() === date.toDateString()
            })
            
            return (
              <motion.div
                key={i}
                className={`p-2 min-h-[80px] rounded-lg border border-[#7A48BF]/20 cursor-pointer transition-colors ${
                  isCurrentMonth ? 'bg-[#100B1A]/40 hover:bg-[#100B1A]/60' : 'bg-[#100B1A]/20'
                } ${isToday ? 'ring-2 ring-[#7A48BF]' : ''}`}
                onClick={() => {
                  setCurrentDateObj(date)
                  setCurrentDateWithCapitalization(date)
                  setCurrentView('day')
                }}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: isCurrentMonth ? "0 4px 15px rgba(122, 72, 191, 0.2)" : "none"
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 17 
                }}
              >
                <div className={`text-sm font-medium mb-2 ${
                  isCurrentMonth ? 'text-white' : 'text-white/50'
                } ${isToday ? 'font-bold' : ''}`}>
                  {date.getDate()}
                </div>
                
                {/* Events */}
                {dayEvents.slice(0, 2).map(event => (
                  <div
                    key={event.id}
                    className={`${event.color} text-white text-xs p-1 rounded mb-1 truncate`}
                    title={event.title}
                  >
                    {event.title}
                  </div>
                ))}
                
                {dayEvents.length > 2 && (
                  <div className="text-white/70 text-xs">
                    +{dayEvents.length - 2} mai multe
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    )
  }

  // Performance-optimized animation configuration
  const animationConfig = useMemo(() => ({
    fast: prefersReducedMotion ? {
      duration: 0.1,
      type: "tween",
      ease: "linear"
    } : {
      duration: 0.2,
      type: "spring",
      stiffness: 400,
      damping: 30
    },
    normal: prefersReducedMotion ? {
      duration: 0.15,
      type: "tween",
      ease: "linear"
    } : {
      duration: 0.3,
      type: "spring",
      stiffness: 300,
      damping: 25
    },
    slow: prefersReducedMotion ? {
      duration: 0.2,
      type: "tween",
      ease: "linear"
    } : {
      duration: 0.4,
      type: "spring",
      stiffness: 200,
      damping: 20
    }
  }), [prefersReducedMotion])

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div 
      ref={mainCalendarRef}
      className="bg-gradient-to-br from-black via-[#100B1A] to-[#1A0B2E] text-white" 
      style={{ height: 'calc(100vh - 83px)' }}
      tabIndex={-1}
      aria-label="Calendar principal MedFlow"
    >
      <ErrorBoundary>
        <main className="flex h-full min-h-full">
          {/* Sidebar */}
          <motion.div
            key="calendar-sidebar"
            className="w-80 bg-[#100B1A]/80 backdrop-blur-lg border-r border-[#7A48BF]/20 p-6 overflow-y-auto"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
              duration: 0.4, 
              delay: 0.1,
              type: "spring",
              stiffness: 200,
              damping: 20
            }}
          >
            {/* Programare Nouă Button - Above mini calendar, aligned with top bar */}
            <motion.button 
              ref={createEventButtonRef}
              onClick={handleCreateEvent}
              disabled={isCreatingEvent}
              className="mb-8 -mt-1 flex items-center justify-center gap-2 rounded-lg bg-[#7A48BF] hover:bg-[#804AC8] px-4 py-2.5 text-white transition-colors duration-200 w-full disabled:opacity-50 disabled:cursor-not-allowed"
              title="Programare Nouă"
              aria-label="Creează o programare nouă"
              aria-describedby="create-appointment-help"
              
              // NEW: Keyboard navigation
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleCreateEvent()
                }
              }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 8px 25px rgba(122, 72, 191, 0.4)"
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 17 
              }}
            >
              {isCreatingEvent ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span className="text-sm font-medium">Se creează...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span className="text-sm font-medium">Programare Nouă</span>
                </>
              )}
            </motion.button>
            
            {/* NEW: Context help for screen readers */}
            <div id="create-appointment-help" className="sr-only">
              Buton pentru crearea unei noi programări medicale
            </div>

            {/* Mini Calendar */}
            <div className="mb-8" role="region" aria-label="Mini calendar pentru navigare rapidă">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium" aria-live="polite">{currentMonth}</h3>
                <div className="flex gap-1" role="group" aria-label="Navigare în luni">
                  <motion.button
                    className="p-1 text-white/70 hover:text-white transition-colors"
                    onClick={goToPreviousMonth}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Luna anterioară"
                    aria-describedby="month-navigation-help"
                    
                    // NEW: Keyboard navigation
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        goToPreviousMonth()
                      }
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </motion.button>
                  <motion.button
                    className="p-1 text-white/70 hover:text-white transition-colors"
                    onClick={goToNextMonth}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Luna următoare"
                    aria-describedby="month-navigation-help"
                    
                    // NEW: Keyboard navigation
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        goToNextMonth()
                      }
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </motion.button>
                </div>
                
                {/* NEW: Context help for month navigation */}
                <div id="month-navigation-help" className="sr-only">
                  Navigare în luni: folosiți săgețile pentru a merge la luna anterioară sau următoare
                </div>
              </div>
              
              {/* Week Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2" role="row" aria-label="Zilele săptămânii">
                {weekDays.map((day, i) => (
                  <div key={i} className="text-center text-white/50 text-xs py-1" role="columnheader">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1" key={`mini-calendar-${currentDateObj.toDateString()}`} role="grid" aria-label="Calendar pentru luna curentă">
                {/* Generate proper calendar days for current month */}
                {(() => {
                  const firstDay = startOfMonth(currentDateObj)
                  const lastDay = endOfMonth(currentDateObj)
                  const startDate = startOfWeek(firstDay, { weekStartsOn: 1 })
                  const endDate = endOfWeek(lastDay, { weekStartsOn: 1 })
                  const days = eachDayOfInterval({ start: startDate, end: endDate })
                  
                  return days.map((date, i) => {
                    const isCurrentMonth = date.getMonth() === currentDateObj.getMonth()
                    const isToday = date.toDateString() === new Date().toDateString()
                    const isSelected = date.toDateString() === currentDateObj.toDateString()
                    
                    return (
                      <motion.div
                        key={`${date.toDateString()}-${i}`}
                        className={`text-xs rounded-full w-7 h-7 flex items-center justify-center ${
                          isSelected ? "bg-[#7A48BF] text-white" : 
                          isToday ? "bg-[#8A7A9F] text-white" :
                          isCurrentMonth ? "text-white hover:bg-white/20" : "text-white/50"
                        } transition-colors cursor-pointer`}
                        whileHover={{ 
                          scale: 1.05
                        }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ 
                          type: "spring", 
                          stiffness: 400, 
                          damping: 17 
                        }}
                        onClick={() => setCurrentDateHandler(date)}
                        role="gridcell"
                        tabIndex={0}
                        aria-label={`${date.getDate()} ${date.toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' })}`}
                        aria-selected={isSelected}
                        aria-current={isToday ? 'date' : undefined}
                        aria-describedby="mini-calendar-help"
                        
                        // NEW: Keyboard navigation
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            setCurrentDateHandler(date)
                          } else if (e.key === 'ArrowLeft' && i > 0) {
                            e.preventDefault()
                            const prevDate = new Date(date)
                            prevDate.setDate(date.getDate() - 1)
                            setCurrentDateHandler(prevDate)
                          } else if (e.key === 'ArrowRight' && i < days.length - 1) {
                            e.preventDefault()
                            const nextDate = new Date(date)
                            nextDate.setDate(date.getDate() + 1)
                            setCurrentDateHandler(nextDate)
                          } else if (e.key === 'ArrowUp' && i >= 7) {
                            e.preventDefault()
                            const upDate = new Date(date)
                            upDate.setDate(date.getDate() - 7)
                            setCurrentDateHandler(upDate)
                          } else if (e.key === 'ArrowDown' && i < days.length - 7) {
                            e.preventDefault()
                            const downDate = new Date(date)
                            downDate.setDate(date.getDate() + 7)
                            setCurrentDateHandler(downDate)
                          }
                        }}
                      >
                        {date.getDate()}
                      </motion.div>
                    )
                  })
                })()}
                
                {/* NEW: Context help for mini calendar */}
                <div id="mini-calendar-help" className="sr-only">
                  Calendar mini: selectați o dată pentru a naviga rapid în calendar
                </div>
              </div>
            </div>

            {/* My Calendars */}
            <div>
              <h3 className="text-white font-medium mb-3">Calendarele mele</h3>
              <div className="space-y-2">
                {myCalendars.map((cal) => (
                  <div key={cal.id} className="group relative">
                    {!cal.isEditing ? (
                      // View Mode
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-sm ${cal.color}`}></div>
                        <span className="text-white text-sm">{cal.name}</span>
                        
                        {/* Edit Icon - Appears on Hover */}
                        <motion.button
                          className="absolute right-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-white/20"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => startEditingCalendar(cal.id)}
                          title="Editează calendar"
                        >
                          <Settings className="w-3 h-3 text-white/70 hover:text-white" />
                        </motion.button>
                      </div>
                    ) : (
                      // Edit Mode
                      <div className="space-y-2">
                        <input
                          type="text"
                          defaultValue={cal.name}
                          data-calendar-id={cal.id}
                          className="w-full px-2 py-1 text-sm bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-[#7A48BF]"
                          placeholder="Nume calendar"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const target = e.target as HTMLInputElement
                              saveCalendarChanges(cal.id, target.value, cal.color)
                            } else if (e.key === 'Escape') {
                              cancelCalendarEditing(cal.id)
                            }
                          }}
                        />
                        
                        {/* Color Selection */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white/70">Culoare:</span>
                          <div className="flex gap-1">
                            {[
                              "bg-[#7A48BF]", // Primary purple
                              "bg-[#804AC8]", // Lighter purple
                              "bg-[#8A7A9F]", // Light purple/gray
                              "bg-[#6B46C1]", // Darker purple
                              "bg-[#A855F7]", // Bright purple
                              "bg-[#C084FC]", // Light purple
                            ].map((color) => (
                              <button
                                key={color}
                                onClick={() => updateCalendarColor(cal.id, color)}
                                className={`w-4 h-4 rounded-full border-2 transition-all ${
                                  cal.color === color 
                                    ? "border-white ring-2 ring-[#7A48BF] ring-offset-1 ring-offset-[#100B1A] scale-110 shadow-lg" 
                                    : "border-white/30 hover:border-white/60 hover:scale-105"
                                } ${color}`}
                                title={`Selectează ${color}`}
                              />
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const input = document.querySelector(`input[data-calendar-id="${cal.id}"]`) as HTMLInputElement
                              if (input) {
                                saveCalendarChanges(cal.id, input.value, cal.color)
                              }
                            }}
                            className="px-2 py-1 text-xs bg-[#7A48BF] text-white rounded hover:bg-[#804AC8] transition-colors"
                          >
                            Salvează
                          </button>
                          <button
                            onClick={() => cancelCalendarEditing(cal.id)}
                            className="px-2 py-1 text-xs bg-white/10 text-white rounded hover:bg-white/20 transition-colors"
                          >
                            Anulează
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Calendar View */}
          <motion.div
            key="calendar-main-view"
            className="flex-1 flex flex-col h-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.4, 
              delay: 0.3,
              type: "spring",
              stiffness: 200,
              damping: 20
            }}
          >
            {/* Calendar Controls */}
            <motion.div 
              className="flex items-center justify-between p-4 border-b border-[#7A48BF]/20"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.25, 
                delay: 0.5,
                type: "spring",
                stiffness: 250,
                damping: 25
              }}
            >
              <div className="flex items-center gap-4">
                <motion.button
                  onClick={goToToday}
                  className="bg-[#7A48BF] hover:bg-[#804AC8] text-white px-4 py-2 rounded-lg transition-colors duration-200"
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: "0 8px 25px rgba(122, 72, 191, 0.4)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 17 
                  }}
                  aria-label="Mergi la data de astăzi"
                  aria-describedby="today-button-help"
                  
                  // NEW: Keyboard navigation
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      goToToday()
                    }
                  }}
                >
                  Astăzi
                </motion.button>
                
                {/* NEW: Context help for today button */}
                <div id="today-button-help" className="sr-only">
                  Buton pentru a reveni la data curentă
                </div>
                
                <div className="flex" role="group" aria-label="Navigare în calendar">
                  <IconButton
                    icon={<ChevronLeft className="h-5 w-5" />}
                    variant="ghost"
                    size="md"
                    className="text-white hover:bg-white/10 rounded-l-md"
                    onClick={goToPrevious}
                    aria-label="Anterior"
                    aria-describedby="navigation-help"
                    
                    // NEW: Keyboard navigation
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        goToPrevious()
                      }
                    }}
                  />
                  <IconButton
                    icon={<ChevronRight className="h-5 w-5" />}
                    variant="ghost"
                    size="md"
                    className="text-white hover:bg-white/10 rounded-r-md"
                    onClick={goToNext}
                    aria-label="Următor"
                    aria-describedby="navigation-help"
                    
                    // NEW: Keyboard navigation
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        goToNext()
                      }
                    }}
                  />
                </div>
                
                {/* NEW: Context help for navigation */}
                <div id="navigation-help" className="sr-only">
                  Navigare în calendar: folosiți butoanele pentru a merge la data anterioară sau următoare
                </div>
                
                <h2 className="text-xl font-semibold text-white" aria-live="polite">{currentDate}</h2>
              </div>

              <div className="flex items-center gap-2 rounded-md p-1 bg-[#100B1A]/50" role="group" aria-label="Selectare vizualizare calendar">
                <motion.button
                  onClick={() => setCurrentView("day")}
                  className={`px-3 py-1 rounded transition-colors ${currentView === "day" ? "bg-[#7A48BF] text-white" : "text-white hover:bg-white/10"}`}
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: "0 4px 15px rgba(122, 72, 191, 0.3)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 17 
                  }}
                  aria-label="Vizualizare zi"
                  aria-pressed={currentView === "day"}
                  aria-describedby="view-toggle-help"
                  
                  // NEW: Keyboard navigation
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setCurrentView("day")
                    }
                  }}
                >
                  Zi
                </motion.button>
                <motion.button
                  onClick={() => setCurrentView("week")}
                  className={`px-3 py-1 rounded transition-colors ${currentView === "week" ? "bg-[#7A48BF] text-white" : "text-white hover:bg-white/10"}`}
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: "0 4px 15px rgba(122, 72, 191, 0.3)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 17 
                  }}
                  aria-label="Vizualizare săptămână"
                  aria-pressed={currentView === "week"}
                  aria-describedby="view-toggle-help"
                  
                  // NEW: Keyboard navigation
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setCurrentView("week")
                    }
                  }}
                >
                  Săptămână
                </motion.button>
                <motion.button
                  onClick={() => setCurrentView("month")}
                  className={`px-3 py-1 rounded transition-colors ${currentView === "month" ? "bg-[#7A48BF] text-white" : "text-white hover:bg-white/10"}`}
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: "0 4px 15px rgba(122, 72, 191, 0.3)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 17 
                  }}
                  aria-label="Vizualizare lună"
                  aria-pressed={currentView === "month"}
                  aria-describedby="view-toggle-help"
                  
                  // NEW: Keyboard navigation
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setCurrentView("month")
                    }
                  }}
                >
                  Lună
                </motion.button>
                
                {/* NEW: Context help for view toggle */}
                <div id="view-toggle-help" className="sr-only">
                  Selectați tipul de vizualizare calendar: zi, săptămână sau lună
                </div>
              </div>
            </motion.div>

            {/* Calendar Views */}
            <div 
              className="flex-1 overflow-auto p-4" 
              style={{ 
                maxHeight: 'calc(100vh - 200px)',
                scrollbarWidth: 'thin',
                scrollbarColor: '#7A48BF #100B1A'
              }}
            >
              {currentView === 'day' && renderDayView()}
              {currentView === 'month' && renderMonthView()}
              {currentView === 'week' && (
                <div className="bg-[#100B1A]/60 backdrop-blur-lg rounded-xl border border-[#7A48BF]/20 shadow-xl min-h-full flex flex-col">
                  {/* Week Header */}
                  <div className="grid grid-cols-8 border-b border-[#7A48BF]/20">
                    <div className="p-2 text-center text-white/50 text-xs"></div>
                    {weekDays.map((day, i) => (
                      <motion.div 
                        key={i} 
                        className="p-2 text-center border-l border-[#7A48BF]/20"
                        transition={{ 
                          type: "spring", 
                          stiffness: 400, 
                          damping: 17 
                        }}
                      >
                        <div className="text-xs text-white/70 font-medium">{day}</div>
                        <motion.div
                          className={`text-lg font-medium mt-1 text-white ${getWeekDates()[i] === new Date().getDate() ? "bg-[#7A48BF] rounded-full w-8 h-8 flex items-center justify-center mx-auto" : ""}`}
                          whileHover={{ 
                            scale: getWeekDates()[i] === new Date().getDate() ? 1 : 1.05
                          }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ 
                            type: "spring", 
                            stiffness: 400, 
                            damping: 17 
                          }}
                        >
                          {getWeekDates()[i]}
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* NEW: Drag & Drop Instructions */}
                  <div className="p-2 bg-[#7A48BF]/10 border-b border-[#7A48BF]/20">
                    <div className="text-xs text-white/70 text-center">
                      💡 Drag & Drop: Mutați programările pentru a le reprograma
                    </div>
                  </div>

                  {/* Time Grid - Now properly contained within the purple container */}
                  <div className="grid grid-cols-8">
                    {/* Time Labels */}
                    <div className="text-white/70">
                      {timeSlots.map((time, i) => (
                        <motion.div 
                          key={i} 
                          className="h-20 border-b border-[#7A48BF]/10 pr-2 text-right text-xs"
                          whileHover={{ 
                            opacity: 1,
                            scale: 1.02
                          }}
                          transition={{ 
                            type: "spring", 
                            stiffness: 400, 
                            damping: 17 
                          }}
                        >
                          {time.toString().padStart(2, '0')}:00
                        </motion.div>
                      ))}
                    </div>

                    {/* Days Columns */}
                    {Array.from({ length: 7 }).map((_, dayIndex) => (
                      <div key={dayIndex} className="border-l border-[#7A48BF]/20 relative">
                        {timeSlots.map((_, timeIndex) => (
                          <div key={timeIndex} className="relative">
                            {/* Main hour line */}
                            <div className="h-20 border-b border-[#7A48BF]/10"></div>
                            {/* NEW: Sub-grid line for 30-minute intervals */}
                            <div className="absolute top-10 left-0 right-0 border-b border-[#7A48BF]/5 border-dashed"></div>
                          </div>
                        ))}

                                                {/* Events */}
                        {events
                          .filter((event) => event.day === dayIndex + 1)
                          .map((event, i) => {
                            const eventStyle = calculateEventStyle(event.startTime, event.endTime)
                            return (
                              <div
                                key={event.id}
                                className="absolute"
                                style={{
                                  ...eventStyle,
                                  left: "4px",
                                  right: "4px",
                                }}
                              >
                                <FadeContent
                                  duration={600}
                                  delay={100}
                                  threshold={0.3}
                                >
                                <motion.div
                                  className={`w-full h-full ${getEnhancedEventCardClasses(event)}`}
                                  drag
                                  dragMomentum={false}
                                  dragElastic={0.1}
                                  dragConstraints={{
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0
                                  }}
                                  onDragEnd={async (_, info) => {
                                    try {
                                      // Calculate new time based on drag position using helper function
                                      const newTimeData = calculateNewTimeFromDrag(info.point.y, dayIndex)
                                      
                                      if (!newTimeData) {
                                        console.log('Drag outside valid time range, reverting position')
                                        return
                                      }
                                      
                                      const { newStartTime, newEndTime, newDay } = newTimeData
                                      
                                      // Update Firebase (NEW: Full Firebase integration)
                                      if (event.firebaseId) {
                                        // Prepare appointment data for Firebase update
                                        const updatedAppointmentData = {
                                          dateTime: newTimeData.newDate,
                                          updatedAt: new Date()
                                        }
                                        
                                        // Update Firebase
                                        await updateAppointment(event.firebaseId, updatedAppointmentData)
                                        console.log('Appointment rescheduled in Firebase successfully')
                                      } else {
                                        console.warn('No Firebase ID found for event, updating local state only')
                                      }
                                      
                                      // Update local state using batch update for performance
                                      batchUpdateEvents([{
                                        id: event.id,
                                        updates: {
                                          startTime: newStartTime,
                                          endTime: newEndTime,
                                          day: newDay
                                        }
                                      }])
                                      
                                      // Show success feedback
                                      console.log('Appointment rescheduled successfully via drag & drop')
                                    } catch (error) {
                                      console.error('Failed to reschedule appointment via drag & drop:', error)
                                      // The motion.div will automatically animate back to original position
                                    }
                                  }}
                                  whileHover={{
                                    scale: 1.02,
                                    y: -4,
                                    boxShadow: "0 16px 32px rgba(122, 72, 191, 0.25)",
                                    transition: { duration: 0.15, ease: "easeOut" }
                                  }}
                                  whileTap={{ scale: 0.98 }}
                                  layout
                                  layoutId={`event-${event.id}`}
                                  onClick={() => handleEventClick(event)}
                                  aria-label={`Programare ${event.title}, poate fi mutată prin drag & drop`}
                                  title={`${event.title} - Click pentru detalii, drag pentru a muta`}
                                  whileDrag={{
                                    scale: 1.05,
                                    boxShadow: "0 20px 40px rgba(122, 72, 191, 0.4)",
                                    zIndex: 1000
                                  }}
                                >
                                  {/* Event content with responsive text layout */}
                                  {(() => {
                                    const textClasses = getResponsiveTextClasses(event)
                                    const nameData = parsePatientName(event.title)
                                    
                                    return (
                                      <>
                                        {/* Two-column responsive text layout */}
                                        <div className={textClasses.container}>
                                          {/* Left side: Patient names */}
                                          <div className={textClasses.nameContainer}>
                                            <div className={textClasses.textClass} title={event.title}>
                                              {nameData.firstName}
                                            </div>
                                            {!nameData.isSingleName && nameData.lastName && (
                                              <div className={textClasses.textClass} title={event.title}>
                                                {nameData.lastName}
                                              </div>
                                            )}
                                          </div>
                                          
                                          {/* Right side: Time */}
                                          <div className={textClasses.timeClass}>
                                            {`${formatTimeForDisplay(event.startTime)}-${formatTimeForDisplay(event.endTime)}`}
                                          </div>
                                        </div>
                                        
                                        {/* Visual indicator for drag & drop */}
                                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <div className="w-2 h-2 bg-white/30 rounded-full"></div>
                                        </div>
                                      </>
                                    )
                                  })()}
                                                                 </motion.div>
                               </FadeContent>
                               </div>
                             )
                           })}

                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Floating Action Button */}
            {/* This button is now moved above the mini-calendar */}
          </motion.div>
        </main>

        {/* Event Detail Modal */}
        {selectedEvent && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => {
              if (!isEditingEvent) {
                setSelectedEvent(null)
              }
            }}
          >
            <div 
              className={`${getModalColor(selectedEvent.color)} p-6 rounded-lg shadow-xl max-w-md w-full mx-4`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header with Title and Professional X Button */}
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-2xl font-bold text-white">{selectedEvent.title}</h3>
                <motion.button
                  onClick={() => setSelectedEvent(null)}
                  className="text-white/70 hover:text-white transition-colors p-2 -mr-2"
                  whileHover={{ 
                    scale: 1.02,
                    opacity: 1
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 200, 
                    damping: 25 
                  }}
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>
              
              {!isEditingEvent ? (
                // View Mode
                <div className="space-y-3 text-white">
                  <p className="flex items-center">
                    <Clock className="mr-2 h-5 w-5" />
                    {`${selectedEvent.startTime} - ${selectedEvent.endTime}`}
                  </p>
                  <p className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5" />
                    {selectedEvent.location}
                  </p>
                  <p className="flex items-center">
                    <CalendarIcon className="mr-2 h-5 w-5" />
                    {format(currentDateObj, 'EEEE, d MMMM yyyy', { locale: ro })}
                  </p>
                  <p className="flex items-start">
                    <Users className="mr-2 h-5 w-5 mt-1" />
                    <span>
                      <strong>Participanți:</strong>
                      <br />
                      {selectedEvent.attendees.join(", ") || "Fără participanți"}
                    </span>
                  </p>
                  <p>
                    <strong>Organizator:</strong> {selectedEvent.organizer}
                  </p>
                  <p>
                    <strong>Descriere:</strong> {selectedEvent.description}
                  </p>
                  
                  {/* Enhanced Patient Information Section */}
                  {(selectedEvent.patientCNP || selectedEvent.patientEmail || selectedEvent.patientPhone || selectedEvent.patientBirthDate) && (
                    <div className="pt-3 border-t border-white/20">
                      <h4 className="text-sm font-medium text-white/80 mb-2 flex items-center gap-1">
                        <User className="h-4 w-4" />
                        Informații Pacient:
                      </h4>
                      <div className="space-y-1 text-sm">
                        {selectedEvent.patientCNP && (
                          <div className="text-white/70"><strong>CNP:</strong> {selectedEvent.patientCNP}</div>
                        )}
                        {selectedEvent.patientEmail && (
                          <div className="text-white/70"><strong>Email:</strong> {selectedEvent.patientEmail}</div>
                        )}
                        {selectedEvent.patientPhone && (
                          <div className="text-white/70"><strong>Telefon:</strong> {selectedEvent.patientPhone}</div>
                        )}
                        {selectedEvent.patientBirthDate && (
                          <div className="text-white/70"><strong>Data nașterii:</strong> {selectedEvent.patientBirthDate.toLocaleDateString('ro-RO')}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Edit Mode
                <div className="space-y-4 text-white">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Nume pacient</label>
                    <input
                      type="text"
                      value={editEventTitle}
                      onChange={(e) => setEditEventTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                      placeholder="Introduceți numele pacientului"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Ora Început</label>
                      <select
                        value={editEventStartTime}
                        onChange={(e) => setEditEventStartTime(e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                      >
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
                        value={editEventEndTime}
                        onChange={(e) => setEditEventEndTime(e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                      >
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
                    <label className="block text-white text-sm font-medium mb-2">Locație</label>
                    <input
                      type="text"
                      value={editEventLocation}
                      onChange={(e) => setEditEventLocation(e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                      placeholder="Introduceți locația"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Descriere</label>
                    <textarea
                      value={editEventDescription}
                      onChange={(e) => setEditEventDescription(e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                      rows={3}
                      placeholder="Introduceți descrierea programării"
                    />
                  </div>
                  
                  {/* Enhanced Patient Information Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">CNP Pacient</label>
                      <input
                        type="text"
                        value={editEventCNP || ''}
                        onChange={(e) => setEditEventCNP(e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                        placeholder="1234567890123"
                        maxLength={13}
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Email Pacient</label>
                      <input
                        type="email"
                        value={editEventEmail || ''}
                        onChange={(e) => setEditEventEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                        placeholder="exemplu@email.com"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Telefon Pacient</label>
                      <input
                        type="tel"
                        value={editEventPhone || ''}
                        onChange={(e) => setEditEventPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                        placeholder="7XX XXX XXX"
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Data Nașterii</label>
                      <input
                        type="date"
                        value={editEventBirthDate || ''}
                        onChange={(e) => setEditEventBirthDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex justify-between">
                {/* Delete Button - Left side with red styling */}
                <motion.button
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-200"
                  onClick={deleteEvent}
                  title="Șterge programarea"
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: "0 6px 20px rgba(239, 68, 68, 0.4)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 17 
                  }}
                >
                  Șterge
                </motion.button>
                
                {/* Action Buttons - Right side */}
                <div className="flex gap-3">
                  {!isEditingEvent ? (
                    // View Mode - Show Edit button
                    <motion.button
                      className="bg-white text-gray-800 px-4 py-2 rounded hover:bg-gray-100 transition-colors"
                      onClick={startEditingEvent}
                      whileHover={{ 
                        scale: 1.02,
                        boxShadow: "0 6px 20px rgba(255, 255, 255, 0.3)"
                      }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 400, 
                        damping: 17 
                      }}
                    >
                      Editează
                    </motion.button>
                  ) : (
                    // Edit Mode - Show Save and Cancel buttons
                    <>
                      <motion.button
                        className="px-4 py-2 text-white/70 hover:text-white transition-colors"
                        onClick={cancelEditing}
                        whileHover={{ 
                          scale: 1.02,
                          textShadow: "0 0 8px rgba(255, 255, 255, 0.5)"
                        }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ 
                          type: "spring", 
                          stiffness: 400, 
                          damping: 17 
                        }}
                      >
                        Anulează
                      </motion.button>
                      <motion.button
                        className="bg-white text-gray-800 px-4 py-2 rounded hover:bg-gray-100 transition-colors"
                        onClick={saveEventChanges}
                        whileHover={{ 
                          scale: 1.02,
                          boxShadow: "0 6px 20px rgba(255, 255, 255, 0.3)"
                        }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ 
                          type: "spring", 
                          stiffness: 400, 
                          damping: 17 
                        }}
                      >
                        Salvează
                      </motion.button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Event Modal */}
        {showCreateEvent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" style={{ paddingTop: '80px' }}>
            <div className="bg-[#100B1A] p-4 sm:p-6 rounded-lg shadow-xl w-full mx-4 border border-[#7A48BF]/20 overflow-hidden" style={{ maxWidth: 'min(90vw, 600px)', maxHeight: 'calc(100vh - 120px)' }}>
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-2xl font-bold text-white">Programare Nouă</h3>
                <motion.button
                  onClick={() => setShowCreateEvent(false)}
                  className="text-white/70 hover:text-white transition-colors p-2 -mr-2"
                  whileHover={{ 
                    scale: 1.02,
                    opacity: 1
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 200, 
                    damping: 25 
                  }}
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>
              
              <div className="space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                {/* Row 1: Nume pacient */}
                <div>
                  <label htmlFor="patient-name-input" className="block text-white text-sm font-medium mb-2">Nume pacient</label>
                  <input
                    id="patient-name-input"
                    type="text"
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-[#100B1A] border border-[#7A48BF]/30 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7A48BF]"
                    placeholder="Ex: Ion Popescu"
                  />
                </div>
                
                {/* Row 2: CNP pacient */}
                <div>
                  <label htmlFor="cnp-input" className="block text-white text-sm font-medium mb-2">CNP pacient</label>
                  <input
                    id="cnp-input"
                    type="text"
                    value={newEventCNP}
                    onChange={(e) => setNewEventCNP(e.target.value)}
                    className="w-full px-3 py-2 bg-[#100B1A] border border-[#7A48BF]/30 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7A48BF]"
                    placeholder="1234567890123"
                    maxLength={13}
                  />
                </div>
                
                {/* Row 3: Data Programării */}
                <div>
                  <label htmlFor="appointment-date-input" className="block text-white text-sm font-medium mb-2">Data Programării</label>
                  <input
                    id="appointment-date-input"
                    type="date"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#100B1A] border border-[#7A48BF]/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#7A48BF]"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              
                {/* Row 4: Ora Început and Durată (side by side) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="start-time-input" className="block text-white text-sm font-medium mb-2">Ora Început</label>
                    <select
                      id="start-time-input"
                      value={newEventStartTime}
                      onChange={(e) => setNewEventStartTime(e.target.value)}
                      className="w-full px-3 py-2 bg-[#100B1A] border border-[#7A48BF]/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#7A48BF] time-select"
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
                    <label htmlFor="duration-input" className="block text-white text-sm font-medium mb-2">Durată</label>
                    <select
                      id="duration-input"
                      value={newEventDuration}
                      onChange={(e) => setNewEventDuration(e.target.value)}
                      className="w-full px-3 py-2 bg-[#100B1A] border border-[#7A48BF]/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#7A48BF] time-select"
                    >
                      <option value="">Selectați durata</option>
                      <option value="15">15 Min</option>
                      <option value="20">20 Min</option>
                      <option value="30">30 Min</option>
                      <option value="45">45 Min</option>
                      <option value="60">1 Ora</option>
                      <option value="90">1 Ora 30 Min</option>
                    </select>
                  </div>
                </div>
                
                {/* Row 5: Email and Phone (side by side) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email-input" className="block text-white text-sm font-medium mb-2">Email pacient (pentru notificări)</label>
                    <input
                      id="email-input"
                      type="email"
                      value={newEventEmail}
                      onChange={(e) => setNewEventEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-[#100B1A] border border-[#7A48BF]/30 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7A48BF]"
                      placeholder="exemplu@email.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone-input" className="block text-white text-sm font-medium mb-2">Telefon pacient (pentru SMS)</label>
                    <div className="flex gap-2">
                      <select
                        value={newEventCountryCode}
                        onChange={(e) => setNewEventCountryCode(e.target.value)}
                        className="px-3 py-2 bg-[#100B1A] border border-[#7A48BF]/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#7A48BF]"
                      >
                        {COUNTRIES.map(country => (
                          <option key={country.code} value={country.code}>
                            {country.flag} {country.dialCode}
                          </option>
                        ))}
                      </select>
                      <input
                        id="phone-input"
                        type="tel"
                        value={newEventPhone}
                        onChange={(e) => setNewEventPhone(e.target.value)}
                        className="flex-1 px-3 py-2 bg-[#100B1A] border border-[#7A48BF]/30 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7A48BF]"
                        placeholder="7XX XXX XXX"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Row 6: Descriere (shorter height) */}
                <div>
                  <label htmlFor="description-input" className="block text-white text-sm font-medium mb-2">Descriere</label>
                  <textarea
                    id="description-input"
                    value={newEventDescription}
                    onChange={(e) => setNewEventDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-[#100B1A] border border-[#7A48BF]/30 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7A48BF]"
                    rows={2}
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
        
        {/* NEW: Comprehensive Accessibility Summary */}
        <div className="sr-only" aria-live="polite">
          <div id="accessibility-summary">
            Calendar medical MedFlow cu funcționalități avansate:
            - Vizualizări: zi, săptămână, lună
            - Navigare prin săgeți și butoane
            - Creare programări noi
            - Drag & drop pentru reprogramare
            - Sincronizare în timp real cu Firebase
            - Mod demo pentru testare
            - Suport complet pentru navigare cu tastatura
            - Etichete ARIA pentru screen readers
          </div>
        </div>
        
        {/* NEW: Keyboard shortcuts help */}
        <div className="sr-only" id="keyboard-help">
          Scurtături tastatură:
          - Tab: navigare între elemente
          - Enter/Space: activare butoane
          - Săgeți: navigare în mini calendar
          - Escape: închidere modale
        </div>
      </ErrorBoundary>
    </div>
  )
}
