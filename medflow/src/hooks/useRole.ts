import { useMemo } from 'react'
import { useAuth } from '../providers/AuthProvider'
import type { UserRole, Permission } from '../types/auth'
import {
  hasPermission,
  canManageResource,
  canReadResource,
  canWriteResource,
  canDeleteResource,
} from '../types/auth'

/**
 * Hook for role-based access control
 * Provides role checking and permission validation with high-performance caching
 */
export function useRole() {
  const { user } = useAuth()

  // Memoized role and permission data for performance
  const roleData = useMemo(() => {
    if (!user) {
      return {
        role: undefined,
        permissions: [],
        isAuthenticated: false,
        isSuperAdmin: false,
        isAdmin: false,
        isUser: false,
      }
    }

    const role = user.role || 'USER'
    const permissions = user.permissions || []

    return {
      role,
      permissions,
      isAuthenticated: true,
      isSuperAdmin: role === 'SUPER_ADMIN',
      isAdmin: role === 'ADMIN' || role === 'SUPER_ADMIN',
      isUser: role === 'USER' || role === 'ADMIN' || role === 'SUPER_ADMIN',
    }
  }, [user])

  // Permission checking functions with memoization
  const checkPermission = useMemo(
    () => (resource: Permission['resource'], action: Permission['action'], scope: Permission['scope'] = 'own') => {
      if (!roleData.isAuthenticated) return false
      return hasPermission(roleData.role as UserRole, resource, action, scope)
    },
    [roleData.isAuthenticated, roleData.role]
  )

  const canManage = useMemo(
    () => (resource: Permission['resource']) => {
      if (!roleData.isAuthenticated) return false
      return canManageResource(roleData.role as UserRole, resource)
    },
    [roleData.isAuthenticated, roleData.role]
  )

  const canRead = useMemo(
    () => (resource: Permission['resource'], scope: Permission['scope'] = 'own') => {
      if (!roleData.isAuthenticated) return false
      return canReadResource(roleData.role as UserRole, resource, scope)
    },
    [roleData.isAuthenticated, roleData.role]
  )

  const canWrite = useMemo(
    () => (resource: Permission['resource'], scope: Permission['scope'] = 'own') => {
      if (!roleData.isAuthenticated) return false
      return canWriteResource(roleData.role as UserRole, resource, scope)
    },
    [roleData.isAuthenticated, roleData.role]
  )

  const canDelete = useMemo(
    () => (resource: Permission['resource'], scope: Permission['scope'] = 'own') => {
      if (!roleData.isAuthenticated) return false
      return canDeleteResource(roleData.role as UserRole, resource, scope)
    },
    [roleData.isAuthenticated, roleData.role]
  )

  // Role-based access control for specific features
  const featureAccess = useMemo(() => ({
    // User management
    canManageUsers: canManage('users'),
    canViewUsers: canRead('users', 'all'),
    canCreateUsers: canWrite('users', 'all'),
    canDeleteUsers: canDelete('users', 'all'),

    // Analytics
    canViewAnalytics: canRead('analytics', 'all'),
    canManageAnalytics: canManage('analytics'),

    // Settings
    canViewSettings: canRead('settings', 'all'),
    canManageSettings: canManage('settings'),

    // Reports
    canViewReports: canRead('reports', 'all'),
    canCreateReports: canWrite('reports', 'all'),
    canManageReports: canManage('reports'),

    // Appointments
    canViewAllAppointments: canRead('appointments', 'all'),
    canManageAppointments: canManage('appointments'),
    canViewOwnAppointments: canRead('appointments', 'own'),

    // Patients
    canViewAllPatients: canRead('patients', 'all'),
    canManagePatients: canManage('patients'),
    canViewOwnPatients: canRead('patients', 'own'),
  }), [canManage, canRead, canWrite, canDelete])

  return {
    ...roleData,
    checkPermission,
    canManage,
    canRead,
    canWrite,
    canDelete,
    featureAccess,
  }
}
