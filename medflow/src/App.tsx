import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { lazy, Suspense } from 'react'
import Intro from './components/Intro'
import LoadingSpinner from './components/LoadingSpinner'

const Landing = lazy(() => import('./pages/Landing'))
const SignIn = lazy(() => import('./auth/SignIn'))
const SignUp = lazy(() => import('./auth/SignUp'))
const ResetPassword = lazy(() => import('./auth/ResetPassword'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Appointments = lazy(() => import('./pages/Appointments'))
const Analytics = lazy(() => import('./pages/Analytics'))
const Profile = lazy(() => import('./pages/Profile'))
const ChatbotPlaceholder = lazy(() => import('./components/ChatbotPlaceholder'))
const ProtectedRoute = lazy(() => import('./auth/ProtectedRoute'))

function App() {
  return (
    <div className="min-h-screen bg-[var(--medflow-bg)] text-gray-100">
      <a href="#content" className="fixed left-2 top-2 z-[10000] -translate-y-20 rounded-2xl bg-white/90 px-3 py-2 text-sm text-gray-900 shadow transition-transform focus:translate-y-0">Sari la conținut</a>
      <Intro />
      <Navbar />
      <div className="nav-spacer" />
      <div className="mx-auto flex max-w-7xl">
        <Sidebar />
        <main id="content" className="relative flex-1 px-4 py-6">
          <Suspense fallback={<div className="py-12"><LoadingSpinner label="Se încarcă..." /></div>}>
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
                <Route path="/analytics" element={<Analytics />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  )
}

export default App
