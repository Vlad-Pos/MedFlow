/**
 * Unified Form Input Component for MedFlow
 * 
 * Features:
 * - Supports ALL input types: text, textarea, select, date, time, datetime-local
 * - Maintains EXACT same props interface as current components
 * - Preserves ALL current styling and behavior
 * - Handles AI suggestions identically
 * - Maintains ALL accessibility features
 * 
 * @author MedFlow Team
 * @version 2.0
 */

import React, { useState, memo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Zap } from 'lucide-react'
import { FormField } from './FormField'

interface BaseInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  warning?: string
  disabled?: boolean
  required?: boolean
  placeholder?: string
  className?: string
  onBlur?: () => void
  onFocus?: () => void
  aiSuggestions?: string[]
  showAISuggestions?: boolean
}

interface TextInputProps extends BaseInputProps {
  type?: 'text' | 'email' | 'tel'
  maxLength?: number
  icon?: React.ReactNode
  autoComplete?: string
  pattern?: string
}

interface DateTimeInputProps extends BaseInputProps {
  type: 'date' | 'time' | 'datetime-local'
  min?: string
  max?: string
  step?: string
  icon?: React.ReactNode
}

interface TextAreaProps extends BaseInputProps {
  rows?: number
  maxLength?: number
  resize?: boolean
  icon?: React.ReactNode
}

interface DateTimeInputProps extends BaseInputProps {
  type: 'date' | 'time' | 'datetime-local'
  min?: string
  max?: string
  step?: string
}

interface SelectInputProps extends BaseInputProps {
  options: { value: string; label: string; icon?: React.ReactNode }[]
  icon?: React.ReactNode
}

type FormInputProps = 
  | (TextInputProps & { type?: 'text' | 'email' | 'tel' })
  | (TextAreaProps & { rows: number })
  | (DateTimeInputProps & { type: 'date' | 'time' | 'datetime-local' })
  | (SelectInputProps & { options: { value: string; label: string; icon?: React.ReactNode }[] })

/**
 * Unified Form Input Component
 */
export const FormInput = memo<FormInputProps>((props) => {
  // Determine input type based on props
  if ('options' in props && props.options) {
    return <SelectInput {...props as SelectInputProps} />
  }
  
  if ('rows' in props && props.rows) {
    return <TextAreaInput {...props as TextAreaProps} />
  }
  
  if ('type' in props && props.type && (props.type === 'date' || props.type === 'time' || props.type === 'datetime-local')) {
    return <DateTimeInput {...props as DateTimeInputProps} />
  }
  
  return <TextInput {...props as TextInputProps} />
})

FormInput.displayName = 'FormInput'

/**
 * Text Input Component
 */
const TextInput = memo<TextInputProps>(({
  label,
  value,
  onChange,
  error,
  warning,
  disabled = false,
  required = false,
  placeholder,
  className = '',
  onBlur,
  onFocus,
  type = 'text',
  maxLength,
  icon,
  autoComplete,
  pattern,
  aiSuggestions = [],
  showAISuggestions = false
}: TextInputProps) => {
  const [isFocused, setIsFocused] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const inputId = `form-input-${label.toLowerCase().replace(/\s+/g, '-')}`

  const handleFocus = useCallback(() => {
    setIsFocused(true)
    setShowSuggestions(showAISuggestions && aiSuggestions.length > 0)
    onFocus?.()
  }, [showAISuggestions, aiSuggestions.length, onFocus])

  const handleBlur = useCallback(() => {
    setIsFocused(false)
    setTimeout(() => setShowSuggestions(false), 200)
    onBlur?.()
  }, [onBlur])

  const applySuggestion = useCallback((suggestion: string) => {
    onChange(suggestion)
    setShowSuggestions(false)
  }, [onChange])

  const hasError = !!error && !warning
  const hasWarning = !!warning && !error
  const hasSuccess = !error && !warning && value.trim().length > 0

  return (
    <FormField
      label={label}
      required={required}
      error={error}
      warning={warning}
      className={className}
      icon={icon}
      maxLength={maxLength}
      currentLength={value.length}
    >
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder={placeholder}
        maxLength={maxLength}
        autoComplete={autoComplete}
        pattern={pattern}
        required={required}
        className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${
          hasError
            ? 'border-red-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500'
            : hasWarning
            ? 'border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500'
            : hasSuccess
            ? 'border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500'
            : 'border-gray-300 focus:ring-2 focus:ring-medflow-primary/20 focus:border-medflow-primary'
        } dark:bg-gray-800 dark:border-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
        aria-describedby={error || warning ? `${inputId}-message` : undefined}
        aria-invalid={hasError}
      />

      {/* AI Suggestions */}
      <AISuggestions
        show={showSuggestions}
        suggestions={aiSuggestions}
        onApply={applySuggestion}
        type="text"
      />
    </FormField>
  )
})

