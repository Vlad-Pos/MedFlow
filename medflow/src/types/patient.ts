/**
 * Patient Management System Types
 * 
 * Comprehensive type definitions for the unified patient management system.
 * This file consolidates all patient-related types and interfaces.
 * 
 * @author MedFlow Team
 * @version 2.0
 */

import type { PatientFlag } from './patientFlagging'
import type { UserRole } from './auth'

// Re-export common types for convenience
export type { ContactInfo, Address, EmergencyContact, MedicalHistory, MedicalCondition, Medication, Allergy, Surgery, FamilyHistory } from './common'

// Enhanced Patient Interface for Unified System
export interface Patient {
  // Core Identity
  id: string                    // Unique Firebase document ID
  patientNumber: string         // Human-readable patient number (e.g., "P-2024-001")
  
  // Personal Information
  personalInfo: {
    firstName: string
    lastName: string
    fullName: string           // Computed: firstName + lastName
    dateOfBirth: Date
    gender: 'male' | 'female' | 'other' | 'prefer-not-to-say'
    cnp?: string              // Romanian CNP (if available)
  }
  
  // Contact Information
  contactInfo: {
    email?: string
    phone?: string
    address?: {
      street: string
      city: string
      state?: string
      postalCode: string
      country: string
    }
    emergencyContact?: {
      name: string
      relationship: string
      phone: string
      email?: string
    }
  }
  
  // Medical Information
  medicalInfo: {
    bloodType?: string
    allergies: Allergy[]
    chronicConditions: MedicalCondition[]
    currentMedications: Medication[]
    lastConsultation?: Date
    nextAppointment?: Date
  }
  
  // System Information
  systemInfo: {
    createdBy: string          // userId who created the patient record
    lastModifiedBy: string     // userId who last modified the record
    createdAt: Date
    updatedAt: Date
    isActive: boolean          // Soft delete flag
  }
  
  // Extended Information
  medicalHistory?: MedicalHistory
  flags?: PatientFlag[]
}

// Patient Search and Filter Types
export interface PatientSearchQuery {
  query: string
  filters: PatientFilters
  sortBy?: PatientSortField
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface PatientFilters {
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say'
  ageRange?: {
    min: number
    max: number
  }
  hasCNP?: boolean
  hasAllergies?: boolean
  hasChronicConditions?: boolean
  isActive?: boolean
  createdBy?: string
  lastConsultationRange?: {
    start: Date
    end: Date
  }
}

export type PatientSortField = 
  | 'personalInfo.fullName'
  | 'personalInfo.dateOfBirth'
  | 'systemInfo.createdAt'
  | 'systemInfo.updatedAt'
  | 'medicalInfo.lastConsultation'
  | 'patientNumber'

// Patient Creation and Update Types
export interface CreatePatientRequest {
  personalInfo: {
    firstName: string
    lastName: string
    dateOfBirth: Date
    gender: 'male' | 'female' | 'other' | 'prefer-not-to-say'
    cnp?: string
  }
  contactInfo: {
    email?: string
    phone?: string
    address?: {
      street: string
      city: string
      state?: string
      postalCode: string
      country: string
    }
    emergencyContact?: {
      name: string
      relationship: string
      phone: string
      email?: string
    }
  }
  medicalInfo?: {
    bloodType?: string
    allergies?: Allergy[]
    chronicConditions?: MedicalCondition[]
    currentMedications?: Medication[]
  }
}

export interface UpdatePatientRequest {
  personalInfo?: Partial<Patient['personalInfo']>
  contactInfo?: Partial<Patient['contactInfo']>
  medicalInfo?: Partial<Patient['medicalInfo']>
  flags?: PatientFlag[]
}

// Patient Search Result Types
export interface PatientSearchResult {
  patients: Patient[]
  total: number
  page: number
  limit: number
  hasMore: boolean
  searchTime: number // milliseconds
}

// Patient Statistics Types
export interface PatientStatistics {
  totalPatients: number
  activePatients: number
  newPatientsThisMonth: number
  patientsWithCNP: number
  patientsWithoutCNP: number
  genderDistribution: {
    male: number
    female: number
    other: number
    preferNotToSay: number
  }
  ageDistribution: {
    '0-18': number
    '19-35': number
    '36-50': number
    '51-65': number
    '65+': number
  }
  commonAllergies: Array<{
    allergen: string
    count: number
  }>
  commonConditions: Array<{
    condition: string
    count: number
  }>
}

// Patient Import/Export Types
export interface PatientImportData {
  patients: CreatePatientRequest[]
  importOptions: {
    skipDuplicates: boolean
    updateExisting: boolean
    validateCNP: boolean
  }
}

export interface PatientImportResult {
  success: boolean
  imported: number
  skipped: number
  errors: Array<{
    row: number
    error: string
    data: unknown
  }>
}

// Patient Validation Types
export interface PatientValidationResult {
  isValid: boolean
  errors: PatientValidationError[]
  warnings: PatientValidationWarning[]
}

export interface PatientValidationError {
  field: string
  message: string
  code: 'REQUIRED' | 'INVALID_FORMAT' | 'DUPLICATE' | 'INVALID_CNP' | 'INVALID_EMAIL' | 'INVALID_PHONE'
}

export interface PatientValidationWarning {
  field: string
  message: string
  code: 'MISSING_CNP' | 'MISSING_CONTACT' | 'POTENTIAL_DUPLICATE'
}

// Patient Service Types
export interface PatientService {
  // CRUD Operations
  createPatient(data: CreatePatientRequest): Promise<Patient>
  getPatient(id: string): Promise<Patient | null>
  updatePatient(id: string, data: UpdatePatientRequest): Promise<Patient>
  deletePatient(id: string): Promise<boolean>
  
