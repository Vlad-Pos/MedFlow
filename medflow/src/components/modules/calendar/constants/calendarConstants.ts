/**
 * Calendar Constants and Configuration
 *
 * Centralized constants for the calendar system
 * Integration with MedFlow brand guidelines
 */

// Calendar Configuration
export const CALENDAR_CONFIG = {
  DEFAULT_VIEW: 'month' as const,
  WEEK_STARTS_ON: 1, // Monday
  TIME_FORMAT: 'HH:mm',
  DATE_FORMAT: 'dd/MM/yyyy',
  MONTH_YEAR_FORMAT: 'MMMM yyyy'
}

// View Types
export const CALENDAR_VIEWS = {
  MONTH: 'month',
  WEEK: 'week',
  DAY: 'day'
} as const

export type CalendarView = typeof CALENDAR_VIEWS[keyof typeof CALENDAR_VIEWS]

// Event Status
export const EVENT_STATUS = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show'
} as const

export type EventStatus = typeof EVENT_STATUS[keyof typeof EVENT_STATUS]

// Event Priority
export const EVENT_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
} as const

export type EventPriority = typeof EVENT_PRIORITY[keyof typeof EVENT_PRIORITY]

// Event Categories
export const EVENT_CATEGORIES = {
  APPOINTMENT: 'appointment',
  MEETING: 'meeting',
  DEADLINE: 'deadline',
  REMINDER: 'reminder',
  PERSONAL: 'personal',
  WORK: 'work'
} as const

export type EventCategory = typeof EVENT_CATEGORIES[keyof typeof EVENT_CATEGORIES]

// Animation Configuration
export const ANIMATION_CONFIG = {
  BUTTON_HOVER_SCALE: 1.02,
  BUTTON_TAP_SCALE: 0.98,
  ICON_HOVER_SCALE: 1.1,
  SPRING_STIFFNESS: 400,
  SPRING_DAMPING: 17
}

// Romanian Language Constants
export const ROMANIAN_LABELS = {
  TODAY: 'Astăzi',
  MONTH: 'Lună',
  WEEK: 'Săptămână',
  DAY: 'Zi',
  PREVIOUS_MONTH: 'Luna anterioară',
  NEXT_MONTH: 'Luna următoare',
  CREATE_EVENT: 'Creează eveniment',
  EDIT_EVENT: 'Editează eveniment',
  DELETE_EVENT: 'Șterge eveniment',
  EVENT_TITLE: 'Titlul evenimentului',
  START_TIME: 'Ora de început',
  END_TIME: 'Ora de sfârșit',
  DESCRIPTION: 'Descriere',
  LOCATION: 'Locație',
  ATTENDEES: 'Participanți',
  STATUS: 'Status',
  PRIORITY: 'Prioritate',
  CATEGORY: 'Categorie'
}

// Color Mapping for Event Status
export const STATUS_COLORS = {
  [EVENT_STATUS.SCHEDULED]: '#F59E0B', // Orange
  [EVENT_STATUS.CONFIRMED]: '#10B981', // Green
  [EVENT_STATUS.COMPLETED]: '#3B82F6', // Blue
  [EVENT_STATUS.CANCELLED]: '#EF4444', // Red
  [EVENT_STATUS.NO_SHOW]: '#6B7280'    // Gray
}

// Color Mapping for Event Priority
export const PRIORITY_COLORS = {
  [EVENT_PRIORITY.LOW]: '#10B981',     // Green
  [EVENT_PRIORITY.MEDIUM]: '#F59E0B',  // Orange
  [EVENT_PRIORITY.HIGH]: '#EF4444',    // Red
  [EVENT_PRIORITY.URGENT]: '#DC2626'   // Dark Red
}

// Color Mapping for Event Categories
export const CATEGORY_COLORS = {
  [EVENT_CATEGORIES.APPOINTMENT]: '#7A48BF', // MedFlow Primary
  [EVENT_CATEGORIES.MEETING]: '#3B82F6',      // Blue
  [EVENT_CATEGORIES.DEADLINE]: '#EF4444',     // Red
  [EVENT_CATEGORIES.REMINDER]: '#F59E0B',     // Orange
  [EVENT_CATEGORIES.PERSONAL]: '#10B981',     // Green
  [EVENT_CATEGORIES.WORK]: '#6366F1'          // Indigo
}

// Default Event Settings
export const DEFAULT_EVENT_SETTINGS = {
  DURATION_MINUTES: 60,
  DEFAULT_COLOR: '#7A48BF',
  REMINDER_MINUTES: 15,
  MAX_TITLE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500
}

// Calendar Layout Constants
export const CALENDAR_LAYOUT = {
  HEADER_HEIGHT: 80,
  SIDEBAR_WIDTH: 256,
  EVENT_HEIGHT: 60,
  EVENT_GAP: 4,
  TIME_COLUMN_WIDTH: 80,
  MIN_EVENT_WIDTH: 120
}

// Accessibility Constants
export const ACCESSIBILITY_LABELS = {
  PREVIOUS_MONTH: 'Luna anterioară',
  NEXT_MONTH: 'Luna următoare',
  TODAY_BUTTON: 'Mergi la data de astăzi',
  CREATE_EVENT: 'Creează eveniment nou',
  EDIT_EVENT: 'Editează eveniment',
  DELETE_EVENT: 'Șterge eveniment',
  EVENT_DETAILS: 'Detalii eveniment',
  CALENDAR_GRID: 'Grilă calendar',
  TIME_SLOT: 'Interval orar'
}
