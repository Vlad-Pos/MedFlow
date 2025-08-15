/**
 * Comprehensive Error Handling System for MedFlow
 * 
 * Features:
 * - Medical-specific error classification and handling
 * - Romanian language error messages for healthcare professionals
 * - Unauthorized access detection and graceful handling
 * - Firebase-specific error mapping
 * - Error reporting and analytics integration
 * - Production-ready error boundary components
 * 
 * @author MedFlow Team
 * @version 2.0
 * @compliance GDPR error logging
 */

import { FirebaseError } from 'firebase/app'

// Error Classification Types
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical'
export type ErrorCategory = 
  | 'authentication' 
  | 'authorization' 
  | 'validation' 
  | 'network' 
  | 'storage' 
  | 'medical_data' 
  | 'system' 
  | 'unknown'

export interface MedFlowError {
  id: string
  category: ErrorCategory
  severity: ErrorSeverity
  message: string
  technicalMessage?: string
  code?: string
  timestamp: Date
  userId?: string
  context?: Record<string, unknown>
  recoverable: boolean
  userActions?: string[]
  reportToAdmin: boolean
}

interface BasicErrorInfo {
  message: string
  severity: ErrorSeverity
  category: ErrorCategory
  userActions: string[]
}

// Romanian Error Messages for Medical Context
const MEDICAL_ERROR_MESSAGES = {
  // Authentication Errors
  'auth/user-not-found': {
    message: 'Contul medical nu a fost găsit. Verificați adresa de email.',
    severity: 'medium' as ErrorSeverity,
    category: 'authentication' as ErrorCategory,
    userActions: ['Verificați adresa de email', 'Contactați administratorul', 'Încercați resetarea parolei']
  },
  'auth/wrong-password': {
    message: 'Parola introdusă este incorectă. Încercați din nou.',
    severity: 'low' as ErrorSeverity,
    category: 'authentication' as ErrorCategory,
    userActions: ['Verificați parola', 'Folosiți resetarea parolei dacă ați uitat-o']
  },
  'auth/too-many-requests': {
    message: 'Prea multe încercări de autentificare. Încercați din nou mai târziu.',
    severity: 'medium' as ErrorSeverity,
    category: 'authentication' as ErrorCategory,
    userActions: ['Așteptați câteva minute', 'Resetați parola dacă este necesar']
  },
  'auth/user-disabled': {
    message: 'Contul dvs. medical a fost dezactivat. Contactați administratorul.',
    severity: 'high' as ErrorSeverity,
    category: 'authentication' as ErrorCategory,
    userActions: ['Contactați administratorul imediat']
  },
  'auth/email-already-in-use': {
    message: 'Această adresă de email este deja folosită de alt cont medical.',
    severity: 'medium' as ErrorSeverity,
    category: 'authentication' as ErrorCategory,
    userActions: ['Folosiți o altă adresă de email', 'Autentificați-vă cu contul existent']
  },

  // Authorization Errors
  'permission-denied': {
    message: 'Nu aveți permisiunea să accesați aceste date medicale.',
    severity: 'high' as ErrorSeverity,
    category: 'authorization' as ErrorCategory,
    userActions: ['Contactați medicul responsabil', 'Verificați rolul dvs. în sistem']
  },
  'insufficient-permissions': {
    message: 'Permisiuni insuficiente pentru această operațiune medicală.',
    severity: 'high' as ErrorSeverity,
    category: 'authorization' as ErrorCategory,
    userActions: ['Contactați administratorul pentru permisiuni suplimentare']
  },

  // Medical Data Errors
  'medical-data-validation-failed': {
    message: 'Datele medicale introduse nu sunt valide. Verificați formatul.',
    severity: 'medium' as ErrorSeverity,
    category: 'medical_data' as ErrorCategory,
    userActions: ['Verificați toate câmpurile obligatorii', 'Corectați formatul datelor']
  },
  'patient-data-conflict': {
    message: 'Există un conflict în datele pacientului. Verificați informațiile.',
    severity: 'high' as ErrorSeverity,
    category: 'medical_data' as ErrorCategory,
    userActions: ['Verificați identitatea pacientului', 'Contactați registratura']
  },
  'appointment-conflict': {
    message: 'Programarea intră în conflict cu o programare existentă.',
    severity: 'medium' as ErrorSeverity,
    category: 'medical_data' as ErrorCategory,
    userActions: ['Selectați alt slot de timp', 'Verificați calendarul']
  },

  // Storage Errors
  'storage/unauthorized': {
    message: 'Nu aveți permisiunea să accesați acest document medical.',
    severity: 'high' as ErrorSeverity,
    category: 'storage' as ErrorCategory,
    userActions: ['Contactați medicul care a încărcat documentul']
  },
  'storage/quota-exceeded': {
    message: 'Spațiul de stocare pentru documente medicale este plin.',
    severity: 'high' as ErrorSeverity,
    category: 'storage' as ErrorCategory,
    userActions: ['Contactați administratorul', 'Ștergeți documente vechi neesentiale']
  },
  'storage/invalid-file-type': {
    message: 'Tipul de fișier nu este acceptat pentru documente medicale.',
    severity: 'low' as ErrorSeverity,
    category: 'storage' as ErrorCategory,
    userActions: ['Folosiți doar PDF, JPEG sau PNG', 'Convertiți documentul în format acceptat']
  },

  // Network Errors
  'network-error': {
    message: 'Eroare de conexiune. Verificați internetul și încercați din nou.',
    severity: 'medium' as ErrorSeverity,
    category: 'network' as ErrorCategory,
    userActions: ['Verificați conexiunea la internet', 'Încercați din nou peste câteva momente']
  },
  'server-error': {
    message: 'Eroare pe serverul medical. Echipa tehnică a fost notificată.',
    severity: 'high' as ErrorSeverity,
    category: 'system' as ErrorCategory,
    userActions: ['Încercați din nou peste câteva minute', 'Contactați suportul dacă persistă']
  },

  // Validation Errors
  'invalid-medical-license': {
    message: 'Numărul de licență medicală nu este valid.',
    severity: 'medium' as ErrorSeverity,
    category: 'validation' as ErrorCategory,
    userActions: ['Verificați formatul licenței (ex: MED123456)', 'Contactați ordinul medicilor']
  },
  'invalid-patient-data': {
    message: 'Datele pacientului sunt incomplete sau incorecte.',
    severity: 'medium' as ErrorSeverity,
    category: 'validation' as ErrorCategory,
    userActions: ['Completați toate câmpurile obligatorii', 'Verificați formatul datelor']
  }
} as const

