/**
 * 🏥 MedFlow - Scheduling Calendar Component
 * 
 * 💡 AI Agent Guidance:
 * This component provides the main interface for the enhanced scheduling calendar
 * while maintaining complete separation from existing calendar functionality.
 * 
 * Before modifying this component, please review:
 * - MedFlow/BRAND_IDENTITY.md (brand guidelines and colors)
 * - MedFlow/DEVELOPMENT_GUIDE.md (technical standards)
 * - MedFlow/FEATURES_DOCUMENTATION.md (feature implementation)
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
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
 * and complete separation from existing calendar systems.
 */
export function SchedulingCalendar() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentView, setCurrentView] = useState<'day' | 'week' | 'month'>('week')
  const [currentMonth, setCurrentMonth] = useState('March 2025')
  const [currentDate, setCurrentDate] = useState('March 5')
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showCreateEvent, setShowCreateEvent] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(false)
  const [isEditingEvent, setIsEditingEvent] = useState(false)
  
  // Performance optimization: respect user's motion preferences
  const prefersReducedMotion = useReducedMotion()
  
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
  
  // Form state for creating new events
  const [newEventTitle, setNewEventTitle] = useState('')
  const [newEventDate, setNewEventDate] = useState('')
  const [newEventStartTime, setNewEventStartTime] = useState('09:00')
  const [newEventEndTime, setNewEventEndTime] = useState('10:00')
  const [newEventDescription, setNewEventDescription] = useState('')
  
  // Form state for editing existing events
  const [editEventTitle, setEditEventTitle] = useState('')
  const [editEventStartTime, setEditEventStartTime] = useState('')
  const [editEventEndTime, setEditEventEndTime] = useState('')
  const [editEventDescription, setEditEventDescription] = useState('')
  const [editEventLocation, setEditEventLocation] = useState('')

  // Custom CSS for select dropdowns and date input - MedFlow brand aesthetic
  const selectStyles = `
    .time-select, input[type="date"] {
      /* Remove all default appearances */
      -webkit-appearance: none !important;
      -moz-appearance: none !important;
      appearance: none !important;
      
      /* Background styling - FIXED: Avoid shorthand conflicts */
      background-color: #100B1A !important;
      background-repeat: no-repeat !important;
      background-position: right 14px center !important;
      background-size: 18px !important;
    }
    
    /* Time select specific styling */
    .time-select {
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23FFFFFF' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/svg%3e") !important;
    }
    
    /* Date input specific styling */
    input[type="date"] {
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23FFFFFF' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3crect x='3' y='4' width='18' height='18' rx='2' ry='2'%3e%3c/rect%3e%3cline x1='16' y1='2' x2='16' y2='6'%3e%3c/line%3e%3cline x1='8' y1='2' x2='8' y2='6'%3e%3c/line%3e%3cline x1='3' y1='10' x2='21' y2='10'%3e%3c/line%3e%3c/svg%3e") !important;
      
      /* Dark theme for date picker */
      color-scheme: dark !important;
      accent-color: #7A48BF !important;
      
      /* WebKit specific date picker styling */
      -webkit-calendar-picker-indicator {
        filter: invert(1) !important;
        opacity: 0 !important;
      }
    }
    
    /* Advanced dark theme styling for WebKit browsers */
    input[type="date"]::-webkit-calendar-picker-indicator {
      background: transparent !important;
      cursor: pointer !important;
      width: 20px !important;
      height: 20px !important;
      position: absolute !important;
      right: 12px !important;
      top: 50% !important;
      transform: translateY(-50%) !important;
    }
    
    /* Force dark mode for date picker dropdown */
    input[type="date"]::-webkit-datetime-edit-fields-wrapper {
      color: #FFFFFF !important;
      background: transparent !important;
    }
    
    input[type="date"]::-webkit-datetime-edit-text,
    input[type="date"]::-webkit-datetime-edit-month-field,
    input[type="date"]::-webkit-datetime-edit-day-field,
    input[type="date"]::-webkit-datetime-edit-year-field {
      color: #FFFFFF !important;
      background: transparent !important;
    }
    
    /* Firefox specific date picker styling */
    @-moz-document url-prefix() {
      input[type="date"] {
        background-color: #100B1A !important;
        color: #FFFFFF !important;
        border: 1px solid rgba(122, 72, 191, 0.3) !important;
        accent-color: #7A48BF !important;
      }
    }
    
    /* Additional browser compatibility for dark theme */
    @media (prefers-color-scheme: dark) {
      input[type="date"] {
        color-scheme: dark !important;
        accent-color: #7A48BF !important;
      }
    }
    
    /* Custom styling for current date in calendar dropdown */
    input[type="date"]::-webkit-calendar-picker-indicator:hover {
      filter: none !important;
    }
    
    /* WebKit calendar dropdown custom colors */
    input[type="date"]::-webkit-inner-spin-button {
      -webkit-appearance: none !important;
      display: none !important;
    }
    
    /* Force brand colors for calendar elements */
    @supports (-webkit-appearance: none) {
      input[type="date"] {
        accent-color: #7A48BF !important;
      }
    }
    
    /* Safari WebKit consistency - all versions */
    @media screen and (-webkit-min-device-pixel-ratio: 0) {
      input[type="date"] {
        -webkit-appearance: none !important;
        appearance: none !important;
      }
      
      /* Safari text field styling - consistent across versions */
      input[type="date"]::-webkit-datetime-edit,
      input[type="date"]::-webkit-datetime-edit-fields-wrapper,
      input[type="date"]::-webkit-datetime-edit-text,
      input[type="date"]::-webkit-datetime-edit-month-field,
      input[type="date"]::-webkit-datetime-edit-day-field,
      input[type="date"]::-webkit-datetime-edit-year-field {
        color: #FFFFFF !important;
        background: transparent !important;
      }
      
      /* Safari calendar picker icon - consistent styling */
      input[type="date"]::-webkit-calendar-picker-indicator {
        background: transparent !important;
        cursor: pointer !important;
        width: 20px !important;
        height: 20px !important;
        margin-left: 4px !important;
      }
    }
    
    /* Safari calendar dropdown - respect system behavior */
    @media screen and (-webkit-min-device-pixel-ratio: 0) {
      input[type="date"] {
        /* Use system's accent color and color scheme */
        color-scheme: dark !important;
      }
      
      /* Let Safari handle calendar dropdown with system settings */
      input[type="date"]::-webkit-calendar-picker-indicator {
        /* Remove any conflicting filters or overrides */
        filter: none !important;
      }
    }
    
    /* Safari consistency - minimal, reliable approach */
    @supports (-webkit-touch-callout: none) {
      input[type="date"] {
        /* Ensure consistent dark theme */
        color-scheme: dark !important;
      }
      
      /* Maintain consistent picker icon behavior */
      input[type="date"]::-webkit-calendar-picker-indicator {
        cursor: pointer !important;
      }
    }
    
    /* Clean WebKit calendar picker styling */
    input[type="date"]::-webkit-calendar-picker-indicator {
      background: transparent !important;
      cursor: pointer !important;
    }
    
    /* CRITICAL: Ensure time select arrows are ALWAYS visible by default */
    select.time-select {
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23FFFFFF' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e") !important;
      background-repeat: no-repeat !important;
      background-position: right 14px center !important;
      background-size: 18px !important;
      background-color: #100B1A !important;
    }
    
    /* CRITICAL: Ensure arrows are visible when dropdown is OPEN/ACTIVE */
    select.time-select:focus,
    select.time-select:active,
    select.time-select[aria-expanded="true"],
    select.time-select:focus-within {
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23FFFFFF' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e") !important;
      background-repeat: no-repeat !important;
      background-position: right 14px center !important;
      background-size: 18px !important;
      background-color: #100B1A !important;
    }
    
    /* CRITICAL: Override any browser default open state styling */
    select.time-select:focus option,
    select.time-select:active option,
    select.time-select:focus-within option {
      background-color: #100B1A !important;
      color: #FFFFFF !important;
    }
    
    /* Override calendar dropdown colors */
    input[type="date"]::-webkit-datetime-edit {
      color: #FFFFFF !important;
    }
    
    /* CRITICAL: Override WebKit select dropdown open state */
    select.time-select::-webkit-select-placeholder {
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23FFFFFF' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e") !important;
      background-repeat: no-repeat !important;
      background-position: right 14px center !important;
      background-size: 18px !important;
    }
    
    /* CRITICAL: Force arrow visibility in all possible states (EXCEPT hover) */
    select.time-select,
    select.time-select:focus,
    select.time-select:active,
    select.time-select:focus-within,
    select.time-select:focus-visible,
    select.time-select:target,
    select.time-select:enabled,
    select.time-select:disabled {
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23FFFFFF' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e") !important;
      background-repeat: no-repeat !important;
      background-position: right 14px center !important;
      background-size: 18px !important;
    }
    
    /* CRITICAL: Purple hover state with higher specificity */
    select.time-select:hover {
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%237A48BF' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e") !important;
      background-repeat: no-repeat !important;
      background-position: right 14px center !important;
      background-size: 18px !important;
    }
    
    /* Force purple for current date in calendar */
    input[type="date"]::-webkit-calendar-picker-indicator:focus {
      background-color: #7A48BF !important;
    }
      
      /* Remove shadows and 3D effects */
      box-shadow: none !important;
      -webkit-box-shadow: none !important;
      text-shadow: none !important;
      
      /* Border and shape */
      border-radius: 6px !important;
      border: 1px solid rgba(122, 72, 191, 0.3) !important;
      
      /* Spacing - ensure arrow doesn't overlap text */
      padding: 8px 45px 8px 12px !important;
      
      /* Text styling */
      color: #FFFFFF !important;
      font-family: inherit !important;
      font-size: 14px !important;
      line-height: 1.4 !important;
      
      /* Prevent background clip issues */
      -webkit-background-clip: padding-box !important;
      background-clip: padding-box !important;
    }
    
    /* Hover state - FIXED: Maintain background-color separately */
    .time-select:hover, input[type="date"]:hover {
      background-color: #100B1A !important;
      box-shadow: none !important;
      -webkit-box-shadow: none !important;
      border-color: rgba(122, 72, 191, 0.6) !important;
    }
    
    .time-select:hover {
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%237A48BF' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e") !important;
      background-repeat: no-repeat !important;
      background-position: right 14px center !important;
      background-size: 18px !important;
    }
    
    input[type="date"]:hover {
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%237A48BF' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3crect x='3' y='4' width='18' height='18' rx='2' ry='2'%3e%3c/rect%3e%3cline x1='16' y1='2' x2='16' y2='6'%3e%3c/line%3e%3cline x1='8' y1='2' x2='8' y2='6'%3e%3c/line%3e%3cline x1='3' y1='10' x2='21' y2='10'%3e%3c/line%3e%3c/svg%3e") !important;
      background-repeat: no-repeat !important;
      background-position: right 14px center !important;
      background-size: 18px !important;
      color-scheme: dark !important;
    }
    
    /* Focus state - FIXED: Maintain arrow visibility */
    .time-select:focus, input[type="date"]:focus {
      outline: none !important;
      background-color: #100B1A !important;
      border-color: #7A48BF !important;
      box-shadow: 0 0 0 2px rgba(122, 72, 191, 0.2) !important;
      -webkit-box-shadow: 0 0 0 2px rgba(122, 72, 191, 0.2) !important;
    }
    
    .time-select:focus {
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23FFFFFF' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/svg%3e") !important;
      background-repeat: no-repeat !important;
      background-position: right 14px center !important;
      background-size: 18px !important;
      background-color: #100B1A !important;
      background-repeat: no-repeat !important;
      background-position: right 14px center !important;
      background-size: 18px !important;
      background-repeat: no-repeat !important;
      background-position: right 14px center !important;
      background-size: 18px !important;
    }
    
    input[type="date"]:focus {
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23FFFFFF' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3crect x='3' y='4' width='18' height='18' rx='2' ry='2'%3e%3c/rect%3e%3cline x1='16' y1='2' x2='16' y2='6'%3e%3c/line%3e%3cline x1='8' y1='2' x2='8' y2='6'%3e%3c/line%3e%3cline x1='3' y1='10' x2='21' y2='10'%3e%3c/line%3e%3c/svg%3e") !important;
      background-repeat: no-repeat !important;
      background-position: right 14px center !important;
      background-size: 18px !important;
      color-scheme: dark !important;
    }
    
    /* Options styling */
    .time-select option {
      background-color: #100B1A !important;
      color: #FFFFFF !important;
      border: none !important;
      padding: 8px 12px !important;
      text-shadow: none !important;
    }
    
    .time-select option:hover {
      background-color: #7A48BF !important;
      color: #FFFFFF !important;
    }
    
    .time-select option:checked {
      background-color: #7A48BF !important;
      color: #FFFFFF !important;
    }
    
    /* Remove IE expand button */
    .time-select::-ms-expand {
      display: none !important;
    }
    
    /* Safari specific fixes - FIXED: Avoid background shorthand */
    @media screen and (-webkit-min-device-pixel-ratio:0) {
      .time-select {
        -webkit-appearance: none !important;
        -webkit-border-radius: 6px !important;
        -webkit-box-shadow: none !important;
      }
    }
  `

  useEffect(() => {
    console.log('SchedulingCalendar: Component mounted, setting loaded state')
    
    // Inject custom CSS for select dropdowns
    const styleElement = document.createElement('style')
    styleElement.textContent = selectStyles
    document.head.appendChild(styleElement)
    
    // Ensure component is always visible after mount
    const timer = setTimeout(() => {
      console.log('SchedulingCalendar: Setting loaded state to true')
      setIsLoaded(true)
    }, 100)
    
    // Fallback: ensure component is visible even if timer fails
    const fallbackTimer = setTimeout(() => {
      console.log('SchedulingCalendar: Fallback timer triggered')
      setIsLoaded(true)
    }, 1000)
    
    // Ensure controls are always visible
    const controlsTimer = setTimeout(() => {
      console.log('SchedulingCalendar: Setting controls visible')
      setControlsVisible(true)
    }, 200)
    
    // Force controls visible after 1 second regardless of animation state
    const forceControlsTimer = setTimeout(() => {
      console.log('SchedulingCalendar: Force setting controls visible')
      setControlsVisible(true)
    }, 1000)
    
    return () => {
      clearTimeout(timer)
      clearTimeout(fallbackTimer)
      clearTimeout(controlsTimer)
      clearTimeout(forceControlsTimer)
      // Clean up injected styles
      if (styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement)
      }
    }
  }, [])

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

  // Sample calendar events with enhanced MedFlow brand colors
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: 1,
      title: "Team Meeting",
      startTime: "09:00",
      endTime: "10:00",
      color: getEventColor(1), // Dynamic color assignment
      day: 1,
      description: "Weekly team sync-up",
      location: "Conference Room A",
      attendees: ["John Doe", "Jane Smith", "Bob Johnson"],
      organizer: "Alice Brown",
    },
    {
      id: 2,
      title: "Lunch with Sarah",
      startTime: "12:30",
      endTime: "13:30",
      color: getEventColor(2), // Dynamic color assignment
      day: 1,
      description: "Discuss project timeline",
      location: "Cafe Nero",
      attendees: ["Sarah Lee"],
      organizer: "You",
    },
    {
      id: 3,
      title: "Project Review",
      startTime: "14:00",
      endTime: "15:30",
      color: getEventColor(3), // Dynamic color assignment
      day: 3,
      description: "Q2 project progress review",
      location: "Meeting Room 3",
      attendees: ["Team Alpha", "Stakeholders"],
      organizer: "Project Manager",
    },
    {
      id: 4,
      title: "Client Call",
      startTime: "10:00",
      endTime: "11:00",
      color: getEventColor(4), // Dynamic color assignment
      day: 2,
      description: "Quarterly review with major client",
      location: "Zoom Meeting",
      attendees: ["Client Team", "Sales Team"],
      organizer: "Account Manager",
    },
    {
      id: 5,
      title: "Team Brainstorm",
      startTime: "13:00",
      endTime: "14:30",
      color: getEventColor(5), // Dynamic color assignment
      day: 4,
      description: "Ideation session for new product features",
      location: "Creative Space",
      attendees: ["Product Team", "Design Team"],
      organizer: "Product Owner",
    },
  ])

  // Calendar configuration
  const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
  const weekDates = [3, 4, 5, 6, 7, 8, 9]
  const timeSlots = Array.from({ length: 9 }, (_, i) => i + 8) // 8 AM to 4 PM

  // Helper function to calculate event position and height
  const calculateEventStyle = (startTime: string, endTime: string) => {
    const start = Number.parseInt(startTime.split(":")[0]) + Number.parseInt(startTime.split(":")[1]) / 60
    const end = Number.parseInt(endTime.split(":")[0]) + Number.parseInt(endTime.split(":")[1]) / 60
    const top = (start - 8) * 80 // 80px per hour
    const height = (end - start) * 80
    return { top: `${top}px`, height: `${height}px` }
  }

  // Sample my calendars with MedFlow colors
  const myCalendars = [
    { name: "My Calendar", color: "bg-[#7A48BF]" },
    { name: "Work", color: "bg-[#804AC8]" },
    { name: "Personal", color: "bg-[#7A48BF]" },
    { name: "Family", color: "bg-[#804AC8]" },
  ]

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
  }

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
      location: "Locație nespecificată",
      attendees: [],
      organizer: "Utilizator curent",
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

  // Safety check: ensure component always renders
  console.log('SchedulingCalendar: Render check - isLoaded:', isLoaded)
  if (!isLoaded) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden">
        <main className="relative h-screen w-full flex">
          <div className="w-64 h-full bg-[#100B1A]/80 backdrop-blur-lg p-4 shadow-xl border-r border-[#7A48BF]/20 rounded-tr-3xl flex flex-col justify-between">
            <div className="text-white text-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7A48BF] mx-auto mb-2"></div>
              <LoadingSpinner
                size="lg"
                variant="dots"
                text="Se încarcă calendarul..."
                className="text-white"
              />
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <LoadingSpinner
              size="xl"
              variant="pulse"
              text="Se pregătește programul..."
              className="text-white"
            />
          </div>
        </main>
      </div>
    )
  }

  console.log('SchedulingCalendar: Rendering main content')
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Main Content */}
      <main className="relative h-screen w-full flex">
        {/* Fallback content in case of rendering issues */}
        <div className="absolute inset-0 bg-[#000000] z-0"></div>
        {/* Sidebar */}
        <motion.div
          key="calendar-sidebar"
          className="w-64 h-full bg-[#100B1A]/80 backdrop-blur-lg p-4 shadow-xl border-r border-[#7A48BF]/20 rounded-tr-3xl flex flex-col justify-between"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ 
            duration: 0.4, 
            delay: 0.15,
            type: "spring",
            stiffness: 200,
            damping: 20
          }}
        >
          <div>
            <motion.button 
              onClick={handleCreateEvent}
              className="mb-6 flex items-center justify-center gap-2 rounded-full bg-[#7A48BF] hover:bg-[#804AC8] px-4 py-3 text-white w-full transition-colors duration-200"
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
              <Plus className="h-5 w-5" />
              <span>Programare Nouă</span>
            </motion.button>

            {/* Mini Calendar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">{currentMonth}</h3>
                <div className="flex gap-1">
                  <motion.button 
                    className="p-1 rounded-full hover:bg-white/20 transition-colors"
                    whileHover={{ 
                      scale: 1.1
                    }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 400, 
                      damping: 17 
                    }}
                  >
                    <ChevronLeft className="h-4 w-4 text-white" />
                  </motion.button>
                  <motion.button 
                    className="p-1 rounded-full hover:bg-white/20 transition-colors"
                    whileHover={{ 
                      scale: 1.1
                    }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 400, 
                      damping: 17 
                    }}
                  >
                    <ChevronRight className="h-4 w-4 text-white" />
                  </motion.button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                  <div key={i} className="text-xs text-white/70 font-medium py-1">
                    {day}
                  </div>
                ))}

                {Array.from({ length: 31 }, (_, i) => i + 1).map((day, i) => (
                  <motion.div
                    key={i}
                    className={`text-xs rounded-full w-7 h-7 flex items-center justify-center ${
                      day === 5 ? "bg-[#7A48BF] text-white" : "text-white hover:bg-white/20"
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
                  >
                    {day}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* My Calendars */}
            <div>
              <h3 className="text-white font-medium mb-3">My calendars</h3>
              <div className="space-y-2">
                {myCalendars.map((cal, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-sm ${cal.color}`}></div>
                    <span className="text-white text-sm">{cal.name}</span>
                  </div>
                ))}
              </div>
            </div>
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
          {/* Calendar Controls - Always Visible with Fallback */}
          <motion.div 
            className="flex items-center justify-between p-4 border-b border-[#7A48BF]/20 relative z-10"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: controlsVisible ? 1 : 0, y: controlsVisible ? 0 : -10 }}
            transition={{ 
              duration: 0.25, 
              delay: 0.5,
              type: "spring",
              stiffness: 250,
              damping: 25
            }}
            key="calendar-controls"
            onAnimationComplete={() => {
              console.log('Calendar controls animation completed')
            }}
            onAnimationStart={() => {
              console.log('Calendar controls animation started')
            }}
            style={{ 
              opacity: controlsVisible ? 1 : 0, // Use state to control visibility
              visibility: 'visible', // Force visibility
              minHeight: '80px', // Ensure minimum height
              display: 'flex' // Force display
            }}
          >
            {/* Fallback controls - always visible */}
            {!controlsVisible && (
              <div className="absolute inset-0 flex items-center justify-between p-4 border-b border-[#7A48BF]/20 bg-[#100B1A] z-20">
                <div className="flex items-center gap-4">
                  <AnimatedButton
                    variant="primary"
                    size="md"
                    className="bg-[#7A48BF] hover:bg-[#804AC8] text-white"
                    onClick={() => setCurrentDate(new Date())}
                  >
                    Today
                  </AnimatedButton>
                  <div className="flex">
                    <IconButton
                      icon={<ChevronLeft className="h-5 w-5" />}
                      variant="ghost"
                      size="md"
                      className="text-white hover:bg-white/10 rounded-l-md"
                      onClick={goToPreviousMonth}
                      aria-label="Luna anterioară"
                    />
                    <IconButton
                      icon={<ChevronRight className="h-5 w-5" />}
                      variant="ghost"
                      size="md"
                      className="text-white hover:bg-white/10 rounded-r-md"
                      onClick={goToNextMonth}
                      aria-label="Luna următoare"
                    />
                  </div>
                  <h2 className="text-xl font-semibold text-white">{currentDate}</h2>
                </div>
                <div className="flex items-center gap-2 rounded-md p-1 bg-[#100B1A]/50">
                  <AnimatedButton
                    variant="primary"
                    size="sm"
                    className="bg-[#7A48BF] text-white"
                    onClick={() => setView('week')}
                  >
                    Week
                  </AnimatedButton>
                </div>
              </div>
            )}
            <div className="flex items-center gap-4">
              <AnimatedButton
                variant="primary"
                size="md"
                className="bg-[#7A48BF] hover:bg-[#804AC8] text-white"
                animationType="bounce"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </AnimatedButton>
              <div className="flex">
                <IconButton
                  icon={<ChevronLeft className="h-5 w-5" />}
                  variant="ghost"
                  size="md"
                  className="text-white hover:bg-white/10 rounded-l-md"
                  animationType="scale"
                  onClick={goToPreviousMonth}
                  aria-label="Luna anterioară"
                />
                <IconButton
                  icon={<ChevronRight className="h-5 w-5" />}
                  variant="ghost"
                  size="md"
                  className="text-white hover:bg-white/10 rounded-r-md"
                  animationType="scale"
                  onClick={goToNextMonth}
                  aria-label="Luna următoare"
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
                Day
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
                Week
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
                Month
              </motion.button>
            </div>
          </motion.div>

          {/* Week View */}
          <div className="flex-1 overflow-auto p-4">
            <div className="bg-[#100B1A]/60 backdrop-blur-lg rounded-xl border border-[#7A48BF]/20 shadow-xl h-full">
              {/* Week Header */}
              <div className="grid grid-cols-8 border-b border-[#7A48BF]/20">
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
                      className={`text-lg font-medium mt-1 text-white ${weekDates[i] === 5 ? "bg-[#7A48BF] rounded-full w-8 h-8 flex items-center justify-center mx-auto" : ""}`}
                      whileHover={{ 
                        scale: weekDates[i] === 5 ? 1 : 1.05,
                        backgroundColor: weekDates[i] === 5 ? "rgba(122, 72, 191, 1)" : "rgba(255, 255, 255, 0.2)"
                      }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 400, 
                        damping: 17 
                      }}
                    >
                      {weekDates[i]}
                    </motion.div>
                  </motion.div>
                ))}
              </div>

              {/* Time Grid */}
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
          </div>
        </motion.div>

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
                    {`${weekDays[selectedEvent.day - 1]}, ${weekDates[selectedEvent.day - 1]} ${currentMonth}`}
                  </p>
                  <p className="flex items-start">
                    <Users className="mr-2 h-5 w-5 mt-1" />
                    <span>
                      <strong>Attendees:</strong>
                      <br />
                      {selectedEvent.attendees.join(", ") || "No attendees"}
                    </span>
                  </p>
                  <p>
                    <strong>Organizer:</strong> {selectedEvent.organizer}
                  </p>
                  <p>
                    <strong>Description:</strong> {selectedEvent.description}
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
      </main>
    </div>
  )
}
