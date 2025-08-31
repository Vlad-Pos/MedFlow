import React from 'react'
import { AnalyticsDashboard } from '../components/admin/AnalyticsDashboard'
import { RoleProtection } from '../components/auth/RoleProtection'

/**
 * Secure Analytics Page
 * 
 * This page provides access to the analytics dashboard with strict role-based access control.
 * Only ADMIN users can access this page.
 * 
 * Features:
 * - Role-based access control
 * - Automatic redirect for unauthorized users
 * - Integration with existing AnalyticsDashboard component
 * - Audit logging for access attempts
 */
export default function SecureAnalytics() {
  return (
    <RoleProtection 
      requiredRole="ADMIN"
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold text-[var(--medflow-text-primary)] mb-2">Access Restricted</h1>
            <p className="text-[var(--medflow-text-tertiary)] mb-4">
              You need administrator privileges to access analytics.
            </p>
            <div className="text-sm text-[var(--medflow-text-muted)]">
              Contact your system administrator for access.
            </div>
          </div>
        </div>
      }
    >
      <AnalyticsDashboard />
    </RoleProtection>
  )
}
