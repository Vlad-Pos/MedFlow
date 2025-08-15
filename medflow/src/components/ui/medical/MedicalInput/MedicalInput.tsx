import React, { forwardRef, memo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LucideIcon, Brain, Stethoscope, Heart, Pill, AlertTriangle, Info, CheckCircle } from 'lucide-react'
import { MedicalInputProps, MedicalInputState } from './MedicalInput.types'
import {
  MEDICAL_INPUT_SIZE_CLASSES,
  MEDICAL_INPUT_VARIANT_CLASSES,
  MEDICAL_INPUT_STATE_CLASSES,
  MEDICAL_INPUT_BASE_CLASSES,
  MEDICAL_INPUT_WIDTH_CLASSES,
  MEDICAL_INPUT_LABEL_CLASSES,
  MEDICAL_INPUT_REQUIRED_INDICATOR,
  MEDICAL_INPUT_ICON_CLASSES,
  MEDICAL_INPUT_ICON_POSITION_CLASSES,
  MEDICAL_INPUT_HELPER_TEXT_CLASSES,
  MEDICAL_INPUT_ERROR_CLASSES,
  MEDICAL_INPUT_SUCCESS_CLASSES,
  MEDICAL_INPUT_WARNING_CLASSES,
  MEDICAL_INPUT_HELPER_CLASSES,
  MEDICAL_INPUT_STATUS_INDICATOR,
  MEDICAL_INPUT_STATUS_INDICATOR_COLORS,
  MEDICAL_INPUT_AI_SUGGESTION_CLASSES,
  MEDICAL_INPUT_MEDICAL_ICON_CLASSES
} from './MedicalInput.styles'

const MedicalInput = memo(forwardRef<HTMLInputElement, MedicalInputProps>(({
  label,
  error,
  success,
  warning,
  helperText,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  size = 'md',
  variant = 'medical',
  fullWidth = false,
  required = false,
  disabled = false,
  medicalIcon,
  aiSuggestions = [],
  showAISuggestions = false,
  medicalContext = 'general',
  className = '',
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  
  // Filter out props that conflict with Framer Motion
  const { onDrag, onDragStart, onDragEnd, ...motionProps } = props
  
  const state: MedicalInputState = error ? 'error' : warning ? 'warning' : success ? 'success' : 'default'
  const widthClass = fullWidth ? MEDICAL_INPUT_WIDTH_CLASSES.full : MEDICAL_INPUT_WIDTH_CLASSES.default
  
  const getMedicalIcon = () => {
    if (medicalIcon) return medicalIcon
    
    switch (medicalContext) {
      case 'symptom': return AlertTriangle
      case 'diagnosis': return Stethoscope
      case 'medication': return Pill
      default: return Heart
    }
  }
  
  const MedicalIcon = getMedicalIcon()
  
  const handleFocus = () => {
    setIsFocused(true)
    setShowSuggestions(showAISuggestions && aiSuggestions.length > 0)
  }
  
  const handleBlur = () => {
    setIsFocused(false)
    setTimeout(() => setShowSuggestions(false), 200)
  }
  
  const applySuggestion = (suggestion: string) => {
    if (props.onChange) {
      const event = { target: { value: suggestion } } as React.ChangeEvent<HTMLInputElement>
      props.onChange(event)
    }
    setShowSuggestions(false)
  }
  
  const inputClasses = `
    ${MEDICAL_INPUT_SIZE_CLASSES[size]}
    ${MEDICAL_INPUT_VARIANT_CLASSES[variant]}
    ${MEDICAL_INPUT_STATE_CLASSES[state]}
    ${MEDICAL_INPUT_BASE_CLASSES}
    ${widthClass}
    text-white
    placeholder-white/50
    ${className}
  `.trim()

  return (
    <div className={`${fullWidth ? 'w-full' : ''} space-y-2`}>
      {label && (
        <motion.label
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={MEDICAL_INPUT_LABEL_CLASSES}
        >
          <span className={MEDICAL_INPUT_MEDICAL_ICON_CLASSES}>
            <MedicalIcon className="w-4 h-4 inline mr-2" />
          </span>
          {label}
          {required && <span className={MEDICAL_INPUT_REQUIRED_INDICATOR}>*</span>}
        </motion.label>
      )}
      
      <div className="relative">
        {LeftIcon && (
          <div className={`left-3 ${MEDICAL_INPUT_ICON_POSITION_CLASSES}`}>
            <LeftIcon className={MEDICAL_INPUT_ICON_CLASSES} />
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
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...motionProps}
        />
        
        {RightIcon && (
          <div className={`right-3 ${MEDICAL_INPUT_ICON_POSITION_CLASSES}`}>
            <RightIcon className={MEDICAL_INPUT_ICON_CLASSES} />
          </div>
        )}
        
        {/* Status Icon */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {error && <AlertTriangle className="w-5 h-5 text-red-500" />}
          {warning && <Info className="w-5 h-5 text-orange-500" />}
          {success && <CheckCircle className="w-5 h-5 text-green-500" />}
        </div>
      </div>
      
      {/* AI Suggestions */}
      <AnimatePresence>
        {showSuggestions && aiSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 w-full mt-1 bg-white/10 backdrop-blur border border-white/20 rounded-lg shadow-lg"
          >
            <div className="p-2 border-b border-white/10">
                              <div className="flex items-center space-x-2 text-xs font-medium text-[var(--medflow-brand-1)]">
                <Brain className="w-3 h-3" />
                <span>AI Suggestions</span>
              </div>
            </div>
            <div className="max-h-40 overflow-y-auto">
              {aiSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => applySuggestion(suggestion)}
                  className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Helper Text */}
      {(helperText || error || success || warning) && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className={MEDICAL_INPUT_HELPER_TEXT_CLASSES}
        >
          {error && (
            <span className={MEDICAL_INPUT_ERROR_CLASSES}>
              <span className={`${MEDICAL_INPUT_STATUS_INDICATOR} ${MEDICAL_INPUT_STATUS_INDICATOR_COLORS.error}`}></span>
              <span>{error}</span>
            </span>
          )}
          {warning && (
            <span className={MEDICAL_INPUT_WARNING_CLASSES}>
              <span className={`${MEDICAL_INPUT_STATUS_INDICATOR} ${MEDICAL_INPUT_STATUS_INDICATOR_COLORS.warning}`}></span>
              <span>{warning}</span>
            </span>
          )}
          {success && (
            <span className={MEDICAL_INPUT_SUCCESS_CLASSES}>
              <span className={`${MEDICAL_INPUT_STATUS_INDICATOR} ${MEDICAL_INPUT_STATUS_INDICATOR_COLORS.success}`}></span>
              <span>{success}</span>
            </span>
          )}
          {helperText && !error && !success && !warning && (
            <span className={MEDICAL_INPUT_HELPER_CLASSES}>{helperText}</span>
          )}
        </motion.div>
      )}
    </div>
  )
}))

MedicalInput.displayName = 'MedicalInput'

export default MedicalInput
