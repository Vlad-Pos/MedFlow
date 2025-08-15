import type { UserRole } from './auth'

// Invitation status tracking
export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'cancelled'

// Invitation expiration options
export type InvitationExpiration = '1h' | '24h' | '7d'

// Invitation interface
export interface Invitation {
  id: string
  email: string
  role: UserRole
  invitedBy: string
  invitedAt: Date
  expiresAt: Date
  status: InvitationStatus
  token: string
  acceptedAt?: Date
  acceptedBy?: string
}

// Invitation creation request
export interface CreateInvitationRequest {
  email: string
  role: UserRole
  expiration: InvitationExpiration
}

// Invitation validation response
export interface InvitationValidation {
  isValid: boolean
  invitation?: Invitation
  error?: string
}

// Invitation statistics
export interface InvitationStats {
  total: number
  pending: number
  accepted: number
  expired: number
  cancelled: number
}

// Invitation expiration mapping (in milliseconds)
export const INVITATION_EXPIRATION_MS: Record<InvitationExpiration, number> = {
  '1h': 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
}

// Utility functions for invitations
export const isInvitationExpired = (expiresAt: Date): boolean => {
  return new Date() > expiresAt
}

export const getInvitationExpirationDate = (expiration: InvitationExpiration): Date => {
  const now = new Date()
  return new Date(now.getTime() + INVITATION_EXPIRATION_MS[expiration])
}

export const formatInvitationExpiration = (expiresAt: Date): string => {
  const now = new Date()
  const diff = expiresAt.getTime() - now.getTime()
  
  if (diff <= 0) return 'Expired'
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 24) {
    const days = Math.floor(hours / 24)
    return `${days} day${days > 1 ? 's' : ''}`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m`
  }
}
