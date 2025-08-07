import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase/firebase'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

export default function ProtectedRoute() {
  const [ready, setReady] = useState(false)
  const [user, setUser] = useState(null)
  const location = useLocation()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setReady(true)
    })
    return () => unsub()
  }, [])

  if (!ready) return <div className="flex h-64 items-center justify-center text-sm text-gray-500">Se încarcă...</div>
  if (!user) return <Navigate to="/signin" replace state={{ from: location }} />
  return <Outlet />
}