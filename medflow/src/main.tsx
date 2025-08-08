import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import App from './App'
import { AuthProvider } from './providers/AuthProvider'
import { ToastProvider } from './components/ToastProvider'
import ErrorBoundary from './components/ErrorBoundary'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <AuthProvider>
            <ToastProvider>
              <App />
              <Toaster position="top-right" />
            </ToastProvider>
          </AuthProvider>
        </ErrorBoundary>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)
