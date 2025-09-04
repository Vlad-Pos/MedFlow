import React, { forwardRef, memo } from 'react'
import { motion } from 'framer-motion'
import { LucideIcon, ChevronDown } from 'lucide-react'
import { SelectProps, SelectState } from './Select.types'
import {
  SELECT_BASE_CLASSES,
  SELECT_SIZE_CLASSES,
  SELECT_VARIANT_CLASSES,
  SELECT_STATE_CLASSES,
  SELECT_WIDTH_CLASSES,
  SELECT_LABEL_CLASSES,
  SELECT_REQUIRED_INDICATOR,
  SELECT_ICON_CLASSES,
  SELECT_ICON_POSITION_CLASSES,
  SELECT_HELPER_TEXT_CLASSES,
  SELECT_ERROR_CLASSES,
  SELECT_SUCCESS_CLASSES,
  SELECT_HELPER_CLASSES,
  SELECT_STATUS_INDICATOR,
  SELECT_STATUS_INDICATOR_COLORS,
  SELECT_OPTION_CLASSES,
  SELECT_PLACEHOLDER_CLASSES
} from './Select.styles'

const Select = memo(forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  success,
  helperText,
  options,
  placeholder,
  size = 'md',
  variant = 'default',
  fullWidth = false,
  required = false,
  disabled = false,
  icon: Icon = ChevronDown,
  className = '',
  ...props
}, ref) => {
  const state: SelectState = error ? 'error' : success ? 'success' : 'default'
  const widthClass = fullWidth ? SELECT_WIDTH_CLASSES.full : SELECT_WIDTH_CLASSES.default
  
  const selectClasses = `
    ${SELECT_SIZE_CLASSES[size]}
    ${SELECT_VARIANT_CLASSES[variant]}
    ${SELECT_STATE_CLASSES[state]}
    ${SELECT_BASE_CLASSES}
    ${widthClass}
    ${className}
  `.trim()

  return (
    <div className={`${fullWidth ? 'w-full' : ''} space-y-2`}>
      {label && (
        <motion.label
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={SELECT_LABEL_CLASSES}
        >
          {label}
          {required && <span className={SELECT_REQUIRED_INDICATOR}>*</span>}
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
            <option value="" disabled className={SELECT_PLACEHOLDER_CLASSES}>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              className={SELECT_OPTION_CLASSES}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        <Icon className={`${SELECT_ICON_CLASSES} ${SELECT_ICON_POSITION_CLASSES}`} />
      </div>
      
      {/* Helper Text */}
      {(helperText || error || success) && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className={SELECT_HELPER_TEXT_CLASSES}
        >
          {error && (
            <span className={SELECT_ERROR_CLASSES}>
              <span className={`${SELECT_STATUS_INDICATOR} ${SELECT_STATUS_INDICATOR_COLORS.error}`}></span>
              <span>{error}</span>
            </span>
          )}
          {success && (
            <span className={SELECT_SUCCESS_CLASSES}>
              <span className={`${SELECT_STATUS_INDICATOR} ${SELECT_STATUS_INDICATOR_COLORS.success}`}></span>
              <span>{success}</span>
            </span>
          )}
          {helperText && !error && !success && (
            <span className={SELECT_HELPER_CLASSES}>{helperText}</span>
          )}
        </motion.div>
      )}
    </div>
  )
}))

Select.displayName = 'Select'

export default Select
