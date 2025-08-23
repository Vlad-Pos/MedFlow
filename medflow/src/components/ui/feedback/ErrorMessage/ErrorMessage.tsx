/**
 * Enhanced Error Message Component for MedFlow UI Library
 *
 * Features:
 * - Professional medical styling with MedFlow branding
 * - Multiple error types (error, warning, info, technical)
 * - Accessible with ARIA labels and screen reader support
 * - Action buttons for retry, navigation, and bug reporting
 * - Responsive design for all screen sizes
 * - Romanian localization for medical professionals
 * - Error logging integration
 *
 * @author MedFlow UI Team
 * @version 2.0
 */

import React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home, ArrowLeft, Bug, Info, CheckCircle, XCircle } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

export interface ErrorMessageProps {
  title?: string
  message: string
  type?: 'error' | 'warning' | 'info' | 'success' | 'technical'
  actionLabel?: string
  onAction?: () => void
  showHomeLink?: boolean
  showBackButton?: boolean
  showRetryButton?: boolean
  showReportBug?: boolean
  errorCode?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  actions?: ErrorAction[]
}

export interface ErrorAction {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  icon?: React.ReactNode
}

const sizeClasses = {
  sm: 'max-w-md p-6',
  md: 'max-w-lg p-8',
  lg: 'max-w-2xl p-10'
}

