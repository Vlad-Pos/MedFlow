/**
 * Notification Preferences Component for MedFlow
 * 
 * Comprehensive UI for patients to manage notification preferences
 * with GDPR compliance and Romanian localization.
 * 
 * @author MedFlow Team
 * @version 1.0
 */

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone,
  Shield,
  Check,
  X,
  AlertTriangle,
  Info,
  Settings,
  Clock,
  Globe
} from 'lucide-react'
import { 
  PatientNotificationPreferences,
  GDPRConsent,
  NotificationChannel,
  PreferencesValidationResult
} from '../types/notifications'
import PatientNotificationPreferencesService from '../services/notificationPreferences'
import LoadingSpinner from './LoadingSpinner'
import { useAuth } from '../providers/AuthProvider'

interface NotificationPreferencesProps {
  patientId?: string
  onSaved?: (preferences: PatientNotificationPreferences) => void
  className?: string
}

interface FormData {
  email: string
  phoneNumber: string
  channels: {
    email: { enabled: boolean; verified: boolean }
    sms: { enabled: boolean; verified: boolean }
    inApp: { enabled: boolean }
  }
  language: 'ro' | 'en'
  gdprConsent: {
    dataProcessing: boolean
    marketingCommunications: boolean
    appointmentReminders: boolean
    analytics: boolean
    performanceTracking: boolean
  }
}

