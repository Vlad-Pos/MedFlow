import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import SignIn from './auth/SignIn'
import SignUp from './auth/SignUp'
import ResetPassword from './auth/ResetPassword'
import Dashboard from './pages/Dashboard'
import Appointments from './pages/Appointments'
import Profile from './pages/Profile'
import ChatbotPlaceholder from './components/ChatbotPlaceholder'
import ProtectedRoute from './auth/ProtectedRoute'

function App() {
  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/reset" element={<ResetPassword />} />

          <Route element={<ProtectedRoute />}> 
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/chatbot" element={<ChatbotPlaceholder />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
