import React from 'react'
import { useAuth } from '../../providers/AuthProvider'
import { useRole } from '../../hooks/useRole'
import { isDemoMode } from '../../utils/demo'

/**
 * Authentication Test Component
 * 
 * This component helps debug authentication and role issues
 */
export function AuthTest() {
  const { user, initializing } = useAuth()
  const { role, isAdmin, isSuperAdmin } = useRole()
  const demoMode = isDemoMode()

  return (
    <div className="fixed top-4 left-4 bg-red-800 text-white p-4 rounded-lg text-xs z-50 max-w-xs">
      <div className="font-bold mb-2">Auth Test</div>
      <div>Demo Mode: {demoMode ? '✅ Enabled' : '❌ Disabled'}</div>
      <div>Initializing: {initializing ? '✅ Yes' : '❌ No'}</div>
      <div>User: {user ? '✅ Authenticated' : '❌ Not authenticated'}</div>
      {user && (
        <>
          <div>Email: {user.email}</div>
          <div>Display Name: {user.displayName}</div>
          <div>Role: {role || 'None'}</div>
          <div>Is Admin: {isAdmin ? '✅ Yes' : '❌ No'}</div>
          <div>Is Super Admin: {isSuperAdmin ? '✅ Yes' : '❌ No'}</div>
        </>
      )}
    </div>
  )
}

export default AuthTest
