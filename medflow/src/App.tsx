import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Navbar from './components/Navbar'
import { RouteLoadingSpinner } from './components/LoadingSpinner'
import PrivateRoute from './routes/PrivateRoute'
import { NotificationContainer } from './components/Notification'
import PageTransition from './components/PageTransition'
import { SkipToMainContent, KeyboardNavigation } from './components/Accessibility'
import { useResponsive } from './utils/useResponsive'

// Lazy load all route components
const Landing = lazy(() => import('./pages/Landing'))
const SignIn = lazy(() => import('./pages/auth/SignIn'))
const SignUp = lazy(() => import('./pages/auth/SignUp'))
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Appointments = lazy(() => import('./pages/Appointments'))
const Analytics = lazy(() => import('./pages/Analytics'))
const Profile = lazy(() => import('./pages/Profile'))
const ChatbotPlaceholder = lazy(() => import('./components/ChatbotPlaceholder'))

function App() {
  // Responsive state available for future use
  useResponsive()

  return (
    <KeyboardNavigation>
      <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <SkipToMainContent />
        <Navbar />
        <NotificationContainer />
        
        {/* Landing page gets full viewport */}
        <Routes>
          <Route path="/" element={
            <Suspense fallback={<RouteLoadingSpinner />}>
              <main id="main-content" className="w-full">
                <Landing />
              </main>
            </Suspense>
          } />
          
          {/* Other pages get constrained container */}
          <Route path="/signin" element={
            <main id="main-content" className="container-responsive py-6">
              <Suspense fallback={<RouteLoadingSpinner />}>
                <PageTransition>
                  <SignIn />
                </PageTransition>
              </Suspense>
            </main>
          } />
          <Route path="/signup" element={
            <main id="main-content" className="container-responsive py-6">
              <Suspense fallback={<RouteLoadingSpinner />}>
                <PageTransition>
                  <SignUp />
                </PageTransition>
              </Suspense>
            </main>
          } />
          <Route path="/reset" element={
            <main id="main-content" className="container-responsive py-6">
              <Suspense fallback={<RouteLoadingSpinner />}>
                <PageTransition>
                  <ResetPassword />
                </PageTransition>
              </Suspense>
            </main>
          } />

          <Route element={<PrivateRoute />}> 
            <Route path="/dashboard" element={
              <main id="main-content" className="container-responsive py-6">
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <PageTransition>
                    <Dashboard />
                  </PageTransition>
                </Suspense>
              </main>
            } />
            <Route path="/appointments" element={
              <main id="main-content" className="container-responsive py-6">
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <PageTransition>
                    <Appointments />
                  </PageTransition>
                </Suspense>
              </main>
            } />
            <Route path="/analytics" element={
              <main id="main-content" className="container-responsive py-6">
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <PageTransition>
                    <Analytics />
                  </PageTransition>
                </Suspense>
              </main>
            } />
            <Route path="/profile" element={
              <main id="main-content" className="container-responsive py-6">
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <PageTransition>
                    <Profile />
                  </PageTransition>
                </Suspense>
              </main>
            } />
            <Route path="/chatbot" element={
              <main id="main-content" className="container-responsive py-6">
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <PageTransition>
                    <ChatbotPlaceholder />
                  </PageTransition>
                </Suspense>
              </main>
            } />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </KeyboardNavigation>
  )
}

export default App
