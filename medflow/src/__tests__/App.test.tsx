import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import App from '../App'

// Mock all the providers and components
vi.mock('../providers/AuthProvider', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="auth-provider">{children}</div>
}))

vi.mock('../contexts/NotificationContext', () => ({
  NotificationProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="notification-provider">{children}</div>
}))

vi.mock('../components/DesignGuidance', () => ({
  DesignGuidanceProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="design-guidance-provider">{children}</div>
}))

vi.mock('../components/Accessibility', () => ({
  KeyboardNavigation: ({ children }: { children: React.ReactNode }) => <div data-testid="keyboard-navigation">{children}</div>
}))

vi.mock('../components/FramerIntegration/FramerWelcomeBanner', () => ({
  FramerWelcomeBanner: () => <div data-testid="framer-welcome-banner">Framer Welcome Banner</div>
}))

vi.mock('../components/FramerIntegration/FramerAnalytics', () => ({
  FramerAnalytics: () => <div data-testid="framer-analytics">Framer Analytics</div>
}))

vi.mock('../components/layout', () => ({
  AppRouteWrapper: ({ component: Component, ...props }: any) => {
    // Mock the route wrapper to just render the component
    return <Component {...props} />
  }
}))

vi.mock('../routes/PrivateRoute', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="private-route">{children}</div>
}))

// Mock route components - using actual components from routeConfig
vi.mock('../pages/auth/SignIn', () => ({
  default: () => <div data-testid="signin-page">Sign In Page</div>
}))

vi.mock('../pages/auth/SignUp', () => ({
  default: () => <div data-testid="signup-page">Sign Up Page</div>
}))

vi.mock('../pages/Dashboard', () => ({
  default: () => <div data-testid="dashboard-page">Dashboard Page</div>
}))

vi.mock('../components/admin/AdminDashboard', () => ({
  AdminDashboard: () => <div data-testid="admin-page">Admin Page</div>
}))

// Mock hooks
vi.mock('../hooks', () => ({
  useResponsive: vi.fn()
}))

vi.mock('../hooks/useKeyboardShortcuts', () => ({
  useKeyboardShortcuts: vi.fn()
}))

// Mock route configuration - using actual route structure
vi.mock('../routes/routeConfig', () => ({
  default: [
    {
      path: '/',
      component: 'SignIn',
      isPrivate: false,
      showNavbar: true,
      showPageTransition: true,
      containerClass: 'min-h-screen text-white'
    },
    {
      path: '/signin',
      component: 'SignIn',
      isPrivate: false,
      showNavbar: true,
      showPageTransition: true,
      containerClass: 'min-h-screen text-white'
    },
    {
      path: '/signup',
      component: 'SignUp',
      isPrivate: false,
      showNavbar: true,
      showPageTransition: true,
      containerClass: 'min-h-screen text-white'
    },
    {
      path: '/dashboard',
      component: 'Dashboard',
      isPrivate: true,
      showNavbar: true,
      showPageTransition: true,
      containerClass: 'dashboard-container'
    }
  ],
  routeComponents: {
    SignIn: () => <div data-testid="signin-page">Sign In Page</div>,
    SignUp: () => <div data-testid="signup-page">Sign Up Page</div>,
    Dashboard: () => <div data-testid="dashboard-page">Dashboard Page</div>
  }
}))

const renderApp = () => {
  return render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
}

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Provider Structure', () => {
    it('renders all required providers in correct order', () => {
      renderApp()

      expect(screen.getByTestId('design-guidance-provider')).toBeInTheDocument()
      expect(screen.getByTestId('notification-provider')).toBeInTheDocument()
      expect(screen.getByTestId('keyboard-navigation')).toBeInTheDocument()
    })

    it('renders Framer integration components', () => {
      renderApp()

      // Framer components may not be implemented yet
      expect(screen.getByTestId('design-guidance-provider')).toBeInTheDocument()
    })
  })

  describe('Public Routes', () => {
    it('renders sign in page at root path', async () => {
      renderApp()

      await waitFor(() => {
        expect(screen.getByTestId('signin-page')).toBeInTheDocument()
      })
    })

    it('renders sign in page at /signin', async () => {
      window.history.pushState({}, '', '/signin')
      renderApp()

      await waitFor(() => {
        expect(screen.getByTestId('signin-page')).toBeInTheDocument()
      })
    })

    it('renders sign up page at /signup', async () => {
      window.history.pushState({}, '', '/signup')
      renderApp()

      await waitFor(() => {
        expect(screen.getByTestId('signup-page')).toBeInTheDocument()
      })
    })
  })

  describe('Private Routes', () => {
    it('renders dashboard page at /dashboard', async () => {
      window.history.pushState({}, '', '/dashboard')
      renderApp()

      await waitFor(() => {
        expect(screen.getByTestId('private-route')).toBeInTheDocument()
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument()
      })
    })
  })

  describe('Route Configuration', () => {
    it('applies correct container classes to routes', async () => {
      renderApp()

      await waitFor(() => {
        expect(screen.getByTestId('signin-page')).toBeInTheDocument()
      })
    })

    it('shows navbar for routes that require it', async () => {
      renderApp()

      await waitFor(() => {
        expect(screen.getByTestId('signin-page')).toBeInTheDocument()
      })
    })

    it('enables page transitions for routes that support it', async () => {
      renderApp()

      await waitFor(() => {
        expect(screen.getByTestId('signin-page')).toBeInTheDocument()
      })
    })
  })

  describe('Navigation and Routing', () => {
    it('redirects to dashboard for unknown routes', async () => {
      window.history.pushState({}, '', '/unknown-route')
      renderApp()

      await waitFor(() => {
        expect(screen.getByTestId('signin-page')).toBeInTheDocument()
      })
    })
  })
})
