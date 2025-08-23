import { NavigationItem, NavigationContext } from '../types/navigation.types'

/**
 * Navigation Utilities Module
 *
 * Helper functions and utilities for navigation system
 * including sorting, filtering, validation, and formatting.
 */

export class NavigationUtilsManager {
  private context: NavigationContext

  constructor(context: NavigationContext) {
    this.context = context
  }

  /**
   * Sort navigation items by priority
   */
  sortByPriority(items: NavigationItem[]): NavigationItem[] {
    return [...items].sort((a, b) => a.priority - b.priority)
  }

  /**
   * Sort navigation items alphabetically
   */
  sortAlphabetically(items: NavigationItem[]): NavigationItem[] {
    return [...items].sort((a, b) => a.label.localeCompare(b.label))
  }

  /**
   * Sort navigation items by usage frequency
   */
  sortByUsage(items: NavigationItem[], usageCounts: Record<string, number>): NavigationItem[] {
    return [...items].sort((a, b) => {
      const usageA = usageCounts[a.to] || 0
      const usageB = usageCounts[b.to] || 0
      return usageB - usageA // Higher usage first
    })
  }

  /**
   * Filter navigation items by role
   */
  filterByRole(items: NavigationItem[], roles: string[]): NavigationItem[] {
    return items.filter(item => {
      if (!item.roles || item.roles.length === 0) return true
      return item.roles.some(role => roles.includes(role))
    })
  }

  /**
   * Filter navigation items by permission
   */
  filterByPermission(items: NavigationItem[], permissions: string[]): NavigationItem[] {
    return items.filter(item => {
      if (!item.permissions || item.permissions.length === 0) return true
      return item.permissions.some(permission => permissions.includes(permission))
    })
  }

  /**
   * Filter navigation items by feature flag
   */
  filterByFeature(items: NavigationItem[], features: string[]): NavigationItem[] {
    return items.filter(item => {
      if (!item.metadata?.requiresSubscription && !item.metadata?.isExperimental) return true
      // Implement feature flag logic here
      return true // Default to showing items
    })
  }

  /**
   * Group navigation items by category
   */
  groupByCategory(items: NavigationItem[]): Record<string, NavigationItem[]> {
    const groups: Record<string, NavigationItem[]> = {
      primary: [],
      secondary: [],
      admin: [],
      settings: [],
      other: []
    }

    items.forEach(item => {
      if (item.priority <= 2) {
        groups.primary.push(item)
      } else if (item.roles?.includes('admin')) {
        groups.admin.push(item)
      } else if (item.to.includes('profile') || item.to.includes('settings')) {
        groups.settings.push(item)
      } else if (item.priority <= 5) {
        groups.secondary.push(item)
      } else {
        groups.other.push(item)
      }
    })

    // Remove empty groups
    Object.keys(groups).forEach(key => {
      if (groups[key].length === 0) {
        delete groups[key]
      }
    })

    return groups
  }

  /**
   * Find navigation item by path
   */
  findByPath(items: NavigationItem[], path: string): NavigationItem | undefined {
    return items.find(item => item.to === path)
  }

  /**
   * Find navigation items by label
   */
  findByLabel(items: NavigationItem[], label: string, exact: boolean = true): NavigationItem[] {
    if (exact) {
      return items.filter(item => item.label === label)
    } else {
      const lowerLabel = label.toLowerCase()
      return items.filter(item => item.label.toLowerCase().includes(lowerLabel))
    }
  }

  /**
   * Get breadcrumb path for navigation item
   */
  getBreadcrumbPath(items: NavigationItem[], targetPath: string): NavigationItem[] {
    const breadcrumbs: NavigationItem[] = []
    const pathSegments = targetPath.split('/').filter(Boolean)

    for (let i = 1; i <= pathSegments.length; i++) {
      const currentPath = '/' + pathSegments.slice(0, i).join('/')
      const item = this.findByPath(items, currentPath)
      if (item) {
        breadcrumbs.push(item)
      }
    }

    return breadcrumbs
  }

  /**
   * Validate navigation item structure
   */
  validateNavigationItem(item: Partial<NavigationItem>): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    if (!item.to || typeof item.to !== 'string' || !item.to.startsWith('/')) {
      errors.push('Invalid or missing path (must start with "/")')
    }

    if (!item.label || typeof item.label !== 'string' || item.label.trim().length === 0) {
      errors.push('Invalid or missing label')
    }

    if (!item.icon || typeof item.icon !== 'function') {
      errors.push('Invalid or missing icon component')
    }

    if (!item.description || typeof item.description !== 'string') {
      errors.push('Invalid or missing description')
    }

    if (typeof item.priority !== 'number' || item.priority < 0) {
      errors.push('Invalid priority (must be a non-negative number)')
    }

    if (item.roles && !Array.isArray(item.roles)) {
      errors.push('Roles must be an array of strings')
    }

