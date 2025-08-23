/**
 * Patient utility functions for the MedFlow application
 * Centralized utilities for patient management and calculations
 */

/**
 * Calculates age from date of birth
 * @param dateOfBirth - Date of birth string or Date object
 * @returns Age in years
 */
export const calculateAge = (dateOfBirth: string | Date): number => {
  const today = new Date()
  const birthDate = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

/**
 * Formats last visit date in relative terms (Romanian)
 * @param date - Last visit date
 * @returns Formatted relative time string
 */
export const formatLastVisit = (date: Date): string => {
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return 'ieri'
  if (diffDays < 7) return `acum ${diffDays} zile`
  if (diffDays < 30) return `acum ${Math.floor(diffDays / 7)} săptămâni`
  return date.toLocaleDateString('ro-RO')
}

/**
 * Formats patient name for display
 * @param firstName - Patient first name
 * @param lastName - Patient last name
 * @returns Formatted full name
 */
export const formatPatientName = (firstName: string, lastName: string): string => {
  return `${firstName} ${lastName}`.trim()
}

/**
 * Generates patient ID from name and birth date
 * @param firstName - Patient first name
 * @param lastName - Patient last name
 * @param dateOfBirth - Patient date of birth
 * @returns Generated patient ID
 */
export const generatePatientId = (firstName: string, lastName: string, dateOfBirth: string): string => {
  const name = `${firstName}${lastName}`.toLowerCase().replace(/\s/g, '')
  const date = new Date(dateOfBirth).toISOString().slice(0, 10).replace(/-/g, '')
  return `${name}-${date}`
}

/**
 * Validates patient information
 * @param patient - Patient data object
 * @returns Validation result
 */
export const validatePatientData = (patient: {
  firstName: string
  lastName: string
  dateOfBirth: string
  email?: string
  phone?: string
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (!patient.firstName?.trim()) {
    errors.push('Prenumele este obligatoriu')
  }
  
  if (!patient.lastName?.trim()) {
    errors.push('Numele este obligatoriu')
  }
  
  if (!patient.dateOfBirth) {
    errors.push('Data nașterii este obligatorie')
  } else {
    const birthDate = new Date(patient.dateOfBirth)
    if (isNaN(birthDate.getTime())) {
      errors.push('Data nașterii nu este validă')
    }
  }
  
  if (patient.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patient.email)) {
    errors.push('Email-ul nu este valid')
  }
  
  if (patient.phone && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(patient.phone.replace(/\s/g, ''))) {
    errors.push('Numărul de telefon nu este valid')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}
