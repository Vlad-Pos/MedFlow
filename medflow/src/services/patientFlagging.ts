/**
 * Patient Flagging Service for MedFlow
 * 
 * Handles automatic patient flagging based on non-response to notifications,
 * doctor alerts, and GDPR-compliant flag management.
 * 
 * @author MedFlow Team
 * @version 1.0
 */

import { 
  doc, 
  collection,
  getDoc, 
  setDoc, 
  updateDoc,
  deleteDoc,
  addDoc,
  query, 
  where, 
  getDocs,
  orderBy,
  limit,
  serverTimestamp, 
  Timestamp,
  writeBatch
} from 'firebase/firestore'
import { db } from './firebase'
import { 
  PatientFlag,
  PatientFlagSummary,
  DoctorAlert,
  FlaggingConfiguration,
  FlagReason,
  FlagSeverity,
  FlagStatus,
  FlaggingValidationResult,
  FlagAuditLog,
  PatientFlagGDPRData
} from '../types/patientFlagging'
import { AppointmentWithNotifications } from '../types/notifications'

/**
 * Default flagging configuration for Romanian medical practices
 */
const DEFAULT_FLAGGING_CONFIG: Omit<FlaggingConfiguration, 'doctorId' | 'createdAt' | 'updatedAt'> = {
  enableAutoFlagging: true,
  flagAfterMissedNotifications: 2, // Flag after both notifications missed
  flagSeverityForNoResponse: 'medium',
  responseTimeoutHours: 2, // 2 hours after appointment time
  appointmentGracePeriodMinutes: 15,
  enableRealTimeAlerts: true,
  enableEmailAlerts: true,
  alertForSeverities: ['medium', 'high'],
  highlightFlaggedPatients: true,
  showFlagCountInLists: true,
  flagDisplayColor: '#dc2626', // Red-600
  flagRetentionMonths: 24,
  autoResolveOldFlags: true
}

/**
 * PatientFlaggingService
 * 
 * Comprehensive service for managing patient flags, doctor alerts,
 * and compliance with GDPR and Romanian medical regulations.
 */
export class PatientFlaggingService {
  
  /**
   * Check appointments for patients who should be flagged
   * Called by scheduled job to identify non-responsive patients
   */
  static async checkAppointmentsForFlagging(): Promise<{
    processedAppointments: number
    newFlags: number
    errors: string[]
  }> {
    try {
      console.log('Starting patient flagging check...')
      
      const now = new Date()
      const cutoffTime = new Date(now.getTime() - 2 * 60 * 60 * 1000) // 2 hours ago
      
      // Find appointments that should have been responded to
      const appointmentsToCheck = query(
        collection(db, 'appointments'),
        where('status', '==', 'scheduled'),
        where('dateTime', '<=', Timestamp.fromDate(cutoffTime))
      )
      
      const snapshot = await getDocs(appointmentsToCheck)
      const appointments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AppointmentWithNotifications[]
      
      let processedAppointments = 0
      let newFlags = 0
      const errors: string[] = []
      
      // Process each appointment
      for (const appointment of appointments) {
        try {
          processedAppointments++
          
          // Check if patient should be flagged
          const shouldFlag = await this.shouldPatientBeFlagged(appointment)
          
          if (shouldFlag.shouldFlag && shouldFlag.reason) {
            // Create flag for non-responsive patient
            await this.createAutomaticFlag(appointment, shouldFlag.reason)
            newFlags++
            
            // Create doctor alert
            await this.createDoctorAlert(appointment, shouldFlag.reason)
            
            console.log(`Flagged patient ${appointment.patientName} for ${shouldFlag.reason}`)
          }
        } catch (error) {
          const errorMsg = `Error processing appointment ${appointment.id}: ${error}`
          errors.push(errorMsg)
          console.error(errorMsg)
        }
      }
      
      console.log(`Flagging check complete: ${processedAppointments} processed, ${newFlags} new flags`)
      
      return {
        processedAppointments,
        newFlags,
        errors
      }
    } catch (error) {
      console.error('Error in checkAppointmentsForFlagging:', error)
      throw new Error('Nu s-a putut verifica programările pentru semnalizare')
    }
  }
  
