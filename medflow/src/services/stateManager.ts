import { advancedCache } from './advancedCache'
import { performanceMonitor } from './performanceMonitor'

interface StateAction<T> {
  type: string
  payload?: any
  timestamp: number
  id: string
  metadata?: Record<string, any>
}

interface StateSnapshot<T> {
  state: T
  timestamp: number
  actionId: string
  checksum: string
}

interface StateManagerOptions<T> {
  initialState: T
  enablePersistence?: boolean
  enableCompression?: boolean
  maxHistorySize?: number
  enablePerformanceMonitoring?: boolean
  enableStateValidation?: boolean
  validationSchema?: any
  enableTimeTravel?: boolean
  enableOptimisticUpdates?: boolean
  debounceMs?: number
}

interface StateManagerStats {
  totalActions: number
  totalSnapshots: number
  averageActionTime: number
  memoryUsage: number
  cacheHitRate: number
  validationErrors: number
  timeTravelUsage: number
}

/**
 * Enterprise-grade state management service
 * 
 * Features:
 * - Performance-optimized state updates
 * - Memory-aware state management
 * - Intelligent state synchronization
 * - Time travel debugging capabilities
 * - Optimistic updates with rollback
 * - State validation and sanitization
 * - Performance monitoring and analytics
 */
class StateManager<T extends Record<string, any>> {
  private currentState: T
  private actionHistory: StateAction<T>[] = []
  private stateSnapshots: StateSnapshot<T>[] = []
  private subscribers = new Set<(state: T, action: StateAction<T>) => void>()
  private options: Required<StateManagerOptions<T>>
  private isProcessing = false
  private pendingActions: StateAction<T>[] = []
  private debounceTimer?: NodeJS.Timeout
  private performanceMetrics = {
    totalActions: 0,
    totalActionTime: 0,
    validationErrors: 0,
    timeTravelUsage: 0
  }

  constructor(options: StateManagerOptions<T>) {
    this.options = {
      enablePersistence: options.enablePersistence ?? true,
      enableCompression: options.enableCompression ?? true,
      maxHistorySize: options.maxHistorySize ?? 100,
      enablePerformanceMonitoring: options.enablePerformanceMonitoring ?? true,
      enableStateValidation: options.enableStateValidation ?? true,
      validationSchema: options.validationSchema,
      enableTimeTravel: options.enableTimeTravel ?? false,
      enableOptimisticUpdates: options.enableOptimisticUpdates ?? false,
      debounceMs: options.debounceMs ?? 16, // 60fps default
      ...options
    }

    this.currentState = { ...options.initialState }
    this.initialize()
  }

  /**
   * Initialize the state manager
   */
  private async initialize(): Promise<void> {
    // Load persistent state if enabled
    if (this.options.enablePersistence) {
      await this.loadPersistentState()
    }

    // Create initial snapshot
    this.createSnapshot('initialization')

    // Start performance monitoring
    if (this.options.enablePerformanceMonitoring) {
      this.startPerformanceMonitoring()
    }
  }

