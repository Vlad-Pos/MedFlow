import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Landing from './pages/Landing'
import SignIn from './auth/SignIn'
import SignUp from './auth/SignUp'
import ResetPassword from './auth/ResetPassword'
import Dashboard from './pages/Dashboard'
import Appointments from './pages/Appointments'
import Profile from './pages/Profile'
import ChatbotPlaceholder from './components/ChatbotPlaceholder'
import ProtectedRoute from './auth/ProtectedRoute'
import AIAssistant from './pages/AIAssistant'
import Intro from './components/Intro'
import SkipLink from './components/SkipLink'
import Analytics from './pages/Analytics'

function App() {
  return (
    <div className="min-h-screen bg-[var(--medflow-bg)] text-gray-100">
      <SkipLink />
      <Intro />
      <Navbar />
      <div className="nav-spacer" />
      <div className="mx-auto flex max-w-7xl">
        <Sidebar />
        <main id="main-content" className="relative flex-1 px-4 py-6">
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
              <Route path="/ai" element={<AIAssistant />} />
              <Route path="/analytics" element={<Analytics />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
