/**
 * Authentication Validation Utilities for MedFlow
 * 
 * Provides comprehensive validation for authentication forms with:
 * - Clear Romanian error messages suitable for medical professionals
 * - Password strength validation
 * - Email format validation
 * - Rate limiting support
 * - Security best practices
 * 
 * @author MedFlow Team
 * @version 2.0
 */

import { rateLimiter } from './validation'

// Types for validation results
export interface AuthValidationResult {
  isValid: boolean
  errors: string[]
  warnings?: string[]
}

export interface PasswordStrength {
  score: number // 0-4 (weak to very strong)
  feedback: string
  requirements: {
    length: boolean
    uppercase: boolean
    lowercase: boolean
    numbers: boolean
    symbols: boolean
  }
}

// Romanian error messages for medical professionals
export const AUTH_ERRORS = {
  // Email validation
  EMAIL_REQUIRED: 'Adresa de email este obligatorie.',
  EMAIL_INVALID: 'Vă rugăm să introduceți o adresă de email validă.',
  EMAIL_TOO_LONG: 'Adresa de email este prea lungă (maximum 254 caractere).',
  EMAIL_DOMAIN_INVALID: 'Domeniul email-ului pare să nu fie valid.',
  
  // Password validation
  PASSWORD_REQUIRED: 'Parola este obligatorie.',
  PASSWORD_TOO_SHORT: 'Parola trebuie să aibă cel puțin 8 caractere pentru securitate.',
  PASSWORD_TOO_LONG: 'Parola este prea lungă (maximum 128 caractere).',
  PASSWORD_WEAK: 'Parola este prea slabă. Folosiți o combinație de litere, cifre și simboluri.',
  PASSWORD_NO_UPPERCASE: 'Parola trebuie să conțină cel puțin o literă mare.',
  PASSWORD_NO_LOWERCASE: 'Parola trebuie să conțină cel puțin o literă mică.',
  PASSWORD_NO_NUMBERS: 'Parola trebuie să conțină cel puțin o cifră.',
  PASSWORD_NO_SYMBOLS: 'Parola trebuie să conțină cel puțin un simbol (!@#$%^&*).',
  PASSWORD_COMMON: 'Această parolă este prea comună. Vă rugăm să alegeți o parolă mai unică.',
  
  // Confirm password
  PASSWORDS_MISMATCH: 'Parolele introduse nu se potrivesc.',
  CONFIRM_PASSWORD_REQUIRED: 'Vă rugăm să confirmați parola.',
  
  // Display name validation
  DISPLAY_NAME_REQUIRED: 'Numele de afișare este obligatoriu.',
  DISPLAY_NAME_TOO_SHORT: 'Numele trebuie să aibă cel puțin 2 caractere.',
  DISPLAY_NAME_TOO_LONG: 'Numele este prea lung (maximum 50 caractere).',
  DISPLAY_NAME_INVALID: 'Numele poate conține doar litere, cifre, spații și cratima.',
  
  // Role validation
  ROLE_REQUIRED: 'Vă rugăm să selectați un rol.',
  ROLE_INVALID: 'Rolul selectat nu este valid.',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'Prea multe încercări. Vă rugăm să așteptați înainte de a încerca din nou.',
  
  // General
  FIELD_REQUIRED: 'Acest câmp este obligatoriu.',
  INVALID_INPUT: 'Datele introduse nu sunt valide.',
} as const

// Common weak passwords in Romanian context
const COMMON_PASSWORDS = [
  'password', 'parola', '123456', '12345678', 'qwerty', 'abc123',
  'password123', 'parola123', 'medic', 'doctor', 'asistent', 'romania',
  'bucuresti', 'cluj', 'timisoara', 'constanta', 'iasi', 'brasov'
]

/**
 * Validates email address with medical practice considerations
 */
