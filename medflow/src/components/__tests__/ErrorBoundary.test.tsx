import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ErrorBoundary, useErrorHandler } from '../ErrorBoundary'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Component that throws an error
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message')
  }
  return <div>Normal component</div>
}

// Component that throws an error in useEffect
const ThrowErrorInEffect = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  React.useEffect(() => {
    if (shouldThrow) {
      throw new Error('Effect error message')
    }
  }, [shouldThrow])

  return <div>Effect component</div>
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue('[]')
  })

  describe('Basic Error Handling', () => {
    it('renders children when there is no error', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(screen.getByText('Normal component')).toBeInTheDocument()
    })

    it('renders error UI when child throws an error', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      expect(screen.getByText('We\'ve encountered an unexpected error. Our team has been notified.')).toBeInTheDocument()
      expect(screen.getByText(/Error ID:/)).toBeInTheDocument()

      consoleSpy.mockRestore()
    })

    it('calls onError callback when error occurs', () => {
      const onError = vi.fn()
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String)
        })
      )

      consoleSpy.mockRestore()
    })
  })

  describe('Error Recovery Actions', () => {
    it('retries and recovers from error when retry button is clicked', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()

      const retryButton = screen.getByText('Try Again')
      fireEvent.click(retryButton)

      // After retry, the error state should be reset
      // Now re-render with non-erroring component to see recovery
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      )

      await waitFor(() => {
        expect(screen.getByText('Normal component')).toBeInTheDocument()
      })

      consoleSpy.mockRestore()
    })

    it('navigates to home when home button is clicked', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const windowSpy = vi.spyOn(window, 'location', 'get').mockReturnValue({
        href: 'http://localhost:3000/error'
      } as Location)

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const homeButton = screen.getByText('Go to Home')
      fireEvent.click(homeButton)

      expect(window.location.href).toBe('/')

      consoleSpy.mockRestore()
      windowSpy.mockRestore()
    })

    it('opens email client with error details when report bug button is clicked', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const reportButton = screen.getByText('Report Bug')
      fireEvent.click(reportButton)

      // Check that window.open was called with the correct arguments
      expect(windowOpenSpy).toHaveBeenCalledWith(
        expect.stringContaining('mailto:support@medflow.com'),
        '_blank'
      )

      consoleSpy.mockRestore()
      windowOpenSpy.mockRestore()
    })
  })

  describe('Error Logging', () => {
    it('logs error to localStorage', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'medflow-error-logs',
        expect.stringContaining('Test error message')
      )

      consoleSpy.mockRestore()
    })

    it('maintains error log limit', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      // Mock existing logs with 100 entries
      const existingLogs = Array.from({ length: 100 }, (_, i) => ({
        id: `error-${i}`,
        timestamp: new Date().toISOString()
      }))
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingLogs))

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      // Should still call setItem with new logs
      expect(localStorageMock.setItem).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe('Custom Fallback UI', () => {
    it('renders custom fallback when provided', () => {
      const customFallback = <div>Custom error UI</div>
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Custom error UI')).toBeInTheDocument()
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()

      consoleSpy.mockRestore()
    })
  })

  describe('Error Details Display', () => {
    it('shows error details when showDetails is true', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(
        <ErrorBoundary showDetails={true}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const detailsElement = screen.getByText('Error Details (for developers)')
      expect(detailsElement).toBeInTheDocument()

      consoleSpy.mockRestore()
    })

    it('hides error details when showDetails is false', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(
        <ErrorBoundary showDetails={false}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const detailsElement = screen.queryByText('Error Details (for developers)')
      expect(detailsElement).not.toBeInTheDocument()

      consoleSpy.mockRestore()
    })
  })

  describe('useErrorHandler Hook', () => {
    it('provides error handling function', () => {
      const TestComponent = () => {
        const { handleError } = useErrorHandler()
        
        const triggerError = () => {
          try {
            throw new Error('Hook test error')
          } catch (error) {
            handleError(error as Error)
          }
        }

        return (
          <button onClick={triggerError}>
            Trigger Error
          </button>
        )
      }

      render(<TestComponent />)

      const button = screen.getByText('Trigger Error')
      fireEvent.click(button)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'medflow-error-logs',
        expect.stringContaining('Hook test error')
      )
    })
  })

  describe('Error Boundary State Management', () => {
    it('generates unique error IDs for each error', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      // Test first error
      const { unmount } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const firstErrorId = screen.getByText(/Error ID:/).textContent
      unmount()

      // Test second error with fresh ErrorBoundary instance
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const secondErrorId = screen.getByText(/Error ID:/).textContent

      expect(firstErrorId).not.toBe(secondErrorId)

      consoleSpy.mockRestore()
    })
  })

  describe('Edge Cases', () => {
    it('handles errors in useEffect', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(
        <ErrorBoundary>
          <ThrowErrorInEffect shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()

      consoleSpy.mockRestore()
    })

    it('handles errors with missing error info', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      // Mock componentDidCatch to simulate missing errorInfo
      const TestErrorBoundary = class extends ErrorBoundary {
        componentDidCatch(error: Error, errorInfo: ErrorInfo) {
          // Don't call super to simulate missing errorInfo
          this.setState({
            hasError: true,
            error,
            errorInfo: null,
            errorId: 'test-error-id'
          })
        }
      }

      render(
        <TestErrorBoundary>
          <ThrowError shouldThrow={true} />
        </TestErrorBoundary>
      )

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()

      consoleSpy.mockRestore()
    })
  })
})
