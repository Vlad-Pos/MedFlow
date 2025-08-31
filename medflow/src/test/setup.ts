import '@testing-library/jest-dom'
import '@testing-library/jest-dom/vitest'
import { vi, beforeAll, afterAll, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Mock demo utilities
vi.mock('../../utils/demo', () => ({
  isDemoMode: vi.fn(() => {
    console.log('isDemoMode called, returning true')
    return true
  }),
  subscribeToDemoAppointments: vi.fn((callback) => {
    console.log('subscribeToDemoAppointments called with callback:', typeof callback)
    // Simulate demo data loading immediately
    const demoData = []
    console.log('Calling callback with demo data:', demoData)
    callback(demoData)
    console.log('Callback executed')
    return () => {
      console.log('Unsubscribe function called')
    }
  }),
  addDemoAppointment: vi.fn(),
  deleteDemoAppointment: vi.fn(),
  updateDemoAppointment: vi.fn()
}))

// Mock Firebase
// Create mock functions directly in setup to avoid circular dependencies
const mockAuthFunctions = {
  getAuth: vi.fn(() => ({})),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  updateProfile: vi.fn(),
  onAuthStateChanged: vi.fn((auth: any, callback: (user: any) => void) => {
    // Simulate no user initially with a small delay to match real behavior
    setTimeout(() => callback(null), 0)
    // Return a proper unsubscribe function
    return () => {}
  })
}

vi.mock('firebase/auth', () => mockAuthFunctions)

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn(),
  doc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  setDoc: vi.fn(),
  onSnapshot: vi.fn((query, onNext, onError) => {
    // Simulate successful data loading with empty array
    if (onNext) {
      // Create a mock snapshot with empty docs array
      const mockSnapshot = {
        docs: [],
        empty: true,
        size: 0,
        metadata: { fromCache: false, hasPendingWrites: false }
      }
      // Call the callback immediately to resolve loading state
      onNext(mockSnapshot)
    }
    // Return a proper unsubscribe function that can be called
    const unsubscribe = vi.fn()
    return unsubscribe
  }),
  serverTimestamp: vi.fn(() => ({ toDate: () => new Date() })),
  Timestamp: {
    now: vi.fn(() => ({ toDate: () => new Date() })),
    fromDate: vi.fn((date: Date) => ({ toDate: () => date }))
  }
}))

vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(() => ({})),
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
  deleteObject: vi.fn()
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

// Mock Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    button: 'button',
    form: 'form',
    input: 'input',
    textarea: 'textarea',
    select: 'select',
    option: 'option',
    label: 'label',
    span: 'span',
    p: 'p',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
    ul: 'ul',
    li: 'li',
    nav: 'nav',
    header: 'header',
    footer: 'footer',
    main: 'main',
    section: 'section',
    article: 'article',
    aside: 'aside'
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  useMotionValue: vi.fn(() => ({ get: vi.fn(), set: vi.fn() })),
  useTransform: vi.fn(() => ({ get: vi.fn() })),
  useSpring: vi.fn(() => ({ get: vi.fn(), set: vi.fn() }))
}))

// Mock GSAP
vi.mock('gsap', () => ({
  to: vi.fn(),
  from: vi.fn(),
  fromTo: vi.fn(),
  timeline: vi.fn(() => ({
    to: vi.fn(),
    from: vi.fn(),
    fromTo: vi.fn(),
    add: vi.fn(),
    play: vi.fn(),
    pause: vi.fn(),
    reverse: vi.fn()
  })),
  set: vi.fn(),
  getProperty: vi.fn(),
  setProperty: vi.fn()
}))

// Mock React Router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
    useParams: () => ({}),
    useSearchParams: () => [new URLSearchParams(), vi.fn()]
  }
})

// Mock Intersection Observer
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Mock Resize Observer
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})

// Mock window.open
// Remove the global window.open mock to avoid conflicts with test-specific spies

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
} as Storage
global.localStorage = localStorageMock

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
} as Storage
global.sessionStorage = sessionStorageMock

// Mock console methods in tests to reduce noise
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

beforeAll(() => {
  console.error = vi.fn()
  console.warn = vi.fn()
})

afterAll(() => {
  console.error = originalConsoleError
  console.warn = originalConsoleWarn
})

// Cleanup after each test
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  vi.clearAllTimers()
})

// Global test utilities
global.testUtils = {
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  mockFirebaseError: (code: string, message: string) => ({
    code,
    message,
    name: 'FirebaseError'
  }),
  createMockUser: (overrides = {}) => ({
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
    role: 'USER',
    permissions: ['read:appointments', 'write:appointments'],
    verified: true,
    lastActivity: new Date(),
    ...overrides
  })
}

// Type declarations for global test utilities
declare global {
  namespace NodeJS {
    interface Global {
      testUtils: {
        waitFor: (ms: number) => Promise<void>
        mockFirebaseError: (code: string, message: string) => any
        createMockUser: (overrides?: any) => any
      }
    }
  }
}
