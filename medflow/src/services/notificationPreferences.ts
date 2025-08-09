/**
 * Patient Notification Preferences Service for MedFlow
 * 
 * Manages patient notification preferences, GDPR consent tracking,
 * and preference validation with Romanian regulations compliance.
 * 
 * @author MedFlow Team
 * @version 1.0
 */

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp, 
  collection,
  query,
  where,
  getDocs,
  Timestamp 
} from 'firebase/firestore'
import { db } from './firebase'
import { 
  PatientNotificationPreferences, 
  GDPRConsent, 
  NotificationChannel,
  PreferencesValidationResult,
  NotificationTiming
} from '../types/notifications'

/**
 * Default notification timing following Romanian medical practice
 */
const DEFAULT_TIMING: NotificationTiming = {
  firstNotification: {
    hoursBefore: 24, // 24 hours before appointment
    timeOfDay: 9     // 9 AM
  },
  secondNotification: {
    hoursBefore: 6,  // 6 hours before appointment (for 3 PM same day)
    timeOfDay: 15    // 3 PM
  }
}

/**
 * Default GDPR consent structure
 */
const createDefaultGDPRConsent = (): Omit<GDPRConsent, 'consentDate'> => ({
  dataProcessing: false,
  marketingCommunications: false,
  appointmentReminders: false,
  analytics: false,
  performanceTracking: false,
  consentVersion: '1.0',
  withdrawn: false
})

/**
 * PatientNotificationPreferencesService
 * 
 * Provides comprehensive management of patient notification preferences
 * with GDPR compliance and Romanian regulatory requirements.
 */
export class PatientNotificationPreferencesService {
  
  /**
   * Get patient notification preferences by patient ID
   */
  static async getPatientPreferences(patientId: string): Promise<PatientNotificationPreferences | null> {
    try {
      const preferencesRef = doc(db, 'patientNotificationPreferences', patientId)
      const snap = await getDoc(preferencesRef)
      
      if (!snap.exists()) {
        return null
      }
      
      return snap.data() as PatientNotificationPreferences
    } catch (error) {
      console.error('Error fetching patient preferences:', error)
      throw new Error('Nu s-au putut încărca preferințele de notificare ale pacientului')
    }
  }
  
  /**
   * Create or update patient notification preferences
   */
  static async upsertPatientPreferences(
    preferences: Partial<PatientNotificationPreferences> & { patientId: string }
  ): Promise<PatientNotificationPreferences> {
    try {
      // Validate preferences
      const validation = this.validatePreferences(preferences)
      if (!validation.valid) {
        const errorMessage = Object.values(validation.errors).join('. ')
        throw new Error(`Preferințe invalide: ${errorMessage}`)
      }
      
      const preferencesRef = doc(db, 'patientNotificationPreferences', preferences.patientId)
      const existingSnap = await getDoc(preferencesRef)
      
      const now = serverTimestamp() as Timestamp
      
      if (existingSnap.exists()) {
        // Update existing preferences
        const existingData = existingSnap.data() as PatientNotificationPreferences
        
        const updatedPreferences: PatientNotificationPreferences = {
          ...existingData,
          ...preferences,
          updatedAt: now,
          // Preserve creation date
          createdAt: existingData.createdAt,
          // Update GDPR consent if provided
          gdprConsent: preferences.gdprConsent ? {
            ...existingData.gdprConsent,
            ...preferences.gdprConsent,
            consentDate: preferences.gdprConsent.dataProcessing !== existingData.gdprConsent?.dataProcessing 
              ? now 
              : existingData.gdprConsent?.consentDate
          } : existingData.gdprConsent
        }
        
        await updateDoc(preferencesRef, updatedPreferences as any)
        return updatedPreferences
      } else {
        // Create new preferences
        const newPreferences: PatientNotificationPreferences = {
          patientId: preferences.patientId,
          email: preferences.email,
          phoneNumber: preferences.phoneNumber,
          channels: preferences.channels || {
            email: { enabled: false, verified: false },
            sms: { enabled: false, verified: false },
            inApp: { enabled: true } // Default to in-app notifications
          },
          language: preferences.language || 'ro',
          timing: preferences.timing || DEFAULT_TIMING,
          gdprConsent: preferences.gdprConsent || {
            ...createDefaultGDPRConsent(),
            consentDate: now
          },
          globalOptOut: preferences.globalOptOut || false,
          createdAt: now,
          updatedAt: now
        }
        
        await setDoc(preferencesRef, newPreferences)
        return newPreferences
      }
    } catch (error) {
      console.error('Error upserting patient preferences:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Nu s-au putut salva preferințele de notificare')
    }
  }
  
