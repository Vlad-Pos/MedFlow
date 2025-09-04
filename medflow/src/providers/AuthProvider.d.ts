/**
 * Enhanced Authentication Provider for MedFlow
 *
 * Provides comprehensive authentication services with:
 * - Enhanced error handling with Romanian messages
 * - Role-based access control for medical professionals
 * - Secure session management
 * - Rate limiting and security features
 * - AI integration preparation
 * - GDPR compliance features
 *
 * @author MedFlow Team
 * @version 2.0
 */
import type { ReactNode } from 'react'
import type { AppUser, UserRole, LegacyUserRole } from '../types/auth'

export interface AuthContextValue {
  user: AppUser | null
  initializing: boolean
  // Core authentication methods
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  logout: () => Promise<void>
  // Enhanced security methods
  refreshUserData: () => Promise<void>
  updateUserPreferences: (preferences: Record<string, unknown>) => Promise<void>
}

export interface AuthProviderProps {
  children: ReactNode
}

// Legacy type definitions for backward compatibility (DEPRECATED)
export interface LegacyAuthContextValue {
  user: AppUser | null
  initializing: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName: string, role: LegacyUserRole) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  logout: () => Promise<void>
  refreshUserData: () => Promise<void>
  updateUserPreferences: (preferences: Record<string, unknown>) => Promise<void>
}

// Export both for backward compatibility
export type { AuthContextValue as default }
export type { LegacyAuthContextValue }
