import React, { forwardRef, memo } from 'react'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { InputProps, InputState } from './Input.types'
import {
  INPUT_SIZE_CLASSES,
  INPUT_VARIANT_CLASSES,
  INPUT_STATE_CLASSES,
  INPUT_BASE_CLASSES,
  INPUT_WIDTH_CLASSES,
  INPUT_LABEL_CLASSES,
  INPUT_REQUIRED_INDICATOR,
  INPUT_ICON_CLASSES,
  INPUT_ICON_POSITION_CLASSES,
  INPUT_HELPER_TEXT_CLASSES,
  INPUT_ERROR_CLASSES,
  INPUT_SUCCESS_CLASSES,
  INPUT_HELPER_CLASSES,
  INPUT_STATUS_INDICATOR,
  INPUT_STATUS_INDICATOR_COLORS
} from './Input.styles'

const Input = memo(forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  success,
  helperText,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  size = 'md',
  variant = 'default',
  fullWidth = false,
  required = false,
  disabled = false,
  className = '',
  ...props
}, ref) => {
  // Filter out props that conflict with Framer Motion
  const { onDrag, onDragStart, onDragEnd, ...motionProps } = props
  
  const state: InputState = error ? 'error' : success ? 'success' : 'default'
  const widthClass = fullWidth ? INPUT_WIDTH_CLASSES.full : INPUT_WIDTH_CLASSES.default
  
  const inputClasses = `
    ${INPUT_SIZE_CLASSES[size]}
    ${INPUT_VARIANT_CLASSES[variant]}
    ${INPUT_STATE_CLASSES[state]}
    ${INPUT_BASE_CLASSES}
    ${widthClass}
    ${className}
  `.trim()

  return (
    <div className={`${fullWidth ? 'w-full' : ''} space-y-2`}>
      {label && (
        <motion.label
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={INPUT_LABEL_CLASSES}
        >
          {label}
          {required && <span className={INPUT_REQUIRED_INDICATOR}>*</span>}
        </motion.label>
      )}
      
      <div className="relative">
        {LeftIcon && (
          <div className={`left-3 ${INPUT_ICON_POSITION_CLASSES}`}>
            <LeftIcon className={INPUT_ICON_CLASSES} />
          </div>
        )}
        
        <input
          ref={ref}
          className={inputClasses}
          style={{
            paddingLeft: LeftIcon ? '2.75rem' : undefined,
            paddingRight: RightIcon ? '2.75rem' : undefined
          }}
          disabled={disabled}
          {...motionProps}
        />
        
        {RightIcon && (
          <div className={`right-3 ${INPUT_ICON_POSITION_CLASSES}`}>
            <RightIcon className={INPUT_ICON_CLASSES} />
          </div>
        )}
      </div>
      
      {/* Helper Text */}
      {(helperText || error || success) && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className={INPUT_HELPER_TEXT_CLASSES}
        >
          {error && (
            <span className={INPUT_ERROR_CLASSES}>
              <span className={`${INPUT_STATUS_INDICATOR} ${INPUT_STATUS_INDICATOR_COLORS.error}`}></span>
              <span>{error}</span>
            </span>
          )}
          {success && (
            <span className={INPUT_SUCCESS_CLASSES}>
              <span className={`${INPUT_STATUS_INDICATOR} ${INPUT_STATUS_INDICATOR_COLORS.success}`}></span>
              <span>{success}</span>
            </span>
          )}
          {helperText && !error && !success && (
            <span className={INPUT_HELPER_CLASSES}>{helperText}</span>
          )}
        </motion.div>
      )}
    </div>
  )
}))

Input.displayName = 'Input'

export default Input
