import {
  NavigationItem,
  NavigationState,
  NavigationContext,
  NavigationHistoryItem,
  NavigationCacheEntry,
  NavigationAnalyticsState,
  NavigationEvent,
  NavigationMetrics,
  NavigationUserBehavior,
  NavigationPerformanceMetrics,
  NavigationCacheError
} from '../types/navigation.types'

/**
 * Navigation State Management Module
 *
 * Advanced state management with caching, persistence, and analytics
 * for the navigation system with performance optimization.
 */

export class NavigationStateManager {
  private state: NavigationState
  private context: NavigationContext
  private cache: Map<string, NavigationCacheEntry> = new Map()
  private cacheTTL: number = 300000 // 5 minutes default
  private enablePersistence: boolean = false
  private persistenceKey: string = 'medflow_navigation_state'
  private maxHistoryItems: number = 100

  constructor(
    context: NavigationContext,
    options: {
      cacheTTL?: number
      enablePersistence?: boolean
      persistenceKey?: string
      maxHistoryItems?: number
    } = {}
  ) {
    this.context = context
    this.cacheTTL = options.cacheTTL ?? this.cacheTTL
    this.enablePersistence = options.enablePersistence ?? this.enablePersistence
    this.persistenceKey = options.persistenceKey ?? this.persistenceKey
    this.maxHistoryItems = options.maxHistoryItems ?? this.maxHistoryItems

    this.state = this.initializeState()

    if (this.enablePersistence) {
      this.loadPersistedState()
    }
  }

  /**
   * Initialize navigation state
   */
  private initializeState(): NavigationState {
    return {
      items: [],
      expandedItems: new Set(),
      breadcrumb: [],
      history: [],
      cache: new Map(),
      analytics: {
        events: [],
        metrics: {
          totalClicks: 0,
          uniqueItemsClicked: 0,
          averageTimeBetweenClicks: 0,
          sessionDuration: 0
        },
        userBehavior: {
          preferredItems: [],
          avoidedItems: [],
          navigationPatterns: [],
          timeOfDayUsage: {},
          sessionFrequency: 0
        },
        performance: {
          averageRenderTime: 0,
          cacheHitRate: 0,
          errorRate: 0,
          memoryUsage: 0,
          componentLoadTime: 0
        }
      }
    }
  }

  /**
   * Load persisted state from storage
   */
  private loadPersistedState(): void {
    try {
      const persistedData = localStorage.getItem(this.persistenceKey)
      if (persistedData) {
        const parsedState = JSON.parse(persistedData)

        // Restore state with proper type conversion
        this.state = {
          ...this.state,
          expandedItems: new Set(parsedState.expandedItems || []),
          breadcrumb: parsedState.breadcrumb || [],
          history: parsedState.history || [],
          analytics: {
            ...this.state.analytics,
            ...parsedState.analytics,
            metrics: { ...this.state.analytics.metrics, ...parsedState.analytics?.metrics },
            userBehavior: { ...this.state.analytics.userBehavior, ...parsedState.analytics?.userBehavior },
            performance: { ...this.state.analytics.performance, ...parsedState.analytics?.performance }
          }
        }
      }
    } catch (error) {
      console.warn('[NavigationState] Failed to load persisted state:', error)
    }
  }

  /**
   * Save state to persistence storage
   */
  private savePersistedState(): void {
    if (!this.enablePersistence) return

    try {
      const stateToPersist = {
        expandedItems: Array.from(this.state.expandedItems),
        breadcrumb: this.state.breadcrumb,
        history: this.state.history.slice(-this.maxHistoryItems), // Keep only recent history
        analytics: this.state.analytics
      }

      localStorage.setItem(this.persistenceKey, JSON.stringify(stateToPersist))
    } catch (error) {
      console.warn('[NavigationState] Failed to save persisted state:', error)
    }
  }

