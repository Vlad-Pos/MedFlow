import { useMemo } from 'react'
import { useRole } from './useRole'
import type { Permission } from '../types/auth'

/**
 * Hook for granular permission checking
 * Provides high-performance permission validation with caching
 */
export function usePermissions() {
  const { checkPermission, canManage, canRead, canWrite, canDelete } = useRole()

  // Memoized permission checks for common resources
  const permissions = useMemo(() => ({
    // User permissions
    users: {
      canRead: canRead('users', 'all'),
      canWrite: canWrite('users', 'all'),
      canDelete: canDelete('users', 'all'),
      canManage: canManage('users'),
    },
    
    // Analytics permissions
    analytics: {
      canRead: canRead('analytics', 'all'),
      canWrite: canWrite('analytics', 'all'),
      canDelete: canDelete('analytics', 'all'),
      canManage: canManage('analytics'),
    },
    
    // Settings permissions
    settings: {
      canRead: canRead('settings', 'all'),
      canWrite: canWrite('settings', 'all'),
      canDelete: canDelete('settings', 'all'),
      canManage: canManage('settings'),
    },
    
    // Reports permissions
    reports: {
      canRead: canRead('reports', 'all'),
      canWrite: canWrite('reports', 'all'),
      canDelete: canDelete('reports', 'all'),
      canManage: canManage('reports'),
      canReadOwn: canRead('reports', 'own'),
      canWriteOwn: canWrite('reports', 'own'),
    },
    
    // Appointments permissions
    appointments: {
      canRead: canRead('appointments', 'all'),
      canWrite: canWrite('appointments', 'all'),
      canDelete: canDelete('appointments', 'all'),
      canManage: canManage('appointments'),
      canReadOwn: canRead('appointments', 'own'),
      canWriteOwn: canWrite('appointments', 'own'),
    },
    
    // Patients permissions
    patients: {
      canRead: canRead('patients', 'all'),
      canWrite: canWrite('patients', 'all'),
      canDelete: canDelete('patients', 'all'),
      canManage: canManage('patients'),
      canReadOwn: canRead('patients', 'own'),
      canWriteOwn: canWrite('patients', 'own'),
    },
  }), [canRead, canWrite, canDelete, canManage])

  // Generic permission checker
  const hasPermission = useMemo(
    () => (resource: Permission['resource'], action: Permission['action'], scope: Permission['scope'] = 'own') => {
      return checkPermission(resource, action, scope)
    },
    [checkPermission]
  )

  // Permission-based component rendering helpers
  const renderIf = useMemo(
    () => (permission: boolean, component: React.ReactNode, fallback?: React.ReactNode) => {
      return permission ? component : fallback || null
    },
    []
  )

  const renderWithPermission = useMemo(
    () => (
      resource: Permission['resource'],
      action: Permission['action'],
      scope: Permission['scope'] = 'own',
      component: React.ReactNode,
      fallback?: React.ReactNode
    ) => {
      return hasPermission(resource, action, scope) ? component : fallback || null
    },
    [hasPermission]
  )

  // Permission-based access control for routes
  const routeAccess = useMemo(() => ({
    // Admin routes
    adminDashboard: permissions.users.canRead || permissions.analytics.canRead,
    userManagement: permissions.users.canManage,
    analytics: permissions.analytics.canRead,
    settings: permissions.settings.canRead,
    reports: permissions.reports.canRead,
    
    // User routes
    appointments: permissions.appointments.canReadOwn || permissions.appointments.canRead,
    patients: permissions.patients.canReadOwn || permissions.patients.canRead,
    ownReports: permissions.reports.canReadOwn,
  }), [permissions])

  return {
    permissions,
    hasPermission,
    renderIf,
    renderWithPermission,
    routeAccess,
  }
}
