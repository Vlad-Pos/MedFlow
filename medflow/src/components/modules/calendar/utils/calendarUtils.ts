/**
 * Calendar Utility Functions
 *
 * Enhanced utility functions for the calendar system
 * Integration with MedFlow UI library patterns
 */

import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday } from 'date-fns'
import { ro } from 'date-fns/locale'

// Calendar Constants
export const CALENDAR_CONSTANTS = {
  WEEK_DAYS: ['D', 'L', 'Ma', 'Mi', 'J', 'V', 'S'],
  MONTHS: [
    'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
    'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'
  ],
  TIME_SLOTS: [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ]
}

// MedFlow Brand Colors for Calendar
export const CALENDAR_COLORS = {
  primary: '#7A48BF',
  secondary: '#804AC8',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  background: '#100B1A',
  surface: '#1F1629'
}

/**
 * Format date for calendar display
 */
export const formatCalendarDate = (date: Date, formatString: string = 'dd MMM yyyy'): string => {
  return format(date, formatString, { locale: ro })
}

/**
 * Get week days for calendar header
 */
export const getWeekDays = (): string[] => {
  return CALENDAR_CONSTANTS.WEEK_DAYS
}

/**
 * Get calendar days for a given month
 */
export const getCalendarDays = (date: Date) => {
  const start = startOfWeek(date, { weekStartsOn: 1 })
  const end = endOfWeek(date, { weekStartsOn: 1 })

  return eachDayOfInterval({ start, end })
}

/**
 * Check if date is in current month
 */
export const isCurrentMonth = (date: Date, currentDate: Date): boolean => {
  return date.getMonth() === currentDate.getMonth() &&
         date.getFullYear() === currentDate.getFullYear()
}

/**
 * Get event color based on type or priority
 */
export const getEventColor = (eventType?: string, priority?: 'low' | 'medium' | 'high'): string => {
  if (priority === 'high') return CALENDAR_COLORS.danger
  if (priority === 'medium') return CALENDAR_COLORS.warning
  if (priority === 'low') return CALENDAR_COLORS.success

  switch (eventType) {
    case 'appointment':
      return CALENDAR_COLORS.primary
    case 'meeting':
      return CALENDAR_COLORS.info
    case 'deadline':
      return CALENDAR_COLORS.danger
    case 'reminder':
      return CALENDAR_COLORS.warning
    default:
      return CALENDAR_COLORS.primary
  }
}

/**
 * Format time for display
 */
export const formatTime = (timeString: string): string => {
  const [hours, minutes] = timeString.split(':')
  return `${hours}:${minutes}`
}

/**
 * Check if event is today
 */
export const isEventToday = (eventDate: Date): boolean => {
  return isToday(eventDate)
}

/**
 * Get events for a specific date
 */
export const getEventsForDate = (events: any[], date: Date) => {
  return events.filter(event => isSameDay(new Date(event.date), date))
}

/**
 * Sort events by time
 */
export const sortEventsByTime = (events: any[]): any[] => {
  return events.sort((a, b) => {
    return a.startTime.localeCompare(b.startTime)
  })
}

/**
 * Format event duration
 */
export const formatEventDuration = (startTime: string, endTime: string): string => {
  return `${formatTime(startTime)} - ${formatTime(endTime)}`
}

/**
 * Get event status color
 */
export const getEventStatusColor = (status: string): string => {
  switch (status) {
    case 'confirmed':
      return CALENDAR_COLORS.success
    case 'pending':
      return CALENDAR_COLORS.warning
    case 'cancelled':
      return CALENDAR_COLORS.danger
    case 'completed':
      return CALENDAR_COLORS.info
    default:
      return CALENDAR_COLORS.primary
  }
}

/**
 * Validate calendar event
 */
export const validateCalendarEvent = (event: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (!event.title?.trim()) {
    errors.push('Titlul evenimentului este obligatoriu')
  }

  if (!event.startTime) {
    errors.push('Ora de început este obligatorie')
  }

  if (!event.endTime) {
    errors.push('Ora de sfârșit este obligatorie')
  }

  if (event.startTime && event.endTime && event.startTime >= event.endTime) {
    errors.push('Ora de sfârșit trebuie să fie după ora de început')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Generate calendar event ID
 */
export const generateEventId = (): string => {
  return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Get time slots for calendar
 */
export const getTimeSlots = (): string[] => {
  return CALENDAR_CONSTANTS.TIME_SLOTS
}

/**
 * Check if time slot is available
 */
export const isTimeSlotAvailable = (date: Date, time: string, events: any[]): boolean => {
  const dayEvents = getEventsForDate(events, date)
  return !dayEvents.some(event =>
    event.startTime <= time && event.endTime > time
  )
}

/**
 * Format calendar title
 */
export const formatCalendarTitle = (date: Date): string => {
  return format(date, 'MMMM yyyy', { locale: ro })
}