const typeConfig = {
  error: {
    bg: 'bg-red-500/20',
    border: 'border-red-400/30',
    iconBg: 'bg-red-500/30',
    iconColor: 'text-red-300',
    titleColor: 'text-red-200',
    textColor: 'text-red-300/80',
    buttonBg: 'bg-red-500 hover:bg-red-600',
    buttonBorder: 'border-red-400/30 text-red-300 hover:bg-red-500/10',
    icon: AlertTriangle
  },
  warning: {
    bg: 'bg-orange-500/20',
    border: 'border-orange-400/30',
    iconBg: 'bg-orange-500/30',
    iconColor: 'text-orange-300',
    titleColor: 'text-orange-200',
    textColor: 'text-orange-300/80',
    buttonBg: 'bg-orange-500 hover:bg-orange-600',
    buttonBorder: 'border-orange-400/30 text-orange-300 hover:bg-orange-500/10',
    icon: AlertTriangle
  },
  info: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-400/30',
    iconBg: 'bg-blue-500/30',
    iconColor: 'text-blue-300',
    titleColor: 'text-blue-200',
    textColor: 'text-blue-300/80',
    buttonBg: 'bg-blue-500 hover:bg-blue-600',
    buttonBorder: 'border-blue-400/30 text-blue-300 hover:bg-blue-500/10',
    icon: Info
  },
  success: {
    bg: 'bg-emerald-500/20',
    border: 'border-emerald-400/30',
    iconBg: 'bg-emerald-500/30',
    iconColor: 'text-emerald-300',
    titleColor: 'text-emerald-200',
    textColor: 'text-emerald-300/80',
    buttonBg: 'bg-emerald-500 hover:bg-emerald-600',
    buttonBorder: 'border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/10',
    icon: CheckCircle
  },
  technical: {
    bg: 'bg-orange-500/20',
    border: 'border-orange-400/30',
    iconBg: 'bg-orange-500/30',
    iconColor: 'text-orange-300',
    titleColor: 'text-orange-200',
    textColor: 'text-orange-300/80',
    buttonBg: 'bg-orange-500 hover:bg-orange-600',
    buttonBorder: 'border-orange-400/30 text-orange-300 hover:bg-orange-500/10',
    icon: Bug
  }
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = "A apărut o problemă",
  message,
  type = 'error',
  actionLabel = "Încearcă din nou",
  onAction,
  showHomeLink = true,
  showBackButton = false,
  showRetryButton = false,
  showReportBug = false,
  errorCode,
  className = '',
  size = 'md',
  actions = []
}) => {
  const navigate = useNavigate()
  const config = typeConfig[type]
  const ErrorIcon = config.icon

  const handleReportBug = () => {
    const errorDetails = {
      errorId: errorCode,
      error: message,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    }

    const subject = encodeURIComponent(`MedFlow Bug Report - Error ID: ${errorCode}`)
    const body = encodeURIComponent(JSON.stringify(errorDetails, null, 2))
    window.open(`mailto:support@medflow.com?subject=${subject}&body=${body}`, '_blank')
  }

  const defaultActions = []

  if (showRetryButton && onAction) {
    defaultActions.push({
      label: actionLabel,
      onClick: onAction,
      variant: 'primary' as const,
      icon: <RefreshCw className="w-4 h-4" />
    })
  }

  if (showBackButton) {
    defaultActions.push({
      label: 'Înapoi',
      onClick: () => navigate(-1),
      variant: 'secondary' as const,
      icon: <ArrowLeft className="w-4 h-4" />
    })
  }

  if (showReportBug) {
    defaultActions.push({
      label: 'Raportează problemă',
      onClick: handleReportBug,
      variant: 'secondary' as const,
      icon: <Bug className="w-4 h-4" />
    })
  }

  const allActions = [...defaultActions, ...actions]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`mx-auto text-center ${sizeClasses[size]} ${config.bg} border ${config.border} rounded-xl backdrop-blur-sm ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <div className={`w-16 h-16 ${config.iconBg} rounded-full flex items-center justify-center mx-auto mb-6`}>
        <ErrorIcon className={`w-8 h-8 ${config.iconColor}`} />
      </div>

      <h3 className={`text-xl font-semibold ${config.titleColor} mb-3`}>
        {title}
      </h3>

      <p className={`${config.textColor} mb-6 leading-relaxed`}>
        {message}
      </p>

      {errorCode && (
        <div className="mb-6 p-3 bg-black/20 rounded-lg border border-white/10">
          <p className="text-xs text-medflow-text-muted">
            <strong>Cod eroare:</strong> {errorCode}
          </p>
        </div>
      )}

      {allActions.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          {allActions.map((action, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={action.onClick}
              className={`inline-flex items-center space-x-2 ${
                action.variant === 'primary' ? config.buttonBg : config.buttonBorder
              } text-white font-medium py-3 px-6 rounded-lg transition-colors shadow-lg`}
            >
              {action.icon}
              <span>{action.label}</span>
            </motion.button>
          ))}
        </div>
      )}

      {showHomeLink && (
        <div className="pt-4 border-t border-white/10">
          <Link
            to="/dashboard"
            className={`inline-flex items-center space-x-2 border ${config.buttonBorder} font-medium py-2 px-4 rounded-lg transition-colors text-sm`}
          >
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
        </div>
      )}

      {type === 'technical' && (
        <div className="mt-6 pt-4 border-t border-white/10">
          <p className="text-xs text-medflow-text-muted">
            Dacă problema persistă, contactați echipa de suport tehnic cu codul de eroare de mai sus.
          </p>
        </div>
      )}
    </motion.div>
  )
}

// Specialized error message components for common scenarios
export const NetworkErrorMessage: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <ErrorMessage
    title="Eroare de conexiune"
    message="Nu se poate conecta la server. Verificați conexiunea la internet și încercați din nou."
    type="warning"
    actionLabel="Reîncearcă"
    onAction={onRetry}
    showRetryButton={!!onRetry}
    showHomeLink={true}
  />
)

export const ValidationErrorMessage: React.FC<{ message: string }> = ({ message }) => (
  <ErrorMessage
    title="Eroare de validare"
    message={message}
    type="error"
    showBackButton={true}
    size="sm"
  />
)

export const PermissionErrorMessage: React.FC<{ resource?: string }> = ({ resource = "această resursă" }) => (
  <ErrorMessage
    title="Acces interzis"
    message={`Nu aveți permisiunea să accesați ${resource}. Contactați administratorul pentru mai multe informații.`}
    type="warning"
    showHomeLink={true}
    showBackButton={true}
  />
)

export const NotFoundErrorMessage: React.FC<{ resource?: string }> = ({ resource = "pagina" }) => (
  <ErrorMessage
    title="Nu a fost găsit"
    message={`${resource} pe care o căutați nu există sau a fost mutată.`}
    type="info"
    showHomeLink={true}
    showBackButton={true}
  />
)

ErrorMessage.displayName = 'ErrorMessage'
NetworkErrorMessage.displayName = 'NetworkErrorMessage'
ValidationErrorMessage.displayName = 'ValidationErrorMessage'
PermissionErrorMessage.displayName = 'PermissionErrorMessage'
NotFoundErrorMessage.displayName = 'NotFoundErrorMessage'
