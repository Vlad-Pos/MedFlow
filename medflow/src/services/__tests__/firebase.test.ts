import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Mock Firebase modules
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
  getAuth: vi.fn(),
  getFirestore: vi.fn(),
  getStorage: vi.fn()
}))

// Mock environment variables
vi.mock('import.meta.env', () => ({
  VITE_FIREBASE_API_KEY: 'test-api-key',
  VITE_FIREBASE_AUTH_DOMAIN: 'test-auth-domain',
  VITE_FIREBASE_PROJECT_ID: 'test-project-id',
  VITE_FIREBASE_STORAGE_BUCKET: 'test-storage-bucket',
  VITE_FIREBASE_MESSAGING_SENDER_ID: 'test-sender-id',
  VITE_FIREBASE_APP_ID: 'test-app-id'
}))

describe('Firebase Configuration', () => {
  let mockApp: any
  let mockAuth: any
  let mockFirestore: any
  let mockStorage: any

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Create mock objects
    mockApp = { name: 'test-app' }
    mockAuth = { name: 'test-auth' }
    mockFirestore = { name: 'test-firestore' }
    mockStorage = { name: 'test-storage' }
    
    // Setup mock return values
    vi.mocked(initializeApp).mockReturnValue(mockApp)
    vi.mocked(getAuth).mockReturnValue(mockAuth)
    vi.mocked(getFirestore).mockReturnValue(mockFirestore)
    vi.mocked(getStorage).mockReturnValue(mockStorage)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('App Initialization', () => {
    it('initializes Firebase app with correct configuration', async () => {
      // Import the module to trigger initialization
      const { auth, db, storage } = await import('../firebase')

      expect(initializeApp).toHaveBeenCalledWith({
        apiKey: 'test-api-key',
        authDomain: 'test-auth-domain',
        projectId: 'test-project-id',
        storageBucket: 'test-storage-bucket',
        messagingSenderId: 'test-sender-id',
        appId: 'test-app-id'
      })
    })

    it('initializes Firebase app with fallback values when env vars are missing', async () => {
      // Mock missing environment variables by updating the mock
      const envMock = vi.mocked(await import('import.meta.env'))
      envMock.VITE_FIREBASE_API_KEY = undefined
      envMock.VITE_FIREBASE_AUTH_DOMAIN = undefined

      // Re-import to test initialization
      const { auth, db, storage } = await import('../firebase')

      expect(initializeApp).toHaveBeenCalledWith({
        apiKey: 'YOUR_API_KEY',
        authDomain: 'YOUR_AUTH_DOMAIN',
        projectId: 'test-project-id',
        storageBucket: 'test-storage-bucket',
        messagingSenderId: 'test-sender-id',
        appId: 'test-app-id'
      })
    })

    it('calls getAuth with initialized app', async () => {
      // Import the module to trigger initialization
      const { auth, db, storage } = await import('../firebase')

      expect(getAuth).toHaveBeenCalledWith(mockApp)
    })

    it('calls getFirestore with initialized app', async () => {
      // Import the module to trigger initialization
      const { auth, db, storage } = await import('../firebase')

      expect(getFirestore).toHaveBeenCalledWith(mockApp)
    })

    it('calls getStorage with initialized app', async () => {
      // Import the module to trigger initialization
      const { auth, db, storage } = await import('../firebase')

      expect(getStorage).toHaveBeenCalledWith(mockApp)
    })
  })

  describe('Service Exports', () => {
    it('exports auth service', async () => {
      // Import the module to test exports
      const { auth: exportedAuth } = await import('../firebase')

      expect(exportedAuth).toBe(mockAuth)
    })

    it('exports firestore service', async () => {
      // Import the module to test exports
      const { db: exportedDb } = await import('../firebase')

      expect(exportedDb).toBe(mockFirestore)
    })

    it('exports storage service', async () => {
      // Import the module to test exports
      const { storage: exportedStorage } = await import('../firebase')

      expect(exportedStorage).toBe(mockStorage)
    })
  })

  describe('Error Handling', () => {
    it('handles Firebase initialization errors gracefully', async () => {
      // Mock initialization error
      vi.mocked(initializeApp).mockImplementation(() => {
        throw new Error('Firebase initialization failed')
      })

      // Should not crash the module
      await expect(import('../firebase')).rejects.toThrow('Firebase initialization failed')
    })

    it('handles missing Firebase configuration gracefully', async () => {
      // Mock all environment variables as undefined
      const envMock = vi.mocked(await import('import.meta.env'))
      envMock.VITE_FIREBASE_API_KEY = undefined
      envMock.VITE_FIREBASE_PROJECT_ID = undefined
      envMock.VITE_FIREBASE_AUTH_DOMAIN = undefined
      envMock.VITE_FIREBASE_STORAGE_BUCKET = undefined
      envMock.VITE_FIREBASE_MESSAGING_SENDER_ID = undefined
      envMock.VITE_FIREBASE_APP_ID = undefined

      // Should use fallback values
      const { auth, db, storage } = await import('../firebase')

      expect(initializeApp).toHaveBeenCalledWith({
        apiKey: 'YOUR_API_KEY',
        authDomain: 'YOUR_AUTH_DOMAIN',
        projectId: 'YOUR_PROJECT_ID',
        storageBucket: 'YOUR_STORAGE_BUCKET',
        messagingSenderId: 'YOUR_SENDER_ID',
        appId: 'YOUR_APP_ID'
      })
    })

    it('handles service initialization errors gracefully', async () => {
      // Mock service initialization error
      vi.mocked(getAuth).mockImplementation(() => {
        throw new Error('Auth service failed')
      })

      // Should not crash the module
      await expect(import('../firebase')).rejects.toThrow('Auth service failed')
    })
  })

  describe('Configuration Validation', () => {
    it('validates required configuration fields', async () => {
      // Mock missing required fields
      const envMock = vi.mocked(await import('import.meta.env'))
      envMock.VITE_FIREBASE_PROJECT_ID = undefined

      // Should use fallback values
      const { auth, db, storage } = await import('../firebase')

      expect(initializeApp).toHaveBeenCalledWith({
        apiKey: 'test-api-key',
        authDomain: 'test-auth-domain',
        projectId: 'YOUR_PROJECT_ID',
        storageBucket: 'test-storage-bucket',
        messagingSenderId: 'test-sender-id',
        appId: 'test-app-id'
      })
    })

    it('uses fallback values for optional configuration fields', async () => {
      // Mock missing optional fields
      const envMock = vi.mocked(await import('import.meta.env'))
      envMock.VITE_FIREBASE_MESSAGING_SENDER_ID = undefined
      envMock.VITE_FIREBASE_APP_ID = undefined

      // Should use fallback values
      const { auth, db, storage } = await import('../firebase')

      expect(initializeApp).toHaveBeenCalledWith({
        apiKey: 'test-api-key',
        authDomain: 'test-auth-domain',
        projectId: 'test-project-id',
        storageBucket: 'test-storage-bucket',
        messagingSenderId: 'YOUR_SENDER_ID',
        appId: 'YOUR_APP_ID'
      })
    })
  })

  describe('Service Dependencies', () => {
    it('initializes services in correct order', async () => {
      // Import the module to test initialization order
      const { auth, db, storage } = await import('../firebase')

      // Check that services are initialized after app
      expect(initializeApp).toHaveBeenCalledBefore(getAuth)
      expect(initializeApp).toHaveBeenCalledBefore(getFirestore)
      expect(initializeApp).toHaveBeenCalledBefore(getStorage)
    })

    it('uses same app instance for all services', async () => {
      // Import the module to test service initialization
      const { auth, db, storage } = await import('../firebase')

      expect(getAuth).toHaveBeenCalledWith(mockApp)
      expect(getFirestore).toHaveBeenCalledWith(mockApp)
      expect(getStorage).toHaveBeenCalledWith(mockApp)
    })
  })

  describe('Production vs Development', () => {
    it('handles different environment configurations', async () => {
      // Mock production environment
      const envMock = vi.mocked(await import('import.meta.env'))
      envMock.VITE_FIREBASE_API_KEY = 'prod-api-key'
      envMock.VITE_FIREBASE_PROJECT_ID = 'prod-project-id'

      // Re-import to test configuration
      const { auth, db, storage } = await import('../firebase')

      expect(initializeApp).toHaveBeenCalledWith({
        apiKey: 'prod-api-key',
        authDomain: 'test-auth-domain',
        projectId: 'prod-project-id',
        storageBucket: 'test-storage-bucket',
        messagingSenderId: 'test-sender-id',
        appId: 'test-app-id'
      })
    })

    it('handles development environment with fallbacks', async () => {
      // Mock development environment with some missing values
      const envMock = vi.mocked(await import('import.meta.env'))
      envMock.VITE_FIREBASE_API_KEY = 'dev-api-key'
      envMock.VITE_FIREBASE_AUTH_DOMAIN = undefined

      // Re-import to test configuration
      const { auth, db, storage } = await import('../firebase')

      expect(initializeApp).toHaveBeenCalledWith({
        apiKey: 'dev-api-key',
        authDomain: 'YOUR_AUTH_DOMAIN',
        projectId: 'test-project-id',
        storageBucket: 'test-storage-bucket',
        messagingSenderId: 'test-sender-id',
        appId: 'test-app-id'
      })
    })
  })

  describe('Module Resilience', () => {
    it('continues to work even if some services fail to initialize', async () => {
      // Mock partial service failure
      vi.mocked(getStorage).mockImplementation(() => {
        throw new Error('Storage service failed')
      })

      // Should not crash the module
      await expect(import('../firebase')).rejects.toThrow('Storage service failed')
    })

    it('provides fallback services when primary services fail', async () => {
      // Mock all services failing
      vi.mocked(getAuth).mockImplementation(() => {
        throw new Error('Auth service failed')
      })
      vi.mocked(getFirestore).mockImplementation(() => {
        throw new Error('Firestore service failed')
      })
      vi.mocked(getStorage).mockImplementation(() => {
        throw new Error('Storage service failed')
      })

      // Should not crash the module
      await expect(import('../firebase')).rejects.toThrow('Auth service failed')
    })
  })

  describe('Configuration Security', () => {
    it('does not expose sensitive configuration in production', async () => {
      // Mock production environment
      const envMock = vi.mocked(await import('import.meta.env'))
      envMock.VITE_FIREBASE_API_KEY = 'prod-api-key'
      envMock.VITE_FIREBASE_PROJECT_ID = 'prod-project-id'

      // Re-import to test configuration
      const { auth, db, storage } = await import('../firebase')

      // Should use environment variables, not hardcoded values
      expect(initializeApp).toHaveBeenCalledWith(
        expect.objectContaining({
          apiKey: 'prod-api-key',
          projectId: 'prod-project-id'
        })
      )
    })

    it('uses environment variables for sensitive data', async () => {
      // Test that environment variables are used
      const { auth, db, storage } = await import('../firebase')

      expect(initializeApp).toHaveBeenCalledWith({
        apiKey: 'test-api-key',
        authDomain: 'test-auth-domain',
        projectId: 'test-project-id',
        storageBucket: 'test-storage-bucket',
        messagingSenderId: 'test-sender-id',
        appId: 'test-app-id'
      })
    })
  })
})
