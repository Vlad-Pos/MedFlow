/**
 * Report Validation Indicator Component for MedFlow
 * 
 * Real-time validation feedback component that provides:
 * - Visual validation status indicators
 * - Detailed error and warning messages
 * - Field-specific validation feedback
 * - Progress tracking for report completion
 * - Romanian medical validation standards
 * 
 * @author MedFlow Team
 * @version 1.0
 */

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  Clock,
  TrendingUp,
  FileText,
  User,
  Heart,
  Pill,
  Stethoscope
} from 'lucide-react'
import { ReportValidation, ValidationStatus } from '../types/patientReports'
import DesignWorkWrapper from '../../DesignWorkWrapper'

interface ReportValidationIndicatorProps {
  validation: ReportValidation | null
  isValidating?: boolean
  showDetails?: boolean
  className?: string
  compact?: boolean
}

interface FieldValidationProps {
  fieldName: string
  errors: string[]
  warnings: string[]
  isRequired?: boolean
  fieldIcon?: React.ComponentType<{ className?: string }>
}

const FieldValidationIndicator: React.FC<FieldValidationProps> = ({
  fieldName,
  errors,
  warnings,
  isRequired = false,
  fieldIcon: Icon
}) => {
  const hasErrors = errors.length > 0
  const hasWarnings = warnings.length > 0
  const isValid = !hasErrors && !hasWarnings

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
    >
      {Icon && (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          hasErrors 
            ? 'bg-red-100 dark:bg-red-900/20' 
            : hasWarnings 
            ? 'bg-yellow-100 dark:bg-yellow-900/20'
            : 'bg-green-100 dark:bg-green-900/20'
        }`}>
          <Icon className={`w-4 h-4 ${
            hasErrors 
              ? 'text-red-600 dark:text-red-400' 
              : hasWarnings 
              ? 'text-yellow-600 dark:text-yellow-400'
              : 'text-green-600 dark:text-green-400'
          }`} />
        </div>
      )}
      
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-1">
          <h4 className="font-medium text-gray-900 dark:text-white text-sm">
            {fieldName}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </h4>
          
          <div className="flex items-center space-x-1">
            {isValid && (
              <CheckCircle className="w-4 h-4 text-green-500" />
            )}
            {hasWarnings && (
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
            )}
            {hasErrors && (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
          </div>
        </div>
        
        {hasErrors && (
          <div className="space-y-1">
            {errors.map((error, index) => (
              <div key={index} className="flex items-start space-x-2 text-sm text-red-600 dark:text-red-400">
                <XCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            ))}
          </div>
        )}
        
        {hasWarnings && (
          <div className="space-y-1 mt-2">
            {warnings.map((warning, index) => (
              <div key={index} className="flex items-start space-x-2 text-sm text-yellow-600 dark:text-yellow-400">
                <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>{warning}</span>
              </div>
            ))}
          </div>
        )}
        
        {isValid && (
          <div className="text-sm text-green-600 dark:text-green-400">
            ✓ Câmpul este completat corect
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function ReportValidationIndicator({
  validation,
  isValidating = false,
  showDetails = false,
  className = '',
  compact = false
}: ReportValidationIndicatorProps) {
  if (!validation && !isValidating) {
    return null
  }

  if (isValidating) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-spin w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full" />
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Se validează raportul...
        </span>
      </div>
    )
  }

  if (!validation) return null

  const { status, errors, warnings, missingFields } = validation
  const hasErrors = errors.length > 0
  const hasWarnings = warnings.length > 0
  const isValid = status === 'valid'

  // Calculate completion percentage
  const totalPossibleFields = 15 // Estimate based on form structure
  const completedFields = totalPossibleFields - missingFields.length
  const completionPercentage = Math.round((completedFields / totalPossibleFields) * 100)

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {isValid ? (
          <CheckCircle className="w-4 h-4 text-green-500" />
        ) : hasErrors ? (
          <XCircle className="w-4 h-4 text-red-500" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-yellow-500" />
        )}
        
        <span className={`text-sm font-medium ${
          isValid 
            ? 'text-green-600 dark:text-green-400' 
            : hasErrors 
            ? 'text-red-600 dark:text-red-400'
            : 'text-yellow-600 dark:text-yellow-400'
        }`}>
          {isValid ? 'Valid' : hasErrors ? `${errors.length} erori` : `${warnings.length} avertismente`}
        </span>
      </div>
    )
  }

  // Field-specific validation categorization
  const fieldValidations = {
    'Date de bază': {
      icon: User,
      errors: errors.filter(e => e.includes('plângerea') || e.includes('istoric')),
      warnings: warnings.filter(w => w.includes('plângerea') || w.includes('istoric'))
    },
    'Examinare fizică': {
      icon: Stethoscope,
      errors: errors.filter(e => e.includes('examen')),
      warnings: warnings.filter(w => w.includes('examen') || w.includes('vitale'))
    },
    'Diagnostic': {
      icon: Heart,
      errors: errors.filter(e => e.includes('diagnostic')),
      warnings: warnings.filter(w => w.includes('diagnostic'))
    },
    'Tratament': {
      icon: Pill,
      errors: errors.filter(e => e.includes('tratament') || e.includes('medicament')),
      warnings: warnings.filter(w => w.includes('tratament') || w.includes('urmărire'))
    }
  }

  return (
    <DesignWorkWrapper componentName="ReportValidationIndicator">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`space-y-4 ${className}`}
      >
      {/* Overall Status Header */}
      <div className={`p-4 rounded-lg border-2 ${
        isValid 
          ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10'
          : hasErrors 
          ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10'
          : 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/10'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isValid ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : hasErrors ? (
              <XCircle className="w-6 h-6 text-red-600" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            )}
            
            <div>
              <h3 className={`font-semibold ${
                isValid 
                  ? 'text-green-800 dark:text-green-300' 
                  : hasErrors 
                  ? 'text-red-800 dark:text-red-300'
                  : 'text-yellow-800 dark:text-yellow-300'
              }`}>
                {isValid 
                  ? 'Raport valid și complet' 
                  : hasErrors 
                  ? 'Raportul conține erori'
                  : 'Raportul conține avertismente'
                }
              </h3>
              
              <p className={`text-sm ${
                isValid 
                  ? 'text-green-700 dark:text-green-400' 
                  : hasErrors 
                  ? 'text-red-700 dark:text-red-400'
                  : 'text-yellow-700 dark:text-yellow-400'
              }`}>
                {isValid 
                  ? 'Raportul poate fi finalizat' 
                  : hasErrors 
                  ? `${errors.length} erori trebuie corectate`
                  : `${warnings.length} recomandări pentru îmbunătățire`
                }
              </p>
            </div>
          </div>
          
          {/* Completion Progress */}
          <div className="text-right">
            <div className={`text-2xl font-bold ${
              completionPercentage >= 90 
                ? 'text-green-600' 
                : completionPercentage >= 70 
                ? 'text-yellow-600'
                : 'text-red-600'
            }`}>
              {completionPercentage}%
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              completat
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={`h-2 rounded-full ${
                completionPercentage >= 90 
                  ? 'bg-green-500' 
                  : completionPercentage >= 70 
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Detailed Field Validation */}
      {showDetails && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 dark:text-white flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Validare pe secțiuni</span>
          </h4>
          
          {Object.entries(fieldValidations).map(([fieldName, validation]) => {
            const hasFieldErrors = validation.errors.length > 0
            const hasFieldWarnings = validation.warnings.length > 0
            
            if (!hasFieldErrors && !hasFieldWarnings) {
              return (
                <FieldValidationIndicator
                  key={fieldName}
                  fieldName={fieldName}
                  errors={[]}
                  warnings={[]}
                  fieldIcon={validation.icon}
                />
              )
            }
            
            return (
              <FieldValidationIndicator
                key={fieldName}
                fieldName={fieldName}
                errors={validation.errors}
                warnings={validation.warnings}
                isRequired={hasFieldErrors}
                fieldIcon={validation.icon}
              />
            )
          })}
        </div>
      )}

      {/* Missing Fields Summary */}
      {missingFields.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
        >
          <div className="flex items-start space-x-2">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-300 text-sm">
                Câmpuri recomandate
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                Următoarele câmpuri ar putea îmbunătăți calitatea raportului:
              </p>
              <ul className="text-sm text-blue-600 dark:text-blue-400 mt-2 space-y-1">
                {missingFields.slice(0, 5).map((field, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <span className="w-1 h-1 bg-blue-500 rounded-full" />
                    <span>{field}</span>
                  </li>
                ))}
                {missingFields.length > 5 && (
                  <li className="text-blue-500">
                    și încă {missingFields.length - 5} câmpuri...
                  </li>
                )}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* Last Validation Info */}
      {validation.lastValidated && (
        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
          <Clock className="w-3 h-3" />
          <span>
            Ultima validare: {validation.lastValidated.toDate().toLocaleString('ro-RO')}
          </span>
          {validation.validatedBy && (
            <span>de către {validation.validatedBy}</span>
          )}
        </div>
      )}
      </motion.div>
    </DesignWorkWrapper>
  )
}
