import React, { useState, useEffect } from 'react'
import { useRole } from '../../hooks/useRole'
import { usePermissions } from '../../hooks/usePermissions'
import { useInvitations } from '../../hooks/useInvitations'
import { RoleService } from '../../services/roleService'
import type { UserRole } from '../../types/auth'
import type { CreateInvitationRequest } from '../../types/invitations'

/**
 * Admin Dashboard Component
 * Provides comprehensive admin functionality for user and invitation management
 */
export function AdminDashboard() {
  const { isAdmin, isSuperAdmin } = useRole()
  const { permissions } = usePermissions()
  const { 
    invitations, 
    stats, 
    loading, 
    error,
    createInvitation,
    cancelInvitation,
    deleteInvitation,
    resendInvitation,
    clearError
  } = useInvitations()

  const [users, setUsers] = useState<any[]>([])
  const [selectedTab, setSelectedTab] = useState<'overview' | 'users' | 'invitations'>('overview')
  const [invitationForm, setInvitationForm] = useState<CreateInvitationRequest>({
    email: '',
    role: 'ADMIN',
    expiration: '24h'
  })

  // Debug logging for role access
  console.log('AdminDashboard Debug:', {
    isAdmin,
    isSuperAdmin,
    permissions,
    userRole: permissions
  })

  // Load users on component mount
  useEffect(() => {
    // SUPER_ADMIN can always access, or if we have user read permissions
    if (isSuperAdmin || permissions.users?.canRead) {
      loadUsers()
    }
  }, [isSuperAdmin, permissions.users?.canRead])

  const loadUsers = async () => {
    try {
      const allUsers = await RoleService.getAllUsers()
      setUsers(allUsers)
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!invitationForm.email.trim()) {
      return
    }

    const newInvitation = await createInvitation(invitationForm)
    if (newInvitation) {
      setInvitationForm({
        email: '',
        role: 'ADMIN',
        expiration: '24h'
      })
    }
  }

  const handleRoleUpdate = async (userId: string, newRole: UserRole) => {
    try {
      await RoleService.updateUserRole(userId, newRole, 'current-user-id') // TODO: Get actual user ID
      await loadUsers() // Refresh user list
    } catch (error) {
      console.error('Error updating user role:', error)
    }
  }

  // Access control - SUPER_ADMIN bypasses all restrictions
  if (!isSuperAdmin && !isAdmin) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to access the admin dashboard.</p>
        <p className="text-sm text-gray-500 mt-2">Required: ADMIN or SUPER_ADMIN role</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-300">Manage your medical practice administration</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-red-700">{error}</p>
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mb-6 border-b border-[var(--medflow-border)]">
          <nav className="-mb-px flex space-x-8">
            {['overview', 'users', 'invitations'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                  selectedTab === tab
                    ? 'border-[var(--medflow-brand-1)] text-[var(--medflow-brand-1)]'
                    : 'border-transparent text-[var(--medflow-text-tertiary)] hover:text-[var(--medflow-text-primary)] hover:border-[var(--medflow-border)]'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {selectedTab === 'overview' && (
          <OverviewTab 
            stats={stats}
            permissions={permissions}
            isSuperAdmin={isSuperAdmin}
          />
        )}

        {selectedTab === 'users' && (isSuperAdmin || permissions.users?.canRead) && (
          <UsersTab 
            users={users}
            onRoleUpdate={handleRoleUpdate}
            canManageUsers={isSuperAdmin || permissions.users?.canManage}
            canUpdateRoles={isSuperAdmin || permissions.users?.canWrite}
          />
        )}

        {selectedTab === 'invitations' && (isSuperAdmin || permissions.users?.canWrite) && (
          <InvitationsTab 
            invitations={invitations}
            stats={stats}
            loading={loading}
            invitationForm={invitationForm}
            setInvitationForm={setInvitationForm}
            onCreateInvitation={handleCreateInvitation}
            onCancelInvitation={cancelInvitation}
            onDeleteInvitation={deleteInvitation}
            onResendInvitation={resendInvitation}
          />
        )}
      </div>
    </div>
  )
}

// Overview Tab Component
function OverviewTab({ 
  stats, 
  permissions, 
  isSuperAdmin 
}: { 
  stats: any
  permissions: any
  isSuperAdmin: boolean
}) {
  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[var(--medflow-surface-elevated)] p-6 rounded-lg shadow border border-[var(--medflow-border)]">
          <h3 className="text-lg font-medium text-[var(--medflow-text-primary)]">Total Invitations</h3>
          <p className="text-3xl font-bold text-[var(--medflow-brand-1)]">{stats.total}</p>
        </div>
        <div className="bg-[var(--medflow-surface-elevated)] p-6 rounded-lg shadow border border-[var(--medflow-border)]">
          <h3 className="text-lg font-medium text-[var(--medflow-text-primary)]">Pending</h3>
          <p className="text-3xl font-bold text-[var(--medflow-brand-2)]">{stats.pending}</p>
        </div>
        <div className="bg-[var(--medflow-surface-elevated)] p-6 rounded-lg shadow border border-[var(--medflow-border)]">
          <h3 className="text-lg font-medium text-[var(--medflow-text-primary)]">Accepted</h3>
          <p className="text-3xl font-bold text-[var(--medflow-brand-3)]">{stats.accepted}</p>
        </div>
        <div className="bg-[var(--medflow-surface-elevated)] p-6 rounded-lg shadow border border-[var(--medflow-border)]">
          <h3 className="text-lg font-medium text-[var(--medflow-text-primary)]">Expired</h3>
          <p className="text-3xl font-bold text-red-600">{stats.expired}</p>
        </div>
      </div>

      {/* Permission Summary */}
      <div className="bg-[var(--medflow-surface-elevated)] p-6 rounded-lg shadow border border-[var(--medflow-border)]">
        <h3 className="text-lg font-medium text-[var(--medflow-text-primary)] mb-4">Your Permissions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-[var(--medflow-text-secondary)] mb-2">User Management</h4>
            <ul className="space-y-1 text-sm text-[var(--medflow-text-tertiary)]">
              <li>• Read Users: {permissions.users.canRead ? '✅' : '❌'}</li>
              <li>• Write Users: {permissions.users.canWrite ? '✅' : '❌'}</li>
              <li>• Manage Users: {permissions.users.canManage ? '✅' : '❌'}</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-[var(--medflow-text-secondary)] mb-2">System Access</h4>
            <ul className="space-y-1 text-sm text-[var(--medflow-text-tertiary)]">
              <li>• Analytics: {permissions.analytics.canRead ? '✅' : '❌'}</li>
              <li>• Settings: {permissions.settings.canRead ? '✅' : '❌'}</li>
              <li>• Reports: {permissions.reports.canRead ? '✅' : '❌'}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Super Admin Features */}
      {isSuperAdmin && (
        <div className="bg-gradient-to-r from-[var(--medflow-brand-5)]/20 to-[var(--medflow-brand-4)]/20 p-6 rounded-lg border border-[var(--medflow-brand-1)]/30">
          <h3 className="text-lg font-medium text-[var(--medflow-brand-1)] mb-2">Super Admin Features</h3>
          <p className="text-[var(--medflow-text-secondary)]">
            You have full system access including user role management, system settings, and complete administrative control.
          </p>
        </div>
      )}
    </div>
  )
}

