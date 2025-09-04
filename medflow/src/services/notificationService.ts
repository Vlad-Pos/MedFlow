/**
 * Notification Service for MedFlow
 * 
 * This service provides a bridge between the old showNotification API and the new context-based system.
 * It can be used by both React components (via useNotification hook) and service files.
 */

// Global notification callback - will be set by the NotificationProvider
let globalNotificationCallback: ((type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string, duration?: number) => void) | null = null

/**
 * Set the global notification callback
 * This is called by the NotificationProvider to establish the connection
 */
export function setGlobalNotificationCallback(
  callback: (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string, duration?: number) => void
) {
  globalNotificationCallback = callback
}

/**
 * Clear the global notification callback
 * This is called when the NotificationProvider unmounts
 */
export function clearGlobalNotificationCallback() {
  globalNotificationCallback = null
}

/**
 * Legacy showNotification API for service files
 * This maintains backward compatibility while using the new context system
 */
export const showNotification = {
  success: (title: string, message?: string, duration?: number) => {
    if (globalNotificationCallback) {
      globalNotificationCallback('success', title, message, duration)
    } else {
      console.warn('showNotification.success called before NotificationProvider is mounted')
    }
  },
  error: (title: string, message?: string, duration?: number) => {
    if (globalNotificationCallback) {
      globalNotificationCallback('error', title, message, duration)
    } else {
      console.warn('showNotification.error called before NotificationProvider is mounted')
    }
  },
  warning: (title: string, message?: string, duration?: number) => {
    if (globalNotificationCallback) {
      globalNotificationCallback('warning', title, message, duration)
    } else {
      console.warn('showNotification.warning called before NotificationProvider is mounted')
    }
  },
  info: (title: string, message?: string, duration?: number) => {
    if (globalNotificationCallback) {
      globalNotificationCallback('info', title, message, duration)
    } else {
      console.warn('showNotification.info called before NotificationProvider is mounted')
    }
  }
}

/**
 * Check if the notification system is available
 */
export function isNotificationSystemAvailable(): boolean {
  return globalNotificationCallback !== null
}
