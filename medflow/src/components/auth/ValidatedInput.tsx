/**
 * Validated Input Component for MedFlow Authentication
 * 
 * Provides comprehensive input validation with:
 * - Real-time validation feedback
 * - Romanian error messages
 * - Accessibility features
 * - MedFlow branding
 * - Medical professional focus
 * 
 * @author MedFlow Team
 * @version 2.0
 */

import { useState, useEffect, forwardRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, AlertCircle, CheckCircle2, User, Mail, Lock, UserCheck } from 'lucide-react'
import type { AuthValidationResult } from '../../utils/authValidation'

interface ValidatedInputProps {
  // Input props
  type: 'text' | 'email' | 'password' | 'select'
  name: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  
  // Validation
  validateFn?: (value: string) => AuthValidationResult
  required?: boolean
  disabled?: boolean
  
  // Display
  label: string
  placeholder?: string
  autoComplete?: string
  options?: { value: string; label: string }[] // For select inputs
  
  // UI customization
  icon?: 'user' | 'email' | 'lock' | 'role' | 'none'
  showToggle?: boolean // For password fields
  className?: string
  
  // Accessibility
  ariaLabel?: string
  ariaDescribedBy?: string
  
  // AI integration preparation
  aiSuggestions?: boolean // Placeholder for future AI assistance
}

// Icon mapping
const iconMap = {
  user: User,
  email: Mail,
  lock: Lock,
  role: UserCheck,
  none: null
}

export default forwardRef<HTMLInputElement | HTMLSelectElement, ValidatedInputProps>(
  function ValidatedInput({
    type,
    name,
    value,
    onChange,
    onBlur,
    validateFn,
    required = false,
    disabled = false,
    label,
    placeholder,
    autoComplete,
    options,
    icon = 'none',
    showToggle = false,
    className = '',
    ariaLabel,
    ariaDescribedBy,
    aiSuggestions = false, // Future AI integration
    ...props
  }, ref) {
    const [showPassword, setShowPassword] = useState(false)
    const [validation, setValidation] = useState<AuthValidationResult>({ isValid: true, errors: [] })
    const [touched, setTouched] = useState(false)
    const [focused, setFocused] = useState(false)
    
    // Real-time validation
    useEffect(() => {
      if (validateFn && touched) {
        const result = validateFn(value)
        setValidation(result)
      }
    }, [value, validateFn, touched])
    
    // Handle blur event
    const handleBlur = () => {
      setTouched(true)
      setFocused(false)
      if (validateFn) {
        const result = validateFn(value)
        setValidation(result)
      }
      onBlur?.()
    }
    
    // Handle focus event
    const handleFocus = () => {
      setFocused(true)
    }
    
    // Determine input state classes
    const getInputStateClasses = () => {
      const baseClasses = 'input transition-all duration-200'
      
      if (disabled) {
        return `${baseClasses} opacity-60 cursor-not-allowed`
      }
      
      if (touched && !validation.isValid) {
        return `${baseClasses} border-red-300 focus:border-red-500 focus:ring-red-500`
      }
      
      if (touched && validation.isValid && value) {
        return `${baseClasses} border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500`
      }
      
      return `${baseClasses} border-gray-300 focus:border-medflow-primary focus:ring-medflow-primary`
    }
    
    const IconComponent = iconMap[icon]
    const inputType = type === 'password' && showPassword ? 'text' : type
    const hasError = touched && !validation.isValid
    const hasSuccess = touched && validation.isValid && value
    
    return (
      <div className={`space-y-2 ${className}`}>
        {/* Label */}
        <label 
          htmlFor={name}
          className={`label flex items-center space-x-2 ${required ? 'after:content-["*"] after:text-red-500 after:ml-1' : ''}`}
        >
          {IconComponent && (
            <IconComponent 
              className={`h-4 w-4 ${focused ? 'text-medflow-primary' : 'text-gray-500'} transition-colors`}
              aria-hidden="true"
            />
          )}
          <span>{label}</span>
          {aiSuggestions && (
            <div className="text-xs text-medflow-primary opacity-60" title="Asistență AI disponibilă">
              🤖
            </div>
          )}
        </label>
        
        {/* Input container */}
        <div className="relative">
          {type === 'select' ? (
            // Select dropdown
            <select
              ref={ref as React.Ref<HTMLSelectElement>}
              id={name}
              name={name}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onBlur={handleBlur}
              onFocus={handleFocus}
              disabled={disabled}
              required={required}
              className={getInputStateClasses()}
              aria-label={ariaLabel || label}
              aria-describedby={ariaDescribedBy}
              aria-invalid={hasError}
              {...props}
            >
              <option value="">{placeholder || `Selectați ${label.toLowerCase()}`}</option>
              {options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            // Text/email/password input
            <input
              ref={ref as React.Ref<HTMLInputElement>}
              type={inputType}
              id={name}
              name={name}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onBlur={handleBlur}
              onFocus={handleFocus}
              placeholder={placeholder}
              autoComplete={autoComplete}
              disabled={disabled}
              required={required}
              className={`${getInputStateClasses()} ${showToggle ? 'pr-12' : 'pr-10'}`}
              aria-label={ariaLabel || label}
              aria-describedby={ariaDescribedBy}
              aria-invalid={hasError}
              {...props}
            />
          )}
          
          {/* Status icon */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {hasError && (
              <AlertCircle 
                className="h-5 w-5 text-red-500" 
                aria-hidden="true"
              />
            )}
            {hasSuccess && (
              <CheckCircle2 
                className="h-5 w-5 text-emerald-500" 
                aria-hidden="true"
              />
            )}
            
            {/* Password toggle */}
            {showToggle && type === 'password' && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="ml-2 p-1 text-gray-500 hover:text-gray-700 focus:outline-none focus:text-medflow-primary transition-colors"
                aria-label={showPassword ? 'Ascunde parola' : 'Arată parola'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        </div>
        
        {/* Validation messages */}
        <AnimatePresence mode="wait">
          {touched && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-1"
            >
              {/* Error messages */}
              {validation.errors.map((error, index) => (
                <motion.p
                  key={`error-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.1 }}
                  className="text-sm text-red-600 dark:text-red-400 flex items-center space-x-2"
                  role="alert"
                >
                  <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                  <span>{error}</span>
                </motion.p>
              ))}
              
              {/* Warning messages */}
              {validation.warnings?.map((warning, index) => (
                <motion.p
                  key={`warning-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.1 }}
                  className="text-sm text-orange-600 dark:text-orange-400 flex items-center space-x-2"
                >
                  <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                  <span>{warning}</span>
                </motion.p>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* AI assistance placeholder */}
        {aiSuggestions && focused && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-xs text-medflow-primary/70 bg-medflow-primary/5 p-2 rounded-md border border-medflow-primary/10"
          >
            🤖 Asistență AI: Va fi disponibilă în curând pentru sugestii și completare automată
          </motion.div>
        )}
      </div>
    )
  }
)
