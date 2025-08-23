/**
 * Medical utility functions for the MedFlow application
 * Centralized utilities for medical calculations and healthcare functions
 */

/**
 * Medical appointment status types
 */
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show'

/**
 * Medical urgency levels
 */
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'emergency'

/**
 * Medical alert types
 */
export type AlertType = 'patient' | 'appointment' | 'medication' | 'lab_result' | 'system'

/**
 * Gets appointment status color for UI display
 * @param status - Appointment status
 * @returns CSS color class or hex value
 */
export const getAppointmentStatusColor = (status: AppointmentStatus): string => {
  switch (status) {
    case 'scheduled':
      return '#9e85b0' // medflow-primary
    case 'confirmed':
      return '#10b981' // medical-success
    case 'completed':
      return '#3b82f6' // medical-info
    case 'cancelled':
      return '#ef4444' // medical-emergency
    case 'no-show':
      return '#f59e0b' // medical-warning
    default:
      return '#6b7280' // gray
  }
}

/**
 * Gets urgency level color for UI display
 * @param urgency - Urgency level
 * @returns CSS color class or hex value
 */
export const getUrgencyLevelColor = (urgency: UrgencyLevel): string => {
  switch (urgency) {
    case 'low':
      return '#10b981' // green
    case 'medium':
      return '#f59e0b' // yellow
    case 'high':
      return '#ef4444' // red
    case 'emergency':
      return '#dc2626' // dark red
    default:
      return '#6b7280' // gray
  }
}

/**
 * Gets alert type icon for UI display
 * @param type - Alert type
 * @returns Icon name or component
 */
export const getAlertTypeIcon = (type: AlertType): string => {
  switch (type) {
    case 'patient':
      return 'User'
    case 'appointment':
      return 'Calendar'
    case 'medication':
      return 'Pill'
    case 'lab_result':
      return 'Flask'
    case 'system':
      return 'AlertTriangle'
    default:
      return 'Bell'
  }
}

/**
 * Calculates appointment duration in minutes
 * @param startTime - Start time string (HH:MM)
 * @param endTime - End time string (HH:MM)
 * @returns Duration in minutes
 */
export const calculateAppointmentDuration = (startTime: string, endTime: string): number => {
  const start = startTime.split(':').map(Number)
  const end = endTime.split(':').map(Number)
  const startMinutes = start[0] * 60 + start[1]
  const endMinutes = end[0] * 60 + end[1]
  return endMinutes - startMinutes
}

/**
 * Formats appointment duration for display
 * @param durationMinutes - Duration in minutes
 * @returns Formatted duration string
 */
export const formatAppointmentDuration = (durationMinutes: number): string => {
  if (durationMinutes < 60) {
    return `${durationMinutes} min`
  }
  
  const hours = Math.floor(durationMinutes / 60)
  const minutes = durationMinutes % 60
  
  if (minutes === 0) {
    return `${hours}h`
  }
  
  return `${hours}h ${minutes}min`
}

/**
 * Validates medical appointment data
 * @param appointment - Appointment data
 * @returns Validation result
 */
export const validateAppointmentData = (appointment: {
  patientName: string
  dateTime: string
  duration: number
  notes?: string
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (!appointment.patientName?.trim()) {
    errors.push('Numele pacientului este obligatoriu')
  }
  
  if (!appointment.dateTime) {
    errors.push('Data și ora programării sunt obligatorii')
  } else {
    const appointmentDate = new Date(appointment.dateTime)
    if (isNaN(appointmentDate.getTime())) {
      errors.push('Data și ora programării nu sunt valide')
    }
    
    if (appointmentDate <= new Date()) {
      errors.push('Programarea trebuie să fie în viitor')
    }
  }
  
  if (appointment.duration <= 0) {
    errors.push('Durata programării trebuie să fie mai mare decât 0')
  }
  
  if (appointment.duration > 480) { // 8 hours
    errors.push('Durata programării nu poate depăși 8 ore')
  }
  
  if (appointment.notes && appointment.notes.length > 1000) {
    errors.push('Notele nu pot depăși 1000 de caractere')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Generates medical report filename
 * @param patientName - Patient name
 * @param reportType - Type of report
 * @param date - Report date
 * @returns Generated filename
 */
export const generateMedicalReportFilename = (
  patientName: string,
  reportType: string,
  date: Date
): string => {
  const formattedDate = date.toISOString().slice(0, 10).replace(/-/g, '')
  const sanitizedName = patientName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')
  return `${sanitizedName}_${reportType}_${formattedDate}.pdf`
}

/**
 * Calculates patient risk score based on age and conditions
 * @param age - Patient age
 * @param conditions - List of medical conditions
 * @returns Risk score (0-100)
 */
export const calculatePatientRiskScore = (age: number, conditions: string[]): number => {
  let score = 0
  
  // Age factor
  if (age < 18) score += 10
  else if (age < 30) score += 5
  else if (age < 50) score += 15
  else if (age < 65) score += 25
  else score += 35
  
  // Condition factors
  const highRiskConditions = ['diabetes', 'hypertension', 'heart_disease', 'cancer']
  const mediumRiskConditions = ['asthma', 'arthritis', 'obesity']
  
  conditions.forEach(condition => {
    const lowerCondition = condition.toLowerCase()
    if (highRiskConditions.some(c => lowerCondition.includes(c))) {
      score += 20
    } else if (mediumRiskConditions.some(c => lowerCondition.includes(c))) {
      score += 10
    } else {
      score += 5
    }
  })
  
  return Math.min(score, 100)
}

/**
 * Gets medical terminology in Romanian
 * @param term - English medical term
 * @returns Romanian translation
 */
export const getMedicalTerminology = (term: string): string => {
  const terminology: Record<string, string> = {
    'appointment': 'programare',
    'patient': 'pacient',
    'doctor': 'medic',
    'nurse': 'asistent medical',
    'prescription': 'rețetă',
    'diagnosis': 'diagnostic',
    'treatment': 'tratament',
    'symptoms': 'simptome',
    'medication': 'medicament',
    'lab_result': 'rezultat analiză',
    'x_ray': 'radiografie',
    'blood_test': 'analiză sânge',
    'urine_test': 'analiză urină',
    'consultation': 'consultație',
    'follow_up': 'control',
    'emergency': 'urgență',
    'routine': 'rutină',
    'chronic': 'cronic',
    'acute': 'acut'
  }
  
  return terminology[term.toLowerCase()] || term
}