export default function NotificationPreferences({ 
  patientId, 
  onSaved, 
  className = '' 
}: NotificationPreferencesProps) {
  const { user } = useAuth()
  const effectivePatientId = patientId || user?.email || user?.uid || ''
  
  // State management
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [validation, setValidation] = useState<PreferencesValidationResult | null>(null)
  
  // Form data
  const [formData, setFormData] = useState<FormData>({
    email: '',
    phoneNumber: '',
    channels: {
      email: { enabled: false, verified: false },
      sms: { enabled: false, verified: false },
      inApp: { enabled: true }
    },
    language: 'ro',
    gdprConsent: {
      dataProcessing: false,
      marketingCommunications: false,
      appointmentReminders: false,
      analytics: false,
      performanceTracking: false
    }
  })
  
  // Verification states
  const [verifying, setVerifying] = useState<{ email: boolean; sms: boolean }>({
    email: false,
    sms: false
  })
  
  // Load existing preferences
  useEffect(() => {
    loadPreferences()
  }, [effectivePatientId])
  
  const loadPreferences = async () => {
    if (!effectivePatientId) return
    
    try {
      setLoading(true)
      setError(null)
      
      const preferences = await PatientNotificationPreferencesService.getPatientPreferences(effectivePatientId)
      
      if (preferences) {
        setFormData({
          email: preferences.email || '',
          phoneNumber: preferences.phoneNumber || '',
          channels: preferences.channels,
          language: preferences.language,
          gdprConsent: {
            dataProcessing: preferences.gdprConsent.dataProcessing,
            marketingCommunications: preferences.gdprConsent.marketingCommunications,
            appointmentReminders: preferences.gdprConsent.appointmentReminders,
            analytics: preferences.gdprConsent.analytics,
            performanceTracking: preferences.gdprConsent.performanceTracking
          }
        })
      } else {
        // Set default preferences for new users
        setFormData(prev => ({
          ...prev,
          email: user?.email || '',
          channels: {
            ...prev.channels,
            inApp: { enabled: true }
          }
        }))
      }
    } catch (error) {
      console.error('Error loading preferences:', error)
      setError('Nu s-au putut încărca preferințele de notificare')
    } finally {
      setLoading(false)
    }
  }
  
  // Validate form data
  const validateForm = useCallback(() => {
    const validation = PatientNotificationPreferencesService.validatePreferences({
      patientId: effectivePatientId,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      channels: formData.channels,
      gdprConsent: formData.gdprConsent as any
    })
    
    setValidation(validation)
    return validation.valid
  }, [formData, effectivePatientId])
  
  // Handle form field changes
  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError(null)
    setSuccess(false)
  }
  
  // Handle channel toggle
  const handleChannelToggle = (channel: 'email' | 'sms' | 'inApp', enabled: boolean) => {
    setFormData(prev => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: {
          ...prev.channels[channel],
          enabled
        }
      }
    }))
    setError(null)
    setSuccess(false)
  }
  
  // Handle GDPR consent change
  const handleGDPRConsentChange = (consentType: keyof FormData['gdprConsent'], value: boolean) => {
    setFormData(prev => ({
      ...prev,
      gdprConsent: {
        ...prev.gdprConsent,
        [consentType]: value
      }
    }))
    setError(null)
    setSuccess(false)
  }
  
  // Verify email or phone
  const handleVerification = async (channel: 'email' | 'sms') => {
    try {
      setVerifying(prev => ({ ...prev, [channel]: true }))
      
      // TODO: Implement actual verification logic
      // For now, simulate verification
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update verification status
      setFormData(prev => ({
        ...prev,
        channels: {
          ...prev.channels,
          [channel]: {
            ...prev.channels[channel],
            verified: true
          }
        }
      }))
      
      console.log(`${channel} verified successfully`)
    } catch (error) {
      console.error(`Error verifying ${channel}:`, error)
      setError(`Nu s-a putut verifica ${channel === 'email' ? 'emailul' : 'numărul de telefon'}`)
    } finally {
      setVerifying(prev => ({ ...prev, [channel]: false }))
    }
  }
  
  // Save preferences
  const handleSave = async () => {
    try {
      if (!validateForm()) {
        setError('Vă rugăm să corectați erorile din formular')
        return
      }
      
      setSaving(true)
      setError(null)
      
      const preferences = await PatientNotificationPreferencesService.upsertPatientPreferences({
        patientId: effectivePatientId,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        channels: formData.channels,
        language: formData.language,
        gdprConsent: formData.gdprConsent as any
      })
      
      setSuccess(true)
      onSaved?.(preferences)
      
      // Auto-hide success message
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('Error saving preferences:', error)
      setError(error instanceof Error ? error.message : 'Nu s-au putut salva preferințele')
    } finally {
      setSaving(false)
    }
  }
  
  // Withdraw GDPR consent
  const handleWithdrawConsent = async () => {
    try {
      setSaving(true)
      
      await PatientNotificationPreferencesService.withdrawGDPRConsent(
        effectivePatientId,
        'Retragere prin interfața utilizator'
      )
      
      // Reload preferences to reflect changes
      await loadPreferences()
      setSuccess(true)
    } catch (error) {
      console.error('Error withdrawing consent:', error)
      setError('Nu s-a putut retrage consimțământul')
    } finally {
      setSaving(false)
    }
  }
  
  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <LoadingSpinner size="lg" />
      </div>
    )
  }
  
  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <Bell className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Preferințe de Notificare
        </h2>
        <p className="text-gray-600">
          Configurați modul în care doriți să primiți mementouri pentru programări
        </p>
      </div>
      
      {/* Error/Success Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center"
          >
            <AlertTriangle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
            <span className="text-red-700">{error}</span>
          </motion.div>
        )}
        
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center"
          >
            <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
            <span className="text-green-700">Preferințele au fost salvate cu succes!</span>
          </motion.div>
        )}
        
        {validation && !validation.valid && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
          >
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800 mb-1">Atenție:</h4>
                <ul className="text-yellow-700 text-sm space-y-1">
                  {Object.values(validation.errors).map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Contact Information */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Informații de Contact
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresa de Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="exemplu@email.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Număr de Telefon
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+40123456789"
            />
          </div>
        </div>
      </div>
      
      {/* Notification Channels */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Bell className="w-5 h-5 mr-2" />
          Canale de Notificare
        </h3>
        
        <div className="space-y-4">
          {/* Email Channel */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center">
              <Mail className="w-6 h-6 text-blue-500 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">Email</h4>
                <p className="text-sm text-gray-600">
                  Primiți notificări pe adresa de email
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {formData.channels.email.verified ? (
                <span className="flex items-center text-green-600 text-sm">
                  <Check className="w-4 h-4 mr-1" />
                  Verificat
                </span>
              ) : (
                <button
                  onClick={() => handleVerification('email')}
                  disabled={!formData.channels.email.enabled || verifying.email}
                  className="text-blue-600 text-sm hover:text-blue-700 disabled:opacity-50"
                >
                  {verifying.email ? 'Se verifică...' : 'Verifică'}
                </button>
              )}
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.channels.email.enabled}
                  onChange={(e) => handleChannelToggle('email', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
          
          {/* SMS Channel */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center">
              <MessageSquare className="w-6 h-6 text-green-500 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">SMS</h4>
                <p className="text-sm text-gray-600">
                  Primiți notificări prin mesaje text
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {formData.channels.sms.verified ? (
                <span className="flex items-center text-green-600 text-sm">
                  <Check className="w-4 h-4 mr-1" />
                  Verificat
                </span>
              ) : (
                <button
                  onClick={() => handleVerification('sms')}
                  disabled={!formData.channels.sms.enabled || verifying.sms}
                  className="text-blue-600 text-sm hover:text-blue-700 disabled:opacity-50"
                >
                  {verifying.sms ? 'Se verifică...' : 'Verifică'}
                </button>
              )}
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.channels.sms.enabled}
                  onChange={(e) => handleChannelToggle('sms', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          </div>
          
          {/* In-App Channel */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center">
              <Smartphone className="w-6 h-6 text-purple-500 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">În Aplicație</h4>
                <p className="text-sm text-gray-600">
                  Notificări în cadrul aplicației MedFlow
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="flex items-center text-green-600 text-sm">
                <Check className="w-4 h-4 mr-1" />
                Activ
              </span>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.channels.inApp.enabled}
                  onChange={(e) => handleChannelToggle('inApp', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-start">
            <Info className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-blue-700 text-sm">
              <strong>Important:</strong> Cel puțin un canal de notificare trebuie să fie activ 
              pentru a primi mementouri despre programări.
            </p>
          </div>
        </div>
      </div>
      
      {/* Notification Timing */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Program de Notificări
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Prima reamintire</h4>
              <p className="text-sm text-gray-600">La ora 9:00, cu o zi înainte de programare</p>
            </div>
            <span className="text-blue-600 font-medium">9:00 AM</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">A doua reamintire</h4>
              <p className="text-sm text-gray-600">La ora 15:00, în ziua programării</p>
            </div>
            <span className="text-blue-600 font-medium">3:00 PM</span>
          </div>
        </div>
      </div>
      
      {/* Language Preferences */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Globe className="w-5 h-5 mr-2" />
          Preferințe de Limbă
        </h3>
        
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="language"
              value="ro"
              checked={formData.language === 'ro'}
              onChange={(e) => handleFieldChange('language', e.target.value)}
              className="mr-2"
            />
            <span>Română</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="radio"
              name="language"
              value="en"
              checked={formData.language === 'en'}
              onChange={(e) => handleFieldChange('language', e.target.value)}
              className="mr-2"
            />
            <span>English</span>
          </label>
        </div>
      </div>
      
      {/* GDPR Consent */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          Consimțământ GDPR
        </h3>
        
        <div className="space-y-4">
          <label className="flex items-start">
            <input
              type="checkbox"
              checked={formData.gdprConsent.dataProcessing}
              onChange={(e) => handleGDPRConsentChange('dataProcessing', e.target.checked)}
              className="mt-1 mr-3"
              required
            />
            <div>
              <span className="font-medium text-gray-900">
                Procesarea datelor personale *
              </span>
              <p className="text-sm text-gray-600 mt-1">
                Sunt de acord cu procesarea datelor mele personale pentru serviciile medicale.
              </p>
            </div>
          </label>
          
          <label className="flex items-start">
            <input
              type="checkbox"
              checked={formData.gdprConsent.appointmentReminders}
              onChange={(e) => handleGDPRConsentChange('appointmentReminders', e.target.checked)}
              className="mt-1 mr-3"
            />
            <div>
              <span className="font-medium text-gray-900">
                Mementouri pentru programări
              </span>
              <p className="text-sm text-gray-600 mt-1">
                Sunt de acord să primesc mementouri pentru programările mele.
              </p>
            </div>
          </label>
          
          <label className="flex items-start">
            <input
              type="checkbox"
              checked={formData.gdprConsent.marketingCommunications}
              onChange={(e) => handleGDPRConsentChange('marketingCommunications', e.target.checked)}
              className="mt-1 mr-3"
            />
            <div>
              <span className="font-medium text-gray-900">
                Comunicări de marketing
              </span>
              <p className="text-sm text-gray-600 mt-1">
                Sunt de acord să primesc informații despre servicii și oferte.
              </p>
            </div>
          </label>
          
          <label className="flex items-start">
            <input
              type="checkbox"
              checked={formData.gdprConsent.analytics}
              onChange={(e) => handleGDPRConsentChange('analytics', e.target.checked)}
              className="mt-1 mr-3"
            />
            <div>
              <span className="font-medium text-gray-900">
                Analiză și statistici
              </span>
              <p className="text-sm text-gray-600 mt-1">
                Sunt de acord cu utilizarea datelor pentru îmbunătățirea serviciilor.
              </p>
            </div>
          </label>
        </div>
        
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-2">Drepturile dumneavoastră GDPR:</h4>
          <ul className="text-yellow-700 text-sm space-y-1">
            <li>• Dreptul de acces la datele personale</li>
            <li>• Dreptul de rectificare a datelor</li>
            <li>• Dreptul la ștergerea datelor</li>
            <li>• Dreptul de a retrage consimțământul oricând</li>
          </ul>
          
          <button
            onClick={handleWithdrawConsent}
            className="mt-3 text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Retrag consimțământul complet
          </button>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={loadPreferences}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={loading || saving}
        >
          Resetează
        </button>
        
        <button
          onClick={handleSave}
          disabled={saving || (validation && !validation.valid)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {saving ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Se salvează...
            </>
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
              Salvează Preferințele
            </>
          )}
        </button>
      </div>
    </div>
  )
}
