/**
 * Enhanced Confirmation Dialog Component for MedFlow UI Library
 *
 * Features:
 * - Professional medical styling with MedFlow branding
 * - Multiple dialog types (danger, warning, info, success)
 * - Accessible with ARIA labels and keyboard navigation
 * - Smooth animations and transitions
 * - Customizable actions and content
 * - Romanian localization for medical professionals
 * - Loading states and async operations
 * - Form integration support
 *
 * @author MedFlow UI Team
 * @version 2.0
 */

import React, { useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle,
  Trash2,
  X,
  CheckCircle,
  Info,
  AlertCircle,
  Loader2
} from 'lucide-react'

export interface ConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  type?: 'danger' | 'warning' | 'info' | 'success' | 'question'
  confirmText?: string
  cancelText?: string
  confirmButtonVariant?: 'primary' | 'danger' | 'success' | 'warning'
  loading?: boolean
  loadingText?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  actions?: DialogAction[]
  children?: React.ReactNode
  className?: string
}

export interface DialogAction {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  icon?: React.ReactNode
  disabled?: boolean
  loading?: boolean
}

const sizeConfig = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg'
}

const typeConfig = {
  danger: {
    icon: <Trash2 className="w-6 h-6 text-red-600" />,
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    confirmBg: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    borderColor: 'border-red-200 dark:border-red-800'
  },
  warning: {
    icon: <AlertTriangle className="w-6 h-6 text-orange-600" />,
    iconBg: 'bg-orange-100 dark:bg-orange-900/30',
    confirmBg: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500',
    borderColor: 'border-orange-200 dark:border-orange-800'
  },
  info: {
    icon: <Info className="w-6 h-6 text-blue-600" />,
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    confirmBg: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    borderColor: 'border-blue-200 dark:border-blue-800'
  },
  success: {
    icon: <CheckCircle className="w-6 h-6 text-emerald-600" />,
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    confirmBg: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500',
    borderColor: 'border-emerald-200 dark:border-emerald-800'
  },
  question: {
    icon: <AlertCircle className="w-6 h-6 text-medflow-primary" />,
    iconBg: 'bg-medflow-primary/10',
    confirmBg: 'bg-medflow-primary hover:bg-medflow-secondary focus:ring-medflow-primary',
    borderColor: 'border-medflow-primary/20'
  }
}

const buttonVariants = {
  primary: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white',
  secondary: 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500 text-white',
  danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white',
  success: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 text-white',
  warning: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500 text-white',
  ghost: 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'warning',
  confirmText = 'Confirmă',
  cancelText = 'Anulează',
  confirmButtonVariant,
  loading = false,
  loadingText = 'Se procesează...',
  disabled = false,
  size = 'md',
  icon,
  actions = [],
  children,
  className = ''
}) => {
  const config = typeConfig[type]
  const dialogIcon = icon || config.icon
  const confirmButtonClass = confirmButtonVariant
    ? buttonVariants[confirmButtonVariant]
    : config.confirmBg

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !loading) {
      onClose()
    } else if (e.key === 'Enter' && !loading && !disabled) {
      onConfirm()
    }
  }, [loading, disabled, onClose, onConfirm])

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !loading) {
      onClose()
    }
  }, [loading, onClose])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={handleBackdropClick}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`bg-white dark:bg-gray-900 rounded-xl p-6 w-full ${sizeConfig[size]} shadow-2xl border ${config.borderColor} ${className}`}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialog-title"
          aria-describedby="dialog-description"
        >
          {/* Header with Icon */}
          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-full ${config.iconBg} flex-shrink-0`}>
              {dialogIcon}
            </div>
            <div className="flex-1 min-w-0">
              <h3
                id="dialog-title"
                className="text-lg font-semibold text-gray-900 dark:text-white mb-2"
              >
                {title}
              </h3>
              <p
                id="dialog-description"
                className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed"
              >
                {message}
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
              aria-label="Închide dialogul"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Custom Content */}
          {children && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              {children}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end space-y-3 space-y-reverse sm:space-y-0 sm:space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            {/* Cancel Button */}
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>

            {/* Confirm Button */}
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading || disabled}
              className={`w-full sm:w-auto px-4 py-2 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${confirmButtonClass}`}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{loadingText}</span>
                </div>
              ) : (
                confirmText
              )}
            </button>
          </div>

          {/* Custom Actions */}
          {actions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  disabled={action.disabled || action.loading || loading}
                  className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    action.variant === 'ghost'
                      ? 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      : buttonVariants[action.variant || 'secondary']
                  }`}
                >
                  {action.loading && <Loader2 className="w-3 h-3 animate-spin" />}
                  {action.icon}
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Specialized confirmation dialogs for common medical actions
interface DeleteAppointmentDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  patientName?: string
  appointmentDate?: string
  loading?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export const DeleteAppointmentDialog: React.FC<DeleteAppointmentDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  patientName,
  appointmentDate,
  loading = false,
  size = 'md'
}) => {
  if (!isOpen) return null

  return (
    <ConfirmationDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Ștergere programare"
      message={
        patientName && appointmentDate
          ? `Sunteți sigur că doriți să ștergeți programarea pentru ${patientName} din data de ${appointmentDate}? Această acțiune nu poate fi anulată.`
          : patientName
          ? `Sunteți sigur că doriți să ștergeți programarea pentru ${patientName}? Această acțiune nu poate fi anulată.`
          : 'Sunteți sigur că doriți să ștergeți această programare? Această acțiune nu poate fi anulată.'
      }
      type="danger"
      confirmText="Șterge programarea"
      cancelText="Anulează"
      loading={loading}
      size={size}
    />
  )
}

interface CompleteAppointmentDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  patientName?: string
  loading?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export const CompleteAppointmentDialog: React.FC<CompleteAppointmentDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  patientName,
  loading = false,
  size = 'md'
}) => {
  if (!isOpen) return null

  return (
    <ConfirmationDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Finalizare consultație"
      message={
        patientName
          ? `Marcați consultația cu ${patientName} ca fiind finalizată?`
          : 'Marcați această consultație ca fiind finalizată?'
      }
      type="info"
      confirmText="Finalizează"
      cancelText="Anulează"
      confirmButtonVariant="success"
      loading={loading}
      size={size}
    />
  )
}

interface CustomConfirmationDialogProps extends Omit<ConfirmationDialogProps, 'type' | 'icon'> {
  customIcon?: React.ReactNode
  customType?: ConfirmationDialogProps['type']
}

export const CustomConfirmationDialog: React.FC<CustomConfirmationDialogProps> = ({
  customIcon,
  customType = 'question',
  ...props
}) => (
  <ConfirmationDialog
    {...props}
    type={customType}
    icon={customIcon}
  />
)

ConfirmationDialog.displayName = 'ConfirmationDialog'
DeleteAppointmentDialog.displayName = 'DeleteAppointmentDialog'
CompleteAppointmentDialog.displayName = 'CompleteAppointmentDialog'
CustomConfirmationDialog.displayName = 'CustomConfirmationDialog'
