/**
 * Enhanced Theme Provider for MedFlow
 * 
 * Features:
 * - Professional MedFlow dark/light mode switching
 * - Smooth theme transitions with animations
 * - System preference detection and synchronization
 * - localStorage persistence for user preferences
 * - Medical-appropriate color schemes
 * - AI integration placeholders for theme personalization
 * 
 * @author MedFlow Team
 * @version 2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ThemeContextType {
  isDarkMode: boolean
  toggleTheme: () => void
  setTheme: (isDark: boolean) => void
  isSystemTheme: boolean
  setSystemTheme: (useSystem: boolean) => void
  themeTransition: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false)
  const [isSystemTheme, setIsSystemTheme] = useState<boolean>(true)
  const [themeTransition, setThemeTransition] = useState<boolean>(false)

  // Detect system theme preference
  const getSystemTheme = useCallback(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }, [])

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('medflow-theme')
    const savedSystemPref = localStorage.getItem('medflow-use-system-theme')
    
    if (savedSystemPref !== null) {
      const useSystem = savedSystemPref === 'true'
      setIsSystemTheme(useSystem)
      
      if (useSystem) {
        setIsDarkMode(getSystemTheme())
      } else if (savedTheme) {
        setIsDarkMode(savedTheme === 'dark')
      }
    } else {
      // First time - use system preference
      setIsDarkMode(getSystemTheme())
    }
  }, [getSystemTheme])

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement
    setThemeTransition(true)
    
    if (isDarkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // Save to localStorage if not using system theme
    if (!isSystemTheme) {
      localStorage.setItem('medflow-theme', isDarkMode ? 'dark' : 'light')
    }

    // Reset transition flag after animation
    const timer = setTimeout(() => {
      setThemeTransition(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [isDarkMode, isSystemTheme])

  // Listen for system theme changes
  useEffect(() => {
    if (!isSystemTheme) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [isSystemTheme])

  // Toggle theme manually
  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev)
    setIsSystemTheme(false)
    localStorage.setItem('medflow-use-system-theme', 'false')
  }, [])

  // Set theme explicitly
  const setTheme = useCallback((isDark: boolean) => {
    setIsDarkMode(isDark)
    setIsSystemTheme(false)
    localStorage.setItem('medflow-use-system-theme', 'false')
  }, [])

  // Set system theme preference
  const setSystemTheme = useCallback((useSystem: boolean) => {
    setIsSystemTheme(useSystem)
    localStorage.setItem('medflow-use-system-theme', useSystem.toString())
    
    if (useSystem) {
      setIsDarkMode(getSystemTheme())
      localStorage.removeItem('medflow-theme')
    }
  }, [getSystemTheme])

  const value: ThemeContextType = {
    isDarkMode,
    toggleTheme,
    setTheme,
    isSystemTheme,
    setSystemTheme,
    themeTransition
  }

  return (
    <ThemeContext.Provider value={value}>
      {/* Theme transition overlay */}
      <AnimatePresence>
        {themeTransition && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-medflow-primary z-[9999] pointer-events-none"
            style={{
              background: `linear-gradient(45deg, var(--medflow-primary), var(--medflow-secondary))`
            }}
          />
        )}
      </AnimatePresence>
      
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

/**
 * Enhanced Theme Toggle Component with MedFlow Styling
 */
interface ThemeToggleProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  variant?: 'button' | 'switch' | 'icon'
}

