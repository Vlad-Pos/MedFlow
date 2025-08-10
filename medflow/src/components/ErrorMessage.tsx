import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home, ArrowLeft, Bug } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import DesignWorkWrapper from '../../DesignWorkWrapper'

interface ErrorMessageProps {
  title?: string
  message: string
  actionLabel?: string
  onAction?: () => void
  showHomeLink?: boolean
  showBackButton?: boolean
  errorCode?: string
  technical?: boolean
}

export default function ErrorMessage({ 
  title = "A apărut o problemă",
  message,
  actionLabel = "Încearcă din nou",
  onAction,
  showHomeLink = true,
  showBackButton = false,
  errorCode,
  technical = false
}: ErrorMessageProps) {
  const navigate = useNavigate()

  const getErrorIcon = () => {
    if (technical) return Bug
    return AlertTriangle
  }

  const getErrorColors = () => {
    if (technical) {
      return {
        bg: 'bg-orange-500/20',
        border: 'border-orange-400/30',
        iconBg: 'bg-orange-500/30',
        iconColor: 'text-orange-300',
        titleColor: 'text-orange-200',
        textColor: 'text-orange-300/80',
        buttonBg: 'bg-orange-500 hover:bg-orange-600',
        buttonBorder: 'border-orange-400/30 text-orange-300 hover:bg-orange-500/10'
      }
    }
    
    return {
      bg: 'bg-red-500/20',
      border: 'border-red-400/30',
      iconBg: 'bg-red-500/30',
      iconColor: 'text-red-300',
      titleColor: 'text-red-200',
      textColor: 'text-red-300/80',
      buttonBg: 'bg-red-500 hover:bg-red-600',
      buttonBorder: 'border-red-400/30 text-red-300 hover:bg-red-500/10'
    }
  }

  const colors = getErrorColors()
  const ErrorIcon = getErrorIcon()

  return (
    <DesignWorkWrapper componentName="ErrorMessage">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`max-w-lg mx-auto text-center p-8 ${colors.bg} border ${colors.border} rounded-xl backdrop-blur-sm`}
      >
        <div className={`w-16 h-16 ${colors.iconBg} rounded-full flex items-center justify-center mx-auto mb-6`}>
          <ErrorIcon className={`w-8 h-8 ${colors.iconColor}`} />
        </div>
        
        <h3 className={`text-xl font-semibold ${colors.titleColor} mb-3`}>
          {title}
        </h3>
        
        <p className={`${colors.textColor} mb-6 leading-relaxed`}>
          {message}
        </p>

        {errorCode && (
          <div className="mb-6 p-3 bg-black/20 rounded-lg border border-white/10">
            <p className="text-xs text-medflow-text-muted">
              <strong>Cod eroare:</strong> {errorCode}
            </p>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onAction && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onAction}
              className={`inline-flex items-center space-x-2 ${colors.buttonBg} text-white font-medium py-3 px-6 rounded-lg transition-colors shadow-lg`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>{actionLabel}</span>
            </motion.button>
          )}
          
          {showBackButton && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(-1)}
              className={`inline-flex items-center space-x-2 border ${colors.buttonBorder} font-medium py-3 px-6 rounded-lg transition-colors`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Înapoi</span>
            </motion.button>
          )}
          
          {showHomeLink && (
            <Link
              to="/dashboard"
              className={`inline-flex items-center space-x-2 border ${colors.buttonBorder} font-medium py-3 px-6 rounded-lg transition-colors`}
            >
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
          )}
        </div>

        {technical && (
          <div className="mt-6 pt-4 border-t border-white/10">
            <p className="text-xs text-medflow-text-muted">
              Dacă problema persistă, contactați echipa de suport tehnic cu codul de eroare de mai sus.
            </p>
          </div>
        )}
      </motion.div>
    </DesignWorkWrapper>
  )
}
