/**
 * Enhanced Form Builder Component for MedFlow UI Library
 *
 * Features:
 * - Dynamic form generation from schema
 * - Integrated with enhanced UI components
 * - Professional medical styling with MedFlow branding
 * - Advanced validation and error handling
 * - AI-powered form assistance
 * - Responsive design for all screen sizes
 * - TypeScript support with comprehensive type safety
 * - Romanian localization for medical professionals
 *
 * @author MedFlow UI Team
 * @version 2.0
 */

import React, { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FormInput } from '../base/FormInput'
import { EnhancedFormField } from './EnhancedFormField'
import { LoadingSpinner } from '../../ui/feedback/LoadingSpinner'
import { ButtonGroup, PrimaryButton, SecondaryButton } from '../../ui/buttons/AnimatedButton'
import { Brain, Save, X, RotateCcw, CheckCircle } from 'lucide-react'

export interface FormFieldSchema {
  name: string
  label: string
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'date' | 'time' | 'datetime-local' | 'number'
  placeholder?: string
  required?: boolean
  disabled?: boolean
  options?: { value: string; label: string; icon?: React.ReactNode }[]
  validation?: {
    minLength?: number
    maxLength?: number
    pattern?: string
    min?: number
    max?: number
  }
  aiSuggestions?: string[]
  icon?: React.ReactNode
  description?: string
  category?: string
}

export interface FormSchema {
  title: string
  description?: string
  fields: FormFieldSchema[]
  submitButtonText?: string
  cancelButtonText?: string
  showResetButton?: boolean
  layout?: 'single' | 'two-column' | 'auto'
}

export interface FormBuilderProps {
  schema: FormSchema
  initialValues?: Record<string, any>
  onSubmit: (values: Record<string, any>) => void | Promise<void>
  onCancel?: () => void
  onReset?: () => void
  isLoading?: boolean
  isSubmitting?: boolean
  errors?: Record<string, string>
  warnings?: Record<string, string>
  readOnly?: boolean
  className?: string
  enableAI?: boolean
  onAIAssist?: (fieldName: string) => Promise<string[]>
}

export interface FormState {
  values: Record<string, any>
  errors: Record<string, string>
  warnings: Record<string, string>
  touched: Record<string, boolean>
  isValid: boolean
  isDirty: boolean
}

