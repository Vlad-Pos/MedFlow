import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../providers/AuthProvider'
import LoadingSpinner from '../components/LoadingSpinner'
import { isDemoMode } from '../utils/demo'

export default function PrivateRoute() {
  const { user, initializing } = useAuth()
  const location = useLocation()

  // Show loading spinner while checking authentication state
  if (initializing) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner text="Se încarcă..." />
      </div>
    )
  }

  // Redirect to signin if not authenticated (unless demo mode)
  if (!user && !isDemoMode()) {
    return <Navigate to="/signin" state={{ from: location }} replace />
  }

  // Render protected content
  return <Outlet />
}