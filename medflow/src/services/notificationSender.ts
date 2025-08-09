/**
 * Notification Sender Service for MedFlow
 * 
 * Handles multi-channel notification delivery with Romanian templates
 * and comprehensive error handling and delivery tracking.
 * 
 * @author MedFlow Team
 * @version 1.0
 */

import { 
  doc, 
  collection, 
  addDoc, 
  updateDoc,
  serverTimestamp, 
  Timestamp 
} from 'firebase/firestore'
import { db } from './firebase'
import { 
  AppointmentWithNotifications,
  NotificationChannel,
  NotificationTemplateData,
  NotificationDeliveryStatus,
  RomanianNotificationContent
} from '../types/notifications'
import PatientNotificationPreferencesService from './notificationPreferences'
import { format } from 'date-fns'
import { ro } from 'date-fns/locale'

/**
 * Romanian notification templates
 */
const ROMANIAN_TEMPLATES = {
  first: {
    subject: 'Confirmare programare - {clinicName}',
    body: `Bună ziua {patientName},

Vă reamintim despre programarea dumneavoastră de mâine:

📅 Data și ora: {appointmentDate} la {appointmentTime}
🏥 Clinica: {clinicName}
📍 Adresa: {clinicAddress}
👨‍⚕️ Doctor: {doctorName}

Pentru a confirma prezența, accesați linkul de mai jos:
{confirmationLink}

Dacă doriți să reprogramați sau să anulați, vă rugăm să ne contactați.

{specialInstructions}

Vă mulțumim!
Echipa {clinicName}

---
{unsubscribeText}
{privacyNotice}`,
    smsText: 'Bună ziua {patientName}! Vă reamintim despre programarea de mâine ({appointmentDate} la {appointmentTime}) la {clinicName}. Pentru confirmare: {confirmationLink}',
    inAppTitle: 'Confirmare programare pentru mâine',
    inAppBody: 'Programarea dumneavoastră la {doctorName} este mâine, {appointmentDate} la {appointmentTime}. Confirmați prezența aici.',
    confirmButton: 'Confirm prezența',
    rescheduleButton: 'Reprogramez',
    cancelButton: 'Anulez',
    unsubscribeText: 'Pentru a vă dezabona de la aceste notificări, accesați: {unsubscribeLink}',
    privacyNotice: 'Datele dumneavoastră sunt procesate conform GDPR. Politica de confidențialitate: {privacyLink}'
  },
  second: {
    subject: 'Ultimă reamintire - Programarea de astăzi la {clinicName}',
    body: `Bună ziua {patientName},

Aceasta este ultima reamintire pentru programarea dumneavoastră de astăzi:

📅 Data și ora: ASTĂZI la {appointmentTime}
🏥 Clinica: {clinicName}
📍 Adresa: {clinicAddress}
👨‍⚕️ Doctor: {doctorName}

Vă rugăm să confirmați prezența urgent:
{confirmationLink}

Dacă nu puteți fi prezent, vă rugăm să ne anunțați cât mai repede posibil.

{specialInstructions}

Ne vedem în curând!
Echipa {clinicName}

---
{unsubscribeText}
{privacyNotice}`,
    smsText: 'Reamintire URGENTĂ: Programarea dumneavoastră la {clinicName} este ASTĂZI la {appointmentTime}. Confirmați: {confirmationLink}',
    inAppTitle: 'Programarea este astăzi!',
    inAppBody: 'Nu uitați! Programarea dumneavoastră la {doctorName} este astăzi la {appointmentTime}.',
    confirmButton: 'Confirm prezența',
    rescheduleButton: 'Reprogramez',
    cancelButton: 'Anulez',
    unsubscribeText: 'Pentru a vă dezabona de la aceste notificări, accesați: {unsubscribeLink}',
    privacyNotice: 'Datele dumneavoastră sunt procesate conform GDPR. Politica de confidențialitate: {privacyLink}'
  }
}

/**
 * NotificationSenderService
 * 
 * Provides multi-channel notification delivery with comprehensive
 * error handling and delivery tracking.
 */