export function validateEmail(email: string): AuthValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Required check
  if (!email || !email.trim()) {
    errors.push(AUTH_ERRORS.EMAIL_REQUIRED)
    return { isValid: false, errors, warnings }
  }
  
  const trimmedEmail = email.trim().toLowerCase()
  
  // Length check
  if (trimmedEmail.length > 254) {
    errors.push(AUTH_ERRORS.EMAIL_TOO_LONG)
  }
  
  // Format validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  if (!emailRegex.test(trimmedEmail)) {
    errors.push(AUTH_ERRORS.EMAIL_INVALID)
  }
  
  // Domain validation
  const domainPart = trimmedEmail.split('@')[1]
  if (domainPart) {
    // Check for common domain issues
    if (domainPart.includes('..') || domainPart.startsWith('.') || domainPart.endsWith('.')) {
      errors.push(AUTH_ERRORS.EMAIL_INVALID)
    }
    
    // Warn about temporary email providers (optional)
    const tempDomains = ['10minutemail', 'tempmail', 'guerrillamail', 'throwaway']
    if (tempDomains.some(temp => domainPart.includes(temp))) {
      warnings.push('Recomandăm folosirea unei adrese de email permanente pentru contul medical.')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Analyzes password strength and provides detailed feedback
 */
export function analyzePasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return {
      score: 0,
      feedback: AUTH_ERRORS.PASSWORD_REQUIRED,
      requirements: {
        length: false,
        uppercase: false,
        lowercase: false,
        numbers: false,
        symbols: false
      }
    }
  }
  
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /\d/.test(password),
    symbols: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)
  }
  
  // Calculate score based on requirements
  let score = 0
  if (requirements.length) score++
  if (requirements.uppercase) score++
  if (requirements.lowercase) score++
  if (requirements.numbers) score++
  if (requirements.symbols) score++
  
  // Reduce score for common passwords
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    score = Math.max(0, score - 2)
  }
  
  // Reduce score for repetitive patterns
  if (/(.)\1{2,}/.test(password)) {
    score = Math.max(0, score - 1)
  }
  
  // Generate feedback
  let feedback = ''
  switch (score) {
    case 0:
    case 1:
      feedback = 'Parolă foarte slabă - vă rugăm să îmbunătățiți securitatea.'
      break
    case 2:
      feedback = 'Parolă slabă - recomandăm adăugarea mai multor caractere speciale.'
      break
    case 3:
      feedback = 'Parolă moderată - aproape sigură pentru uz medical.'
      break
    case 4:
      feedback = 'Parolă puternică - excelentă pentru protecția datelor medicale.'
      break
    case 5:
      feedback = 'Parolă foarte puternică - securitate optimă.'
      break
  }
  
  return { score, feedback, requirements }
}

/**
 * Validates password with comprehensive security checks
 */
