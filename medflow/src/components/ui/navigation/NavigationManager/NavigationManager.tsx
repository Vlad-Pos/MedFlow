/**
 * Enhanced Navigation Manager Component for MedFlow UI Library
 *
 * Features:
 * - Dynamic navigation based on user roles and permissions
 * - Professional medical styling with MedFlow branding
 * - Accessible navigation with ARIA labels
 * - Responsive design for all screen sizes
 * - Romanian localization for medical professionals
 * - Role-based navigation item visibility
 * - Navigation analytics and tracking
 * - Smooth animations and transitions
 * - Search and filtering capabilities
 *
 * @author MedFlow UI Team
 * @version 2.0
 */

import React, { useMemo } from 'react'
import { useAuth } from '../../../../providers/AuthProvider'
import { useRole } from '../../../../hooks/useRole'

export interface NavigationItem {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  priority: number
  category?: string
  requiredRole?: string[]
  requiredPermission?: string[]
  badge?: string | number
  isExternal?: boolean
  isNew?: boolean
  isBeta?: boolean
}

export interface NavigationManagerProps {
  onNavigate?: (item: NavigationItem) => void
  currentPath?: string
  collapsed?: boolean
  showDescriptions?: boolean
  showBadges?: boolean
  className?: string
}

export interface NavigationGroup {
  title: string
  items: NavigationItem[]
  priority: number
}

/**
 * Enhanced Navigation Manager Hook
 * Provides centralized navigation logic with role-based filtering
 */
