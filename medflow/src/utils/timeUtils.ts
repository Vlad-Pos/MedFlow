/**
 * Time utility functions for the MedFlow application
 * Centralized utilities for time formatting and calculations
 */

/**
 * Formats time ago in relative terms (Romanian)
 * @param date - Date to format
 * @returns Formatted relative time string
 */
export const formatTimeAgo = (date: Date): string => {
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffMinutes = Math.floor(diffTime / (1000 * 60))
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffMinutes < 1) return 'acum câteva secunde'
  if (diffMinutes < 60) return `acum ${diffMinutes} ${diffMinutes === 1 ? 'minut' : 'minute'}`
  if (diffHours < 24) return `acum ${diffHours} ${diffHours === 1 ? 'oră' : 'ore'}`
  if (diffDays < 7) return `acum ${diffDays} ${diffDays === 1 ? 'zi' : 'zile'}`
  if (diffDays < 30) return `acum ${Math.floor(diffDays / 7)} ${Math.floor(diffDays / 7) === 1 ? 'săptămână' : 'săptămâni'}`
  if (diffDays < 365) return `acum ${Math.floor(diffDays / 30)} ${Math.floor(diffDays / 30) === 1 ? 'lună' : 'luni'}`
  
  return `acum ${Math.floor(diffDays / 365)} ${Math.floor(diffDays / 365) === 1 ? 'an' : 'ani'}`
}

/**
 * Formats timestamp to readable format
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted date string
 */
export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp)
  return date.toLocaleString('ro-RO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Gets relative time description
 * @param date - Date to describe
 * @returns Relative time description
 */
export const getRelativeTimeDescription = (date: Date): string => {
  const now = new Date()
  const diffTime = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'astăzi'
  if (diffDays === 1) return 'ieri'
  if (diffDays === -1) return 'mâine'
  if (diffDays > 0 && diffDays < 7) return `acum ${diffDays} zile`
  if (diffDays < 0 && diffDays > -7) return `peste ${Math.abs(diffDays)} zile`
  
  return date.toLocaleDateString('ro-RO')
}

/**
 * Checks if a date is recent (within specified hours)
 * @param date - Date to check
 * @param hours - Number of hours to consider recent
 * @returns True if date is recent
 */
export const isRecent = (date: Date, hours: number = 24): boolean => {
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffHours = diffTime / (1000 * 60 * 60)
  return diffHours <= hours
}

/**
 * Gets time difference in human readable format
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Human readable time difference
 */
export const getTimeDifference = (startDate: Date, endDate: Date): string => {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  const diffMinutes = Math.floor(diffTime / (1000 * 60))
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffMinutes < 60) {
    return `${diffMinutes} ${diffMinutes === 1 ? 'minut' : 'minute'}`
  }
  
  if (diffHours < 24) {
    const remainingMinutes = diffMinutes % 60
    if (remainingMinutes === 0) {
      return `${diffHours} ${diffHours === 1 ? 'oră' : 'ore'}`
    }
    return `${diffHours} ${diffHours === 1 ? 'oră' : 'ore'} ${remainingMinutes} ${remainingMinutes === 1 ? 'minut' : 'minute'}`
  }
  
  const remainingHours = diffHours % 24
  if (remainingHours === 0) {
    return `${diffDays} ${diffDays === 1 ? 'zi' : 'zile'}`
  }
  return `${diffDays} ${diffDays === 1 ? 'zi' : 'zile'} ${remainingHours} ${remainingHours === 1 ? 'oră' : 'ore'}`
}

/**
 * Formats time for display in 24-hour format
 * @param date - Date to format
 * @returns Formatted time string
 */
export const formatTime24Hour = (date: Date): string => {
  return date.toLocaleTimeString('ro-RO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

/**
 * Converts time string to minutes since midnight
 * @param timeString - Time string in HH:MM format
 * @returns Minutes since midnight
 */
export const timeStringToMinutes = (timeString: string): number => {
  const [hours, minutes] = timeString.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Converts minutes since midnight to time string
 * @param minutes - Minutes since midnight
 * @returns Time string in HH:MM format
 */
export const minutesToTimeString = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}
