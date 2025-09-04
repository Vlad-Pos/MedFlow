/**
 * Form Utilities for MedFlow Form System
 *
 * Features:
 * - Advanced form state management
 * - Comprehensive validation utilities
 * - Form data transformation helpers
 * - Romanian medical validation messages
 * - TypeScript support with type safety
 * - Integration with existing form components
 *
 * @author MedFlow UI Team
 * @version 2.0
 */

import { FormFieldSchema } from '../enhanced/FormBuilder'

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'phone' | 'date' | 'number' | 'custom'
  value?: any
  message?: string
  validator?: (value: any) => boolean
}

export interface ValidationResult {
  isValid: boolean
  error?: string
  warning?: string
}

export interface FormFieldState {
  value: any
  error?: string
  warning?: string
  isTouched: boolean
  isDirty: boolean
}

export interface FormState {
  [key: string]: FormFieldState
}

/**
 * Romanian validation messages for medical forms
 */
export const validationMessages = {
  required: (fieldName: string) => `${fieldName} este obligatoriu`,
  minLength: (fieldName: string, min: number) => `${fieldName} trebuie să aibă cel puțin ${min} caractere`,
  maxLength: (fieldName: string, max: number) => `${fieldName} nu poate avea mai mult de ${max} caractere`,
  email: 'Adresa de email nu este validă',
  phone: 'Numărul de telefon nu este valid',
  date: 'Data nu este validă',
  dateFuture: 'Data nu poate fi în viitor',
  datePast: 'Data nu poate fi în trecut',
  number: 'Valoarea trebuie să fie un număr',
  numberMin: (fieldName: string, min: number) => `${fieldName} trebuie să fie cel puțin ${min}`,
  numberMax: (fieldName: string, max: number) => `${fieldName} nu poate fi mai mare de ${max}`,
  pattern: (fieldName: string) => `${fieldName} nu respectă formatul cerut`,
  cnp: 'CNP-ul nu este valid',
  medicalCode: (type: string) => `Codul ${type} nu este valid`,
  diagnosis: 'Diagnosticul trebuie să fie mai specific',
  symptoms: 'Simptomele trebuie să fie mai detaliate'
}

/**
 * Medical validation patterns
 */
export const medicalPatterns = {
  cnp: /^\d{13}$/,
  phone: /^(\+40|0)[2-8]\d{8}$/,
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  date: /^\d{4}-\d{2}-\d{2}$/,
  time: /^\d{2}:\d{2}$/,
  postalCode: /^\d{6}$/,
  medicalCode: /^[A-Z]{2,3}\d{4,6}$/
}

/**
 * Validate a single field value
 */
export const validateField = (
  value: any,
  rules: ValidationRule[],
  fieldName: string
): ValidationResult => {
  for (const rule of rules) {
    const result = validateRule(value, rule, fieldName)
    if (!result.isValid) {
      return result
    }
  }
  return { isValid: true }
}

/**
 * Validate a single rule
 */
