import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug, Activity } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showDetails?: boolean
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string | null
}

export class ErrorBoundary extends Component<Props, State> {
  private static errorCounter = 0
  private retryKey = 0
  
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      errorId: ErrorBoundary.generateErrorId()
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

  componentDidUpdate(prevProps: Props) {
    // If children changed and we're in an error state, try to recover
    if (this.state.hasError && prevProps.children !== this.props.children) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null
      })
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
        url: window.location.href
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

  private handleRetry = () => {
    this.retryKey++
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    })
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
      url: window.location.href
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
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 border border-red-200">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Something went wrong
              </h1>
              <p className="text-gray-600 text-lg">
                We've encountered an unexpected error. Our team has been notified.
              </p>
              {this.state.errorId && (
                <p className="text-sm text-gray-500 mt-2">
                  Error ID: <code className="bg-gray-100 px-2 py-1 rounded">{this.state.errorId}</code>
                </p>
              )}
            </div>

            <div className="space-y-4 mb-8">
              <button
                onClick={this.handleRetry}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Try Again</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Home className="w-5 h-5" />
                <span>Go to Home</span>
              </button>

              <button
                onClick={this.handleReportBug}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Bug className="w-5 h-5" />
                <span>Report Bug</span>
              </button>
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
      <div key={this.retryKey}>
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

export default ErrorBoundary
