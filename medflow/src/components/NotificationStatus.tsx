/**
 * Notification Status Component for MedFlow
 * 
 * Displays the notification delivery status for appointments
 * with visual indicators and patient response tracking.
 * 
 * @author MedFlow Team
 * @version 1.0
 */

import { useState, } from 'react'
import { motion } from 'framer-motion'
import { 
  Bell, 
  Check, 
  X, 
  Clock, 
  Mail, 
  MessageSquare, 
  Smartphone,
  AlertTriangle,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import { AppointmentWithNotifications, } from '../types/notifications'
interface NotificationStatusProps {
  appointment: AppointmentWithNotifications
  className?: string
  compact?: boolean
}

const CHANNEL_ICONS = {
  email: Mail,
  sms: MessageSquare,
  in_app: Smartphone
}

const CHANNEL_COLORS = {
  email: 'blue',
  sms: 'green',
  in_app: 'purple'
}

const CHANNEL_NAMES = {
  email: 'Email',
  sms: 'SMS',
  in_app: 'În Aplicație'
}

export default function NotificationStatus({ 
  appointment, 
  className = '',
  compact = false 
}: NotificationStatusProps) {
  const [showDetails, setShowDetails] = useState(false)
  
  const notifications = appointment.notifications || {
    firstNotification: { sent: false },
    secondNotification: { sent: false },
    confirmationReceived: false,
    optedOut: false
  }
  
  // Calculate overall status
  const getOverallStatus = () => {
    if (notifications.optedOut) {
      return { 
        status: 'opted_out' as const, 
        label: 'Dezabonat', 
        color: 'gray',
        icon: XCircle
      }
    }
    
    if (notifications.confirmationReceived) {
      return { 
        status: 'confirmed' as const, 
        label: 'Confirmat', 
        color: 'green',
        icon: CheckCircle2
      }
    }
    
    const firstSent = notifications.firstNotification.sent
    const secondSent = notifications.secondNotification.sent
    
    if (secondSent) {
      return { 
        status: 'all_sent' as const, 
        label: 'Toate trimise', 
        color: 'blue',
        icon: Bell
      }
    }
    
    if (firstSent) {
      return { 
        status: 'partial_sent' as const, 
        label: 'Parțial trimise', 
        color: 'yellow',
        icon: Clock
      }
    }
    
    return { 
      status: 'pending' as const, 
      label: 'În așteptare', 
      color: 'gray',
      icon: Clock
    }
  }
  
  const overallStatus = getOverallStatus()
  
  // Render notification detail
  const renderNotificationDetail = (
    notification: typeof notifications.firstNotification,
    type: 'first' | 'second'
  ) => {
    const typeLabel = type === 'first' ? 'Prima reamintire' : 'A doua reamintire'
    const expectedTime = type === 'first' 
      ? 'cu o zi înainte (9:00 AM)'
      : 'în ziua programării (3:00 PM)'
    
    if (!notification.sent) {
      return (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <Clock className="w-4 h-4 text-gray-400 mr-2" />
            <div>
              <span className="text-sm font-medium text-gray-700">{typeLabel}</span>
              <p className="text-xs text-gray-500">{expectedTime}</p>
            </div>
          </div>
          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
            În așteptare
          </span>
        </div>
      )
    }
    
    const ChannelIcon = notification.channel ? CHANNEL_ICONS[notification.channel] : Bell
    const channelColor = notification.channel ? CHANNEL_COLORS[notification.channel] : 'gray'
    const channelName = notification.channel ? CHANNEL_NAMES[notification.channel] : 'Necunoscut'
    
    const statusColor = notification.deliveryStatus === 'delivered' ? 'green' : 
                       notification.deliveryStatus === 'failed' ? 'red' : 'yellow'
    
    const statusIcon = notification.deliveryStatus === 'delivered' ? Check :
                      notification.deliveryStatus === 'failed' ? X : Clock
    
    const StatusIcon = statusIcon
    
    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center">
          <ChannelIcon className={`w-4 h-4 text-${channelColor}-500 mr-2`} />
          <div>
            <span className="text-sm font-medium text-gray-700">{typeLabel}</span>
            <p className="text-xs text-gray-500">
              {channelName} • {notification.sentAt && 
                new Date(notification.sentAt.toDate()).toLocaleString('ro-RO')
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center">
          <StatusIcon className={`w-4 h-4 text-${statusColor}-500 mr-1`} />
          <span className={`text-xs text-${statusColor}-600 bg-${statusColor}-100 px-2 py-1 rounded`}>
            {notification.deliveryStatus === 'delivered' ? 'Trimis' :
             notification.deliveryStatus === 'failed' ? 'Eșuat' : 'În curs'}
          </span>
        </div>
      </div>
    )
  }
  
  if (compact) {
    return (
      <div className={`flex items-center ${className}`}>
        <overallStatus.icon className={`w-4 h-4 text-${overallStatus.color}-500 mr-2`} />
        <span className={`text-sm text-${overallStatus.color}-600`}>
          {overallStatus.label}
        </span>
      </div>
    )
  }
  
  return (
    <div className={`bg-white rounded-lg border ${className}`}>
        {/* Header */}
        <div 
          className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setShowDetails(!showDetails)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <overallStatus.icon className={`w-5 h-5 text-${overallStatus.color}-500 mr-3`} />
              <div>
                <h4 className="font-medium text-gray-900">Stare Notificări</h4>
                <p className="text-sm text-gray-600">{overallStatus.label}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {notifications.confirmationReceived && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  Confirmat {notifications.confirmationDate && 
                    new Date(notifications.confirmationDate.toDate()).toLocaleDateString('ro-RO')
                  }
                </span>
              )}
              
              <motion.div
                animate={{ rotate: showDetails ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </motion.div>
            </div>
          </div>
        </div>
        
        {/* Details */}
        <motion.div
          initial={false}
          animate={{ height: showDetails ? 'auto' : 0, opacity: showDetails ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="px-4 pb-4 space-y-3">
            {/* Patient Response Status */}
            {notifications.confirmationReceived ? (
              <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-500 mr-3" />
                <div>
                  <span className="text-sm font-medium text-green-800">
                    Pacientul a confirmat prezența
                  </span>
                  <p className="text-xs text-green-600">
                    Confirmat pe {notifications.confirmationDate && 
                      new Date(notifications.confirmationDate.toDate()).toLocaleString('ro-RO')
                    } prin {notifications.confirmationMethod || 'necunoscut'}
                  </p>
                </div>
              </div>
            ) : notifications.optedOut ? (
              <div className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <XCircle className="w-5 h-5 text-gray-500 mr-3" />
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Pacientul s-a dezabonat de la notificări
                  </span>
                  <p className="text-xs text-gray-500">
                    Dezabonat pe {notifications.optOutDate && 
                      new Date(notifications.optOutDate.toDate()).toLocaleDateString('ro-RO')
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-500 mr-3" />
                <div>
                  <span className="text-sm font-medium text-yellow-800">
                    În așteptarea confirmării pacientului
                  </span>
                  <p className="text-xs text-yellow-600">
                    Pacientul nu a răspuns încă la notificări
                  </p>
                </div>
              </div>
            )}
            
            {/* Notification Details */}
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-gray-700">Detalii Notificări:</h5>
              
              {renderNotificationDetail(notifications.firstNotification, 'first')}
              {renderNotificationDetail(notifications.secondNotification, 'second')}
            </div>
            
            {/* Error Messages */}
            {(notifications.firstNotification.errorMessage || notifications.secondNotification.errorMessage) && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start">
                  <AlertTriangle className="w-4 h-4 text-red-500 mr-2 mt-0.5" />
                  <div>
                    <span className="text-sm font-medium text-red-800">Erori de livrare:</span>
                    <ul className="text-xs text-red-600 mt-1 space-y-1">
                      {notifications.firstNotification.errorMessage && (
                        <li>• Prima reamintire: {notifications.firstNotification.errorMessage}</li>
                      )}
                      {notifications.secondNotification.errorMessage && (
                        <li>• A doua reamintire: {notifications.secondNotification.errorMessage}</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-2">
              <button
                className="text-xs text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded transition-colors"
                onClick={() => {
                  // TODO: Implement resend notification functionality
                  console.log('Resend notification for appointment:', appointment.id)
                }}
              >
                Retrimite Notificare
              </button>
              
              <button
                className="text-xs text-gray-600 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 px-3 py-1 rounded transition-colors"
                onClick={() => {
                  // TODO: Implement view notification logs functionality
                  console.log('View notification logs for appointment:', appointment.id)
                }}
              >
                Vezi Loguri
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )
}
