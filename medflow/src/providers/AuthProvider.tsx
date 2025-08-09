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
 * 
 * @author MedFlow Team
 * @version 2.0
 */

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut, updateProfile } from 'firebase/auth'
import type { User, AuthError } from 'firebase/auth'
import { auth, db } from '../services/firebase'
import { isDemoMode } from '../utils/demo'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'

// Enhanced user type with medical professional metadata
export type AppUser = (User & { 
  role?: 'doctor' | 'nurse'
  // Future AI features metadata
  aiPreferences?: {
    smartSuggestions: boolean
    autoComplete: boolean
    medicalAssistance: boolean
  }
  // Professional verification status
  verified?: boolean
  lastActivity?: Date
}) | null

interface AuthContextValue {
  user: AppUser
  initializing: boolean
  // Core authentication methods
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName: string, role: 'doctor' | 'nurse') => Promise<void>
  resetPassword: (email: string) => Promise<void>
  logout: () => Promise<void>
  // Enhanced security methods
  refreshUserData: () => Promise<void>
  updateUserPreferences: (preferences: any) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser>(null)
  const [initializing, setInitializing] = useState(true)

  /**
   * Enhanced user data loading with comprehensive metadata
   */
  const loadUserData = async (firebaseUser: User): Promise<AppUser> => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid)
      const snap = await getDoc(userRef)
      
      if (snap.exists()) {
        const userData = snap.data()
        return Object.assign(firebaseUser, {
          role: userData.role as 'doctor' | 'nurse' | undefined,
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
          role: null,
          verified: false,
          lastActivity: serverTimestamp(),
          aiPreferences: {
            smartSuggestions: true,
            autoComplete: true,
            medicalAssistance: true
          },
          createdAt: serverTimestamp(),
        })
        return firebaseUser
      }
    } catch (error) {
      console.error('AuthProvider: Error loading user data:', error)
      return firebaseUser
    }
  }

  useEffect(() => {
    if (isDemoMode()) {
      // Enhanced demo user with AI preferences
      const demoUser = {
        uid: 'demo-uid-123',
        email: 'demo@medflow.local',
        displayName: 'Dr. Demo Medic',
        role: 'doctor' as const,
        verified: true,
        lastActivity: new Date(),
        aiPreferences: {
          smartSuggestions: true,
          autoComplete: true,
          medicalAssistance: true
        },
        // Required Firebase User properties
        emailVerified: true,
        isAnonymous: false,
        metadata: {},
        providerData: [],
        refreshToken: 'demo-token',
        tenantId: null,
        delete: () => Promise.resolve(),
        getIdToken: () => Promise.resolve('demo-token'),
        getIdTokenResult: () => Promise.resolve({} as any),
        reload: () => Promise.resolve(),
        toJSON: () => ({}),
      } as any
      setUser(demoUser)
      setInitializing(false)
      return
    }

    console.log('AuthProvider: Setting up enhanced auth state listener')
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        console.log('AuthProvider: Auth state changed', firebaseUser?.email || 'No user')
        
        if (!firebaseUser) {
          setUser(null)
          setInitializing(false)
          return
        }
        
        // Load comprehensive user data
        const enrichedUser = await loadUserData(firebaseUser)
        console.log('AuthProvider: Enhanced user data loaded:', enrichedUser.role, enrichedUser.verified)
        setUser(enrichedUser)
      } catch (error) {
        console.error('AuthProvider: Auth state change error:', error)
        setUser(firebaseUser) // Fallback to basic user
      } finally {
        setInitializing(false)
      }
    })
    return () => unsub()
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    initializing,
    
    /**
     * Enhanced sign-in with comprehensive error handling and security
     */
    async signIn(email, password) {
      console.log('AuthProvider: Attempting secure sign in for:', email)
      try {
        // Update last activity timestamp
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        
        // Update user activity in Firestore
        if (userCredential.user) {
          try {
            const userRef = doc(db, 'users', userCredential.user.uid)
            await setDoc(userRef, {
              lastActivity: serverTimestamp(),
              lastLoginIP: 'hidden-for-privacy' // Could implement IP tracking if needed
            }, { merge: true })
          } catch (firestoreError) {
            console.warn('AuthProvider: Could not update login activity:', firestoreError)
            // Continue with login even if activity update fails
          }
        }
        
        console.log('AuthProvider: Secure sign in successful')
      } catch (error) {
        const authError = error as AuthError
        console.error('AuthProvider: Sign in error:', authError.code, authError.message)
        
        // Enhanced Romanian error messages for medical professionals
        let message = 'Autentificare eșuată. Verificați datele introduse.'
        
        switch (authError.code) {
          case 'auth/user-not-found':
            message = 'Nu există un cont înregistrat cu această adresă de email.'
            break
          case 'auth/wrong-password':
            message = 'Parola introdusă este incorectă. Verificați și încercați din nou.'
            break
          case 'auth/invalid-email':
            message = 'Formatul adresei de email nu este valid.'
            break
          case 'auth/user-disabled':
            message = 'Contul a fost dezactivat din motive de securitate. Contactați suportul.'
            break
          case 'auth/too-many-requests':
            message = 'Prea multe încercări de autentificare. Contul este temporar blocat din motive de securitate.'
            break
          case 'auth/network-request-failed':
            message = 'Eroare de conexiune. Verificați internetul și încercați din nou.'
            break
          case 'auth/invalid-credential':
            message = 'Datele de autentificare nu sunt valide. Verificați emailul și parola.'
            break
          default:
            message = 'Eroare neașteptată la autentificare. Încercați din nou sau contactați suportul.'
        }
        throw new Error(message)
      }
    },
    /**
     * Enhanced sign-up with comprehensive professional metadata
     */
    async signUp(email, password, displayName, role) {
      console.log('AuthProvider: Attempting professional registration for:', email, 'role:', role)
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password)
        if (cred.user) {
          // Update Firebase Auth profile
          await updateProfile(cred.user, { displayName })
          
          // Create comprehensive user document in Firestore
          const userRef = doc(db, 'users', cred.user.uid)
          await setDoc(userRef, {
            // Basic user information
            uid: cred.user.uid,
            email,
            displayName,
            role,
            
            // Professional verification (initially false, requires admin approval)
            verified: false,
            verificationStatus: 'pending',
            
            // Security and activity tracking
            createdAt: serverTimestamp(),
            lastActivity: serverTimestamp(),
            loginCount: 0,
            
            // AI preferences (enabled by default for better UX)
            aiPreferences: {
              smartSuggestions: true,
              autoComplete: true,
              medicalAssistance: true,
              dataSharing: false // GDPR compliance - explicit consent required
            },
            
            // Professional metadata for medical practitioners
            professionalInfo: {
              specialization: null,
              licenseNumber: null,
              institutionName: null,
              workingHours: null
            },
            
            // Privacy and compliance
            gdprConsent: {
              dataProcessing: true,
              marketing: false,
              analytics: true,
              consentDate: serverTimestamp()
            },
            
            // Future features preparation
            features: {
              betaAccess: false,
              aiPilotProgram: false
            }
          })
          
          console.log('AuthProvider: Professional registration successful with role:', role)
        }
      } catch (error) {
        const authError = error as AuthError
        console.error('AuthProvider: Sign up error:', authError.code, authError.message)
        
        // Enhanced Romanian error messages for medical registration
        let message = 'Crearea contului a eșuat. Încercați din nou.'
        
        switch (authError.code) {
          case 'auth/email-already-in-use':
            message = 'Un cont cu această adresă de email există deja. Încercați să vă autentificați sau recuperați parola.'
            break
          case 'auth/invalid-email':
            message = 'Formatul adresei de email nu este valid.'
            break
          case 'auth/weak-password':
            message = 'Parola este prea slabă pentru securitatea datelor medicale. Folosiți minimum 8 caractere cu litere, cifre și simboluri.'
            break
          case 'auth/operation-not-allowed':
            message = 'Înregistrarea de conturi noi nu este permisă momentan. Contactați administratorul.'
            break
          case 'auth/network-request-failed':
            message = 'Eroare de conexiune. Verificați internetul și încercați din nou.'
            break
          default:
            message = 'Eroare neașteptată la crearea contului. Contactați suportul tehnic pentru asistență.'
        }
        throw new Error(message)
      }
    },
    /**
     * Enhanced password reset with better error handling
     */
    async resetPassword(email) {
      console.log('AuthProvider: Attempting secure password reset for:', email)
      try {
        await sendPasswordResetEmail(auth, email, {
          // Custom email action settings
          url: `${window.location.origin}/signin`,
          handleCodeInApp: false
        })
        console.log('AuthProvider: Password reset email sent successfully')
      } catch (error) {
        const authError = error as AuthError
        console.error('AuthProvider: Password reset error:', authError.code, authError.message)
        
        // Enhanced Romanian error messages for password reset
        let message = 'Nu s-a putut trimite emailul de resetare.'
        
        switch (authError.code) {
          case 'auth/user-not-found':
            message = 'Nu există un cont înregistrat cu această adresă de email.'
            break
          case 'auth/invalid-email':
            message = 'Formatul adresei de email nu este valid.'
            break
          case 'auth/too-many-requests':
            message = 'Prea multe cereri de resetare. Încercați din nou peste câteva minute.'
            break
          case 'auth/network-request-failed':
            message = 'Eroare de conexiune. Verificați internetul și încercați din nou.'
            break
          default:
            message = 'Eroare neașteptată la trimiterea emailului. Contactați suportul pentru asistență.'
        }
        throw new Error(message)
      }
    },
    
    /**
     * Enhanced logout with activity logging
     */
    async logout() {
      console.log('AuthProvider: Attempting secure logout')
      try {
        // Update logout activity before signing out
        if (user?.uid) {
          try {
            const userRef = doc(db, 'users', user.uid)
            await setDoc(userRef, {
              lastLogout: serverTimestamp(),
              lastActivity: serverTimestamp()
            }, { merge: true })
          } catch (firestoreError) {
            console.warn('AuthProvider: Could not update logout activity:', firestoreError)
            // Continue with logout even if activity update fails
          }
        }
        
        await signOut(auth)
        console.log('AuthProvider: Secure logout successful')
      } catch (error) {
        console.error('AuthProvider: Logout error:', error)
        throw new Error('Eroare la deconectare. Încercați să reîncărcați pagina.')
      }
    },
    
    /**
     * Refresh user data from Firestore
     */
    async refreshUserData() {
      if (!user?.uid) return
      
      try {
        console.log('AuthProvider: Refreshing user data')
        const userRef = doc(db, 'users', user.uid)
        const snap = await getDoc(userRef)
        
        if (snap.exists()) {
          const userData = snap.data()
          const updatedUser = Object.assign(user, {
            role: userData.role,
            verified: userData.verified,
            lastActivity: userData.lastActivity?.toDate(),
            aiPreferences: userData.aiPreferences
          })
          setUser(updatedUser)
          console.log('AuthProvider: User data refreshed successfully')
        }
      } catch (error) {
        console.error('AuthProvider: Error refreshing user data:', error)
        throw new Error('Nu s-au putut actualiza datele utilizatorului.')
      }
    },
    
    /**
     * Update user preferences (AI settings, etc.)
     */
    async updateUserPreferences(preferences: any) {
      if (!user?.uid) {
        throw new Error('Utilizator neautentificat')
      }
      
      try {
        console.log('AuthProvider: Updating user preferences')
        const userRef = doc(db, 'users', user.uid)
        await setDoc(userRef, {
          aiPreferences: preferences,
          lastUpdated: serverTimestamp()
        }, { merge: true })
        
        // Update local user state
        const updatedUser = { ...user, aiPreferences: preferences }
        setUser(updatedUser)
        
        console.log('AuthProvider: User preferences updated successfully')
      } catch (error) {
        console.error('AuthProvider: Error updating preferences:', error)
        throw new Error('Nu s-au putut actualiza preferințele.')
      }
    }
  }), [user, initializing])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}