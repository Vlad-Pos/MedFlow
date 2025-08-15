/**
 * Centralized Form Validation Component for MedFlow
 * 
 * Features:
 * - Extract ALL validation logic from current components
 * - Must produce IDENTICAL validation results
 * - Must maintain Romanian error messages
 * - Must preserve ALL validation rules
 * 
 * @author MedFlow Team
 * @version 2.0
 */

import { 
  validateAppointmentForm, 
  sanitizeAppointmentInput, 
  mapFirebaseErrorToMessage,
  analyzeSymptoms,
  suggestOptimalAppointmentTimes,
  AppointmentFormData,
  AppointmentFormErrors
} from '../../../utils/appointmentValidation'

export interface ValidationResult {
  isValid: boolean
  errors: AppointmentFormErrors
}

export interface FieldValidationResult {
  isValid: boolean
  error?: string
  warning?: string
}

/**
 * Centralized validation functions that produce IDENTICAL results
 */
export class FormValidation {
  /**
   * Validates the entire appointment form
   */
  static validateAppointmentForm(formData: AppointmentFormData): ValidationResult {
    return validateAppointmentForm(formData)
  }

  /**
   * Validates patient name according to medical standards
   */
  static validatePatientName(name: string): FieldValidationResult {
    const trimmedName = name.trim()
    
    if (!trimmedName) {
      return { 
        isValid: false, 
        error: 'Numele pacientului este obligatoriu' 
      }
    }
    
    if (trimmedName.length < 2) {
      return { 
        isValid: false, 
        error: 'Numele pacientului trebuie să aibă cel puțin 2 caractere' 
      }
    }
    
    if (trimmedName.length > 100) {
      return { 
        isValid: false, 
        error: 'Numele pacientului nu poate depăși 100 de caractere' 
      }
    }
    
    // Check for valid characters (letters, spaces, hyphens, apostrophes)
    const nameRegex = /^[a-zA-ZăâîșțĂÂÎȘȚ\s\-'\.]+$/
    if (!nameRegex.test(trimmedName)) {
      return { 
        isValid: false, 
        error: 'Numele pacientului conține caractere nevalide' 
      }
    }
    
    // Check if it contains at least two words (first name and last name)
    const words = trimmedName.split(' ').filter(word => word.length > 0)
    if (words.length < 2) {
      return { 
        isValid: false, 
        error: 'Vă rugăm să introduceți prenumele și numele complet' 
      }
    }
    
    return { isValid: true }
  }

  /**
   * Validates appointment date and time
   */
  static validateDateTime(dateTimeString: string): FieldValidationResult {
    if (!dateTimeString) {
      return { 
        isValid: false, 
        error: 'Data și ora programării sunt obligatorii' 
      }
    }
    
    const appointmentDate = new Date(dateTimeString)
    
    // Check if date is valid
    if (isNaN(appointmentDate.getTime())) {
      return { 
        isValid: false, 
        error: 'Data și ora introduse nu sunt valide' 
      }
    }
    
    const now = new Date()
    const sixMonthsFromNow = new Date()
    sixMonthsFromNow.setMonth(now.getMonth() + 6)
    
    // Check if date is in the past (allow up to 5 minutes in the past for clock differences)
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)
    if (appointmentDate < fiveMinutesAgo) {
      return { 
        isValid: false, 
        error: 'Nu puteți programa consultații în trecut' 
      }
    }
    
    // Check if date is too far in the future
    if (appointmentDate > sixMonthsFromNow) {
      return { 
        isValid: false, 
        error: 'Nu puteți programa consultații la mai mult de 6 luni în viitor' 
      }
    }
    
    // Check working hours (8:00 - 18:00)
    const hour = appointmentDate.getHours()
    if (hour < 8 || hour >= 18) {
      return { 
        isValid: true, // Allow but warn
        warning: 'Ora programării este în afara orelor de lucru (08:00-18:00)' 
      }
    }
    
    // Check weekend
    const dayOfWeek = appointmentDate.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return { 
        isValid: true, // Allow but warn
        warning: 'Programarea este în weekend - verificați disponibilitatea' 
      }
    }
    
