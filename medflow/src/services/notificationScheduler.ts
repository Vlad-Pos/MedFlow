/**
 * Notification Scheduler Service for MedFlow
 * 
 * Handles scheduling and execution of appointment notification reminders
 * with specific timing rules (9 AM day before, 3 PM same day).
 * 
 * @author MedFlow Team
 * @version 1.0
 */

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  DocumentReference,
  Timestamp
} from 'firebase/firestore'
import { db } from './firebase'
import { 
  NotificationSchedulerJob, 
  AppointmentWithNotifications,
  NotificationChannel
} from '../types/notifications'
import PatientNotificationPreferencesService from './notificationPreferences'
import { NotificationSenderService } from './notificationSender'

/**
 * NotificationSchedulerService
 * 
 * Manages the scheduling and execution of appointment notifications
 * according to Romanian medical practice timing requirements.
 */
export class NotificationSchedulerService {
  
  /**
   * Schedule notifications for a new appointment
   */
  static async scheduleAppointmentNotifications(appointment: AppointmentWithNotifications): Promise<void> {
    try {
      // Check if patient can receive notifications
      const eligibility = await PatientNotificationPreferencesService.canReceiveNotifications(
        appointment.patientEmail || appointment.id // Use email as patient ID or fallback to appointment ID
      )
      
      if (!eligibility.canReceive) {
        console.log(`Skipping notifications for appointment ${appointment.id}: ${eligibility.reason}`)
        return
      }
      
      const appointmentDateTime = appointment.dateTime instanceof Date 
        ? appointment.dateTime 
        : appointment.dateTime.toDate()
      
      // Schedule first notification (9 AM, day before)
      const firstNotificationTime = this.calculateFirstNotificationTime(appointmentDateTime)
      await this.createSchedulerJob(appointment.id, 'first', firstNotificationTime)
      
      // Schedule second notification (3 PM, same day)
      const secondNotificationTime = this.calculateSecondNotificationTime(appointmentDateTime)
      await this.createSchedulerJob(appointment.id, 'second', secondNotificationTime)
      
      console.log(`Scheduled notifications for appointment ${appointment.id}`)
    } catch (error) {
      console.error('Error scheduling appointment notifications:', error)
      throw new Error('Nu s-au putut programa notificările pentru programare')
    }
  }
  
  /**
   * Cancel all scheduled notifications for an appointment
   */
  static async cancelAppointmentNotifications(appointmentId: string): Promise<void> {
    try {
      const jobsQuery = query(
        collection(db, 'notificationSchedulerJobs'),
        where('appointmentId', '==', appointmentId),
        where('status', 'in', ['pending', 'executing'])
      )
      
      const snapshot = await getDocs(jobsQuery)
      
      const cancelPromises = snapshot.docs.map(jobDoc => 
        updateDoc(jobDoc.ref, {
          status: 'cancelled',
          updatedAt: serverTimestamp()
        })
      )
      
      await Promise.all(cancelPromises)
      
      console.log(`Cancelled ${snapshot.docs.length} notification jobs for appointment ${appointmentId}`)
    } catch (error) {
      console.error('Error cancelling appointment notifications:', error)
      throw new Error('Nu s-au putut anula notificările programării')
    }
  }
  
  /**
   * Reschedule notifications when appointment time changes
   */
  static async rescheduleAppointmentNotifications(
    appointmentId: string,
    newDateTime: Date
  ): Promise<void> {
    try {
      // Cancel existing notifications
      await this.cancelAppointmentNotifications(appointmentId)
      
      // Create new scheduler jobs with updated times
      const firstNotificationTime = this.calculateFirstNotificationTime(newDateTime)
      await this.createSchedulerJob(appointmentId, 'first', firstNotificationTime)
      
      const secondNotificationTime = this.calculateSecondNotificationTime(newDateTime)
      await this.createSchedulerJob(appointmentId, 'second', secondNotificationTime)
      
      console.log(`Rescheduled notifications for appointment ${appointmentId}`)
    } catch (error) {
      console.error('Error rescheduling appointment notifications:', error)
      throw new Error('Nu s-au putut reprograma notificările')
    }
  }
  
  /**
   * Execute pending notification jobs (called by scheduler)
   */
  static async executePendingNotifications(): Promise<void> {
    try {
      const now = new Date()
      
      // Find jobs that are ready to execute
      const jobsQuery = query(
        collection(db, 'notificationSchedulerJobs'),
        where('status', '==', 'pending'),
        where('executeAt', '<=', Timestamp.fromDate(now)), // Use serverTimestamp for comparison
        orderBy('executeAt'),
        limit(50) // Process in batches
      )
      
      const snapshot = await getDocs(jobsQuery)
      
      if (snapshot.empty) {
        return
      }
      
      console.log(`Processing ${snapshot.docs.length} notification jobs`)
      
      // Process jobs sequentially to avoid overwhelming the system
      for (const jobDoc of snapshot.docs) {
        const job = jobDoc.data() as NotificationSchedulerJob
        await this.executeNotificationJob(jobDoc.id, job)
      }
    } catch (error) {
      console.error('Error executing pending notifications:', error)
    }
  }
  
