import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import DesignWorkWrapper from '../../DesignWorkWrapper'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'dots' | 'pulse'
  text?: string
  className?: string
}

export default function LoadingSpinner({ 
  size = 'md', 
  variant = 'default', 
  text,
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  if (variant === 'dots') {
    return (
      <DesignWorkWrapper componentName="LoadingSpinner">
        <div className={`flex items-center justify-center space-x-1 ${className}`}>
          <motion.div
            className={`bg-medflow-primary rounded-full ${sizeClasses[size]}`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className={`bg-medflow-primary rounded-full ${sizeClasses[size]}`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.2
            }}
          />
          <motion.div
            className={`bg-medflow-primary rounded-full ${sizeClasses[size]}`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.4
            }}
          />
          {text && (
            <span className={`ml-3 text-gray-600 dark:text-gray-400 ${textSizes[size]}`}>
              {text}
            </span>
          )}
        </div>
      </DesignWorkWrapper>
    )
  }

  if (variant === 'pulse') {
    return (
      <DesignWorkWrapper componentName="LoadingSpinner">
        <div className={`flex items-center justify-center ${className}`}>
          <motion.div
            className={`bg-medflow-primary rounded-full ${sizeClasses[size]}`}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          {text && (
            <span className={`ml-3 text-gray-600 dark:text-gray-400 ${textSizes[size]}`}>
              {text}
            </span>
          )}
        </div>
      </DesignWorkWrapper>
    )
  }

  return (
    <DesignWorkWrapper componentName="LoadingSpinner">
      <div className={`flex items-center justify-center ${className}`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <Loader2 className={`text-medflow-primary ${sizeClasses[size]}`} />
        </motion.div>
        {text && (
          <span className={`ml-3 text-gray-600 dark:text-gray-400 ${textSizes[size]}`}>
            {text}
          </span>
        )}
      </div>
    </DesignWorkWrapper>
  )
}

// Route loading component
export function RouteLoadingSpinner() {
  return (
    <DesignWorkWrapper componentName="RouteLoadingSpinner">
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <LoadingSpinner size="lg" text="Se încarcă..." />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Vă rugăm să așteptați...
          </p>
        </div>
      </div>
    </DesignWorkWrapper>
  )
}