/**
 * Medical Validation Component for MedFlow
 * 
 * Features:
 * - Extract medical-specific validation rules
 * - Preserve ALL current medical validation logic
 * - Maintain ALL current error messages
 * 
 * @author MedFlow Team
 * @version 2.0
 */

import { FormValidation } from '../base/FormValidation'
import { AppointmentFormData, AppointmentFormErrors } from '../../../utils/appointmentValidation'

export interface MedicalValidationResult {
  isValid: boolean
  errors: AppointmentFormErrors
  warnings: Partial<AppointmentFormErrors>
}

/**
 * Medical-specific validation rules that produce IDENTICAL results
 */
export class MedicalValidation extends FormValidation {
  /**
   * Validates medical appointment form with enhanced medical rules
   */
  static validateMedicalAppointment(formData: AppointmentFormData): MedicalValidationResult {
    const baseValidation = this.validateAppointmentForm(formData)
    const warnings: Partial<AppointmentFormErrors> = {}
    
    // Additional medical-specific validations
    const medicalWarnings = this.getMedicalWarnings(formData)
    
    return {
      isValid: baseValidation.isValid,
      errors: baseValidation.errors,
      warnings: { ...warnings, ...medicalWarnings }
    }
  }

  /**
   * Gets medical-specific warnings for the form
   */
  private static getMedicalWarnings(formData: AppointmentFormData): Partial<AppointmentFormErrors> {
    const warnings: Partial<AppointmentFormErrors> = {}
    
    // Check for medical terminology in symptoms
    if (formData.symptoms) {
      const medicalTermWarning = this.checkMedicalTerminology(formData.symptoms)
      if (medicalTermWarning) {
        warnings.symptoms = medicalTermWarning
      }
    }
    
    // Check for appointment timing warnings
    if (formData.dateTime) {
      const timingWarning = this.checkAppointmentTiming(formData.dateTime)
      if (timingWarning) {
        warnings.dateTime = timingWarning
      }
    }
    
    // Check for patient information completeness
    const completenessWarning = this.checkPatientInformationCompleteness(formData)
    if (completenessWarning) {
      warnings.general = completenessWarning
    }
    
    return warnings
  }

  /**
   * Checks medical terminology in symptoms
   */
  private static checkMedicalTerminology(symptoms: string): string | undefined {
    const lowerSymptoms = symptoms.toLowerCase()
    
    // Check for very informal language
    const informalTerms = ['rau', 'naspa', 'nu stiu', 'ceva', 'putin', 'oarecare']
    const hasInformalTerms = informalTerms.some(term => lowerSymptoms.includes(term))
    
    if (hasInformalTerms && symptoms.length < 50) {
      return 'Vă rugăm să folosiți terminologie medicală mai precisă pentru o evaluare mai bună'
    }
    
    // Check for symptom severity indicators
    const severityTerms = ['intens', 'sever', 'cronic', 'acut', 'urgent']
    const hasSeverityTerms = severityTerms.some(term => lowerSymptoms.includes(term))
    
    if (!hasSeverityTerms && symptoms.length > 100) {
      return 'Considerați să specificați intensitatea și durata simptomelor'
    }
    
    return undefined
  }

  /**
   * Checks appointment timing for medical appropriateness
   */
  private static checkAppointmentTiming(dateTimeString: string): string | undefined {
    const appointmentDate = new Date(dateTimeString)
    
    // Check for weekend appointments
    const dayOfWeek = appointmentDate.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return 'Programarea este în weekend - verificați disponibilitatea clinicii'
    }
    
    // Check for early morning or late evening appointments
    const hour = appointmentDate.getHours()
    if (hour < 8 || hour >= 18) {
      return 'Ora programării este în afara orelor de lucru standard (08:00-18:00)'
    }
    
    // Check for holiday appointments (basic check)
    const month = appointmentDate.getMonth()
    const day = appointmentDate.getDate()
    
    // Romanian holidays (basic list)
    const holidays = [
      { month: 0, day: 1 },   // New Year
      { month: 0, day: 2 },   // Day after New Year
      { month: 4, day: 1 },   // Labor Day
      { month: 7, day: 15 },  // Assumption
      { month: 11, day: 1 },  // National Day
      { month: 11, day: 25 }, // Christmas
      { month: 11, day: 26 }  // Boxing Day
    ]
    
    const isHoliday = holidays.some(holiday => holiday.month === month && holiday.day === day)
    if (isHoliday) {
      return 'Verificați dacă data aleasă nu este o sărbătoare legală'
    }
    
