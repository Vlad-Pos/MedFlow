import React from 'react'
import { useAuth } from '../../providers/AuthProvider'
import { useRole } from '../../hooks/useRole'
import {
  NavigationItem,
  NavigationContext,
  NavigationEvent
} from './types/navigation.types'
import {
  createNavigationItemsManager,
  createDefaultNavigationContext
} from './core/navigationItems'
import {
  createNavigationGuardsManager
} from './guards/navigationGuards'
import {
  createNavigationStateManager
} from './state/navigationState'
import {
  createNavigationAnalyticsManager
} from './analytics/navigationAnalytics'
import {
  createNavigationUtilsManager
} from './utils/navigationUtils'

/**
 * Enhanced Navigation Manager V4
 *
 * Advanced navigation system with modular architecture
 * Maintains 100% backward compatibility with existing useNavigationItems hook
 *
 * Features:
 * - Modular navigation items management
 * - Advanced security guards and permissions
 * - State management with caching and persistence
 * - Comprehensive analytics and monitoring
 * - Utility functions for sorting, filtering, and validation
 * - Performance optimization and monitoring
 */

export function useNavigationItems(): NavigationItem[] {
  const { user } = useAuth()
  const { isAdmin } = useRole()

  // Create navigation context
  const context: NavigationContext = createDefaultNavigationContext(
    user,
    isAdmin ? ['admin', 'user'] : ['user'],
    [], // permissions would come from a permissions hook
    []  // features would come from a feature flags hook
  )

  // Initialize navigation managers
  const itemsManager = React.useMemo(() => createNavigationItemsManager(context), [context])
  const guardsManager = React.useMemo(() => createNavigationGuardsManager(context), [context])
  const stateManager = React.useMemo(() => createNavigationStateManager(context, {
    cacheTTL: 300000, // 5 minutes
    enablePersistence: true,
    persistenceKey: 'medflow_navigation_state'
  }), [context])
  const analyticsManager = React.useMemo(() => createNavigationAnalyticsManager(context), [context])
  const utilsManager = React.useMemo(() => createNavigationUtilsManager(context), [context])

  // Get navigation items
  const navigationItems = React.useMemo(() => {
    // Check cache first
    const cachedItems = stateManager.getNavigationItems()
    if (cachedItems.length > 0) {
      return cachedItems
    }

    // Generate fresh navigation items
    const allItems = itemsManager.getAllNavigationItems()
    const filteredItems = utilsManager.filterByRole(
      utilsManager.filterByPermission(allItems, context.permissions),
      context.roles
    )

    // Apply security guards
    const guardedItems: NavigationItem[] = []
    for (const item of filteredItems) {
      const guardResult = await guardsManager.evaluateItem(item)
      if (guardResult.allowed) {
        guardedItems.push(item)
      } else if (guardResult.reason === 'redirect') {
        // Handle redirect if needed
        console.log(`[Navigation] Redirecting from ${item.to} to ${guardResult.redirectTo}`)
      }
    }

    // Sort by priority
    const sortedItems = utilsManager.sortByPriority(guardedItems)

    // Cache the result
    stateManager.setNavigationItems(sortedItems)

    return sortedItems
  }, [itemsManager, guardsManager, stateManager, utilsManager, context])

  // Debug logging (maintains existing behavior)
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Navigation Debug:', {
        user: !!user,
        isAdmin,
        totalItems: navigationItems.length,
        items: navigationItems.map(item => ({ to: item.to, label: item.label, priority: item.priority }))
      })
    }
  }, [user, isAdmin, navigationItems])

  // Track analytics
  React.useEffect(() => {
    // Track navigation initialization
    analyticsManager.trackEvent('navigation_initialized', undefined, {
      itemCount: navigationItems.length,
      userRoles: context.roles,
      isAdmin
    })

    // Track performance
    analyticsManager.startPerformanceMark('navigation_render')
    return () => {
      analyticsManager.endPerformanceMark('navigation_render')
    }
  }, [analyticsManager, navigationItems.length, context.roles, isAdmin])

  // Enhanced click handler for analytics
  const handleNavigationClick = React.useCallback((item: NavigationItem) => {
    // Track the click
    analyticsManager.trackNavigationClick(item, {
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    })

    // Add to history
    stateManager.addToHistory(item, 'click')

    // Set as active item
    stateManager.setActiveItem(item.to)
  }, [analyticsManager, stateManager])

  // Expose enhanced functionality through global object for advanced use
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).medflowNavigation = {
        getItems: () => navigationItems,
        getAnalytics: () => analyticsManager.getAnalyticsReport(),
        getState: () => stateManager.getState(),
        getGuards: () => guardsManager.getGuardStatistics(),
        getContext: () => context,
        clearCache: () => stateManager.clearCache(),
        handleClick: handleNavigationClick
      }
    }
  }, [navigationItems, analyticsManager, stateManager, guardsManager, context, handleNavigationClick])

  return navigationItems
}