export class NotificationSenderService {
  
  /**
   * Send appointment notification through specified channel
   */
  static async sendAppointmentNotification(
    appointment: AppointmentWithNotifications,
    channel: NotificationChannel,
    notificationType: 'first' | 'second'
  ): Promise<boolean> {
    try {
      // Get patient preferences
      const patientId = appointment.patientEmail || appointment.id
      const preferences = await PatientNotificationPreferencesService.getPatientPreferences(patientId)
      
      if (!preferences) {
        console.error('No patient preferences found for notification')
        return false
      }
      
      // Prepare template data
      const templateData = await this.prepareTemplateData(appointment, preferences.language || 'ro')
      
      // Create delivery status record
      const deliveryStatus = await this.createDeliveryStatusRecord(
        appointment.id,
        channel,
        templateData,
        notificationType
      )
      
      // Send notification based on channel
      let success = false
      let errorMessage = ''
      
      switch (channel) {
        case 'email':
          success = await this.sendEmailNotification(
            templateData,
            notificationType,
            preferences.email!,
            deliveryStatus.id
          )
          break
          
        case 'sms':
          success = await this.sendSMSNotification(
            templateData,
            notificationType,
            preferences.phoneNumber!,
            deliveryStatus.id
          )
          break
          
        case 'in_app':
          success = await this.sendInAppNotification(
            templateData,
            notificationType,
            patientId,
            deliveryStatus.id
          )
          break
          
        default:
          errorMessage = 'Unsupported notification channel'
      }
      
      // Update delivery status
      await this.updateDeliveryStatus(deliveryStatus.id, success, errorMessage)
      
      return success
    } catch (error) {
      console.error('Error sending appointment notification:', error)
      return false
    }
  }
  
  /**
   * Prepare template data for notification
   */
  private static async prepareTemplateData(
    appointment: AppointmentWithNotifications,
    language: 'ro' | 'en' = 'ro'
  ): Promise<NotificationTemplateData> {
    const appointmentDateTime = appointment.dateTime instanceof Date 
      ? appointment.dateTime 
      : appointment.dateTime.toDate()
    
    // Format date and time in Romanian
    const appointmentDate = format(appointmentDateTime, 'dd MMMM yyyy', { locale: ro })
    const appointmentTime = format(appointmentDateTime, 'HH:mm')
    
    // Generate secure confirmation and decline links
    const links = await this.generateConfirmationLinks(appointment.id, appointment.patientEmail)
    const confirmationLink = links.confirmLink
    
    return {
      patientName: appointment.patientName,
      appointmentDate,
      appointmentTime,
      doctorName: 'Dr. Demo Medic', // TODO: Get actual doctor name from appointment
      clinicName: 'MedFlow Clinic', // TODO: Get actual clinic name
      clinicAddress: 'Str. Exemplu nr. 123, București', // TODO: Get actual address
      confirmationLink,
      symptoms: appointment.symptoms,
      specialInstructions: this.getSpecialInstructions(appointment),
      emergencyContact: '+40 21 123 4567' // TODO: Get actual emergency contact
    }
  }
  
  /**
   * Generate special instructions based on appointment data
   */
  private static getSpecialInstructions(appointment: AppointmentWithNotifications): string {
    const instructions = []
    
    // Add general instructions
    instructions.push('• Vă rugăm să ajungeți cu 15 minute mai devreme.')
    instructions.push('• Aduceți cu dumneavoastră actul de identitate și cardul de sănătate.')
    
    // Add specific instructions based on symptoms
    if (appointment.symptoms?.toLowerCase().includes('analize')) {
      instructions.push('• Pentru analize, vă rugăm să fiți postit de cel puțin 8 ore.')
    }
    
    if (appointment.symptoms?.toLowerCase().includes('control')) {
      instructions.push('• Pentru control, aduceți analizele și investigațiile anterioare.')
    }
    
    return instructions.join('\n')
  }
  
