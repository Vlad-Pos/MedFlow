// Core Components
export * from './core'

// Medical Components
export * from './medical'

// Animation Components
export * from './animations'

// Layout Components
export * from './layout'

// Stats Components
export { FastStatsCard } from './FastStatsCard'
export type { FastStatsCardProps } from './FastStatsCard.d'

// Loading Components
export { MedFlowLoader } from './MedFlowLoader'
export { SimpleLoader } from './SimpleLoader'

// Enhanced UI Components
// Feedback Components
export * from './feedback/LoadingSpinner'
export * from './feedback/ErrorMessage'
export * from './feedback/ErrorBoundary'

// Dialog Components
export * from './dialogs/ConfirmationDialog'

// Button Components
export * from './buttons/AnimatedButton'

// Navigation Components
export * from './navigation/NavigationManager'

// Legacy Components (for backward compatibility)
export { default as Button } from './Button'
export { default as Input } from './Input'
export { default as Card } from './Card'
export { default as Modal } from './Modal'
export { default as Accordion } from './Accordion'

// Re-export common components with enhanced versions
export {
  LoadingSpinner,
  RouteLoadingSpinner,
  PageLoadingSpinner,
  ButtonLoadingSpinner,
  FormLoadingSpinner
} from './feedback/LoadingSpinner'

export {
  ErrorMessage,
  NetworkErrorMessage,
  ValidationErrorMessage,
  PermissionErrorMessage,
  NotFoundErrorMessage
} from './feedback/ErrorMessage'

export {
  ErrorBoundary,
  PageErrorBoundary,
  FormErrorBoundary,
  ComponentErrorBoundary,
  useErrorHandler
} from './feedback/ErrorBoundary'

export {
  ConfirmationDialog,
  DeleteAppointmentDialog,
  CompleteAppointmentDialog,
  CustomConfirmationDialog
} from './dialogs/ConfirmationDialog'

export {
  AnimatedButton,
  PrimaryButton,
  SecondaryButton,
  DangerButton,
  SuccessButton,
  WarningButton,
  GhostButton,
  OutlineButton,
  IconButton,
  SaveButton,
  CancelButton,
  DeleteButton,
  EditButton,
  SubmitButton,
  BackButton,
  ButtonGroup
} from './buttons/AnimatedButton'

export {
  NavigationManager,
  NavigationItem,
  SidebarNavigation,
  CollapsedNavigation,
  MobileNavigation,
  useNavigationItems
} from './navigation/NavigationManager'