/**
 * Enhanced Navigation Manager Component
 *
 * Provides additional navigation functionality beyond the hook
 * Maintains full backward compatibility
 */
export class NavigationManager {
  private context: NavigationContext
  private itemsManager: ReturnType<typeof createNavigationItemsManager>
  private guardsManager: ReturnType<typeof createNavigationGuardsManager>
  private stateManager: ReturnType<typeof createNavigationStateManager>
  private analyticsManager: ReturnType<typeof createNavigationAnalyticsManager>
  private utilsManager: ReturnType<typeof createNavigationUtilsManager>

  constructor(context: NavigationContext) {
    this.context = context
    this.itemsManager = createNavigationItemsManager(context)
    this.guardsManager = createNavigationGuardsManager(context)
    this.stateManager = createNavigationStateManager(context)
    this.analyticsManager = createNavigationAnalyticsManager(context)
    this.utilsManager = createNavigationUtilsManager(context)
  }

  /**
   * Get navigation items with all enhancements
   */
  async getNavigationItems(): Promise<NavigationItem[]> {
    // Check cache first
    const cachedItems = this.stateManager.getNavigationItems()
    if (cachedItems.length > 0) {
      return cachedItems
    }

    // Generate fresh items
    const allItems = this.itemsManager.getAllNavigationItems()
    const filteredItems = this.utilsManager.filterByRole(
      this.utilsManager.filterByPermission(allItems, this.context.permissions),
      this.context.roles
    )

    // Apply security guards
    const guardedItems: NavigationItem[] = []
    for (const item of filteredItems) {
      const guardResult = await this.guardsManager.evaluateItem(item)
      if (guardResult.allowed) {
        guardedItems.push(item)
      }
    }

    // Sort and cache
    const sortedItems = this.utilsManager.sortByPriority(guardedItems)
    this.stateManager.setNavigationItems(sortedItems)

    return sortedItems
  }

  /**
   * Get navigation analytics
   */
  getAnalytics() {
    return this.analyticsManager.getAnalyticsReport()
  }

  /**
   * Get navigation state
   */
  getState() {
    return this.stateManager.getState()
  }

  /**
   * Get guard statistics
   */
  getGuardStatistics() {
    return this.guardsManager.getGuardStatistics()
  }

  /**
   * Clear all caches
   */
  clearCache() {
    this.stateManager.clearCache()
  }

  /**
   * Track navigation event
   */
  trackEvent(type: string, item?: NavigationItem, data?: Record<string, any>) {
    this.analyticsManager.trackEvent(type, item, data)
  }

  /**
   * Update context
   */
  updateContext(newContext: Partial<NavigationContext>) {
    this.context = { ...this.context, ...newContext }
    this.itemsManager.updateContext(newContext)
    this.guardsManager.updateContext(newContext)
    this.stateManager.updateContext(newContext)
    this.analyticsManager.updateContext(newContext)
    this.utilsManager.updateContext(newContext)
  }

  /**
   * Get current context
   */
  getContext() {
    return this.context
  }
}

/**
 * Factory function to create NavigationManager instance
 */
export function createNavigationManager(context: NavigationContext): NavigationManager {
  return new NavigationManager(context)
}

/**
 * Hook for advanced navigation management
 */
export function useAdvancedNavigation() {
  const { user } = useAuth()
  const { isAdmin } = useRole()

  const context = React.useMemo(() =>
    createDefaultNavigationContext(
      user,
      isAdmin ? ['admin', 'user'] : ['user'],
      [],
      []
    ), [user, isAdmin]
  )

  const navigationManager = React.useMemo(() =>
    createNavigationManager(context), [context]
  )

  return navigationManager
}

// Maintain backward compatibility with existing exports
export default useNavigationItems