  /**
   * Generate secure confirmation links using AppointmentLinksService
   */
  private static async generateConfirmationLinks(
    appointmentId: string, 
    patientEmail?: string
  ): Promise<{ confirmLink: string; declineLink: string }> {
    try {
      // Import dynamically to avoid circular dependency
      const { default: AppointmentLinksService } = await import('./appointmentLinks')
      
      const links = await AppointmentLinksService.generateAppointmentLinks(
        appointmentId,
        patientEmail,
        72 // 3 days expiry
      )
      
      return {
        confirmLink: links.confirmLink,
        declineLink: links.declineLink
      }
    } catch (error) {
      console.error('Error generating secure links:', error)
      // Fallback to simple links
      const baseUrl = window.location?.origin || 'https://medflow.app'
      return {
        confirmLink: `${baseUrl}/appointment-response/confirm-${appointmentId}`,
        declineLink: `${baseUrl}/appointment-response/decline-${appointmentId}`
      }
    }
  }
  
  /**
   * Send email notification
   */
  private static async sendEmailNotification(
    templateData: NotificationTemplateData,
    notificationType: 'first' | 'second',
    recipientEmail: string,
    deliveryStatusId: string
  ): Promise<boolean> {
    try {
      const template = ROMANIAN_TEMPLATES[notificationType]
      
      // Replace placeholders in template
      const subject = this.replacePlaceholders(template.subject, templateData)
      const body = this.replacePlaceholders(template.body, templateData)
      
      // TODO: Integrate with actual email service (SendGrid, AWS SES, etc.)
      console.log('Sending email notification:', {
        to: recipientEmail,
        subject,
        body: body.substring(0, 100) + '...',
        deliveryStatusId
      })
      
      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // For demo purposes, simulate success
      // In production, replace with actual email service integration
      const success = Math.random() > 0.1 // 90% success rate simulation
      
      if (success) {
        console.log(`Email notification sent successfully to ${recipientEmail}`)
      } else {
        console.error(`Failed to send email notification to ${recipientEmail}`)
      }
      
      return success
    } catch (error) {
      console.error('Error sending email notification:', error)
      return false
    }
  }
  
  /**
   * Send SMS notification
   */
  private static async sendSMSNotification(
    templateData: NotificationTemplateData,
    notificationType: 'first' | 'second',
    recipientPhone: string,
    deliveryStatusId: string
  ): Promise<boolean> {
    try {
      const template = ROMANIAN_TEMPLATES[notificationType]
      
      // Replace placeholders in SMS template
      const smsText = this.replacePlaceholders(template.smsText, templateData)
      
      // TODO: Integrate with actual SMS service (Twilio, Vonage, etc.)
      console.log('Sending SMS notification:', {
        to: recipientPhone,
        text: smsText,
        deliveryStatusId
      })
      
      // Simulate SMS sending delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // For demo purposes, simulate success
      // In production, replace with actual SMS service integration
      const success = Math.random() > 0.05 // 95% success rate simulation
      
      if (success) {
        console.log(`SMS notification sent successfully to ${recipientPhone}`)
      } else {
        console.error(`Failed to send SMS notification to ${recipientPhone}`)
      }
      
      return success
    } catch (error) {
      console.error('Error sending SMS notification:', error)
      return false
    }
  }
  
