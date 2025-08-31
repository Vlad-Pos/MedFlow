import React from 'react';
import { useAuth } from '../../providers/AuthProvider';
import { UserRole } from '../../types/auth';

interface RoleProtectionProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'USER';
  fallback?: React.ReactNode;
  showAccessDenied?: boolean;
}

/**
 * RoleProtection Component
 * 
 * Protects content based on user role requirements.
 * Only renders children if user has the required role.
 * 
 * @param children - Content to render if user has required role
 * @param requiredRole - Minimum role required to access content
 * @param fallback - Content to render if user doesn't have required role
 * @param showAccessDenied - Whether to show access denied message
 */
export const RoleProtection: React.FC<RoleProtectionProps> = ({
  children,
  requiredRole,
  fallback,
  showAccessDenied = false
}) => {
  const { user, initializing } = useAuth();

  // Show loading state while auth is initializing
  if (initializing) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--medflow-brand-1)]"></div>
      </div>
    );
  }

  // If no user is authenticated, show fallback or access denied
  if (!user) {
    if (showAccessDenied) {
      return (
        <div className="text-center p-6">
          <div className="text-red-600 text-lg font-semibold mb-2">
            Access Denied
          </div>
          <p className="text-gray-600">
            You must be signed in to access this content.
          </p>
        </div>
      );
    }
    return fallback || null;
  }

  // If no specific role is required, show children
  if (!requiredRole) {
    return <>{children}</>;
  }

  // Check if user has the required role
  const hasRequiredRole = (() => {
    switch (requiredRole) {
      case 'ADMIN':
        return user.role === 'ADMIN';
      case 'USER':
        return user.role === 'USER' || user.role === 'ADMIN';
      default:
        return false;
    }
  })();

  // If user has required role, show children
  if (hasRequiredRole) {
    return <>{children}</>;
  }

  // If user doesn't have required role, show fallback or access denied
  if (showAccessDenied) {
    return (
      <div className="text-center p-6">
        <div className="text-red-600 text-lg font-semibold mb-2">
          Access Denied
        </div>
        <p className="text-gray-600">
          You need {requiredRole} role to access this content.
          <br />
          Current role: {user.role}
        </p>
      </div>
    );
  }

  return fallback || null;
};

// Convenience components for common role requirements
export const AdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <RoleProtection requiredRole="ADMIN" fallback={fallback} showAccessDenied={true}>
    {children}
  </RoleProtection>
);

export const UserOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <RoleProtection requiredRole="USER" fallback={fallback} showAccessDenied={true}>
    {children}
  </RoleProtection>
);

// Higher-order component for role protection
export function withRoleProtection<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole: UserRole,
  fallback?: React.ReactNode
) {
  return function RoleProtectedComponent(props: P) {
    return (
      <RoleProtection requiredRole={requiredRole} fallback={fallback}>
        <Component {...props} />
      </RoleProtection>
    );
  };
}
