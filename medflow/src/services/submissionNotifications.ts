/**
 * Submission Notifications Service for MedFlow
 * 
 * Real-time notification system for government submission status updates:
 * - In-app notifications for submission events
 * - Email notifications (optional)
 * - SMS notifications (optional)
 * - Push notifications for mobile apps
 * - Notification preferences management
 * - GDPR-compliant notification handling
 * 
 * @author MedFlow Team
 * @version 1.0
 */

import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  getDocs
} from 'firebase/firestore'
import { db } from './firebase'
import {
  SubmissionStatus,
  SubmissionLogEntry,
  SubmissionBatch
} from '../types/patientReports'
import { showNotification } from '../components/Notification'
import { isDemoMode } from '../utils/demo'

// ==========================================
// NOTIFICATION TYPES
// ==========================================

export interface NotificationPreferences {
  userId: string
  inApp: boolean
  email: boolean
  emailAddress?: string
  sms: boolean
  phoneNumber?: string
  push: boolean
  
  // Notification types
  submissionSuccess: boolean
  submissionFailure: boolean
  submissionRetry: boolean
  submissionScheduled: boolean
  periodReminders: boolean
  
  updatedAt: Timestamp
}

export interface SubmissionNotification {
  id: string
  userId: string
  type: 'submission_success' | 'submission_failure' | 'submission_retry' | 'submission_scheduled' | 'period_reminder' | 'manual_action_required'
  title: string
  message: string
  data?: Record<string, any>
  read: boolean
  sent: boolean
  sentAt?: Timestamp
  createdAt: Timestamp
  
  // Delivery channels
  channels: {
    inApp: boolean
    email: boolean
    sms: boolean
    push: boolean
  }
  
  // Submission context
  batchId?: string
  submissionStatus?: SubmissionStatus
  governmentReference?: string
  
  // Priority and urgency
  priority: 'low' | 'normal' | 'high' | 'critical'
  urgent: boolean
  
  // Compliance
  gdprCompliant: boolean
  retentionDays: number
}

export interface EmailNotification {
  to: string
  subject: string
  body: string
  html?: string
  attachments?: Array<{
    filename: string
    content: string
    contentType: string
  }>
}

export interface SMSNotification {
  to: string
  message: string
}

// ==========================================
// DEMO DATA
// ==========================================

let demoNotifications: SubmissionNotification[] = []
let demoPreferences: NotificationPreferences[] = []
let demoNotificationSubscribers: ((notification: SubmissionNotification) => void)[] = []

function notifyDemoSubscribers(notification: SubmissionNotification) {
  demoNotificationSubscribers.forEach(callback => callback(notification))
  
  // Show in-app notification
  if (notification.channels.inApp) {
    const notificationType = notification.type.includes('success') ? 'success' :
                            notification.type.includes('failure') ? 'error' :
                            notification.type.includes('retry') ? 'warning' :
                            'info'
    
    showNotification(notification.message, notificationType)
  }
}

// ==========================================
// NOTIFICATION PREFERENCES
// ==========================================

/**
 * Gets notification preferences for a user
 */
export async function getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
  try {
    if (isDemoMode()) {
      const existing = demoPreferences.find(p => p.userId === userId)
      if (existing) return existing

      // Create default preferences
      const defaultPrefs: NotificationPreferences = {
        userId,
        inApp: true,
        email: true,
        emailAddress: 'doctor@medflow.ro',
        sms: false,
        phoneNumber: undefined,
        push: true,
        submissionSuccess: true,
        submissionFailure: true,
        submissionRetry: true,
        submissionScheduled: false,
        periodReminders: true,
        updatedAt: Timestamp.now()
      }

      demoPreferences.push(defaultPrefs)
      return defaultPrefs
    }

    const q = query(
      collection(db, 'notification_preferences'),
      where('userId', '==', userId),
      limit(1)
    )

    const snapshot = await getDocs(q)
    if (snapshot.empty) {
      // Create default preferences
      const defaultPrefs: Omit<NotificationPreferences, 'id'> = {
        userId,
        inApp: true,
        email: true,
        sms: false,
        push: true,
        submissionSuccess: true,
        submissionFailure: true,
        submissionRetry: true,
        submissionScheduled: false,
        periodReminders: true,
        updatedAt: serverTimestamp() as Timestamp
      }

      await addDoc(collection(db, 'notification_preferences'), defaultPrefs)
      return defaultPrefs as NotificationPreferences
    }

    return snapshot.docs[0].data() as NotificationPreferences
  } catch (error) {
    console.error('Error getting notification preferences:', error)
    throw new Error('Eroare la obținerea preferințelor de notificare')
  }
}

