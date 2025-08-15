import type { User } from 'firebase/auth'

// Role hierarchy for MedFlow
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'USER'

// Permission system for granular access control
export interface Permission {
  resource: 'users' | 'analytics' | 'settings' | 'reports' | 'appointments' | 'patients'
  action: 'read' | 'write' | 'delete' | 'manage'
  scope: 'own' | 'all' | 'department'
}

// Extended user interface with RBAC
export interface AppUser extends User {
  role?: UserRole
  permissions?: Permission[]
  invitedBy?: string
  invitedAt?: Date
  // Maintain backward compatibility with existing fields
  verified?: boolean
  lastActivity?: Date
  aiPreferences?: {
    smartSuggestions: boolean
    autoComplete: boolean
    medicalAssistance: boolean
  }
}

// Role-based permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    // Full system control
    { resource: 'users', action: 'manage', scope: 'all' },
    { resource: 'analytics', action: 'manage', scope: 'all' },
    { resource: 'settings', action: 'manage', scope: 'all' },
    { resource: 'reports', action: 'manage', scope: 'all' },
    { resource: 'appointments', action: 'manage', scope: 'all' },
    { resource: 'patients', action: 'manage', scope: 'all' },
  ],
  ADMIN: [
    // Limited admin access
    { resource: 'users', action: 'read', scope: 'all' },
    { resource: 'users', action: 'write', scope: 'all' },
    { resource: 'analytics', action: 'read', scope: 'all' },
    { resource: 'settings', action: 'read', scope: 'all' },
    { resource: 'reports', action: 'read', scope: 'all' },
    { resource: 'reports', action: 'write', scope: 'all' },
    { resource: 'appointments', action: 'manage', scope: 'all' },
    { resource: 'patients', action: 'manage', scope: 'all' },
  ],
  USER: [
    // Regular app access
    { resource: 'appointments', action: 'read', scope: 'own' },
    { resource: 'appointments', action: 'write', scope: 'own' },
    { resource: 'patients', action: 'read', scope: 'own' },
    { resource: 'patients', action: 'write', scope: 'own' },
    { resource: 'reports', action: 'read', scope: 'own' },
  ],
}

// Permission checking utilities
export const hasPermission = (
  userRole: UserRole,
  resource: Permission['resource'],
  action: Permission['action'],
  scope: Permission['scope'] = 'own'
): boolean => {
  const permissions = ROLE_PERMISSIONS[userRole] || []
  return permissions.some(
    (permission) =>
      permission.resource === resource &&
      permission.action === action &&
      permission.scope === scope
  )
}

export const canManageResource = (
  userRole: UserRole,
  resource: Permission['resource']
): boolean => {
  return hasPermission(userRole, resource, 'manage', 'all')
}

export const canReadResource = (
  userRole: UserRole,
  resource: Permission['resource'],
  scope: Permission['scope'] = 'own'
): boolean => {
  return hasPermission(userRole, resource, 'read', scope)
}

export const canWriteResource = (
  userRole: UserRole,
  resource: Permission['resource'],
  scope: Permission['scope'] = 'own'
): boolean => {
  return hasPermission(userRole, resource, 'write', scope)
}

export const canDeleteResource = (
  userRole: UserRole,
  resource: Permission['resource'],
  scope: Permission['scope'] = 'own'
): boolean => {
  return hasPermission(userRole, resource, 'delete', scope)
}
