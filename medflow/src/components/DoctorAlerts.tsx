/**
 * Doctor Alerts Component for MedFlow
 * 
 * Displays patient flagging alerts and other important notifications
 * for doctors with real-time updates and Romanian localization.
 * 
 * @author MedFlow Team
 * @version 1.0
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  AlertTriangle, 
  User, 
  Clock, 
  Check, 
  Eye,
  Flag,
  Calendar,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { DoctorAlert } from '../types/patientFlagging'
import PatientFlaggingService from '../services/patientFlagging'
import LoadingSpinner from './LoadingSpinner'
import { MedFlowLoader } from './ui'
import { useAuth } from '../providers/AuthProvider'
import { formatDistanceToNow } from 'date-fns'
import { ro } from 'date-fns/locale'
import { Timestamp } from 'firebase/firestore'
interface DoctorAlertsProps {
  className?: string
  showUnreadOnly?: boolean
  maxItems?: number
  compact?: boolean
}

export default function DoctorAlerts({ 
  className = '',
  showUnreadOnly = false,
  maxItems = 10,
  compact = false
}: DoctorAlertsProps) {
  const { user } = useAuth()
  const [alerts, setAlerts] = useState<DoctorAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null)
  
  // Load alerts on component mount and when dependencies change
  useEffect(() => {
    if (user?.uid) {
      loadAlerts()
    }
  }, [user?.uid, showUnreadOnly])
  
  /**
   * Load doctor alerts from the service
   */
  const loadAlerts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const alertsData = await PatientFlaggingService.getDoctorAlerts(
        user!.uid,
        showUnreadOnly
      )
      
      // Limit results if specified
      const limitedAlerts = maxItems ? alertsData.slice(0, maxItems) : alertsData
      setAlerts(limitedAlerts)
    } catch (error) {
      console.error('Error loading doctor alerts:', error)
      setError('Nu s-au putut încărca alertele')
    } finally {
      setLoading(false)
    }
  }
  
  /**
   * Mark alert as read
   */
  const handleMarkAsRead = async (alertId: string) => {
    try {
      await PatientFlaggingService.markAlertAsRead(alertId)
      
      // Update local state
      setAlerts(prev => prev.map(alert =>
        alert.id === alertId
          ? { ...alert, read: true, readAt: Timestamp.now() }
          : alert
      ))
    } catch (error) {
      console.error('Error marking alert as read:', error)
    }
  }
  
  /**
   * Get alert icon based on type and severity
   */
  const getAlertIcon = (alert: DoctorAlert) => {
    switch (alert.type) {
      case 'patient_flagged':
        return <Flag className="w-5 h-5" />
      case 'high_risk_patient':
        return <AlertTriangle className="w-5 h-5" />
      case 'repeated_offender':
        return <User className="w-5 h-5" />
      default:
        return <Bell className="w-5 h-5" />
    }
  }
  
  /**
   * Get alert color classes based on severity
   */
  const getAlertColors = (alert: DoctorAlert) => {
    const baseColors = {
      info: 'bg-blue-50 border-blue-200 text-blue-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      urgent: 'bg-red-50 border-red-200 text-red-800'
    }
    
    const iconColors = {
      info: 'text-blue-600',
      warning: 'text-yellow-600',
      urgent: 'text-red-600'
    }
    
    return {
      container: baseColors[alert.severity],
      icon: iconColors[alert.severity]
    }
  }
  
  /**
   * Format relative time in Romanian
   */
  const formatTimeAgo = (date: Date) => {
    return formatDistanceToNow(date, { 
      locale: ro, 
      addSuffix: true 
    })
  }
  
  /**
   * Render loading state
   */
  if (loading) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
                                         <MedFlowLoader size="sm" />
        <span className="text-gray-600">Se încarcă alertele...</span>
      </div>
    )
  }
  
  /**
   * Render error state
   */
  if (error) {
    return (
      <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    )
  }
  
  /**
   * Render empty state
   */
  if (alerts.length === 0) {
    return (
      <div className={`text-center p-6 ${className}`}>
        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-gray-600 font-medium mb-1">
          {showUnreadOnly ? 'Nu aveți alerte necitite' : 'Nu aveți alerte'}
        </h3>
        <p className="text-gray-500 text-sm">
          Veți fi notificat când apar probleme cu pacienții
        </p>
      </div>
    )
  }
  
  /**
   * Render compact view for dashboard widgets
   */
  if (compact) {
    return (
      <div className={`space-y-2 ${className}`}>
        {alerts.map((alert) => {
          const colors = getAlertColors(alert)
          
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 border rounded-lg cursor-pointer hover:shadow-sm transition-shadow ${colors.container} ${
                !alert.read ? 'border-l-4' : ''
              }`}
              onClick={() => handleMarkAsRead(alert.id)}
            >
              <div className="flex items-start space-x-3">
                <div className={colors.icon}>
                  {getAlertIcon(alert)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">
                    {alert.title}
                  </h4>
                  <p className="text-xs mt-1 line-clamp-2">
                    {alert.message}
                  </p>
                  <span className="text-xs opacity-75 mt-2 block">
                    {formatTimeAgo(alert.createdAt.toDate())}
                  </span>
                </div>
                
                {!alert.read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    )
  }
  
  /**
   * Render full alert list
   */
  return (
    <div className={`space-y-3 ${className}`}>
      <AnimatePresence>
        {alerts.map((alert) => {
          const colors = getAlertColors(alert)
          const isExpanded = expandedAlert === alert.id
          
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`border rounded-lg overflow-hidden ${colors.container} ${
                !alert.read ? 'border-l-4 border-l-blue-500' : ''
              }`}
            >
              {/* Alert Header */}
              <div 
                className="p-4 cursor-pointer hover:bg-black/5 transition-colors"
                onClick={() => setExpandedAlert(isExpanded ? null : alert.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className={colors.icon}>
                      {getAlertIcon(alert)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-sm">
                          {alert.title}
                        </h4>
                        
                        {!alert.read && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Nou
                          </span>
                        )}
                        
                        {alert.requiresAction && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            Acțiune necesară
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm mb-2">
                        {alert.message}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs opacity-75">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTimeAgo(alert.createdAt.toDate())}
                        </span>
                        
                        {alert.patientName && (
                          <span className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {alert.patientName}
                          </span>
                        )}
                        
                        {alert.actionDeadline && (
                          <span className="flex items-center text-orange-600">
                            <Calendar className="w-3 h-3 mr-1" />
                            Termen: {alert.actionDeadline?.toDate().toLocaleDateString('ro-RO')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {!alert.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMarkAsRead(alert.id)
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Marchează ca citit"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    
                    <div className="text-gray-400">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-black/10"
                  >
                    <div className="p-4">
                      {/* Alert Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h5 className="font-medium text-sm mb-2">Detalii Alert:</h5>
                          <dl className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <dt className="text-gray-600">Tip:</dt>
                              <dd className="font-medium">{alert.type}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-gray-600">Severitate:</dt>
                              <dd className="font-medium">{alert.severity}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-gray-600">Status:</dt>
                              <dd className={`font-medium ${alert.read ? 'text-green-600' : 'text-orange-600'}`}>
                                {alert.read ? 'Citit' : 'Necitit'}
                              </dd>
                            </div>
                          </dl>
                        </div>
                        
                        {alert.patientId && (
                          <div>
                            <h5 className="font-medium text-sm mb-2">Informații Pacient:</h5>
                            <dl className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <dt className="text-gray-600">Nume:</dt>
                                <dd className="font-medium">{alert.patientName}</dd>
                              </div>
                              {alert.appointmentId && (
                                <div className="flex justify-between">
                                  <dt className="text-gray-600">Programare:</dt>
                                  <dd className="font-medium text-blue-600">#{alert.appointmentId.slice(-8)}</dd>
                                </div>
                              )}
                            </dl>
                          </div>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex justify-end space-x-3">
                        {!alert.read && (
                          <button
                            onClick={() => handleMarkAsRead(alert.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Marchează ca citit
                          </button>
                        )}
                        
                        {alert.patientId && (
                          <button
                            onClick={() => {
                              // TODO: Navigate to patient details
                              console.log('View patient details:', alert.patientId)
                            }}
                            className="inline-flex items-center px-3 py-1.5 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                          >
                            <User className="w-4 h-4 mr-1" />
                            Vezi Pacientul
                          </button>
                        )}
                        
                        {alert.flagId && (
                          <button
                            onClick={() => {
                              // TODO: Navigate to flag details
                              console.log('View flag details:', alert.flagId)
                            }}
                            className="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                          >
                            <Flag className="w-4 h-4 mr-1" />
                            Vezi Semnalizarea
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </AnimatePresence>
      
      {/* Load More Button */}
      {alerts.length >= maxItems && (
        <div className="text-center pt-4">
          <button
            onClick={loadAlerts}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Încarcă mai multe alerte
          </button>
        </div>
      )}
      </div>
    )
}
