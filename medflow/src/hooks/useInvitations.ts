import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '../providers/AuthProvider'
import { InvitationService } from '../services/invitationService'
import type { 
  Invitation, 
  CreateInvitationRequest, 
  InvitationStats 
} from '../types/invitations'

/**
 * Hook for managing admin invitations
 * Provides invitation creation, management, and statistics
 */
export function useInvitations() {
  const { user } = useAuth()
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [stats, setStats] = useState<InvitationStats>({
    total: 0,
    pending: 0,
    accepted: 0,
    expired: 0,
    cancelled: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load invitations for the current user
  const loadInvitations = useCallback(async () => {
    if (!user?.uid) return

    try {
      setLoading(true)
      setError(null)
      
      const userInvitations = await InvitationService.getInvitationsByUser(user.uid)
      setInvitations(userInvitations)
      
      // Update stats
      const invitationStats = await InvitationService.getInvitationStats(user.uid)
      setStats(invitationStats)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load invitations'
      setError(errorMessage)
      console.error('useInvitations: Error loading invitations:', err)
    } finally {
      setLoading(false)
    }
  }, [user?.uid])

  // Create a new invitation
  const createInvitation = useCallback(async (
    request: CreateInvitationRequest
  ): Promise<Invitation | null> => {
    if (!user?.uid) {
      setError('User not authenticated')
      return null
    }

    try {
      setLoading(true)
      setError(null)
      
      const newInvitation = await InvitationService.createInvitation(request, user.uid)
      
      // Add to local state
      setInvitations(prev => [newInvitation, ...prev])
      
      // Refresh stats
      await loadInvitations()
      
      return newInvitation
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create invitation'
      setError(errorMessage)
      console.error('useInvitations: Error creating invitation:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [user?.uid, loadInvitations])

  // Cancel an invitation
  const cancelInvitation = useCallback(async (invitationId: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      
      await InvitationService.cancelInvitation(invitationId)
      
      // Update local state
      setInvitations(prev => 
        prev.map(inv => 
          inv.id === invitationId 
            ? { ...inv, status: 'cancelled' as const }
            : inv
        )
      )
      
      // Refresh stats
      await loadInvitations()
      
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel invitation'
      setError(errorMessage)
      console.error('useInvitations: Error cancelling invitation:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [loadInvitations])

  // Delete an invitation
  const deleteInvitation = useCallback(async (invitationId: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      
      await InvitationService.deleteInvitation(invitationId)
      
      // Remove from local state
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId))
      
      // Refresh stats
      await loadInvitations()
      
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete invitation'
      setError(errorMessage)
      console.error('useInvitations: Error deleting invitation:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [loadInvitations])

  // Resend an invitation
  const resendInvitation = useCallback(async (
    invitationId: string,
    expiration: '1h' | '24h' | '7d'
  ): Promise<Invitation | null> => {
    try {
      setLoading(true)
      setError(null)
      
      const updatedInvitation = await InvitationService.resendInvitation(invitationId, expiration)
      
      // Update local state
      setInvitations(prev => 
        prev.map(inv => 
          inv.id === invitationId ? updatedInvitation : inv
        )
      )
      
      return updatedInvitation
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resend invitation'
      setError(errorMessage)
      console.error('useInvitations: Error resending invitation:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Clean up expired invitations
  const cleanupExpired = useCallback(async (): Promise<number> => {
    try {
      setLoading(true)
      setError(null)
      
      const expiredCount = await InvitationService.cleanupExpiredInvitations()
      
      // Refresh invitations and stats
      await loadInvitations()
      
      return expiredCount
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cleanup expired invitations'
      setError(errorMessage)
      console.error('useInvitations: Error cleaning up expired invitations:', err)
      return 0
    } finally {
      setLoading(false)
    }
  }, [loadInvitations])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Load invitations on mount and when user changes
  useEffect(() => {
    if (user?.uid) {
      loadInvitations()
    }
  }, [user?.uid, loadInvitations])

  // Auto-cleanup expired invitations every hour
  useEffect(() => {
    if (!user?.uid) return

    const interval = setInterval(() => {
      cleanupExpired()
    }, 60 * 60 * 1000) // 1 hour

    return () => clearInterval(interval)
  }, [user?.uid, cleanupExpired])

  return {
    // State
    invitations,
    stats,
    loading,
    error,
    
    // Actions
    createInvitation,
    cancelInvitation,
    deleteInvitation,
    resendInvitation,
    cleanupExpired,
    loadInvitations,
    clearError,
  }
}
