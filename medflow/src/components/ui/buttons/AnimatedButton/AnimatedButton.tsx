/**
 * Enhanced Animated Button Component for MedFlow UI Library
 *
 * Features:
 * - Multiple animation variants and styles
 * - Professional medical styling with MedFlow branding
 * - Loading states and async operations
 * - Icon support with flexible positioning
 * - Accessible with ARIA labels and keyboard navigation
 * - Romanian localization for medical professionals
 * - TypeScript support with comprehensive props
 * - Responsive design for all screen sizes
 *
 * @author MedFlow UI Team
 * @version 2.0
 */

import React, { ButtonHTMLAttributes, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export interface AnimatedButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'ghost' | 'outline'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  loadingText?: string
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  animationType?: 'bounce' | 'pulse' | 'scale' | 'slide' | 'none'
  fullWidth?: boolean
  rounded?: boolean
  disabled?: boolean
  className?: string
}

export interface IconButtonProps extends Omit<AnimatedButtonProps, 'children'> {
  icon: ReactNode
  'aria-label': string
}

const sizeClasses = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
  xl: 'px-8 py-4 text-xl'
}

const variantClasses = {
  primary: 'bg-medflow-primary hover:bg-medflow-secondary text-white shadow-lg hover:shadow-xl focus:ring-medflow-primary',
  secondary: 'bg-medflow-secondary hover:bg-medflow-primary text-white shadow-lg hover:shadow-xl focus:ring-medflow-secondary',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl focus:ring-red-500',
  success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl focus:ring-emerald-500',
  warning: 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg hover:shadow-xl focus:ring-orange-500',
  ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 focus:ring-gray-500',
  outline: 'bg-transparent hover:bg-medflow-primary text-medflow-primary border-2 border-medflow-primary hover:text-white focus:ring-medflow-primary'
}

const animationVariants = {
  bounce: {
    whileHover: { scale: 1.05, y: -2 },
    whileTap: { scale: 0.95, y: 0 }
  },
  pulse: {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 }
  },
  scale: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 }
  },
  slide: {
    whileHover: { x: 4 },
    whileTap: { x: 0 }
  },
  none: {}
}

const iconSizes = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-7 h-7'
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingText,
  icon,
  iconPosition = 'right',
  animationType = 'bounce',
  fullWidth = false,
  rounded = false,
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}) => {
  const baseClasses = `
    inline-flex items-center justify-center font-medium
    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${fullWidth ? 'w-full' : ''}
    ${rounded ? 'rounded-full' : 'rounded-lg'}
    ${className}
  `.trim()

  const iconSizeClass = iconSizes[size]
  const animations = animationVariants[animationType]

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading && onClick) {
      onClick(e)
    }
  }

  return (
    <motion.button
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      className={baseClasses}
      {...animations}
      {...props}
    >
      {loading ? (
        <motion.div
          className="flex items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Loader2 className={`animate-spin ${iconSizeClass} mr-2`} />
          <span>{loadingText || 'Se încarcă...'}</span>
        </motion.div>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <motion.div
              className={`mr-2 ${iconSizeClass}`}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {icon}
            </motion.div>
          )}
          <span>{children}</span>
          {icon && iconPosition === 'right' && (
            <motion.div
              className={`ml-2 ${iconSizeClass}`}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {icon}
            </motion.div>
          )}
        </>
      )}
    </motion.button>
  )
}

// Specialized button components for common use cases
export const PrimaryButton: React.FC<Omit<AnimatedButtonProps, 'variant'>> = (props) => (
  <AnimatedButton {...props} variant="primary" />
)

export const SecondaryButton: React.FC<Omit<AnimatedButtonProps, 'variant'>> = (props) => (
  <AnimatedButton {...props} variant="secondary" />
)

export const DangerButton: React.FC<Omit<AnimatedButtonProps, 'variant'>> = (props) => (
  <AnimatedButton {...props} variant="danger" />
)

