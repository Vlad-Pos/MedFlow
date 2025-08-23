import {
  DataState,
  DataError,
  DataSubscription,
  StateService
} from '../types/data-management.types'

/**
 * State Service
 *
 * Centralized state management for data operations, loading states, and error handling
 * across the data management layer.
 */

export class DataStateService implements StateService {
  private state: DataState = {
    loading: {},
    data: {},
    errors: {},
    cache: new Map(),
    operations: [],
    subscriptions: new Map()
  }

  private listeners: Map<string, Set<(data: any) => void>> = new Map()
  private subscriptionId: number = 0

  constructor() {
    this.initializeState()
  }

  /**
   * Initialize state
   */
  private initializeState(): void {
    this.state = {
      loading: {},
      data: {},
      errors: {},
      cache: new Map(),
      operations: [],
      subscriptions: new Map()
    }
  }

  /**
   * Get current state
   */
  getState(): DataState {
    return {
      loading: { ...this.state.loading },
      data: { ...this.state.data },
      errors: { ...this.state.errors },
      cache: new Map(this.state.cache),
      operations: [...this.state.operations],
      subscriptions: new Map(this.state.subscriptions)
    }
  }

  /**
   * Set loading state for a key
   */
  setLoading(key: string, loading: boolean): void {
    if (loading) {
      this.state.loading[key] = true
    } else {
      delete this.state.loading[key]
    }

    this.notifyListeners(key, { type: 'loading', loading })
  }

  /**
   * Get loading state for a key
   */
  getLoading(key: string): boolean {
    return this.state.loading[key] || false
  }

  /**
   * Set data for a key
   */
  setData<T = any>(key: string, data: T): void {
    this.state.data[key] = data
    this.notifyListeners(key, { type: 'data', data })
  }

  /**
   * Get data for a key
   */
  getData<T = any>(key: string): T | undefined {
    return this.state.data[key]
  }

  /**
   * Set error for a key
   */
  setError(key: string, error: DataError): void {
    this.state.errors[key] = error
    this.notifyListeners(key, { type: 'error', error })
  }

  /**
   * Get error for a key
   */
  getError(key: string): DataError | undefined {
    return this.state.errors[key]
  }

  /**
   * Clear error for a key
   */
  clearError(key: string): void {
    if (this.state.errors[key]) {
      delete this.state.errors[key]
      this.notifyListeners(key, { type: 'error_cleared' })
    }
  }

  /**
   * Clear all errors
   */
  clearAllErrors(): void {
    this.state.errors = {}
    this.notifyListeners('all', { type: 'all_errors_cleared' })
  }

  /**
   * Check if any operations are loading
   */
  isAnyLoading(): boolean {
    return Object.values(this.state.loading).some(loading => loading)
  }

  /**
   * Get all loading keys
   */
  getLoadingKeys(): string[] {
    return Object.keys(this.state.loading).filter(key => this.state.loading[key])
  }

  /**
   * Get all error keys
   */
  getErrorKeys(): string[] {
    return Object.keys(this.state.errors)
  }

  /**
   * Get state summary
   */
  getStateSummary(): {
    totalLoading: number
    totalErrors: number
    totalData: number
    totalSubscriptions: number
  } {
    return {
      totalLoading: Object.keys(this.state.loading).length,
      totalErrors: Object.keys(this.state.errors).length,
      totalData: Object.keys(this.state.data).length,
      totalSubscriptions: this.state.subscriptions.size
    }
  }

