/**
 * 🏥 MedFlow - Main Application Component
 * 
 * 💡 AI Agent Guidance:
 * Before working on this component, please review:
 * - MedFlow/BRAND_IDENTITY.md (brand guidelines and colors)
 * - MedFlow/DEVELOPMENT_GUIDE.md (technical standards)
 * - MedFlow/FEATURES_DOCUMENTATION.md (feature implementation)
 * 
 * This ensures your work aligns with MedFlow's professional medical standards.
 * No enforcement - just helpful guidance for quality work! 🚀
 */

import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useResponsive } from './hooks'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { DesignGuidanceProvider } from './components/DesignGuidance'
import { NotificationProvider } from './contexts/NotificationContext'
import { KeyboardNavigation } from './components/Accessibility'
import { AppRouteWrapper } from './components/layout'
import routes, { routeComponents } from './routes/routeConfig'
import PrivateRoute from './routes/PrivateRoute'
import ErrorBoundary from './components/ErrorBoundary'

// Conditional imports for development-only features
const FramerWelcomeBanner = process.env.NODE_ENV === 'development' 
  ? React.lazy(() => import('./components/FramerIntegration/FramerWelcomeBanner').then(module => ({ default: module.FramerWelcomeBanner })))
  : null
const FramerAnalytics = process.env.NODE_ENV === 'development'
  ? React.lazy(() => import('./components/FramerIntegration/FramerAnalytics').then(module => ({ default: module.FramerAnalytics })))
  : null

function App() {
  // Responsive state available for future use
  useResponsive()
  useKeyboardShortcuts()

  return (
    <ErrorBoundary>
      <DesignGuidanceProvider>
        <NotificationProvider>
          <KeyboardNavigation>
                  {/* Framer Welcome Banner - shows when users come from website */}
        {/* Temporarily disabled to fix cross-origin issues */}
        {/* <FramerWelcomeBanner /> */}
        
        {/* Framer Analytics - shows integration data and user context */}
        {/* Temporarily disabled to fix cross-origin issues */}
        {/* <FramerAnalytics /> */}
            
            <Routes>
              {/* Public routes */}
              {routes.filter(route => !route.isPrivate).map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    <AppRouteWrapper
                      component={routeComponents[route.component]}
                      background={route.background}
                      showNavbar={route.showNavbar}
                      showPageTransition={route.showPageTransition}
                      containerClass={route.containerClass}
                    />
                  }
                />
              ))}

              {/* Private routes */}
              <Route element={<PrivateRoute />}>
                {routes.filter(route => route.isPrivate).map((route) => (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={
                      <AppRouteWrapper
                        component={routeComponents[route.component]}
                        background={route.background}
                        showNavbar={route.showNavbar}
                        showPageTransition={route.showPageTransition}
                        containerClass={route.containerClass}
                      />
                    }
                  />
                ))}
              </Route>

              {/* Catch-all route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </KeyboardNavigation>
        </NotificationProvider>
      </DesignGuidanceProvider>
    </ErrorBoundary>
  )
}

export default App
