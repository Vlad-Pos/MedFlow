import { LucideIcon } from 'lucide-react'
import {
  Home,
  Calendar,
  Users,
  FileText,
  User,
  BarChart3,
  Globe
} from 'lucide-react'
import {
  NavigationItem,
  NavigationContext,
  NavigationCondition,
  NavigationAnalytics,
  NavigationMetadata
} from '../types/navigation.types'

/**
 * Core Navigation Items Module
 *
 * This module handles the creation and management of navigation items
 * with advanced features while maintaining backward compatibility.
 */

export class NavigationItemsManager {
  private context: NavigationContext

  constructor(context: NavigationContext) {
    this.context = context
  }

  /**
   * Get base navigation items (always visible for authenticated users)
   */
  getBaseNavigationItems(): NavigationItem[] {
    return [
      this.createNavigationItem({
        to: '/dashboard',
        label: 'Dashboard',
        icon: Home,
        description: 'Prezentare generală și statistici rapide',
        priority: 1,
        metadata: {
          requiresAuth: true
        },
        analytics: {
          category: 'navigation',
          action: 'dashboard_view',
          label: 'Dashboard Navigation'
        }
      }),
      this.createNavigationItem({
        to: '/appointments',
        label: 'Programări',
        icon: Calendar,
        description: 'Gestionează programările zilnice și săptămânale',
        priority: 2,
        metadata: {
          requiresAuth: true
        },
        analytics: {
          category: 'navigation',
          action: 'appointments_view',
          label: 'Appointments Navigation'
        }
      }),
      this.createNavigationItem({
        to: '/patients',
        label: 'Pacienți',
        icon: Users,
        description: 'Gestionează informațiile și istoricul pacienților',
        priority: 3,
        metadata: {
          requiresAuth: true
        },
        analytics: {
          category: 'navigation',
          action: 'patients_view',
          label: 'Patients Navigation'
        }
      }),
      this.createNavigationItem({
        to: '/reports',
        label: 'Rapoarte',
        icon: FileText,
        description: 'Generează și vizualizează rapoarte medicale',
        priority: 4,
        metadata: {
          requiresAuth: true
        },
        analytics: {
          category: 'navigation',
          action: 'reports_view',
          label: 'Reports Navigation'
        }
      }),
      this.createNavigationItem({
        to: '/profile',
        label: 'Profil',
        icon: User,
        description: 'Gestionează profilul și setările contului',
        priority: 5,
        metadata: {
          requiresAuth: true
        },
        analytics: {
          category: 'navigation',
          action: 'profile_view',
          label: 'Profile Navigation'
        }
      })
    ]
  }

  /**
   * Get admin-only navigation items
   */
  getAdminNavigationItems(): NavigationItem[] {
    if (!this.context.roles.includes('admin')) {
      return []
    }

    return [
      this.createNavigationItem({
        to: '/analytics',
        label: 'Analytics',
        icon: BarChart3,
        description: 'Advanced analytics and performance metrics for administrators',
        priority: 0.5, // High priority - appears first
        roles: ['admin'],
        metadata: {
          requiresAuth: true,
          requiresAdmin: true
        },
        analytics: {
          category: 'navigation',
          action: 'analytics_view',
          label: 'Admin Analytics Navigation'
        }
      })
    ]
  }

  /**
   * Get additional navigation items (conditional)
   */
  getAdditionalNavigationItems(): NavigationItem[] {
    return [
      this.createNavigationItem({
        to: '/framer-websites',
        label: 'Websites',
        icon: Globe,
        description: 'View your integrated Framer websites',
        priority: 6,
        metadata: {
          requiresAuth: true
        },
        analytics: {
          category: 'navigation',
          action: 'websites_view',
          label: 'Framer Websites Navigation'
        }
      })
    ]
  }

  /**
   * Get all navigation items combined and sorted
   */
  getAllNavigationItems(): NavigationItem[] {
    const baseItems = this.getBaseNavigationItems()
    const adminItems = this.getAdminNavigationItems()
    const additionalItems = this.getAdditionalNavigationItems()

    const allItems = [...adminItems, ...baseItems, ...additionalItems]

    // Sort by priority (lower numbers = higher priority)
    return allItems.sort((a, b) => a.priority - b.priority)
  }

