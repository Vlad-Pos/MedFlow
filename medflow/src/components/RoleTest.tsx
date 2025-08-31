import React from 'react'
import { useRole } from '../hooks/useRole'
import { usePermissions } from '../hooks/usePermissions'
import { RoleProtection, AdminOnly } from './auth/RoleProtection'

/**
 * Test Component for RBAC System
 * Demonstrates role-based access control functionality
 */
export function RoleTest() {
  const { role, isAuthenticated, isAdmin, isUser } = useRole()
  const { permissions, hasPermission } = usePermissions()

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">RBAC System Test</h1>
      
      {/* Current User Status */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Current User Status</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Role:</strong> {role || 'None'}</p>
            <p><strong>Is Admin:</strong> {isAdmin ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Is User:</strong> {isUser ? '✅ Yes' : '❌ No'}</p>
          </div>
          <div>
            <p><strong>Can Manage Users:</strong> {permissions.users.canManage ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Can View Analytics:</strong> {permissions.analytics.canRead ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Can Manage Settings:</strong> {permissions.settings.canManage ? '✅ Yes' : '❌ No'}</p>
          </div>
        </div>
      </div>

      {/* Role Protection Tests */}
      <div className="space-y-6">
        {/* Admin Only */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Admin Only Content</h3>
          <AdminOnly>
            <div className="bg-blue-100 p-4 rounded border border-blue-300">
              <p className="text-blue-800">🔧 This content is only visible to Admins!</p>
              <p className="text-blue-700 text-sm mt-2">
                You can manage users, view analytics, and access administrative features.
              </p>
            </div>
          </AdminOnly>
        </div>

        {/* Permission-Based Content */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Permission-Based Content</h3>
          
          {permissions.users.canRead && (
            <div className="bg-green-100 p-4 rounded border border-green-300 mb-4">
              <p className="text-green-800">👥 You can read user data!</p>
            </div>
          )}

          {permissions.analytics.canRead && (
            <div className="bg-green-100 p-4 rounded border border-green-300 mb-4">
              <p className="text-green-800">📊 You can view analytics!</p>
            </div>
          )}

          {permissions.settings.canManage && (
            <div className="bg-green-100 p-4 rounded border border-green-300 mb-4">
              <p className="text-green-800">⚙️ You can manage system settings!</p>
            </div>
          )}

          {hasPermission('reports', 'read', 'own') && (
            <div className="bg-green-100 p-4 rounded border border-green-300 mb-4">
              <p className="text-green-800">📋 You can read your own reports!</p>
            </div>
          )}
        </div>

        {/* Conditional Rendering */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Conditional Rendering</h3>
          
          <RoleProtection requiredRole="ADMIN" showAccessDenied={false}>
            <div className="bg-yellow-100 p-4 rounded border border-yellow-300 mb-4">
              <p className="text-yellow-800">🔄 This content is conditionally rendered for admins (no access denied message)</p>
            </div>
          </RoleProtection>

          <RoleProtection requiredRole="USER" showAccessDenied={false}>
            <div className="bg-gray-100 p-4 rounded border border-gray-300 mb-4">
              <p className="text-gray-800">👤 This content is conditionally rendered for all users</p>
            </div>
          </RoleProtection>
        </div>

        {/* Permission Testing */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Permission Testing</h3>
          
          <div className="space-y-2">
            <p><strong>Can read users:</strong> {hasPermission('users', 'read', 'all') ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Can write users:</strong> {hasPermission('users', 'write', 'all') ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Can manage users:</strong> {hasPermission('users', 'manage', 'all') ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Can read own reports:</strong> {hasPermission('reports', 'read', 'own') ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Can read all reports:</strong> {hasPermission('reports', 'read', 'all') ? '✅ Yes' : '❌ No'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
