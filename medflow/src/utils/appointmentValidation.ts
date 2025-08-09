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
  error?: string
}

export interface AppointmentFormData {
  patientName: string
  patientEmail?: string
  patientPhone?: string
  dateTime: string
  symptoms: string
  notes: string
  status: 'scheduled' | 'completed' | 'no_show' | 'confirmed' | 'declined'
}

export interface AppointmentFormErrors {
  patientName?: string
  patientEmail?: string
  patientPhone?: string
  dateTime?: string
  symptoms?: string
  notes?: string
  general?: string
}

// Romanian error messages for medical professionals
const APPOINTMENT_MESSAGES = {
  patientName: {
    required: 'Numele pacientului este obligatoriu',
    minLength: 'Numele pacientului trebuie să aibă cel puțin 2 caractere',
    maxLength: 'Numele pacientului nu poate depăși 100 de caractere',
    invalid: 'Numele pacientului conține caractere nevalide',
    format: 'Vă rugăm să introduceți prenumele și numele complet'
  },
  dateTime: {
    required: 'Data și ora programării sunt obligatorii',
    invalid: 'Data și ora introduse nu sunt valide',
    pastDate: 'Nu puteți programa consultații în trecut',
    tooFarFuture: 'Nu puteți programa consultații la mai mult de 6 luni în viitor',
    weekendWarning: 'Programarea este în weekend - verificați disponibilitatea',
    outsideHours: 'Ora programării este în afara orelor de lucru (08:00-18:00)',
    holidayWarning: 'Verificați dacă data aleasă nu este o sărbătoare legală'
  },
  symptoms: {
    required: 'Descrierea simptomelor este obligatorie',
    minLength: 'Descrierea simptomelor trebuie să aibă cel puțin 10 caractere',
    maxLength: 'Descrierea simptomelor nu poate depăși 2000 de caractere',
    inappropriate: 'Descrierea conține termeni nepotriviți pentru un document medical',
    tooVague: 'Vă rugăm să furnizați o descriere mai detaliată a simptomelor'
  },
  notes: {
    maxLength: 'Notele nu pot depăși 1000 de caractere',
    inappropriate: 'Notele conțin termeni nepotriviți pentru un document medical'
  },
  patientEmail: {
    invalid: 'Formatul adresei de email nu este valid',
    maxLength: 'Adresa de email nu poate depăși 100 de caractere'
  },
  patientPhone: {
    invalid: 'Numărul de telefon trebuie să fie în format românesc (+40XXXXXXXXX)',
    maxLength: 'Numărul de telefon nu poate depăși 15 caractere'
  },
  general: {
    networkError: 'Eroare de conexiune. Verificați internetul și încercați din nou.',
    serverError: 'Eroare pe server. Vă rugăm să încercați din nou în câteva minute.',
    authError: 'Sesiunea a expirat. Vă rugăm să vă autentificați din nou.',
    unknownError: 'A apărut o eroare neașteptată. Vă rugăm să încercați din nou.',
    conflictError: 'Există deja o programare la această dată și oră.',
    permissionError: 'Nu aveți permisiunea să efectuați această operațiune.'
  }
} as const

/**
 * Validates patient name according to medical standards
 */
export function validatePatientName(name: string): ValidationResult {
  const trimmedName = name.trim()
  
  if (!trimmedName) {
    return { isValid: false, error: APPOINTMENT_MESSAGES.patientName.required }
  }
  
  if (trimmedName.length < 2) {
    return { isValid: false, error: APPOINTMENT_MESSAGES.patientName.minLength }
  }
  
  if (trimmedName.length > 100) {
    return { isValid: false, error: APPOINTMENT_MESSAGES.patientName.maxLength }
  }
  
  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-ZăâîșțĂÂÎȘȚ\s\-'\.]+$/
  if (!nameRegex.test(trimmedName)) {
    return { isValid: false, error: APPOINTMENT_MESSAGES.patientName.invalid }
  }
  
  // Check if it contains at least two words (first name and last name)
  const words = trimmedName.split(' ').filter(word => word.length > 0)
  if (words.length < 2) {
    return { isValid: false, error: APPOINTMENT_MESSAGES.patientName.format }
  }
  
  return { isValid: true }
}

/**
 * Validates appointment date and time
 */