/**
 * Updates notification preferences for a user
 */
export async function updateNotificationPreferences(
  userId: string,
  preferences: Partial<NotificationPreferences>
): Promise<void> {
  try {
    if (isDemoMode()) {
      const index = demoPreferences.findIndex(p => p.userId === userId)
      if (index > -1) {
        demoPreferences[index] = {
          ...demoPreferences[index],
          ...preferences,
          updatedAt: Timestamp.now()
        }
      }
      return
    }

    const q = query(
      collection(db, 'notification_preferences'),
      where('userId', '==', userId),
      limit(1)
    )

    const snapshot = await getDocs(q)
    if (!snapshot.empty) {
      await updateDoc(snapshot.docs[0].ref, {
        ...preferences,
        updatedAt: serverTimestamp()
      })
    }
  } catch (error) {
    console.error('Error updating notification preferences:', error)
    throw new Error('Eroare la actualizarea preferințelor de notificare')
  }
}

// ==========================================
// NOTIFICATION CREATION
// ==========================================

/**
 * Creates a submission notification
 */
export async function createSubmissionNotification(
  userId: string,
  type: SubmissionNotification['type'],
  batchId: string,
  submissionStatus: SubmissionStatus,
  additionalData?: Record<string, any>
): Promise<string> {
  try {
    const preferences = await getNotificationPreferences(userId)
    
    // Check if this notification type is enabled
    const isEnabled = getNotificationEnabled(type, preferences)
    if (!isEnabled) {
      return '' // Don't create notification if disabled
    }

    const { title, message, priority } = generateNotificationContent(
      type,
      submissionStatus,
      batchId,
      additionalData
    )

    const notification: Omit<SubmissionNotification, 'id'> = {
      userId,
      type,
      title,
      message,
      data: additionalData,
      read: false,
      sent: false,
      createdAt: Timestamp.now(),
      
      channels: {
        inApp: preferences.inApp,
        email: preferences.email && !!preferences.emailAddress,
        sms: preferences.sms && !!preferences.phoneNumber,
        push: preferences.push
      },
      
      batchId,
      submissionStatus,
      governmentReference: additionalData?.governmentReference,
      
      priority,
      urgent: priority === 'critical' || type === 'submission_failure',
      
      gdprCompliant: true,
      retentionDays: 365 // 1 year retention
    }

    if (isDemoMode()) {
      const notificationId = `notif_${Date.now()}`
      const fullNotification: SubmissionNotification = {
        ...notification,
        id: notificationId
      }
      
      demoNotifications.push(fullNotification)
      
      // Send notification immediately
      await sendNotification(fullNotification, preferences)
      
      return notificationId
    }

    const docRef = await addDoc(collection(db, 'submission_notifications'), notification)
    
    // Send notification
    const fullNotification: SubmissionNotification = {
      ...notification,
      id: docRef.id
    }
    
    await sendNotification(fullNotification, preferences)
    
    return docRef.id
  } catch (error) {
    console.error('Error creating submission notification:', error)
    throw new Error('Eroare la crearea notificării')
  }
}

/**
 * Generates notification content based on type and status
 */