  /**
   * Create a navigation item with proper typing and validation
   */
  private createNavigationItem(config: {
    to: string
    label: string
    icon: LucideIcon
    description: string
    priority: number
    roles?: string[]
    permissions?: string[]
    conditions?: NavigationCondition[]
    analytics?: NavigationAnalytics
    metadata?: NavigationMetadata
  }): NavigationItem {
    return {
      to: config.to,
      label: config.label,
      icon: config.icon,
      description: config.description,
      priority: config.priority,
      roles: config.roles || [],
      permissions: config.permissions || [],
      conditions: config.conditions || [],
      analytics: config.analytics || {
        category: 'navigation',
        action: 'navigation_click',
        label: config.label
      },
      metadata: {
        requiresAuth: true,
        ...config.metadata
      }
    }
  }

  /**
   * Filter navigation items based on current context
   */
  filterNavigationItems(items: NavigationItem[]): NavigationItem[] {
    return items.filter(item => this.evaluateItemVisibility(item))
  }

  /**
   * Evaluate if a navigation item should be visible
   */
  private evaluateItemVisibility(item: NavigationItem): boolean {
    // Check authentication requirement
    if (item.metadata?.requiresAuth && !this.context.user) {
      return false
    }

    // Check admin requirement
    if (item.metadata?.requiresAdmin && !this.context.roles.includes('admin')) {
      return false
    }

    // Check role requirements
    if (item.roles && item.roles.length > 0) {
      const hasRequiredRole = item.roles.some(role => this.context.roles.includes(role))
      if (!hasRequiredRole) {
        return false
      }
    }

    // Check permission requirements
    if (item.permissions && item.permissions.length > 0) {
      const hasRequiredPermission = item.permissions.some(permission =>
        this.context.permissions.includes(permission)
      )
      if (!hasRequiredPermission) {
        return false
      }
    }

    // Check custom conditions
    if (item.conditions && item.conditions.length > 0) {
      const conditionsMet = item.conditions.every(condition =>
        this.evaluateCondition(condition)
      )
      if (!conditionsMet) {
        return false
      }
    }

    return true
  }

  /**
   * Evaluate a navigation condition
   */
  private evaluateCondition(condition: NavigationCondition): boolean {
    switch (condition.type) {
      case 'role':
        return this.evaluateRoleCondition(condition)
      case 'permission':
        return this.evaluatePermissionCondition(condition)
      case 'feature':
        return this.evaluateFeatureCondition(condition)
      case 'custom':
        return this.evaluateCustomCondition(condition)
      default:
        return false
    }
  }

  private evaluateRoleCondition(condition: NavigationCondition): boolean {
    const requiredRoles = Array.isArray(condition.value) ? condition.value : [condition.value]
    const hasRole = requiredRoles.some(role => this.context.roles.includes(role))

    switch (condition.operator || 'in') {
      case 'in':
        return hasRole
      case 'not_in':
        return !hasRole
      default:
        return hasRole
    }
  }

  private evaluatePermissionCondition(condition: NavigationCondition): boolean {
    const requiredPermissions = Array.isArray(condition.value) ? condition.value : [condition.value]
    const hasPermission = requiredPermissions.some(permission =>
      this.context.permissions.includes(permission)
    )

    switch (condition.operator || 'in') {
      case 'in':
        return hasPermission
      case 'not_in':
        return !hasPermission
      default:
        return hasPermission
    }
  }

  private evaluateFeatureCondition(condition: NavigationCondition): boolean {
    const requiredFeatures = Array.isArray(condition.value) ? condition.value : [condition.value]
    const hasFeature = requiredFeatures.some(feature => this.context.features.includes(feature))

    switch (condition.operator || 'in') {
      case 'in':
        return hasFeature
      case 'not_in':
        return !hasFeature
      default:
        return hasFeature
    }
  }

  private evaluateCustomCondition(condition: NavigationCondition): boolean {
    // For custom conditions, we delegate to external evaluators
    // This allows for complex business logic to be implemented externally
    return true // Default to visible for backward compatibility
  }

  /**
   * Update context (for dynamic navigation updates)
   */
  updateContext(newContext: Partial<NavigationContext>): void {
    this.context = { ...this.context, ...newContext }
  }

  /**
   * Get current context
   */
  getContext(): NavigationContext {
    return this.context
  }
}

/**
 * Factory function to create NavigationItemsManager
 */
export function createNavigationItemsManager(context: NavigationContext): NavigationItemsManager {
  return new NavigationItemsManager(context)
}

/**
 * Default context factory
 */
export function createDefaultNavigationContext(
  user?: any,
  roles: string[] = [],
  permissions: string[] = [],
  features: string[] = []
): NavigationContext {
  return {
    user,
    roles,
    permissions,
    features,
    environment: {
      isDevelopment: process.env.NODE_ENV === 'development',
      isProduction: process.env.NODE_ENV === 'production',
      isTest: process.env.NODE_ENV === 'test',
      version: process.env.REACT_APP_VERSION || '1.0.0'
    }
  }
}
