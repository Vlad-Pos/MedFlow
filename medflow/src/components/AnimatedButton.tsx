import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { buttonVariants, bounceVariants } from '../utils/animations'
interface AnimatedButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
}

const buttonStyles = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl',
  secondary: 'bg-gray-600 hover:bg-gray-700 text-white shadow-lg hover:shadow-xl',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl',
  ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
}

const buttonSizes = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg'
}

export default function AnimatedButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  type = 'button',
  icon,
  iconPosition = 'right'
}: AnimatedButtonProps) {
  const baseClasses = `
    inline-flex items-center justify-center font-medium rounded-lg
    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${buttonStyles[variant]}
    ${buttonSizes[size]}
    ${className}
  `

  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick()
    }
  }

  return (
    <motion.button
        type={type}
        onClick={handleClick}
        disabled={disabled || loading}
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        className={baseClasses}
        whileFocus={{ scale: 1.02 }}
      >
        {loading ? (
          <motion.div
            variants={bounceVariants}
            animate="animate"
            className="flex items-center"
          >
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            Se încarcă...
          </motion.div>
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <motion.div
                className="mr-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                {icon}
              </motion.div>
            )}
            <span>{children}</span>
            {icon && iconPosition === 'right' && (
              <motion.div
                className="ml-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                {icon}
              </motion.div>
            )}
          </>
        )}
      </motion.button>
    )
}

// Specialized button components
export function PrimaryButton(props: Omit<AnimatedButtonProps, 'variant'>) {
  return <AnimatedButton {...props} variant="primary" />
}

export function SecondaryButton(props: Omit<AnimatedButtonProps, 'variant'>) {
  return <AnimatedButton {...props} variant="secondary" />
}

export function DangerButton(props: Omit<AnimatedButtonProps, 'variant'>) {
  return <AnimatedButton {...props} variant="danger" />
}

export function GhostButton(props: Omit<AnimatedButtonProps, 'variant'>) {
  return <AnimatedButton {...props} variant="ghost" />
}

// Icon button component
export function IconButton({
  icon,
  onClick,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  className = '',
  'aria-label': ariaLabel
}: {
  icon: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
  'aria-label': string
}) {
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const baseClasses = `
    inline-flex items-center justify-center rounded-lg
    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${buttonStyles[variant]}
    ${className}
  `

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      variants={buttonVariants}
      whileHover="hover"
      whileTap="tap"
      className={baseClasses}
      aria-label={ariaLabel}
    >
      <motion.div
        className={iconSizes[size]}
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {icon}
      </motion.div>
    </motion.button>
  )
}

