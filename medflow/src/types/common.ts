// Common types used throughout the MedFlow application
// This file consolidates types to replace 'any' usage

import type { PatientFlag } from './patientFlagging'

// Generic types for common patterns
export type Optional<T> = T | undefined
export type Nullable<T> = T | null
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

// Event types
export interface BaseEvent {
  id: string
  timestamp: Date
  type: string
}

export interface UserEvent extends BaseEvent {
  userId: string
  action: string
  metadata?: Record<string, unknown>
}

// Form and input types
export interface FormField {
  name: string
  value: string | number | boolean | Date | null
  error?: string
  required?: boolean
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox'
}

export interface FormData {
  [key: string]: FormField
}

export interface FormValidationResult {
  isValid: boolean
  errors: Record<string, string[]>
  warnings?: Record<string, string[]>
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: Date
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// User and authentication types
export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  preferences?: UserPreferences
  createdAt: Date
  updatedAt: Date
}

export type UserRole = 'doctor' | 'nurse' | 'admin' | 'patient'

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: 'en' | 'ro'
  notifications: NotificationPreferences
  accessibility: AccessibilitySettings
}

export interface NotificationPreferences {
  email: boolean
  sms: boolean
  push: boolean
  frequency: 'immediate' | 'daily' | 'weekly'
}

export interface AccessibilitySettings {
  highContrast: boolean
  fontSize: 'small' | 'medium' | 'large'
  reducedMotion: boolean
  screenReader: boolean
}

// Appointment types
export interface Appointment {
  id: string
  patientId: string
  doctorId: string
  startTime: Date
  endTime: Date
  status: AppointmentStatus
  type: AppointmentType
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show'
export type AppointmentType = 'consultation' | 'follow-up' | 'emergency' | 'routine' | 'specialist'

// Patient types
export interface Patient {
  id: string
  name: string
  dateOfBirth: Date
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say'
  contactInfo: ContactInfo
  medicalHistory?: MedicalHistory
  flags?: PatientFlag[]
  createdAt: Date
  updatedAt: Date
}

export interface ContactInfo {
  email?: string
  phone?: string
  address?: Address
  emergencyContact?: EmergencyContact
}

export interface Address {
  street: string
  city: string
  state?: string
  postalCode: string
  country: string
}

export interface EmergencyContact {
  name: string
  relationship: string
  phone: string
  email?: string
}

export interface MedicalHistory {
  conditions: MedicalCondition[]
  medications: Medication[]
  allergies: Allergy[]
  surgeries: Surgery[]
  familyHistory?: FamilyHistory
}

export interface MedicalCondition {
  id: string
  name: string
  diagnosisDate: Date
  status: 'active' | 'resolved' | 'chronic'
  notes?: string
}

export interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  startDate: Date
  endDate?: Date
  prescribedBy: string
  notes?: string
}

export interface Allergy {
  id: string
  allergen: string
  severity: 'mild' | 'moderate' | 'severe'
  symptoms: string[]
  notes?: string
}

export interface Surgery {
  id: string
  procedure: string
  date: Date
  surgeon: string
  hospital: string
  notes?: string
}

export interface FamilyHistory {
  conditions: string[]
  notes?: string
}

// Document types
export interface Document {
  id: string
  name: string
  type: DocumentType
  size: number
  mimeType: string
  url: string
  uploadedBy: string
  uploadedAt: Date
  metadata?: Record<string, unknown>
}

export type DocumentType = 'medical_record' | 'prescription' | 'lab_result' | 'imaging' | 'consent_form' | 'other'

// Calendar and scheduling types
export interface TimeSlot {
  start: Date
  end: Date
  available: boolean
  appointmentId?: string
}

export interface Schedule {
  id: string
  doctorId: string
  date: Date
  timeSlots: TimeSlot[]
  workingHours: WorkingHours
}

export interface WorkingHours {
  start: string // HH:mm format
  end: string // HH:mm format
  breakStart?: string
  breakEnd?: string
  daysOfWeek: number[] // 0-6, Sunday-Saturday
}

// Notification types
export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'unread' | 'read' | 'archived'
  createdAt: Date
  readAt?: Date
  metadata?: Record<string, unknown>
}

export type NotificationType = 'appointment' | 'reminder' | 'alert' | 'system' | 'medical' | 'general'

// Search and filter types
export interface SearchQuery {
  query: string
  filters: Record<string, unknown>
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface SearchResult<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// Error and validation types
export interface ValidationError {
  field: string
  message: string
  code?: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings?: ValidationError[]
}

// Component prop types
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
  id?: string
  'data-testid'?: string
}

export interface ClickableProps extends BaseComponentProps {
  onClick?: (event: React.MouseEvent) => void
  disabled?: boolean
}

export interface LoadingProps extends BaseComponentProps {
  loading?: boolean
  loadingText?: string
}

// Utility types for common patterns
export type ComponentProps<T> = T extends React.ComponentType<infer P> ? P : never
export type AsyncReturnType<T> = T extends (...args: unknown[]) => Promise<infer R> ? R : never
export type EventHandler<T = unknown> = (event: T) => void | Promise<void>

// Firebase specific types
export interface FirebaseTimestamp {
  seconds: number
  nanoseconds: number
}

export interface FirebaseDocument {
  id: string
  [key: string]: unknown
}

// Configuration types
export interface AppConfig {
  environment: 'development' | 'staging' | 'production'
  apiUrl: string
  firebase: FirebaseConfig
  features: FeatureFlags
}

export interface FirebaseConfig {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

export interface FeatureFlags {
  aiSuggestions: boolean
  patientFlagging: boolean
  governmentSubmission: boolean
  advancedAnalytics: boolean
  multiLanguage: boolean
}