export const useNavigationItems = (): {
  allItems: NavigationItem[]
  visibleItems: NavigationItem[]
  groupedItems: NavigationGroup[]
  hasPermission: (item: NavigationItem) => boolean
} => {
  const { user } = useAuth()
  const { isAdmin, hasPermission } = useRole()

  // Base navigation items (always visible for authenticated users)
  const baseNavItems: NavigationItem[] = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: ({ className }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0a2 2 0 01-2 2H10a2 2 0 01-2-2v0z" />
        </svg>
      ),
      description: 'Prezentare generală și statistici rapide',
      priority: 1,
      category: 'main'
    },
    {
      to: '/appointments',
      label: 'Programări',
      icon: ({ className }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      description: 'Gestionează programările zilnice și săptămânale',
      priority: 2,
      category: 'main'
    },
    {
      to: '/patients',
      label: 'Pacienți',
      icon: ({ className }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      description: 'Gestionează informațiile și istoricul pacienților',
      priority: 3,
      category: 'main'
    },
    {
      to: '/reports',
      label: 'Rapoarte',
      icon: ({ className }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      description: 'Generează și vizualizează rapoarte medicale',
      priority: 4,
      category: 'main'
    },
    {
      to: '/profile',
      label: 'Profil',
      icon: ({ className }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      description: 'Gestionează profilul și setările contului',
      priority: 5,
      category: 'account'
    }
  ]

  // Admin-only navigation items
  const adminNavItems: NavigationItem[] = isAdmin ? [
    {
      to: '/analytics',
      label: 'Analytics',
      icon: ({ className }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      description: 'Advanced analytics and performance metrics for administrators',
      priority: 0.5,
      category: 'admin',
      requiredRole: ['admin'],
      badge: 'Admin'
    }
  ] : []

  // Additional navigation items (conditional)
  const additionalNavItems: NavigationItem[] = [
    {
      to: '/framer-websites',
      label: 'Websites',
      icon: ({ className }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
        </svg>
      ),
      description: 'View your integrated Framer websites',
      priority: 6,
      category: 'external',
      isExternal: true,
      isNew: true
    }
  ]

  // Combine all navigation items
  const allItems = [
    ...adminNavItems,
    ...baseNavItems,
    ...additionalNavItems
  ]

  // Filter items based on permissions and roles
  const visibleItems = useMemo(() => {
    return allItems.filter((item) => {
      // Check role requirements
      if (item.requiredRole && !item.requiredRole.includes('user')) {
        if (item.requiredRole.includes('admin') && !isAdmin) {
          return false
        }
      }

      // Check permission requirements
      if (item.requiredPermission) {
        return item.requiredPermission.every(permission => hasPermission(permission))
      }

      return true
    })
  }, [allItems, isAdmin, hasPermission])

  // Group items by category
  const groupedItems = useMemo(() => {
    const groups: { [key: string]: NavigationItem[] } = {}

    visibleItems.forEach(item => {
      const category = item.category || 'other'
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(item)
    })

    return Object.entries(groups).map(([title, items]) => ({
      title: title.charAt(0).toUpperCase() + title.slice(1),
      items: items.sort((a, b) => a.priority - b.priority),
      priority: Math.min(...items.map(item => item.priority))
    })).sort((a, b) => a.priority - b.priority)
  }, [visibleItems])

  const hasPermissionForItem = (item: NavigationItem): boolean => {
    if (item.requiredRole && !item.requiredRole.includes('user')) {
      if (item.requiredRole.includes('admin') && !isAdmin) {
        return false
      }
    }

    if (item.requiredPermission) {
      return item.requiredPermission.every(permission => hasPermission(permission))
    }

    return true
  }

  return {
    allItems,
    visibleItems,
    groupedItems,
    hasPermission: hasPermissionForItem
  }
}

/**
 * Navigation Item Component
 * Individual navigation item with enhanced features
 */
export interface NavigationItemProps {
  item: NavigationItem
  isActive?: boolean
  collapsed?: boolean
  showDescription?: boolean
  onClick?: () => void
  className?: string
}

export const NavigationItem: React.FC<NavigationItemProps> = ({
  item,
  isActive = false,
  collapsed = false,
  showDescription = true,
  onClick,
  className = ''
}) => {
  const Icon = item.icon

  const baseClasses = `
    relative flex items-center px-3 py-2 rounded-lg transition-all duration-200
    hover:bg-gray-100 dark:hover:bg-gray-800 group
    ${isActive
      ? 'bg-medflow-primary text-white shadow-lg'
      : 'text-gray-700 dark:text-gray-300 hover:text-medflow-primary'
    }
    ${className}
  `.trim()

  return (
    <button
      onClick={onClick}
      className={baseClasses}
      aria-label={item.label}
    >
      <div className="flex items-center">
        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'} group-hover:text-medflow-primary`} />
        {!collapsed && (
          <span className="ml-3 font-medium">
            {item.label}
          </span>
        )}
      </div>

      {!collapsed && item.badge && (
        <span className={`
          ml-auto px-2 py-1 text-xs font-medium rounded-full
          ${isActive
            ? 'bg-white/20 text-white'
            : 'bg-medflow-primary/10 text-medflow-primary'
          }
        `}>
          {item.badge}
        </span>
      )}

      {!collapsed && item.isNew && (
        <span className="ml-auto px-2 py-1 text-xs font-medium bg-emerald-500 text-white rounded-full">
          Nou
        </span>
      )}

      {!collapsed && item.isBeta && (
        <span className="ml-auto px-2 py-1 text-xs font-medium bg-orange-500 text-white rounded-full">
          Beta
        </span>
      )}

      {!collapsed && item.isExternal && (
        <svg className="ml-auto w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      )}

      {!collapsed && showDescription && item.description && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
          {item.description}
        </div>
      )}
    </button>
  )
}

/**
 * Navigation Manager Component
 * Main navigation container with enhanced features
 */
export const NavigationManager: React.FC<NavigationManagerProps> = ({
  onNavigate,
  currentPath = '',
  collapsed = false,
  showDescriptions = true,
  showBadges = true,
  className = ''
}) => {
  const { visibleItems, groupedItems } = useNavigationItems()

  const handleNavigate = (item: NavigationItem) => {
    if (onNavigate) {
      onNavigate(item)
    }
  }

  if (collapsed) {
    return (
      <nav className={`space-y-1 ${className}`}>
        {visibleItems.map((item) => (
          <NavigationItem
            key={item.to}
            item={item}
            isActive={currentPath === item.to}
            collapsed={true}
            onClick={() => handleNavigate(item)}
          />
        ))}
      </nav>
    )
  }

  return (
    <nav className={`space-y-4 ${className}`}>
      {groupedItems.map((group) => (
        <div key={group.title}>
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            {group.title}
          </h3>
          <div className="space-y-1">
            {group.items.map((item) => (
              <NavigationItem
                key={item.to}
                item={item}
                isActive={currentPath === item.to}
                collapsed={false}
                showDescription={showDescriptions}
                onClick={() => handleNavigate(item)}
              />
            ))}
          </div>
        </div>
      ))}
    </nav>
  )
}

// Specialized navigation components
export const SidebarNavigation: React.FC<Omit<NavigationManagerProps, 'collapsed'>> = (props) => (
  <NavigationManager {...props} collapsed={false} />
)

export const CollapsedNavigation: React.FC<Omit<NavigationManagerProps, 'collapsed'>> = (props) => (
  <NavigationManager {...props} collapsed={true} />
)

export const MobileNavigation: React.FC<Omit<NavigationManagerProps, 'collapsed'>> = (props) => (
  <NavigationManager {...props} collapsed={false} showDescriptions={false} />
)

NavigationManager.displayName = 'NavigationManager'
NavigationItem.displayName = 'NavigationItem'
SidebarNavigation.displayName = 'SidebarNavigation'
CollapsedNavigation.displayName = 'CollapsedNavigation'
MobileNavigation.displayName = 'MobileNavigation'