  /**
   * Subscribe to state changes for a key
   */
  subscribeToState(key: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set())
    }

    this.listeners.get(key)!.add(callback)

    // Create subscription reference
    const subscriptionId = `sub_${this.subscriptionId++}`
    const subscription: DataSubscription = {
      id: subscriptionId,
      query: { collection: key }, // Simplified query
      callback,
      errorCallback: undefined
    }

    this.state.subscriptions.set(subscriptionId, subscription)

    // Return unsubscribe function
    return () => {
      this.unsubscribe(subscriptionId)
      const listeners = this.listeners.get(key)
      if (listeners) {
        listeners.delete(callback)
        if (listeners.size === 0) {
          this.listeners.delete(key)
        }
      }
    }
  }

  /**
   * Get subscription by ID
   */
  getSubscription(id: string): DataSubscription | undefined {
    return this.state.subscriptions.get(id)
  }

  /**
   * Unsubscribe from state changes
   */
  unsubscribe(id: string): void {
    const subscription = this.state.subscriptions.get(id)
    if (subscription) {
      this.state.subscriptions.delete(id)
      // Remove from listeners if callback exists
      if (subscription.callback) {
        const listeners = this.listeners.get(id)
        if (listeners) {
          listeners.delete(subscription.callback)
        }
      }
    }
  }

  /**
   * Clear all subscriptions
   */
  clearAllSubscriptions(): void {
    this.state.subscriptions.clear()
    this.listeners.clear()
  }

  /**
   * Notify listeners of state changes
   */
  private notifyListeners(key: string, data: any): void {
    // Notify specific key listeners
    const keyListeners = this.listeners.get(key)
    if (keyListeners) {
      keyListeners.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`[StateService] Error in listener for key "${key}":`, error)
        }
      })
    }

    // Notify global listeners
    if (key !== 'all') {
      const globalListeners = this.listeners.get('all')
      if (globalListeners) {
        globalListeners.forEach(callback => {
          try {
            callback({ key, ...data })
          } catch (error) {
            console.error(`[StateService] Error in global listener:`, error)
          }
        })
      }
    }
  }

  /**
   * Batch state updates for performance
   */
  batchUpdate(updates: Array<{
    type: 'loading' | 'data' | 'error' | 'clear_error'
    key: string
    value?: any
  }>): void {
    const changes: Record<string, any> = {}

    updates.forEach(update => {
      switch (update.type) {
        case 'loading':
          if (update.value) {
            this.state.loading[update.key] = true
          } else {
            delete this.state.loading[update.key]
          }
          changes[update.key] = { type: 'loading', loading: update.value }
          break
        case 'data':
          this.state.data[update.key] = update.value
          changes[update.key] = { type: 'data', data: update.value }
          break
        case 'error':
          this.state.errors[update.key] = update.value
          changes[update.key] = { type: 'error', error: update.value }
          break
        case 'clear_error':
          delete this.state.errors[update.key]
          changes[update.key] = { type: 'error_cleared' }
          break
      }
    })

    // Notify all changes in batch
    Object.entries(changes).forEach(([key, data]) => {
      this.notifyListeners(key, data)
    })
  }

  /**
   * Reset state to initial values
   */
  resetState(): void {
    this.initializeState()
    this.clearAllSubscriptions()
    this.notifyListeners('all', { type: 'state_reset' })
  }

  /**
   * Get state snapshot for debugging
   */
  getDebugSnapshot(): {
    loadingCount: number
    dataCount: number
    errorCount: number
    subscriptionCount: number
    listenerCount: number
  } {
    const listenerCount = Array.from(this.listeners.values())
      .reduce((sum, set) => sum + set.size, 0)

    return {
      loadingCount: Object.keys(this.state.loading).length,
      dataCount: Object.keys(this.state.data).length,
      errorCount: Object.keys(this.state.errors).length,
      subscriptionCount: this.state.subscriptions.size,
      listenerCount
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.clearAllSubscriptions()
    this.initializeState()
  }
}

/**
 * Factory function to create StateService
 */
export function createStateService(): DataStateService {
  return new DataStateService()
}

/**
 * Singleton instance for global use
 */
let globalStateService: DataStateService | null = null

export function getGlobalStateService(): DataStateService {
  if (!globalStateService) {
    globalStateService = createStateService()
  }
  return globalStateService
}

export function clearGlobalStateService(): void {
  if (globalStateService) {
    globalStateService.destroy()
    globalStateService = null
  }
}
