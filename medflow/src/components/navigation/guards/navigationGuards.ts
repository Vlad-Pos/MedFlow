import {
  NavigationItem,
  NavigationGuard,
  NavigationGuardCondition,
  NavigationGuardAction,
  NavigationContext,
  NavigationGuardError
} from '../types/navigation.types'

/**
 * Navigation Guards Module
 *
 * Advanced permission-based access control and security guards
 * for the navigation system with audit logging and validation.
 */

export class NavigationGuardsManager {
  private guards: Map<string, NavigationGuard> = new Map()
  private context: NavigationContext
  private auditLog: NavigationGuardAuditEntry[] = []
  private maxAuditEntries: number = 1000

  constructor(context: NavigationContext, maxAuditEntries: number = 1000) {
    this.context = context
    this.maxAuditEntries = maxAuditEntries
    this.initializeDefaultGuards()
  }

  /**
   * Initialize default security guards
   */
  private initializeDefaultGuards(): void {
    // Authentication guard
    this.addGuard({
      id: 'auth_required',
      name: 'Authentication Required',
      priority: 1000, // High priority
      condition: {
        type: 'custom',
        value: 'authenticated',
        operator: 'equals'
      },
      action: {
        type: 'redirect',
        value: '/signin'
      }
    })

    // Admin access guard
    this.addGuard({
      id: 'admin_required',
      name: 'Admin Access Required',
      priority: 900,
      condition: {
        type: 'role',
        value: 'admin',
        operator: 'equals'
      },
      action: {
        type: 'deny'
      }
    })

    // Feature flag guard
    this.addGuard({
      id: 'feature_enabled',
      name: 'Feature Flag Check',
      priority: 800,
      condition: {
        type: 'feature',
        value: 'navigation_feature',
        operator: 'equals'
      },
      action: {
        type: 'log'
      }
    })
  }

  /**
   * Add a new navigation guard
   */
  addGuard(guard: NavigationGuard): void {
    if (this.guards.has(guard.id)) {
      throw new NavigationGuardError(
        `Guard with ID '${guard.id}' already exists`,
        guard
      )
    }
    this.guards.set(guard.id, guard)
  }

  /**
   * Remove a navigation guard
   */
  removeGuard(guardId: string): boolean {
    return this.guards.delete(guardId)
  }

  /**
   * Update an existing navigation guard
   */
  updateGuard(guardId: string, updates: Partial<NavigationGuard>): boolean {
    const existingGuard = this.guards.get(guardId)
    if (!existingGuard) {
      return false
    }

    this.guards.set(guardId, { ...existingGuard, ...updates })
    return true
  }

  /**
   * Get a navigation guard by ID
   */
  getGuard(guardId: string): NavigationGuard | undefined {
    return this.guards.get(guardId)
  }

  /**
   * Get all navigation guards
   */
  getAllGuards(): NavigationGuard[] {
    return Array.from(this.guards.values()).sort((a, b) => a.priority - b.priority)
  }

  /**
   * Evaluate navigation item against all guards
   */
  async evaluateItem(item: NavigationItem): Promise<NavigationGuardResult> {
    const guards = this.getAllGuards()
    const results: NavigationGuardEvaluation[] = []

    for (const guard of guards) {
      const evaluation = await this.evaluateGuard(guard, item)
      results.push(evaluation)

      // If guard denies access, stop evaluation and return result
      if (evaluation.action.type === 'deny') {
        this.logGuardAction(guard, item, evaluation.action, 'DENIED')
        return {
          item,
          allowed: false,
          reason: evaluation.action.type,
          guard: guard,
          evaluation: evaluation,
          allEvaluations: results
        }
      }

      // Handle redirect actions
      if (evaluation.action.type === 'redirect') {
        this.logGuardAction(guard, item, evaluation.action, 'REDIRECT')
        return {
          item,
          allowed: false,
          reason: evaluation.action.type,
          redirectTo: evaluation.action.value,
          guard: guard,
          evaluation: evaluation,
          allEvaluations: results
        }
      }
    }

    // All guards passed
    this.logGuardAction(undefined, item, { type: 'allow' }, 'ALLOWED')
    return {
      item,
      allowed: true,
      allEvaluations: results
    }
  }

  /**
   * Evaluate a single guard against a navigation item
   */
  private async evaluateGuard(
    guard: NavigationGuard,
    item: NavigationItem
  ): Promise<NavigationGuardEvaluation> {
    const conditionMet = this.evaluateCondition(guard.condition, item)

    if (!conditionMet) {
      return {
        guard,
        conditionMet: false,
        action: { type: 'allow' } // Condition not met, allow access
      }
    }

    // Condition is met, execute guard action
    const action = await this.executeGuardAction(guard, item)

    return {
      guard,
      conditionMet: true,
      action: action
    }
  }

  /**
   * Evaluate a guard condition
   */
  private evaluateCondition(
    condition: NavigationGuardCondition,
    item: NavigationItem
  ): boolean {
    switch (condition.type) {
      case 'role':
        return this.evaluateRoleCondition(condition, item)
      case 'permission':
        return this.evaluatePermissionCondition(condition, item)
      case 'feature':
        return this.evaluateFeatureCondition(condition, item)
      case 'custom':
        return this.evaluateCustomCondition(condition, item)
      default:
        return false
    }
  }

