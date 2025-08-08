import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut, updateProfile } from 'firebase/auth'
import type { User, AuthError } from 'firebase/auth'
import { auth, db } from '../services/firebase'
import { isDemoMode } from '../utils/demo'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'

export type AppUser = (User & { role?: 'doctor' | 'nurse' }) | null

interface AuthContextValue {
  user: AppUser
  initializing: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName: string, role: 'doctor' | 'nurse') => Promise<void>
  resetPassword: (email: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser>(null)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    if (isDemoMode()) {
      // Provide a fake user immediately in demo mode
      const demoUser = {
        uid: 'demo-uid-123',
        email: 'demo@medflow.local',
        displayName: 'Demo Doctor',
        role: 'doctor' as const,
        // Add required Firebase User properties
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

    console.log('AuthProvider: Setting up auth state listener')
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        console.log('AuthProvider: Auth state changed', firebaseUser?.email || 'No user')
        
        if (!firebaseUser) {
          setUser(null)
          setInitializing(false)
          return
        }
        
        // Load role from Firestore with error handling
        try {
          const userRef = doc(db, 'users', firebaseUser.uid)
          const snap = await getDoc(userRef)
          const role = snap.exists() ? (snap.data().role as 'doctor' | 'nurse' | undefined) : undefined
          console.log('AuthProvider: User role loaded:', role)
          setUser(Object.assign(firebaseUser, { role }))
        } catch (error) {
          console.error('AuthProvider: Error loading user role:', error)
          // Set user without role if Firestore fails
          setUser(firebaseUser)
        }
      } catch (error) {
        console.error('AuthProvider: Auth state change error:', error)
        setUser(null)
      } finally {
        setInitializing(false)
      }
    })
    return () => unsub()
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    initializing,
    async signIn(email, password) {
      console.log('AuthProvider: Attempting sign in for:', email)
      try {
        await signInWithEmailAndPassword(auth, email, password)
        console.log('AuthProvider: Sign in successful')
      } catch (error) {
        const authError = error as AuthError
        console.error('AuthProvider: Sign in error:', authError.code, authError.message)
        let message = 'Autentificare eșuată.'
        
        switch (authError.code) {
          case 'auth/user-not-found':
            message = 'Utilizatorul nu a fost găsit.'
            break
          case 'auth/wrong-password':
            message = 'Parolă incorectă.'
            break
          case 'auth/invalid-email':
            message = 'Email invalid.'
            break
          case 'auth/too-many-requests':
            message = 'Prea multe încercări. Încercați din nou mai târziu.'
            break
          case 'auth/user-disabled':
            message = 'Contul a fost dezactivat.'
            break
        }
        throw new Error(message)
      }
    },
    async signUp(email, password, displayName, role) {
      console.log('AuthProvider: Attempting sign up for:', email, 'role:', role)
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password)
        if (cred.user) {
          await updateProfile(cred.user, { displayName })
          const userRef = doc(db, 'users', cred.user.uid)
          await setDoc(userRef, {
            uid: cred.user.uid,
            email,
            displayName,
            role,
            createdAt: serverTimestamp(),
          })
          console.log('AuthProvider: Sign up successful')
        }
      } catch (error) {
        const authError = error as AuthError
        console.error('AuthProvider: Sign up error:', authError.code, authError.message)
        let message = 'Crearea contului a eșuat.'
        
        switch (authError.code) {
          case 'auth/email-already-in-use':
            message = 'Email-ul este deja în uz.'
            break
          case 'auth/invalid-email':
            message = 'Email invalid.'
            break
          case 'auth/weak-password':
            message = 'Parola este prea slabă. Folosiți cel puțin 6 caractere.'
            break
          case 'auth/operation-not-allowed':
            message = 'Crearea contului nu este permisă.'
            break
        }
        throw new Error(message)
      }
    },
    async resetPassword(email) {
      console.log('AuthProvider: Attempting password reset for:', email)
      try {
        await sendPasswordResetEmail(auth, email)
        console.log('AuthProvider: Password reset email sent')
      } catch (error) {
        const authError = error as AuthError
        console.error('AuthProvider: Password reset error:', authError.code, authError.message)
        let message = 'Nu s-a putut trimite emailul de resetare.'
        
        switch (authError.code) {
          case 'auth/user-not-found':
            message = 'Nu există niciun cont cu acest email.'
            break
          case 'auth/invalid-email':
            message = 'Email invalid.'
            break
        }
        throw new Error(message)
      }
    },
    async logout() {
      console.log('AuthProvider: Attempting logout')
      try {
        await signOut(auth)
        console.log('AuthProvider: Logout successful')
      } catch (error) {
        console.error('AuthProvider: Logout error:', error)
        throw new Error('Eroare la deconectare.')
      }
    },
  }), [user, initializing])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}