import {
  NavigationItem,
  NavigationContext,
  NavigationEvent,
  NavigationAnalytics,
  NavigationPerformanceMetrics
} from '../types/navigation.types'

/**
 * Navigation Analytics Module
 *
 * Comprehensive analytics and monitoring for navigation system
 * including user behavior tracking, performance monitoring, and insights.
 */

export class NavigationAnalyticsManager {
  private context: NavigationContext
  private events: NavigationEvent[] = []
  private maxEvents: number = 1000
  private sessionStartTime: number = Date.now()
  private performanceMarks: Map<string, number> = new Map()

  constructor(context: NavigationContext, maxEvents: number = 1000) {
    this.context = context
    this.maxEvents = maxEvents
  }

  /**
   * Track navigation event
   */
  trackEvent(
    type: string,
    item?: NavigationItem,
    data?: Record<string, any>
  ): void {
    const event: NavigationEvent = {
      type,
      item,
      timestamp: Date.now(),
      data: {
        ...data,
        sessionDuration: Date.now() - this.sessionStartTime,
        userId: this.context.user?.id,
        environment: this.context.environment
      }
    }

    this.events.push(event)

    // Maintain max events limit
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents)
    }

    // Send to external analytics if available
    this.sendToExternalAnalytics(event)
  }

  /**
   * Track navigation click
   */
  trackNavigationClick(item: NavigationItem, metadata?: Record<string, any>): void {
    this.trackEvent('navigation_click', item, {
      ...metadata,
      action: 'click',
      destination: item.to,
      priority: item.priority
    })
  }

  /**
   * Track navigation hover
   */
  trackNavigationHover(item: NavigationItem, duration: number): void {
    this.trackEvent('navigation_hover', item, {
      duration,
      action: 'hover'
    })
  }

  /**
   * Track navigation item visibility
   */
  trackNavigationVisibility(item: NavigationItem, visible: boolean): void {
    this.trackEvent('navigation_visibility', item, {
      visible,
      action: visible ? 'show' : 'hide'
    })
  }

  /**
   * Track navigation performance
   */
  trackPerformance(
    operation: string,
    duration: number,
    metadata?: Record<string, any>
  ): void {
    this.trackEvent('navigation_performance', undefined, {
      operation,
      duration,
      ...metadata
    })
  }

  /**
   * Start performance measurement
   */
  startPerformanceMark(markName: string): void {
    this.performanceMarks.set(markName, performance.now())
  }

  /**
   * End performance measurement
   */
  endPerformanceMark(markName: string, metadata?: Record<string, any>): number {
    const startTime = this.performanceMarks.get(markName)
    if (!startTime) return 0

    const duration = performance.now() - startTime
    this.performanceMarks.delete(markName)

    this.trackPerformance(markName, duration, metadata)
    return duration
  }

  /**
   * Track navigation error
   */
  trackError(
    error: Error,
    item?: NavigationItem,
    context?: Record<string, any>
  ): void {
    this.trackEvent('navigation_error', item, {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      ...context
    })
  }

  /**
   * Send event to external analytics service
   */
  private sendToExternalAnalytics(event: NavigationEvent): void {
    try {
      // Google Analytics 4
      if ((window as any).gtag && event.item?.analytics) {
        const analytics = event.item.analytics
        ;(window as any).gtag('event', analytics.action, {
          event_category: analytics.category,
          event_label: analytics.label,
          value: analytics.value,
          custom_map: analytics.customData
        })
      }

      // Custom analytics service
      if (this.context.environment.isDevelopment) {
        console.log('[Navigation Analytics]', event)
      }
    } catch (error) {
      console.warn('[Navigation Analytics] Failed to send event:', error)
    }
  }

  /**
   * Get analytics report
   */
  getAnalyticsReport(): {
    summary: NavigationAnalyticsSummary
    events: NavigationEvent[]
    insights: NavigationInsights
  } {
    const summary = this.calculateAnalyticsSummary()
    const insights = this.generateInsights()

    return {
      summary,
      events: [...this.events],
      insights
    }
  }

  /**
   * Calculate analytics summary
   */
  private calculateAnalyticsSummary(): NavigationAnalyticsSummary {
    const navigationEvents = this.events.filter(e => e.type.startsWith('navigation_'))
    const clickEvents = this.events.filter(e => e.type === 'navigation_click')
    const errorEvents = this.events.filter(e => e.type === 'navigation_error')

    const itemClicks: Record<string, number> = {}
    clickEvents.forEach(event => {
      if (event.item) {
        itemClicks[event.item.to] = (itemClicks[event.item.to] || 0) + 1
      }
    })

    const mostClickedItem = Object.entries(itemClicks)
      .sort(([, a], [, b]) => b - a)[0]?.[0]

    const averageSessionDuration = this.events.length > 0
      ? this.events.reduce((sum, event) => sum + (event.data?.sessionDuration || 0), 0) / this.events.length
      : 0

    return {
      totalEvents: this.events.length,
      navigationEvents: navigationEvents.length,
      clickEvents: clickEvents.length,
      errorEvents: errorEvents.length,
      uniqueItemsClicked: Object.keys(itemClicks).length,
      mostClickedItem,
      averageSessionDuration,
      sessionDuration: Date.now() - this.sessionStartTime
    }
  }

  /**
   * Generate navigation insights
   */
  private generateInsights(): NavigationInsights {
    const clickEvents = this.events.filter(e => e.type === 'navigation_click')
    const itemClicks: Record<string, number> = {}

    clickEvents.forEach(event => {
      if (event.item) {
        itemClicks[event.item.to] = (itemClicks[event.item.to] || 0) + 1
      }
    })

    const sortedItems = Object.entries(itemClicks).sort(([, a], [, b]) => b - a)

    const insights: NavigationInsights = {
      topItems: sortedItems.slice(0, 5).map(([path, count]) => ({ path, count })),
      leastUsedItems: sortedItems.slice(-3).map(([path, count]) => ({ path, count })),
      recommendations: [],
      patterns: []
    }

    // Generate recommendations
    if (sortedItems.length > 0) {
      const totalClicks = sortedItems.reduce((sum, [, count]) => sum + count, 0)
      const topItemPercentage = (sortedItems[0][1] / totalClicks) * 100

      if (topItemPercentage > 50) {
        insights.recommendations.push({
          type: 'warning',
          message: `Navigation is heavily skewed toward ${sortedItems[0][0]} (${topItemPercentage.toFixed(1)}% of clicks). Consider reviewing navigation priorities.`
        })
      }

      if (Object.keys(itemClicks).length < 3) {
        insights.recommendations.push({
          type: 'info',
          message: 'Limited navigation diversity detected. Users may not be exploring all features.'
        })
      }
    }

    // Generate usage patterns
    const hourlyUsage: Record<number, number> = {}
    clickEvents.forEach(event => {
      const hour = new Date(event.timestamp).getHours()
      hourlyUsage[hour] = (hourlyUsage[hour] || 0) + 1
    })

    const peakHour = Object.entries(hourlyUsage)
      .sort(([, a], [, b]) => b - a)[0]

    if (peakHour) {
      insights.patterns.push({
        type: 'usage',
        description: `Peak navigation usage at ${peakHour[0]}:00 (${peakHour[1]} clicks)`
      })
    }

    return insights
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): NavigationPerformanceMetrics {
    const performanceEvents = this.events.filter(e => e.type === 'navigation_performance')

    if (performanceEvents.length === 0) {
      return {
        averageRenderTime: 0,
        cacheHitRate: 0,
        errorRate: 0,
        memoryUsage: 0,
        componentLoadTime: 0
      }
    }

    const renderTimes = performanceEvents
      .filter(e => e.data?.operation?.includes('render'))
      .map(e => e.data?.duration || 0)

    const averageRenderTime = renderTimes.length > 0
      ? renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length
      : 0

    const errorRate = (this.events.filter(e => e.type === 'navigation_error').length / this.events.length) * 100

    return {
      averageRenderTime,
      cacheHitRate: 0, // Would be calculated from cache events
      errorRate,
      memoryUsage: 0, // Would require performance.memory API
      componentLoadTime: 0 // Would be calculated from load events
    }
  }

  /**
   * Export analytics data
   */
  exportAnalyticsData(): string {
    const report = this.getAnalyticsReport()

    return JSON.stringify({
      exportDate: new Date().toISOString(),
      summary: report.summary,
      insights: report.insights,
      events: report.events.slice(-100), // Last 100 events
      context: this.context
    }, null, 2)
  }

  /**
   * Clear analytics data
   */
  clearAnalyticsData(): void {
    this.events = []
    this.sessionStartTime = Date.now()
  }

  /**
   * Get events by type
   */
  getEventsByType(type: string): NavigationEvent[] {
    return this.events.filter(event => event.type === type)
  }

  /**
   * Get events for specific item
   */
  getEventsForItem(itemPath: string): NavigationEvent[] {
    return this.events.filter(event => event.item?.to === itemPath)
  }

  /**
   * Get events within time range
   */
  getEventsInTimeRange(startTime: number, endTime: number): NavigationEvent[] {
    return this.events.filter(event =>
      event.timestamp >= startTime && event.timestamp <= endTime
    )
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
 * Types for navigation analytics
 */
export interface NavigationAnalyticsSummary {
  totalEvents: number
  navigationEvents: number
  clickEvents: number
  errorEvents: number
  uniqueItemsClicked: number
  mostClickedItem?: string
  averageSessionDuration: number
  sessionDuration: number
}

export interface NavigationInsights {
  topItems: Array<{ path: string; count: number }>
  leastUsedItems: Array<{ path: string; count: number }>
  recommendations: Array<{
    type: 'info' | 'warning' | 'error'
    message: string
  }>
  patterns: Array<{
    type: string
    description: string
  }>
}

/**
 * Factory function to create NavigationAnalyticsManager
 */
export function createNavigationAnalyticsManager(
  context: NavigationContext,
  maxEvents?: number
): NavigationAnalyticsManager {
  return new NavigationAnalyticsManager(context, maxEvents)
}

/**
 * Global analytics instance (optional singleton pattern)
 */
let globalAnalyticsInstance: NavigationAnalyticsManager | null = null

export function getGlobalNavigationAnalytics(context?: NavigationContext): NavigationAnalyticsManager {
  if (!globalAnalyticsInstance && context) {
    globalAnalyticsInstance = createNavigationAnalyticsManager(context)
  }
  return globalAnalyticsInstance!
}

export function clearGlobalNavigationAnalytics(): void {
  globalAnalyticsInstance = null
}
