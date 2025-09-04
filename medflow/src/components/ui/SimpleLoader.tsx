import React from 'react'

interface SimpleLoaderProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

/**
 * SimpleLoader - A basic, reliable loading spinner that centers perfectly
 * This component doesn't rely on external CSS and provides consistent centering
 */
export const SimpleLoader: React.FC<SimpleLoaderProps> = ({
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  return (
    <div className={`loader ${className}`}></div>
  )
}

export default SimpleLoader
