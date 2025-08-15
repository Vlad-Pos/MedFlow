import React, { forwardRef, memo } from 'react'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { TextAreaProps, TextAreaState } from './TextArea.types'
import {
  TEXTAREA_BASE_CLASSES,
  TEXTAREA_SIZE_CLASSES,
  TEXTAREA_VARIANT_CLASSES,
  TEXTAREA_STATE_CLASSES,
  TEXTAREA_WIDTH_CLASSES,
  TEXTAREA_LABEL_CLASSES,
  TEXTAREA_REQUIRED_INDICATOR,
  TEXTAREA_ICON_CLASSES,
  TEXTAREA_ICON_POSITION_CLASSES,
  TEXTAREA_HELPER_TEXT_CLASSES,
  TEXTAREA_ERROR_CLASSES,
  TEXTAREA_SUCCESS_CLASSES,
  TEXTAREA_HELPER_CLASSES,
  TEXTAREA_STATUS_INDICATOR,
  TEXTAREA_STATUS_INDICATOR_COLORS,
  TEXTAREA_CHAR_COUNT_CLASSES,
  TEXTAREA_AI_SUGGESTION_CLASSES
} from './TextArea.styles'

const TextArea = memo(forwardRef<HTMLTextAreaElement, TextAreaProps>(({
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
  maxLength,
  showCharCount = false,
  aiSuggestion,
  className = '',
  ...props
}, ref) => {
  const state: TextAreaState = error ? 'error' : success ? 'success' : 'default'
  const widthClass = fullWidth ? TEXTAREA_WIDTH_CLASSES.full : TEXTAREA_WIDTH_CLASSES.default
  const currentLength = props.value?.toString().length || 0
  
  const textareaClasses = `
    ${TEXTAREA_SIZE_CLASSES[size]}
    ${TEXTAREA_VARIANT_CLASSES[variant]}
    ${TEXTAREA_STATE_CLASSES[state]}
    ${TEXTAREA_BASE_CLASSES}
    ${widthClass}
    ${className}
  `.trim()

  return (
    <div className={`${fullWidth ? 'w-full' : ''} space-y-2`}>
      {label && (
        <motion.label
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={TEXTAREA_LABEL_CLASSES}
        >
          {label}
          {required && <span className={TEXTAREA_REQUIRED_INDICATOR}>*</span>}
        </motion.label>
      )}
      
      <div className="relative">
        {LeftIcon && (
          <div className={`left-3 ${TEXTAREA_ICON_POSITION_CLASSES}`}>
            <LeftIcon className={TEXTAREA_ICON_CLASSES} />
          </div>
        )}
        
        <textarea
          ref={ref}
          className={textareaClasses}
          style={{
            paddingLeft: LeftIcon ? '2.75rem' : undefined,
            paddingRight: RightIcon ? '2.75rem' : undefined
          }}
          disabled={disabled}
          maxLength={maxLength}
          {...props}
        />
        
        {RightIcon && (
          <div className={`right-3 ${TEXTAREA_ICON_POSITION_CLASSES}`}>
            <RightIcon className={TEXTAREA_ICON_CLASSES} />
          </div>
        )}
      </div>
      
      {/* Character Count */}
      {showCharCount && maxLength && (
        <div className={TEXTAREA_CHAR_COUNT_CLASSES}>
          {currentLength} / {maxLength}
        </div>
      )}
      
      {/* AI Suggestion */}
      {aiSuggestion && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className={TEXTAREA_AI_SUGGESTION_CLASSES}
        >
          💡 {aiSuggestion}
        </motion.div>
      )}
      
      {/* Helper Text */}
      {(helperText || error || success) && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className={TEXTAREA_HELPER_TEXT_CLASSES}
        >
          {error && (
            <span className={TEXTAREA_ERROR_CLASSES}>
              <span className={`${TEXTAREA_STATUS_INDICATOR} ${TEXTAREA_STATUS_INDICATOR_COLORS.error}`}></span>
              <span>{error}</span>
            </span>
          )}
          {success && (
            <span className={TEXTAREA_SUCCESS_CLASSES}>
              <span className={`${TEXTAREA_STATUS_INDICATOR} ${TEXTAREA_STATUS_INDICATOR_COLORS.success}`}></span>
              <span>{success}</span>
            </span>
          )}
          {helperText && !error && !success && (
            <span className={TEXTAREA_HELPER_CLASSES}>{helperText}</span>
          )}
        </motion.div>
      )}
    </div>
  )
}))

TextArea.displayName = 'TextArea'

export default TextArea
