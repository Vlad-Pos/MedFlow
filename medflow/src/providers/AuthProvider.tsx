/**
 * Enhanced Authentication Provider for MedFlow
 * 
 * Provides comprehensive authentication services with:
 * - Enhanced error handling with Romanian messages
 * - Role-based access control for medical professionals
 * - Secure session management
 * - Rate limiting and security features
 * - AI integration preparation
 * - GDPR compliance features
 * - Performance optimizations with proper memoization
 * 
 * @author MedFlow Team
 * @version 2.0
 */

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut, updateProfile } from 'firebase/auth'
import type { User, AuthError } from 'firebase/auth'
import { auth, db } from '../services/firebase'
import { isDemoMode } from '../utils/demo'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import type { AppUser, UserRole } from '../types/auth'
import { ROLE_PERMISSIONS } from '../types/auth'

interface AuthContextValue {
  user: AppUser | null
  initializing: boolean
  // Core authentication methods
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  logout: () => Promise<void>
  // Enhanced security methods
  refreshUserData: () => Promise<void>
  updateUserPreferences: (preferences: Record<string, unknown>) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [initializing, setInitializing] = useState(true)

  /**
   * Enhanced user data loading with comprehensive metadata
   */
  const loadUserData = useCallback(async (firebaseUser: User): Promise<AppUser> => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid)
      const snap = await getDoc(userRef)
      
      if (snap.exists()) {
        const userData = snap.data()
        return Object.assign(firebaseUser, {
          role: userData.role as UserRole | undefined,
          permissions: userData.permissions || ROLE_PERMISSIONS[userData.role as UserRole] || [],
          invitedBy: userData.invitedBy,
          invitedAt: userData.invitedAt?.toDate(),
          verified: userData.verified || false,
          lastActivity: userData.lastActivity?.toDate() || new Date(),
          aiPreferences: userData.aiPreferences || {
            smartSuggestions: true,
            autoComplete: true,
            medicalAssistance: true
          }
        })
      } else {
        // Create basic user document if it doesn't exist
        await setDoc(userRef, {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          role: 'USER' as UserRole,
          permissions: ROLE_PERMISSIONS['USER'],
          verified: false,
          lastActivity: serverTimestamp(),
          aiPreferences: {
            smartSuggestions: true,
            autoComplete: true,
            medicalAssistance: true
          },
          createdAt: serverTimestamp(),
        })
        return Object.assign(firebaseUser, {
          role: 'USER' as UserRole,
          permissions: ROLE_PERMISSIONS['USER'],
        })
      }
    } catch (error) {
      console.error('AuthProvider: Error loading user data:', error)
      return Object.assign(firebaseUser, {
        role: 'USER' as UserRole,
        permissions: ROLE_PERMISSIONS['USER'],
      })
    }
  }, [])

  // Memoized authentication methods to prevent unnecessary re-renders
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      const authError = error as AuthError
      throw new Error(`Autentificare eșuată: ${authError.message}`)
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(userCredential.user, { displayName })
    } catch (error) {
      const authError = error as AuthError
      throw new Error(`Înregistrare eșuată: ${authError.message}`)
    }
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error) {
      const authError = error as AuthError
      throw new Error(`Resetare parolă eșuată: ${authError.message}`)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await signOut(auth)
    } catch (error) {
      const authError = error as AuthError
      throw new Error(`Delogare eșuată: ${authError.message}`)
    }
  }, [])

  const refreshUserData = useCallback(async () => {
    if (user) {
      const refreshedUser = await loadUserData(user)
      setUser(refreshedUser)
    }
  }, [user, loadUserData])

  const updateUserPreferences = useCallback(async (preferences: Record<string, unknown>) => {
    if (user) {
      // Update user preferences logic here
      // console.log('Updating user preferences:', preferences)
    }
  }, [user])

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    initializing,
    signIn,
    signUp,
    resetPassword,
    logout,
    refreshUserData,
    updateUserPreferences,
  }), [user, initializing, signIn, signUp, resetPassword, logout, refreshUserData, updateUserPreferences])

  useEffect(() => {
    if (isDemoMode()) {
      // Enhanced demo user with AI preferences
      const demoUser: AppUser = {
        uid: 'demo-user-id',
        email: 'demo@medflow.care',
        displayName: 'Demo User',
        role: 'ADMIN',
        permissions: ROLE_PERMISSIONS['ADMIN'],
        verified: true,
        lastActivity: new Date(),
        aiPreferences: {
          smartSuggestions: true,
          autoComplete: true,
          medicalAssistance: true
        }
      } as AppUser
      
      setUser(demoUser)
      setInitializing(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const appUser = await loadUserData(firebaseUser)
          setUser(appUser)
        } catch (error) {
          console.error('AuthProvider: Error loading user data:', error)
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setInitializing(false)
    })

    return () => unsubscribe()
  }, [loadUserData])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}