  /**
   * Determine if a patient should be flagged based on their appointment response
   */
  private static async shouldPatientBeFlagged(
    appointment: AppointmentWithNotifications
  ): Promise<{ shouldFlag: boolean; reason?: FlagReason }> {
    try {
      const notifications = appointment.notifications
      
      // Skip if patient already responded
      if (notifications.confirmationReceived || appointment.status === 'confirmed') {
        return { shouldFlag: false }
      }
      
      // Skip if patient opted out (respect GDPR rights)
      if (notifications.optedOut) {
        return { shouldFlag: false }
      }
      
      // Check if both notifications were sent
      const firstSent = notifications.firstNotification.sent
      const secondSent = notifications.secondNotification.sent
      
      if (!firstSent && !secondSent) {
        return { shouldFlag: false } // No notifications sent
      }
      
      // Get doctor's flagging configuration
      const config = await this.getDoctorFlaggingConfig(appointment.doctorId)
      
      if (!config.enableAutoFlagging) {
        return { shouldFlag: false }
      }
      
      // Check if enough time has passed since last notification
      const lastNotificationTime = secondSent 
        ? notifications.secondNotification.sentAt?.toDate()
        : notifications.firstNotification.sentAt?.toDate()
      
      if (!lastNotificationTime) {
        return { shouldFlag: false }
      }
      
      const now = new Date()
      const hoursElapsed = (now.getTime() - lastNotificationTime.getTime()) / (1000 * 60 * 60)
      
      if (hoursElapsed < config.responseTimeoutHours) {
        return { shouldFlag: false } // Not enough time passed
      }
      
      // Check if appointment time has passed
      const appointmentTime = appointment.dateTime instanceof Date 
        ? appointment.dateTime 
        : appointment.dateTime.toDate()
      
      const appointmentPassed = now > appointmentTime
      
      if (!appointmentPassed) {
        return { shouldFlag: false } // Appointment hasn't happened yet
      }
      
      // Check if patient already flagged for this appointment
      const existingFlag = await this.getPatientFlagForAppointment(
        appointment.id,
        this.getPatientId(appointment)
      )
      
      if (existingFlag) {
        return { shouldFlag: false } // Already flagged
      }
      
      // Determine flag reason based on notification status
      let reason: FlagReason = 'no_response_to_notifications'
      
      if (firstSent && secondSent) {
        reason = 'no_response_to_notifications'
      } else if (firstSent) {
        reason = 'no_response_to_notifications'
      }
      
      return { shouldFlag: true, reason }
    } catch (error) {
      console.error('Error checking if patient should be flagged:', error)
      return { shouldFlag: false }
    }
  }
  
  /**
   * Create an automatic flag for a non-responsive patient
   */
  private static async createAutomaticFlag(
    appointment: AppointmentWithNotifications,
    reason: FlagReason
  ): Promise<PatientFlag> {
    try {
      const patientId = this.getPatientId(appointment)
      const config = await this.getDoctorFlaggingConfig(appointment.doctorId)
      
      // Check GDPR compliance
      const gdprValidation = await this.validateGDPRCompliance(patientId, appointment.doctorId)
      
      if (!gdprValidation.gdprCompliant) {
        throw new Error('GDPR compliance check failed for patient flagging')
      }
      
      const now = serverTimestamp() as Timestamp
      const retentionExpiry = new Date()
      retentionExpiry.setMonth(retentionExpiry.getMonth() + config.flagRetentionMonths)
      
      const flag: Omit<PatientFlag, 'id'> = {
        patientId,
        patientName: appointment.patientName,
        patientEmail: appointment.patientEmail,
        doctorId: appointment.doctorId,
        reason,
        severity: config.flagSeverityForNoResponse,
        status: 'active',
        description: this.generateFlagDescription(appointment, reason),
        appointmentId: appointment.id,
        appointmentDateTime: appointment.dateTime instanceof Date 
          ? Timestamp.fromDate(appointment.dateTime)
          : appointment.dateTime,
        notificationsSent: this.countNotificationsSent(appointment),
        lastNotificationSent: this.getLastNotificationTime(appointment),
        responseDeadline: Timestamp.fromDate(
          new Date(Date.now() + config.responseTimeoutHours * 60 * 60 * 1000)
        ),
        dataRetentionExpiry: Timestamp.fromDate(retentionExpiry),
        patientNotified: false,
        createdAt: now,
        updatedAt: now,
        createdBy: 'system'
      }
      
      // Create flag document
      const flagRef = await addDoc(collection(db, 'patientFlags'), flag)
      const createdFlag = { id: flagRef.id, ...flag }
      
      // Update patient flag summary
      await this.updatePatientFlagSummary(patientId)
      
      // Log audit trail
      await this.logFlagAudit({
        flagId: flagRef.id,
        patientId,
        doctorId: appointment.doctorId,
        action: 'created',
        performedBy: 'system',
        performedByType: 'system',
        changeReason: `Automatic flag for ${reason}`,
        legalBasis: 'legitimate_interest',
        patientConsent: gdprValidation.valid
      })
      
      console.log(`Created automatic flag ${flagRef.id} for patient ${appointment.patientName}`)
      
      return createdFlag
    } catch (error) {
      console.error('Error creating automatic flag:', error)
      throw new Error('Nu s-a putut crea semnalizarea automată')
    }
  }
  
