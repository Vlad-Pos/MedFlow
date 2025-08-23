/**
 * Enhanced Form Field Component for MedFlow UI Library
 *
 * Features:
 * - Professional medical styling with MedFlow branding
 * - Enhanced accessibility and screen reader support
 * - Integrated with new UI component library
 * - Multiple validation states and feedback
 * - Romanian localization for medical professionals
 * - Responsive design for all screen sizes
 * - TypeScript support with comprehensive props
 * - Animation support for better UX
 *
 * @author MedFlow UI Team
 * @version 2.0
 */

import React, { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, CheckCircle, Info, X, Brain } from 'lucide-react'

export interface EnhancedFormFieldProps {
  label: string
  children: ReactNode
  error?: string
  warning?: string
  info?: string
  success?: string
  required?: boolean
  disabled?: boolean
  icon?: ReactNode
  maxLength?: number
  currentLength?: number
  aiSuggestions?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'floating' | 'minimal' | 'card'
  showCharCount?: boolean
  animate?: boolean
}

const sizeConfig = {
  sm: {
    label: 'text-sm',
    input: 'text-sm',
    padding: 'py-2 px-3',
    icon: 'w-4 h-4'
  },
  md: {
    label: 'text-base',
    input: 'text-base',
    padding: 'py-3 px-4',
    icon: 'w-5 h-5'
  },
  lg: {
    label: 'text-lg',
    input: 'text-lg',
    padding: 'py-4 px-5',
    icon: 'w-6 h-6'
  }
}

export const EnhancedFormField: React.FC<EnhancedFormFieldProps> = ({
  label,
  children,
  error,
  warning,
  info,
  success,
  required = false,
  disabled = false,
  icon,
  maxLength,
  currentLength = 0,
  aiSuggestions = false,
  className = '',
  size = 'md',
  variant = 'default',
  showCharCount = true,
  animate = true
}) => {
  const hasError = !!error
  const hasWarning = !!warning && !error
  const hasSuccess = !!success && !error && !warning
  const hasInfo = !!info && !error && !warning && !success

  const config = sizeConfig[size]

  const getStatusColor = () => {
    if (hasError) return 'text-red-600 border-red-300 focus-within:border-red-500 focus-within:ring-red-500/20'
    if (hasWarning) return 'text-orange-600 border-orange-300 focus-within:border-orange-500 focus-within:ring-orange-500/20'
    if (hasSuccess) return 'text-emerald-600 border-emerald-300 focus-within:border-emerald-500 focus-within:ring-emerald-500/20'
    if (hasInfo) return 'text-blue-600 border-blue-300 focus-within:border-blue-500 focus-within:ring-blue-500/20'
    return 'text-gray-600 border-gray-300 focus-within:border-medflow-primary focus-within:ring-medflow-primary/20'
  }

  const getStatusIcon = () => {
    if (hasError) return <AlertCircle className={`${config.icon} text-red-500`} />
    if (hasWarning) return <AlertCircle className={`${config.icon} text-orange-500`} />
    if (hasSuccess) return <CheckCircle className={`${config.icon} text-emerald-500`} />
    if (hasInfo) return <Info className={`${config.icon} text-blue-500`} />
    if (aiSuggestions) return <Brain className={`${config.icon} text-medflow-primary`} />
    return null
  }

  const getStatusMessage = () => {
    if (hasError) return { message: error, type: 'error' as const }
    if (hasWarning) return { message: warning, type: 'warning' as const }
    if (hasSuccess) return { message: success, type: 'success' as const }
    if (hasInfo) return { message: info, type: 'info' as const }
    return null
  }

  const status = getStatusMessage()

  const fieldContent = (
    <div className={`relative ${className}`}>
      {/* Label */}
      {label && variant !== 'minimal' && (
        <motion.label
          initial={animate ? { opacity: 0, y: -10 } : undefined}
          animate={animate ? { opacity: 1, y: 0 } : undefined}
          className={`block ${config.label} font-medium mb-2 ${
            hasError ? 'text-red-700' :
            hasWarning ? 'text-orange-700' :
            hasSuccess ? 'text-emerald-700' :
            hasInfo ? 'text-blue-700' : 'text-gray-700'
          } dark:text-gray-300`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
          {aiSuggestions && <Brain className="inline w-4 h-4 ml-2 text-medflow-primary" />}
        </motion.label>
      )}

      {/* Field Container */}
      <motion.div
        initial={animate ? { opacity: 0, y: 10 } : undefined}
        animate={animate ? { opacity: 1, y: 0 } : undefined}
        className={`relative rounded-lg border transition-all duration-200 ${getStatusColor()} ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${
          variant === 'card' ? 'bg-white dark:bg-gray-800 shadow-sm' : ''
        }`}
      >
        {/* Icon */}
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            {icon}
          </div>
        )}

        {/* Children (Input Elements) */}
        <div className={`${icon ? 'pl-10' : ''} ${getStatusIcon() ? 'pr-10' : ''}`}>
          {children}
        </div>

        {/* Status Icon */}
        {getStatusIcon() && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {getStatusIcon()}
          </div>
        )}
      </motion.div>

      {/* Character Count */}
      {showCharCount && maxLength && (
        <motion.div
          initial={animate ? { opacity: 0 } : undefined}
          animate={animate ? { opacity: 1 } : undefined}
          className="flex justify-end mt-1"
        >
          <span className={`text-xs ${
            currentLength > maxLength * 0.9 ? 'text-red-500' :
            currentLength > maxLength * 0.7 ? 'text-orange-500' : 'text-gray-500'
          }`}>
            {currentLength}/{maxLength}
          </span>
        </motion.div>
      )}

      {/* Status Message */}
      <AnimatePresence>
        {status && (
          <motion.div
            initial={animate ? { opacity: 0, y: -10 } : undefined}
            animate={animate ? { opacity: 1, y: 0 } : undefined}
            exit={animate ? { opacity: 0, y: -10 } : undefined}
            className={`mt-2 text-sm flex items-start space-x-2 ${
              status.type === 'error' ? 'text-red-600' :
              status.type === 'warning' ? 'text-orange-600' :
              status.type === 'success' ? 'text-emerald-600' :
              'text-blue-600'
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {status.type === 'error' && <AlertCircle className="w-4 h-4" />}
              {status.type === 'warning' && <AlertCircle className="w-4 h-4" />}
              {status.type === 'success' && <CheckCircle className="w-4 h-4" />}
              {status.type === 'info' && <Info className="w-4 h-4" />}
            </div>
            <span>{status.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  return fieldContent
}

// Specialized form field components
export const FloatingLabelFormField: React.FC<Omit<EnhancedFormFieldProps, 'variant'>> = (props) => (
  <EnhancedFormField {...props} variant="floating" />
)

export const MinimalFormField: React.FC<Omit<EnhancedFormFieldProps, 'variant'>> = (props) => (
  <EnhancedFormField {...props} variant="minimal" />
)

export const CardFormField: React.FC<Omit<EnhancedFormFieldProps, 'variant'>> = (props) => (
  <EnhancedFormField {...props} variant="card" />
)

export const AIFormField: React.FC<Omit<EnhancedFormFieldProps, 'aiSuggestions'>> = (props) => (
  <EnhancedFormField {...props} aiSuggestions={true} />
)

EnhancedFormField.displayName = 'EnhancedFormField'
FloatingLabelFormField.displayName = 'FloatingLabelFormField'
MinimalFormField.displayName = 'MinimalFormField'
CardFormField.displayName = 'CardFormField'
AIFormField.displayName = 'AIFormField'