export function validateDateTime(dateTimeString: string): ValidationResult {
  if (!dateTimeString) {
    return { isValid: false, error: APPOINTMENT_MESSAGES.dateTime.required }
  }
  
  const appointmentDate = new Date(dateTimeString)
  
  // Check if date is valid
  if (isNaN(appointmentDate.getTime())) {
    return { isValid: false, error: APPOINTMENT_MESSAGES.dateTime.invalid }
  }
  
  const now = new Date()
  const sixMonthsFromNow = new Date()
  sixMonthsFromNow.setMonth(now.getMonth() + 6)
  
  // Check if date is in the past (allow up to 5 minutes in the past for clock differences)
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)
  if (appointmentDate < fiveMinutesAgo) {
    return { isValid: false, error: APPOINTMENT_MESSAGES.dateTime.pastDate }
  }
  
  // Check if date is too far in the future
  if (appointmentDate > sixMonthsFromNow) {
    return { isValid: false, error: APPOINTMENT_MESSAGES.dateTime.tooFarFuture }
  }
  
  // Check working hours (8:00 - 18:00)
  const hour = appointmentDate.getHours()
  if (hour < 8 || hour >= 18) {
    return { 
      isValid: true, // Allow but warn
      error: APPOINTMENT_MESSAGES.dateTime.outsideHours 
    }
  }
  
  // Check weekend
  const dayOfWeek = appointmentDate.getDay()
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return { 
      isValid: true, // Allow but warn
      error: APPOINTMENT_MESSAGES.dateTime.weekendWarning 
    }
  }
  
  return { isValid: true }
}

/**
 * Validates symptoms description
 */
export function validateSymptoms(symptoms: string): ValidationResult {
  const trimmedSymptoms = symptoms.trim()
  
  if (!trimmedSymptoms) {
    return { isValid: false, error: APPOINTMENT_MESSAGES.symptoms.required }
  }
  
  if (trimmedSymptoms.length < 10) {
    return { isValid: false, error: APPOINTMENT_MESSAGES.symptoms.minLength }
  }
  
  if (trimmedSymptoms.length > 2000) {
    return { isValid: false, error: APPOINTMENT_MESSAGES.symptoms.maxLength }
  }
  
  // Check for very vague descriptions
  const vaguePhrases = ['rau', 'naspa', 'nu stiu', 'ceva', 'putin', 'oarecare']
  const isVague = vaguePhrases.some(phrase => 
    trimmedSymptoms.toLowerCase().includes(phrase) && trimmedSymptoms.length < 30
  )
  
  if (isVague) {
    return { 
      isValid: true, // Allow but warn
      error: APPOINTMENT_MESSAGES.symptoms.tooVague 
    }
  }
  
  return { isValid: true }
}

/**
 * Validates optional notes
 */
export function validateNotes(notes: string): ValidationResult {
  const trimmedNotes = notes.trim()
  
  if (trimmedNotes.length > 1000) {
    return { isValid: false, error: APPOINTMENT_MESSAGES.notes.maxLength }
  }
  
  return { isValid: true }
}

/**
 * Validates patient email (optional)
 */
export function validatePatientEmail(email: string): ValidationResult {
  const trimmedEmail = email.trim()
  
  if (!trimmedEmail) {
    return { isValid: true } // Email is optional
  }
  
  if (trimmedEmail.length > 100) {
    return { isValid: false, error: APPOINTMENT_MESSAGES.patientEmail.maxLength }
  }
  
  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmedEmail)) {
    return { isValid: false, error: APPOINTMENT_MESSAGES.patientEmail.invalid }
  }
  
  return { isValid: true }
}

/**
 * Validates patient phone (optional)
 */
export function validatePatientPhone(phone: string): ValidationResult {
  const trimmedPhone = phone.trim()
  
  if (!trimmedPhone) {
    return { isValid: true } // Phone is optional
  }
  
  if (trimmedPhone.length > 15) {
    return { isValid: false, error: APPOINTMENT_MESSAGES.patientPhone.maxLength }
  }
  
  // Romanian phone format validation
  const phoneRegex = /^\+40[0-9]{9}$/
  if (!phoneRegex.test(trimmedPhone)) {
    return { isValid: false, error: APPOINTMENT_MESSAGES.patientPhone.invalid }
  }
  
  return { isValid: true }
}

/**
 * Validates the entire appointment form
 */
