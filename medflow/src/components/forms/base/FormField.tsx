/**
 * Base Form Field Component for MedFlow
 * 
 * Features:
 * - Common field wrapper logic for all form inputs
 * - Label, error handling, success states
 * - Preserves ALL current styling classes
 * - Accessibility features
 * 
 * @author MedFlow Team
 * @version 2.0
 */

import React, { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, CheckCircle, Info } from 'lucide-react'

interface FormFieldProps {
  label: string
  required?: boolean
  error?: string
  warning?: string
  children: React.ReactNode
  className?: string
  icon?: React.ReactNode
  maxLength?: number
  currentLength?: number
}

export const FormField = memo<FormFieldProps>(({
  label,
  required = false,
  error,
  warning,
  children,
  className = '',
  icon,
  maxLength,
  currentLength
}: FormFieldProps) => {
  const inputId = `form-field-${label.toLowerCase().replace(/\s+/g, '-')}`
  const hasError = !!error && !warning
  const hasWarning = !!warning && !error
  const hasSuccess = !error && !warning && currentLength !== undefined && currentLength > 0

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
        {children}

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
        {maxLength && currentLength !== undefined && (
          <div className="absolute -bottom-6 right-0 text-xs text-gray-500">
            {currentLength}/{maxLength}
          </div>
        )}
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
})

FormField.displayName = 'FormField'
