import { ReactNode } from 'react'
import DesignWorkWrapper from '../../DesignWorkWrapper'

interface ContrastEnhancerProps {
  children: ReactNode
  level?: 'normal' | 'high' | 'maximum'
  className?: string
}

export default function ContrastEnhancer({ 
  children, 
  level = 'normal',
  className = '' 
}: ContrastEnhancerProps) {
  const getContrastClasses = () => {
    switch (level) {
      case 'high':
        return 'text-medflow-text-high-contrast surface-high-contrast'
      case 'maximum':
        return 'text-high-contrast surface-elevated-high-contrast'
      default:
        return ''
    }
  }

  return (
    <DesignWorkWrapper componentName="ContrastEnhancer">
      <div className={`${getContrastClasses()} ${className}`}>
        {children}
      </div>
    </DesignWorkWrapper>
  )
}

// Hook for applying contrast enhancements based on user preferences
export const useContrastEnhancement = () => {
  // This could be connected to user preferences or system settings
  // For now, returning a function that applies high contrast classes
  
  const applyContrast = (baseClasses: string, level: 'normal' | 'high' | 'maximum' = 'normal') => {
    const contrastClasses = {
      normal: '',
      high: 'text-medflow-text-high-contrast-secondary',
      maximum: 'text-high-contrast'
    }
    
    return `${baseClasses} ${contrastClasses[level]}`
  }

  return { applyContrast }
}

// Utility function to enhance text contrast
export const enhanceTextContrast = (element: HTMLElement, level: 'normal' | 'high' | 'maximum' = 'normal') => {
  const contrastClasses = {
    normal: '',
    high: 'text-high-contrast-secondary',
    maximum: 'text-high-contrast'
  }
  
  if (level !== 'normal') {
    element.classList.add(contrastClasses[level])
  }
}
