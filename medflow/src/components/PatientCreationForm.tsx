/**
 * Patient Creation Form Component
 * 
 * Form for creating new patients with comprehensive validation
 * and CNP integration for automatic data extraction.
 * 
 * @author MedFlow Team
 * @version 2.0
 */

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  AlertCircle, 
  CheckCircle, 
  Save,
  X,
  Loader2,
  Info
} from 'lucide-react'
import { patientService } from '../services/patientService'
import { CreatePatientRequest, PatientValidationResult } from '../types/patient'
import { extractGenderFromCNP, extractBirthDateFromCNP, analyzeCNP } from '../utils/cnpValidation'

interface PatientCreationFormProps {
  onPatientCreated: (patient: any) => void
  onCancel: () => void
  className?: string
}

interface FormData {
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say'
  cnp: string
  email: string
  phone: string
  address: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  emergencyContact: {
    name: string
    relationship: string
    phone: string
    email: string
  }
  bloodType: string
}

interface FormErrors {
  [key: string]: string
}

export default function PatientCreationForm({ 
  onPatientCreated, 
  onCancel, 
  className = "" 
}: PatientCreationFormProps) {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'prefer-not-to-say',
    cnp: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'România'
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
      email: ''
    },
    bloodType: ''
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cnpAnalysis, setCnpAnalysis] = useState<any>(null)
  const [showCnpInfo, setShowCnpInfo] = useState(false)

  // Handle CNP input and automatic extraction
  const handleCnpChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const cnp = e.target.value.replace(/\D/g, '') // Remove non-digits
    setFormData(prev => ({ ...prev, cnp }))

    if (cnp.length === 13) {
      const analysis = analyzeCNP(cnp)
      if (analysis && analysis.isValid) {
        setCnpAnalysis(analysis)
        setShowCnpInfo(true)
        
        // Auto-fill extracted data
        setFormData(prev => ({
          ...prev,
          gender: analysis.gender || prev.gender,
          dateOfBirth: analysis.birthDate ? analysis.birthDate.toISOString().split('T')[0] : prev.dateOfBirth
        }))
      } else {
        setCnpAnalysis(null)
        setShowCnpInfo(false)
        setErrors(prev => ({ ...prev, cnp: 'CNP invalid' }))
      }
    } else {
      setCnpAnalysis(null)
      setShowCnpInfo(false)
      setErrors(prev => ({ ...prev, cnp: '' }))
    }
  }, [])

  // Handle form field changes
  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Handle nested field changes
  const handleNestedFieldChange = (parent: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof FormData],
        [field]: value
      }
    }))
  }

  // Validate form
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Prenumele este obligatoriu'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Numele este obligatoriu'
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Data nașterii este obligatorie'
    }

    if (!formData.email && !formData.phone) {
      newErrors.contact = 'Cel puțin o metodă de contact (email sau telefon) este obligatorie'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email invalid'
    }

    if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = 'Format telefon invalid'
    }

    if (formData.cnp && formData.cnp.length !== 13) {
      newErrors.cnp = 'CNP-ul trebuie să aibă 13 cifre'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const createRequest: CreatePatientRequest = {
        personalInfo: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          dateOfBirth: new Date(formData.dateOfBirth),
          gender: formData.gender,
          cnp: formData.cnp || undefined
        },
        contactInfo: {
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          address: formData.address.street ? {
            street: formData.address.street,
            city: formData.address.city,
            state: formData.address.state,
            postalCode: formData.address.postalCode,
            country: formData.address.country
          } : undefined,
          emergencyContact: formData.emergencyContact.name ? {
            name: formData.emergencyContact.name,
            relationship: formData.emergencyContact.relationship,
            phone: formData.emergencyContact.phone,
            email: formData.emergencyContact.email || undefined
          } : undefined
        },
        medicalInfo: {
          bloodType: formData.bloodType || undefined
        }
      }

      const patient = await patientService.createPatient(createRequest)
      onPatientCreated(patient)
    } catch (error) {
      console.error('Error creating patient:', error)
      setErrors({ general: 'Eroare la crearea pacientului' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-white rounded-lg shadow-lg p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <User className="w-6 h-6" />
          Pacient Nou
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Error */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span>{errors.general}</span>
            </div>
          </div>
        )}

        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Informații Personale</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prenume *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleFieldChange('firstName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-medflow-primary focus:border-medflow-primary ${
                  errors.firstName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Introduceți prenumele"
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nume *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleFieldChange('lastName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-medflow-primary focus:border-medflow-primary ${
                  errors.lastName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Introduceți numele"
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Nașterii *
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleFieldChange('dateOfBirth', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-medflow-primary focus:border-medflow-primary ${
                  errors.dateOfBirth ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.dateOfBirth && (
                <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gen
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleFieldChange('gender', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medflow-primary focus:border-medflow-primary"
              >
                <option value="prefer-not-to-say">Prefer să nu răspund</option>
                <option value="male">Masculin</option>
                <option value="female">Feminin</option>
                <option value="other">Altul</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CNP (opțional)
            </label>
            <input
              type="text"
              value={formData.cnp}
              onChange={handleCnpChange}
              maxLength={13}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-medflow-primary focus:border-medflow-primary ${
                errors.cnp ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Introduceți CNP-ul (13 cifre)"
            />
            {errors.cnp && (
              <p className="mt-1 text-sm text-red-600">{errors.cnp}</p>
            )}
            
            {/* CNP Analysis Info */}
            <AnimatePresence>
              {showCnpInfo && cnpAnalysis && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                >
                  <div className="flex items-center gap-2 text-blue-800">
                    <Info className="w-4 h-4" />
                    <span className="text-sm font-medium">Informații extrase din CNP:</span>
                  </div>
                  <div className="mt-1 text-sm text-blue-700">
                    <p>Gen: {cnpAnalysis.gender === 'male' ? 'Masculin' : 'Feminin'}</p>
                    <p>Data nașterii: {cnpAnalysis.birthDate?.toLocaleDateString('ro-RO')}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Informații de Contact</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-medflow-primary focus:border-medflow-primary ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="exemplu@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefon
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-medflow-primary focus:border-medflow-primary ${
                  errors.phone ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="+40 123 456 789"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>
          </div>

          {errors.contact && (
            <p className="text-sm text-red-600">{errors.contact}</p>
          )}
        </div>

        {/* Medical Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Informații Medicale</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grupa de Sânge
            </label>
            <select
              value={formData.bloodType}
              onChange={(e) => handleFieldChange('bloodType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medflow-primary focus:border-medflow-primary"
            >
              <option value="">Selectați grupa de sânge</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Anulează
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-medflow-primary text-white rounded-lg hover:bg-medflow-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Se creează...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Creează Pacient
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  )
}
