import { lazy } from 'react'
import { BackgroundType } from '../components/layout/RouteLayout'

// Lazy load all route components
export const routeComponents = {
  WebsiteLanding: lazy(() => import('../pages/WebsiteLanding')),
  ModularLandingPage: lazy(() => import('../pages/ModularLandingPage')),
  BasicWebsite: lazy(() => import('../pages/BasicWebsite')),
  EnhancedBasicWebsite: lazy(() => import('../pages/EnhancedBasicWebsite')),
  SignIn: lazy(() => import('../pages/auth/SignIn')),
  SignUp: lazy(() => import('../pages/auth/SignUp')),
  ResetPassword: lazy(() => import('../pages/auth/ResetPassword')),
  Dashboard: lazy(() => import('../pages/Dashboard')),
  Appointments: lazy(() => import('../pages/Appointments')),
  Patients: lazy(() => import('../pages/Patients')),
  Analytics: lazy(() => import('../pages/Analytics')),
  SecureAnalytics: lazy(() => import('../pages/SecureAnalytics')),
  Profile: lazy(() => import('../pages/Profile')),
  PatientReports: lazy(() => import('../pages/PatientReports')),
  MonthlyReportReview: lazy(() => import('../pages/MonthlyReportReview')),
  ChatbotPlaceholder: lazy(() => import('../components/ChatbotPlaceholder')),
  AppointmentResponse: lazy(() => import('../pages/AppointmentResponse')),
  DesignGuidanceTest: lazy(() => import('../pages/DesignGuidanceTest')),
  ScrollGradientDemo: lazy(() => import('../pages/ScrollGradientDemo')),
  TestStyling: lazy(() => import('../components/TestStyling')),
  HomePage: lazy(() => import('../components/HomePage')),
  ProfessionalWebsite: lazy(() => import('../pages/ProfessionalWebsite')),
  FramerWebsitePage: lazy(() => import('../pages/FramerWebsitePage')),
  AnalyticsDashboard: lazy(() => import('../components/admin/AnalyticsDashboard'))
} as const

export interface RouteConfig {
  path: string
  component: keyof typeof routeComponents
  background: BackgroundType
  showNavbar: boolean
  showPageTransition: boolean
  containerClass?: string
  isPrivate?: boolean
}

export const routes: RouteConfig[] = [
  // Website routes (no navbar, website background)
  {
    path: '/',
    component: 'WebsiteLanding',
    background: 'website',
    showNavbar: false,
    showPageTransition: false
  },
  {
    path: '/website',
    component: 'WebsiteLanding',
    background: 'website',
    showNavbar: false,
    showPageTransition: false
  },
  {
    path: '/modular',
    component: 'ModularLandingPage',
    background: 'website',
    showNavbar: false,
    showPageTransition: false
  },
  {
    path: '/basic',
    component: 'BasicWebsite',
    background: 'website',
    showNavbar: false,
    showPageTransition: false
  },
  {
    path: '/enhanced',
    component: 'EnhancedBasicWebsite',
    background: 'website',
    showNavbar: false,
    showPageTransition: false
  },
  {
    path: '/test-styling',
    component: 'TestStyling',
    background: 'website',
    showNavbar: false,
    showPageTransition: false
  },
  {
    path: '/homepage',
    component: 'HomePage',
    background: 'none',
    showNavbar: false,
    showPageTransition: false
  },
  {
    path: '/professional',
    component: 'ProfessionalWebsite',
    background: 'none',
    showNavbar: false,
    showPageTransition: false
  },

  // Auth routes (with navbar, scroll background, page transitions)
  {
    path: '/signin',
    component: 'SignIn',
    background: 'scroll',
    showNavbar: true,
    showPageTransition: true,
    containerClass: 'min-h-screen text-white'
  },
  {
    path: '/signup',
    component: 'SignUp',
    background: 'scroll',
    showNavbar: true,
    showPageTransition: true,
    containerClass: 'min-h-screen text-white'
  },
  {
    path: '/reset',
    component: 'ResetPassword',
    background: 'scroll',
    showNavbar: true,
    showPageTransition: true,
    containerClass: 'min-h-screen text-white'
  },

  // Private app routes (with navbar, scroll background, page transitions)
  {
    path: '/dashboard',
    component: 'Dashboard',
    background: 'scroll',
    showNavbar: true,
    showPageTransition: true,
    containerClass: 'min-h-screen text-white',
    isPrivate: true
  },
  {
    path: '/appointments',
    component: 'Appointments',
    background: 'scroll',
    showNavbar: true,
    showPageTransition: true,
    containerClass: 'min-h-screen text-white',
    isPrivate: true
  },
  {
    path: '/patients',
    component: 'Patients',
    background: 'scroll',
    showNavbar: true,
    showPageTransition: true,
    containerClass: 'min-h-screen text-white',
    isPrivate: true
  },
  {
    path: '/analytics',
    component: 'SecureAnalytics',
    background: 'scroll',
    showNavbar: true,
    showPageTransition: true,
    containerClass: 'min-h-screen text-white',
    isPrivate: true
  },
  {
    path: '/profile',
    component: 'Profile',
    background: 'scroll',
    showNavbar: true,
    showPageTransition: true,
    containerClass: 'min-h-screen text-white',
    isPrivate: true
  },
  {
    path: '/reports',
    component: 'PatientReports',
    background: 'scroll',
    showNavbar: true,
    showPageTransition: true,
    containerClass: 'min-h-screen text-white',
    isPrivate: true
  },
  {
    path: '/monthly-review',
    component: 'MonthlyReportReview',
    background: 'scroll',
    showNavbar: true,
    showPageTransition: true,
    containerClass: 'min-h-screen text-white',
    isPrivate: true
  },
  {
    path: '/chatbot',
    component: 'ChatbotPlaceholder',
    background: 'scroll',
    showNavbar: true,
    showPageTransition: true,
    containerClass: 'min-h-screen text-white',
    isPrivate: true
  },

  // Public routes (no navbar, scroll background, page transitions)
  {
    path: '/appointment-response/:token',
    component: 'AppointmentResponse',
    background: 'scroll',
    showNavbar: false,
    showPageTransition: true,
    containerClass: 'min-h-screen text-white'
  },
  {
    path: '/design-test',
    component: 'DesignGuidanceTest',
    background: 'scroll',
    showNavbar: false,
    showPageTransition: true,
    containerClass: 'min-h-screen text-white'
  },
  {
    path: '/scroll-demo',
    component: 'ScrollGradientDemo',
    background: 'scroll',
    showNavbar: false,
    showPageTransition: true,
    containerClass: 'min-h-screen text-white'
  },
  
  // Framer Website Integration (no navbar, website background, no transitions)
  {
    path: '/framer-websites',
    component: 'FramerWebsitePage',
    background: 'website',
    showNavbar: false,
    showPageTransition: false
  }
]

export default routes
