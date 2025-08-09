/**
 * Enhanced Profile Management Component for MedFlow
 * 
 * Features:
 * - Comprehensive user profile editing for medical professionals
 * - Password change and security settings
 * - Professional medical information management
 * - MedFlow branding with responsive design
 * - Firebase Firestore synchronization
 * - AI integration placeholders for personalization
 * - Dark mode and accessibility settings
 * 
 * @author MedFlow Team
 * @version 2.0
 */

import { useState, useEffect, useCallback } from 'react'
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'
import { doc, updateDoc, getDoc } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../providers/AuthProvider'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Mail, 
  Lock, 
  Save, 
  Edit3, 
  Check, 
  X, 
  AlertTriangle,
  CheckCircle,
  Shield,
  Stethoscope,
  MapPin,
  Phone,
  Calendar,
  Brain,
  Settings,
  Eye,
  EyeOff,
  Building,
  GraduationCap
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import NotificationPreferences from '../components/NotificationPreferences'

interface UserProfile {
  displayName: string
  email: string
  role: 'doctor' | 'nurse'
  specialization?: string
  licenseNumber?: string
  clinic?: string
  phone?: string
  address?: string
  experience?: number
  education?: string
  certifications?: string[]
  workingHours?: {
    start: string
    end: string
  }
  preferences?: {
    notifications: boolean
    darkMode: boolean
    language: string
    aiAssistance: boolean
  }
}

interface PasswordChange {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function ProfileEnhanced() {
  const { user, refreshUserData } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'personal' | 'professional' | 'security' | 'preferences'>('personal')
  
  // Profile state
  const [profile, setProfile] = useState<UserProfile>({
    displayName: '',
    email: '',
    role: 'doctor'
  })
  
  // Password change state
  const [passwordData, setPasswordData] = useState<PasswordChange>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  
  // UI state
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)

