/**
 * Appointment Info Modal Component for MedFlow
 * 
 * Displays appointment information when an appointment card is clicked
 * Contains edit and delete buttons that trigger the appropriate actions
 * 
 * @author MedFlow Team
 * @version 1.0
 */

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Edit, 
  Trash2, 
  User, 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle, 
  XCircle,
  AlertTriangle
} from 'lucide-react'
import { Appointment } from './AppointmentForm'

interface AppointmentInfoModalProps {
  isOpen: boolean
  appointment: Appointment | null
  onClose: () => void
  onEdit: (appointment: Appointment) => void
  onDelete: (appointment: Appointment) => void
  onComplete?: (appointment: Appointment) => void
}

export default function AppointmentInfoModal({
  isOpen,
  appointment,
  onClose,
  onEdit,
  onDelete,
  onComplete
}: AppointmentInfoModalProps) {
  if (!appointment) return null

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Programat'
      case 'completed': return 'Finalizat'
      case 'no_show': return 'Nu s-a prezentat'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-medflow-primary/10 text-medflow-primary border border-medflow-primary/20'
      case 'completed': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
      case 'no_show': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 border border-red-200 dark:border-red-800'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300 border border-gray-200 dark:border-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Clock className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'no_show': return <XCircle className="w-4 h-4" />
      default: return <AlertTriangle className="w-4 h-4" />
    }
  }

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('ro-RO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-medflow-primary/10 rounded-lg">
                    <Calendar className="w-6 h-6 text-medflow-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      Detalii Programare
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Informații complete despre programare
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                
                {/* Patient Information */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                    <User className="w-4 h-4 text-medflow-primary" />
                    <span>Informații Pacient</span>
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Nume:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {appointment.patientName}
                      </span>
                    </div>
                    {appointment.patientEmail && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Email:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {appointment.patientEmail}
                        </span>
                      </div>
                    )}
                    {appointment.patientPhone && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Telefon:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {appointment.patientPhone}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-medflow-primary" />
                    <span>Detalii Programare</span>
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Data și ora:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDateTime(appointment.dateTime)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {getStatusIcon(appointment.status)}
                        <span>{getStatusText(appointment.status)}</span>
                      </span>
                    </div>
                    {appointment.symptoms && (
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Simptome:</span>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                          {appointment.symptoms}
                        </p>
                      </div>
                    )}
                    {appointment.notes && (
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Note:</span>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                          {appointment.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                  
                  {/* Edit Button */}
                  <button
                    onClick={() => onEdit(appointment)}
                    className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-medflow-primary text-white rounded-lg hover:bg-medflow-primary/90 transition-colors shadow-md hover:shadow-lg"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Editează Programarea</span>
                  </button>

                  {/* Complete Button (only for scheduled appointments) */}
                  {appointment.status === 'scheduled' && onComplete && (
                    <button
                      onClick={() => onComplete(appointment)}
                      className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-md hover:shadow-lg"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Marchează ca Finalizat</span>
                    </button>
                  )}

                  {/* Delete Button */}
                  <button
                    onClick={() => onDelete(appointment)}
                    className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md hover:shadow-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Șterge Programarea</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
