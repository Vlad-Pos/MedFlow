import { LucideIcon } from 'lucide-react'

/**
 * Enhanced Navigation Types for Advanced Module Architecture
 *
 * These types provide comprehensive support for the advanced navigation system
 * while maintaining backward compatibility with existing implementations.
 */

export interface NavigationItem {
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
}

export interface NavigationCondition {
  type: 'role' | 'permission' | 'feature' | 'custom'
  value: string | string[]
  operator?: 'equals' | 'not_equals' | 'in' | 'not_in' | 'contains' | 'not_contains'
}

export interface NavigationAnalytics {
  category: string
  action: string
  label?: string
  value?: number
  customData?: Record<string, any>
}

export interface NavigationMetadata {
  requiresAuth?: boolean
  requiresAdmin?: boolean
  requiresSubscription?: boolean
  isExternal?: boolean
  isExperimental?: boolean
  isDeprecated?: boolean
  maintenanceMode?: boolean
  customProps?: Record<string, any>
}

export interface NavigationState {
  items: NavigationItem[]
  activeItem?: string
  expandedItems: Set<string>
  breadcrumb: NavigationBreadcrumb[]
  history: NavigationHistoryItem[]
  cache: Map<string, NavigationCacheEntry>
  analytics: NavigationAnalyticsState
}

export interface NavigationBreadcrumb {
  label: string
  to?: string
  icon?: LucideIcon
  isActive?: boolean
}

export interface NavigationHistoryItem {
  item: NavigationItem
  timestamp: number
  action: 'click' | 'hover' | 'focus' | 'blur'
  metadata?: Record<string, any>
}

export interface NavigationCacheEntry {
  items: NavigationItem[]
  timestamp: number
  ttl: number
  version: string
  metadata?: Record<string, any>
}

export interface NavigationAnalyticsState {
  events: NavigationEvent[]
  metrics: NavigationMetrics
  userBehavior: NavigationUserBehavior
  performance: NavigationPerformanceMetrics
}

export interface NavigationEvent {
  type: string
  item?: NavigationItem
  timestamp: number
  data?: Record<string, any>
}

export interface NavigationMetrics {
  totalClicks: number
  uniqueItemsClicked: number
  averageTimeBetweenClicks: number
  mostClickedItem?: string
  leastClickedItem?: string
  sessionDuration: number
}

export interface NavigationUserBehavior {
  preferredItems: string[]
  avoidedItems: string[]
  navigationPatterns: string[]
  timeOfDayUsage: Record<string, number>
  sessionFrequency: number
}

export interface NavigationPerformanceMetrics {
  averageRenderTime: number
  cacheHitRate: number
  errorRate: number
  memoryUsage: number
  componentLoadTime: number
}

export interface NavigationGuard {
  id: string
  name: string
  priority: number
  condition: NavigationGuardCondition
  action: NavigationGuardAction
  metadata?: Record<string, any>
}

export interface NavigationGuardCondition {
  type: 'role' | 'permission' | 'feature' | 'custom'
  value: string | string[]
  operator?: 'equals' | 'not_equals' | 'in' | 'not_in'
}

export interface NavigationGuardAction {
  type: 'allow' | 'deny' | 'redirect' | 'log' | 'custom'
  value?: string
  metadata?: Record<string, any>
}

export interface NavigationConfig {
  enableCaching: boolean
  cacheTTL: number
  enableAnalytics: boolean
  enableDebugLogging: boolean
  enablePerformanceMonitoring: boolean
  enableGuards: boolean
  maxHistoryItems: number
  enableBreadcrumbs: boolean
  enableKeyboardNavigation: boolean
  enableAccessibility: boolean
  customSettings?: Record<string, any>
}

// Legacy type aliases for backward compatibility
export type NavigationItems = NavigationItem[]

// Enhanced builder pattern for navigation items
export interface NavigationItemBuilder {
  to(path: string): NavigationItemBuilder
  label(text: string): NavigationItemBuilder
  icon(icon: LucideIcon): NavigationItemBuilder
  description(text: string): NavigationItemBuilder
  priority(value: number): NavigationItemBuilder
  roles(roles: string[]): NavigationItemBuilder
  permissions(perms: string[]): NavigationItemBuilder
  condition(condition: NavigationCondition): NavigationItemBuilder
  analytics(analytics: NavigationAnalytics): NavigationItemBuilder
  metadata(metadata: NavigationMetadata): NavigationItemBuilder
  build(): NavigationItem
}

// Navigation context for advanced features
export interface NavigationContext {
  user?: any
  roles: string[]
  permissions: string[]
  features: string[]
  subscription?: any
  preferences?: Record<string, any>
  environment: {
    isDevelopment: boolean
    isProduction: boolean
    isTest: boolean
    version: string
  }
}

// Error types for navigation system
export class NavigationError extends Error {
  constructor(
    message: string,
    public code: string,
    public item?: NavigationItem,
    public context?: Record<string, any>
  ) {
    super(message)
    this.name = 'NavigationError'
  }
}

export class NavigationGuardError extends NavigationError {
  constructor(
    message: string,
    public guard: NavigationGuard,
    public context?: Record<string, any>
  ) {
    super(message, 'GUARD_VIOLATION', undefined, context)
    this.name = 'NavigationGuardError'
  }
}

export class NavigationCacheError extends NavigationError {
  constructor(
    message: string,
    public cacheKey: string,
    public context?: Record<string, any>
  ) {
    super(message, 'CACHE_ERROR', undefined, context)
    this.name = 'NavigationCacheError'
  }
}
