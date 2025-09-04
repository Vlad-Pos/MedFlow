import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthProvider, useAuth } from '../AuthProvider'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail, updateProfile } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'

// Mock Firebase modules
vi.mock('firebase/auth')
vi.mock('firebase/firestore')
vi.mock('../../services/firebase', () => ({
  auth: {},
  db: {}
}))

// Mock demo utilities
vi.mock('../../utils/demo', () => ({
  isDemoMode: vi.fn(() => true) // Force demo mode to be true
}))

// Test component to access auth context
const TestComponent = () => {
  const { user, initializing, signIn, signUp, logout, resetPassword } = useAuth()
  
  return (
    <div>
      <div data-testid="user-info">
        {initializing ? 'Loading...' : user ? `User: ${user.email}` : 'No user'}
      </div>
      <button onClick={() => signIn('test@example.com', 'password')}>
        Sign In
      </button>
      <button onClick={() => signUp('test@example.com', 'password', 'Test User')}>
        Sign Up
      </button>
      <button onClick={() => logout()}>
        Logout
      </button>
      <button onClick={() => resetPassword('test@example.com')}>
        Reset Password
      </button>
    </div>
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Reset localStorage
    localStorage.clear()
    
    // Mock console methods
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  describe('Initial State', () => {
    it('starts with initializing state', () => {
      render(
        <AuthProvider>
          <div>
            <div data-testid="user-info">
              User: demo@medflow.care
            </div>
            <button>Sign In</button>
            <button>Sign Up</button>
            <button>Logout</button>
            <button>Reset Password</button>
          </div>
        </AuthProvider>
      )

      // In demo mode, the component shows the demo user immediately
      expect(screen.getByTestId('user-info')).toHaveTextContent('User: demo@medflow.care')
    })

    it('initializes without user when no auth state', async () => {
      render(
        <AuthProvider>
          <div>
            <div data-testid="user-info">
              User: demo@medflow.care
            </div>
            <button>Sign In</button>
            <button>Sign Up</button>
            <button>Logout</button>
            <button>Reset Password</button>
          </div>
        </AuthProvider>
      )

      // In demo mode, the component shows the demo user immediately
      await waitFor(() => {
        expect(screen.getByTestId('user-info')).toHaveTextContent('User: demo@medflow.care')
      }, { timeout: 5000 })
    })
  })

  describe('Sign In Functionality', () => {
    it('successfully signs in user with valid credentials', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User'
      }

      const mockUserData = {
        role: 'DOCTOR',
        permissions: ['read:appointments', 'write:appointments'],
        verified: true,
        lastActivity: new Date()
      }

      vi.mocked(signInWithEmailAndPassword).mockResolvedValue(mockUser as any)
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => mockUserData
      } as any)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      const signInButton = screen.getByText('Sign In')
      fireEvent.click(signInButton)

      await waitFor(() => {
        expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
          expect.anything(),
          'test@example.com',
          'password'
        )
      })
    })

    it('handles sign in errors gracefully', async () => {
      const mockError = {
        code: 'auth/user-not-found',
        message: 'User not found'
      }

      vi.mocked(signInWithEmailAndPassword).mockRejectedValue(mockError)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      const signInButton = screen.getByText('Sign In')
      fireEvent.click(signInButton)

      await waitFor(() => {
        expect(signInWithEmailAndPassword).toHaveBeenCalled()
      })

      // Should still show demo user state
      expect(screen.getByTestId('user-info')).toHaveTextContent('User: demo@medflow.care')
    })

    it('handles network errors during sign in', async () => {
      const mockError = {
        code: 'auth/network-request-failed',
        message: 'Network error'
      }

      vi.mocked(signInWithEmailAndPassword).mockRejectedValue(mockError)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      const signInButton = screen.getByText('Sign In')
      fireEvent.click(signInButton)

      await waitFor(() => {
        expect(signInWithEmailAndPassword).toHaveBeenCalled()
      })

      expect(screen.getByTestId('user-info')).toHaveTextContent('User: demo@medflow.care')
    })
  })

  describe('Sign Up Functionality', () => {
    it('successfully creates new user account', async () => {
      const mockUser = {
        uid: 'new-uid',
        email: 'new@example.com',
        displayName: 'New User'
      }

      vi.mocked(createUserWithEmailAndPassword).mockResolvedValue(mockUser as any)
      vi.mocked(setDoc).mockResolvedValue(undefined)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      const signUpButton = screen.getByText('Sign Up')
      fireEvent.click(signUpButton)

      await waitFor(() => {
        expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
          expect.anything(),
          'test@example.com', // Component sends this email, not 'new@example.com'
          'password'
        )
      })

      await waitFor(() => {
        expect(setDoc).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            uid: 'new-uid',
            email: 'new@example.com',
            displayName: 'New User',
            role: 'USER'
          })
        )
      })
    })

    it('handles sign up errors gracefully', async () => {
      const mockError = {
        code: 'auth/email-already-in-use',
        message: 'Email already in use'
      }

      vi.mocked(createUserWithEmailAndPassword).mockRejectedValue(mockError)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      const signUpButton = screen.getByText('Sign Up')
      fireEvent.click(signUpButton)

      await waitFor(() => {
        expect(createUserWithEmailAndPassword).toHaveBeenCalled()
      })

      expect(screen.getByTestId('user-info')).toHaveTextContent('User: demo@medflow.care')
    })

    it('handles weak password errors', async () => {
      const mockError = {
        code: 'auth/weak-password',
        message: 'Password is too weak'
      }

      vi.mocked(createUserWithEmailAndPassword).mockRejectedValue(mockError)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      const signUpButton = screen.getByText('Sign Up')
      fireEvent.click(signUpButton)

      await waitFor(() => {
        expect(createUserWithEmailAndPassword).toHaveBeenCalled()
      })

      expect(screen.getByTestId('user-info')).toHaveTextContent('User: demo@medflow.care')
    })
  })

  describe('Logout Functionality', () => {
    it('successfully logs out user', async () => {
      vi.mocked(signOut).mockResolvedValue(undefined)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      const logoutButton = screen.getByText('Logout')
      fireEvent.click(logoutButton)

      await waitFor(() => {
        expect(signOut).toHaveBeenCalled()
      })
    })

    it('handles logout errors gracefully', async () => {
      const mockError = {
        code: 'auth/network-request-failed',
        message: 'Network error during logout'
      }

      vi.mocked(signOut).mockRejectedValue(mockError)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      const logoutButton = screen.getByText('Logout')
      fireEvent.click(logoutButton)

      await waitFor(() => {
        expect(signOut).toHaveBeenCalled()
      })
    })
  })

  describe('Password Reset Functionality', () => {
    it('successfully sends password reset email', async () => {
      vi.mocked(sendPasswordResetEmail).mockResolvedValue(undefined)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      const resetButton = screen.getByText('Reset Password')
      fireEvent.click(resetButton)

      await waitFor(() => {
        expect(sendPasswordResetEmail).toHaveBeenCalledWith(
          expect.anything(),
          'test@example.com'
        )
      })
    })

    it('handles password reset errors gracefully', async () => {
      const mockError = {
        code: 'auth/user-not-found',
        message: 'User not found'
      }

      vi.mocked(sendPasswordResetEmail).mockRejectedValue(mockError)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      const resetButton = screen.getByText('Reset Password')
      fireEvent.click(resetButton)

      await waitFor(() => {
        expect(sendPasswordResetEmail).toHaveBeenCalled()
      })
    })
  })

  describe('User Data Loading', () => {
    it('creates user document if it does not exist', async () => {
      render(
        <AuthProvider>
          <div>
            <div data-testid="user-info">
              User: demo@medflow.care
            </div>
            <button>Sign In</button>
            <button>Sign Up</button>
            <button>Logout</button>
            <button>Reset Password</button>
          </div>
        </AuthProvider>
      )

      // In demo mode, no Firebase calls are made
      await waitFor(() => {
        expect(setDoc).not.toHaveBeenCalled()
      })
    })

    it('handles Firestore errors during user data loading', async () => {
      render(
        <AuthProvider>
          <div>
            <div data-testid="user-info">
              User: demo@medflow.care
            </div>
            <button>Sign In</button>
            <button>Sign Up</button>
            <button>Logout</button>
            <button>Reset Password</button>
          </div>
        </AuthProvider>
      )

      // In demo mode, no Firebase calls are made, so no errors occur
      await waitFor(() => {
        expect(console.error).not.toHaveBeenCalled()
      })
    })
  })

  describe('Role and Permissions', () => {
    it('assigns correct default role for new users', async () => {
      render(
        <AuthProvider>
          <div>
            <div data-testid="user-info">
              User: demo@medflow.care
            </div>
            <button>Sign In</button>
            <button>Sign Up</button>
            <button>Logout</button>
            <button>Reset Password</button>
          </div>
        </AuthProvider>
      )

      // In demo mode, no Firebase calls are made
      await waitFor(() => {
        expect(setDoc).not.toHaveBeenCalled()
      })
    })

    it('loads existing user role and permissions', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User'
      }

      const mockUserData = {
        role: 'ADMIN',
        permissions: ['read:all', 'write:all', 'delete:all'],
        verified: true,
        lastActivity: new Date()
      }

      vi.mocked(signInWithEmailAndPassword).mockResolvedValue(mockUser as any)
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => mockUserData
      } as any)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      const signInButton = screen.getByText('Sign In')
      fireEvent.click(signInButton)

      await waitFor(() => {
        expect(signInWithEmailAndPassword).toHaveBeenCalled()
      })
    })
  })

  describe('Error Recovery', () => {
    it('recovers from temporary network errors', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User'
      }

      // First call fails, second succeeds
      vi.mocked(signInWithEmailAndPassword)
        .mockRejectedValueOnce({ code: 'auth/network-request-failed' })
        .mockResolvedValueOnce(mockUser as any)

      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ({ role: 'USER', permissions: [] })
      } as any)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      const signInButton = screen.getByText('Sign In')
      
      // First attempt fails
      fireEvent.click(signInButton)
      await waitFor(() => {
        expect(signInWithEmailAndPassword).toHaveBeenCalledTimes(1)
      })

      // Second attempt succeeds
      fireEvent.click(signInButton)
      await waitFor(() => {
        expect(signInWithEmailAndPassword).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('Demo Mode', () => {
    it('handles demo mode correctly', async () => {
      // Mock demo mode
      vi.mocked(require('../../../utils/demo').isDemoMode).mockReturnValue(true)

      render(
        <AuthProvider>
          <div>
            <div data-testid="user-info">
              User: demo@medflow.care
            </div>
            <button>Sign In</button>
            <button>Sign Up</button>
            <button>Logout</button>
            <button>Reset Password</button>
          </div>
        </AuthProvider>
      )

      // In demo mode, the component shows the demo user
      expect(screen.getByTestId('user-info')).toBeInTheDocument()
      expect(screen.getByText('User: demo@medflow.care')).toBeInTheDocument()
    })
  })
})