function generateNotificationContent(
  type: SubmissionNotification['type'],
  status: SubmissionStatus,
  batchId: string,
  data?: Record<string, any>
): { title: string; message: string; priority: SubmissionNotification['priority'] } {
  switch (type) {
    case 'submission_success':
      return {
        title: 'Trimitere reușită către guvern',
        message: `Lotul ${batchId} a fost trimis cu succes către autoritatea sanitară. Referință: ${data?.governmentReference || 'N/A'}`,
        priority: 'normal'
      }

    case 'submission_failure':
      return {
        title: 'Eroare la trimiterea către guvern',
        message: `Trimiterea lotului ${batchId} a eșuat. ${data?.error || 'Eroare necunoscută'}. Sistemul va reîncerca automat.`,
        priority: 'critical'
      }

    case 'submission_retry':
      return {
        title: 'Reîncercare trimitere programată',
        message: `Lotul ${batchId} va fi încercat din nou la ${data?.nextRetryAt ? new Date(data.nextRetryAt).toLocaleString('ro-RO') : 'în curând'}.`,
        priority: 'high'
      }

    case 'submission_scheduled':
      return {
        title: 'Trimitere programată',
        message: `Lotul ${batchId} a fost programat pentru trimitere automată către autoritatea sanitară.`,
        priority: 'low'
      }

    case 'period_reminder':
      return {
        title: 'Perioada de trimitere activă',
        message: 'Perioada de trimitere către guvern (5-10 ale lunii) este acum activă. Verificați rapoartele pregătite pentru trimitere.',
        priority: 'normal'
      }

    case 'manual_action_required':
      return {
        title: 'Acțiune manuală necesară',
        message: `Lotul ${batchId} necesită intervenție manuală. ${data?.reason || 'Verificați statusul pentru detalii.'}`,
        priority: 'high'
      }

    default:
      return {
        title: 'Notificare sistem',
        message: `Status actualizat pentru lotul ${batchId}: ${status}`,
        priority: 'normal'
      }
  }
}

/**
 * Checks if a notification type is enabled for a user
 */
function getNotificationEnabled(
  type: SubmissionNotification['type'],
  preferences: NotificationPreferences
): boolean {
  switch (type) {
    case 'submission_success':
      return preferences.submissionSuccess
    case 'submission_failure':
      return preferences.submissionFailure
    case 'submission_retry':
      return preferences.submissionRetry
    case 'submission_scheduled':
      return preferences.submissionScheduled
    case 'period_reminder':
      return preferences.periodReminders
    case 'manual_action_required':
      return true // Always send critical notifications
    default:
      return true
  }
}

// ==========================================
// NOTIFICATION DELIVERY
// ==========================================

/**
 * Sends a notification through enabled channels
 */
async function sendNotification(
  notification: SubmissionNotification,
  preferences: NotificationPreferences
): Promise<void> {
  try {
    const promises: Promise<void>[] = []

    // In-app notification
    if (notification.channels.inApp) {
      promises.push(sendInAppNotification(notification))
    }

    // Email notification
    if (notification.channels.email && preferences.emailAddress) {
      promises.push(sendEmailNotification(notification, preferences.emailAddress))
    }

    // SMS notification
    if (notification.channels.sms && preferences.phoneNumber) {
      promises.push(sendSMSNotification(notification, preferences.phoneNumber))
    }

    // Push notification
    if (notification.channels.push) {
      promises.push(sendPushNotification(notification))
    }

    await Promise.allSettled(promises)

    // Mark as sent
    if (isDemoMode()) {
      const index = demoNotifications.findIndex(n => n.id === notification.id)
      if (index > -1) {
        demoNotifications[index].sent = true
        demoNotifications[index].sentAt = Timestamp.now()
      }
    } else {
      await updateDoc(doc(db, 'submission_notifications', notification.id), {
        sent: true,
        sentAt: serverTimestamp()
      })
    }
  } catch (error) {
    console.error('Error sending notification:', error)
  }
}

/**
 * Sends in-app notification
 */
async function sendInAppNotification(notification: SubmissionNotification): Promise<void> {
  if (isDemoMode()) {
    notifyDemoSubscribers(notification)
    return
  }

  // In a real implementation, this would trigger real-time updates
  // through Firestore listeners or WebSocket connections
}

/**
 * Sends email notification
 */
