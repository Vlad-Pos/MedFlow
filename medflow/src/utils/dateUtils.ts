/**
 * Date utility functions for consistent date formatting throughout the app
 * All dates are formatted as dd/mm/yyyy for Romanian locale
 */

/**
 * Format a date to dd/mm/yyyy format
 */
export function formatDate(date: Date | string | number): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
  
  const day = dateObj.getDate().toString().padStart(2, '0')
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0')
  const year = dateObj.getFullYear()
  
  return `${day}/${month}/${year}`
}

/**
 * Format a date and time to dd/mm/yyyy HH:mm format
 */
export function formatDateTime(date: Date | string | number): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
  
  const day = dateObj.getDate().toString().padStart(2, '0')
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0')
  const year = dateObj.getFullYear()
  const hours = dateObj.getHours().toString().padStart(2, '0')
  const minutes = dateObj.getMinutes().toString().padStart(2, '0')
  
  return `${day}/${month}/${year} ${hours}:${minutes}`
}

/**
 * Format a date to yyyy-MM-dd format for HTML date inputs
 */
export function formatDateForInput(date: Date | string | number): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
  
  const year = dateObj.getFullYear()
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0')
  const day = dateObj.getDate().toString().padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

/**
 * Parse a date string in dd/mm/yyyy format to a Date object
 */
export function parseDate(dateString: string): Date {
  const [day, month, year] = dateString.split('/').map(Number)
  return new Date(year, month - 1, day)
}

/**
 * Get the current date in dd/mm/yyyy format
 */
export function getCurrentDate(): string {
  return formatDate(new Date())
}

/**
 * Get the current date and time in dd/mm/yyyy HH:mm format
 */
export function getCurrentDateTime(): string {
  return formatDateTime(new Date())
}