export function ThemeToggle({ 
  className = '', 
  size = 'md', 
  showLabel = false,
  variant = 'switch'
}: ThemeToggleProps) {
  const { isDarkMode, toggleTheme, isSystemTheme, setSystemTheme } = useTheme()

  const sizeClasses = {
    sm: 'w-8 h-4',
    md: 'w-11 h-6',
    lg: 'w-14 h-7'
  }

  const thumbSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const translateClasses = {
    sm: isDarkMode ? 'translate-x-4' : 'translate-x-0.5',
    md: isDarkMode ? 'translate-x-6' : 'translate-x-1',
    lg: isDarkMode ? 'translate-x-7' : 'translate-x-1'
  }

  if (variant === 'switch') {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        {showLabel && (
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {isDarkMode ? 'Mod întunecat' : 'Mod luminos'}
            {isSystemTheme && (
              <span className="text-xs text-gray-500 ml-1">(sistem)</span>
            )}
          </span>
        )}
        
        <motion.button
          onClick={toggleTheme}
          className={`relative inline-flex ${sizeClasses[size]} items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-medflow-primary focus:ring-offset-2 ${
            isDarkMode 
              ? 'bg-medflow-primary' 
              : 'bg-gray-300 dark:bg-gray-600'
          }`}
          whileTap={{ scale: 0.95 }}
          role="switch"
          aria-checked={isDarkMode}
          aria-label={isDarkMode ? 'Comutați la modul luminos' : 'Comutați la modul întunecat'}
        >
          <motion.span
            className={`inline-block ${thumbSizeClasses[size]} transform rounded-full bg-white shadow-lg transition-transform duration-200 ${translateClasses[size]}`}
            layout
          >
            <motion.div
              className="w-full h-full flex items-center justify-center"
              initial={false}
              animate={{ rotate: isDarkMode ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isDarkMode ? (
                <svg className="w-2/3 h-2/3 text-medflow-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-2/3 h-2/3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              )}
            </motion.div>
          </motion.span>
        </motion.button>
      </div>
    )
  }

  if (variant === 'button') {
    return (
      <motion.button
        onClick={toggleTheme}
        className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
          isDarkMode 
            ? 'bg-gray-800 text-white hover:bg-gray-700' 
            : 'bg-white text-gray-800 hover:bg-gray-100'
        } border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md ${className}`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        aria-label={`Comută la tema ${isDarkMode ? 'deschisă' : 'închisă'}`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
        {showLabel && (
          <span className="text-sm font-medium">{isDarkMode ? 'Mod întunecat' : 'Mod luminos'}</span>
        )}
      </motion.button>
    )
  }

  if (variant === 'icon') {
    return (
      <motion.button
        onClick={toggleTheme}
        className={`p-2 rounded-lg transition-all duration-200 ${
          isDarkMode 
            ? 'bg-gray-800 text-white hover:bg-gray-700' 
            : 'bg-white text-gray-800 hover:bg-gray-100'
        } border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md ${className}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={`Comută la tema ${isDarkMode ? 'deschisă' : 'închisă'}`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
      </motion.button>
    )
  }

  // Default switch variant
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
        {showLabel && (
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {isDarkMode ? 'Mod întunecat' : 'Mod luminos'}
            {isSystemTheme && (
              <span className="text-xs text-gray-500 ml-1">(sistem)</span>
            )}
          </span>
        )}
        
        <motion.button
          onClick={toggleTheme}
          className={`relative inline-flex ${sizeClasses[size]} items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-medflow-primary focus:ring-offset-2 ${
            isDarkMode 
              ? 'bg-medflow-primary' 
              : 'bg-gray-300 dark:bg-gray-600'
          }`}
          whileTap={{ scale: 0.95 }}
          role="switch"
          aria-checked={isDarkMode}
          aria-label={isDarkMode ? 'Comutați la modul luminos' : 'Comutați la modul întunecat'}
        >
          <motion.span
            className={`inline-block ${thumbSizeClasses[size]} transform rounded-full bg-white shadow-lg transition-transform duration-200 ${translateClasses[size]}`}
            layout
          >
            <motion.div
              className="w-full h-full flex items-center justify-center"
              initial={false}
              animate={{ rotate: isDarkMode ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isDarkMode ? (
                <svg className="w-2/3 h-2/3 text-medflow-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-2/3 h-2/3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              )}
            </motion.div>
          </motion.span>
        </motion.button>
      </div>
    )
}

/**
 * AI Integration Placeholder: Theme Personalization
 */
export function useAIThemePersonalization() {
  const { isDarkMode } = useTheme()
  
  // AI Placeholder: This will be enhanced with AI-driven theme personalization
  // Based on user behavior, time of day, medical context, etc.
  
  return {
    suggestedTheme: isDarkMode ? 'dark' : 'light',
    confidence: 0.85,
    reasoning: '🤖 AI: Tema optimă bazată pe preferințele dvs. va fi disponibilă în curând',
    recommendations: [
      'Mod întunecat recomandat pentru sesiuni lungi',
      'Mod luminos recomandat pentru examinări detaliate'
    ]
  }
}
