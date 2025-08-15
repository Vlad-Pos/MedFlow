import { ReactNode } from 'react'

export interface NotificationItem {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  createdAt: Date
}

export interface NotificationContextType {
  notifications: NotificationItem[]
  addNotification: (notification: Omit<NotificationItem, 'id' | 'createdAt'>) => void
  removeNotification: (id: string) => void
  clearAllNotifications: () => void
  showSuccess: (title: string, message?: string, duration?: number) => void
  showError: (title: string, message?: string, duration?: number) => void
  showWarning: (title: string, message?: string, duration?: number) => void
  showInfo: (title: string, message?: string, duration?: number) => void
}

export interface NotificationProviderProps {
  children: ReactNode
  maxNotifications?: number
}

export declare function NotificationProvider(props: NotificationProviderProps): JSX.Element
export declare function useNotification(): NotificationContextType


