/**
 * Role Migration Utilities for MedFlow
 * 
 * Provides safe migration functions to transition from legacy role system
 * to the new unified role system without breaking existing functionality.
 * 
 * @author MedFlow Team
 * @version 1.0
 */

import type { UserRole, LegacyUserRole, AppUser } from '../types/auth'
import { LEGACY_ROLE_MAPPING, convertLegacyRole, isLegacyRole } from '../types/auth'

/**
 * Migration status for user roles
 */
export interface RoleMigrationStatus {
  userId: string
  oldRole: LegacyUserRole | UserRole
  newRole: UserRole
  migrated: boolean
  migratedAt: Date
  migrationMethod: 'automatic' | 'manual' | 'pending'
}

/**
 * Migrate a single user's role from legacy to new system
 */
export const migrateUserRole = (
  user: AppUser,
  targetRole?: UserRole
): { newRole: UserRole; migrationRequired: boolean } => {
  if (!user) {
    return { newRole: 'USER', migrationRequired: false }
  }

  // If user already has new role system, no migration needed
  if (user.role && !isLegacyRole(user.role)) {
    return { newRole: user.role, migrationRequired: false }
  }

  // If user has legacy role, migrate it
  if (user.legacyRole) {
    const newRole = targetRole || convertLegacyRole(user.legacyRole)
    return { newRole, migrationRequired: true }
  }

  // Fallback to USER role
  return { newRole: 'USER', migrationRequired: false }
}

/**
 * Batch migrate multiple users
 */
export const batchMigrateUsers = (
  users: AppUser[],
  roleMapping?: Record<string, UserRole>
): Array<{ user: AppUser; migration: ReturnType<typeof migrateUserRole> }> => {
  return users.map(user => {
    const targetRole = roleMapping?.[user.uid]
    const migration = migrateUserRole(user, targetRole)
    return { user, migration }
  })
}

/**
 * Validate migration results
 */
export const validateMigration = (
  migrations: Array<{ user: AppUser; migration: ReturnType<typeof migrateUserRole> }>
): {
  valid: boolean
  errors: string[]
  summary: {
    total: number
    migrated: number
    skipped: number
    errors: number
  }
} => {
  const errors: string[] = []
  let migrated = 0
  let skipped = 0

  migrations.forEach(({ user, migration }) => {
    if (migration.migrationRequired) {
      if (migration.newRole) {
        migrated++
      } else {
        errors.push(`User ${user.uid}: Invalid migration result`)
      }
    } else {
      skipped++
    }
  })

  const total = migrations.length
  const errorCount = errors.length

  return {
    valid: errorCount === 0,
    errors,
    summary: {
      total,
      migrated,
      skipped,
      errors: errorCount
    }
  }
}

/**
 * Generate migration report
 */
export const generateMigrationReport = (
  migrations: Array<{ user: AppUser; migration: ReturnType<typeof migrateUserRole> }>
): string => {
  const validation = validateMigration(migrations)
  const { summary } = validation

  return `
Role Migration Report
====================
Total Users: ${summary.total}
Migrated: ${summary.migrated}
Skipped: ${summary.skipped}
Errors: ${summary.errors}

${validation.errors.length > 0 ? `Errors:\n${validation.errors.join('\n')}` : 'No errors found.'}
  `.trim()
}

/**
 * Check if system needs migration
 */
export const needsMigration = (users: AppUser[]): boolean => {
  return users.some(user => user.legacyRole || isLegacyRole(user.role as any))
}

/**
 * Get migration statistics
 */
export const getMigrationStats = (users: AppUser[]): {
  totalUsers: number
  legacyUsers: number
  newSystemUsers: number
  migrationPercentage: number
} => {
  const totalUsers = users.length
  const legacyUsers = users.filter(user => user.legacyRole || isLegacyRole(user.role as any)).length
  const newSystemUsers = totalUsers - legacyUsers
  const migrationPercentage = totalUsers > 0 ? (newSystemUsers / totalUsers) * 100 : 0

  return {
    totalUsers,
    legacyUsers,
    newSystemUsers,
    migrationPercentage: Math.round(migrationPercentage * 100) / 100
  }
}