    if (item.permissions && !Array.isArray(item.permissions)) {
      errors.push('Permissions must be an array of strings')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Sanitize navigation item for security
   */
  sanitizeNavigationItem(item: NavigationItem): NavigationItem {
    return {
      to: this.sanitizePath(item.to),
      label: this.sanitizeText(item.label),
      icon: item.icon, // Icons are safe React components
      description: this.sanitizeText(item.description),
      priority: Math.max(0, Math.min(100, item.priority)), // Clamp priority
      roles: item.roles?.filter(role => this.isValidRole(role)) || [],
      permissions: item.permissions?.filter(perm => this.isValidPermission(perm)) || [],
      conditions: item.conditions || [],
      analytics: item.analytics,
      metadata: item.metadata
    }
  }

  /**
   * Sanitize path for security
   */
  private sanitizePath(path: string): string {
    // Remove any potentially dangerous characters
    return path.replace(/[<>\"'%;()&+]/g, '')
  }

  /**
   * Sanitize text for security
   */
  private sanitizeText(text: string): string {
    // Basic XSS prevention
    return text.replace(/[<>\"'%;()&+]/g, '')
  }

  /**
   * Validate role name
   */
  private isValidRole(role: string): boolean {
    // Only allow alphanumeric characters, hyphens, and underscores
    return /^[a-zA-Z0-9_-]+$/.test(role) && role.length <= 50
  }

  /**
   * Validate permission name
   */
  private isValidPermission(permission: string): boolean {
    // Only allow alphanumeric characters, colons, hyphens, and underscores
    return /^[a-zA-Z0-9:_-]+$/.test(permission) && permission.length <= 100
  }

  /**
   * Generate navigation item ID
   */
  generateItemId(item: NavigationItem): string {
    return `nav_${item.to.replace(/\//g, '_').replace(/^-/, '')}_${item.priority}`
  }

  /**
   * Check if navigation item is accessible
   */
  isItemAccessible(item: NavigationItem): boolean {
    // Check role requirements
    if (item.roles && item.roles.length > 0) {
      if (!this.context.user) return false
      const hasRequiredRole = item.roles.some(role => this.context.roles.includes(role))
      if (!hasRequiredRole) return false
    }

    // Check permission requirements
    if (item.permissions && item.permissions.length > 0) {
      if (!this.context.user) return false
      const hasRequiredPermission = item.permissions.some(permission =>
        this.context.permissions.includes(permission)
      )
      if (!hasRequiredPermission) return false
    }

    // Check subscription requirements
    if (item.metadata?.requiresSubscription && !this.context.subscription) {
      return false
    }

    return true
  }

  /**
   * Get navigation item accessibility status
   */
  getItemAccessibilityStatus(item: NavigationItem): {
    accessible: boolean
    reasons: string[]
  } {
    const reasons: string[] = []
    let accessible = true

    if (item.roles && item.roles.length > 0) {
      if (!this.context.user) {
        accessible = false
        reasons.push('Authentication required')
      } else {
        const hasRequiredRole = item.roles.some(role => this.context.roles.includes(role))
        if (!hasRequiredRole) {
          accessible = false
          reasons.push(`Required role: ${item.roles.join(', ')}`)
        }
      }
    }

    if (item.permissions && item.permissions.length > 0) {
      if (!this.context.user) {
        accessible = false
        reasons.push('Authentication required')
      } else {
        const hasRequiredPermission = item.permissions.some(permission =>
          this.context.permissions.includes(permission)
        )
        if (!hasRequiredPermission) {
          accessible = false
          reasons.push(`Required permission: ${item.permissions.join(', ')}`)
        }
      }
    }

    if (item.metadata?.requiresSubscription && !this.context.subscription) {
      accessible = false
      reasons.push('Subscription required')
    }

    return { accessible, reasons }
  }

  /**
   * Format navigation item for display
   */
  formatNavigationItem(item: NavigationItem): {
    id: string
    path: string
    label: string
    description: string
    priority: number
    accessible: boolean
    reasons: string[]
  } {
    const accessibility = this.getItemAccessibilityStatus(item)

    return {
      id: this.generateItemId(item),
      path: item.to,
      label: item.label,
      description: item.description,
      priority: item.priority,
      accessible: accessibility.accessible,
      reasons: accessibility.reasons
    }
  }

  /**
   * Update context
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
 * Factory function to create NavigationUtilsManager
 */
export function createNavigationUtilsManager(context: NavigationContext): NavigationUtilsManager {
  return new NavigationUtilsManager(context)
}

/**
 * Standalone utility functions (no context required)
 */

export function validateNavigationPath(path: string): boolean {
  return typeof path === 'string' && path.startsWith('/') && path.length <= 200
}

export function validateNavigationLabel(label: string): boolean {
  return typeof label === 'string' && label.trim().length > 0 && label.length <= 100
}

export function validateNavigationPriority(priority: number): boolean {
  return typeof priority === 'number' && priority >= 0 && priority <= 100
}

export function sanitizeNavigationText(text: string): string {
  return text.replace(/[<>\"'%;()&+]/g, '').trim()
}

export function generateNavigationId(prefix: string = 'nav'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function compareNavigationItems(a: NavigationItem, b: NavigationItem): number {
  return a.priority - b.priority
}

export function groupNavigationItemsByPriority(
  items: NavigationItem[]
): Record<string, NavigationItem[]> {
  const groups: Record<string, NavigationItem[]> = {
    high: [],
    medium: [],
    low: []
  }

  items.forEach(item => {
    if (item.priority <= 2) {
      groups.high.push(item)
    } else if (item.priority <= 5) {
      groups.medium.push(item)
    } else {
      groups.low.push(item)
    }
  })

  return groups
}