    return undefined
  }

  /**
   * Checks patient information completeness
   */
  private static checkPatientInformationCompleteness(formData: AppointmentFormData): string | undefined {
    const hasEmail = formData.patientEmail && formData.patientEmail.trim().length > 0
    const hasPhone = formData.patientPhone && formData.patientPhone.trim().length > 0
    
    if (!hasEmail && !hasPhone) {
      return 'Recomandăm să furnizați cel puțin o metodă de contact pentru notificări'
    }
    
    return undefined
  }

  /**
   * Validates medical symptoms with enhanced rules
   */
  static validateMedicalSymptoms(symptoms: string): { isValid: boolean; error?: string; warning?: string } {
    const baseValidation = this.validateSymptoms(symptoms)
    
    if (!baseValidation.isValid) {
      return baseValidation
    }
    
    // Additional medical validation
    const medicalWarning = this.checkMedicalTerminology(symptoms)
    
    return {
      isValid: true,
      warning: medicalWarning
    }
  }

  /**
   * Validates medical appointment timing
   */
  static validateMedicalAppointmentTiming(dateTimeString: string): { isValid: boolean; error?: string; warning?: string } {
    const baseValidation = this.validateDateTime(dateTimeString)
    
    if (!baseValidation.isValid) {
      return baseValidation
    }
    
    // Additional medical timing validation
    const timingWarning = this.checkAppointmentTiming(dateTimeString)
    
    return {
      isValid: true,
      warning: timingWarning
    }
  }

  /**
   * Gets comprehensive medical validation for a field
   */
  static getMedicalFieldValidation(
    field: keyof AppointmentFormData,
    value: string,
    formData?: Partial<AppointmentFormData>
  ): { isValid: boolean; error?: string; warning?: string } {
    const baseValidation = this.validateField(field, value, formData)
    
    if (!baseValidation.isValid) {
      return baseValidation
    }
    
    // Add medical-specific warnings
    let warning = baseValidation.warning
    
    switch (field) {
      case 'symptoms':
        const medicalWarning = this.checkMedicalTerminology(value)
        if (medicalWarning) {
          warning = medicalWarning
        }
        break
        
      case 'dateTime':
        const timingWarning = this.checkAppointmentTiming(value)
        if (timingWarning) {
          warning = timingWarning
        }
        break
        
      case 'patientName':
        // Check for medical name format
        if (value.trim().split(' ').length < 2) {
          warning = 'Recomandăm să introduceți prenumele și numele complet pentru identificarea pacientului'
        }
        break
    }
    
    return {
      isValid: true,
      warning
    }
  }

  /**
   * Validates medical form with enhanced medical rules
   */
  static validateMedicalForm(formData: AppointmentFormData): MedicalValidationResult {
    const baseValidation = this.validateAppointmentForm(formData)
    const warnings: Partial<AppointmentFormErrors> = {}
    
    // Get medical warnings for each field
    Object.keys(formData).forEach((field) => {
      const fieldKey = field as keyof AppointmentFormData
      const fieldValue = formData[fieldKey]
      
      if (typeof fieldValue === 'string') {
        const fieldValidation = this.getMedicalFieldValidation(fieldKey, fieldValue, formData)
        if (fieldValidation.warning) {
          warnings[fieldKey] = fieldValidation.warning
        }
      }
    })
    
    // Add general medical warnings
    const generalWarning = this.checkPatientInformationCompleteness(formData)
    if (generalWarning) {
      warnings.general = generalWarning
    }
    
    return {
      isValid: baseValidation.isValid,
      errors: baseValidation.errors,
      warnings
    }
  }

  /**
   * Checks if medical form meets professional standards
   */
  static meetsMedicalStandards(formData: AppointmentFormData): boolean {
    const validation = this.validateMedicalForm(formData)
    
    // Check if there are any critical errors
    if (!validation.isValid) {
      return false
    }
    
    // Check if symptoms are detailed enough
    if (formData.symptoms && formData.symptoms.length < 20) {
      return false
    }
    
    // Check if patient name is complete
    if (formData.patientName && formData.patientName.trim().split(' ').length < 2) {
      return false
    }
    
    return true
  }

  /**
   * Gets medical form quality score
   */
  static getMedicalFormQualityScore(formData: AppointmentFormData): number {
    let score = 100
    
    // Deduct points for missing or incomplete information
    if (!formData.patientEmail && !formData.patientPhone) {
      score -= 10
    }
    
    if (formData.symptoms && formData.symptoms.length < 30) {
      score -= 15
    }
    
    if (formData.notes && formData.notes.length < 10) {
      score -= 5
    }
    
    // Add points for detailed information
    if (formData.symptoms && formData.symptoms.length > 100) {
      score += 10
    }
    
    if (formData.notes && formData.notes.length > 50) {
      score += 5
    }
    
    return Math.max(0, Math.min(100, score))
  }
}