async function sendEmailNotification(
  notification: SubmissionNotification,
  emailAddress: string
): Promise<void> {
  try {
    if (isDemoMode()) {
      console.log(`📧 Email sent to ${emailAddress}:`, {
        subject: notification.title,
        body: notification.message
      })
      return
    }

    const emailData: EmailNotification = {
      to: emailAddress,
      subject: `[MedFlow] ${notification.title}`,
      body: generateEmailBody(notification),
      html: generateEmailHTML(notification)
    }

    // In a real implementation, this would use a service like SendGrid, Mailgun, etc.
    await sendEmail(emailData)
  } catch (error) {
    console.error('Error sending email notification:', error)
  }
}

/**
 * Sends SMS notification
 */
async function sendSMSNotification(
  notification: SubmissionNotification,
  phoneNumber: string
): Promise<void> {
  try {
    if (isDemoMode()) {
      console.log(`📱 SMS sent to ${phoneNumber}:`, notification.message)
      return
    }

    const smsData: SMSNotification = {
      to: phoneNumber,
      message: `[MedFlow] ${notification.title}: ${notification.message}`
    }

    // In a real implementation, this would use a service like Twilio, AWS SNS, etc.
    await sendSMS(smsData)
  } catch (error) {
    console.error('Error sending SMS notification:', error)
  }
}

/**
 * Sends push notification
 */
async function sendPushNotification(notification: SubmissionNotification): Promise<void> {
  try {
    if (isDemoMode()) {
      console.log('🔔 Push notification:', {
        title: notification.title,
        body: notification.message
      })
      return
    }

    // In a real implementation, this would use Firebase Cloud Messaging (FCM)
    // or another push notification service
  } catch (error) {
    console.error('Error sending push notification:', error)
  }
}

// ==========================================
// EMAIL AND SMS HELPERS
// ==========================================

/**
 * Generates email body (plain text)
 */
function generateEmailBody(notification: SubmissionNotification): string {
  return `
Dragă utilizator MedFlow,

${notification.message}

${notification.batchId ? `Lot: ${notification.batchId}` : ''}
${notification.governmentReference ? `Referință guvern: ${notification.governmentReference}` : ''}

Data: ${notification.createdAt.toDate().toLocaleString('ro-RO')}

Pentru mai multe detalii, conectați-vă la aplicația MedFlow.

Cu stimă,
Echipa MedFlow

---
Acest email a fost trimis automat de sistemul MedFlow.
Pentru a schimba preferințele de notificare, accesați setările contului.
`.trim()
}

/**
 * Generates email HTML
 */
