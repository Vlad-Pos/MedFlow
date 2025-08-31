import React from 'react'
import { useAuth } from '../../providers/AuthProvider'
import { useRole } from '../../hooks/useRole'

/**
 * Navigation Debug Component
 * 
 * This component helps debug navigation issues by displaying
 * current user state and navigation data.
 */
export function NavigationDebug() {
  const { user } = useAuth()
  const { role, isAdmin, isUser } = useRole()

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs z-50 max-w-xs">
      <div className="font-bold mb-2">Navigation Debug</div>
      <div>User: {user ? 'Authenticated' : 'Not authenticated'}</div>
      <div>Role: {role || 'None'}</div>
      <div>Is Admin: {isAdmin ? 'Yes' : 'No'}</div>
      
      <div>Is User: {isUser ? 'Yes' : 'No'}</div>
    </div>
  )
}

export default NavigationDebug