  /**
   * Update GDPR consent for a patient
   */
  static async updateGDPRConsent(
    patientId: string, 
    consent: Partial<GDPRConsent>,
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<void> {
    try {
      const preferencesRef = doc(db, 'patientNotificationPreferences', patientId)
      const snap = await getDoc(preferencesRef)
      
      if (!snap.exists()) {
        throw new Error('Preferințele pacientului nu au fost găsite')
      }
      
      const existingData = snap.data() as PatientNotificationPreferences
      const now = serverTimestamp() as Timestamp
      
      const updatedConsent: GDPRConsent = {
        ...existingData.gdprConsent,
        ...consent,
        consentDate: now,
        ...(metadata && {
          ipAddress: metadata.ipAddress,
          userAgent: metadata.userAgent
        })
      }
      
      await updateDoc(preferencesRef, {
        gdprConsent: updatedConsent,
        updatedAt: now
      })
    } catch (error) {
      console.error('Error updating GDPR consent:', error)
      throw new Error('Nu s-a putut actualiza consimțământul GDPR')
    }
  }
  
  /**
   * Withdraw GDPR consent (patient opt-out)
   */
  static async withdrawGDPRConsent(
    patientId: string,
    reason?: string,
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<void> {
    try {
      await this.updateGDPRConsent(patientId, {
        withdrawn: true,
        withdrawalDate: serverTimestamp() as Timestamp,
        withdrawalReason: reason,
        // Disable all non-essential consents
        marketingCommunications: false,
        appointmentReminders: false,
        analytics: false,
        performanceTracking: false
      }, metadata)
      
      // Also set global opt-out
      const preferencesRef = doc(db, 'patientNotificationPreferences', patientId)
      await updateDoc(preferencesRef, {
        globalOptOut: true,
        optOutDate: serverTimestamp(),
        optOutReason: reason || 'Retragere consimțământ GDPR'
      })
    } catch (error) {
      console.error('Error withdrawing GDPR consent:', error)
      throw new Error('Nu s-a putut retrage consimțământul')
    }
  }
  
  /**
   * Verify a notification channel (email or SMS)
   */
  static async verifyNotificationChannel(
    patientId: string,
    channel: 'email' | 'sms'
  ): Promise<void> {
    try {
      const preferencesRef = doc(db, 'patientNotificationPreferences', patientId)
      const updateData: any = {
        [`channels.${channel}.verified`]: true,
        [`channels.${channel}.verificationDate`]: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      
      await updateDoc(preferencesRef, updateData)
    } catch (error) {
      console.error(`Error verifying ${channel} channel:`, error)
      throw new Error(`Nu s-a putut verifica canalul de ${channel}`)
    }
  }
  
  /**
   * Get patients with active notification preferences for appointment reminders
   */
  static async getPatientsWithActiveNotifications(): Promise<PatientNotificationPreferences[]> {
    try {
      const preferencesQuery = query(
        collection(db, 'patientNotificationPreferences'),
        where('globalOptOut', '==', false),
        where('gdprConsent.withdrawn', '==', false),
        where('gdprConsent.appointmentReminders', '==', true)
      )
      
      const snapshot = await getDocs(preferencesQuery)
      return snapshot.docs.map(doc => doc.data() as PatientNotificationPreferences)
    } catch (error) {
      console.error('Error fetching active notification patients:', error)
      throw new Error('Nu s-au putut încărca pacienții cu notificări active')
    }
  }
  
  /**
   * Validate patient notification preferences
   */
  static validatePreferences(
    preferences: Partial<PatientNotificationPreferences>
  ): PreferencesValidationResult {
    const errors: PreferencesValidationResult['errors'] = {}
    const warnings: string[] = []
    
    // Validate that at least one notification channel is enabled
    const channels = preferences.channels
    if (channels) {
      const hasActiveChannel = channels.email?.enabled || 
                              channels.sms?.enabled || 
                              channels.inApp?.enabled
      
      if (!hasActiveChannel) {
        errors.channels = 'Cel puțin un canal de notificare trebuie să fie activ'
      }
      
      // Validate email format if email channel is enabled
      if (channels.email?.enabled && preferences.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(preferences.email)) {
          errors.email = 'Formatul adresei de email nu este valid'
        }
      }
      
      // Validate Romanian phone number format if SMS channel is enabled
      if (channels.sms?.enabled && preferences.phoneNumber) {
        const phoneRegex = /^\+40[0-9]{9}$/
        if (!phoneRegex.test(preferences.phoneNumber)) {
          errors.phone = 'Numărul de telefon trebuie să fie în format românesc (+40XXXXXXXXX)'
        }
      }
      
      // Warning for unverified channels
      if (channels.email?.enabled && !channels.email?.verified) {
        warnings.push('Adresa de email nu este verificată')
      }
      
      if (channels.sms?.enabled && !channels.sms?.verified) {
        warnings.push('Numărul de telefon nu este verificat')
      }
    }
    
    // Validate GDPR consent
    const gdprConsent = preferences.gdprConsent
    if (gdprConsent) {
      // Data processing consent is mandatory
      if (!gdprConsent.dataProcessing) {
        errors.gdprConsent = 'Consimțământul pentru procesarea datelor este obligatoriu'
      }
      
      // Appointment reminders consent required for notifications
      if (channels && Object.values(channels).some(ch => ch.enabled) && 
          !gdprConsent.appointmentReminders) {
        warnings.push('Pentru a primi notificări, este necesar consimțământul pentru mementouri')
      }
    }
    
    return {
      valid: Object.keys(errors).length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined
    }
  }
  
  /**
   * Check if patient has valid preferences for receiving notifications
   */
  static async canReceiveNotifications(patientId: string): Promise<{
    canReceive: boolean
    availableChannels: NotificationChannel[]
    reason?: string
  }> {
    try {
      const preferences = await this.getPatientPreferences(patientId)
      
      if (!preferences) {
        return {
          canReceive: false,
          availableChannels: [],
          reason: 'Nu există preferințe de notificare configurate'
        }
      }
      
      // Check global opt-out
      if (preferences.globalOptOut) {
        return {
          canReceive: false,
          availableChannels: [],
          reason: 'Pacientul s-a dezabonat de la toate notificările'
        }
      }
      
      // Check GDPR consent
      if (preferences.gdprConsent.withdrawn || !preferences.gdprConsent.appointmentReminders) {
        return {
          canReceive: false,
          availableChannels: [],
          reason: 'Consimțământ GDPR retras sau lipsă pentru mementouri'
        }
      }
      
      // Get available channels
      const availableChannels: NotificationChannel[] = []
      
      if (preferences.channels.email?.enabled && preferences.channels.email?.verified) {
        availableChannels.push('email')
      }
      
      if (preferences.channels.sms?.enabled && preferences.channels.sms?.verified) {
        availableChannels.push('sms')
      }
      
      if (preferences.channels.inApp?.enabled) {
        availableChannels.push('in_app')
      }
      
      if (availableChannels.length === 0) {
        return {
          canReceive: false,
          availableChannels: [],
          reason: 'Nu există canale de notificare active și verificate'
        }
      }
      
      return {
        canReceive: true,
        availableChannels
      }
    } catch (error) {
      console.error('Error checking notification eligibility:', error)
      return {
        canReceive: false,
        availableChannels: [],
        reason: 'Eroare la verificarea eligibilității pentru notificări'
      }
    }
  }
}

export default PatientNotificationPreferencesService
