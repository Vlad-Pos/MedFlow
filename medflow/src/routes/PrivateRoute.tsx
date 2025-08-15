import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../providers/AuthProvider'
import LoadingSpinner from '../components/LoadingSpinner'
import { MedFlowLoader, SimpleLoader } from '../components/ui'
import { isDemoMode } from '../utils/demo'

export default function PrivateRoute() {
  const { user, initializing } = useAuth()
  const location = useLocation()

  // Show loading spinner while checking authentication state
  if (initializing) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="loader mb-4"></div>
          <p className="text-6xl font-bold text-[#6F6280]">
            medflow
          </p>
        </div>
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