TextInput.displayName = 'TextInput'

/**
 * TextArea Input Component
 */
const TextAreaInput = memo<TextAreaProps>(({
  label,
  value,
  onChange,
  error,
  warning,
  disabled = false,
  required = false,
  placeholder,
  className = '',
  onBlur,
  onFocus,
  rows = 4,
  maxLength,
  resize = false,
  icon,
  aiSuggestions = [],
  showAISuggestions = false
}: TextAreaProps) => {
  const [isFocused, setIsFocused] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const inputId = `form-textarea-${label.toLowerCase().replace(/\s+/g, '-')}`

  const handleFocus = useCallback(() => {
    setIsFocused(true)
    setShowSuggestions(showAISuggestions && aiSuggestions.length > 0)
    onFocus?.()
  }, [showAISuggestions, aiSuggestions.length, onFocus])

  const handleBlur = useCallback(() => {
    setIsFocused(false)
    setTimeout(() => setShowSuggestions(false), 200)
    onBlur?.()
  }, [onBlur])

  const applySuggestion = useCallback((suggestion: string) => {
    const newValue = value + (value ? ' ' : '') + suggestion
    onChange(newValue)
    setShowSuggestions(false)
  }, [value, onChange])

  const hasError = !!error && !warning
  const hasWarning = !!warning && !error
  const hasSuccess = !error && !warning && value.trim().length > 0

  return (
    <FormField
      label={label}
      required={required}
      error={error}
      warning={warning}
      className={className}
      icon={icon}
      maxLength={maxLength}
      currentLength={value.length}
    >
      <textarea
        id={inputId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        required={required}
        className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${
          resize ? 'resize-y' : 'resize-none'
        } ${
          hasError
            ? 'border-red-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500'
            : hasWarning
            ? 'border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500'
            : hasSuccess
            ? 'border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500'
            : 'border-gray-300 focus:ring-2 focus:ring-medflow-primary/20 focus:border-medflow-primary'
        } dark:bg-gray-800 dark:border-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
        aria-describedby={error || warning ? `${inputId}-message` : undefined}
        aria-invalid={hasError}
      />

      {/* AI Suggestions */}
      <AISuggestions
        show={showSuggestions}
        suggestions={aiSuggestions}
        onApply={applySuggestion}
        type="textarea"
      />
    </FormField>
  )
})

TextAreaInput.displayName = 'TextAreaInput'

/**
 * DateTime Input Component
 */
const DateTimeInput = memo<DateTimeInputProps>(({
  label,
  value,
  onChange,
  error,
  warning,
  disabled = false,
  required = false,
  placeholder,
  className = '',
  onBlur,
  onFocus,
  type,
  min,
  max,
  step,
  aiSuggestions = [],
  showAISuggestions = false
}: DateTimeInputProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false)

  const inputId = `form-datetime-${label.toLowerCase().replace(/\s+/g, '-')}`

  const getIcon = useCallback(() => {
    switch (type) {
      case 'date': return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
      case 'time': return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      default: return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
    }
  }, [type])

  const handleFocus = useCallback(() => {
    setShowSuggestions(showAISuggestions && aiSuggestions.length > 0)
    onFocus?.()
  }, [showAISuggestions, aiSuggestions.length, onFocus])

  const handleBlur = useCallback(() => {
    setTimeout(() => setShowSuggestions(false), 200)
    onBlur?.()
  }, [onBlur])

  const applySuggestion = useCallback((suggestion: string) => {
    onChange(suggestion)
    setShowSuggestions(false)
  }, [onChange])

  const hasError = !!error && !warning
  const hasWarning = !!warning && !error
  const hasSuccess = !error && !warning && value.trim().length > 0

  return (
    <FormField
      label={label}
      required={required}
      error={error}
      warning={warning}
      className={className}
      icon={getIcon()}
    >
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        required={required}
        className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${
          hasError
            ? 'border-red-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500'
            : hasWarning
            ? 'border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500'
            : hasSuccess
            ? 'border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500'
            : 'border-gray-300 focus:ring-2 focus:ring-medflow-primary/20 focus:border-medflow-primary'
        } dark:bg-gray-800 dark:border-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
        aria-describedby={error || warning ? `${inputId}-message` : undefined}
        aria-invalid={hasError}
      />

      {/* AI Time Suggestions */}
      <AISuggestions
        show={showSuggestions}
        suggestions={aiSuggestions}
        onApply={applySuggestion}
        type="datetime"
      />
    </FormField>
  )
})

