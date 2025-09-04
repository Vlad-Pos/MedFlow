import { db } from './firebase'
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  deleteDoc,
  writeBatch
} from 'firebase/firestore'
import type { 
  Invitation, 
  CreateInvitationRequest, 
  InvitationValidation,
  InvitationStats 
} from '../types/invitations'
import { 
  getInvitationExpirationDate, 
  isInvitationExpired,
  formatInvitationExpiration 
} from '../types/invitations'

/**
 * Service for managing admin invitations
 * Handles invitation creation, validation, and management
 */
export class InvitationService {
  private static readonly COLLECTION = 'invitations'

  /**
   * Generate a cryptographically secure invitation token
   */
  private static generateToken(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Create a new admin invitation
   */
  static async createInvitation(
    request: CreateInvitationRequest,
    invitedBy: string
  ): Promise<Invitation> {
    try {
      const token = this.generateToken()
      const expiresAt = getInvitationExpirationDate(request.expiration)

      const invitation: Omit<Invitation, 'id'> = {
        email: request.email.toLowerCase().trim(),
        role: request.role,
        invitedBy,
        invitedAt: new Date(),
        expiresAt,
        status: 'pending',
        token,
      }

      const docRef = await addDoc(collection(db, this.COLLECTION), {
        ...invitation,
        invitedAt: serverTimestamp(),
        expiresAt: expiresAt.toISOString(),
      })

      return {
        ...invitation,
        id: docRef.id,
      }
    } catch (error) {
      console.error('InvitationService: Error creating invitation:', error)
      throw new Error('Failed to create invitation')
    }
  }

  /**
   * Validate an invitation token
   */
  static async validateInvitation(token: string): Promise<InvitationValidation> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('token', '==', token),
        where('status', '==', 'pending')
      )
      
      const snapshot = await getDocs(q)
      
      if (snapshot.empty) {
        return { isValid: false, error: 'Invalid or expired invitation token' }
      }

      const doc = snapshot.docs[0]
      const invitation = doc.data() as Invitation
      
      // Check if invitation has expired
      if (isInvitationExpired(invitation.expiresAt)) {
        // Update status to expired
        await updateDoc(doc.ref, { status: 'expired' })
        return { isValid: false, error: 'Invitation has expired' }
      }

              return { 
          isValid: true, 
          invitation: {
            ...invitation,
            id: doc.id,
            invitedAt: invitation.invitedAt instanceof Date ? invitation.invitedAt : new Date(invitation.invitedAt),
            expiresAt: invitation.expiresAt instanceof Date ? invitation.expiresAt : new Date(invitation.expiresAt),
          }
        }
    } catch (error) {
      console.error('InvitationService: Error validating invitation:', error)
      return { isValid: false, error: 'Failed to validate invitation' }
    }
  }

  /**
   * Accept an invitation
   */
  static async acceptInvitation(token: string, acceptedBy: string): Promise<void> {
    try {
      const validation = await this.validateInvitation(token)
      
      if (!validation.isValid || !validation.invitation) {
        throw new Error(validation.error || 'Invalid invitation')
      }

      const invitation = validation.invitation
      
      // Update invitation status
      const q = query(
        collection(db, this.COLLECTION),
        where('token', '==', token)
      )
      const snapshot = await getDocs(q)
      
      if (!snapshot.empty) {
        const docRef = snapshot.docs[0].ref
        await updateDoc(docRef, {
          status: 'accepted',
          acceptedAt: serverTimestamp(),
          acceptedBy,
        })
      }
    } catch (error) {
      console.error('InvitationService: Error accepting invitation:', error)
      throw new Error('Failed to accept invitation')
    }
  }

  /**
   * Get all invitations for a user
   */
  static async getInvitationsByUser(userId: string): Promise<Invitation[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('invitedBy', '==', userId),
        orderBy('invitedAt', 'desc')
      )
      
      const snapshot = await getDocs(q)
      
      return snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          ...data,
          id: doc.id,
          invitedAt: data.invitedAt?.toDate?.() || new Date(data.invitedAt),
          expiresAt: data.expiresAt?.toDate?.() || new Date(data.expiresAt),
          acceptedAt: data.acceptedAt?.toDate?.() || data.acceptedAt,
        } as Invitation
      })
    } catch (error) {
      console.error('InvitationService: Error getting invitations:', error)
      throw new Error('Failed to get invitations')
    }
  }

  /**
   * Get invitation statistics
   */
  static async getInvitationStats(userId: string): Promise<InvitationStats> {
    try {
      const invitations = await this.getInvitationsByUser(userId)
      
      return {
        total: invitations.length,
        pending: invitations.filter(inv => inv.status === 'pending' && !isInvitationExpired(inv.expiresAt)).length,
        accepted: invitations.filter(inv => inv.status === 'accepted').length,
        expired: invitations.filter(inv => inv.status === 'pending' && isInvitationExpired(inv.expiresAt)).length,
        cancelled: invitations.filter(inv => inv.status === 'cancelled').length,
      }
    } catch (error) {
      console.error('InvitationService: Error getting invitation stats:', error)
      throw new Error('Failed to get invitation statistics')
    }
  }

  /**
   * Cancel an invitation
   */
  static async cancelInvitation(invitationId: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, invitationId)
      await updateDoc(docRef, { status: 'cancelled' })
    } catch (error) {
      console.error('InvitationService: Error cancelling invitation:', error)
      throw new Error('Failed to cancel invitation')
    }
  }

  /**
   * Delete an invitation
   */
  static async deleteInvitation(invitationId: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, invitationId)
      await deleteDoc(docRef)
    } catch (error) {
      console.error('InvitationService: Error deleting invitation:', error)
      throw new Error('Failed to delete invitation')
    }
  }

  /**
   * Clean up expired invitations
   */
  static async cleanupExpiredInvitations(): Promise<number> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('status', '==', 'pending')
      )
      
      const snapshot = await getDocs(q)
      const batch = writeBatch(db)
      let expiredCount = 0
      
      snapshot.docs.forEach(doc => {
        const data = doc.data()
        const expiresAt = data.expiresAt?.toDate?.() || new Date(data.expiresAt)
        
        if (isInvitationExpired(expiresAt)) {
          batch.update(doc.ref, { status: 'expired' })
          expiredCount++
        }
      })
      
      if (expiredCount > 0) {
        await batch.commit()
      }
      
      return expiredCount
    } catch (error) {
      console.error('InvitationService: Error cleaning up expired invitations:', error)
      throw new Error('Failed to cleanup expired invitations')
    }
  }

  /**
   * Resend an invitation (create new token and extend expiration)
   */
  static async resendInvitation(
    invitationId: string,
    expiration: '1h' | '24h' | '7d'
  ): Promise<Invitation> {
    try {
      const docRef = doc(db, this.COLLECTION, invitationId)
      const docSnap = await getDoc(docRef)
      
      if (!docSnap.exists()) {
        throw new Error('Invitation not found')
      }
      
      const data = docSnap.data()
      if (data.status !== 'pending') {
        throw new Error('Cannot resend non-pending invitation')
      }
      
      const newToken = this.generateToken()
      const newExpiresAt = getInvitationExpirationDate(expiration)
      
      await updateDoc(docRef, {
        token: newToken,
        expiresAt: newExpiresAt.toISOString(),
        invitedAt: serverTimestamp(),
      })
      
      return {
        ...data,
        id: invitationId,
        token: newToken,
        expiresAt: newExpiresAt,
        invitedAt: new Date(),
      } as Invitation
    } catch (error) {
      console.error('InvitationService: Error resending invitation:', error)
      throw new Error('Failed to resend invitation')
    }
  }
}
