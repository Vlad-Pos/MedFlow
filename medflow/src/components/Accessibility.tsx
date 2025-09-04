import { useEffect, useState, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Eye, 
  EyeOff, 
  ZoomIn, 
  ZoomOut,
  Contrast,
  Sun,
  } from 'lucide-react'
interface AccessibilityProps {
  children: ReactNode
  className?: string
}

// High contrast mode component
export function HighContrastMode({ children, className = '' }: AccessibilityProps) {
  const [isHighContrast, setIsHighContrast] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('highContrast')
    if (saved === 'true') {
      setIsHighContrast(true)
      document.documentElement.classList.add('high-contrast')
    }
  }, [])

  const toggleHighContrast = () => {
    setIsHighContrast(!isHighContrast)
    if (!isHighContrast) {
      document.documentElement.classList.add('high-contrast')
      localStorage.setItem('highContrast', 'true')
    } else {
      document.documentElement.classList.remove('high-contrast')
      localStorage.setItem('highContrast', 'false')
    }
  }

  return (
    <div className={className}>
        <button
          onClick={toggleHighContrast}
          className="fixed bottom-4 right-4 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label={isHighContrast ? 'Disable high contrast' : 'Enable high contrast'}
        >
          <Contrast className="w-5 h-5" />
        </button>
        {children}
      </div>
    )
}

// Font size controls
export function FontSizeControls({ children, className = '' }: AccessibilityProps) {
  const [fontSize, setFontSize] = useState(100)

  useEffect(() => {
    const saved = localStorage.getItem('fontSize')
    if (saved) {
      setFontSize(parseInt(saved))
      document.documentElement.style.fontSize = `${saved}%`
    }
  }, [])

  const increaseFontSize = () => {
    const newSize = Math.min(fontSize + 10, 200)
    setFontSize(newSize)
    document.documentElement.style.fontSize = `${newSize}%`
    localStorage.setItem('fontSize', newSize.toString())
  }

  const decreaseFontSize = () => {
    const newSize = Math.max(fontSize - 10, 80)
    setFontSize(newSize)
    document.documentElement.style.fontSize = `${newSize}%`
    localStorage.setItem('fontSize', newSize.toString())
  }

  return (
    <div className={className}>
        <div className="fixed bottom-4 left-4 z-50 flex gap-2">
          <button
            onClick={decreaseFontSize}
            className="p-3 bg-gray-600 text-white rounded-full shadow-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            aria-label="Decrease font size"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <button
            onClick={increaseFontSize}
            className="p-3 bg-gray-600 text-white rounded-full shadow-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            aria-label="Increase font size"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    )
}

// Reduced motion component
export function ReducedMotion({ children, className = '' }: AccessibilityProps) {
  const [isReducedMotion, setIsReducedMotion] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('reducedMotion')
    if (saved === 'true') {
      setIsReducedMotion(true)
      document.documentElement.classList.add('reduced-motion')
    }
  }, [])

  const toggleReducedMotion = () => {
    setIsReducedMotion(!isReducedMotion)
    if (!isReducedMotion) {
      document.documentElement.classList.add('reduced-motion')
      localStorage.setItem('reducedMotion', 'true')
    } else {
      document.documentElement.classList.remove('reduced-motion')
      localStorage.setItem('reducedMotion', 'false')
    }
  }

  return (
    <div className={className}>
        <button
          onClick={toggleReducedMotion}
          className="fixed bottom-4 right-20 z-50 p-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          aria-label={isReducedMotion ? 'Enable animations' : 'Disable animations'}
        >
          {isReducedMotion ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
        {children}
      </div>
    )
}

// Screen reader only text
export function ScreenReaderOnly({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span className={`sr-only ${className}`}>
      {children}
    </span>
  )
}

// Skip to main content link
export function SkipToMainContent() {
  const handleSkip = () => {
    const main = document.querySelector('main')
    if (main) {
      main.focus()
      main.scrollIntoView()
    }
  }

  return (
    <AnimatePresence>
      <motion.a
        href="#main-content"
        onClick={handleSkip}
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        Skip to main content
      </motion.a>
    </AnimatePresence>
  )
}

// Focus trap component
export function FocusTrap({ children, className = '' }: AccessibilityProps) {
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsActive(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className={className}>
        {isActive && (
          <div className="fixed inset-0 z-40 bg-black/50" />
        )}
        {children}
      </div>
    )
}

// Live region for announcements
export function LiveRegion({ children, className = '', 'aria-live': ariaLive = 'polite' }: {
  children: ReactNode
  className?: string
  'aria-live'?: 'polite' | 'assertive' | 'off'
}) {
  return (
    <div
        className={className}
        aria-live={ariaLive}
        aria-atomic="true"
      >
        {children}
      </div>
    )
}

// Accessibility toolbar
export function AccessibilityToolbar({ children, className = '' }: AccessibilityProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={className}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed bottom-4 right-4 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Accessibility options"
          aria-expanded={isOpen}
        >
          <Sun className="w-5 h-5" />
        </button>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="fixed bottom-16 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4"
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="space-y-2">
                <button
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  onClick={() => {
                    // Toggle high contrast
                  }}
                >
                  High Contrast
                </button>
                <button
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  onClick={() => {
                    // Increase font size
                  }}
                >
                  Larger Text
                </button>
                <button
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  onClick={() => {
                    // Toggle reduced motion
                  }}
                >
                  Reduce Motion
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {children}
      </div>
    )
}

// Keyboard navigation component
export function KeyboardNavigation({ children, className = '' }: AccessibilityProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle keyboard shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '1':
            e.preventDefault()
            window.location.href = '/dashboard'
            break
          case '2':
            e.preventDefault()
            window.location.href = '/appointments'
            break
          case '3':
            e.preventDefault()
            window.location.href = '/analytics'
            break
          case '4':
            e.preventDefault()
            window.location.href = '/profile'
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return <div className={className}>{children}</div>
}

