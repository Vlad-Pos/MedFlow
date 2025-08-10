import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { cardVariants, featureVariants } from '../utils/animations'
import DesignWorkWrapper from '../../DesignWorkWrapper'

interface AnimatedCardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'feature' | 'elevated' | 'outlined'
  onClick?: () => void
  interactive?: boolean
  delay?: number
}

const cardStyles = {
  default: 'bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700',
  feature: 'bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-700',
  elevated: 'bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl border-0',
  outlined: 'bg-transparent border-2 border-gray-300 dark:border-gray-600 shadow-none'
}

export default function AnimatedCard({
  children,
  className = '',
  variant = 'default',
  onClick,
  interactive = false,
  delay = 0
}: AnimatedCardProps) {
  const baseClasses = `
    rounded-xl p-6 transition-all duration-200
    ${cardStyles[variant]}
    ${interactive ? 'cursor-pointer' : ''}
    ${className}
  `

  const variants = variant === 'feature' ? featureVariants : cardVariants

  return (
    <DesignWorkWrapper componentName="AnimatedCard">
      <motion.div
        className={baseClasses}
        variants={variants}
        initial="initial"
        whileInView="animate"
        whileHover={interactive ? "hover" : undefined}
        whileTap={interactive ? "tap" : undefined}
        onClick={onClick}
        transition={{ delay }}
        viewport={{ once: true }}
      >
        {children}
      </motion.div>
    </DesignWorkWrapper>
  )
}

// Specialized card components
export function FeatureCard(props: Omit<AnimatedCardProps, 'variant'>) {
  return <AnimatedCard {...props} variant="feature" interactive />
}

export function ElevatedCard(props: Omit<AnimatedCardProps, 'variant'>) {
  return <AnimatedCard {...props} variant="elevated" interactive />
}

export function OutlinedCard(props: Omit<AnimatedCardProps, 'variant'>) {
  return <AnimatedCard {...props} variant="outlined" />
}

// Interactive card with hover effects
export function InteractiveCard({
  children,
  className = '',
  onClick,
  delay = 0
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
  delay?: number
}) {
  return (
    <motion.div
      className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 cursor-pointer ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -5,
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      transition={{ delay }}
      viewport={{ once: true }}
    >
      {children}
    </motion.div>
  )
}

// Stats card component
export function StatsCard({
  title,
  value,
  change,
  icon,
  className = ''
}: {
  title: string
  value: string | number
  change?: { value: number; isPositive: boolean }
  icon?: ReactNode
  className?: string
}) {
  return (
    <motion.div
      className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
      viewport={{ once: true }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {change && (
            <motion.p
              className={`text-sm font-medium ${
                change.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {change.isPositive ? '+' : ''}{change.value}%
            </motion.p>
          )}
        </div>
        {icon && (
          <motion.div
            className="text-blue-600 dark:text-blue-400"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {icon}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

// Info card component
export function InfoCard({
  title,
  description,
  icon,
  action,
  className = ''
}: {
  title: string
  description: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <motion.div
      className={`bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 ${className}`}
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
    >
      <div className="flex items-start gap-4">
        {icon && (
          <motion.div
            className="text-blue-600 dark:text-blue-400 flex-shrink-0"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          >
            {icon}
          </motion.div>
        )}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            {title}
          </h3>
          <p className="text-blue-700 dark:text-blue-200 text-sm">
            {description}
          </p>
          {action && (
            <motion.div
              className="mt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {action}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