  /**
   * Create doctor alert for flagged patient
   */
  private static async createDoctorAlert(
    appointment: AppointmentWithNotifications,
    reason: FlagReason
  ): Promise<DoctorAlert> {
    try {
      const now = serverTimestamp() as Timestamp
      const appointmentTime = appointment.dateTime instanceof Date 
        ? appointment.dateTime 
        : appointment.dateTime.toDate()
      
      const alert: Omit<DoctorAlert, 'id'> = {
        doctorId: appointment.doctorId,
        type: 'patient_flagged',
        severity: 'warning',
        title: 'Pacient semnalizat pentru lipsa de răspuns',
        message: `${appointment.patientName} a fost semnalizat pentru că nu a răspuns la notificările pentru programarea din ${appointmentTime.toLocaleDateString('ro-RO')} la ${appointmentTime.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}.`,
        patientId: this.getPatientId(appointment),
        patientName: appointment.patientName,
        appointmentId: appointment.id,
        read: false,
        acknowledged: false,
        dismissed: false,
        requiresAction: true,
        actionDeadline: Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)), // 24 hours
        createdAt: now
      }
      
      const alertRef = await addDoc(collection(db, 'doctorAlerts'), alert)
      const createdAlert = { id: alertRef.id, ...alert }
      
      console.log(`Created doctor alert ${alertRef.id} for flagged patient ${appointment.patientName}`)
      