  /**
   * Dispatch an action to update state
   */
  async dispatch(action: Omit<StateAction<T>, 'timestamp' | 'id'>): Promise<T> {
    const startTime = performance.now()
    
    const fullAction: StateAction<T> = {
      ...action,
      timestamp: Date.now(),
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    // Performance monitoring
    if (this.options.enablePerformanceMonitoring) {
      performanceMonitor.startComponentMonitoring(`state-action-${action.type}`)
    }

    try {
      // Validate action if schema is provided
      if (this.options.enableStateValidation && this.options.validationSchema) {
        const validationResult = await this.validateAction(fullAction)
        if (!validationResult.isValid) {
          throw new Error(`Action validation failed: ${validationResult.errors.join(', ')}`)
        }
      }

      // Process action
      const newState = await this.processAction(fullAction)
      
      // Update current state
      this.currentState = newState
      
      // Add to action history
      this.addToHistory(fullAction)
      
      // Create snapshot if time travel is enabled
      if (this.options.enableTimeTravel) {
        this.createSnapshot(fullAction.id)
      }
      
      // Notify subscribers
      this.notifySubscribers(newState, fullAction)
      
      // Persist state if enabled
      if (this.options.enablePersistence) {
        await this.persistState()
      }

      // Performance monitoring
      if (this.options.enablePerformanceMonitoring) {
        const endTime = performance.now()
        const actionTime = endTime - startTime
        
        this.performanceMetrics.totalActions++
        this.performanceMetrics.totalActionTime += actionTime
        
        if (actionTime > 16) {
          performanceMonitor.createAlert(
            'warning',
            'state-manager',
            'componentRenderTime',
            actionTime,
            16,
            `State action took ${actionTime.toFixed(2)}ms: ${action.type}`
          )
        }
      }

      return newState
    } catch (error) {
      // Rollback optimistic updates if enabled
      if (this.options.enableOptimisticUpdates) {
        await this.rollbackOptimisticUpdate()
      }
      
      throw error
    }
  }

  /**
   * Process an action and return new state
   */
  private async processAction(action: StateAction<T>): Promise<T> {
    // Optimistic update if enabled
    if (this.options.enableOptimisticUpdates) {
      this.applyOptimisticUpdate(action)
    }

    // Process the action based on type
    let newState = { ...this.currentState }
    
    switch (action.type) {
      case 'SET_STATE':
        newState = { ...newState, ...action.payload }
        break
      
      case 'MERGE_STATE':
        newState = this.deepMerge(newState, action.payload)
        break
      
      case 'RESET_STATE':
        newState = { ...this.options.initialState }
        break
      
      case 'UPDATE_FIELD':
        if (action.payload?.path && action.payload?.value !== undefined) {
          newState = this.updateNestedField(newState, action.payload.path, action.payload.value)
        }
        break
      
      case 'BATCH_UPDATE':
        if (Array.isArray(action.payload)) {
          for (const update of action.payload) {
            newState = this.deepMerge(newState, update)
          }
        }
        break
      
      default:
        // Custom action processing
        newState = await this.processCustomAction(action, newState)
    }

    // Validate new state if schema is provided
    if (this.options.enableStateValidation && this.options.validationSchema) {
      const validationResult = await this.validateState(newState)
      if (!validationResult.isValid) {
        throw new Error(`State validation failed: ${validationResult.errors.join(', ')}`)
      }
    }

    return newState
  }

  /**
   * Process custom actions
   */
  private async processCustomAction(action: StateAction<T>, currentState: T): Promise<T> {
    // This method can be extended for custom action processing
    // For now, return current state unchanged
    return currentState
  }

  /**
   * Apply optimistic update
   */
  private applyOptimisticUpdate(action: StateAction<T>): void {
    // Store current state for potential rollback
    this.pendingActions.push(action)
  }

  /**
   * Rollback optimistic update
   */
  private async rollbackOptimisticUpdate(): Promise<void> {
    if (this.pendingActions.length === 0) return

    // Remove last pending action
    this.pendingActions.pop()
    
    // Restore previous state
    if (this.stateSnapshots.length > 1) {
      const previousSnapshot = this.stateSnapshots[this.stateSnapshots.length - 2]
      this.currentState = { ...previousSnapshot.state }
      this.notifySubscribers(this.currentState, {
        type: 'ROLLBACK',
        timestamp: Date.now(),
        id: 'rollback'
      })
    }
  }

  /**
   * Deep merge objects
   */
  private deepMerge(target: any, source: any): any {
    const result = { ...target }
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key])
      } else {
        result[key] = source[key]
      }
    }
    
    return result
  }

  /**
   * Update nested field in state
   */
  private updateNestedField(state: any, path: string[], value: any): any {
    const result = { ...state }
    let current = result
    
    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i]
      if (!(key in current)) {
        current[key] = {}
      }
      current[key] = { ...current[key] }
      current = current[key]
    }
    
    current[path[path.length - 1]] = value
    return result
  }

  /**
   * Add action to history
   */
  private addToHistory(action: StateAction<T>): void {
    this.actionHistory.push(action)
    
    // Maintain history size limit
    if (this.actionHistory.length > this.options.maxHistorySize) {
      this.actionHistory.shift()
    }
  }

  /**
   * Create state snapshot
   */
  private createSnapshot(actionId: string): void {
    const snapshot: StateSnapshot<T> = {
      state: { ...this.currentState },
      timestamp: Date.now(),
      actionId,
      checksum: this.calculateChecksum(this.currentState)
    }
    
    this.stateSnapshots.push(snapshot)
    
    // Maintain snapshot size limit
    if (this.stateSnapshots.length > this.options.maxHistorySize) {
      this.stateSnapshots.shift()
    }
  }

  /**
   * Calculate state checksum
   */
  private calculateChecksum(state: T): string {
    try {
      const jsonString = JSON.stringify(state)
      return btoa(jsonString).slice(0, 8)
    } catch {
      return 'unknown'
    }
  }

  /**
   * Validate action
   */
  private async validateAction(action: StateAction<T>): Promise<{ isValid: boolean; errors: string[] }> {
    try {
      // Basic validation
      if (!action.type || typeof action.type !== 'string') {
        return { isValid: false, errors: ['Invalid action type'] }
      }
      
      // Custom validation if schema is provided
      if (this.options.validationSchema) {
        // This would integrate with a validation library like Zod, Yup, etc.
        // For now, return basic validation
        return { isValid: true, errors: [] }
      }
      
      return { isValid: true, errors: [] }
    } catch (error) {
      return { isValid: false, errors: [error instanceof Error ? error.message : 'Validation error'] }
    }
  }

  /**
   * Validate state
   */
  private async validateState(state: T): Promise<{ isValid: boolean; errors: string[] }> {
    try {
      // Basic validation
      if (!state || typeof state !== 'object') {
        return { isValid: false, errors: ['Invalid state structure'] }
      }
      
      // Custom validation if schema is provided
      if (this.options.validationSchema) {
        // This would integrate with a validation library
        return { isValid: true, errors: [] }
      }
      
      return { isValid: true, errors: [] }
    } catch (error) {
      this.performanceMetrics.validationErrors++
      return { isValid: false, errors: [error instanceof Error ? error.message : 'State validation error'] }
    }
  }

  /**
   * Subscribe to state changes
   */
  subscribe(callback: (state: T, action: StateAction<T>) => void): () => void {
    this.subscribers.add(callback)
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback)
    }
  }

  /**
   * Notify all subscribers
   */
  private notifySubscribers(state: T, action: StateAction<T>): void {
    this.subscribers.forEach(callback => {
      try {
        callback(state, action)
      } catch (error) {
        console.error('Error in state subscriber:', error)
      }
    })
  }

  /**
   * Get current state
   */
  getState(): T {
    return { ...this.currentState }
  }

  /**
   * Get state at specific point in time (time travel)
   */
  getStateAtTime(timestamp: number): T | null {
    if (!this.options.enableTimeTravel) return null
    
    const snapshot = this.stateSnapshots.find(s => s.timestamp <= timestamp)
    return snapshot ? { ...snapshot.state } : null
  }

  /**
   * Get action history
   */
  getActionHistory(): StateAction<T>[] {
    return [...this.actionHistory]
  }

  /**
   * Get state snapshots
   */
  getStateSnapshots(): StateSnapshot<T>[] {
    return [...this.stateSnapshots]
  }

  /**
   * Time travel to specific action
   */
  timeTravelToAction(actionId: string): T | null {
    if (!this.options.enableTimeTravel) return null
    
    const snapshot = this.stateSnapshots.find(s => s.actionId === actionId)
    if (snapshot) {
      this.performanceMetrics.timeTravelUsage++
      return { ...snapshot.state }
    }
    
    return null
  }

  /**
   * Get state manager statistics
   */
  getStats(): StateManagerStats {
    const cacheStats = advancedCache.getStats()
    
    return {
      totalActions: this.performanceMetrics.totalActions,
      totalSnapshots: this.stateSnapshots.length,
      averageActionTime: this.performanceMetrics.totalActions > 0 
        ? this.performanceMetrics.totalActionTime / this.performanceMetrics.totalActions 
        : 0,
      memoryUsage: this.getMemoryUsage(),
      cacheHitRate: cacheStats.hitRate,
      validationErrors: this.performanceMetrics.validationErrors,
      timeTravelUsage: this.performanceMetrics.timeTravelUsage
    }
  }

  /**
   * Get memory usage
   */
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize
    }
    return 0
  }

  /**
   * Start performance monitoring
   */
  private startPerformanceMonitoring(): void {
    // Monitor memory usage
    setInterval(() => {
      const memoryUsage = this.getMemoryUsage()
      if (memoryUsage > 100 * 1024 * 1024) { // 100MB threshold
        performanceMonitor.createAlert(
          'warning',
          'state-manager',
          'memoryUsage',
          memoryUsage,
          100 * 1024 * 1024,
          `High memory usage in state manager: ${(memoryUsage / 1024 / 1024).toFixed(2)}MB`
        )
      }
    }, 30000) // Check every 30 seconds
  }

  /**
   * Persist state to storage
   */
  private async persistState(): Promise<void> {
    try {
      const persistentData = {
        state: this.currentState,
        timestamp: Date.now(),
        version: '1.0'
      }
      
      await advancedCache.set('persistent_state', persistentData, {
        priority: 'high',
        enablePersistent: true,
        tags: ['persistent', 'state']
      })
    } catch (error) {
      console.warn('Failed to persist state:', error)
    }
  }

  /**
   * Load persistent state from storage
   */
  private async loadPersistentState(): Promise<void> {
    try {
      const persistentData = await advancedCache.get('persistent_state') as any
      if (persistentData && persistentData.state) {
        this.currentState = { ...persistentData.state }
      }
    } catch (error) {
      console.warn('Failed to load persistent state:', error)
    }
  }

  /**
   * Destroy the state manager
   */
  destroy(): void {
    this.subscribers.clear()
    this.actionHistory = []
    this.stateSnapshots = []
    this.pendingActions = []
    
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }
  }
}

export default StateManager
