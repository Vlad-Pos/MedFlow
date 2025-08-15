/**
 * useFormField Hook for MedFlow
 * 
 * Features:
 * - Extract field state management logic
 * - Preserve ALL current field behavior
 * - Maintain ALL current state transitions
 * 
 * @author MedFlow Team
 * @version 2.0
 */

import { useState, useCallback, useEffect } from 'react'
import { FormValidation } from '../base/FormValidation'
import { AppointmentFormData } from '../../../utils/appointmentValidation'

export interface FieldState {
  value: string
  error?: string
  warning?: string
  touched: boolean
  focused: boolean
  isValid: boolean
}

export interface UseFormFieldOptions {
  initialValue?: string
  required?: boolean
  validateOnChange?: boolean
  validateOnBlur?: boolean
  debounceMs?: number
}

export interface UseFormFieldReturn {
  fieldState: FieldState
  setValue: (value: string) => void
  setTouched: (touched: boolean) => void
  setFocused: (focused: boolean) => void
  handleChange: (value: string) => void
  handleBlur: () => void
  handleFocus: () => void
  reset: () => void
  validate: () => void
  updateFieldState: (updates: Partial<FieldState>) => void
}

/**
 * Hook for managing form field state with validation
 */
export function useFormField(
  field: keyof AppointmentFormData,
  options: UseFormFieldOptions = {}
): UseFormFieldReturn {
  const {
    initialValue = '',
    required = false,
    validateOnChange = true,
    validateOnBlur = true,
    debounceMs = 300
  } = options

  // Field state
  const [fieldState, setFieldState] = useState<FieldState>({
    value: initialValue,
    error: undefined,
    warning: undefined,
    touched: false,
    focused: false,
    isValid: true
  })

  // Debounced validation
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)

  // Update field state
  const updateFieldState = useCallback((updates: Partial<FieldState>) => {
    setFieldState(prev => ({ ...prev, ...updates }))
  }, [])

  // Validate field
  const validate = useCallback(() => {
    const validation = FormValidation.validateField(field, fieldState.value)
    
    updateFieldState({
      error: validation.error,
      warning: validation.warning,
      isValid: validation.isValid
    })
  }, [field, fieldState.value, updateFieldState])

  // Debounced validation
  const debouncedValidate = useCallback(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    const timer = setTimeout(() => {
      validate()
    }, debounceMs)

    setDebounceTimer(timer)
  }, [debounceTimer, validate, debounceMs])

  // Handle field change
  const handleChange = useCallback((value: string) => {
    updateFieldState({ value })
    
    if (validateOnChange) {
      debouncedValidate()
    }
  }, [updateFieldState, validateOnChange, debouncedValidate])

  // Handle field blur
  const handleBlur = useCallback(() => {
    updateFieldState({ touched: true, focused: false })
    
    if (validateOnBlur) {
      validate()
    }
  }, [updateFieldState, validateOnBlur, validate])

  // Handle field focus
  const handleFocus = useCallback(() => {
    updateFieldState({ focused: true })
  }, [updateFieldState])

  // Set field value
  const setValue = useCallback((value: string) => {
    updateFieldState({ value })
  }, [updateFieldState])

  // Set field touched state
  const setTouched = useCallback((touched: boolean) => {
    updateFieldState({ touched })
  }, [updateFieldState])

  // Set field focused state
  const setFocused = useCallback((focused: boolean) => {
    updateFieldState({ focused })
  }, [updateFieldState])

  // Reset field
  const reset = useCallback(() => {
    setFieldState({
      value: initialValue,
      error: undefined,
      warning: undefined,
      touched: false,
      focused: false,
      isValid: true
    })
  }, [initialValue])

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
    }
  }, [debounceTimer])

  // Validate on mount if required and has initial value
  useEffect(() => {
    if (required && initialValue && validateOnChange) {
      validate()
    }
  }, [required, initialValue, validateOnChange, validate])

  return {
    fieldState,
    setValue,
    setTouched,
    setFocused,
    handleChange,
    handleBlur,
    handleFocus,
    reset,
    validate,
    updateFieldState
  }
}

/**
 * Hook for managing multiple form fields
 */
export function useFormFields(
  fields: (keyof AppointmentFormData)[],
  options: UseFormFieldOptions = {}
): Record<keyof AppointmentFormData, UseFormFieldReturn> {
  const fieldHooks: Record<keyof AppointmentFormData, UseFormFieldReturn> = {} as Record<keyof AppointmentFormData, UseFormFieldReturn>
  
  fields.forEach(field => {
    fieldHooks[field] = useFormField(field, options)
  })
  
  return fieldHooks
}

/**
 * Hook for managing form field with external validation
 */
export function useFormFieldWithValidation(
  field: keyof AppointmentFormData,
  externalValidation?: (value: string) => { isValid: boolean; error?: string; warning?: string },
  options: UseFormFieldOptions = {}
): UseFormFieldReturn {
  const baseHook = useFormField(field, options)
  
  // Override validate function with external validation if provided
  const validateWithExternal = useCallback(() => {
    if (externalValidation) {
      const validation = externalValidation(baseHook.fieldState.value)
      baseHook.updateFieldState({
        error: validation.error,
        warning: validation.warning,
        isValid: validation.isValid
      })
    } else {
      baseHook.validate()
    }
  }, [externalValidation, baseHook])
  
  return {
    ...baseHook,
    validate: validateWithExternal
  }
}

/**
 * Hook for managing form field with async validation
 */
export function useFormFieldWithAsyncValidation(
  field: keyof AppointmentFormData,
  asyncValidator?: (value: string) => Promise<{ isValid: boolean; error?: string; warning?: string }>,
  options: UseFormFieldOptions = {}
): UseFormFieldReturn & { isValidating: boolean } {
  const baseHook = useFormField(field, options)
  const [isValidating, setIsValidating] = useState(false)
  
  // Async validation function
  const validateAsync = useCallback(async () => {
    if (!asyncValidator) {
      baseHook.validate()
      return
    }
    
    setIsValidating(true)
    
    try {
      const validation = await asyncValidator(baseHook.fieldState.value)
      baseHook.updateFieldState({
        error: validation.error,
        warning: validation.warning,
        isValid: validation.isValid
      })
    } catch (error) {
      baseHook.updateFieldState({
        error: 'Eroare la validare',
        isValid: false
      })
    } finally {
      setIsValidating(false)
    }
  }, [asyncValidator, baseHook])
  
  return {
    ...baseHook,
    validate: validateAsync,
    isValidating
  }
}
