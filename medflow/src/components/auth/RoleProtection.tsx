import React from 'react'
import { useRole } from '../../hooks/useRole'
import { usePermissions } from '../../hooks/usePermissions'
import type { Permission } from '../../types/auth'

interface RoleProtectionProps {
  children: React.ReactNode
  requiredRole?: 'SUPER_ADMIN' | 'ADMIN' | 'USER'
  requiredPermission?: {
    resource: Permission['resource']
    action: Permission['action']
    scope?: Permission['scope']
  }
  fallback?: React.ReactNode
  showAccessDenied?: boolean
}

/**
 * Role Protection Component
 * Provides role-based and permission-based access control for components
 */
export function RoleProtection({
  children,
  requiredRole,
  requiredPermission,
  fallback,
  showAccessDenied = true
}: RoleProtectionProps) {
  const { role, isAuthenticated, isSuperAdmin, isAdmin, isUser } = useRole()
  const { hasPermission } = usePermissions()

  // Check if user is authenticated
  if (!isAuthenticated) {
    return fallback || (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-600 mb-4">Authentication Required</h2>
        <p className="text-gray-500">Please sign in to access this content.</p>
      </div>
    )
  }

  // Check role-based access
  if (requiredRole) {
    let hasRoleAccess = false

    switch (requiredRole) {
      case 'SUPER_ADMIN':
        hasRoleAccess = isSuperAdmin
        break
      case 'ADMIN':
        hasRoleAccess = isAdmin || isSuperAdmin
        break
      case 'USER':
        hasRoleAccess = isUser || isAdmin || isSuperAdmin
        break
    }

    if (!hasRoleAccess) {
      return fallback || (
        showAccessDenied ? (
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p className="text-gray-600">
              This content requires {requiredRole} role access.
              Your current role: {role || 'USER'}
            </p>
          </div>
        ) : null
      )
    }
  }

  // Check permission-based access
  if (requiredPermission) {
    const hasAccess = hasPermission(
      requiredPermission.resource,
      requiredPermission.action,
      requiredPermission.scope
    )

    if (!hasAccess) {
      return fallback || (
        showAccessDenied ? (
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p className="text-gray-600">
              You don't have permission to {requiredPermission.action} {requiredPermission.resource}.
            </p>
          </div>
        ) : null
      )
    }
  }

  // Access granted
  return <>{children}</>
}

// Convenience components for common role checks
export function SuperAdminOnly({ children, fallback, showAccessDenied }: Omit<RoleProtectionProps, 'requiredRole' | 'requiredPermission'>) {
  return (
    <RoleProtection requiredRole="SUPER_ADMIN" fallback={fallback} showAccessDenied={showAccessDenied}>
      {children}
    </RoleProtection>
  )
}

export function AdminOnly({ children, fallback, showAccessDenied }: Omit<RoleProtectionProps, 'requiredRole' | 'requiredPermission'>) {
  return (
    <RoleProtection requiredRole="ADMIN" fallback={fallback} showAccessDenied={showAccessDenied}>
      {children}
    </RoleProtection>
  )
}

export function AuthenticatedOnly({ children, fallback, showAccessDenied }: Omit<RoleProtectionProps, 'requiredRole' | 'requiredPermission'>) {
  return (
    <RoleProtection requiredRole="USER" fallback={fallback} showAccessDenied={showAccessDenied}>
      {children}
    </RoleProtection>
  )
}

// Permission-based components
export function WithPermission({
  children,
  resource,
  action,
  scope = 'own',
  fallback,
  showAccessDenied
}: {
  children: React.ReactNode
  resource: Permission['resource']
  action: Permission['action']
  scope?: Permission['scope']
  fallback?: React.ReactNode
  showAccessDenied?: boolean
}) {
  return (
    <RoleProtection
      requiredPermission={{ resource, action, scope }}
      fallback={fallback}
      showAccessDenied={showAccessDenied}
    >
      {children}
    </RoleProtection>
  )
}

// Conditional rendering components
export function RenderIfRole({
  children,
  requiredRole,
  fallback
}: {
  children: React.ReactNode
  requiredRole: 'SUPER_ADMIN' | 'ADMIN' | 'USER'
  fallback?: React.ReactNode
}) {
  return (
    <RoleProtection requiredRole={requiredRole} fallback={fallback} showAccessDenied={false}>
      {children}
    </RoleProtection>
  )
}

export function RenderIfPermission({
  children,
  resource,
  action,
  scope = 'own',
  fallback
}: {
  children: React.ReactNode
  resource: Permission['resource']
  action: Permission['action']
  scope?: Permission['scope']
  fallback?: React.ReactNode
}) {
  return (
    <RoleProtection
      requiredPermission={{ resource, action, scope }}
      fallback={fallback}
      showAccessDenied={false}
    >
      {children}
    </RoleProtection>
  )
}
