/**
 * Enhanced Confirmation Dialog Component for MedFlow
 * 
 * Features:
 * - Professional medical styling with MedFlow branding
 * - Accessible with ARIA labels and keyboard navigation
 * - Smooth animations and transitions
 * - Customizable actions and content
 * - Romanian localization for medical professionals
 * 
 * @author MedFlow Team
 * @version 2.0
 */

import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Trash2, X, CheckCircle } from 'lucide-react'
interface ConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  type?: 'danger' | 'warning' | 'info'
  confirmText?: string
  cancelText?: string
  loading?: boolean
}

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'warning',
  confirmText = 'Confirmă',
  cancelText = 'Anulează',
  loading = false
}: ConfirmationDialogProps) {
  if (!isOpen) return null

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <Trash2 className="w-6 h-6 text-red-600" />,
          iconBg: 'bg-red-100 dark:bg-red-900/30',
          confirmBg: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
          borderColor: 'border-red-200 dark:border-red-800'
        }
      case 'warning':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-orange-600" />,
          iconBg: 'bg-orange-100 dark:bg-orange-900/30',
          confirmBg: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500',
          borderColor: 'border-orange-200 dark:border-orange-800'
        }
      case 'info':
        return {
          icon: <CheckCircle className="w-6 h-6 text-medflow-primary" />,
          iconBg: 'bg-medflow-primary/10',
          confirmBg: 'bg-medflow-primary hover:bg-medflow-secondary focus:ring-medflow-primary',
          borderColor: 'border-medflow-primary/20'
        }
      default:
        return {
          icon: <AlertTriangle className="w-6 h-6 text-orange-600" />,
          iconBg: 'bg-orange-100 dark:bg-orange-900/30',
          confirmBg: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500',
          borderColor: 'border-orange-200 dark:border-orange-800'
        }
    }
  }

  const typeStyles = getTypeStyles()

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'Enter' && !loading) {
      onConfirm()
    }
  }

  return (
    <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md shadow-2xl border ${typeStyles.borderColor}`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            aria-describedby="dialog-description"
          >
            {/* Header with Icon */}
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-full ${typeStyles.iconBg}`}>
                {typeStyles.icon}
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
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Închide dialogul"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end space-y-3 space-y-reverse sm:space-y-0 sm:space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className={`w-full sm:w-auto px-4 py-2 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${typeStyles.confirmBg}`}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Se procesează...</span>
                  </div>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
}

/**
 * Specialized confirmation dialogs for common medical actions
 */

interface DeleteAppointmentDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  patientName?: string
  loading?: boolean
}

export function DeleteAppointmentDialog({
  isOpen,
  onClose,
  onConfirm,
  patientName,
  loading = false
}: DeleteAppointmentDialogProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
        <ConfirmationDialog
          isOpen={isOpen}
          onClose={onClose}
          onConfirm={onConfirm}
          title="Ștergere programare"
          message={
            patientName
              ? `Sunteți sigur că doriți să ștergeți programarea pentru ${patientName}? Această acțiune nu poate fi anulată.`
              : 'Sunteți sigur că doriți să ștergeți această programare? Această acțiune nu poate fi anulată.'
          }
          type="danger"
          confirmText="Șterge programarea"
          cancelText="Anulează"
          loading={loading}
        />
      </AnimatePresence>
    )
}

interface CompleteAppointmentDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  patientName?: string
  loading?: boolean
}

export function CompleteAppointmentDialog({
  isOpen,
  onClose,
  onConfirm,
  patientName,
  loading = false
}: CompleteAppointmentDialogProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
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
          loading={loading}
        />
      </AnimatePresence>
    )
}
