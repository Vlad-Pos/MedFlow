import React, { forwardRef, memo } from 'react'
import { motion } from 'framer-motion'
import { LucideIcon, ChevronDown, Stethoscope, Heart, AlertTriangle, Calendar } from 'lucide-react'
import { MedicalSelectProps, MedicalSelectState } from './MedicalSelect.types'
import {
  MEDICAL_SELECT_BASE_CLASSES,
  MEDICAL_SELECT_SIZE_CLASSES,
  MEDICAL_SELECT_VARIANT_CLASSES,
  MEDICAL_SELECT_STATE_CLASSES,
  MEDICAL_SELECT_WIDTH_CLASSES,
  MEDICAL_SELECT_LABEL_CLASSES,
  MEDICAL_SELECT_REQUIRED_INDICATOR,
  MEDICAL_SELECT_ICON_CLASSES,
  MEDICAL_SELECT_ICON_POSITION_CLASSES,
  MEDICAL_SELECT_HELPER_TEXT_CLASSES,
  MEDICAL_SELECT_ERROR_CLASSES,
  MEDICAL_SELECT_SUCCESS_CLASSES,
  MEDICAL_SELECT_WARNING_CLASSES,
  MEDICAL_SELECT_HELPER_CLASSES,
  MEDICAL_SELECT_STATUS_INDICATOR,
  MEDICAL_SELECT_STATUS_INDICATOR_COLORS,
  MEDICAL_SELECT_OPTION_CLASSES,
  MEDICAL_SELECT_PLACEHOLDER_CLASSES,
  MEDICAL_SELECT_MEDICAL_ICON_CLASSES
} from './MedicalSelect.styles'

const MedicalSelect = memo(forwardRef<HTMLSelectElement, MedicalSelectProps>(({
  label,
  error,
  success,
  warning,
  helperText,
  options,
  placeholder,
  size = 'md',
  variant = 'medical',
  fullWidth = false,
  required = false,
  disabled = false,
  icon: Icon = ChevronDown,
  medicalIcon,
  medicalContext = 'general',
  className = '',
  ...props
}, ref) => {
  const state: MedicalSelectState = error ? 'error' : warning ? 'warning' : success ? 'success' : 'default'
  const widthClass = fullWidth ? MEDICAL_SELECT_WIDTH_CLASSES.full : MEDICAL_SELECT_WIDTH_CLASSES.default
  
  const getMedicalIcon = () => {
    if (medicalIcon) return medicalIcon
    
    switch (medicalContext) {
      case 'status': return AlertTriangle
      case 'category': return Stethoscope
      case 'priority': return Heart
      default: return Calendar
    }
  }
  
  const MedicalIcon = getMedicalIcon()
  
  const selectClasses = `
    ${MEDICAL_SELECT_SIZE_CLASSES[size]}
    ${MEDICAL_SELECT_VARIANT_CLASSES[variant]}
    ${MEDICAL_SELECT_STATE_CLASSES[state]}
    ${MEDICAL_SELECT_BASE_CLASSES}
    ${widthClass}
    ${className}
  `.trim()

  return (
    <div className={`${fullWidth ? 'w-full' : ''} space-y-2`}>
      {label && (
        <motion.label
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={MEDICAL_SELECT_LABEL_CLASSES}
        >
          <span className={MEDICAL_SELECT_MEDICAL_ICON_CLASSES}>
            <MedicalIcon className="w-4 h-4 inline mr-2" />
          </span>
          {label}
          {required && <span className={MEDICAL_SELECT_REQUIRED_INDICATOR}>*</span>}
        </motion.label>
      )}
      
      <div className="relative">
        <select
          ref={ref}
          className={selectClasses}
          disabled={disabled}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className={MEDICAL_SELECT_PLACEHOLDER_CLASSES}>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              className={MEDICAL_SELECT_OPTION_CLASSES}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        <Icon className={`${MEDICAL_SELECT_ICON_CLASSES} ${MEDICAL_SELECT_ICON_POSITION_CLASSES}`} />
      </div>
      
      {/* Helper Text */}
      {(helperText || error || success || warning) && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className={MEDICAL_SELECT_HELPER_TEXT_CLASSES}
        >
          {error && (
            <span className={MEDICAL_SELECT_ERROR_CLASSES}>
              <span className={`${MEDICAL_SELECT_STATUS_INDICATOR} ${MEDICAL_SELECT_STATUS_INDICATOR_COLORS.error}`}></span>
              <span>{error}</span>
            </span>
          )}
          {warning && (
            <span className={MEDICAL_SELECT_WARNING_CLASSES}>
              <span className={`${MEDICAL_SELECT_STATUS_INDICATOR} ${MEDICAL_SELECT_STATUS_INDICATOR_COLORS.warning}`}></span>
              <span>{warning}</span>
            </span>
          )}
          {success && (
            <span className={MEDICAL_SELECT_SUCCESS_CLASSES}>
              <span className={`${MEDICAL_SELECT_STATUS_INDICATOR} ${MEDICAL_SELECT_STATUS_INDICATOR_COLORS.success}`}></span>
              <span>{success}</span>
            </span>
          )}
          {helperText && !error && !success && !warning && (
            <span className={MEDICAL_SELECT_HELPER_CLASSES}>{helperText}</span>
          )}
        </motion.div>
      )}
    </div>
  )
}))

MedicalSelect.displayName = 'MedicalSelect'

export default MedicalSelect