// Users Tab Component
function UsersTab({ 
  users, 
  onRoleUpdate, 
  canManageUsers, 
  canUpdateRoles 
}: { 
  users: any[]
  onRoleUpdate: (userId: string, newRole: UserRole) => Promise<void>
  canManageUsers: boolean
  canUpdateRoles: boolean
}) {
  if (!canManageUsers) {
    return (
      <div className="text-center py-8">
        <p className="text-[var(--medflow-text-tertiary)]">You don't have permission to view users.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-[var(--medflow-surface-elevated)] rounded-lg shadow border border-[var(--medflow-border)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--medflow-border)]">
          <h3 className="text-lg font-medium text-[var(--medflow-text-primary)]">User Management</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--medflow-border)]">
            <thead className="bg-[var(--medflow-surface-dark)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--medflow-text-tertiary)] uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--medflow-text-tertiary)] uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--medflow-text-tertiary)] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--medflow-text-tertiary)] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-[var(--medflow-surface-elevated)] divide-y divide-[var(--medflow-border)]">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-[var(--medflow-text-primary)]">
                        {user.displayName || 'No Name'}
                      </div>
                      <div className="text-sm text-[var(--medflow-text-tertiary)]">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'SUPER_ADMIN' ? 'bg-[var(--medflow-brand-1)]/20 text-[var(--medflow-brand-1)]' :
                      user.role === 'ADMIN' ? 'bg-[var(--medflow-brand-2)]/20 text-[var(--medflow-brand-2)]' :
                      'bg-[var(--medflow-surface-dark)] text-[var(--medflow-text-tertiary)]'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.verified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--medflow-text-tertiary)]">
                    {canUpdateRoles && (
                      <select
                        value={user.role}
                        onChange={(e) => onRoleUpdate(user.id, e.target.value as UserRole)}
                        className="text-sm border border-[var(--medflow-border)] rounded px-2 py-1"
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                        {user.role === 'SUPER_ADMIN' && (
                          <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                        )}
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Invitations Tab Component
function InvitationsTab({
  invitations,
  stats,
  loading,
  invitationForm,
  setInvitationForm,
  onCreateInvitation,
  onCancelInvitation,
  onDeleteInvitation,
  onResendInvitation
}: {
  invitations: any[]
  stats: any
  loading: boolean
  invitationForm: CreateInvitationRequest
  setInvitationForm: (form: CreateInvitationRequest) => void
  onCreateInvitation: (e: React.FormEvent) => Promise<void>
  onCancelInvitation: (id: string) => Promise<boolean>
  onDeleteInvitation: (id: string) => Promise<boolean>
  onResendInvitation: (id: string, expiration: '1h' | '24h' | '7d') => Promise<any>
}) {
  return (
    <div className="space-y-6">
      {/* Create Invitation Form */}
      <div className="bg-[var(--medflow-surface-elevated)] p-6 rounded-lg shadow border border-[var(--medflow-border)]">
        <h3 className="text-lg font-medium text-[var(--medflow-text-primary)] mb-4">Create New Invitation</h3>
        <form onSubmit={onCreateInvitation} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--medflow-text-secondary)] mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={invitationForm.email}
                onChange={(e) => setInvitationForm({ ...invitationForm, email: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--medflow-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--medflow-brand-1)]"
                placeholder="admin@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--medflow-text-secondary)] mb-1">
                Role
              </label>
              <select
                value={invitationForm.role}
                onChange={(e) => setInvitationForm({ ...invitationForm, role: e.target.value as UserRole })}
                className="w-full px-3 py-2 border border-[var(--medflow-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--medflow-brand-1)]"
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--medflow-text-secondary)] mb-1">
                Expiration
              </label>
              <select
                value={invitationForm.expiration}
                onChange={(e) => setInvitationForm({ ...invitationForm, expiration: e.target.value as any })}
                className="w-full px-3 py-2 border border-[var(--medflow-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--medflow-brand-1)]"
              >
                <option value="1h">1 Hour</option>
                <option value="24h">24 Hours</option>
                <option value="7d">7 Days</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
                         className="bg-[var(--medflow-brand-1)] text-[var(--medflow-text-primary)] px-4 py-2 rounded-md hover:bg-[var(--medflow-brand-2)] disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Invitation'}
          </button>
        </form>
      </div>

      {/* Invitations List */}
      <div className="bg-[var(--medflow-surface-elevated)] rounded-lg shadow border border-[var(--medflow-border)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--medflow-border)]">
          <h3 className="text-lg font-medium text-[var(--medflow-text-primary)]">Invitations</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--medflow-border)]">
            <thead className="bg-[var(--medflow-surface-dark)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--medflow-text-tertiary)] uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--medflow-text-tertiary)] uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--medflow-text-tertiary)] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--medflow-text-tertiary)] uppercase tracking-wider">
                  Expires
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--medflow-text-tertiary)] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-[var(--medflow-surface-elevated)] divide-y divide-[var(--medflow-border)]">
              {invitations.map((invitation) => (
                <tr key={invitation.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--medflow-text-primary)]">
                    {invitation.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      invitation.role === 'ADMIN' ? 'bg-[var(--medflow-brand-2)]/20 text-[var(--medflow-brand-2)]' : 'bg-[var(--medflow-surface-dark)] text-[var(--medflow-text-tertiary)]'
                    }`}>
                      {invitation.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      invitation.status === 'pending' ? 'bg-[var(--medflow-brand-2)]/20 text-[var(--medflow-brand-2)]' :
                      invitation.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      invitation.status === 'expired' ? 'bg-red-100 text-red-800' :
                      'bg-[var(--medflow-surface-dark)] text-[var(--medflow-text-tertiary)]'
                    }`}>
                      {invitation.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--medflow-text-tertiary)]">
                    {invitation.expiresAt ? new Date(invitation.expiresAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--medflow-text-tertiary)]">
                    <div className="flex space-x-2">
                      {invitation.status === 'pending' && (
                        <>
                          <button
                            onClick={() => onResendInvitation(invitation.id, '24h')}
                            className="text-[var(--medflow-brand-1)] hover:text-[var(--medflow-brand-2)]"
                          >
                            Resend
                          </button>
                          <button
                            onClick={() => onCancelInvitation(invitation.id)}
                            className="text-[var(--medflow-brand-2)] hover:text-[var(--medflow-brand-3)]"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => onDeleteInvitation(invitation.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