  /**
   * Calculate first notification time (9 AM, day before appointment)
   */
  private static calculateFirstNotificationTime(appointmentDateTime: Date): Date {
    const notificationDate = new Date(appointmentDateTime)
    notificationDate.setDate(appointmentDateTime.getDate() - 1) // Day before
    notificationDate.setHours(9, 0, 0, 0) // 9 AM
    
    // If the calculated time is in the past, don't schedule
    const now = new Date()
    if (notificationDate <= now) {
      // Schedule for immediate execution if we're past the optimal time
      return new Date(now.getTime() + 60000) // 1 minute from now
    }
    
    return notificationDate
  }
  
  /**
   * Calculate second notification time (3 PM, same day as appointment)
   */
  private static calculateSecondNotificationTime(appointmentDateTime: Date): Date {
    const notificationDate = new Date(appointmentDateTime)
    notificationDate.setHours(15, 0, 0, 0) // 3 PM same day
    
    // Ensure second notification is at least 1 hour before appointment
    const oneHourBefore = new Date(appointmentDateTime.getTime() - 60 * 60 * 1000)
    if (notificationDate >= oneHourBefore) {
      // Schedule 2 hours before appointment instead
      return new Date(appointmentDateTime.getTime() - 2 * 60 * 60 * 1000)
    }
    
    // If the calculated time is in the past, don't schedule
    const now = new Date()
    if (notificationDate <= now) {
      // Only schedule if appointment is still in the future
      if (appointmentDateTime > now) {
        return new Date(now.getTime() + 60000) // 1 minute from now
      }
      return notificationDate // Will be skipped in execution
    }
    
    return notificationDate
  }
  
  /**
   * Create a scheduler job
   */
  private static async createSchedulerJob(
    appointmentId: string,
    notificationType: 'first' | 'second',
    executeAt: Date
  ): Promise<string> {
    const job: Omit<NotificationSchedulerJob, 'id'> = {
      appointmentId,
      notificationType,
      scheduledFor: Timestamp.fromDate(executeAt), // Use serverTimestamp
      executeAt: Timestamp.fromDate(executeAt), // Use serverTimestamp
      status: 'pending',
      retryCount: 0,
      maxRetries: 3,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp
    }
    
    const docRef = await addDoc(collection(db, 'notificationSchedulerJobs'), job)
    return docRef.id
  }
  
