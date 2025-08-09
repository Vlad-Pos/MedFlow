/**
 * Flagging Integration Service for MedFlow
 * 
 * Integrates the patient flagging system with notification scheduling
 * to automatically flag patients based on non-response patterns.
 * 
 * @author MedFlow Team
 * @version 1.0
 */

import PatientFlaggingService from './patientFlagging'
import { AppointmentWithNotifications } from '../types/notifications'

/**
 * FlaggingIntegrationService
 * 
 * Provides integration points between the notification system
 * and patient flagging system for automatic flagging workflows.
 */
export class FlaggingIntegrationService {
  
  /**
   * Initialize the flagging integration system
   * This should be called when the app starts
   */
  static async initialize(): Promise<void> {
    try {
      console.log('Initializing patient flagging integration...')
      
      // Schedule periodic check for flagging
      this.schedulePeriodicFlaggingCheck()
      
      console.log('Patient flagging integration initialized successfully')
    } catch (error) {
      console.error('Failed to initialize flagging integration:', error)
    }
  }
  
  /**
   * Schedule periodic checks for patients that should be flagged
   * In production, this would be handled by a cloud function or server-side job
   */
  private static schedulePeriodicFlaggingCheck(): void {
    // Check every 30 minutes for appointments that need flagging
    setInterval(async () => {
      try {
        await this.performFlaggingCheck()
      } catch (error) {
        console.error('Error in periodic flagging check:', error)
      }
    }, 30 * 60 * 1000) // 30 minutes
    
    // Also run immediately
    setTimeout(() => {
      this.performFlaggingCheck()
    }, 5000) // Wait 5 seconds for app to fully load
  }
  
  /**
   * Perform the actual flagging check
   */
  private static async performFlaggingCheck(): Promise<void> {
    try {
      console.log('Performing automated patient flagging check...')
      
      const result = await PatientFlaggingService.checkAppointmentsForFlagging()
      
      if (result.newFlags > 0) {
        console.log(`Automated flagging completed: ${result.newFlags} new flags created`)
        
        // Trigger real-time updates for doctors
        this.notifyDoctorsOfNewFlags(result.newFlags)
      }
      
      if (result.errors.length > 0) {
        console.warn('Flagging check completed with errors:', result.errors)
      }
    } catch (error) {
      console.error('Error in automated flagging check:', error)
    }
  }
  