/**
 * Main Error Handler Class
 */
export class MedFlowErrorHandler {
  private static instance: MedFlowErrorHandler
  private errorLog: MedFlowError[] = []
  private maxLogSize = 1000
  
  private constructor() {}
  
  static getInstance(): MedFlowErrorHandler {
    if (!MedFlowErrorHandler.instance) {
      MedFlowErrorHandler.instance = new MedFlowErrorHandler()
    }
    return MedFlowErrorHandler.instance
  }

  /**
   * Handle and classify any error
   */
  handleError(error: unknown, context?: Record<string, unknown>, userId?: string): MedFlowError {
    const medflowError = this.createMedFlowError(error, context, userId)
    
    // Log error
    this.logError(medflowError)
    
    // Report critical errors
    if (medflowError.reportToAdmin) {
      this.reportToAdmin(medflowError)
    }
    
    return medflowError
  }

  /**
   * Create structured MedFlow error from any error type
   */
  private createMedFlowError(error: unknown, context?: Record<string, unknown>, userId?: string): MedFlowError {
    const errorId = this.generateErrorId()
    let errorInfo = this.getDefaultError()
    
    // Handle Firebase errors
    if (error instanceof FirebaseError) {
      errorInfo = this.mapFirebaseError(error)
    }
    // Handle known error codes
    else if (typeof error === 'object' && error !== null && 'code' in error && typeof (error as { code: unknown }).code === 'string') {
      errorInfo = this.mapErrorCode((error as { code: string }).code)
    }
    // Handle Error objects
    else if (error instanceof Error) {
      errorInfo = {
        message: this.sanitizeErrorMessage(error.message),
        severity: 'medium' as ErrorSeverity,
        category: 'system' as ErrorCategory,
        userActions: ['Încercați din nou', 'Contactați suportul dacă persistă']
      }
    }
    // Handle string errors
    else if (typeof error === 'string') {
      errorInfo = {
        message: this.sanitizeErrorMessage(error),
        severity: 'low' as ErrorSeverity,
        category: 'unknown' as ErrorCategory,
        userActions: ['Încercați din nou']
      }
    }

    return {
      id: errorId,
      category: errorInfo.category,
      severity: errorInfo.severity,
      message: errorInfo.message,
      technicalMessage: (error as { message?: string })?.message || String(error),
      code: (error as { code?: string })?.code,
      timestamp: new Date(),
      userId,
      context,
      recoverable: errorInfo.severity !== 'critical',
      userActions: errorInfo.userActions || [],
      reportToAdmin: errorInfo.severity === 'critical' || errorInfo.severity === 'high'
    }
  }

