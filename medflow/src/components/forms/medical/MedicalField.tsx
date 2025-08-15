/**
 * Medical Field Component for MedFlow
 * 
 * Features:
 * - Create medical field variants using base components
 * - Preserve ALL current medical-specific styling
 * - Maintain ALL current medical validation
 * 
 * @author MedFlow Team
 * @version 2.0
 */

import React from 'react'
import { FormInput } from '../base/FormInput'
import { FormValidation } from '../base/FormValidation'
import { FormAI } from '../base/FormAI'
import { AppointmentFormData } from '../../../utils/appointmentValidation'

interface MedicalFieldProps {
  field: keyof AppointmentFormData
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
  warning?: string
  touched?: boolean
  required?: boolean
  className?: string
  showAISuggestions?: boolean
}

/**
 * Medical Field Component that renders appropriate input type based on field
 */
export function MedicalField({
  field,
  value,
  onChange,
  onBlur,
  error,
  warning,
  touched = false,
  required = false,
  className = '',
  showAISuggestions = false
}: MedicalFieldProps) {
  // Get field-specific props
  const fieldProps = getFieldProps(field, value, onChange, onBlur, error, warning, touched, required, className, showAISuggestions)
  
  return <FormInput {...fieldProps} />
}

/**
 * Gets field-specific props for each medical field type
 */
function getFieldProps(
  field: keyof AppointmentFormData,
  value: string,
  onChange: (value: string) => void,
  onBlur?: () => void,
  error?: string,
  warning?: string,
  touched = false,
  required = false,
  className = '',
  showAISuggestions = false
): any {
  const baseProps = {
    value,
    onChange,
    onBlur,
    error: touched ? error : undefined,
    warning: touched ? warning : undefined,
    required,
    className
  }

  switch (field) {
    case 'patientName':
      return {
        ...baseProps,
        label: 'Nume pacient',
        placeholder: 'Ex: Ion Popescu',
        maxLength: 100,
        autoComplete: 'name',
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
      }

    case 'patientEmail':
      return {
        ...baseProps,
        label: 'Email pacient (pentru notificări)',
        type: 'email' as const,
        placeholder: 'exemplu@email.com',
        maxLength: 100,
        autoComplete: 'email',
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
      }

    case 'patientPhone':
      return {
        ...baseProps,
        label: 'Telefon pacient (pentru SMS)',
        type: 'tel' as const,
        placeholder: '+40123456789',
        maxLength: 15,
        autoComplete: 'tel',
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
      }

    case 'dateTime':
      return {
        ...baseProps,
        label: 'Data și ora programării',
        type: 'datetime-local' as const,
        required: true,
        min: new Date().toISOString().slice(0, 16),
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
      }

    case 'symptoms':
      return {
        ...baseProps,
        label: 'Simptome și motivul consultației',
        placeholder: 'Descrieți detaliat simptomele pacientului, durata, intensitatea și orice alte observații relevante...',
        rows: 5,
        maxLength: 2000,
        resize: true,
        required: true,
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
        aiSuggestions: FormAI.getFieldSuggestions('symptoms', value, showAISuggestions),
        showAISuggestions
      }

    case 'notes':
      return {
        ...baseProps,
        label: 'Note suplimentare (opțional)',
        placeholder: 'Observații suplimentare, instrucțiuni speciale, istoric medical relevant...',
        rows: 3,
        maxLength: 1000,
        resize: true,
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
      }

    case 'status':
      return {
        ...baseProps,
        label: 'Status programare',
        options: [
          { value: 'scheduled', label: 'Programat', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
          { value: 'completed', label: 'Finalizat', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
          { value: 'no_show', label: 'Nu s-a prezentat', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> }
        ],
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
      }

    default:
      return {
        ...baseProps,
        label: field,
        placeholder: `Introduceți ${field}`,
        type: 'text'
      }
  }
}

/**
 * Medical Field with Date and Time separated
 */
export function MedicalDateTimeField({
  dateValue,
  timeValue,
  onDateChange,
  onTimeChange,
  onBlur,
  error,
  warning,
  touched = false,
  required = false,
  className = '',
  showAISuggestions = false
}: {
  dateValue: string
  timeValue: string
  onDateChange: (value: string) => void
  onTimeChange: (value: string) => void
  onBlur?: () => void
  error?: string
  warning?: string
  touched?: boolean
  required?: boolean
  className?: string
  showAISuggestions?: boolean
}) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${className}`}>
      <FormInput
        label="Data programării"
        type="date"
        value={dateValue}
        onChange={onDateChange}
        onBlur={onBlur}
        error={touched ? error : undefined}
        warning={touched ? warning : undefined}
        required={required}
        min={new Date().toISOString().split('T')[0]}
        icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
      />

      <FormInput
        label="Ora programării"
        type="time"
        value={timeValue}
        onChange={onTimeChange}
        onBlur={onBlur}
        error={touched ? error : undefined}
        warning={touched ? warning : undefined}
        required={required}
        step="900" // 15 minute intervals
        aiSuggestions={FormAI.suggestOptimalAppointmentTimes()}
        showAISuggestions={showAISuggestions}
        icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
      />
    </div>
  )
}

/**
 * Medical Field with Contact Information
 */
export function MedicalContactField({
  emailValue,
  phoneValue,
  onEmailChange,
  onPhoneChange,
  onBlur,
  emailError,
  phoneError,
  emailWarning,
  phoneWarning,
  touched = false,
  className = ''
}: {
  emailValue: string
  phoneValue: string
  onEmailChange: (value: string) => void
  onPhoneChange: (value: string) => void
  onBlur?: () => void
  emailError?: string
  phoneError?: string
  emailWarning?: string
  phoneWarning?: string
  touched?: boolean
  className?: string
}) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${className}`}>
      <FormInput
        label="Email pacient (pentru notificări)"
        value={emailValue}
        onChange={onEmailChange}
        onBlur={onBlur}
        error={touched ? emailError : undefined}
        warning={touched ? emailWarning : undefined}
        icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
        placeholder="exemplu@email.com"
        maxLength={100}
        autoComplete="email"
        type="email"
      />

      <FormInput
        label="Telefon pacient (pentru SMS)"
        value={phoneValue}
        onChange={onPhoneChange}
        onBlur={onBlur}
        error={touched ? phoneError : undefined}
        warning={touched ? phoneWarning : undefined}
        icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
        placeholder="+40123456789"
        maxLength={15}
        autoComplete="tel"
        type="tel"
      />
    </div>
  )
}