DateTimeInput.displayName = 'DateTimeInput'

/**
 * Select Input Component
 */
const SelectInput = memo<SelectInputProps>(({
  label,
  value,
  onChange,
  error,
  warning,
  disabled = false,
  required = false,
  placeholder = 'Selectați o opțiune',
  className = '',
  onBlur,
  onFocus,
  options,
  icon
}: SelectInputProps) => {
  const inputId = `form-select-${label.toLowerCase().replace(/\s+/g, '-')}`

  const hasError = !!error && !warning
  const hasWarning = !!warning && !error
  const hasSuccess = !error && !warning && value.trim().length > 0

  return (
    <FormField
      label={label}
      required={required}
      error={error}
      warning={warning}
      className={className}
      icon={icon}
    >
      <div className="relative">
        <select
          id={inputId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 appearance-none ${
            hasError
              ? 'border-red-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500'
              : hasWarning
              ? 'border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500'
              : hasSuccess
              ? 'border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500'
              : 'border-gray-300 focus:ring-2 focus:ring-medflow-primary/20 focus:border-medflow-primary'
          } dark:bg-gray-800 dark:border-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-describedby={error || warning ? `${inputId}-message` : undefined}
          aria-invalid={hasError}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Dropdown Icon */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </FormField>
  )
})

SelectInput.displayName = 'SelectInput'

/**
 * AI Suggestions Component
 */
interface AISuggestionsProps {
  show: boolean
  suggestions: string[]
  onApply: (suggestion: string) => void
  type: 'text' | 'textarea' | 'datetime'
}

const AISuggestions = memo<AISuggestionsProps>(({ show, suggestions, onApply, type }: AISuggestionsProps) => {
  if (!show || suggestions.length === 0) return null

  const getTitle = useCallback(() => {
    switch (type) {
      case 'text': return 'Sugestii AI'
      case 'textarea': return 'Sugestii AI pentru descrierea medicală'
      case 'datetime': return 'Ore optime sugerate de AI'
      default: return 'Sugestii AI'
    }
  }, [type])

  const getIcon = useCallback(() => {
    switch (type) {
      case 'datetime': return <Zap className="w-3 h-3" />
      default: return <Brain className="w-3 h-3" />
    }
  }, [type])

  const handleSuggestionClick = useCallback((suggestion: string) => {
    onApply(suggestion)
  }, [onApply])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
      >
        <div className="p-2 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-2 text-xs font-medium text-medflow-primary">
            {getIcon()}
            <span>{getTitle()}</span>
          </div>
        </div>
        <div className="max-h-40 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  )
})

AISuggestions.displayName = 'AISuggestions'