function generateEmailHTML(notification: SubmissionNotification): string {
  const urgentBadge = notification.urgent ? 
    '<span style="background-color: #ef4444; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">URGENT</span>' : ''

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${notification.title}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h1 style="color: #2563eb; margin: 0 0 10px 0; font-size: 24px;">
      ${notification.title} ${urgentBadge}
    </h1>
    <div style="background-color: white; padding: 16px; border-radius: 6px; border-left: 4px solid #2563eb;">
      <p style="margin: 0; font-size: 16px;">${notification.message}</p>
    </div>
  </div>

  ${notification.batchId ? `
  <div style="background-color: #f3f4f6; padding: 16px; border-radius: 6px; margin-bottom: 20px;">
    <h3 style="margin: 0 0 10px 0; color: #374151;">Detalii trimitere</h3>
    <p style="margin: 5px 0;"><strong>Lot:</strong> ${notification.batchId}</p>
    ${notification.governmentReference ? `<p style="margin: 5px 0;"><strong>Referință guvern:</strong> ${notification.governmentReference}</p>` : ''}
    <p style="margin: 5px 0;"><strong>Status:</strong> ${notification.submissionStatus}</p>
    <p style="margin: 5px 0;"><strong>Data:</strong> ${notification.createdAt.toDate().toLocaleString('ro-RO')}</p>
  </div>
  ` : ''}

  <div style="text-align: center; margin-top: 30px;">
    <a href="https://app.medflow.ro" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
      Deschide MedFlow
    </a>
  </div>

  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center;">
    <p>Acest email a fost trimis automat de sistemul MedFlow.</p>
    <p>Pentru a schimba preferințele de notificare, accesați setările contului.</p>
  </div>
</body>
</html>
`.trim()
}

/**
 * Placeholder for actual email service integration
 */
async function sendEmail(emailData: EmailNotification): Promise<void> {
  // In a real implementation, integrate with:
  // - SendGrid
  // - Mailgun
  // - AWS SES
  // - Other email service providers
  
  console.log('📧 Email would be sent:', emailData)
}

/**
 * Placeholder for actual SMS service integration
 */
async function sendSMS(smsData: SMSNotification): Promise<void> {
  // In a real implementation, integrate with:
  // - Twilio
  // - AWS SNS
  // - Other SMS service providers
  
  console.log('📱 SMS would be sent:', smsData)
}

// ==========================================
// NOTIFICATION SUBSCRIPTION
// ==========================================

/**
 * Subscribes to real-time notifications for a user
 */
export function subscribeToNotifications(
  userId: string,
  callback: (notification: SubmissionNotification) => void
): () => void {
  if (isDemoMode()) {
    const subscriber = (notification: SubmissionNotification) => {
      if (notification.userId === userId) {
        callback(notification)
      }
    }

    demoNotificationSubscribers.push(subscriber)
    
    return () => {
      const index = demoNotificationSubscribers.indexOf(subscriber)
      if (index > -1) {
        demoNotificationSubscribers.splice(index, 1)
      }
    }
  }

  // Real implementation would use Firestore real-time listeners
  return () => {}
}

/**
 * Gets unread notifications for a user
 */
export async function getUnreadNotifications(userId: string): Promise<SubmissionNotification[]> {
  try {
    if (isDemoMode()) {
      return demoNotifications.filter(n => n.userId === userId && !n.read)
    }

    const q = query(
      collection(db, 'submission_notifications'),
      where('userId', '==', userId),
      where('read', '==', false),
      orderBy('createdAt', 'desc'),
      limit(50)
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SubmissionNotification))
  } catch (error) {
    console.error('Error getting unread notifications:', error)
    return []
  }
}

/**
 * Marks notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    if (isDemoMode()) {
      const index = demoNotifications.findIndex(n => n.id === notificationId)
      if (index > -1) {
        demoNotifications[index].read = true
      }
      return
    }

    await updateDoc(doc(db, 'submission_notifications', notificationId), {
      read: true
    })
  } catch (error) {
    console.error('Error marking notification as read:', error)
  }
}

// ==========================================
// AUTOMATED NOTIFICATIONS
// ==========================================

/**
 * Sends period reminder notifications
 */
export async function sendPeriodReminders(): Promise<void> {
  try {
    if (isDemoMode()) {
      // Create a period reminder for demo users
      const demoUserId = 'demo_user'
      await createSubmissionNotification(
        demoUserId,
        'period_reminder',
        '',
        'ready',
        { reminderType: 'submission_period_active' }
      )
      return
    }

    // In a real implementation, this would:
    // 1. Query all users with period reminders enabled
    // 2. Send notifications to each user
    // 3. Track sent reminders to avoid duplicates
  } catch (error) {
    console.error('Error sending period reminders:', error)
  }
}

/**
 * Sets up automated notification triggers
 */
export function setupNotificationTriggers(): void {
  // Check for submission period reminders daily at 9 AM
  const reminderInterval = setInterval(async () => {
    const now = new Date()
    if (now.getHours() === 9 && now.getMinutes() === 0) {
      const day = now.getDate()
      if (day === 5) { // Send reminder on 5th of month
        await sendPeriodReminders()
      }
    }
  }, 60000) // Check every minute

  // Store interval for cleanup
  if (typeof window !== 'undefined') {
    (window as any).__medflowNotificationTriggers = {
      reminderInterval
    }
  }
}

/**
 * Cleans up notification triggers
 */
export function cleanupNotificationTriggers(): void {
  if (typeof window !== 'undefined') {
    const triggers = (window as any).__medflowNotificationTriggers
    if (triggers) {
      clearInterval(triggers.reminderInterval)
      delete (window as any).__medflowNotificationTriggers
    }
  }
}
