import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../providers/AuthProvider'
import LoadingSpinner from '../components/LoadingSpinner'

export default function PrivateRoute() {
  const { user, initializing } = useAuth()
  const location = useLocation()

  if (initializing) return <div className="flex h-64 items-center justify-center"><LoadingSpinner label="Se încarcă..." /></div>
  if (!user) return <Navigate to="/signin" state={{ from: location }} replace />
  return <Outlet />
}