  /**
   * Notify doctors of new flags (placeholder for real-time updates)
   */
  private static notifyDoctorsOfNewFlags(flagCount: number): void {
    // In a real implementation, this would send real-time notifications
    // to connected doctors via WebSocket or Server-Sent Events
    console.log(`Notifying doctors of ${flagCount} new patient flags`)
    
    // Could dispatch a custom event that UI components listen for
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('newPatientFlags', {
        detail: { flagCount }
      }))
    }
  }
  
  /**
   * Check if a specific appointment should trigger flagging
   * This can be called immediately after appointment time passes
   */
  static async checkAppointmentForImediateFlagging(
    appointment: AppointmentWithNotifications
  ): Promise<boolean> {
    try {
      // Check if appointment time has passed and no response received
      const appointmentTime = appointment.dateTime instanceof Date 
        ? appointment.dateTime 
        : appointment.dateTime.toDate()
      
      const now = new Date()
      const appointmentPassed = now > appointmentTime
      
      if (!appointmentPassed) {
        return false // Appointment hasn't happened yet
      }
      
      // Check if patient responded
      if (appointment.notifications.confirmationReceived || appointment.status === 'confirmed') {
        return false // Patient responded
      }
      
      // Check if patient opted out
      if (appointment.notifications.optedOut) {
        return false // Respect patient's choice
      }
      
      // Check if both notifications were sent
      const notificationsSent = 
        (appointment.notifications.firstNotification.sent ? 1 : 0) +
        (appointment.notifications.secondNotification.sent ? 1 : 0)
      
      if (notificationsSent < 2) {
        return false // Not all notifications sent yet
      }
      
      // Check grace period (2 hours after appointment)
      const gracePeriodEnd = new Date(appointmentTime.getTime() + 2 * 60 * 60 * 1000)
      
      if (now < gracePeriodEnd) {
        return false // Still in grace period
      }
      
      return true // Should be flagged
    } catch (error) {
      console.error('Error checking appointment for immediate flagging:', error)
      return false
    }
  }
  
  /**
   * Manually trigger flagging check for testing purposes
   */
  static async triggerManualFlaggingCheck(): Promise<{
    success: boolean
    newFlags: number
    errors: string[]
  }> {
    try {
      const result = await PatientFlaggingService.checkAppointmentsForFlagging()
      
      return {
        success: true,
        newFlags: result.newFlags,
        errors: result.errors
      }
    } catch (error) {
      console.error('Error in manual flagging check:', error)
      return {
        success: false,
        newFlags: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      }
    }
  }
  
  /**
   * Get real-time flagging statistics
   */
  static async getFlaggingStatistics(): Promise<{
    totalActiveFlags: number
    flagsToday: number
    flagsThisWeek: number
    topReasons: Array<{ reason: string; count: number }>
  }> {
    try {
      // This would query the database for real statistics
      // For now, return placeholder data
      
      return {
        totalActiveFlags: 0,
        flagsToday: 0,
        flagsThisWeek: 0,
        topReasons: []
      }
    } catch (error) {
      console.error('Error getting flagging statistics:', error)
      return {
        totalActiveFlags: 0,
        flagsToday: 0,
        flagsThisWeek: 0,
        topReasons: []
      }
    }
  }
  
  /**
   * Handle appointment status changes that might affect flagging
   */
  static async handleAppointmentStatusChange(
    appointment: AppointmentWithNotifications,
    oldStatus: string,
    newStatus: string
  ): Promise<void> {
    try {
      // If appointment was confirmed, no need to flag
      if (newStatus === 'confirmed') {
        console.log(`Appointment ${appointment.id} confirmed, flagging not needed`)
        return
      }
      
      // If appointment was marked as no-show, consider flagging
      if (newStatus === 'no_show') {
        console.log(`Appointment ${appointment.id} marked as no-show, checking for flagging`)
        
        const shouldFlag = await this.checkAppointmentForImediateFlagging(appointment)
        
        if (shouldFlag) {
          // This would trigger immediate flagging
          console.log(`Triggering immediate flagging for no-show appointment ${appointment.id}`)
        }
      }
    } catch (error) {
      console.error('Error handling appointment status change:', error)
    }
  }
  
  /**
   * Get flagged patients summary for dashboard widget
   */
  static async getFlaggedPatientsSummary(doctorId: string): Promise<{
    totalFlagged: number
    highRisk: number
    needsAttention: number
    recentFlags: Array<{ patientName: string; flagDate: Date; reason: string }>
  }> {
    try {
      const flaggedPatients = await PatientFlaggingService.getFlaggedPatientsForDoctor(doctorId)
      
      const totalFlagged = flaggedPatients.length
      const highRisk = flaggedPatients.filter(p => p.riskLevel === 'high').length
      const needsAttention = flaggedPatients.filter(p => p.flagCount > 2).length
      
      const recentFlags = flaggedPatients
        .filter(p => p.lastFlagDate)
        .sort((a, b) => (b.lastFlagDate?.getTime() || 0) - (a.lastFlagDate?.getTime() || 0))
        .slice(0, 5)
        .map(p => ({
          patientName: p.patientName,
          flagDate: p.lastFlagDate!,
          reason: 'Lipsa răspuns la notificări' // TODO: Get actual reason from flag
        }))
      
      return {
        totalFlagged,
        highRisk,
        needsAttention,
        recentFlags
      }
    } catch (error) {
      console.error('Error getting flagged patients summary:', error)
      return {
        totalFlagged: 0,
        highRisk: 0,
        needsAttention: 0,
        recentFlags: []
      }
    }
  }
}

/**
 * Browser integration for manual testing
 */
if (typeof window !== 'undefined') {
  (window as any).testPatientFlagging = {
    runFlaggingCheck: () => FlaggingIntegrationService.triggerManualFlaggingCheck(),
    getStatistics: () => FlaggingIntegrationService.getFlaggingStatistics(),
    initialize: () => FlaggingIntegrationService.initialize()
  }
  
  console.log('🚩 Patient Flagging Test Suite loaded. Available commands:')
  console.log('  testPatientFlagging.runFlaggingCheck() - Run manual flagging check')
  console.log('  testPatientFlagging.getStatistics() - Get flagging statistics')
  console.log('  testPatientFlagging.initialize() - Initialize flagging system')
}

export default FlaggingIntegrationService
