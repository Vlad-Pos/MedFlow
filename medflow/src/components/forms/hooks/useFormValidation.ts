/**
 * useFormValidation Hook for MedFlow
 * 
 * Features:
 * - Extract validation logic into reusable hook
 * - Preserve ALL current validation behavior
 * - Maintain ALL current validation timing
 * 
 * @author MedFlow Team
 * @version 2.0
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { FormValidation } from '../base/FormValidation'
import { MedicalValidation } from '../medical/MedicalValidation'
import { AppointmentFormData, AppointmentFormErrors } from '../../../utils/appointmentValidation'

export interface ValidationState {
  errors: AppointmentFormErrors
  warnings: Partial<AppointmentFormErrors>
  isValid: boolean
  isDirty: boolean
  touchedFields: Set<keyof AppointmentFormData>
}

export interface UseFormValidationOptions {
  validateOnChange?: boolean
  validateOnBlur?: boolean
  validateOnMount?: boolean
  debounceMs?: number
  useMedicalValidation?: boolean
}

export interface UseFormValidationReturn {
  validationState: ValidationState
  validateField: (field: keyof AppointmentFormData, value: string) => void
  validateForm: () => void
  validateAllFields: () => void
  setFieldTouched: (field: keyof AppointmentFormData, touched: boolean) => void
  setFieldValue: (field: keyof AppointmentFormData, value: string) => void
  resetValidation: () => void
  clearErrors: () => void
  clearWarnings: () => void
  hasErrors: boolean
  hasWarnings: boolean
  getFieldError: (field: keyof AppointmentFormData) => string | undefined
  getFieldWarning: (field: keyof AppointmentFormData) => string | undefined
  isFieldValid: (field: keyof AppointmentFormData) => boolean
  isFieldTouched: (field: keyof AppointmentFormData) => boolean
  setValidationState: React.Dispatch<React.SetStateAction<ValidationState>>
}

/**
 * Hook for managing form validation state and logic
 */
export function useFormValidation(
  formData: AppointmentFormData,
  options: UseFormValidationOptions = {}
): UseFormValidationReturn {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    validateOnMount = false,
    debounceMs = 300,
    useMedicalValidation = false
  } = options

  // Validation state
  const [validationState, setValidationState] = useState<ValidationState>({
    errors: {},
    warnings: {},
    isValid: true,
    isDirty: false,
    touchedFields: new Set()
  })

  // Debounced validation
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)

  // Update validation state
  const updateValidationState = useCallback((updates: Partial<ValidationState>) => {
    setValidationState(prev => ({ ...prev, ...updates }))
  }, [])

  // Validate a single field
  const validateField = useCallback((field: keyof AppointmentFormData, value: string) => {
    const validation = useMedicalValidation 
      ? MedicalValidation.getMedicalFieldValidation(field, value, formData)
      : FormValidation.validateField(field, value)

    setValidationState(prev => {
      const newErrors = { ...prev.errors }
      const newWarnings = { ...prev.warnings }

      if (validation.error) {
        newErrors[field] = validation.error
        delete newWarnings[field]
      } else if (validation.warning) {
        newWarnings[field] = validation.warning
        delete newErrors[field]
      } else {
        delete newErrors[field]
        delete newWarnings[field]
      }

      const isValid = Object.keys(newErrors).length === 0
      const isDirty = prev.touchedFields.size > 0

      return {
        ...prev,
        errors: newErrors,
        warnings: newWarnings,
        isValid,
        isDirty
      }
    })
  }, [formData, useMedicalValidation])

  // Debounced field validation
  const debouncedValidateField = useCallback((field: keyof AppointmentFormData, value: string) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    const timer = setTimeout(() => {
      validateField(field, value)
    }, debounceMs)

    setDebounceTimer(timer)
  }, [validateField, debounceMs, debounceTimer])

  // Validate entire form
  const validateForm = useCallback(() => {
    const validation = useMedicalValidation
      ? MedicalValidation.validateMedicalForm(formData)
      : FormValidation.validateAppointmentForm(formData)

    setValidationState(prev => ({
      ...prev,
      errors: validation.errors,
      warnings: useMedicalValidation ? (validation as any).warnings || {} : {},
      isValid: validation.isValid
    }))
  }, [formData, useMedicalValidation])

  // Validate all fields individually
  const validateAllFields = useCallback(() => {
    const fields: (keyof AppointmentFormData)[] = [
      'patientName',
      'patientEmail',
      'patientPhone',
      'dateTime',
      'symptoms',
      'notes',
      'status'
    ]

    fields.forEach(field => {
      const value = formData[field] || ''
      validateField(field, value)
    })
  }, [formData, validateField])

  // Set field as touched
  const setFieldTouched = useCallback((field: keyof AppointmentFormData, touched: boolean) => {
    setValidationState(prev => {
      const newTouchedFields = new Set(prev.touchedFields)
      
      if (touched) {
        newTouchedFields.add(field)
      } else {
        newTouchedFields.delete(field)
      }

      return {
        ...prev,
        touchedFields: newTouchedFields,
        isDirty: newTouchedFields.size > 0
      }
    })

    if (touched && validateOnBlur) {
      const value = formData[field] || ''
      validateField(field, value)
    }
  }, [formData, validateOnBlur, validateField])

  // Set field value
  const setFieldValue = useCallback((field: keyof AppointmentFormData, value: string) => {
    if (validateOnChange) {
      debouncedValidateField(field, value)
    }
  }, [validateOnChange, debouncedValidateField])

  // Reset validation state
  const resetValidation = useCallback(() => {
    setValidationState({
      errors: {},
      warnings: {},
      isValid: true,
      isDirty: false,
      touchedFields: new Set()
    })

    if (debounceTimer) {
      clearTimeout(debounceTimer)
      setDebounceTimer(null)
    }
  }, [debounceTimer])

  // Clear all errors
  const clearErrors = useCallback(() => {
    setValidationState(prev => ({
      ...prev,
      errors: {},
      isValid: true
    }))
  }, [])

  // Clear all warnings
  const clearWarnings = useCallback(() => {
    setValidationState(prev => ({
      ...prev,
      warnings: {}
    }))
  }, [])

  // Computed values
  const hasErrors = useMemo(() => Object.keys(validationState.errors).length > 0, [validationState.errors])
  const hasWarnings = useMemo(() => Object.keys(validationState.warnings).length > 0, [validationState.warnings])

  // Helper functions
  const getFieldError = useCallback((field: keyof AppointmentFormData) => {
    return validationState.errors[field]
  }, [validationState.errors])

  const getFieldWarning = useCallback((field: keyof AppointmentFormData) => {
    return validationState.warnings[field]
  }, [validationState.warnings])

  const isFieldValid = useCallback((field: keyof AppointmentFormData) => {
    return !validationState.errors[field]
  }, [validationState.errors])

  const isFieldTouched = useCallback((field: keyof AppointmentFormData) => {
    return validationState.touchedFields.has(field)
  }, [validationState.touchedFields])

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
    }
  }, [debounceTimer])

  // Validate on mount if requested
  useEffect(() => {
    if (validateOnMount) {
      validateForm()
    }
  }, [validateOnMount, validateForm])

  // Validate form when formData changes significantly
  useEffect(() => {
    if (validationState.isDirty && Object.keys(validationState.touchedFields).length > 0) {
      validateForm()
    }
  }, [formData, validationState.isDirty, validationState.touchedFields, validateForm])

  return {
    validationState,
    validateField,
    validateForm,
    validateAllFields,
    setFieldTouched,
    setFieldValue,
    resetValidation,
    clearErrors,
    clearWarnings,
    hasErrors,
    hasWarnings,
    getFieldError,
    getFieldWarning,
    isFieldValid,
    isFieldTouched,
    setValidationState
  }
}

