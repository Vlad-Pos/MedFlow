import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut, updateProfile } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { auth, db } from '../services/firebase'
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
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null)
        setInitializing(false)
        return
      }
      // Load role from Firestore
      const userRef = doc(db, 'users', firebaseUser.uid)
      const snap = await getDoc(userRef)
      const role = snap.exists() ? (snap.data().role as 'doctor' | 'nurse' | undefined) : undefined
      setUser(Object.assign(firebaseUser, { role }))
      setInitializing(false)
    })
    return () => unsub()
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    initializing,
    async signIn(email, password) {
      await signInWithEmailAndPassword(auth, email, password)
    },
    async signUp(email, password, displayName, role) {
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
      }
    },
    async resetPassword(email) {
      await sendPasswordResetEmail(auth, email)
    },
    async logout() {
      await signOut(auth)
    },
  }), [user, initializing])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}