import React, { memo } from 'react'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { ButtonProps } from './Button.types'
import {
  BUTTON_BASE_CLASSES,
  BUTTON_SIZE_CLASSES,
  BUTTON_VARIANT_CLASSES,
  BUTTON_WIDTH_CLASSES,
  BUTTON_ICON_CLASSES,
  BUTTON_ICON_SPACING,
  BUTTON_LOADING_CLASSES
} from './Button.styles'

const Button = memo<ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  className = '',
  fullWidth = false,
  href,
  target
}) => {
  const widthClass = fullWidth ? BUTTON_WIDTH_CLASSES.full : BUTTON_WIDTH_CLASSES.default
  
  const buttonContent = (
    <>
      {loading && (
        <motion.div
          className={BUTTON_LOADING_CLASSES}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}
      
      {Icon && iconPosition === 'left' && !loading && (
        <Icon className={`${BUTTON_ICON_CLASSES} ${BUTTON_ICON_SPACING.left}`} />
      )}
      
      <span>{children}</span>
      
      {Icon && iconPosition === 'right' && !loading && (
        <Icon className={`${BUTTON_ICON_CLASSES} ${BUTTON_ICON_SPACING.right}`} />
      )}
    </>
  )

  const buttonProps = {
    className: `${BUTTON_BASE_CLASSES} ${BUTTON_SIZE_CLASSES[size]} ${BUTTON_VARIANT_CLASSES[variant]} ${widthClass} ${className}`,
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

Button.displayName = 'Button'

export default Button