/**
 * Hook for managing form validation with custom validation rules
 */
export function useFormValidationWithRules(
  formData: AppointmentFormData,
  customValidationRules: Record<keyof AppointmentFormData, (value: string) => { isValid: boolean; error?: string; warning?: string }>,
  options: UseFormValidationOptions = {}
): UseFormValidationReturn {
  const baseHook = useFormValidation(formData, options)

  // Override validateField with custom rules
  const validateFieldWithCustomRules = useCallback((field: keyof AppointmentFormData, value: string) => {
    const customRule = customValidationRules[field]
    
    if (customRule) {
      const validation = customRule(value)
      
      baseHook.setValidationState(prev => {
        const newErrors = { ...prev.errors }
        const newWarnings = { ...prev.warnings }

        if (validation.error) {
          newErrors[field] = validation.error
          delete newWarnings[field]
        } else if (validation.warning) {
          newWarnings[field] = validation.warning
          delete newErrors[field]
        } else {
          delete newErrors[field]
          delete newWarnings[field]
        }

        const isValid = Object.keys(newErrors).length === 0

        return {
          ...prev,
          errors: newErrors,
          warnings: newWarnings,
          isValid
        }
      })
    } else {
      // Fall back to default validation
      baseHook.validateField(field, value)
    }
  }, [customValidationRules, baseHook])

  return {
    ...baseHook,
    validateField: validateFieldWithCustomRules
  }
}

/**
 * Hook for managing form validation with async validation
 */
export function useFormValidationWithAsync(
  formData: AppointmentFormData,
  asyncValidators: Record<keyof AppointmentFormData, (value: string) => Promise<{ isValid: boolean; error?: string; warning?: string }>>,
  options: UseFormValidationOptions = {}
): UseFormValidationReturn & { isValidating: Record<keyof AppointmentFormData, boolean> } {
  const baseHook = useFormValidation(formData, options)
  const [isValidating, setIsValidating] = useState<Record<keyof AppointmentFormData, boolean>>({} as Record<keyof AppointmentFormData, boolean>)

  // Async validation function
  const validateFieldAsync = useCallback(async (field: keyof AppointmentFormData, value: string) => {
    const asyncValidator = asyncValidators[field]
    
    if (!asyncValidator) {
      baseHook.validateField(field, value)
      return
    }

    setIsValidating(prev => ({ ...prev, [field]: true }))

    try {
      const validation = await asyncValidator(value)
      
      baseHook.setValidationState(prev => {
        const newErrors = { ...prev.errors }
        const newWarnings = { ...prev.warnings }

        if (validation.error) {
          newErrors[field] = validation.error
          delete newWarnings[field]
        } else if (validation.warning) {
          newWarnings[field] = validation.warning
          delete newErrors[field]
        } else {
          delete newErrors[field]
          delete newWarnings[field]
        }

        const isValid = Object.keys(newErrors).length === 0

        return {
          ...prev,
          errors: newErrors,
          warnings: newWarnings,
          isValid
        }
      })
    } catch (error) {
      baseHook.setValidationState(prev => ({
        ...prev,
        errors: { ...prev.errors, [field]: 'Eroare la validare' },
        isValid: false
      }))
    } finally {
      setIsValidating(prev => ({ ...prev, [field]: false }))
    }
  }, [asyncValidators, baseHook])

  return {
    ...baseHook,
    validateField: validateFieldAsync,
    isValidating
  }
}