export function validateAppointmentForm(formData: AppointmentFormData): {
  isValid: boolean
  errors: AppointmentFormErrors
} {
  const errors: AppointmentFormErrors = {}
  let isValid = true
  
  // Validate patient name
  const nameValidation = validatePatientName(formData.patientName)
  if (!nameValidation.isValid) {
    errors.patientName = nameValidation.error
    isValid = false
  }
  
  // Validate patient email (optional)
  if (formData.patientEmail) {
    const emailValidation = validatePatientEmail(formData.patientEmail)
    if (!emailValidation.isValid) {
      errors.patientEmail = emailValidation.error
      isValid = false
    }
  }
  
  // Validate patient phone (optional)
  if (formData.patientPhone) {
    const phoneValidation = validatePatientPhone(formData.patientPhone)
    if (!phoneValidation.isValid) {
      errors.patientPhone = phoneValidation.error
      isValid = false
    }
  }
  
  // Validate date and time
  const dateTimeValidation = validateDateTime(formData.dateTime)
  if (!dateTimeValidation.isValid) {
    errors.dateTime = dateTimeValidation.error
    isValid = false
  } else if (dateTimeValidation.error) {
    // Warning but still valid
    errors.dateTime = dateTimeValidation.error
  }
  
  // Validate symptoms
  const symptomsValidation = validateSymptoms(formData.symptoms)
  if (!symptomsValidation.isValid) {
    errors.symptoms = symptomsValidation.error
    isValid = false
  } else if (symptomsValidation.error) {
    // Warning but still valid
    errors.symptoms = symptomsValidation.error
  }
  
  // Validate notes
  const notesValidation = validateNotes(formData.notes)
  if (!notesValidation.isValid) {
    errors.notes = notesValidation.error
    isValid = false
  }
  
  return { isValid, errors }
}

/**
 * Sanitizes input to prevent XSS and ensure data quality
 */
export function sanitizeAppointmentInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
}

/**
 * AI Integration Placeholder: Analyzes symptoms for medical insights
 * This function will be enhanced with AI capabilities in future versions
 */
export function analyzeSymptoms(symptoms: string): {
  severity?: 'low' | 'medium' | 'high' | 'urgent'
  suggestions?: string[]
  redFlags?: string[]
  relatedConditions?: string[]
} {
  // AI Placeholder: This will be replaced with actual AI analysis
  // For now, return basic analysis based on keywords
  
  const urgentKeywords = ['durere acută', 'sângerare', 'dificultate respirație', 'durere piept', 'leșin', 'convulsii']
  const mediumKeywords = ['febră', 'durere', 'inflamație', 'amețeală', 'vărsături']
  
  const symptomsLower = symptoms.toLowerCase()
  
  if (urgentKeywords.some(keyword => symptomsLower.includes(keyword))) {
    return {
      severity: 'urgent',
      redFlags: ['Simptome care pot necesita atenție medicală urgentă'],
      suggestions: ['🤖 AI: Recomandăm evaluare urgentă - programați cât mai repede']
    }
  }
  
  if (mediumKeywords.some(keyword => symptomsLower.includes(keyword))) {
    return {
      severity: 'medium',
      suggestions: ['🤖 AI: Simptome comune - monitorizați evoluția']
    }
  }
  
  return {
    severity: 'low',
    suggestions: ['🤖 AI: Analiză completă a simptomelor va fi disponibilă în curând']
  }
}

/**
 * AI Integration Placeholder: Suggests optimal appointment times
 */
export function suggestOptimalAppointmentTimes(patientHistory?: any[]): string[] {
  // AI Placeholder: This will use machine learning to suggest optimal times
  // Based on doctor availability, patient preferences, and historical data
  
  return [
    '🤖 AI: Orele 09:00-11:00 sunt optime pentru consultații complexe',
    '🤖 AI: Sugestii personalizate de programare vor fi disponibile în curând'
  ]
}

/**
 * Maps Firebase errors to user-friendly Romanian messages
 */
export function mapFirebaseErrorToMessage(error: any): string {
  const errorCode = error?.code || ''
  
  switch (errorCode) {
    case 'permission-denied':
      return APPOINTMENT_MESSAGES.general.permissionError
    case 'unavailable':
    case 'network-request-failed':
      return APPOINTMENT_MESSAGES.general.networkError
    case 'internal':
      return APPOINTMENT_MESSAGES.general.serverError
    case 'unauthenticated':
      return APPOINTMENT_MESSAGES.general.authError
    default:
      return APPOINTMENT_MESSAGES.general.unknownError
  }
}

export { APPOINTMENT_MESSAGES }
