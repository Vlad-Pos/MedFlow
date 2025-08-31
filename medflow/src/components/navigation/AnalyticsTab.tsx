import React from 'react'
import { BarChart3 } from 'lucide-react'
import { useRole } from '../../hooks/useRole'

/**
 * Analytics Tab Component
 * 
 * This component renders the analytics navigation tab only for users with
 * ADMIN role. It's designed to be modular and reusable.
 * 
 * Features:
 * - Role-based visibility
 * - Consistent styling with other nav items
 * - Accessibility support
 * - Performance optimized with conditional rendering
 */
export function AnalyticsTab() {
  const { isAdmin } = useRole()

  // Only render for admin users
  if (!isAdmin) {
    return null
  }

  return {
    to: '/analytics',
    label: 'Analytics',
    icon: BarChart3,
    description: 'Advanced analytics and performance metrics for administrators',
    priority: 'high' // High priority to place it early in navigation
  }
}

export default AnalyticsTab
