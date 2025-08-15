import { db } from './firebase'
import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  writeBatch,
  addDoc
} from 'firebase/firestore'
import type { UserRole, Permission } from '../types/auth'
import { ROLE_PERMISSIONS } from '../types/auth'

/**
 * Service for managing user roles and permissions
 * Handles role assignment, permission updates, and user management
 */
export class RoleService {
  private static readonly USERS_COLLECTION = 'users'

  /**
   * Get user role and permissions
   */
  static async getUserRole(userId: string): Promise<{
    role: UserRole
    permissions: Permission[]
  } | null> {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, userId)
      const userSnap = await getDoc(userRef)
      
      if (!userSnap.exists()) {
        return null
      }
      
      const userData = userSnap.data()
      const role = (userData.role as UserRole) || 'USER'
      const permissions = userData.permissions || ROLE_PERMISSIONS[role as UserRole] || []
      
      return { role, permissions }
    } catch (error) {
      console.error('RoleService: Error getting user role:', error)
      throw new Error('Failed to get user role')
    }
  }

  /**
   * Update user role
   */
  static async updateUserRole(
    userId: string, 
    newRole: UserRole, 
    updatedBy: string
  ): Promise<void> {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, userId)
      
      // Get current user data
      const userSnap = await getDoc(userRef)
      if (!userSnap.exists()) {
        throw new Error('User not found')
      }
      
      const currentRole = userSnap.data().role || 'USER'
      
      // Update role and permissions
      await updateDoc(userRef, {
        role: newRole,
        permissions: ROLE_PERMISSIONS[newRole] || [],
        roleUpdatedAt: serverTimestamp(),
        roleUpdatedBy: updatedBy,
        previousRole: currentRole,
      })
      
      // Log role change
      await this.logRoleChange(userId, currentRole, newRole, updatedBy)
    } catch (error) {
      console.error('RoleService: Error updating user role:', error)
      throw new Error('Failed to update user role')
    }
  }

  /**
   * Assign custom permissions to a user
   */
  static async assignCustomPermissions(
    userId: string,
    permissions: Permission[],
    assignedBy: string
  ): Promise<void> {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, userId)
      
      await updateDoc(userRef, {
        permissions,
        permissionsUpdatedAt: serverTimestamp(),
        permissionsUpdatedBy: assignedBy,
        hasCustomPermissions: true,
      })
      
      // Log permission change
      await this.logPermissionChange(userId, permissions, assignedBy)
    } catch (error) {
      console.error('RoleService: Error assigning custom permissions:', error)
      throw new Error('Failed to assign custom permissions')
    }
  }

  /**
   * Reset user permissions to role defaults
   */
  static async resetToRolePermissions(
    userId: string,
    resetBy: string
  ): Promise<void> {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, userId)
      const userSnap = await getDoc(userRef)
      
      if (!userSnap.exists()) {
        throw new Error('User not found')
      }
      
      const userData = userSnap.data()
      const role = (userData.role as UserRole) || 'USER'
      const defaultPermissions = ROLE_PERMISSIONS[role as UserRole] || []
      
      await updateDoc(userRef, {
        permissions: defaultPermissions,
        permissionsUpdatedAt: serverTimestamp(),
        permissionsUpdatedBy: resetBy,
        hasCustomPermissions: false,
      })
      
      // Log permission reset
      await this.logPermissionChange(userId, defaultPermissions, resetBy, 'reset')
    } catch (error) {
      console.error('RoleService: Error resetting permissions:', error)
      throw new Error('Failed to reset permissions')
    }
  }

  /**
   * Get all users with their roles
   */
  static async getAllUsers(): Promise<Array<{
    id: string
    email: string
    displayName: string
    role: UserRole
    permissions: Permission[]
    verified: boolean
    createdAt: Date
    lastActivity: Date
  }>> {
    try {
      const q = query(
        collection(db, this.USERS_COLLECTION),
        orderBy('createdAt', 'desc')
      )
      
      const snapshot = await getDocs(q)
      
      return snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          email: data.email || '',
          displayName: data.displayName || '',
          role: data.role || 'USER',
          permissions: data.permissions || [],
          verified: data.verified || false,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          lastActivity: data.lastActivity?.toDate?.() || new Date(),
        }
      })
    } catch (error) {
      console.error('RoleService: Error getting all users:', error)
      throw new Error('Failed to get users')
    }
  }

  /**
   * Get users by role
   */
  static async getUsersByRole(role: UserRole): Promise<Array<{
    id: string
    email: string
    displayName: string
    verified: boolean
    createdAt: Date
  }>> {
    try {
      const q = query(
        collection(db, this.USERS_COLLECTION),
        where('role', '==', role),
        orderBy('createdAt', 'desc')
      )
      
      const snapshot = await getDocs(q)
      
      return snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          email: data.email || '',
          displayName: data.displayName || '',
          verified: data.verified || false,
          createdAt: data.createdAt?.toDate?.() || new Date(),
        }
      })
    } catch (error) {
      console.error('RoleService: Error getting users by role:', error)
      throw new Error('Failed to get users by role')
    }
  }

  /**
   * Bulk update user roles
   */
  static async bulkUpdateRoles(
    updates: Array<{ userId: string; newRole: UserRole }>,
    updatedBy: string
  ): Promise<void> {
    try {
      const batch = writeBatch(db)
      
      for (const update of updates) {
        const userRef = doc(db, this.USERS_COLLECTION, update.userId)
        batch.update(userRef, {
          role: update.newRole,
          permissions: ROLE_PERMISSIONS[update.newRole] || [],
          roleUpdatedAt: serverTimestamp(),
          roleUpdatedBy: updatedBy,
        })
      }
      
      await batch.commit()
    } catch (error) {
      console.error('RoleService: Error bulk updating roles:', error)
      throw new Error('Failed to bulk update roles')
    }
  }

  /**
   * Verify user permissions
   */
  static async verifyUserPermissions(
    userId: string,
    resource: Permission['resource'],
    action: Permission['action'],
    scope: Permission['scope'] = 'own'
  ): Promise<boolean> {
    try {
      const userRole = await this.getUserRole(userId)
      
      if (!userRole) {
        return false
      }
      
      const { permissions } = userRole
      
      return permissions.some(
        (permission) =>
          permission.resource === resource &&
          permission.action === action &&
          permission.scope === scope
      )
    } catch (error) {
      console.error('RoleService: Error verifying permissions:', error)
      return false
    }
  }

  /**
   * Get role statistics
   */
  static async getRoleStats(): Promise<Record<UserRole, number>> {
    try {
      const users = await this.getAllUsers()
      
      const stats: Record<UserRole, number> = {
        SUPER_ADMIN: 0,
        ADMIN: 0,
        USER: 0,
      }
      
      users.forEach(user => {
        stats[user.role] = (stats[user.role] || 0) + 1
      })
      
      return stats
    } catch (error) {
      console.error('RoleService: Error getting role stats:', error)
      throw new Error('Failed to get role statistics')
    }
  }

  /**
   * Log role change for audit purposes
   */
  private static async logRoleChange(
    userId: string,
    oldRole: UserRole,
    newRole: UserRole,
    updatedBy: string
  ): Promise<void> {
    try {
      const auditRef = collection(db, 'audit_logs')
      await addDoc(auditRef, {
        type: 'role_change',
        userId,
        oldRole,
        newRole,
        updatedBy,
        timestamp: serverTimestamp(),
        metadata: {
          action: 'role_update',
          resource: 'user',
        },
      })
    } catch (error) {
      console.warn('RoleService: Could not log role change:', error)
      // Don't throw error for audit logging failures
    }
  }

  /**
   * Log permission change for audit purposes
   */
  private static async logPermissionChange(
    userId: string,
    permissions: Permission[],
    updatedBy: string,
    action: 'assign' | 'reset' = 'assign'
  ): Promise<void> {
    try {
      const auditRef = collection(db, 'audit_logs')
      await addDoc(auditRef, {
        type: 'permission_change',
        userId,
        permissions,
        updatedBy,
        action,
        timestamp: serverTimestamp(),
        metadata: {
          action: 'permission_update',
          resource: 'user',
        },
      })
    } catch (error) {
      console.warn('RoleService: Could not log permission change:', error)
      // Don't throw error for audit logging failures
    }
  }
}