export const SuccessButton: React.FC<Omit<AnimatedButtonProps, 'variant'>> = (props) => (
  <AnimatedButton {...props} variant="success" />
)

export const WarningButton: React.FC<Omit<AnimatedButtonProps, 'variant'>> = (props) => (
  <AnimatedButton {...props} variant="warning" />
)

export const GhostButton: React.FC<Omit<AnimatedButtonProps, 'variant'>> = (props) => (
  <AnimatedButton {...props} variant="ghost" />
)

export const OutlineButton: React.FC<Omit<AnimatedButtonProps, 'variant'>> = (props) => (
  <AnimatedButton {...props} variant="outline" />
)

// Icon button component
export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  size = 'md',
  variant = 'ghost',
  animationType = 'scale',
  'aria-label': ariaLabel,
  ...props
}) => {
  const iconSizeClass = iconSizes[size]

  return (
    <motion.button
      {...animationVariants[animationType]}
      className={`
        inline-flex items-center justify-center rounded-lg
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${props.className || ''}
      `}
      aria-label={ariaLabel}
      {...props}
    >
      <motion.div
        className={iconSizeClass}
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {icon}
      </motion.div>
    </motion.button>
  )
}

// Specialized medical action buttons
export const SaveButton: React.FC<Omit<AnimatedButtonProps, 'variant' | 'children'>> = (props) => (
  <AnimatedButton {...props} variant="success">
    Salvează
  </AnimatedButton>
)

export const CancelButton: React.FC<Omit<AnimatedButtonProps, 'variant' | 'children'>> = (props) => (
  <AnimatedButton {...props} variant="ghost">
    Anulează
  </AnimatedButton>
)

export const DeleteButton: React.FC<Omit<AnimatedButtonProps, 'variant' | 'children'>> = (props) => (
  <AnimatedButton {...props} variant="danger">
    Șterge
  </AnimatedButton>
)

export const EditButton: React.FC<Omit<AnimatedButtonProps, 'variant' | 'children'>> = (props) => (
  <AnimatedButton {...props} variant="primary">
    Editează
  </AnimatedButton>
)

export const SubmitButton: React.FC<Omit<AnimatedButtonProps, 'variant' | 'children'>> = (props) => (
  <AnimatedButton {...props} variant="primary" type="submit">
    Trimite
  </AnimatedButton>
)

export const BackButton: React.FC<Omit<AnimatedButtonProps, 'variant' | 'children'>> = (props) => (
  <AnimatedButton {...props} variant="ghost">
    Înapoi
  </AnimatedButton>
)

// Button group component for related actions
export interface ButtonGroupProps {
  children: ReactNode
  spacing?: 'sm' | 'md' | 'lg'
  alignment?: 'left' | 'center' | 'right'
  className?: string
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  spacing = 'md',
  alignment = 'left',
  className = ''
}) => {
  const spacingClasses = {
    sm: 'space-x-2',
    md: 'space-x-3',
    lg: 'space-x-4'
  }

  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  }

  return (
    <div className={`flex ${spacingClasses[spacing]} ${alignmentClasses[alignment]} ${className}`}>
      {children}
    </div>
  )
}

AnimatedButton.displayName = 'AnimatedButton'
PrimaryButton.displayName = 'PrimaryButton'
SecondaryButton.displayName = 'SecondaryButton'
DangerButton.displayName = 'DangerButton'
SuccessButton.displayName = 'SuccessButton'
WarningButton.displayName = 'WarningButton'
GhostButton.displayName = 'GhostButton'
OutlineButton.displayName = 'OutlineButton'
IconButton.displayName = 'IconButton'
SaveButton.displayName = 'SaveButton'
CancelButton.displayName = 'CancelButton'
DeleteButton.displayName = 'DeleteButton'
EditButton.displayName = 'EditButton'
SubmitButton.displayName = 'SubmitButton'
BackButton.displayName = 'BackButton'
ButtonGroup.displayName = 'ButtonGroup'