export const validateRule = (
  value: any,
  rule: ValidationRule,
  fieldName: string
): ValidationResult => {
  const trimmedValue = typeof value === 'string' ? value.trim() : value

  switch (rule.type) {
    case 'required':
      if (!trimmedValue || trimmedValue === '') {
        return {
          isValid: false,
          error: rule.message || validationMessages.required(fieldName)
        }
      }
      break

    case 'minLength':
      if (trimmedValue && trimmedValue.length < rule.value) {
        return {
          isValid: false,
          error: rule.message || validationMessages.minLength(fieldName, rule.value)
        }
      }
      break

    case 'maxLength':
      if (trimmedValue && trimmedValue.length > rule.value) {
        return {
          isValid: false,
          warning: rule.message || validationMessages.maxLength(fieldName, rule.value)
        }
      }
      break

    case 'pattern':
      if (trimmedValue && !rule.value.test(trimmedValue)) {
        return {
          isValid: false,
          error: rule.message || validationMessages.pattern(fieldName)
        }
      }
      break

    case 'email':
      if (trimmedValue && !medicalPatterns.email.test(trimmedValue)) {
        return {
          isValid: false,
          error: rule.message || validationMessages.email
        }
      }
      break

    case 'phone':
      if (trimmedValue && !medicalPatterns.phone.test(trimmedValue)) {
        return {
          isValid: false,
          error: rule.message || validationMessages.phone
        }
      }
      break

    case 'date':
      if (trimmedValue && !medicalPatterns.date.test(trimmedValue)) {
        return {
          isValid: false,
          error: rule.message || validationMessages.date
        }
      }
      if (trimmedValue && rule.value === 'past' && new Date(trimmedValue) > new Date()) {
        return {
          isValid: false,
          error: rule.message || validationMessages.dateFuture
        }
      }
      if (trimmedValue && rule.value === 'future' && new Date(trimmedValue) < new Date()) {
        return {
          isValid: false,
          error: rule.message || validationMessages.datePast
        }
      }
      break

    case 'number':
      const numValue = Number(trimmedValue)
      if (trimmedValue && isNaN(numValue)) {
        return {
          isValid: false,
          error: rule.message || validationMessages.number
        }
      }
      if (rule.value?.min !== undefined && numValue < rule.value.min) {
        return {
          isValid: false,
          error: rule.message || validationMessages.numberMin(fieldName, rule.value.min)
        }
      }
      if (rule.value?.max !== undefined && numValue > rule.value.max) {
        return {
          isValid: false,
          error: rule.message || validationMessages.numberMax(fieldName, rule.value.max)
        }
      }
      break

    case 'custom':
      if (rule.validator && !rule.validator(trimmedValue)) {
        return {
          isValid: false,
          error: rule.message || 'Valoarea nu este validă'
        }
      }
      break
  }

  return { isValid: true }
}

/**
 * Validate CNP (Romanian personal identification number)
 */
export const validateCNP = (cnp: string): ValidationResult => {
  if (!cnp) return { isValid: false, error: validationMessages.required('CNP') }
  if (!medicalPatterns.cnp.test(cnp)) return { isValid: false, error: validationMessages.cnp }

  // CNP validation algorithm
  const coefficients = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9]
  const digits = cnp.split('').map(Number)
  const controlDigit = digits[12]
  let sum = 0

  for (let i = 0; i < 12; i++) {
    sum += digits[i] * coefficients[i]
  }

  const remainder = sum % 11
  const calculatedControl = remainder === 10 ? 1 : remainder

  if (controlDigit !== calculatedControl) {
    return { isValid: false, error: validationMessages.cnp }
  }

  return { isValid: true }
}

/**
 * Validate medical diagnosis
 */
export const validateDiagnosis = (diagnosis: string): ValidationResult => {
  if (!diagnosis || diagnosis.trim().length < 10) {
    return { isValid: false, error: validationMessages.diagnosis }
  }

  if (diagnosis.length > 500) {
    return { isValid: false, warning: 'Diagnosticul este prea lung (max 500 caractere)' }
  }

  return { isValid: true }
}

/**
 * Validate medical symptoms
 */
export const validateSymptoms = (symptoms: string): ValidationResult => {
  if (!symptoms || symptoms.trim().length < 20) {
    return { isValid: false, error: validationMessages.symptoms }
  }

  if (symptoms.length > 1000) {
    return { isValid: false, warning: 'Descrierea simptomelor este prea lungă (max 1000 caractere)' }
  }

  return { isValid: true }
}

/**
 * Create validation rules from form field schema
 */