  // Load user profile data
  useEffect(() => {
    async function loadProfile() {
      if (!user) return

      setLoading(true)
      try {
        // Get additional profile data from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        const userData = userDoc.exists() ? userDoc.data() : {}

        setProfile({
          displayName: user.displayName || '',
          email: user.email || '',
          role: user.role || 'doctor',
          specialization: userData.specialization || '',
          licenseNumber: userData.licenseNumber || '',
          clinic: userData.clinic || '',
          phone: userData.phone || '',
          address: userData.address || '',
          experience: userData.experience || 0,
          education: userData.education || '',
          certifications: userData.certifications || [],
          workingHours: userData.workingHours || { start: '08:00', end: '18:00' },
          preferences: {
            notifications: userData.preferences?.notifications ?? true,
            darkMode: userData.preferences?.darkMode ?? false,
            language: userData.preferences?.language || 'ro',
            aiAssistance: userData.preferences?.aiAssistance ?? true,
            ...userData.preferences
          }
        })
      } catch (err) {
        console.error('Error loading profile:', err)
        setError('Eroare la încărcarea profilului')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user])

  // Handle profile field changes
  const handleProfileChange = useCallback((field: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }, [])

  // Handle nested preference changes
  const handlePreferenceChange = useCallback((field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value
      }
    }))
  }, [])

  // Save profile changes
  const handleSaveProfile = useCallback(async () => {
    if (!user) return

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // Update Firebase Auth profile
      if (profile.displayName !== user.displayName) {
        await updateProfile(user, { displayName: profile.displayName })
      }

      // Update Firestore user document
      const userDocRef = doc(db, 'users', user.uid)
      await updateDoc(userDocRef, {
        ...profile,
        updatedAt: new Date()
      })

      // Refresh user data in context
      await refreshUserData?.()

      setSuccess('Profilul a fost actualizat cu succes!')
      setEditMode(false)
    } catch (err) {
      console.error('Error saving profile:', err)
      setError('Eroare la salvarea profilului')
    } finally {
      setSaving(false)
    }
  }, [user, profile, refreshUserData])

  // Handle password change
  const handlePasswordChange = useCallback(async () => {
    if (!user?.email) return

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Parolele nu coincid')
      return
    }

    if (passwordData.newPassword.length < 8) {
      setError('Parola nouă trebuie să aibă cel puțin 8 caractere')
      return
    }

    setSaving(true)
    setError(null)

    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, passwordData.currentPassword)
      await reauthenticateWithCredential(user, credential)

      // Update password
      await updatePassword(user, passwordData.newPassword)

      setSuccess('Parola a fost schimbată cu succes!')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err: any) {
      console.error('Error changing password:', err)
      if (err.code === 'auth/wrong-password') {
        setError('Parola curentă este incorectă')
      } else if (err.code === 'auth/weak-password') {
        setError('Parola nouă este prea slabă')
      } else {
        setError('Eroare la schimbarea parolei')
      }
    } finally {
      setSaving(false)
    }
  }, [user, passwordData])

  // Tab components
  const tabs = [
    { id: 'personal', label: 'Informații Personale', icon: User },
    { id: 'professional', label: 'Date Profesionale', icon: Stethoscope },
    { id: 'security', label: 'Securitate', icon: Shield },
    { id: 'preferences', label: 'Preferințe', icon: Settings }
  ]

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">
          Vă rugăm să vă autentificați pentru a accesa profilul.
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Se încarcă profilul...
          </p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Profilul Medical
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestionați informațiile personale și profesionale
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {editMode ? (
            <>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setEditMode(false)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Anulează</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex items-center space-x-2 px-4 py-2 bg-medflow-primary text-white rounded-lg hover:bg-medflow-secondary transition-colors disabled:opacity-50"
              >
                {saving ? <LoadingSpinner size="sm" /> : <Save className="w-4 h-4" />}
                <span>Salvează</span>
              </motion.button>
            </>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setEditMode(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-medflow-primary text-white rounded-lg hover:bg-medflow-secondary transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>Editează Profil</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Status Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800"
          >
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="text-red-700 dark:text-red-300">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto p-1 hover:bg-red-100 dark:hover:bg-red-800 rounded"
            >
              <X className="w-4 h-4 text-red-600" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center space-x-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg dark:bg-emerald-900/20 dark:border-emerald-800"
          >
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="text-emerald-700 dark:text-emerald-300">{success}</span>
            <button
              onClick={() => setSuccess(null)}
              className="ml-auto p-1 hover:bg-emerald-100 dark:hover:bg-emerald-800 rounded"
            >
              <X className="w-4 h-4 text-emerald-600" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Content */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-lg">
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-b-2 border-medflow-primary text-medflow-primary'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="p-6">
          {/* Personal Information Tab */}
          {activeTab === 'personal' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nume complet
                  </label>
                  <input
                    type="text"
                    value={profile.displayName}
                    onChange={(e) => handleProfileChange('displayName', e.target.value)}
                    disabled={!editMode}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medflow-primary focus:border-medflow-primary dark:bg-gray-800 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Ex: Dr. Ion Popescu"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 opacity-50 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email-ul nu poate fi modificat din motive de securitate
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={profile.phone || ''}
                    onChange={(e) => handleProfileChange('phone', e.target.value)}
                    disabled={!editMode}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medflow-primary focus:border-medflow-primary dark:bg-gray-800 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Ex: +40 721 123 456"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rol
                  </label>
                  <select
                    value={profile.role}
                    onChange={(e) => handleProfileChange('role', e.target.value)}
                    disabled={!editMode}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medflow-primary focus:border-medflow-primary dark:bg-gray-800 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="doctor">Doctor</option>
                    <option value="nurse">Asistent medical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Adresă
                </label>
                <textarea
                  value={profile.address || ''}
                  onChange={(e) => handleProfileChange('address', e.target.value)}
                  disabled={!editMode}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medflow-primary focus:border-medflow-primary dark:bg-gray-800 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                  placeholder="Introduceți adresa completă..."
                />
              </div>
            </motion.div>
          )}

          {/* Professional Information Tab */}
          {activeTab === 'professional' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Specializare
                  </label>
                  <input
                    type="text"
                    value={profile.specialization || ''}
                    onChange={(e) => handleProfileChange('specialization', e.target.value)}
                    disabled={!editMode}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medflow-primary focus:border-medflow-primary dark:bg-gray-800 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Ex: Cardiologie, Medicina de familie"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Număr licență
                  </label>
                  <input
                    type="text"
                    value={profile.licenseNumber || ''}
                    onChange={(e) => handleProfileChange('licenseNumber', e.target.value)}
                    disabled={!editMode}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medflow-primary focus:border-medflow-primary dark:bg-gray-800 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Ex: MED123456"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Clinică/Spital
                  </label>
                  <input
                    type="text"
                    value={profile.clinic || ''}
                    onChange={(e) => handleProfileChange('clinic', e.target.value)}
                    disabled={!editMode}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medflow-primary focus:border-medflow-primary dark:bg-gray-800 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Ex: Spitalul Clinic Municipal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Experiență (ani)
                  </label>
                  <input
                    type="number"
                    value={profile.experience || ''}
                    onChange={(e) => handleProfileChange('experience', parseInt(e.target.value) || 0)}
                    disabled={!editMode}
                    min="0"
                    max="50"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medflow-primary focus:border-medflow-primary dark:bg-gray-800 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Ex: 10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Educație
                </label>
                <textarea
                  value={profile.education || ''}
                  onChange={(e) => handleProfileChange('education', e.target.value)}
                  disabled={!editMode}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medflow-primary focus:border-medflow-primary dark:bg-gray-800 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                  placeholder="Universitatea de medicină, specializări, cursuri..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ora de început program
                  </label>
                  <input
                    type="time"
                    value={profile.workingHours?.start || '08:00'}
                    onChange={(e) => handleProfileChange('workingHours', { ...profile.workingHours, start: e.target.value })}
                    disabled={!editMode}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medflow-primary focus:border-medflow-primary dark:bg-gray-800 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ora de sfârșit program
                  </label>
                  <input
                    type="time"
                    value={profile.workingHours?.end || '18:00'}
                    onChange={(e) => handleProfileChange('workingHours', { ...profile.workingHours, end: e.target.value })}
                    disabled={!editMode}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medflow-primary focus:border-medflow-primary dark:bg-gray-800 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 dark:bg-orange-900/20 dark:border-orange-800">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-orange-800 dark:text-orange-300">
                      Securitatea contului
                    </h4>
                    <p className="text-sm text-orange-700 dark:text-orange-400 mt-1">
                      Pentru siguranța datelor medicale, vă recomandăm o parolă puternică cu cel puțin 8 caractere.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Schimbarea parolei
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Parola curentă
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medflow-primary focus:border-medflow-primary dark:bg-gray-800 dark:border-gray-600"
                        placeholder="Introduceți parola curentă"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                      >
                        {showPasswords.current ? (
                          <EyeOff className="w-5 h-5 text-gray-400" />
                        ) : (
                          <Eye className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Parola nouă
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medflow-primary focus:border-medflow-primary dark:bg-gray-800 dark:border-gray-600"
                        placeholder="Introduceți parola nouă"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                      >
                        {showPasswords.new ? (
                          <EyeOff className="w-5 h-5 text-gray-400" />
                        ) : (
                          <Eye className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirmați parola nouă
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medflow-primary focus:border-medflow-primary dark:bg-gray-800 dark:border-gray-600"
                        placeholder="Confirmați parola nouă"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="w-5 h-5 text-gray-400" />
                        ) : (
                          <Eye className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePasswordChange}
                    disabled={saving || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                    className="flex items-center space-x-2 px-6 py-3 bg-medflow-primary text-white rounded-lg hover:bg-medflow-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? <LoadingSpinner size="sm" /> : <Lock className="w-4 h-4" />}
                    <span>Schimbă parola</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="space-y-6">
                {/* Comprehensive Notification Preferences */}
                <NotificationPreferences 
                  patientId={user?.email || user?.uid}
                  onSaved={(preferences) => {
                    console.log('Notification preferences updated:', preferences)
                    // Could show a success message here
                  }}
                />

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      🤖 Asistență AI
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Activați funcționalitățile AI pentru recomandări și analize
                    </p>
                  </div>
                  <button
                    onClick={() => handlePreferenceChange('aiAssistance', !profile.preferences?.aiAssistance)}
                    disabled={!editMode}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      profile.preferences?.aiAssistance ? 'bg-medflow-primary' : 'bg-gray-300'
                    } disabled:opacity-50`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        profile.preferences?.aiAssistance ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Limba interfață
                  </label>
                  <select
                    value={profile.preferences?.language || 'ro'}
                    onChange={(e) => handlePreferenceChange('language', e.target.value)}
                    disabled={!editMode}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medflow-primary focus:border-medflow-primary dark:bg-gray-800 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="ro">Română</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>

              {/* AI Preferences Placeholder */}
              <div className="bg-medflow-primary/5 border border-medflow-primary/10 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Brain className="w-5 h-5 text-medflow-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-medflow-primary">
                      Personalizare AI
                    </h4>
                    <p className="text-sm text-medflow-primary/80 mt-1">
                      🤖 Setări avansate pentru personalizarea experienței AI vor fi disponibile în curând
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