  private evaluateRoleCondition(
    condition: NavigationGuardCondition,
    item: NavigationItem
  ): boolean {
    const requiredRoles = Array.isArray(condition.value) ? condition.value : [condition.value]
    const hasRequiredRole = requiredRoles.some(role => this.context.roles.includes(role))

    switch (condition.operator || 'in') {
      case 'in':
        return hasRequiredRole
      case 'not_in':
        return !hasRequiredRole
      default:
        return hasRequiredRole
    }
  }

  private evaluatePermissionCondition(
    condition: NavigationGuardCondition,
    item: NavigationItem
  ): boolean {
    const requiredPermissions = Array.isArray(condition.value) ? condition.value : [condition.value]
    const hasRequiredPermission = requiredPermissions.some(permission =>
      this.context.permissions.includes(permission)
    )

    switch (condition.operator || 'in') {
      case 'in':
        return hasRequiredPermission
      case 'not_in':
        return !hasRequiredPermission
      default:
        return hasRequiredPermission
    }
  }

  private evaluateFeatureCondition(
    condition: NavigationGuardCondition,
    item: NavigationItem
  ): boolean {
    const requiredFeatures = Array.isArray(condition.value) ? condition.value : [condition.value]
    const hasRequiredFeature = requiredFeatures.some(feature =>
      this.context.features.includes(feature)
    )

    switch (condition.operator || 'in') {
      case 'in':
        return hasRequiredFeature
      case 'not_in':
        return !hasRequiredFeature
      default:
        return hasRequiredFeature
    }
  }

  private evaluateCustomCondition(
    condition: NavigationGuardCondition,
    item: NavigationItem
  ): boolean {
    // Handle custom condition logic based on condition value
    switch (condition.value) {
      case 'authenticated':
        return !!this.context.user
      case 'admin_only':
        return this.context.roles.includes('admin')
      case 'subscription_required':
        return !!this.context.subscription
      default:
        return true // Default to allowing access
    }
  }

  /**
   * Execute guard action
   */
  private async executeGuardAction(
    guard: NavigationGuard,
    item: NavigationItem
  ): Promise<NavigationGuardAction> {
    switch (guard.action.type) {
      case 'allow':
        return guard.action
      case 'deny':
        return guard.action
      case 'redirect':
        return guard.action
      case 'log':
        console.log(`[Navigation Guard] ${guard.name}: ${item.label} (${item.to})`)
        return guard.action
      case 'custom':
        // Execute custom action logic
        return await this.executeCustomAction(guard, item)
      default:
        return { type: 'allow' }
    }
  }

  /**
   * Execute custom guard action
   */
  private async executeCustomAction(
    guard: NavigationGuard,
    item: NavigationItem
  ): Promise<NavigationGuardAction> {
    // Custom action implementation
    // This could trigger analytics, send notifications, etc.
    if (guard.action.metadata?.analytics) {
      // Send analytics event
      console.log(`[Custom Guard Action] Analytics for ${item.label}`)
    }

    return guard.action
  }

  /**
   * Log guard action for audit purposes
   */
  private logGuardAction(
    guard: NavigationGuard | undefined,
    item: NavigationItem,
    action: NavigationGuardAction,
    result: string
  ): void {
    const auditEntry: NavigationGuardAuditEntry = {
      timestamp: Date.now(),
      guardId: guard?.id,
      guardName: guard?.name,
      item: item,
      action: action,
      result: result,
      context: {
        user: this.context.user?.id,
        roles: this.context.roles,
        permissions: this.context.permissions
      }
    }

    this.auditLog.push(auditEntry)

    // Maintain max audit entries
    if (this.auditLog.length > this.maxAuditEntries) {
      this.auditLog = this.auditLog.slice(-this.maxAuditEntries)
    }
  }

  /**
   * Get audit log
   */
  getAuditLog(): NavigationGuardAuditEntry[] {
    return [...this.auditLog]
  }

  /**
   * Clear audit log
   */
  clearAuditLog(): void {
    this.auditLog = []
  }

  /**
   * Get guard statistics
   */
  getGuardStatistics(): NavigationGuardStatistics {
    const stats = {
      totalGuards: this.guards.size,
      totalAuditEntries: this.auditLog.length,
      guardsByAction: {} as Record<string, number>,
      recentActivity: [] as NavigationGuardAuditEntry[]
    }

    // Count guards by action type
    for (const guard of this.guards.values()) {
      const actionType = guard.action.type
      stats.guardsByAction[actionType] = (stats.guardsByAction[actionType] || 0) + 1
    }

    // Get recent activity (last 10 entries)
    stats.recentActivity = this.auditLog.slice(-10)

    return stats
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
 * Types for navigation guards
 */
export interface NavigationGuardResult {
  item: NavigationItem
  allowed: boolean
  reason?: string
  redirectTo?: string
  guard?: NavigationGuard
  evaluation?: NavigationGuardEvaluation
  allEvaluations: NavigationGuardEvaluation[]
}

export interface NavigationGuardEvaluation {
  guard: NavigationGuard
  conditionMet: boolean
  action: NavigationGuardAction
}

export interface NavigationGuardAuditEntry {
  timestamp: number
  guardId?: string
  guardName?: string
  item: NavigationItem
  action: NavigationGuardAction
  result: string
  context: Record<string, any>
}

export interface NavigationGuardStatistics {
  totalGuards: number
  totalAuditEntries: number
  guardsByAction: Record<string, number>
  recentActivity: NavigationGuardAuditEntry[]
}

/**
 * Factory function to create NavigationGuardsManager
 */
export function createNavigationGuardsManager(
  context: NavigationContext,
  maxAuditEntries?: number
): NavigationGuardsManager {
  return new NavigationGuardsManager(context, maxAuditEntries)
}