export const createValidationRules = (field: FormFieldSchema): ValidationRule[] => {
  const rules: ValidationRule[] = []

  if (field.required) {
    rules.push({ type: 'required' })
  }

  if (field.type === 'email') {
    rules.push({ type: 'email' })
  }

  if (field.type === 'tel') {
    rules.push({ type: 'phone' })
  }

  if (field.validation) {
    const { minLength, maxLength, pattern, min, max } = field.validation

    if (minLength) {
      rules.push({ type: 'minLength', value: minLength })
    }

    if (maxLength) {
      rules.push({ type: 'maxLength', value: maxLength })
    }

    if (pattern) {
      rules.push({ type: 'pattern', value: new RegExp(pattern) })
    }

    if (min !== undefined || max !== undefined) {
      rules.push({
        type: 'number',
        value: { min, max }
      })
    }
  }

  // Add medical-specific validations
  if (field.name.toLowerCase().includes('cnp')) {
    rules.push({
      type: 'custom',
      validator: (value) => validateCNP(value).isValid,
      message: validationMessages.cnp
    })
  }

  if (field.name.toLowerCase().includes('diagnosis')) {
    rules.push({
      type: 'custom',
      validator: (value) => validateDiagnosis(value).isValid,
      message: validationMessages.diagnosis
    })
  }

  if (field.name.toLowerCase().includes('symptom')) {
    rules.push({
      type: 'custom',
      validator: (value) => validateSymptoms(value).isValid,
      message: validationMessages.symptoms
    })
  }

  return rules
}

/**
 * Validate entire form
 */
export const validateForm = (
  values: Record<string, any>,
  fields: FormFieldSchema[]
): { isValid: boolean; errors: Record<string, string>; warnings: Record<string, string> } => {
  const errors: Record<string, string> = {}
  const warnings: Record<string, string> = {}
  let isValid = true

  fields.forEach(field => {
    const rules = createValidationRules(field)
    const value = values[field.name]
    const result = validateField(value, rules, field.label)

    if (!result.isValid) {
      isValid = false
      if (result.error) {
        errors[field.name] = result.error
      }
      if (result.warning) {
        warnings[field.name] = result.warning
      }
    }
  })

  return { isValid, errors, warnings }
}

/**
 * Transform form data for submission
 */
export const transformFormData = (
  values: Record<string, any>,
  fields: FormFieldSchema[]
): Record<string, any> => {
  const transformed: Record<string, any> = {}

  fields.forEach(field => {
    const value = values[field.name]

    if (value === undefined || value === null || value === '') {
      return
    }

    // Transform based on field type
    switch (field.type) {
      case 'date':
        transformed[field.name] = new Date(value).toISOString().split('T')[0]
        break
      case 'datetime-local':
        transformed[field.name] = new Date(value).toISOString()
        break
      case 'number':
        transformed[field.name] = Number(value)
        break
      case 'select':
        if (field.options) {
          const selectedOption = field.options.find(opt => opt.value === value)
          transformed[field.name] = selectedOption ? selectedOption.value : value
        } else {
          transformed[field.name] = value
        }
        break
      default:
        transformed[field.name] = typeof value === 'string' ? value.trim() : value
    }
  })

  return transformed
}

/**
 * Create initial form state
 */
export const createInitialFormState = (
  fields: FormFieldSchema[],
  initialValues: Record<string, any> = {}
): FormState => {
  const state: FormState = {}

  fields.forEach(field => {
    state[field.name] = {
      value: initialValues[field.name] || '',
      error: undefined,
      warning: undefined,
      isTouched: false,
      isDirty: false
    }
  })

  return state
}

/**
 * Update form field state
 */
export const updateFormField = (
  state: FormState,
  fieldName: string,
  updates: Partial<FormFieldState>
): FormState => {
  return {
    ...state,
    [fieldName]: {
      ...state[fieldName],
      ...updates
    }
  }
}

/**
 * Check if form is valid
 */
export const isFormValid = (state: FormState): boolean => {
  return Object.values(state).every(field =>
    !field.error && (!field.isTouched || field.value !== '')
  )
}

/**
 * Check if form is dirty
 */
export const isFormDirty = (state: FormState): boolean => {
  return Object.values(state).some(field => field.isDirty)
}

/**
 * Get form values
 */
export const getFormValues = (state: FormState): Record<string, any> => {
  const values: Record<string, any> = {}
  Object.entries(state).forEach(([key, field]) => {
    values[key] = field.value
  })
  return values
}

/**
 * Reset form to initial state
 */
export const resetForm = (
  fields: FormFieldSchema[],
  initialValues: Record<string, any> = {}
): FormState => {
  return createInitialFormState(fields, initialValues)
}
