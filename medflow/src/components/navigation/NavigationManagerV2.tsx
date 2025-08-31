import React, { useMemo } from 'react'
import { useAuth } from '../../providers/AuthProvider'
import { useRole } from '../../hooks/useRole'
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
 * Enhanced Navigation Manager V2
 * 
 * This component provides a more robust navigation system with:
 * - Better error handling
 * - Performance optimization with useMemo
 * - Fallback navigation items
 * - Debug logging
 */
export function useNavigationItemsV2(): NavigationItems {
  const { user } = useAuth()
  const { isAdmin } = useRole()

  return useMemo((): NavigationItems => {
    try {
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
        console.log('🔍 Navigation V2 Debug:', {
          user: !!user,
                  isAdmin,
          adminNavItems: adminNavItems.length,
          baseNavItems: baseNavItems.length,
          totalItems: sortedNavItems.length,
          items: sortedNavItems.map(item => ({ to: item.to, label: item.label, priority: item.priority }))
        })
      }

      return sortedNavItems
    } catch (error) {
      console.error('❌ Navigation Manager Error:', error)
      
      // Fallback navigation items
      return [
        { 
          to: '/dashboard', 
          label: 'Dashboard', 
          icon: Home, 
          description: 'Prezentare generală și statistici rapide',
          priority: 1
        }
      ]
    }
  }, [user, isAdmin])
}

export default useNavigationItemsV2
