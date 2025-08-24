/**
 * 🏥 MedFlow - Scheduling Calendar Component
 * 
 * Enhanced scheduling calendar with MedFlow brand integration
 * and complete Romanian localization support.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
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
  Calendar as CalendarIcon,
  X
} from 'lucide-react'

// Enhanced UI Components Integration
import { LoadingSpinner } from '../../ui/feedback/LoadingSpinner'
import { AnimatedButton, IconButton } from '../../ui/buttons/AnimatedButton'
import { ErrorBoundary } from '../../ui/feedback/ErrorBoundary'

// Types for calendar events
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
    
    return `${day} ${capitalizedMonth}`
  }

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
  
  // Helper function to set current date with proper capitalization
  const setCurrentDateWithCapitalization = useCallback((date: Date) => {
    setCurrentDate(forceCapitalizeMonth(date))
    setCurrentMonth(formatDateWithCapitalization(date, 'MMMM yyyy'))
  }, [])
  
  // Performance optimization: respect user's motion preferences
  const prefersReducedMotion = useReducedMotion()
  
  // Initialize current date and month on component mount
  useEffect(() => {
    const now = new Date()
    setCurrentDateObj(now)
    setCurrentDate(forceCapitalizeMonth(now))
    setCurrentMonth(formatDateWithCapitalization(now, 'MMMM yyyy'))
    setIsLoaded(true)
  }, [])

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
  }, [currentView])

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
  }, [currentView])

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

  // Form state for creating new events
  const [newEventTitle, setNewEventTitle] = useState('')
  const [newEventDate, setNewEventDate] = useState(new Date().toISOString().split('T')[0])
  const [newEventStartTime, setNewEventStartTime] = useState('09:00')
  const [newEventEndTime, setNewEventEndTime] = useState('10:00')
  const [newEventDescription, setNewEventDescription] = useState('')
  
  // Form state for editing existing events
  const [editEventTitle, setEditEventTitle] = useState('')
  const [editEventStartTime, setEditEventStartTime] = useState('')
  const [editEventEndTime, setEditEventEndTime] = useState('')
  const [editEventDescription, setEditEventDescription] = useState('')
  const [editEventLocation, setEditEventLocation] = useState('')

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
  const timeSlots = Array.from({ length: 9 }, (_, i) => i + 8) // 8 AM to 4 PM

  // Generate dynamic week dates for the current week
  const getWeekDates = () => {
    const startDate = startOfWeek(currentDateObj, { weekStartsOn: 1 })
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      return date.getDate()
    })
  }

  // Helper function to calculate event position and height
  const calculateEventStyle = (startTime: string, endTime: string) => {
    const start = Number.parseInt(startTime.split(":")[0]) + Number.parseInt(startTime.split(":")[1]) / 60
    const end = Number.parseInt(endTime.split(":")[0]) + Number.parseInt(endTime.split(":")[1]) / 60
    const top = (start - 8) * 80 // 80px per hour
    const height = (end - start) * 80
    return { top: `${top}px`, height: `${height}px` }
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
    setNewEventStartTime('09:00')
    setNewEventEndTime('10:00')
    setNewEventDescription('')
  }

  const createEvent = () => {
    if (!newEventTitle || !newEventDate || !newEventStartTime || !newEventEndTime) {
      return // Don't create event without required fields
    }

    // Parse the selected date to get day of week
    const selectedDate = new Date(newEventDate)
    const dayOfWeek = selectedDate.getDay() // 0 = Sunday, 1 = Monday, etc.
    const adjustedDay = dayOfWeek === 0 ? 7 : dayOfWeek // Convert to 1-7 (Monday-Sunday)

    const newEvent: CalendarEvent = {
      id: Math.max(...events.map(e => e.id)) + 1, // Generate unique ID
      title: newEventTitle,
      startTime: newEventStartTime,
      endTime: newEventEndTime,
      color: getEventColor(Math.max(...events.map(e => e.id)) + 1), // Use enhanced color system
      day: adjustedDay, // Use the selected date's day of week
      description: newEventDescription || `Programare pentru ${newEventTitle}`,
      location: "Cabinet principal",
      attendees: [],
      organizer: "Medicul curant",
    }

    setEvents(prevEvents => [...prevEvents, newEvent])
    
    // Close modal and reset form
    setShowCreateEvent(false)
    setNewEventTitle('')
    setNewEventDate('')
    setNewEventStartTime('09:00')
    setNewEventEndTime('10:00')
    setNewEventDescription('')
  }

  const deleteEvent = () => {
    if (selectedEvent) {
      setEvents(prevEvents => prevEvents.filter(event => event.id !== selectedEvent.id))
      setSelectedEvent(null)
      setIsEditingEvent(false)
    }
  }

  const startEditingEvent = () => {
    if (selectedEvent) {
      setEditEventTitle(selectedEvent.title)
      setEditEventStartTime(selectedEvent.startTime)
      setEditEventEndTime(selectedEvent.endTime)
      setEditEventDescription(selectedEvent.description)
      setEditEventLocation(selectedEvent.location)
      setIsEditingEvent(true)
    }
  }

  const saveEventChanges = () => {
    if (selectedEvent && editEventTitle && editEventStartTime && editEventEndTime) {
      const updatedEvent: CalendarEvent = {
        ...selectedEvent,
        title: editEventTitle,
        startTime: editEventStartTime,
        endTime: editEventEndTime,
        description: editEventDescription,
        location: editEventLocation,
      }

      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === selectedEvent.id ? updatedEvent : event
        )
      )

      setSelectedEvent(updatedEvent)
      setIsEditingEvent(false)
    }
  }

  const cancelEditing = () => {
    setIsEditingEvent(false)
    setEditEventTitle('')
    setEditEventStartTime('')
    setEditEventEndTime('')
    setEditEventDescription('')
    setEditEventLocation('')
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
        <div className="text-center mb-6">
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
        <div className="grid grid-cols-7 gap-1 mb-4">
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
              <div
                key={i}
                className={`p-2 min-h-[80px] rounded-lg border border-[#7A48BF]/20 ${
                  isCurrentMonth ? 'bg-[#100B1A]/40' : 'bg-[#100B1A]/20'
                } ${isToday ? 'ring-2 ring-[#7A48BF]' : ''}`}
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
              </div>
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
    <div className="min-h-screen bg-gradient-to-br from-black via-[#100B1A] to-[#1A0B2E] text-white">
      <ErrorBoundary>
        <main className="flex h-screen">
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
                {["D", "L", "M", "M", "J", "V", "S"].map((day, i) => (
                  <div key={i} className="text-center text-white/50 text-xs py-1">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
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
                        key={i}
                        className={`text-xs rounded-full w-7 h-7 flex items-center justify-center ${
                          isSelected ? "bg-[#7A48BF] text-white" : 
                          isToday ? "bg-[#804AC8] text-white" :
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
                      >
                        {date.getDate()}
                      </motion.div>
                    )
                  })
                })()}
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
            className="flex-1 flex flex-col"
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
                <AnimatedButton
                  variant="primary"
                  size="md"
                  className="bg-[#7A48BF] hover:bg-[#804AC8] text-white"
                  onClick={() => setCurrentDateWithCapitalization(new Date())}
                >
                  Astăzi
                </AnimatedButton>
                <div className="flex">
                  <IconButton
                    icon={<ChevronLeft className="h-5 w-5" />}
                    variant="ghost"
                    size="md"
                    className="text-white hover:bg-white/10 rounded-l-md"
                    onClick={goToPrevious}
                    aria-label="Anterior"
                  />
                  <IconButton
                    icon={<ChevronRight className="h-5 w-5" />}
                    variant="ghost"
                    size="md"
                    className="text-white hover:bg-white/10 rounded-r-md"
                    onClick={goToNext}
                    aria-label="Următor"
                  />
                </div>
                <h2 className="text-xl font-semibold text-white">{currentDate}</h2>
              </div>

              <div className="flex items-center gap-2 rounded-md p-1 bg-[#100B1A]/50">
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
                >
                  Lună
                </motion.button>
              </div>
            </motion.div>

            {/* Calendar Views */}
            <div className="flex-1 overflow-auto p-4">
              {currentView === 'day' && renderDayView()}
              {currentView === 'month' && renderMonthView()}
              {currentView === 'week' && (
                <div className="bg-[#100B1A]/60 backdrop-blur-lg rounded-xl border border-[#7A48BF]/20 shadow-xl min-h-full flex flex-col">
                  {/* Week Header */}
                  <div className="grid grid-cols-8 border-b border-[#7A48BF]/20 flex-shrink-0">
                    <div className="p-2 text-center text-white/50 text-xs"></div>
                    {weekDays.map((day, i) => (
                      <motion.div 
                        key={i} 
                        className="p-2 text-center border-l border-[#7A48BF]/20"
                        whileHover={{ 
                          backgroundColor: "rgba(122, 72, 191, 0.1)"
                        }}
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
                            scale: getWeekDates()[i] === new Date().getDate() ? 1 : 1.05,
                            backgroundColor: getWeekDates()[i] === new Date().getDate() ? "rgba(122, 72, 191, 1)" : "rgba(255, 255, 255, 0.2)"
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

                  {/* Time Grid - Now properly contained within the purple container */}
                  <div className="grid grid-cols-8 flex-1">
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
                          <div key={timeIndex} className="h-20 border-b border-[#7A48BF]/10"></div>
                        ))}

                        {/* Events */}
                        {events
                          .filter((event) => event.day === dayIndex + 1)
                          .map((event, i) => {
                            const eventStyle = calculateEventStyle(event.startTime, event.endTime)
                            return (
                              <motion.div
                                key={event.id}
                                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                                transition={{ 
                                  duration: 0.3, 
                                  ease: "easeOut",
                                  delay: dayIndex * 0.08 + i * 0.03, // Optimized staggered timing
                                  type: "spring",
                                  stiffness: 300,
                                  damping: 25
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
                                className={`absolute ${event.color} rounded-md p-2 text-white text-xs shadow-md cursor-pointer`}
                                style={{
                                  ...eventStyle,
                                  left: "4px",
                                  right: "4px",
                                }}
                                onClick={() => handleEventClick(event)}
                              >
                                <div className="font-medium">{event.title}</div>
                                <div className="opacity-80 text-[10px] mt-1">{`${event.startTime} - ${event.endTime}`}</div>
                              </motion.div>
                            )
                          })}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Floating Action Button */}
            <motion.button 
              onClick={handleCreateEvent}
              className="mt-6 flex items-center justify-center gap-2 rounded-full bg-[#7A48BF] hover:bg-[#804AC8] p-4 text-white w-14 h-14 self-start transition-colors duration-200"
              title="Programare Nouă"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 12px 30px rgba(122, 72, 191, 0.5)"
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 17 
              }}
            >
              <Plus className="h-6 w-6" />
            </motion.button>
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
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#100B1A] p-6 rounded-lg shadow-xl max-w-md w-full mx-4 border border-[#7A48BF]/20">
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
                    <label className="block text-white text-sm font-medium mb-2">Ora Sfârșit</label>
                    <select
                      value={newEventEndTime}
                      onChange={(e) => setNewEventEndTime(e.target.value)}
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
      </ErrorBoundary>
    </div>
  )
}
