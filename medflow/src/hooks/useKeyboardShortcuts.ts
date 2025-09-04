import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if Ctrl/Cmd is pressed and not in input fields
      if ((e.ctrlKey || e.metaKey) && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        switch (e.key.toLowerCase()) {
          case 'd':
            e.preventDefault()
            navigate('/dashboard')
            break
          case 'p':
            e.preventDefault()
            navigate('/patients')
            break
          case 'a':
            e.preventDefault()
            navigate('/appointments')
            break
          case 'r':
            e.preventDefault()
            navigate('/reports')
            break
          case 'k':
            e.preventDefault()
            // Focus search - could implement global search later
            const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement
            if (searchInput) {
              searchInput.focus()
            }
            break
          case '/':
            e.preventDefault()
            // Focus patient search specifically
            const patientSearch = document.querySelector('input[placeholder*="pacient"]') as HTMLInputElement
            if (patientSearch) {
              patientSearch.focus()
            }
            break
        }
      }
      
      // Escape key to close modals/dropdowns
      if (e.key === 'Escape') {
        // Close any open dropdowns or modals
        const openDropdowns = document.querySelectorAll('[data-dropdown-open="true"]')
        openDropdowns.forEach(dropdown => {
          dropdown.setAttribute('data-dropdown-open', 'false')
        })
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [navigate])
}

// Keyboard shortcuts data for help display
export const getKeyboardShortcuts = () => [
  { key: 'Ctrl + D', action: 'Mergi la Dashboard' },
  { key: 'Ctrl + P', action: 'Mergi la Pacienți' },
  { key: 'Ctrl + A', action: 'Mergi la Programări' },
  { key: 'Ctrl + R', action: 'Mergi la Rapoarte' },
  { key: 'Ctrl + K', action: 'Focalizează căutarea' },
  { key: 'Ctrl + /', action: 'Căutare pacient' },
  { key: 'Esc', action: 'Închide meniuri' }
]
