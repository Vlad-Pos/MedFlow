import { useEffect, useState } from 'react'

/**
 * Hook for dynamically loading calendar CSS
 * 
 * This hook loads the heavy react-big-calendar CSS only when needed,
 * improving initial bundle size and load performance.
 */
export function useCalendarCSS() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check if CSS is already loaded
    const existingLink = document.querySelector('link[href*="react-big-calendar"]')
    if (existingLink) {
      setIsLoaded(true)
      return
    }

    // Load CSS dynamically
    const loadCalendarCSS = async () => {
      setIsLoading(true)
      
      try {
        // Import the CSS dynamically
        await import('react-big-calendar/lib/css/react-big-calendar.css')
        setIsLoaded(true)
      } catch (error) {
        console.error('Failed to load calendar CSS:', error)
        // Fallback: create link element manually
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/react-big-calendar@1.19.4/lib/css/react-big-calendar.css'
        link.onload = () => setIsLoaded(true)
        link.onerror = () => console.error('Failed to load calendar CSS from CDN')
        document.head.appendChild(link)
      } finally {
        setIsLoading(false)
      }
    }

    // Load CSS when component mounts
    loadCalendarCSS()
  }, [])

  return { isLoaded, isLoading }
}

export default useCalendarCSS
