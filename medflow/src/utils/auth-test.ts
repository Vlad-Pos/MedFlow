// Authentication test utilities
import { auth } from '../services/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'

export const testAuthConnection = async (): Promise<boolean> => {
  try {
    // Test if Firebase Auth is properly initialized
    const currentUser = auth.currentUser
    console.log('Firebase Auth initialized:', !!auth)
    console.log('Current user:', currentUser?.email || 'None')
    return true
  } catch (error) {
    console.error('Auth connection test failed:', error)
    return false
  }
}

export const testAuthStateListener = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user?.email || 'No user')
      unsubscribe()
      resolve(true)
    }, (error) => {
      console.error('Auth state listener error:', error)
      resolve(false)
    })
  })
}

export const testLogout = async (): Promise<boolean> => {
  try {
    await signOut(auth)
    console.log('Logout successful')
    return true
  } catch (error) {
    console.error('Logout failed:', error)
    return false
  }
}

export const logAuthStatus = () => {
  console.log('=== AUTH STATUS ===')
  console.log('Firebase Auth initialized:', !!auth)
  console.log('Current user:', auth.currentUser?.email || 'None')
  console.log('User ID:', auth.currentUser?.uid || 'None')
  console.log('Email verified:', auth.currentUser?.emailVerified || false)
  console.log('==================')
}