export function validatePassword(password: string, confirmPassword?: string): AuthValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Required check
  if (!password) {
    errors.push(AUTH_ERRORS.PASSWORD_REQUIRED)
    return { isValid: false, errors, warnings }
  }
  
  // Length checks
  if (password.length < 8) {
    errors.push(AUTH_ERRORS.PASSWORD_TOO_SHORT)
  }
  
  if (password.length > 128) {
    errors.push(AUTH_ERRORS.PASSWORD_TOO_LONG)
  }
  
  // Get strength analysis
  const strength = analyzePasswordStrength(password)
  
  // Add specific requirement errors
  if (!strength.requirements.uppercase) {
    errors.push(AUTH_ERRORS.PASSWORD_NO_UPPERCASE)
  }
  
  if (!strength.requirements.lowercase) {
    errors.push(AUTH_ERRORS.PASSWORD_NO_LOWERCASE)
  }
  
  if (!strength.requirements.numbers) {
    errors.push(AUTH_ERRORS.PASSWORD_NO_NUMBERS)
  }
  
  if (!strength.requirements.symbols) {
    errors.push(AUTH_ERRORS.PASSWORD_NO_SYMBOLS)
  }
  
  // Check for common passwords
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    errors.push(AUTH_ERRORS.PASSWORD_COMMON)
  }
  
  // Confirm password validation
  if (confirmPassword !== undefined) {
    if (!confirmPassword) {
      errors.push(AUTH_ERRORS.CONFIRM_PASSWORD_REQUIRED)
    } else if (password !== confirmPassword) {
      errors.push(AUTH_ERRORS.PASSWORDS_MISMATCH)
    }
  }
  
  // Add warnings for weak but valid passwords
  if (errors.length === 0 && strength.score < 3) {
    warnings.push('Parola respectă cerințele minime, dar recomandăm îmbunătățirea securității.')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Validates display name for medical professionals
 */
export function validateDisplayName(name: string): AuthValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Required check
  if (!name || !name.trim()) {
    errors.push(AUTH_ERRORS.DISPLAY_NAME_REQUIRED)
    return { isValid: false, errors, warnings }
  }
  
  const trimmedName = name.trim()
  
  // Length checks
  if (trimmedName.length < 2) {
    errors.push(AUTH_ERRORS.DISPLAY_NAME_TOO_SHORT)
  }
  
  if (trimmedName.length > 50) {
    errors.push(AUTH_ERRORS.DISPLAY_NAME_TOO_LONG)
  }
  
  // Character validation (letters, numbers, spaces, hyphens, Romanian diacritics)
  const nameRegex = /^[a-zA-ZăâîșțĂÂÎȘȚ0-9\s\-'\.]+$/
  if (!nameRegex.test(trimmedName)) {
    errors.push(AUTH_ERRORS.DISPLAY_NAME_INVALID)
  }
  
  // Professional name suggestions
  if (trimmedName.length > 0 && !trimmedName.includes(' ')) {
    warnings.push('Recomandăm să includeți prenumele și numele pentru identificare profesională.')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Validates user role selection
 */
export function validateRole(role: string): AuthValidationResult {
  const errors: string[] = []
  const validRoles = ['doctor', 'nurse']
  
  if (!role) {
    errors.push(AUTH_ERRORS.ROLE_REQUIRED)
  } else if (!validRoles.includes(role)) {
    errors.push(AUTH_ERRORS.ROLE_INVALID)
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Comprehensive validation for sign-up form
 */
export function validateSignUpForm(data: {
  displayName: string
  email: string
  password: string
  confirmPassword: string
  role: string
}): AuthValidationResult {
  const allErrors: string[] = []
  const allWarnings: string[] = []
  
  // Validate each field
  const nameValidation = validateDisplayName(data.displayName)
  const emailValidation = validateEmail(data.email)
  const passwordValidation = validatePassword(data.password, data.confirmPassword)
  const roleValidation = validateRole(data.role)
  
  // Collect all errors and warnings
  allErrors.push(...nameValidation.errors)
  allErrors.push(...emailValidation.errors)
  allErrors.push(...passwordValidation.errors)
  allErrors.push(...roleValidation.errors)
  
  if (nameValidation.warnings) allWarnings.push(...nameValidation.warnings)
  if (emailValidation.warnings) allWarnings.push(...emailValidation.warnings)
  if (passwordValidation.warnings) allWarnings.push(...passwordValidation.warnings)
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings
  }
}

/**
 * Comprehensive validation for sign-in form
 */
export function validateSignInForm(data: {
  email: string
  password: string
}): AuthValidationResult {
  const allErrors: string[] = []
  
  // Basic validation for sign-in (less strict than sign-up)
  if (!data.email?.trim()) {
    allErrors.push(AUTH_ERRORS.EMAIL_REQUIRED)
  } else {
    const emailValidation = validateEmail(data.email)
    if (!emailValidation.isValid) {
      allErrors.push(AUTH_ERRORS.EMAIL_INVALID)
    }
  }
  
  if (!data.password?.trim()) {
    allErrors.push(AUTH_ERRORS.PASSWORD_REQUIRED)
  }
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  }
}

/**
 * Rate limiting for authentication attempts
 */
export function checkAuthRateLimit(identifier: string, maxAttempts: number = 5): boolean {
  return rateLimiter.isAllowed(`auth_${identifier}`, maxAttempts, 15 * 60 * 1000) // 15 minutes
}

/**
 * Clear rate limit for successful authentication
 */
export function clearAuthRateLimit(identifier: string): void {
  rateLimiter.clear(`auth_${identifier}`)
}

/**
 * Sanitize input for authentication forms
 */
export function sanitizeAuthInput(input: string): string {
  return input
    .trim()
    .replace(/[<>\"'&]/g, '') // Remove potential XSS characters
    .replace(/\s+/g, ' ') // Normalize whitespace
}

/**
 * Generate secure session token for additional security
 */
export function generateSecureToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// Export password strength function for component usage
export { analyzePasswordStrength as getPasswordStrength }