    return { isValid: true }
  }

  /**
   * Validates symptoms description
   */
  static validateSymptoms(symptoms: string): FieldValidationResult {
    const trimmedSymptoms = symptoms.trim()
    
    if (!trimmedSymptoms) {
      return { 
        isValid: false, 
        error: 'Descrierea simptomelor este obligatorie' 
      }
    }
    
    if (trimmedSymptoms.length < 10) {
      return { 
        isValid: false, 
        error: 'Descrierea simptomelor trebuie să aibă cel puțin 10 caractere' 
      }
    }
    
    if (trimmedSymptoms.length > 2000) {
      return { 
        isValid: false, 
        error: 'Descrierea simptomelor nu poate depăși 2000 de caractere' 
      }
    }
    
    // Check for very vague descriptions
    const vaguePhrases = ['rau', 'naspa', 'nu stiu', 'ceva', 'putin', 'oarecare']
    const isVague = vaguePhrases.some(phrase => 
      trimmedSymptoms.toLowerCase().includes(phrase) && trimmedSymptoms.length < 30
    )
    
    if (isVague) {
      return { 
        isValid: true, // Allow but warn
        warning: 'Vă rugăm să furnizați o descriere mai detaliată a simptomelor' 
      }
    }
    
    return { isValid: true }
  }

  /**
   * Validates notes field
   */
  static validateNotes(notes: string): FieldValidationResult {
    if (!notes.trim()) {
      return { isValid: true } // Notes are optional
    }
    
    if (notes.length > 1000) {
      return { 
        isValid: false, 
        error: 'Notele nu pot depăși 1000 de caractere' 
      }
    }
    
    return { isValid: true }
  }

  /**
   * Validates patient email
   */
  static validatePatientEmail(email: string): FieldValidationResult {
    if (!email.trim()) {
      return { isValid: true } // Email is optional
    }
    
    if (email.length > 100) {
      return { 
        isValid: false, 
        error: 'Adresa de email nu poate depăși 100 de caractere' 
      }
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { 
        isValid: false, 
        error: 'Formatul adresei de email nu este valid' 
      }
    }
    
    return { isValid: true }
  }

  /**
   * Validates patient phone
   */
  static validatePatientPhone(phone: string): FieldValidationResult {
    if (!phone.trim()) {
      return { isValid: true } // Phone is optional
    }
    
    if (phone.length > 15) {
      return { 
        isValid: false, 
        error: 'Numărul de telefon nu poate depăși 15 caractere' 
      }
    }
    
    // Romanian phone number validation
    const phoneRegex = /^(\+40|0)[0-9]{9}$/
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return { 
        isValid: false, 
        error: 'Numărul de telefon trebuie să fie în format românesc (+40XXXXXXXXX)' 
      }
    }
    
    return { isValid: true }
  }

  /**
   * Sanitizes appointment input
   */
  static sanitizeAppointmentInput(input: string): string {
    return sanitizeAppointmentInput(input)
  }

  /**
   * Maps Firebase errors to user-friendly messages
   */
  static mapFirebaseErrorToMessage(error: unknown): string {
    return mapFirebaseErrorToMessage(error)
  }

  /**
   * Analyzes symptoms using AI (placeholder for future implementation)
   */
  static analyzeSymptoms(symptoms: string) {
    return analyzeSymptoms(symptoms)
  }

  /**
   * Suggests optimal appointment times
   */
  static suggestOptimalAppointmentTimes(): string[] {
    return suggestOptimalAppointmentTimes()
  }

  /**
   * Validates a specific field with real-time feedback
   */
  static validateField(
    field: keyof AppointmentFormData, 
    value: string, 
    formData?: Partial<AppointmentFormData>
  ): FieldValidationResult {
    switch (field) {
      case 'patientName':
        return this.validatePatientName(value)
      case 'patientEmail':
        return this.validatePatientEmail(value)
      case 'patientPhone':
        return this.validatePatientPhone(value)
      case 'dateTime':
        return this.validateDateTime(value)
      case 'symptoms':
        return this.validateSymptoms(value)
      case 'notes':
        return this.validateNotes(value)
      default:
        return { isValid: true }
    }
  }

  /**
   * Validates multiple fields at once
   */
  static validateFields(
    fields: Record<string, string>, 
    formData?: Partial<AppointmentFormData>
  ): Record<string, FieldValidationResult> {
    const results: Record<string, FieldValidationResult> = {}
    
    Object.entries(fields).forEach(([field, value]) => {
      results[field] = this.validateField(field as keyof AppointmentFormData, value, formData)
    })
    
    return results
  }

  /**
   * Checks if a field has any validation issues
   */
  static hasFieldError(field: keyof AppointmentFormData, value: string): boolean {
    const validation = this.validateField(field, value)
    return !validation.isValid
  }

  /**
   * Checks if a field has warnings
   */
  static hasFieldWarning(field: keyof AppointmentFormData, value: string): boolean {
    const validation = this.validateField(field, value)
    return !!validation.warning
  }

  /**
   * Gets all validation errors for a form
   */
  static getAllErrors(formData: AppointmentFormData): AppointmentFormErrors {
    const validation = this.validateAppointmentForm(formData)
    return validation.errors
  }

  /**
   * Checks if the entire form is valid
   */
  static isFormValid(formData: AppointmentFormData): boolean {
    const validation = this.validateAppointmentForm(formData)
    return validation.isValid
  }
}