export const FormBuilder: React.FC<FormBuilderProps> = ({
  schema,
  initialValues = {},
  onSubmit,
  onCancel,
  onReset,
  isLoading = false,
  isSubmitting = false,
  errors: externalErrors = {},
  warnings: externalWarnings = {},
  readOnly = false,
  className = '',
  enableAI = false,
  onAIAssist
}) => {
  const [formState, setFormState] = useState<FormState>({
    values: initialValues,
    errors: externalErrors,
    warnings: externalWarnings,
    touched: {},
    isValid: false,
    isDirty: false
  })

  const [aiSuggestions, setAiSuggestions] = useState<Record<string, string[]>>({})
  const [isLoadingAI, setIsLoadingAI] = useState<Record<string, boolean>>({})

  // Validate field
  const validateField = useCallback((field: FormFieldSchema, value: any): { error?: string; warning?: string } => {
    if (field.required && (!value || value.trim?.() === '')) {
      return { error: `${field.label} este obligatoriu` }
    }

    if (field.validation) {
      const { minLength, maxLength, pattern, min, max } = field.validation

      if (minLength && value && value.length < minLength) {
        return { error: `${field.label} trebuie să aibă cel puțin ${minLength} caractere` }
      }

      if (maxLength && value && value.length > maxLength) {
        return { warning: `${field.label} are prea multe caractere (max ${maxLength})` }
      }

      if (pattern && value && !new RegExp(pattern).test(value)) {
        return { error: `${field.label} nu respectă formatul cerut` }
      }

      if (min && value && Number(value) < min) {
        return { error: `${field.label} trebuie să fie cel puțin ${min}` }
      }

      if (max && value && Number(value) > max) {
        return { error: `${field.label} nu poate fi mai mare de ${max}` }
      }
    }

    return {}
  }, [])

  // Handle field change
  const handleFieldChange = useCallback((name: string, value: any) => {
    setFormState(prev => {
      const newValues = { ...prev.values, [name]: value }
      const field = schema.fields.find(f => f.name === name)
      const validation = field ? validateField(field, value) : {}

      const newErrors = { ...prev.errors, ...externalErrors }
      const newWarnings = { ...prev.warnings, ...externalWarnings }

      if (validation.error) {
        newErrors[name] = validation.error
      } else {
        delete newErrors[name]
      }

      if (validation.warning) {
        newWarnings[name] = validation.warning
      } else {
        delete newWarnings[name]
      }

      const isValid = Object.keys(newErrors).length === 0
      const isDirty = JSON.stringify(newValues) !== JSON.stringify(initialValues)

      return {
        ...prev,
        values: newValues,
        errors: newErrors,
        warnings: newWarnings,
        isValid,
        isDirty
      }
    })
  }, [schema.fields, validateField, externalErrors, externalWarnings, initialValues])

  // Handle field blur
  const handleFieldBlur = useCallback((name: string) => {
    setFormState(prev => ({
      ...prev,
      touched: { ...prev.touched, [name]: true }
    }))
  }, [])

  // Handle AI assist
  const handleAIAssist = useCallback(async (fieldName: string) => {
    if (!onAIAssist) return

    setIsLoadingAI(prev => ({ ...prev, [fieldName]: true }))

    try {
      const suggestions = await onAIAssist(fieldName)
      setAiSuggestions(prev => ({ ...prev, [fieldName]: suggestions }))
    } catch (error) {
      console.error('AI assist error:', error)
    } finally {
      setIsLoadingAI(prev => ({ ...prev, [fieldName]: false }))
    }
  }, [onAIAssist])

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all fields
    const allErrors: Record<string, string> = {}
    const allWarnings: Record<string, string> = {}

    schema.fields.forEach(field => {
      const validation = validateField(field, formState.values[field.name] || '')
      if (validation.error) {
        allErrors[field.name] = validation.error
      }
      if (validation.warning) {
        allWarnings[field.name] = validation.warning
      }
    })

    setFormState(prev => ({
      ...prev,
      errors: { ...prev.errors, ...allErrors },
      warnings: { ...prev.warnings, ...allWarnings },
      touched: Object.fromEntries(schema.fields.map(f => [f.name, true]))
    }))

    if (Object.keys(allErrors).length === 0) {
      try {
        await onSubmit(formState.values)
      } catch (error) {
        console.error('Form submission error:', error)
      }
    }
  }, [schema.fields, formState.values, validateField, onSubmit])

  // Handle form reset
  const handleReset = useCallback(() => {
    setFormState({
      values: initialValues,
      errors: externalErrors,
      warnings: externalWarnings,
      touched: {},
      isValid: false,
      isDirty: false
    })
    setAiSuggestions({})
    setIsLoadingAI({})
    onReset?.()
  }, [initialValues, externalErrors, externalWarnings, onReset])

  // Group fields by category
  const groupedFields = useMemo(() => {
    const groups: Record<string, FormFieldSchema[]> = {}

    schema.fields.forEach(field => {
      const category = field.category || 'default'
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(field)
    })

    return groups
  }, [schema.fields])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Se încarcă formularul..." />
      </div>
    )
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className={`space-y-8 ${className}`}
    >
      {/* Form Header */}
      <div className="text-center">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
        >
          {schema.title}
        </motion.h2>
        {schema.description && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 dark:text-gray-400"
          >
            {schema.description}
          </motion.p>
        )}
      </div>

      {/* Form Fields */}
      <div className={`grid gap-6 ${
        schema.layout === 'two-column' ? 'md:grid-cols-2' :
        schema.layout === 'auto' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
        'grid-cols-1'
      }`}>
        {Object.entries(groupedFields).map(([category, fields]) => (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {category !== 'default' && (
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                {category}
              </h3>
            )}

            {fields.map((field, index) => (
              <motion.div
                key={field.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <EnhancedFormField
                  label={field.label}
                  error={formState.errors[field.name]}
                  warning={formState.warnings[field.name]}
                  required={field.required}
                  disabled={field.disabled || readOnly}
                  icon={field.icon}
                  maxLength={field.validation?.maxLength}
                  currentLength={formState.values[field.name]?.length || 0}
                  aiSuggestions={enableAI && !!field.aiSuggestions}
                  size="md"
                  variant="card"
                >
                  <FormInput
                    label={field.label}
                    value={formState.values[field.name] || ''}
                    onChange={(value) => handleFieldChange(field.name, value)}
                    onBlur={() => handleFieldBlur(field.name)}
                    error={formState.errors[field.name]}
                    warning={formState.warnings[field.name]}
                    disabled={field.disabled || readOnly}
                    required={field.required}
                    placeholder={field.placeholder}
                    type={field.type}
                    options={field.options}
                    aiSuggestions={aiSuggestions[field.name] || field.aiSuggestions}
                    showAISuggestions={enableAI && !!field.aiSuggestions}
                  />
                </EnhancedFormField>
              </motion.div>
            ))}
          </motion.div>
        ))}
      </div>

      {/* AI Assist Section */}
      {enableAI && onAIAssist && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-medflow-primary/5 to-medflow-secondary/5 rounded-lg p-6 border border-medflow-primary/20"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Brain className="w-6 h-6 text-medflow-primary" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Asistență AI
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            AI-ul poate ajuta cu completarea automată a câmpurilor. Apasă pe iconița AI din fiecare câmp pentru sugestii.
          </p>
          <div className="flex flex-wrap gap-2">
            {schema.fields
              .filter(field => field.aiSuggestions)
              .map(field => (
                <button
                  key={field.name}
                  type="button"
                  onClick={() => handleAIAssist(field.name)}
                  disabled={isLoadingAI[field.name]}
                  className="inline-flex items-center space-x-2 px-3 py-1 bg-medflow-primary/10 text-medflow-primary rounded-lg text-sm hover:bg-medflow-primary/20 transition-colors disabled:opacity-50"
                >
                  {isLoadingAI[field.name] ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Brain className="w-4 h-4" />
                  )}
                  <span>{field.label}</span>
                </button>
              ))}
          </div>
        </motion.div>
      )}

      {/* Form Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700"
      >
        <ButtonGroup>
          <PrimaryButton
            type="submit"
            disabled={isSubmitting || !formState.isValid}
            loading={isSubmitting}
            icon={<Save className="w-4 h-4" />}
          >
            {schema.submitButtonText || 'Salvează'}
          </PrimaryButton>

          {schema.showResetButton && (
            <SecondaryButton
              type="button"
              onClick={handleReset}
              disabled={!formState.isDirty}
              icon={<RotateCcw className="w-4 h-4" />}
            >
              Resetează
            </SecondaryButton>
          )}

          {onCancel && (
            <SecondaryButton
              type="button"
              onClick={onCancel}
              icon={<X className="w-4 h-4" />}
            >
              {schema.cancelButtonText || 'Anulează'}
            </SecondaryButton>
          )}
        </ButtonGroup>
      </motion.div>

      {/* Form Status */}
      <AnimatePresence>
        {formState.isValid && formState.isDirty && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center justify-center space-x-2 text-emerald-600"
          >
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Formularul este valid și gata pentru trimitere</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.form>
  )
}

FormBuilder.displayName = 'FormBuilder'
