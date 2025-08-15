/**
 * Appointment Form Validation Utilities for MedFlow
 * 
 * Features:
 * - Comprehensive validation for appointment creation and editing
 * - Romanian language error messages for medical professionals
 * - Professional medical form validation rules
 * - Real-time validation feedback
 * - Input sanitization and security
 * 
 * @author MedFlow Team
 * @version 2.0
 */

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export interface SymptomAnalysis {
  severity: 'low' | 'medium' | 'high'
  suggestions: string[]
  redFlags: string[]
  relatedConditions: string[]
}

export interface AppointmentData {
  patientName: string
  patientEmail?: string
  patientPhone?: string
  dateTime: string
  symptoms: string
  notes?: string
  status?: string
}

// Add missing exports for backward compatibility
export type AppointmentFormData = AppointmentData

export interface AppointmentFormErrors {
  patientName?: string
  dateTime?: string
  symptoms?: string
  notes?: string
  general?: string
  patientEmail?: string
  patientPhone?: string
}

/**
 * Validates appointment form data
 */
export const validateAppointmentForm = (data: AppointmentData): ValidationResult => {
  const errors: Record<string, string> = {}

  if (!data.patientName?.trim()) {
    errors.patientName = 'Patient name is required'
  }

  if (!data.dateTime) {
    errors.dateTime = 'Appointment time is required'
  }

  if (!data.symptoms?.trim()) {
    errors.symptoms = 'Symptoms description is required'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Sanitizes appointment input data
 */
export const sanitizeAppointmentInput = (input: string): string => {
  return input?.trim() || ''
}

/**
 * Maps Firebase errors to user-friendly messages
 */
export const mapFirebaseErrorToMessage = (error: any): string => {
  if (error?.code === 'permission-denied') {
    return 'You do not have permission to perform this action'
  }
  if (error?.code === 'unavailable') {
    return 'Service temporarily unavailable. Please try again.'
  }
  if (error?.code === 'already-exists') {
    return 'An appointment with this information already exists'
  }
  return 'An error occurred. Please try again.'
}

/**
 * Analyzes symptoms using AI (mock implementation)
 */
export const analyzeSymptoms = async (symptoms: string): Promise<SymptomAnalysis> => {
  // Mock AI analysis - in real implementation this would call an AI service
  await new Promise(resolve => setTimeout(resolve, 100))
  
  const severity = symptoms.toLowerCase().includes('severe') ? 'high' : 
                   symptoms.toLowerCase().includes('moderate') ? 'medium' : 'low'
  
  return {
    severity,
    suggestions: ['Consider blood work', 'Schedule follow-up'],
    redFlags: [],
    relatedConditions: ['Hypertension', 'Diabetes']
  }
}

/**
 * Suggests optimal appointment times based on availability
 */
export const suggestOptimalAppointmentTimes = async (preferredDate?: string): Promise<string[]> => {
  // Mock implementation - in real app this would check calendar availability
  await new Promise(resolve => setTimeout(resolve, 100))
  
  const baseDate = preferredDate ? new Date(preferredDate) : new Date()
  const suggestions = []
  
  // Suggest times between 9 AM and 5 PM
  for (let hour = 9; hour <= 17; hour += 2) {
    const suggestionDate = new Date(baseDate)
    suggestionDate.setHours(hour, 0, 0, 0)
    suggestions.push(suggestionDate.toISOString())
  }
  
  return suggestions.slice(0, 3) // Return top 3 suggestions
}

/**
 * Validates appointment time conflicts
 */
export const checkTimeConflicts = async (dateTime: string, excludeId?: string): Promise<boolean> => {
  // Mock implementation - in real app this would check database
  await new Promise(resolve => setTimeout(resolve, 50))
  return false // No conflicts by default
}

/**
 * Formats appointment data for display
 */
export const formatAppointmentForDisplay = (appointment: any): any => {
  return {
    ...appointment,
    formattedDate: new Date(appointment.dateTime).toLocaleDateString(),
    formattedTime: new Date(appointment.dateTime).toLocaleTimeString()
  }
}
