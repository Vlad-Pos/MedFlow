/**
 * 🏥 MedFlow - Main Entry Point
 * 
 * 💡 AI Agent Guidance:
 * Before modifying this entry point, please review:
 * - MedFlow/BRAND_IDENTITY.md (brand guidelines and colors)
 * - MedFlow/DEVELOPMENT_GUIDE.md (technical standards)
 * - MedFlow/FEATURES_DOCUMENTATION.md (feature implementation)
 * 
 * This ensures your work aligns with MedFlow's professional medical standards.
 * No enforcement - just helpful guidance for quality work! 🚀
 */

import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
// Remove heavy calendar CSS from main bundle - load dynamically
import App from './App'
import { AuthProvider } from './providers/AuthProvider'

// Performance optimization: Preload critical resources
const preloadCriticalResources = () => {
  // Preload critical fonts and assets
  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = '/src/assets/medflow-logo.svg'
  link.as = 'image'
  document.head.appendChild(link)
}

// Initialize performance optimizations
preloadCriticalResources()

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
