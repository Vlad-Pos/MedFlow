import React from 'react'
import { Link, useLocation } from 'react-router-dom'

/**
 * Minimal Navigation Test Component
 * 
 * This component tests basic React Router navigation without any complex logic
 */
export function MinimalNavigationTest() {
  const location = useLocation()
  
  const testLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/appointments', label: 'Appointments' },
    { to: '/patients', label: 'Patients' },
    { to: '/reports', label: 'Reports' },
    { to: '/profile', label: 'Profile' },
    { to: '/analytics', label: 'Analytics' }
  ]

  return (
    <div className="fixed bottom-4 left-4 bg-blue-800 text-white p-4 rounded-lg text-xs z-50 max-w-xs">
      <div className="font-bold mb-2">Minimal Navigation Test</div>
      <div className="mb-2">Current: {location.pathname}</div>
      <div className="space-y-1">
        {testLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="block px-2 py-1 bg-blue-700 rounded hover:bg-blue-600 transition-colors text-center"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

export default MinimalNavigationTest