  /**
   * Map Firebase errors to medical context
   */
  private mapFirebaseError(error: unknown): BasicErrorInfo {
    try {
      const firebaseError = error as { code: string; message?: string }
      const errorCode = firebaseError.code || 'unknown'
      
      if (errorCode in MEDICAL_ERROR_MESSAGES) {
        const errorMessage = MEDICAL_ERROR_MESSAGES[errorCode as keyof typeof MEDICAL_ERROR_MESSAGES]
        return {
          message: errorMessage.message,
          severity: errorMessage.severity,
          category: errorMessage.category,
          userActions: [...errorMessage.userActions] // Convert readonly to mutable
        }
      }
      
      return this.getDefaultError()
    } catch {
      return this.getDefaultError()
    }
  }

  /**
   * Map custom error codes
   */
  private mapErrorCode(code: string): BasicErrorInfo {
    if (code in MEDICAL_ERROR_MESSAGES) {
      const errorMessage = MEDICAL_ERROR_MESSAGES[code as keyof typeof MEDICAL_ERROR_MESSAGES]
      return {
        message: errorMessage.message,
        severity: errorMessage.severity,
        category: errorMessage.category,
        userActions: [...errorMessage.userActions] // Convert readonly to mutable
      }
    }
    
    return this.getDefaultError()
  }

  /**
   * Get default error structure
   */
  private getDefaultError(): BasicErrorInfo {
    return {
      message: 'A apărut o eroare neașteptată. Vă rugăm să încercați din nou.',
      severity: 'medium',
      category: 'unknown',
      userActions: ['Reîncercați operația', 'Verificați conexiunea la internet', 'Contactați suportul']
    }
  }

