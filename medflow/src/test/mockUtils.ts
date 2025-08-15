// Mock utilities for Firebase that can be imported by tests
import { vi } from 'vitest'

// Create a mock auth state that can be controlled by tests
let mockAuthState: any = null
let mockAuthStateCallback: ((user: any) => void) | null = null

// Mock Firebase Auth functions
export const mockFirebaseAuth = {
  setAuthState: (user: any) => {
    mockAuthState = user
    if (mockAuthStateCallback) {
      mockAuthStateCallback(user)
    }
  },
  clearAuthState: () => {
    mockAuthState = null
    if (mockAuthStateCallback) {
      mockAuthStateCallback(null)
    }
  },
  setAuthStateCallback: (callback: (user: any) => void) => {
    mockAuthStateCallback = callback
  }
}

// Mock Firebase functions
export const mockFirebaseFunctions = {
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  updateProfile: vi.fn(),
  onAuthStateChanged: vi.fn((auth: any, callback: (user: any) => void) => {
    mockAuthStateCallback = callback
    // Call callback immediately with current state
    if (mockAuthState !== undefined) {
      callback(mockAuthState)
    }
    const unsubscribe = vi.fn()
    return unsubscribe
  }),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  doc: vi.fn(),
  collection: vi.fn(),
  getFirestore: vi.fn(() => ({})),
  getAuth: vi.fn(() => ({})),
  getStorage: vi.fn(() => ({})),
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
  deleteObject: vi.fn(),
  serverTimestamp: vi.fn(() => ({ toDate: () => new Date() })),
  Timestamp: {
    now: vi.fn(() => ({ toDate: () => new Date() })),
    fromDate: vi.fn((date: Date) => ({ toDate: () => date }))
  }
}
