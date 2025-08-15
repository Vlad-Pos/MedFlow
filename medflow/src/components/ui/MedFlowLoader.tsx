import React from 'react'

interface MedFlowLoaderProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showText?: boolean
  text?: string
}

/**
 * MedFlowLoader - Centralized loading animation component
 * 
 * This component provides a single source of truth for all loading animations
 * across the MedFlow application. Future animation changes only need to be
 * made here.
 * 
 * Usage:
 * - <MedFlowLoader /> - Default size with no text
 * - <MedFlowLoader size="lg" /> - Large size
 * - <MedFlowLoader size="sm" showText text="Loading..." /> - Small with text
 */
export const MedFlowLoader: React.FC<MedFlowLoaderProps> = ({
  size = 'md',
  className = '',
  showText = false,
  text = 'Se încarcă...'
}) => {
  // Size-based scaling for the loader
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  }

  // Text size based on loader size
  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="loader"></div>
      {showText && (
        <p className={`${textSizeClasses[size]} font-medium text-gray-600 dark:text-gray-400 mt-2 text-center`}>
          {text}
        </p>
      )}
    </div>
  )
}

export default MedFlowLoader
