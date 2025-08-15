import React from 'react'
import { useAuth } from '../../providers/AuthProvider'
import { useRole } from '../../hooks/useRole'
import { AnalyticsTab } from './AnalyticsTab'
import { 
  Home, 
  Calendar, 
  Users, 
  FileText, 
  User,
  BarChart3
} from 'lucide-react'

/**
 * Navigation Manager
 * 
 * This component manages the dynamic navigation structure based on user roles.
 * It provides a centralized way to control navigation visibility and ordering.
 * 
 * Features:
 * - Dynamic navigation based on user roles
 * - Role-based tab visibility
 * - Consistent navigation structure
 * - Easy to maintain and extend
 */
export function useNavigationItems() {
  const { user } = useAuth()
  const { isAdmin } = useRole()

  // Base navigation items (always visible for authenticated users)
  const baseNavItems = [
    { 
      to: '/dashboard', 
      label: 'Dashboard', 
      icon: Home, 
      description: 'Prezentare generală și statistici rapide',
      priority: 1
    },
    { 
      to: '/appointments', 
      label: 'Programări', 
      icon: Calendar, 
      description: 'Gestionează programările zilnice și săptămânale',
      priority: 2
    },
    { 
      to: '/patients', 
      label: 'Pacienți', 
      icon: Users, 
      description: 'Gestionează informațiile și istoricul pacienților',
      priority: 3
    },
    { 
      to: '/reports', 
      label: 'Rapoarte', 
      icon: FileText, 
      description: 'Generează și vizualizează rapoarte medicale',
      priority: 4
    },
    { 
      to: '/profile', 
      label: 'Profil', 
      icon: User, 
      description: 'Gestionează profilul și setările contului',
      priority: 5
    }
  ]

  // Admin-only navigation items
  const adminNavItems = isAdmin ? [
    { 
      to: '/analytics', 
      label: 'Analytics', 
      icon: BarChart3, 
      description: 'Advanced analytics and performance metrics for administrators',
      priority: 0.5 // High priority - appears first
    }
  ] : []

  // Additional navigation items (conditional)
  const additionalNavItems = [
    { 
      to: '/framer-websites', 
      label: 'Websites', 
      icon: Home, 
      description: 'View your integrated Framer websites',
      priority: 6
    }
  ]

  // Combine all navigation items
  const allNavItems = [
    ...adminNavItems,
    ...baseNavItems,
    ...additionalNavItems
  ]

  // Sort by priority (lower numbers = higher priority)
  const sortedNavItems = allNavItems.sort((a, b) => a.priority - b.priority)

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Navigation Debug:', {
      user: !!user,
      isAdmin,
      adminNavItems: adminNavItems.length,
      baseNavItems: baseNavItems.length,
      totalItems: sortedNavItems.length,
      items: sortedNavItems.map(item => ({ to: item.to, label: item.label, priority: item.priority }))
    })
  }

  return sortedNavItems
}

export default useNavigationItems
