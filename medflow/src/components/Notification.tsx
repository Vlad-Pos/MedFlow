import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  X 
} from 'lucide-react'
import { notificationVariants } from '../utils/animations'
import DesignWorkWrapper from '../../DesignWorkWrapper'

export interface NotificationProps {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  onClose?: (id: string) => void
}

const notificationStyles = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    textColor: 'text-green-800 dark:text-green-200',
    iconColor: 'text-green-600 dark:text-green-400'
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    textColor: 'text-red-800 dark:text-red-200',
    iconColor: 'text-red-600 dark:text-red-400'
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    textColor: 'text-yellow-800 dark:text-yellow-200',
    iconColor: 'text-yellow-600 dark:text-yellow-400'
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    textColor: 'text-blue-800 dark:text-blue-200',
    iconColor: 'text-blue-600 dark:text-blue-400'
  }
}

export default function Notification({ 
  id, 
  type, 
  title, 
  message, 
  duration = 5000, 
  onClose 
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true)
  const styles = notificationStyles[type]
  const Icon = styles.icon

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => onClose?.(id), 300)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, id, onClose])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose?.(id), 300)
  }

  return (
    <DesignWorkWrapper componentName="Notification">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            variants={notificationVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`
              fixed top-4 right-4 z-50 max-w-sm w-full
              border rounded-lg shadow-lg backdrop-blur-sm
              ${styles.bgColor} ${styles.borderColor}
            `}
            role="alert"
            aria-live="assertive"
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: 'spring',
                    stiffness: 200,
                    damping: 15,
                    delay: 0.1
                  }}
                  className={`flex-shrink-0 ${styles.iconColor}`}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </motion.div>
                
                <div className="flex-1 min-w-0">
                  <motion.h4
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`text-sm font-medium ${styles.textColor}`}
                  >
                    {title}
                  </motion.h4>
                  
                  {message && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className={`mt-1 text-sm ${styles.textColor} opacity-90`}
                    >
                      {message}
                    </motion.p>
                  )}
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleClose}
                  className={`
                    flex-shrink-0 p-1 rounded-md
                    hover:bg-black/5 dark:hover:bg-white/5
                    focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${styles.textColor}
                  `}
                  aria-label="Închide notificarea"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </DesignWorkWrapper>
  )
}

// Notification container to manage multiple notifications
export function NotificationContainer() {
  const [notifications, setNotifications] = useState<NotificationProps[]>([])

  const addNotification = (notification: Omit<NotificationProps, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    setNotifications(prev => [...prev, { ...notification, id }])
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  // Expose addNotification globally
  useEffect(() => {
    ;(window as any).addNotification = addNotification
    return () => {
      delete (window as any).addNotification
    }
  }, [])

  return (
    <DesignWorkWrapper componentName="NotificationContainer">
      <div className="fixed top-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {notifications.map((notification) => (
            <Notification
              key={notification.id}
              {...notification}
              onClose={removeNotification}
            />
          ))}
        </AnimatePresence>
      </div>
    </DesignWorkWrapper>
  )
}

// Utility functions for easy notification creation
export const showNotification = {
  success: (title: string, message?: string, duration?: number) => {
    ;(window as any).addNotification?.({
      type: 'success',
      title,
      message,
      duration
    })
  },
  error: (title: string, message?: string, duration?: number) => {
    ;(window as any).addNotification?.({
      type: 'error',
      title,
      message,
      duration
    })
  },
  warning: (title: string, message?: string, duration?: number) => {
    ;(window as any).addNotification?.({
      type: 'warning',
      title,
      message,
      duration
    })
  },
  info: (title: string, message?: string, duration?: number) => {
    ;(window as any).addNotification?.({
      type: 'info',
      title,
      message,
      duration
    })
  }
}

