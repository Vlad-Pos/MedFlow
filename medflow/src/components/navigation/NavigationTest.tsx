import React from 'react'
import { useNavigationItemsV2 } from './NavigationManagerV2'
import { useAuth } from '../../providers/AuthProvider'
import { useRole } from '../../hooks/useRole'

/**
 * Navigation Test Component
 * 
 * This component helps test and debug navigation functionality
 */
export function NavigationTest() {
  const { user } = useAuth()
  const { role, isAdmin, isSuperAdmin } = useRole()
  const navItems = useNavigationItemsV2()

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed top-4 left-4 bg-black/80 text-white p-4 rounded-lg text-xs z-50 max-w-xs">
      <div className="font-bold mb-2">Navigation Test</div>
      <div>User: {user ? '✅ Authenticated' : '❌ Not authenticated'}</div>
      <div>Role: {role || 'None'}</div>
      <div>Is Admin: {isAdmin ? '✅ Yes' : '❌ No'}</div>
      <div>Is Super Admin: {isSuperAdmin ? '✅ Yes' : '❌ No'}</div>
      <div>Nav Items: {navItems.length}</div>
      <div className="mt-2">
        {navItems.map((item, index) => (
          <div key={item.to} className="text-xs">
            {index + 1}. {item.label} → {item.to} (Priority: {item.priority})
          </div>
        ))}
      </div>
    </div>
  )
}

export default NavigationTest
