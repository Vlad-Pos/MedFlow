import { isDemoMode } from './demo'

/**
 * Demo Firebase Utility
 * 
 * Provides demo mode bypasses for Firebase operations to prevent
 * permission errors during development and testing
 */

/**
 * Check if current operation should use demo mode
 */
export function shouldUseDemoMode(): boolean {
  return isDemoMode()
}

/**
 * Get demo user data for demo mode operations
 */
export function getDemoUserData() {
  return {
    uid: 'demo-uid-123',
    email: 'demo@medflow.local',
    displayName: 'Dr. Demo Medic',
    role: 'ADMIN',
    permissions: ['users', 'analytics', 'settings', 'reports', 'appointments', 'patients']
  }
}

/**
 * Demo mode wrapper for Firebase operations
 * Returns mock data instead of making actual Firebase calls
 */
export function withDemoMode<T>(
  firebaseOperation: () => Promise<T>,
  demoData: T,
  operationName: string = 'Firebase operation'
): Promise<T> {
  if (shouldUseDemoMode()) {
    console.log(`🔧 Demo Mode: ${operationName} - returning mock data`)
    return Promise.resolve(demoData)
  }
  
  return firebaseOperation()
}

/**
 * Demo mode wrapper for Firebase queries
 */
export function withDemoModeQuery<T>(
  firebaseQuery: () => Promise<T[]>,
  demoData: T[],
  operationName: string = 'Firebase query'
): Promise<T[]> {
  if (shouldUseDemoMode()) {
    console.log(`🔧 Demo Mode: ${operationName} - returning mock data`)
    return Promise.resolve(demoData)
  }
  
  return firebaseQuery()
}

/**
 * Demo mode wrapper for Firebase writes
 */
export function withDemoModeWrite<T>(
  firebaseWrite: () => Promise<T>,
  demoResult: T,
  operationName: string = 'Firebase write'
): Promise<T> {
  if (shouldUseDemoMode()) {
    console.log(`🔧 Demo Mode: ${operationName} - simulating success`)
    return Promise.resolve(demoResult)
  }
  
  return firebaseWrite()
}