      return createdAlert
    } catch (error) {
      console.error('Error creating doctor alert:', error)
      throw new Error('Nu s-a putut crea alerta pentru doctor')
    }
  }
  
  /**
   * Get patient flag summary with statistics
   */
  static async getPatientFlagSummary(patientId: string): Promise<PatientFlagSummary | null> {
    try {
      const summaryRef = doc(db, 'patientFlagSummaries', patientId)
      const summarySnap = await getDoc(summaryRef)
      
      if (!summarySnap.exists()) {
        return null
      }
      
      return summarySnap.data() as PatientFlagSummary
    } catch (error) {
      console.error('Error getting patient flag summary:', error)
      throw new Error('Nu s-au putut încărca statisticile de semnalizare')
    }
  }
  
  /**
   * Get all flags for a patient
   */
  static async getPatientFlags(
    patientId: string,
    includeResolved: boolean = false
  ): Promise<PatientFlag[]> {
    try {
      let flagsQuery = query(
        collection(db, 'patientFlags'),
        where('patientId', '==', patientId),
        orderBy('createdAt', 'desc')
      )
      
      if (!includeResolved) {
        flagsQuery = query(
          collection(db, 'patientFlags'),
          where('patientId', '==', patientId),
          where('status', '==', 'active'),
          orderBy('createdAt', 'desc')
        )
      }
      
      const snapshot = await getDocs(flagsQuery)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PatientFlag[]
    } catch (error) {
      console.error('Error getting patient flags:', error)
      throw new Error('Nu s-au putut încărca semnalizările pacientului')
    }
  }
  
  /**
   * Get doctor alerts
   */
  static async getDoctorAlerts(
    doctorId: string,
    unreadOnly: boolean = false
  ): Promise<DoctorAlert[]> {
    try {
      let alertsQuery = query(
        collection(db, 'doctorAlerts'),
        where('doctorId', '==', doctorId),
        orderBy('createdAt', 'desc'),
        limit(50)
      )
      
      if (unreadOnly) {
        alertsQuery = query(
          collection(db, 'doctorAlerts'),
          where('doctorId', '==', doctorId),
          where('read', '==', false),
          orderBy('createdAt', 'desc'),
          limit(50)
        )
      }
      
      const snapshot = await getDocs(alertsQuery)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DoctorAlert[]
    } catch (error) {
      console.error('Error getting doctor alerts:', error)
      throw new Error('Nu s-au putut încărca alertele')
    }
  }
  
  /**
   * Mark doctor alert as read
   */
  static async markAlertAsRead(alertId: string): Promise<void> {
    try {
      const alertRef = doc(db, 'doctorAlerts', alertId)
      await updateDoc(alertRef, {
        read: true,
        readAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error marking alert as read:', error)
      throw new Error('Nu s-a putut marca alerta ca citită')
    }
  }
  
  /**
   * Resolve a patient flag
   */
  static async resolvePatientFlag(
    flagId: string,
    resolutionNotes: string,
    resolvedBy: string
  ): Promise<void> {
    try {
      const flagRef = doc(db, 'patientFlags', flagId)
      const flagSnap = await getDoc(flagRef)
      
      if (!flagSnap.exists()) {
        throw new Error('Semnalizarea nu a fost găsită')
      }
      
      const flag = flagSnap.data() as PatientFlag
      
      await updateDoc(flagRef, {
        status: 'resolved',
        resolvedAt: serverTimestamp(),
        resolvedBy,
        resolutionNotes,
        updatedAt: serverTimestamp()
      })
      
      // Update patient flag summary
      await this.updatePatientFlagSummary(flag.patientId)
      
      // Log audit trail
      await this.logFlagAudit({
        flagId,
        patientId: flag.patientId,
        doctorId: flag.doctorId,
        action: 'resolved',
        performedBy: resolvedBy,
        performedByType: 'doctor',
        changeReason: resolutionNotes,
        legalBasis: 'legitimate_interest',
        patientConsent: true
      })
      
      console.log(`Resolved flag ${flagId}`)
    } catch (error) {
      console.error('Error resolving patient flag:', error)
      throw new Error('Nu s-a putut rezolva semnalizarea')
    }
  }
  
  /**
   * Get doctor's flagging configuration
   */
  private static async getDoctorFlaggingConfig(doctorId: string): Promise<FlaggingConfiguration> {
    try {
      const configRef = doc(db, 'flaggingConfigurations', doctorId)
      const configSnap = await getDoc(configRef)
      
      if (configSnap.exists()) {
        return configSnap.data() as FlaggingConfiguration
      }
      
      // Create default configuration
      const defaultConfig: FlaggingConfiguration = {
        ...DEFAULT_FLAGGING_CONFIG,
        doctorId,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp
      }
      
      await setDoc(configRef, defaultConfig)
      return defaultConfig
    } catch (error) {
      console.error('Error getting flagging configuration:', error)
      return {
        ...DEFAULT_FLAGGING_CONFIG,
        doctorId,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp
      }
    }
  }
  
  /**
   * Update patient flag summary statistics
   */
  private static async updatePatientFlagSummary(patientId: string): Promise<void> {
    try {
      // Get all flags for patient
      const allFlags = await this.getPatientFlags(patientId, true)
      
      if (allFlags.length === 0) {
        // Delete summary if no flags
        const summaryRef = doc(db, 'patientFlagSummaries', patientId)
        await deleteDoc(summaryRef)
        return
      }
      
      const activeFlags = allFlags.filter(flag => flag.status === 'active')
      const resolvedFlags = allFlags.filter(flag => flag.status === 'resolved')
      
      // Calculate severity breakdown
      const flagsBySeverity = {
        low: allFlags.filter(flag => flag.severity === 'low').length,
        medium: allFlags.filter(flag => flag.severity === 'medium').length,
        high: allFlags.filter(flag => flag.severity === 'high').length
      }
      
      // Determine risk level
      let riskLevel: 'none' | 'low' | 'medium' | 'high' = 'none'
      if (flagsBySeverity.high > 0) {
        riskLevel = 'high'
      } else if (flagsBySeverity.medium > 2) {
        riskLevel = 'high'
      } else if (flagsBySeverity.medium > 0) {
        riskLevel = 'medium'
      } else if (flagsBySeverity.low > 3) {
        riskLevel = 'medium'
      } else if (flagsBySeverity.low > 0) {
        riskLevel = 'low'
      }
      
      const summary: PatientFlagSummary = {
        patientId,
        patientName: allFlags[0].patientName,
        patientEmail: allFlags[0].patientEmail,
        totalFlags: allFlags.length,
        activeFlags: activeFlags.length,
        resolvedFlags: resolvedFlags.length,
        flagsBySeverity,
        lastFlagDate: allFlags[0]?.createdAt,
        lastResolutionDate: resolvedFlags[0]?.resolvedAt,
        riskLevel,
        consentToTracking: true, // TODO: Get from patient preferences
        canBeContacted: true, // TODO: Get from patient preferences
        firstFlagDate: allFlags[allFlags.length - 1]?.createdAt,
        lastUpdated: serverTimestamp() as Timestamp
      }
      
      const summaryRef = doc(db, 'patientFlagSummaries', patientId)
      await setDoc(summaryRef, summary)
    } catch (error) {
      console.error('Error updating patient flag summary:', error)
      // Don't throw - this is a background operation
    }
  }
  
  /**
   * Validate GDPR compliance for flagging operations
   */
  private static async validateGDPRCompliance(
    patientId: string,
    doctorId: string
  ): Promise<FlaggingValidationResult> {
    try {
      // Check if patient has given consent to data processing
      // This would integrate with the notification preferences system
      
      // For now, assume legitimate interest basis for medical practice
      return {
        valid: true,
        canFlag: true,
        gdprCompliant: true,
        errors: [],
        warnings: []
      }
    } catch (error) {
      console.error('Error validating GDPR compliance:', error)
      return {
        valid: false,
        canFlag: false,
        gdprCompliant: false,
        errors: ['Nu s-a putut verifica conformitatea GDPR'],
        warnings: []
      }
    }
  }
  
  /**
   * Log audit trail for flag operations (GDPR compliance)
   */
  private static async logFlagAudit(auditData: Omit<FlagAuditLog, 'id' | 'timestamp'>): Promise<void> {
    try {
      const auditLog: Omit<FlagAuditLog, 'id'> = {
        ...auditData,
        timestamp: serverTimestamp() as Timestamp
      }
      
      await addDoc(collection(db, 'flagAuditLogs'), auditLog)
    } catch (error) {
      console.error('Error logging flag audit:', error)
      // Don't throw - audit logging shouldn't break main functionality
    }
  }
  
  /**
   * Helper methods
   */
  private static getPatientId(appointment: AppointmentWithNotifications): string {
    return appointment.patientEmail || appointment.patientName || appointment.id
  }
  
  private static countNotificationsSent(appointment: AppointmentWithNotifications): number {
    let count = 0
    if (appointment.notifications.firstNotification.sent) count++
    if (appointment.notifications.secondNotification.sent) count++
    return count
  }
  
  private static getLastNotificationTime(appointment: AppointmentWithNotifications): Timestamp | undefined {
    const { firstNotification, secondNotification } = appointment.notifications
    
    if (secondNotification.sent && secondNotification.sentAt) {
      return secondNotification.sentAt
    }
    
    if (firstNotification.sent && firstNotification.sentAt) {
      return firstNotification.sentAt
    }
    
    return undefined
  }
  
  private static generateFlagDescription(
    appointment: AppointmentWithNotifications,
    reason: FlagReason
  ): string {
    const appointmentTime = appointment.dateTime instanceof Date 
      ? appointment.dateTime 
      : appointment.dateTime.toDate()
    
    const formattedTime = appointmentTime.toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    
    switch (reason) {
      case 'no_response_to_notifications':
        return `Pacientul nu a răspuns la notificările pentru programarea din ${formattedTime}`
      case 'multiple_no_shows':
        return `Pacientul nu s-a prezentat la programarea din ${formattedTime}`
      default:
        return `Semnalizat pentru programarea din ${formattedTime}`
    }
  }
  
  private static async getPatientFlagForAppointment(
    appointmentId: string,
    patientId: string
  ): Promise<PatientFlag | null> {
    try {
      const flagQuery = query(
        collection(db, 'patientFlags'),
        where('appointmentId', '==', appointmentId),
        where('patientId', '==', patientId),
        limit(1)
      )
      
      const snapshot = await getDocs(flagQuery)
      
      if (snapshot.empty) {
        return null
      }
      
      const doc = snapshot.docs[0]
      return {
        id: doc.id,
        ...doc.data()
      } as PatientFlag
    } catch (error) {
      console.error('Error getting patient flag for appointment:', error)
      return null
    }
  }
  
  /**
   * Get flagged patients for a doctor with UI display information
   */
  static async getFlaggedPatientsForDoctor(doctorId: string): Promise<{
    patientId: string
    patientName: string
    flagCount: number
    riskLevel: 'none' | 'low' | 'medium' | 'high'
    lastFlagDate?: Date
  }[]> {
    try {
      const summariesQuery = query(
        collection(db, 'patientFlagSummaries'),
        where('activeFlags', '>', 0)
      )
      
      const snapshot = await getDocs(summariesQuery)
      
      return snapshot.docs
        .map(doc => doc.data() as PatientFlagSummary)
        .filter(summary => {
          // Filter by doctor - would need to check if patient has appointments with this doctor
          // For now, return all flagged patients
          return summary.activeFlags > 0
        })
        .map(summary => ({
          patientId: summary.patientId,
          patientName: summary.patientName,
          flagCount: summary.activeFlags,
          riskLevel: summary.riskLevel,
          lastFlagDate: summary.lastFlagDate?.toDate()
        }))
    } catch (error) {
      console.error('Error getting flagged patients for doctor:', error)
      throw new Error('Nu s-au putut încărca pacienții semnalizați')
    }
  }
}

export default PatientFlaggingService
