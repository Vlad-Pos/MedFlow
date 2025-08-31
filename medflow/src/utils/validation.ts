// Validation utilities for MedFlow
export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface ValidationRule {
  test: (value: string) => boolean
  message: string
}

// Common validation rules
export const validationRules = {
  required: (value: string): boolean => value.trim().length > 0,
  email: (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value)
  },
  minLength: (min: number) => (value: string): boolean => value.length >= min,
  maxLength: (max: number) => (value: string): boolean => value.length <= max,
  phone: (value: string): boolean => {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/
    return phoneRegex.test(value.replace(/\s/g, ''))
  },
  date: (value: string): boolean => {
    const date = new Date(value)
    return !isNaN(date.getTime())
  },
  futureDate: (value: string): boolean => {
    const date = new Date(value)
    return date > new Date()
  },
  alphanumeric: (value: string): boolean => {
    const alphanumericRegex = /^[a-zA-Z0-9\s]+$/
    return alphanumericRegex.test(value)
  },
  noSpecialChars: (value: string): boolean => {
    const specialCharsRegex = /[<>\"'&]/
    return !specialCharsRegex.test(value)
  },
  cnp: (value: string): boolean => {
    const cnpRegex = /^[1-9]\d{12}$/
    return cnpRegex.test(value)
  }
}

// Validation functions
export function validateField(value: string, rules: ValidationRule[]): ValidationResult {
  const errors: string[] = []
  
  for (const rule of rules) {
    if (!rule.test(value)) {
      errors.push(rule.message)
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateEmail(email: string): ValidationResult {
  return validateField(email, [
    { test: validationRules.required, message: 'Email-ul este obligatoriu' },
    { test: validationRules.email, message: 'Email-ul nu este valid' },
    { test: validationRules.maxLength(254), message: 'Email-ul este prea lung' },
    { test: validationRules.noSpecialChars, message: 'Email-ul conține caractere nepermise' }
  ])
}

export function validatePassword(password: string): ValidationResult {
  return validateField(password, [
    { test: validationRules.required, message: 'Parola este obligatorie' },
    { test: validationRules.minLength(8), message: 'Parola trebuie să aibă cel puțin 8 caractere' },
    { test: validationRules.maxLength(128), message: 'Parola este prea lungă' }
  ])
}

export function validatePatientName(name: string): ValidationResult {
  return validateField(name, [
    { test: validationRules.required, message: 'Numele pacientului este obligatoriu' },
    { test: validationRules.minLength(2), message: 'Numele trebuie să aibă cel puțin 2 caractere' },
    { test: validationRules.maxLength(100), message: 'Numele este prea lung' },
    { test: validationRules.alphanumeric, message: 'Numele poate conține doar litere, cifre și spații' },
    { test: validationRules.noSpecialChars, message: 'Numele conține caractere nepermise' }
  ])
}

export function validateSymptoms(symptoms: string): ValidationResult {
  return validateField(symptoms, [
    { test: validationRules.maxLength(1000), message: 'Descrierea simptomelor este prea lungă' },
    { test: validationRules.noSpecialChars, message: 'Descrierea conține caractere nepermise' }
  ])
}

export function validateDateTime(dateTime: string): ValidationResult {
  return validateField(dateTime, [
    { test: validationRules.required, message: 'Data și ora sunt obligatorii' },
    { test: validationRules.date, message: 'Data și ora nu sunt valide' },
    { test: validationRules.futureDate, message: 'Data și ora trebuie să fie în viitor' }
  ])
}

export function validateCNP(cnp: string): ValidationResult {
  return validateField(cnp, [
    { test: validationRules.required, message: 'CNP-ul este obligatoriu' },
    { test: validationRules.cnp, message: 'CNP-ul trebuie să aibă exact 13 cifre' },
    { test: validationRules.maxLength(20), message: 'CNP-ul este prea lung' }
  ])
}

export function validatePhoneNumber(phoneNumber: string): ValidationResult {
  return validateField(phoneNumber, [
    { test: validationRules.required, message: 'Numărul de telefon este obligatoriu' },
    { test: validationRules.phone, message: 'Numărul de telefon nu este valid' },
    { test: validationRules.maxLength(20), message: 'Numărul de telefon este prea lung' }
  ])
}

// Sanitization functions
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>\"'&]/g, '') // Remove potential XSS characters
    .replace(/\s+/g, ' ') // Normalize whitespace
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

export function sanitizePhone(phone: string): string {
  return phone.replace(/[\s\-\(\)]/g, '') // Remove formatting
}

// CSRF token generation (simple implementation)
export function generateCSRFToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Rate limiting helper
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map()
  
  isAllowed(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now()
    const attempt = this.attempts.get(key)
    
    if (!attempt || now > attempt.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + windowMs })
      return true
    }
    
    if (attempt.count >= maxAttempts) {
      return false
    }
    
    attempt.count++
    return true
  }
  
  clear(key: string): void {
    this.attempts.delete(key)
  }
}

// Export rate limiter instance
export const rateLimiter = new RateLimiter()