  /**
   * Execute a specific notification job
   */
  private static async executeNotificationJob(jobId: string, job: NotificationSchedulerJob): Promise<void> {
    const jobRef = doc(db, 'notificationSchedulerJobs', jobId)
    
    try {
      // Mark job as executing
      await updateDoc(jobRef, {
        status: 'executing',
        executedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      
      // Get appointment data
      const appointmentRef = doc(db, 'appointments', job.appointmentId)
      const appointmentSnap = await getDoc(appointmentRef)
      
      if (!appointmentSnap.exists()) {
        throw new Error('Appointment not found')
      }
      
      const appointment = appointmentSnap.data() as AppointmentWithNotifications
      
      // Check if notification already sent
      const notificationKey = job.notificationType === 'first' ? 'firstNotification' : 'secondNotification'
      if (appointment.notifications?.[notificationKey]?.sent) {
        console.log(`Notification ${job.notificationType} already sent for appointment ${job.appointmentId}`)
        await this.markJobCompleted(jobRef)
        return
      }
      
      // Check if patient responded to first notification (skip second if confirmed)
      if (job.notificationType === 'second' && appointment.notifications?.confirmationReceived) {
        console.log(`Skipping second notification for appointment ${job.appointmentId} - already confirmed`)
        await this.markJobCompleted(jobRef)
        return
      }
      
      // Get patient preferences
      const patientId = appointment.patientEmail || appointment.id
      const eligibility = await PatientNotificationPreferencesService.canReceiveNotifications(patientId)
      
      if (!eligibility.canReceive) {
        console.log(`Patient cannot receive notifications: ${eligibility.reason}`)
        await this.markJobCompleted(jobRef)
        return
      }
      
      // Send notification through preferred channel
      const preferredChannel = this.selectOptimalChannel(eligibility.availableChannels)
      const success = await NotificationSenderService.sendAppointmentNotification(
        appointment,
        preferredChannel,
        job.notificationType
      )
      
      if (success) {
        // Update appointment with notification status
        await updateDoc(appointmentRef, {
          [`notifications.${notificationKey}.sent`]: true,
          [`notifications.${notificationKey}.sentAt`]: serverTimestamp(),
          [`notifications.${notificationKey}.channel`]: preferredChannel,
          [`notifications.${notificationKey}.deliveryStatus`]: 'delivered'
        })
        
        await this.markJobCompleted(jobRef)
        console.log(`Successfully sent ${job.notificationType} notification for appointment ${job.appointmentId}`)
      } else {
        throw new Error('Notification sending failed')
      }
      
    } catch (error) {
      console.error(`Error executing notification job ${jobId}:`, error)
      
      const newRetryCount = job.retryCount + 1
      
      if (newRetryCount <= job.maxRetries) {
        // Schedule retry
        const retryAt = new Date(Date.now() + Math.pow(2, newRetryCount) * 60000) // Exponential backoff
        
        await updateDoc(jobRef, {
          status: 'pending',
          retryCount: newRetryCount,
          executeAt: Timestamp.fromDate(retryAt), // Use serverTimestamp
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          updatedAt: serverTimestamp()
        })
        
        console.log(`Scheduled retry ${newRetryCount}/${job.maxRetries} for job ${jobId}`)
      } else {
        // Mark as failed
        await updateDoc(jobRef, {
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          updatedAt: serverTimestamp()
        })
        
        console.error(`Job ${jobId} failed after ${job.maxRetries} retries`)
      }
    }
  }
  
  /**
   * Mark a job as completed
   */
  private static async markJobCompleted(jobRef: DocumentReference): Promise<void> {
    await updateDoc(jobRef, {
      status: 'completed',
      completedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
  }
  
  /**
   * Select the optimal notification channel from available options
   */
  private static selectOptimalChannel(availableChannels: NotificationChannel[]): NotificationChannel {
    // Priority order: email > SMS > in-app
    if (availableChannels.includes('email')) {
      return 'email'
    }
    if (availableChannels.includes('sms')) {
      return 'sms'
    }
    return 'in_app'
  }
  
  /**
   * Clean up old completed/failed jobs (maintenance function)
   */
  static async cleanupOldJobs(olderThanDays: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)
      
      const oldJobsQuery = query(
        collection(db, 'notificationSchedulerJobs'),
        where('status', 'in', ['completed', 'failed']),
        where('updatedAt', '<=', Timestamp.fromDate(cutoffDate)) // Use serverTimestamp for comparison
      )
      
      const snapshot = await getDocs(oldJobsQuery)
      
      const deletePromises = snapshot.docs.map(jobDoc => deleteDoc(jobDoc.ref))
      await Promise.all(deletePromises)
      
      console.log(`Cleaned up ${snapshot.docs.length} old notification jobs`)
    } catch (error) {
      console.error('Error cleaning up old jobs:', error)
    }
  }
  
  /**
   * Get notification statistics for monitoring
   */
  static async getNotificationStats(startDate: Date, endDate: Date): Promise<{
    totalJobs: number
    completedJobs: number
    failedJobs: number
    pendingJobs: number
    averageExecutionTime: number
  }> {
    try {
      const statsQuery = query(
        collection(db, 'notificationSchedulerJobs'),
        where('createdAt', '>=', Timestamp.fromDate(startDate)), // Use serverTimestamp for comparison
        where('createdAt', '<=', Timestamp.fromDate(endDate)) // Use serverTimestamp for comparison
      )
      
      const snapshot = await getDocs(statsQuery)
      const jobs = snapshot.docs.map(doc => doc.data() as NotificationSchedulerJob)
      
      const stats = {
        totalJobs: jobs.length,
        completedJobs: jobs.filter(job => job.status === 'completed').length,
        failedJobs: jobs.filter(job => job.status === 'failed').length,
        pendingJobs: jobs.filter(job => job.status === 'pending').length,
        averageExecutionTime: 0
      }
      
      // Calculate average execution time for completed jobs
      const completedWithTimes = jobs.filter(job => 
        job.status === 'completed' && job.executedAt && job.completedAt
      )
      
      if (completedWithTimes.length > 0) {
        const totalExecutionTime = completedWithTimes.reduce((sum, job) => {
          const executionTime = job.completedAt!.toMillis() - job.executedAt!.toMillis()
          return sum + executionTime
        }, 0)
        stats.averageExecutionTime = totalExecutionTime / completedWithTimes.length
      }
      
      return stats
    } catch (error) {
      console.error('Error getting notification stats:', error)
      throw new Error('Nu s-au putut încărca statisticile notificărilor')
    }
  }
}

export default NotificationSchedulerService