  /**
   * Set navigation items with caching
   */
  setNavigationItems(items: NavigationItem[]): void {
    this.state.items = items

    // Cache the items
    const cacheKey = this.generateCacheKey('navigation_items')
    this.setCacheEntry(cacheKey, {
      items,
      timestamp: Date.now(),
      ttl: this.cacheTTL,
      version: '1.0',
      metadata: {
        userId: this.context.user?.id,
        roles: this.context.roles
      }
    })

    this.savePersistedState()
  }

  /**
   * Get navigation items with cache checking
   */
  getNavigationItems(): NavigationItem[] {
    const cacheKey = this.generateCacheKey('navigation_items')
    const cachedEntry = this.getCacheEntry(cacheKey)

    if (cachedEntry && this.isCacheEntryValid(cachedEntry)) {
      return cachedEntry.items
    }

    return this.state.items
  }

  /**
   * Add navigation item to history
   */
  addToHistory(item: NavigationItem, action: 'click' | 'hover' | 'focus' | 'blur'): void {
    const historyItem: NavigationHistoryItem = {
      item,
      timestamp: Date.now(),
      action,
      metadata: {
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      }
    }

    this.state.history.push(historyItem)

    // Maintain max history items
    if (this.state.history.length > this.maxHistoryItems) {
      this.state.history = this.state.history.slice(-this.maxHistoryItems)
    }

    // Update analytics
    this.updateAnalyticsForHistory(historyItem)

    this.savePersistedState()
  }

  /**
   * Update analytics for history item
   */
  private updateAnalyticsForHistory(historyItem: NavigationHistoryItem): void {
    // Track unique items clicked
    if (historyItem.action === 'click') {
      const uniqueItems = new Set(this.state.history
        .filter(h => h.action === 'click')
        .map(h => h.item.to)
      )
      this.state.analytics.metrics.uniqueItemsClicked = uniqueItems.size
      this.state.analytics.metrics.totalClicks++

      // Calculate average time between clicks
      const clickHistory = this.state.history.filter(h => h.action === 'click')
      if (clickHistory.length > 1) {
        let totalTime = 0
        for (let i = 1; i < clickHistory.length; i++) {
          totalTime += clickHistory[i].timestamp - clickHistory[i - 1].timestamp
        }
        this.state.analytics.metrics.averageTimeBetweenClicks = totalTime / (clickHistory.length - 1)
      }
    }

    // Track user behavior
    this.updateUserBehavior(historyItem)
  }

  /**
   * Update user behavior analytics
   */
  private updateUserBehavior(historyItem: NavigationHistoryItem): void {
    const itemPath = historyItem.item.to

    // Track preferred items (most clicked)
    const clickCounts: Record<string, number> = {}
    this.state.history
      .filter(h => h.action === 'click')
      .forEach(h => {
        clickCounts[h.item.to] = (clickCounts[h.item.to] || 0) + 1
      })

    const sortedItems = Object.entries(clickCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([path]) => path)

    this.state.analytics.userBehavior.preferredItems = sortedItems.slice(0, 5)
    this.state.analytics.userBehavior.avoidedItems = sortedItems.slice(-3)

    // Track time of day usage
    const hour = new Date().getHours()
    const timeSlot = `${hour}:00`
    this.state.analytics.userBehavior.timeOfDayUsage[timeSlot] =
      (this.state.analytics.userBehavior.timeOfDayUsage[timeSlot] || 0) + 1
  }

  /**
   * Set active navigation item
   */
  setActiveItem(itemPath: string): void {
    this.state.activeItem = itemPath

    // Update breadcrumb
    this.updateBreadcrumb(itemPath)

    this.savePersistedState()
  }

  /**
   * Update breadcrumb based on active item
   */
  private updateBreadcrumb(activePath: string): void {
    const activeItem = this.state.items.find(item => item.to === activePath)
    if (!activeItem) return

    this.state.breadcrumb = [
      {
        label: 'Dashboard',
        to: '/dashboard',
        isActive: activePath === '/dashboard'
      },
      {
        label: activeItem.label,
        icon: activeItem.icon,
        isActive: true
      }
    ]
  }

