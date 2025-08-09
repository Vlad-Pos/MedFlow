/**
 * Specialized Form Input Components for MedFlow Appointment Management
 * 
 * Features:
 * - Medical-themed validation with real-time feedback
 * - Romanian localization for medical professionals
 * - MedFlow branding and accessibility
 * - AI integration placeholders for smart suggestions
 * - Professional medical form styling
 * 
 * @author MedFlow Team
 * @version 2.0
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Calendar, 
  Clock, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Brain,
  Zap,
  Eye,
  EyeOff
} from 'lucide-react'
import { ValidationResult } from '../utils/appointmentValidation'

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

/**
 * Enhanced Text Input with Medical Validation
 */
export function MedicalTextInput({
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
}: TextInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const inputId = `medical-input-${label.toLowerCase().replace(/\s+/g, '-')}`
  const hasError = !!error && !warning
  const hasWarning = !!warning && !error
  const hasSuccess = !error && !warning && value.trim().length > 0

  const handleFocus = () => {
    setIsFocused(true)
    setShowSuggestions(showAISuggestions && aiSuggestions.length > 0)
    onFocus?.()
  }

  const handleBlur = () => {
    setIsFocused(false)
    setTimeout(() => setShowSuggestions(false), 200) // Delay to allow suggestion clicks
    onBlur?.()
  }

  const applySuggestion = (suggestion: string) => {
    onChange(suggestion)
    setShowSuggestions(false)
  }

  return (
    <div className={`relative ${className}`}>
      <label 
        htmlFor={inputId}
        className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        {icon && <span className="text-medflow-primary">{icon}</span>}
        <span>{label}</span>
        {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
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

        {/* Success/Error/Warning Icon */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {hasError && (
            <AlertTriangle className="w-5 h-5 text-red-500" />
          )}
          {hasWarning && (
            <Info className="w-5 h-5 text-orange-500" />
          )}
          {hasSuccess && (
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          )}
        </div>

        {/* Character Counter */}
        {maxLength && (
          <div className="absolute -bottom-6 right-0 text-xs text-gray-500">
            {value.length}/{maxLength}
          </div>
        )}
      </div>

      {/* AI Suggestions */}
      <AnimatePresence>
        {showSuggestions && aiSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
          >
            <div className="p-2 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-2 text-xs font-medium text-medflow-primary">
                <Brain className="w-3 h-3" />
                <span>Sugestii AI</span>
              </div>
            </div>
            <div className="max-h-40 overflow-y-auto">
              {aiSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => applySuggestion(suggestion)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error/Warning Message */}
      <AnimatePresence>
        {(error || warning) && (
          <motion.div
            id={`${inputId}-message`}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className={`mt-2 flex items-start space-x-2 text-sm ${
              hasError ? 'text-red-600' : 'text-orange-600'
            }`}
          >
            {hasError ? (
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            ) : (
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            )}
            <span>{error || warning}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Enhanced TextArea for Medical Notes and Symptoms
 */
export function MedicalTextArea({
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
}: TextAreaProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const inputId = `medical-textarea-${label.toLowerCase().replace(/\s+/g, '-')}`
  const hasError = !!error && !warning
  const hasWarning = !!warning && !error
  const hasSuccess = !error && !warning && value.trim().length > 0

  const handleFocus = () => {
    setIsFocused(true)
    setShowSuggestions(showAISuggestions && aiSuggestions.length > 0)
    onFocus?.()
  }

  const handleBlur = () => {
    setIsFocused(false)
    setTimeout(() => setShowSuggestions(false), 200)
    onBlur?.()
  }

  const applySuggestion = (suggestion: string) => {
    const newValue = value + (value ? ' ' : '') + suggestion
    onChange(newValue)
    setShowSuggestions(false)
  }

  return (
    <div className={`relative ${className}`}>
      <label 
        htmlFor={inputId}
        className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        {icon && <span className="text-medflow-primary">{icon}</span>}
        <span>{label}</span>
        {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
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

        {/* Character Counter */}
        {maxLength && (
          <div className="absolute -bottom-6 right-0 text-xs text-gray-500">
            {value.length}/{maxLength}
          </div>
        )}
      </div>

      {/* AI Suggestions for Medical Context */}
      <AnimatePresence>
        {showSuggestions && aiSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
          >
            <div className="p-2 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-2 text-xs font-medium text-medflow-primary">
                <Brain className="w-3 h-3" />
                <span>Sugestii AI pentru descrierea medicală</span>
              </div>
            </div>
            <div className="max-h-40 overflow-y-auto">
              {aiSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => applySuggestion(suggestion)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error/Warning Message */}
      <AnimatePresence>
        {(error || warning) && (
          <motion.div
            id={`${inputId}-message`}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className={`mt-2 flex items-start space-x-2 text-sm ${
              hasError ? 'text-red-600' : 'text-orange-600'
            }`}
          >
            {hasError ? (
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            ) : (
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            )}
            <span>{error || warning}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Enhanced DateTime Input for Medical Appointments
 */
export function MedicalDateTimeInput({
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
}: DateTimeInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)

  const inputId = `medical-datetime-${label.toLowerCase().replace(/\s+/g, '-')}`
  const hasError = !!error && !warning
  const hasWarning = !!warning && !error
  const hasSuccess = !error && !warning && value.trim().length > 0

  const getIcon = () => {
    switch (type) {
      case 'date': return <Calendar className="w-4 h-4" />
      case 'time': return <Clock className="w-4 h-4" />
      default: return <Calendar className="w-4 h-4" />
    }
  }

  const handleFocus = () => {
    setShowSuggestions(showAISuggestions && aiSuggestions.length > 0)
    onFocus?.()
  }

  const handleBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200)
    onBlur?.()
  }

  const applySuggestion = (suggestion: string) => {
    onChange(suggestion)
    setShowSuggestions(false)
  }

  return (
    <div className={`relative ${className}`}>
      <label 
        htmlFor={inputId}
        className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        <span className="text-medflow-primary">{getIcon()}</span>
        <span>{label}</span>
        {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
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

        {/* Success/Error/Warning Icon */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {hasError && (
            <AlertTriangle className="w-5 h-5 text-red-500" />
          )}
          {hasWarning && (
            <Info className="w-5 h-5 text-orange-500" />
          )}
          {hasSuccess && (
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          )}
        </div>
      </div>

      {/* AI Time Suggestions */}
      <AnimatePresence>
        {showSuggestions && aiSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
          >
            <div className="p-2 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-2 text-xs font-medium text-medflow-primary">
                <Zap className="w-3 h-3" />
                <span>Ore optime sugerate de AI</span>
              </div>
            </div>
            <div className="max-h-40 overflow-y-auto">
              {aiSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => applySuggestion(suggestion)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error/Warning Message */}
      <AnimatePresence>
        {(error || warning) && (
          <motion.div
            id={`${inputId}-message`}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className={`mt-2 flex items-start space-x-2 text-sm ${
              hasError ? 'text-red-600' : 'text-orange-600'
            }`}
          >
            {hasError ? (
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            ) : (
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            )}
            <span>{error || warning}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Enhanced Select Input for Status and Categories
 */
export function MedicalSelectInput({
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
}: SelectInputProps) {
  const inputId = `medical-select-${label.toLowerCase().replace(/\s+/g, '-')}`
  const hasError = !!error && !warning
  const hasWarning = !!warning && !error
  const hasSuccess = !error && !warning && value.trim().length > 0

  return (
    <div className={`relative ${className}`}>
      <label 
        htmlFor={inputId}
        className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        {icon && <span className="text-medflow-primary">{icon}</span>}
        <span>{label}</span>
        {required && <span className="text-red-500">*</span>}
      </label>

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

      {/* Error/Warning Message */}
      <AnimatePresence>
        {(error || warning) && (
          <motion.div
            id={`${inputId}-message`}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className={`mt-2 flex items-start space-x-2 text-sm ${
              hasError ? 'text-red-600' : 'text-orange-600'
            }`}
          >
            {hasError ? (
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            ) : (
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            )}
            <span>{error || warning}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
