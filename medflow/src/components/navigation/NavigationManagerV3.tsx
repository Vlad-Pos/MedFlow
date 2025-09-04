import React, { useMemo } from 'react'
import { useAuth } from '../../providers/AuthProvider'
import { 
  Home, 
  Calendar, 
  Users, 
  FileText, 
  User,
  BarChart3
} from 'lucide-react'
import type { NavigationItem, NavigationItems } from './types'

/**
 * Optimized Navigation Manager V3
 * 
 * This version focuses on performance and clean code with proper memoization
 */
export function useNavigationItemsV3(): NavigationItems {
  const { user } = useAuth()

  return useMemo(() => {
    // Core navigation items - always available
    const coreNavItems: NavigationItems = [
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
        to: '/test-appointments', 
        label: 'Consultation', 
        icon: Calendar, 
        description: 'Professional consultation workflow and patient management',
        priority: 2.3
      },
      { 
        to: '/calendar', 
        label: 'Calendar', 
        icon: Calendar, 
        description: 'Enhanced scheduling calendar with advanced features',
        priority: 2.5
      },
      { 
        to: '/patients', 
        label: 'Pacienți', 
        icon: Users, 
        description: 'Gestionează informațiile și istoricul pacienților',
        priority: 3.5
      },
      { 
        to: '/reports', 
        label: 'Rapoarte', 
        icon: FileText, 
        description: 'Generează și vizualizează rapoarte medicale',
        priority: 4.5
      },
      { 
        to: '/profile', 
        label: 'Profil', 
        icon: User, 
        description: 'Gestionează profilul și setările contului',
        priority: 5.5
      }
    ]

    // Add role-specific navigation items
    if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
      // Analytics for admin users - high priority
      coreNavItems.unshift({
        to: '/analytics', 
        label: 'Analytics', 
        icon: BarChart3, 
        description: 'Advanced analytics and performance metrics for administrators',
        priority: 0.5
      })
      
      // Admin Dashboard for admin users - high priority
      coreNavItems.unshift({
        to: '/admin', 
        label: 'Admin', 
        icon: Users, 
        description: 'User management and system administration',
        priority: 0.3
      })
    }

    // Add Framer websites integration for all users
    coreNavItems.push({
      to: '/framer-websites', 
      label: 'Websites', 
      icon: Home, 
      description: 'View your integrated Framer websites',
      priority: 6
    })

    // Sort by priority for consistent ordering
    return coreNavItems.sort((a, b) => a.priority - b.priority)
  }, [user?.role])
}

export default useNavigationItemsV3
