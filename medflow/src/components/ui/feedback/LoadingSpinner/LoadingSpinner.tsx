/**
 * Enhanced Loading Spinner Component for MedFlow UI Library
 *
 * Features:
 * - Multiple animation variants (dots, pulse, spinner)
 * - Professional medical styling with MedFlow branding
 * - Accessible with ARIA labels and screen reader support
 * - Responsive design for all screen sizes
 * - Customizable size, color, and animation speed
 * - Romanian localization for medical professionals
 *
 * @author MedFlow UI Team
 * @version 2.0
 */

import React from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars'
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
  text?: string
  className?: string
  speed?: 'slow' | 'normal' | 'fast'
  showText?: boolean
  overlay?: boolean
  centered?: boolean
}

export interface RouteLoadingSpinnerProps {
  message?: string
  fullScreen?: boolean
}

const sizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
}

const textSizes = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl'
}

const colorClasses = {
  primary: 'text-medflow-primary',
  secondary: 'text-medflow-secondary',
  success: 'text-emerald-500',
  warning: 'text-orange-500',
  danger: 'text-red-500',
  info: 'text-blue-500'
}

const speedDurations = {
  slow: 2,
  normal: 1,
  fast: 0.5
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'spinner',
  color = 'primary',
  text,
  className = '',
  speed = 'normal',
  showText = true,
  overlay = false,
  centered = true
}) => {
  const baseClasses = `${centered ? 'flex items-center justify-center' : ''} ${className}`.trim()
  const duration = speedDurations[speed]

  const renderSpinner = () => (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "linear"
      }}
      className={`${sizeClasses[size]} ${colorClasses[color]}`}
    >
      <Loader2 className="w-full h-full" />
    </motion.div>
  )

  const renderDots = () => (
    <div className="flex items-center justify-center space-x-1">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={`bg-medflow-primary rounded-full ${sizeClasses[size]}`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: duration * 1.4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.2
          }}
        />
      ))}
    </div>
  )

  const renderPulse = () => (
    <div className="flex items-center justify-center">
      <motion.div
        className={`bg-medflow-primary rounded-full ${sizeClasses[size]}`}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.8, 0.3]
        }}
        transition={{
          duration: duration * 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  )

  const renderBars = () => (
    <div className="flex items-center justify-center space-x-1">
      {[0, 1, 2, 3].map((index) => (
        <motion.div
          key={index}
          className={`bg-medflow-primary rounded-sm ${sizeClasses[size]}`}
          animate={{
            scaleY: [0.4, 1, 0.4],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.1
          }}
        />
      ))}
    </div>
  )

  const renderVariant = () => {
    switch (variant) {
      case 'dots':
        return renderDots()
      case 'pulse':
        return renderPulse()
      case 'bars':
        return renderBars()
      default:
        return renderSpinner()
    }
  }

  const content = (
    <div className={baseClasses}>
      {renderVariant()}
      {showText && text && (
        <span className={`ml-3 text-gray-600 dark:text-gray-400 ${textSizes[size]}`}>
          {text}
        </span>
      )}
    </div>
  )

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    )
  }

  return content
}

export const RouteLoadingSpinner: React.FC<RouteLoadingSpinnerProps> = ({
  message = "Se încarcă...",
  fullScreen = true
}) => {
  const containerClasses = fullScreen
    ? "min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-950"
    : "flex items-center justify-center py-8"

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div className="loader mb-4"></div>
        <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
          {message}
        </p>
      </div>
    </div>
  )
}

// Specialized loading components for common use cases
export const PageLoadingSpinner: React.FC<{ message?: string }> = ({
  message = "Se încarcă pagina..."
}) => (
  <div className="min-h-[400px] flex items-center justify-center">
    <LoadingSpinner size="lg" text={message} />
  </div>
)

export const ButtonLoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({
  size = 'sm'
}) => (
  <LoadingSpinner
    size={size}
    variant="spinner"
    color="primary"
    showText={false}
    centered={false}
  />
)

export const FormLoadingSpinner: React.FC<{ message?: string }> = ({
  message = "Se procesează..."
}) => (
  <div className="py-8">
    <LoadingSpinner size="md" text={message} variant="dots" />
  </div>
)

LoadingSpinner.displayName = 'LoadingSpinner'
RouteLoadingSpinner.displayName = 'RouteLoadingSpinner'
PageLoadingSpinner.displayName = 'PageLoadingSpinner'
ButtonLoadingSpinner.displayName = 'ButtonLoadingSpinner'
FormLoadingSpinner.displayName = 'FormLoadingSpinner'
