import React from 'react'
import { AdminDashboard } from '../components/admin/AdminDashboard'
import { RoleProtection } from '../components/auth/RoleProtection'

/**
 * Admin Page
 * Protected route for admin users only
 */
export default function Admin() {
  return (
    <RoleProtection requiredRole="ADMIN">
      <AdminDashboard />
    </RoleProtection>
  )
}
