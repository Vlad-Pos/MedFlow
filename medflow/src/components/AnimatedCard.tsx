import { motion } from 'framer-motion'
import { ReactNode, memo, useMemo } from 'react'
import { useAnimationPerformance } from '../hooks/useAnimationPerformance'
import { cardVariants, featureVariants } from '../utils/animations'

interface AnimatedCardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'feature' | 'elevated' | 'outlined'
  onClick?: () => void
  interactive?: boolean
  delay?: number
  componentName?: string
  priority?: 'low' | 'medium' | 'high'
}

// Modular card styles with performance optimization
const cardStyles = {
  default: 'bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700',
  feature: 'bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-700',
  elevated: 'bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl border-0',
  outlined: 'bg-transparent border-2 border-gray-300 dark:border-gray-600 shadow-none'
}

// Performance-optimized card component
const AnimatedCard = memo(({
  children,
  className = '',
  variant = 'default',
  onClick,
  interactive = false,
  delay = 0,
  componentName = 'card',
  priority = 'medium'
}: AnimatedCardProps) => {
  const { shouldAnimate, getOptimizedVariants, getOptimizedTransition } = useAnimationPerformance()
  
  // Determine if this card should animate based on priority and performance
  const canAnimate = shouldAnimate(componentName)
  
  // Memoize base classes to prevent unnecessary recalculations
  const baseClasses = useMemo(() => {
    return `
      rounded-xl p-6 transition-all duration-200
      ${cardStyles[variant]}
      ${interactive ? 'cursor-pointer' : ''}
      ${className}
    `.trim().replace(/\s+/g, ' ')
  }, [variant, interactive, className])
  
  // Get optimized variants based on performance capabilities
  const optimizedVariants = useMemo(() => {
    if (!canAnimate) return {}
    
    const baseVariants = variant === 'feature' ? featureVariants : cardVariants
    
    // Apply performance optimizations
    return getOptimizedVariants(baseVariants, {})
  }, [canAnimate, variant, getOptimizedVariants])
  
  // Get optimized transition settings
  const optimizedTransition = useMemo(() => {
    if (!canAnimate) return { duration: 0 }
    
    return getOptimizedTransition({
      delay,
      duration: 0.3,
      ease: 'easeOut'
    })
  }, [canAnimate, delay, getOptimizedTransition])
  
  // If animations are disabled, render as static div
  if (!canAnimate) {
    return (
      <div 
        className={baseClasses}
        onClick={onClick}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
      >
        {children}
      </div>
    )
  }
  
  // Render with optimized animations
  return (
    <motion.div
      className={baseClasses}
      variants={optimizedVariants}
      initial="initial"
      whileInView="animate"
      whileHover={interactive ? "hover" : undefined}
      whileTap={interactive ? "tap" : undefined}
      onClick={onClick}
      transition={optimizedTransition}
      viewport={{ 
        once: true, 
        margin: priority === 'high' ? '20px' : '50px' 
      }}
      layout={priority === 'high' ? 'position' : false}
    >
      {children}
    </motion.div>
  )
})

AnimatedCard.displayName = 'AnimatedCard'

// Specialized card components with performance optimizations
export function FeatureCard(props: Omit<AnimatedCardProps, 'variant'>) {
  return <AnimatedCard {...props} variant="feature" interactive priority="high" />
}

export function ElevatedCard(props: Omit<AnimatedCardProps, 'variant'>) {
  return <AnimatedCard {...props} variant="elevated" interactive priority="medium" />
}

export function OutlinedCard(props: Omit<AnimatedCardProps, 'variant'>) {
  return <AnimatedCard {...props} variant="outlined" priority="low" />
}

// Interactive card with optimized hover effects
export function InteractiveCard({
  children,
  className = '',
  onClick,
  delay = 0,
  priority = 'medium'
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
  delay?: number
  priority?: 'low' | 'medium' | 'high'
}) {
  const { shouldAnimate, getOptimizedTransition } = useAnimationPerformance()
  const canAnimate = shouldAnimate('interactive-card')
  
  const baseClasses = useMemo(() => {
    return `bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 cursor-pointer ${className}`
  }, [className])
  
  if (!canAnimate) {
    return (
      <div className={baseClasses} onClick={onClick}>
        {children}
      </div>
    )
  }
  
  const optimizedTransition = getOptimizedTransition({
    delay,
    duration: 0.2,
    ease: 'easeOut'
  })
  
  return (
    <motion.div
      className={baseClasses}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -5,
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      transition={optimizedTransition}
      viewport={{ 
        once: true, 
        margin: priority === 'high' ? '20px' : '50px' 
      }}
    >
      {children}
    </motion.div>
  )
}

// Performance-optimized stats card component
export function StatsCard({
  title,
  value,
  change,
  icon,
  className = '',
  style = {}
}: {
  title: string
  value: string | number
  change?: { value: number; isPositive: boolean }
  icon?: ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  const { shouldAnimate, getOptimizedTransition } = useAnimationPerformance()
  const canAnimate = shouldAnimate('stats-card')
  
  // REMOVED hardcoded backgrounds and borders - now fully configurable by parent
  const baseClasses = useMemo(() => {
    return `rounded-xl p-6 shadow-lg ${className}`
  }, [className])
  
  if (!canAnimate) {
    return (
      <div className={baseClasses} style={style}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            {change && (
              <p className={`text-sm font-medium ${
                change.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {change.isPositive ? '+' : ''}{change.value}%
              </p>
            )}
          </div>
          {icon && (
            <div className="text-blue-600 dark:text-blue-400">
              {icon}
            </div>
          )}
        </div>
      </div>
    )
  }
  
  const optimizedTransition = getOptimizedTransition({
    duration: 0.3,
    ease: 'easeOut'
  })
  
  return (
    <motion.div
      className={baseClasses}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={optimizedTransition}
      viewport={{ once: true, margin: '50px' }}
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

// Info card component with performance optimization
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
  const { shouldAnimate, getOptimizedTransition } = useAnimationPerformance()
  const canAnimate = shouldAnimate('info-card')
  
  const baseClasses = useMemo(() => {
    return `bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 ${className}`
  }, [className])
  
  if (!canAnimate) {
    return (
      <div className={baseClasses}>
        <div className="flex items-start gap-4">
          {icon && (
            <div className="text-blue-600 dark:text-blue-400 flex-shrink-0">
              {icon}
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              {title}
            </h3>
            <p className="text-blue-700 dark:text-blue-200 text-sm">
              {description}
            </p>
            {action && (
              <div className="mt-4">
                {action}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
  
  const optimizedTransition = getOptimizedTransition({
    duration: 0.4,
    ease: 'easeOut'
  })
  
  return (
    <motion.div
      className={baseClasses}
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={optimizedTransition}
      viewport={{ once: true, margin: '50px' }}
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

export default AnimatedCard

