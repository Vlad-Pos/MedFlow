import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getPerformance } from 'firebase/performance'

// TODO: Replace with your Firebase project config
// You can store these in environment variables for production
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'YOUR_AUTH_DOMAIN',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'YOUR_STORAGE_BUCKET',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'YOUR_SENDER_ID',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'YOUR_APP_ID',
}

console.log('🔍 Debug: Firebase config:', firebaseConfig)

// Initialize Firebase app
const app = initializeApp(firebaseConfig)
console.log('🔍 Debug: Firebase app initialized successfully')

// Initialize core services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

console.log('🔍 Debug: Firebase services initialized:', { auth: !!auth, db: !!db, storage: !!storage })

// Initialize optional services based on environment
let performance: any = null

if (import.meta.env.VITE_PERFORMANCE_MONITORING === 'true') {
  try {
    performance = getPerformance(app)
    console.info('MedFlow: Performance monitoring enabled')
  } catch (error) {
    console.warn('MedFlow: Performance monitoring initialization failed:', error)
  }
}

if (import.meta.env.VITE_ANALYTICS_ENABLED === 'true') {
  try {
    // Initialize analytics
    // This part would require a specific Firebase Analytics import and initialization
    // For now, we'll just log a message if enabled.
    console.info('MedFlow: Analytics enabled (placeholder)')
  } catch (error) {
    console.warn('MedFlow: Analytics initialization failed:', error)
  }
}

console.info('MedFlow: Firebase initialized successfully')
console.info('MedFlow: Project ID:', firebaseConfig.projectId)
console.info('MedFlow: Environment:', import.meta.env.VITE_ENVIRONMENT || 'development')
console.info('MedFlow: Demo Mode:', import.meta.env.VITE_DEMO_MODE === 'true' ? 'enabled' : 'disabled')