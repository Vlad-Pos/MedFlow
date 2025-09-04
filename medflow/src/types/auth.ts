import type { User } from 'firebase/auth'

// Role hierarchy for MedFlow
export type UserRole = 'ADMIN' | 'USER'

// Legacy role types for backward compatibility (DEPRECATED - will be removed)
export type LegacyUserRole = 'doctor' | 'nurse' | 'admin' | 'patient'

// Role mapping for backward compatibility
export const LEGACY_ROLE_MAPPING: Record<LegacyUserRole, UserRole> = {
  'doctor': 'USER',      // Doctors become regular users with medical permissions
  'nurse': 'USER',       // Nurses become regular users with medical permissions
  'admin': 'ADMIN',      // Legacy admin becomes ADMIN
  'patient': 'USER'      // Patients become regular users with limited permissions
}

// Reverse mapping for display purposes
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  'ADMIN': 'Administrator',
  'USER': 'Medical Professional'
}

// Legacy role display names for backward compatibility
export const LEGACY_ROLE_DISPLAY_NAMES: Record<LegacyUserRole, string> = {
  'doctor': 'Doctor - Medic specialist/primar',
  'nurse': 'Asistent medical - Infirmier/ă',
  'admin': 'Administrator',
  'patient': 'Patient'
}

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
  // Legacy role field for backward compatibility (DEPRECATED)
  legacyRole?: LegacyUserRole
}

// Role-based permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    // Full admin access (replaces SUPER_ADMIN functionality)
    { resource: 'users', action: 'manage', scope: 'all' },
    { resource: 'analytics', action: 'manage', scope: 'all' },
    { resource: 'settings', action: 'manage', scope: 'all' },
    { resource: 'reports', action: 'manage', scope: 'all' },
    { resource: 'appointments', action: 'manage', scope: 'all' },
    { resource: 'patients', action: 'manage', scope: 'all' },
  ],
  USER: [
    // Regular app access with medical professional permissions
    { resource: 'appointments', action: 'read', scope: 'own' },
    { resource: 'appointments', action: 'write', scope: 'own' },
    { resource: 'patients', action: 'read', scope: 'own' },
    { resource: 'patients', action: 'write', scope: 'own' },
    { resource: 'reports', action: 'read', scope: 'own' },
    { resource: 'reports', action: 'write', scope: 'own' },
  ],
}

// Utility functions for role conversion
export const convertLegacyRole = (legacyRole: LegacyUserRole): UserRole => {
  return LEGACY_ROLE_MAPPING[legacyRole] || 'USER'
}

export const isLegacyRole = (role: string): role is LegacyUserRole => {
  return Object.keys(LEGACY_ROLE_MAPPING).includes(role)
}

export const getRoleDisplayName = (role: UserRole | LegacyUserRole): string => {
  if (isLegacyRole(role)) {
    return LEGACY_ROLE_DISPLAY_NAMES[role]
  }
  return ROLE_DISPLAY_NAMES[role]
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
