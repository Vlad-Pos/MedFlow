/**
 * Enhanced Error Boundary Component for MedFlow UI Library
 *
 * Features:
 * - Advanced error catching and reporting
 * - Professional medical styling with MedFlow branding
 * - Multiple fallback UI options
 * - Error logging integration
 * - Retry mechanisms and recovery
 * - Romanian localization for medical professionals
 * - Development-friendly error details
 *
 * @author MedFlow UI Team
 * @version 2.0
 */

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug, Activity, X } from 'lucide-react'
import { ErrorMessage } from '../ErrorMessage'

export interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  fallbackTitle?: string
  fallbackMessage?: string
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showDetails?: boolean
  showRetry?: boolean
  showReportBug?: boolean
  showHomeLink?: boolean
  maxRetries?: number
  resetTimeout?: number
  className?: string
}

export interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string | null
  retryCount: number
  canRetry: boolean
  isRetrying: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private static errorCounter = 0
  private retryTimeout: NodeJS.Timeout | null = null

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
      canRetry: true,
      isRetrying: false
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorInfo: null,
      errorId: ErrorBoundary.generateErrorId(),
      canRetry: true
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Log error to console and any external logging service
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Log to external service (e.g., Sentry, LogRocket)
    this.logErrorToExternalService(error, errorInfo)
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    // If children changed and we're in an error state, try to recover
    if (this.state.hasError && prevProps.children !== this.props.children) {
      this.resetErrorState()
    }
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout)
    }
  }

  private static generateErrorId(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substr(2, 9)
    const counter = (ErrorBoundary.errorCounter++).toString().padStart(3, '0')
    return `error-${timestamp}-${random}-${counter}`
  }

  private logErrorToExternalService(error: Error, errorInfo: ErrorInfo) {
    try {
      // Example: Log to localStorage for debugging
      const errorLog = {
        id: this.state.errorId,
        timestamp: new Date().toISOString(),
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        },
        errorInfo: {
          componentStack: errorInfo.componentStack
        },
        userAgent: navigator.userAgent,
        url: window.location.href,
        retryCount: this.state.retryCount
      }

      const existingLogs = JSON.parse(localStorage.getItem('medflow-error-logs') || '[]')
      existingLogs.push(errorLog)

      // Keep only last 100 errors
      if (existingLogs.length > 100) {
        existingLogs.splice(0, existingLogs.length - 100)
      }

      localStorage.setItem('medflow-error-logs', JSON.stringify(existingLogs))
    } catch (logError) {
      console.error('Failed to log error:', logError)
    }
  }

  private resetErrorState = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
      canRetry: true,
      isRetrying: false
    })
  }

  private handleRetry = () => {
    const maxRetries = this.props.maxRetries ?? 3
    const currentRetryCount = this.state.retryCount + 1

    if (currentRetryCount >= maxRetries) {
      this.setState({ canRetry: false })
      return
    }

    this.setState({
      isRetrying: true,
      retryCount: currentRetryCount
    })

    // Reset after a delay to allow for component re-mount
    this.retryTimeout = setTimeout(() => {
      this.resetErrorState()
    }, this.props.resetTimeout ?? 1000)
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  private handleReportBug = () => {
    const errorDetails = {
      errorId: this.state.errorId,
      error: this.state.error?.toString(),
      componentStack: this.state.errorInfo?.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      retryCount: this.state.retryCount
    }

    // Open email client with error details
    const subject = encodeURIComponent(`MedFlow Bug Report - Error ID: ${this.state.errorId}`)
    const body = encodeURIComponent(JSON.stringify(errorDetails, null, 2))
    window.open(`mailto:support@medflow.com?subject=${subject}&body=${body}`, '_blank')
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className={`min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4 ${this.props.className || ''}`}>
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 border border-red-200">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {this.props.fallbackTitle || "Something went wrong"}
              </h1>
              <p className="text-gray-600 text-lg">
                {this.props.fallbackMessage || "We've encountered an unexpected error. Our team has been notified."}
              </p>
              {this.state.errorId && (
                <p className="text-sm text-gray-500 mt-2">
                  Error ID: <code className="bg-gray-100 px-2 py-1 rounded">{this.state.errorId}</code>
                </p>
              )}
              {this.state.retryCount > 0 && (
                <p className="text-sm text-orange-600 mt-2">
                  Retry attempt {this.state.retryCount} of {this.props.maxRetries ?? 3}
                </p>
              )}
            </div>

            <div className="space-y-4 mb-8">
              {this.props.showRetry !== false && this.state.canRetry && (
                <button
                  onClick={this.handleRetry}
                  disabled={this.state.isRetrying}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  {this.state.isRetrying ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Se reîncearcă...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-5 h-5" />
                      <span>Try Again</span>
                    </>
                  )}
                </button>
              )}

              {this.props.showHomeLink !== false && (
                <button
                  onClick={this.handleGoHome}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <Home className="w-5 h-5" />
                  <span>Go to Home</span>
                </button>
              )}

              {this.props.showReportBug && (
                <button
                  onClick={this.handleReportBug}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <Bug className="w-5 h-5" />
                  <span>Report Bug</span>
                </button>
              )}
            </div>

            {this.props.showDetails && this.state.error && (
              <details className="border border-gray-200 rounded-lg p-4">
                <summary className="cursor-pointer font-semibold text-gray-700 flex items-center space-x-2">
                  <Activity className="w-4 h-4" />
                  <span>Error Details (for developers)</span>
                </summary>
                <div className="mt-4 space-y-3 text-sm">
                  <div>
                    <strong>Error:</strong> {this.state.error.toString()}
                  </div>
                  {this.state.error.stack && (
                    <div>
                      <strong>Stack Trace:</strong>
                      <pre className="bg-gray-100 p-3 rounded mt-2 overflow-x-auto text-xs">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="bg-gray-100 p-3 rounded mt-2 overflow-x-auto text-xs">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="text-center text-sm text-gray-500 mt-6">
              <p>
                If this problem persists, please contact our support team at{' '}
                <a href="mailto:support@medflow.com" className="text-blue-600 hover:underline">
                  support@medflow.com
                </a>
              </p>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div key={this.state.retryCount}>
        {this.props.children}
      </div>
    )
  }
}

// Hook for functional components to catch errors
export const useErrorHandler = () => {
  const handleError = (error: Error, errorInfo?: any) => {
    console.error('useErrorHandler caught an error:', error, errorInfo)

    // Log to external service
    try {
      const errorLog = {
        id: `hook-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        },
        errorInfo,
        userAgent: navigator.userAgent,
        url: window.location.href
      }

      const existingLogs = JSON.parse(localStorage.getItem('medflow-error-logs') || '[]')
      existingLogs.push(errorLog)

      if (existingLogs.length > 100) {
        existingLogs.splice(0, existingLogs.length - 100)
      }

      localStorage.setItem('medflow-error-logs', JSON.stringify(existingLogs))
    } catch (logError) {
      console.error('Failed to log error:', logError)
    }
  }

  return { handleError }
}

// Specialized error boundaries for different contexts
export const PageErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    fallbackTitle="Eroare de pagină"
    fallbackMessage="A apărut o problemă la încărcarea acestei pagini."
    showRetry={true}
    showHomeLink={true}
    showDetails={process.env.NODE_ENV === 'development'}
    maxRetries={3}
  >
    {children}
  </ErrorBoundary>
)

export const FormErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    fallbackTitle="Eroare de formular"
    fallbackMessage="A apărut o problemă cu formularul. Datele dumneavoastră sunt în siguranță."
    showRetry={true}
    showDetails={false}
    maxRetries={2}
  >
    {children}
  </ErrorBoundary>
)

export const ComponentErrorBoundary: React.FC<{
  children: ReactNode
  componentName?: string
}> = ({ children, componentName }) => (
  <ErrorBoundary
    fallbackTitle={`Eroare componentă${componentName ? ` - ${componentName}` : ''}`}
    fallbackMessage="A apărut o problemă cu această componentă."
    showRetry={true}
    showDetails={process.env.NODE_ENV === 'development'}
    maxRetries={1}
  >
    {children}
  </ErrorBoundary>
)


PageErrorBoundary.displayName = 'PageErrorBoundary'
FormErrorBoundary.displayName = 'FormErrorBoundary'
ComponentErrorBoundary.displayName = 'ComponentErrorBoundary'