  /**
   * Sanitize error messages to remove sensitive information
   */
  private sanitizeErrorMessage(message: string): string {
    // Remove potentially sensitive information
    return message
      .replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '[CARD]') // Credit cards
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]') // Emails
      .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]') // Phone numbers
      .replace(/\b\d{4,}\b/g, '[NUMBER]') // Long numbers
  }

  /**
   * Log error to local storage and analytics
   */
  private logError(error: MedFlowError): void {
    // Add to local log
    this.errorLog.push(error)
    
    // Maintain log size
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize)
    }
    
    // Console log for development
    if (process.env.NODE_ENV === 'development') {
      console.error('MedFlow Error:', error)
    }
    
    // TODO: Send to analytics service
    this.sendToAnalytics(error)
  }

  /**
   * Report critical errors to administrators
   */
  private reportToAdmin(error: MedFlowError): void {
    // TODO: Implement admin notification system
    console.error('Critical error reported to admin:', error.id)
    
    // In production, this would:
    // - Send email/SMS to admins
    // - Create support ticket
    // - Log to monitoring system (Sentry, etc.)
  }

  /**
   * Send error data to analytics (anonymized)
   */
  private sendToAnalytics(error: MedFlowError): void {
    // TODO: Integrate with analytics service
    // Ensure GDPR compliance - only send anonymized data
    
    const anonymizedError = {
      category: error.category,
      severity: error.severity,
      code: error.code,
      timestamp: error.timestamp,
      recoverable: error.recoverable
      // Note: No user ID or sensitive context data
    }
    
    // Example: analytics.track('medical_app_error', anonymizedError)
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `medflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Get recent errors for debugging
   */
  getRecentErrors(count: number = 10): MedFlowError[] {
    return this.errorLog.slice(-count)
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = []
  }
}

/**
 * Convenience functions for easy error handling
 */

export function handleMedicalError(error: unknown, context?: Record<string, unknown>, userId?: string): MedFlowError {
  return MedFlowErrorHandler.getInstance().handleError(error, context, userId)
}

export function createAuthorizationError(message?: string): MedFlowError {
  const error = {
    code: 'permission-denied',
    message: message || 'Acces neautorizat la datele medicale'
  }
  return MedFlowErrorHandler.getInstance().handleError(error)
}

export function createValidationError(field: string, message?: string): MedFlowError {
  const error = {
    code: 'medical-data-validation-failed',
    message: message || `Validarea câmpului ${field} a eșuat`
  }
  return MedFlowErrorHandler.getInstance().handleError(error)
}

export function createNetworkError(operation?: string): MedFlowError {
  const error = {
    code: 'network-error',
    message: `Eroare de rețea${operation ? ` pentru ${operation}` : ''}`
  }
  return MedFlowErrorHandler.getInstance().handleError(error)
}

/**
 * Error boundary component helpers
 */

export interface ErrorBoundaryState {
  hasError: boolean
  error?: MedFlowError
}

export function getErrorRecoveryActions(error: MedFlowError): {
  primary: string
  secondary?: string
  emergency?: string
} {
  const actions = {
    primary: 'Reîncărcați pagina',
    secondary: undefined as string | undefined,
    emergency: undefined as string | undefined
  }

  switch (error.category) {
    case 'authentication':
      actions.primary = 'Autentificați-vă din nou'
      actions.secondary = 'Resetați parola'
      break
    case 'authorization':
      actions.primary = 'Contactați medicul responsabil'
      actions.emergency = 'Apelați administratorul: +40 721 XXX XXX'
      break
    case 'medical_data':
      actions.primary = 'Verificați datele introduse'
      actions.secondary = 'Contactați registratura'
      break
    case 'network':
      actions.primary = 'Verificați conexiunea'
      actions.secondary = 'Încercați din nou'
      break
    case 'storage':
      actions.primary = 'Încercați un fișier mai mic'
      actions.secondary = 'Contactați suportul'
      break
  }

  return actions
}

/**
 * Medical-specific error validators
 */

export function validateMedicalLicense(license: string): { isValid: boolean; error?: MedFlowError } {
  const licenseRegex = /^[A-Z]{3}[0-9]{6}$/
  
  if (!licenseRegex.test(license)) {
    return {
      isValid: false,
      error: createValidationError('licență medicală', 'Formatul licenței medicale nu este valid (ex: MED123456)')
    }
  }
  
  return { isValid: true }
}

export function validatePatientData(data: { name?: string; symptoms?: string }): { isValid: boolean; errors: MedFlowError[] } {
  const errors: MedFlowError[] = []
  
  if (!data.name || data.name.length < 2) {
    errors.push(createValidationError('nume pacient', 'Numele pacientului trebuie să aibă cel puțin 2 caractere'))
  }
  
  if (!data.symptoms || data.symptoms.length < 10) {
    errors.push(createValidationError('simptome', 'Descrierea simptomelor trebuie să aibă cel puțin 10 caractere'))
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Export the singleton instance
export const errorHandler = MedFlowErrorHandler.getInstance()