  // Search Operations
  searchPatients(query: PatientSearchQuery): Promise<PatientSearchResult>
  findPatientByCNP(cnp: string): Promise<Patient | null>
  findPatientByEmail(email: string): Promise<Patient | null>
  findPatientByPhone(phone: string): Promise<Patient | null>
  
  // Statistics
  getPatientStatistics(): Promise<PatientStatistics>
  
  // Import/Export
  importPatients(data: PatientImportData): Promise<PatientImportResult>
  exportPatients(filters?: PatientFilters): Promise<Patient[]>
  
  // Validation
  validatePatient(data: CreatePatientRequest | UpdatePatientRequest): Promise<PatientValidationResult>
  checkForDuplicates(patient: CreatePatientRequest): Promise<Patient[]>
}

// Patient Context Types (for React components)
export interface PatientContextType {
  patients: Patient[]
  currentPatient: Patient | null
  loading: boolean
  error: string | null
  
  // Actions
  createPatient: (data: CreatePatientRequest) => Promise<void>
  updatePatient: (id: string, data: UpdatePatientRequest) => Promise<void>
  deletePatient: (id: string) => Promise<void>
  searchPatients: (query: PatientSearchQuery) => Promise<void>
  selectPatient: (patient: Patient | null) => void
  
  // Utilities
  generatePatientNumber: () => string
  validatePatient: (data: CreatePatientRequest | UpdatePatientRequest) => Promise<PatientValidationResult>
}

// Patient Form Types
export interface PatientFormData {
  personalInfo: {
    firstName: string
    lastName: string
    dateOfBirth: string // ISO date string
    gender: 'male' | 'female' | 'other' | 'prefer-not-to-say'
    cnp: string
  }
  contactInfo: {
    email: string
    phone: string
    address: {
      street: string
      city: string
      state: string
      postalCode: string
      country: string
    }
    emergencyContact: {
      name: string
      relationship: string
      phone: string
      email: string
    }
  }
  medicalInfo: {
    bloodType: string
    allergies: string
    chronicConditions: string
    currentMedications: string
  }
}

// Patient Display Types
export interface PatientDisplayInfo {
  id: string
  patientNumber: string
  fullName: string
  age: number
  gender: string
  cnp?: string
  email?: string
  phone?: string
  lastConsultation?: Date
  nextAppointment?: Date
  hasAllergies: boolean
  hasChronicConditions: boolean
  isActive: boolean
}

// Patient Quick Actions
export interface PatientQuickAction {
  id: string
  label: string
  icon: string
  action: (patient: Patient) => void | Promise<void>
  requiresConfirmation?: boolean
  confirmationMessage?: string
}

// Patient Notification Types
export interface PatientNotification {
  id: string
  patientId: string
  type: 'appointment_reminder' | 'medication_reminder' | 'follow_up' | 'test_result' | 'general'
  title: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  scheduledFor: Date
  sentAt?: Date
  readAt?: Date
  metadata?: Record<string, unknown>
}
