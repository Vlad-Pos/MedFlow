import React, { createContext, useContext, useReducer, useCallback, ReactNode, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { setGlobalNotificationCallback, clearGlobalNotificationCallback } from '../services/notificationService'

// ==========================================
// TYPES
// ==========================================

export interface NotificationItem {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  createdAt: Date
}

interface NotificationState {
  notifications: NotificationItem[]
}

type NotificationAction =
  | { type: 'ADD_NOTIFICATION'; payload: NotificationItem }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_ALL_NOTIFICATIONS' }

// ==========================================
// CONTEXT
// ==========================================

interface NotificationContextType {
  notifications: NotificationItem[]
  addNotification: (notification: Omit<NotificationItem, 'id' | 'createdAt'>) => void
  removeNotification: (id: string) => void
  clearAllNotifications: () => void
  showSuccess: (title: string, message?: string, duration?: number) => void
  showError: (title: string, message?: string, duration?: number) => void
  showWarning: (title: string, message?: string, duration?: number) => void
  showInfo: (title: string, message?: string, duration?: number) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

// ==========================================
// REDUCER
// ==========================================

const notificationReducer = (state: NotificationState, action: NotificationAction): NotificationState => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      }
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      }
    case 'CLEAR_ALL_NOTIFICATIONS':
      return {
        ...state,
        notifications: []
      }
    default:
      return state
  }
}

// ==========================================
// PROVIDER
// ==========================================

interface NotificationProviderProps {
  children: ReactNode
  maxNotifications?: number
}

export function NotificationProvider({ 
  children, 
  maxNotifications = 5 
}: NotificationProviderProps) {
  const [state, dispatch] = useReducer(notificationReducer, {
    notifications: []
  })



  const addNotification = useCallback((notification: Omit<NotificationItem, 'id' | 'createdAt'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification: NotificationItem = {
      ...notification,
      id,
      createdAt: new Date()
    }

    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification })

    // Auto-remove after duration
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: id })
      }, notification.duration)
    }

    // Limit maximum notifications
    if (state.notifications.length >= maxNotifications) {
      const oldestNotification = state.notifications[0]
      if (oldestNotification) {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: oldestNotification.id })
      }
    }
  }, [maxNotifications, state.notifications.length])

  const removeNotification = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id })
  }, [])

  const clearAllNotifications = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL_NOTIFICATIONS' })
  }, [])

  // Convenience methods
  const showSuccess = useCallback((title: string, message?: string, duration?: number) => {
    addNotification({ type: 'success', title, message, duration })
  }, [addNotification])

  const showError = useCallback((title: string, message?: string, duration?: number) => {
    addNotification({ type: 'error', title, message, duration })
  }, [addNotification])

  const showWarning = useCallback((title: string, message?: string, duration?: number) => {
    addNotification({ type: 'warning', title, message, duration })
  }, [addNotification])

  const showInfo = useCallback((title: string, message?: string, duration?: number) => {
    addNotification({ type: 'info', title, message, duration })
  }, [addNotification])

  // Set up global notification callback for service files
  useEffect(() => {
    const callback = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string, duration?: number) => {
      switch (type) {
        case 'success':
          showSuccess(title, message, duration)
          break
        case 'error':
          showError(title, message, duration)
          break
        case 'warning':
          showWarning(title, message, duration)
          break
        case 'info':
          showInfo(title, message, duration)
          break
      }
    }
    
    setGlobalNotificationCallback(callback)
    
    return () => {
      clearGlobalNotificationCallback()
    }
  }, [showSuccess, showError, showWarning, showInfo])

  const contextValue: NotificationContextType = {
    notifications: state.notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  )
}

// ==========================================
// NOTIFICATION COMPONENT
// ==========================================

interface NotificationProps {
  notification: NotificationItem
  onClose: (id: string) => void
}

function Notification({ notification, onClose }: NotificationProps) {
  const [isVisible, setIsVisible] = React.useState(true)

  React.useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => onClose(notification.id), 300)
      }, notification.duration)
      return () => clearTimeout(timer)
    }
  }, [notification.duration, notification.id, onClose])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose(notification.id), 300)
  }

  const getNotificationStyles = (type: NotificationItem['type']) => {
    switch (type) {
      case 'success':
        return {
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-700',
          textColor: 'text-green-800 dark:text-green-200',
          iconColor: 'text-green-500'
        }
      case 'error':
        return {
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-700',
          textColor: 'text-red-800 dark:text-red-200',
          iconColor: 'text-red-500'
        }
      case 'warning':
        return {
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-700',
          textColor: 'text-yellow-800 dark:text-yellow-200',
          iconColor: 'text-yellow-500'
        }
      case 'info':
        return {
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-700',
          textColor: 'text-blue-800 dark:text-blue-200',
          iconColor: 'text-blue-500'
        }
      default:
        return {
                  bgColor: 'bg-[var(--medflow-surface-elevated)] dark:bg-[var(--medflow-surface-dark)]/20',
        borderColor: 'border-[var(--medflow-border)] dark:border-[var(--medflow-border)]',
        textColor: 'text-[var(--medflow-text-primary)] dark:text-[var(--medflow-text-secondary)]',
        iconColor: 'text-[var(--medflow-text-muted)]'
        }
    }
  }

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )
      case 'error':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
      case 'info':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        )
      default:
        return null
    }
  }

  const styles = getNotificationStyles(notification.type)

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.8 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`
            fixed top-4 right-4 z-50 max-w-sm w-full
            border rounded-lg shadow-lg backdrop-blur-sm
            ${styles.bgColor} ${styles.borderColor}
          `}
          role="alert"
          aria-live="assertive"
        >
          <div className="p-4">
            <div className="flex items-start">
              <div className={`flex-shrink-0 ${styles.iconColor}`}>
                {getIcon(notification.type)}
              </div>
              <div className="ml-3 flex-1">
                <h3 className={`text-sm font-medium ${styles.textColor}`}>
                  {notification.title}
                </h3>
                {notification.message && (
                  <p className={`mt-1 text-sm ${styles.textColor} opacity-90`}>
                    {notification.message}
                  </p>
                )}
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  onClick={handleClose}
                  className={`
                    inline-flex rounded-md p-1.5
                    ${styles.textColor} hover:opacity-75
                    focus:outline-none focus:ring-2 focus:ring-offset-2
                    focus:ring-offset-green-50 focus:ring-green-500
                  `}
                  aria-label="Close notification"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ==========================================
// NOTIFICATION CONTAINER
// ==========================================

function NotificationContainer() {
  const { notifications, removeNotification } = useNotification()

  if (!notifications.length) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
        />
      ))}
    </div>
  )
}

// ==========================================
// HOOK
// ==========================================

export function useNotification(): NotificationContextType {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}

// ==========================================
// LEGACY COMPATIBILITY
// ==========================================

// Maintain backward compatibility with existing code