  /**
   * Get current breadcrumb
   */
  getBreadcrumb(): NavigationState['breadcrumb'] {
    return this.state.breadcrumb
  }

  /**
   * Toggle expanded item
   */
  toggleExpandedItem(itemPath: string): void {
    if (this.state.expandedItems.has(itemPath)) {
      this.state.expandedItems.delete(itemPath)
    } else {
      this.state.expandedItems.add(itemPath)
    }

    this.savePersistedState()
  }

  /**
   * Check if item is expanded
   */
  isItemExpanded(itemPath: string): boolean {
    return this.state.expandedItems.has(itemPath)
  }

  /**
   * Cache management methods
   */
  private generateCacheKey(prefix: string): string {
    return `${prefix}_${this.context.user?.id || 'anonymous'}_${this.context.roles.join('_')}`
  }

  private setCacheEntry(key: string, entry: NavigationCacheEntry): void {
    this.cache.set(key, entry)
    this.state.cache.set(key, entry)
  }

  private getCacheEntry(key: string): NavigationCacheEntry | undefined {
    return this.cache.get(key)
  }

  private isCacheEntryValid(entry: NavigationCacheEntry): boolean {
    return Date.now() - entry.timestamp < entry.ttl
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear()
    this.state.cache.clear()
    this.savePersistedState()
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp >= entry.ttl) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => {
      this.cache.delete(key)
      this.state.cache.delete(key)
    })

    if (keysToDelete.length > 0) {
      this.savePersistedState()
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStatistics(): { total: number; valid: number; expired: number; hitRate: number } {
    const now = Date.now()
    let valid = 0
    let expired = 0

    for (const entry of this.cache.values()) {
      if (now - entry.timestamp < entry.ttl) {
        valid++
      } else {
        expired++
      }
    }

    const total = this.cache.size
    const hitRate = total > 0 ? (valid / total) * 100 : 0

    return { total, valid, expired, hitRate }
  }

  /**
   * Add analytics event
   */
  addAnalyticsEvent(event: Omit<NavigationEvent, 'timestamp'>): void {
    const fullEvent: NavigationEvent = {
      ...event,
      timestamp: Date.now()
    }

    this.state.analytics.events.push(fullEvent)

    // Keep only recent events (last 1000)
    if (this.state.analytics.events.length > 1000) {
      this.state.analytics.events = this.state.analytics.events.slice(-1000)
    }

    this.savePersistedState()
  }

  /**
   * Get analytics data
   */
  getAnalytics(): NavigationAnalyticsState {
    return this.state.analytics
  }

  /**
   * Update performance metrics
   */
  updatePerformanceMetrics(metrics: Partial<NavigationPerformanceMetrics>): void {
    this.state.analytics.performance = {
      ...this.state.analytics.performance,
      ...metrics
    }
    this.savePersistedState()
  }

  /**
   * Get current state
   */
  getState(): NavigationState {
    return this.state
  }

  /**
   * Reset state to initial values
   */
  resetState(): void {
    this.state = this.initializeState()
    this.clearCache()
    this.savePersistedState()
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

  /**
   * Get navigation history
   */
  getHistory(): NavigationHistoryItem[] {
    return [...this.state.history]
  }

  /**
   * Clear navigation history
   */
  clearHistory(): void {
    this.state.history = []
    this.savePersistedState()
  }
}

/**
 * Factory function to create NavigationStateManager
 */
export function createNavigationStateManager(
  context: NavigationContext,
  options?: {
    cacheTTL?: number
    enablePersistence?: boolean
    persistenceKey?: string
    maxHistoryItems?: number
  }
): NavigationStateManager {
  return new NavigationStateManager(context, options)
}
