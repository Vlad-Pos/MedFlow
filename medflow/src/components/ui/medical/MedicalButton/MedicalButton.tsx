import React, { memo } from 'react'
import { motion } from 'framer-motion'
import { LucideIcon, Stethoscope, Heart, AlertTriangle, Calendar } from 'lucide-react'
import { MedicalButtonProps } from './MedicalButton.types'
import {
  MEDICAL_BUTTON_BASE_CLASSES,
  MEDICAL_BUTTON_SIZE_CLASSES,
  MEDICAL_BUTTON_VARIANT_CLASSES,
  MEDICAL_BUTTON_WIDTH_CLASSES,
  MEDICAL_BUTTON_ICON_CLASSES,
  MEDICAL_BUTTON_ICON_SPACING,
  MEDICAL_BUTTON_LOADING_CLASSES,
  MEDICAL_BUTTON_MEDICAL_ICON_CLASSES
} from './MedicalButton.styles'

const MedicalButton = memo<MedicalButtonProps>(({
  children,
  variant = 'medical',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  medicalIcon,
  showMedicalBadge = true,
  medicalContext = 'routine',
  onClick,
  type = 'button',
  className = '',
  fullWidth = false,
  href,
  target
}) => {
  const widthClass = fullWidth ? MEDICAL_BUTTON_WIDTH_CLASSES.full : MEDICAL_BUTTON_WIDTH_CLASSES.default
  
  const getMedicalIcon = () => {
    if (medicalIcon) return medicalIcon
    
    switch (medicalContext) {
      case 'appointment': return Calendar
      case 'patient': return Heart
      case 'emergency': return AlertTriangle
      default: return Stethoscope
    }
  }
  
  const MedicalIcon = getMedicalIcon()
  
  const buttonContent = (
    <>
      {loading && (
        <motion.div
          className={MEDICAL_BUTTON_LOADING_CLASSES}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}
      
      {showMedicalBadge && !loading && (
        <MedicalIcon className={MEDICAL_BUTTON_MEDICAL_ICON_CLASSES} />
      )}
      
      {Icon && iconPosition === 'left' && !loading && (
        <Icon className={`${MEDICAL_BUTTON_ICON_CLASSES} ${MEDICAL_BUTTON_ICON_SPACING.left}`} />
      )}
      
      <span>{children}</span>
      
      {Icon && iconPosition === 'right' && !loading && (
        <Icon className={`${MEDICAL_BUTTON_ICON_CLASSES} ${MEDICAL_BUTTON_ICON_SPACING.right}`} />
      )}
    </>
  )

  const buttonProps = {
    className: `${MEDICAL_BUTTON_BASE_CLASSES} ${MEDICAL_BUTTON_SIZE_CLASSES[size]} ${MEDICAL_BUTTON_VARIANT_CLASSES[variant]} ${widthClass} ${className}`,
    disabled: disabled || loading,
    onClick,
    type,
    whileHover: !disabled && !loading ? { scale: 1.02, y: -1 } : {},
    whileTap: !disabled && !loading ? { scale: 0.98 } : {}
  }

  if (href) {
    return (
      <motion.a
        href={href}
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
        {...buttonProps}
      >
        {buttonContent}
      </motion.a>
    )
  }

  return (
    <motion.button {...buttonProps}>
      {buttonContent}
    </motion.button>
  )
})

MedicalButton.displayName = 'MedicalButton'

export default MedicalButton
