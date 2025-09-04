/**
 * Date utility functions for the MedFlow application
 */

/**
 * Formats a date for display
 */
export const formatDateForDisplay = (date: Date): string => {
  return date.toLocaleDateString('ro-RO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Formats a date for display (alias for formatDateForDisplay)
 */
export const formatDate = (date: Date): string => {
  return formatDateForDisplay(date)
}

/**
 * Formats a date and time for display
 */
export const formatDateTime = (date: Date): string => {
  return date.toLocaleString('ro-RO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Formats time for display
 */
export const formatTime = (date: Date | undefined | null): string => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return '--:--'
  }
  
  try {
    return date.toLocaleTimeString('ro-RO', {
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.warn('Error formatting time:', error, date)
    return '--:--'
  }
}

/**
 * Formats duration in minutes to human readable format
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (remainingMinutes === 0) {
    return `${hours}h`
  }
  return `${hours}h ${remainingMinutes}min`
}

/**
 * Gets the dates for a week starting from a given date
 */
export const getWeekDates = (date: Date): Date[] => {
  const week = []
  const start = new Date(date)
  start.setDate(start.getDate() - start.getDay())
  
  for (let i = 0; i < 7; i++) {
    week.push(new Date(start))
    start.setDate(start.getDate() + 1)
  }
  
  return week
}

/**
 * Checks if a date is today
 */
export const isToday = (date: Date): boolean => {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

/**
 * Checks if two dates are the same day
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.toDateString() === date2.toDateString()
}

/**
 * Gets the start of the week for a given date
 */
export const getStartOfWeek = (date: Date): Date => {
  const start = new Date(date)
  start.setDate(start.getDate() - start.getDay())
  return start
}

/**
 * Gets the end of the week for a given date
 */
export const getEndOfWeek = (date: Date): Date => {
  const end = new Date(date)
  end.setDate(end.getDate() + (6 - end.getDay()))
  return end
}

/**
 * Adds days to a date
 */
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * Subtracts days from a date
 */
export const subtractDays = (date: Date, days: number): Date => {
  const result = new Date(date)
  result.setDate(result.getDate() - days)
  return result
}

/**
 * Formats a date for input fields
 */
export const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

/**
 * Formats a time for input fields
 */
export const formatTimeForInput = (date: Date): string => {
  return date.toTimeString().slice(0, 5)
}

/**
 * Parses a date string from input fields
 */
export const parseDateFromInput = (dateString: string): Date => {
  return new Date(dateString)
}

/**
 * Gets the month name in Romanian
 */
export const getMonthName = (date: Date): string => {
  const months = [
    'ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie',
    'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'
  ]
  return months[date.getMonth()]
}

/**
 * Gets the day name in Romanian
 */
export const getDayName = (date: Date): string => {
  const days = [
    'duminică', 'luni', 'marți', 'miercuri', 'joi', 'vineri', 'sâmbătă'
  ]
  return days[date.getDay()]
}