  /**
   * Send in-app notification
   */
  private static async sendInAppNotification(
    templateData: NotificationTemplateData,
    notificationType: 'first' | 'second',
    patientId: string,
    deliveryStatusId: string
  ): Promise<boolean> {
    try {
      const template = ROMANIAN_TEMPLATES[notificationType]
      
      // Replace placeholders in in-app template
      const title = this.replacePlaceholders(template.inAppTitle, templateData)
      const body = this.replacePlaceholders(template.inAppBody, templateData)
      
      // Create in-app notification record
      const notificationData = {
        patientId,
        title,
        body,
        type: 'appointment_reminder',
        appointmentId: templateData.confirmationLink.split('/').pop(), // Extract appointment reference
        read: false,
        actionButtons: [
          {
            label: template.confirmButton,
            action: 'confirm',
            style: 'primary'
          },
          {
            label: template.rescheduleButton,
            action: 'reschedule',
            style: 'secondary'
          }
        ],
        createdAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) // Expires in 7 days
      }
      
      await addDoc(collection(db, 'inAppNotifications'), notificationData)
      
      console.log(`In-app notification created for patient ${patientId}`)
      return true
    } catch (error) {
      console.error('Error sending in-app notification:', error)
      return false
    }
  }
  
  /**
   * Replace placeholders in template strings
   */
  private static replacePlaceholders(template: string, data: NotificationTemplateData): string {
    let result = template
    
    // Replace all placeholders
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{${key}}`
      result = result.replace(new RegExp(placeholder, 'g'), value || '')
    })
    
    // Add additional placeholders
    result = result.replace('{unsubscribeLink}', `${window.location.origin}/unsubscribe`)
    result = result.replace('{privacyLink}', `${window.location.origin}/privacy`)
    
    return result
  }
  
  /**
   * Create delivery status record
   */
  private static async createDeliveryStatusRecord(
    appointmentId: string,
    channel: NotificationChannel,
    templateData: NotificationTemplateData,
    notificationType: 'first' | 'second'
  ): Promise<NotificationDeliveryStatus> {
    const deliveryStatus: Omit<NotificationDeliveryStatus, 'id'> = {
      appointmentId,
      deliveryRequestId: `${appointmentId}-${notificationType}-${Date.now()}`,
      channel,
      recipientEmail: channel === 'email' ? templateData.patientName : undefined, // TODO: Use actual email
      recipientPhone: channel === 'sms' ? '+40123456789' : undefined, // TODO: Use actual phone
      status: 'pending',
      attemptNumber: 1,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp
    }
    
    const docRef = await addDoc(collection(db, 'notificationDeliveryStatus'), deliveryStatus)
    
    return {
      id: docRef.id,
      ...deliveryStatus
    }
  }
  
  /**
   * Update delivery status
   */
  private static async updateDeliveryStatus(
    deliveryStatusId: string,
    success: boolean,
    errorMessage?: string
  ): Promise<void> {
    try {
      const statusRef = doc(db, 'notificationDeliveryStatus', deliveryStatusId)
      
      const updateData: any = {
        status: success ? 'delivered' : 'failed',
        lastAttemptAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      
      if (success) {
        updateData.deliveredAt = serverTimestamp()
      } else {
        updateData.errorMessage = errorMessage || 'Unknown error'
      }
      
      await updateDoc(statusRef, updateData)
    } catch (error) {
      console.error('Error updating delivery status:', error)
    }
  }
  
  /**
   * Send test notification (for debugging/testing)
   */
  static async sendTestNotification(
    channel: NotificationChannel,
    recipient: string
  ): Promise<boolean> {
    try {
      const testTemplateData: NotificationTemplateData = {
        patientName: 'Ion Popescu',
        appointmentDate: '15 decembrie 2024',
        appointmentTime: '14:30',
        doctorName: 'Dr. Maria Ionescu',
        clinicName: 'MedFlow Test Clinic',
        clinicAddress: 'Str. Test nr. 1, București',
        confirmationLink: `${window.location?.origin || 'https://medflow.app'}/test-confirmation`,
        symptoms: 'Control de rutină'
      }
      
      const deliveryStatus = await this.createDeliveryStatusRecord(
        'test-appointment',
        channel,
        testTemplateData,
        'first'
      )
      
      let success = false
      
      switch (channel) {
        case 'email':
          success = await this.sendEmailNotification(
            testTemplateData,
            'first',
            recipient,
            deliveryStatus.id
          )
          break
          
        case 'sms':
          success = await this.sendSMSNotification(
            testTemplateData,
            'first',
            recipient,
            deliveryStatus.id
          )
          break
          
        case 'in_app':
          success = await this.sendInAppNotification(
            testTemplateData,
            'first',
            recipient,
            deliveryStatus.id
          )
          break
      }
      
      await this.updateDeliveryStatus(deliveryStatus.id, success)
      
      return success
    } catch (error) {
      console.error('Error sending test notification:', error)
      return false
    }
  }
}

export default NotificationSenderService
