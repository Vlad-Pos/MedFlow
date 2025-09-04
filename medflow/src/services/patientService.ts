/**
 * Patient Service Implementation
 * 
 * Service layer for patient management operations including CRUD,
 * search, validation, and integration with Firebase.
 * 
 * @author MedFlow Team
 * @version 2.0
 */

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  Timestamp 
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { 
  Patient, 
  CreatePatientRequest, 
  UpdatePatientRequest, 
  PatientSearchQuery, 
  PatientSearchResult,
  PatientValidationResult,
  PatientValidationError,
  PatientValidationWarning,
  PatientStatistics
} from '../types/patient'
import { extractGenderFromCNP, extractBirthDateFromCNP, analyzeCNP } from '../utils/cnpValidation'

// Firebase Collections
const PATIENTS_COLLECTION = 'patients'
const APPOINTMENTS_COLLECTION = 'appointments'

/**
 * Patient Service Class
 */
export class PatientService {
  /**
   * Create a new patient
   */
  async createPatient(data: CreatePatientRequest): Promise<Patient> {
    try {
      // Validate the patient data
      const validation = await this.validatePatient(data)
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`)
      }

      // Check for duplicates
      const duplicates = await this.checkForDuplicates(data)
      if (duplicates.length > 0) {
        throw new Error('Patient with similar information already exists')
      }

      // Generate patient number
      const patientNumber = await this.generatePatientNumber()

      // Extract additional info from CNP if provided
      let extractedInfo = {}
      if (data.personalInfo.cnp) {
        const cnpAnalysis = analyzeCNP(data.personalInfo.cnp)
        if (cnpAnalysis) {
          extractedInfo = {
            gender: cnpAnalysis.gender,
            dateOfBirth: cnpAnalysis.birthDate
          }
        }
      }

      // Create patient document
      const patientData = {
        patientNumber,
        personalInfo: {
          firstName: data.personalInfo.firstName,
          lastName: data.personalInfo.lastName,
          fullName: `${data.personalInfo.firstName} ${data.personalInfo.lastName}`,
          dateOfBirth: data.personalInfo.dateOfBirth,
          gender: data.personalInfo.gender,
          cnp: data.personalInfo.cnp,
          ...extractedInfo
        },
        contactInfo: data.contactInfo,
        medicalInfo: {
          bloodType: data.medicalInfo?.bloodType,
          allergies: data.medicalInfo?.allergies || [],
          chronicConditions: data.medicalInfo?.chronicConditions || [],
          currentMedications: data.medicalInfo?.currentMedications || []
        },
        systemInfo: {
          createdBy: 'current-user-id', // TODO: Get from auth context
          lastModifiedBy: 'current-user-id',
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true
        },
        // Legacy fields for backward compatibility
        name: `${data.personalInfo.firstName} ${data.personalInfo.lastName}`,
        dateOfBirth: data.personalInfo.dateOfBirth,
        gender: data.personalInfo.gender
      }

      const docRef = await addDoc(collection(db, PATIENTS_COLLECTION), patientData)
      
      return {
        id: docRef.id,
        ...patientData
      } as Patient
    } catch (error) {
      console.error('Error creating patient:', error)
      throw error
    }
  }

  /**
   * Get a patient by ID
   */
  async getPatient(id: string): Promise<Patient | null> {
    try {
      const docRef = doc(db, PATIENTS_COLLECTION, id)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Patient
      }
      
      return null
    } catch (error) {
      console.error('Error getting patient:', error)
      throw error
    }
  }

  /**
   * Update a patient
   */
  async updatePatient(id: string, data: UpdatePatientRequest): Promise<Patient> {
    try {
      // Validate the update data
      const validation = await this.validatePatient(data)
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`)
      }

      const updateData = {
        ...data,
        systemInfo: {
          lastModifiedBy: 'current-user-id', // TODO: Get from auth context
          updatedAt: new Date()
        }
      }

      const docRef = doc(db, PATIENTS_COLLECTION, id)
      await updateDoc(docRef, updateData)
      
      return await this.getPatient(id) as Patient
    } catch (error) {
      console.error('Error updating patient:', error)
      throw error
    }
  }

  /**
   * Delete a patient (soft delete)
   */
  async deletePatient(id: string): Promise<boolean> {
    try {
      const docRef = doc(db, PATIENTS_COLLECTION, id)
      await updateDoc(docRef, {
        'systemInfo.isActive': false,
        'systemInfo.updatedAt': new Date()
      })
      
      return true
    } catch (error) {
      console.error('Error deleting patient:', error)
      throw error
    }
  }

  /**
   * Search patients with filters and pagination
   */
  async searchPatients(query: PatientSearchQuery): Promise<PatientSearchResult> {
    try {
      const startTime = Date.now()
      let q = collection(db, PATIENTS_COLLECTION)

      // Apply filters
      if (query.filters.isActive !== undefined) {
        q = query(q, where('systemInfo.isActive', '==', query.filters.isActive))
      }

      if (query.filters.gender) {
        q = query(q, where('personalInfo.gender', '==', query.filters.gender))
      }

      if (query.filters.hasCNP !== undefined) {
        if (query.filters.hasCNP) {
          q = query(q, where('personalInfo.cnp', '!=', null))
        } else {
          q = query(q, where('personalInfo.cnp', '==', null))
        }
      }

      // Apply sorting
      if (query.sortBy) {
        q = query(q, orderBy(query.sortBy, query.sortOrder || 'asc'))
      }

      // Apply pagination
      const pageSize = query.limit || 20
      q = query(q, limit(pageSize))

      const snapshot = await getDocs(q)
      const patients = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Patient[]

      // Apply text search filter (client-side for now)
      const filteredPatients = this.applyTextSearch(patients, query.query)

      const searchTime = Date.now() - startTime

      return {
        patients: filteredPatients,
        total: filteredPatients.length,
        page: query.page || 1,
        limit: pageSize,
        hasMore: filteredPatients.length === pageSize,
        searchTime
      }
    } catch (error) {
      console.error('Error searching patients:', error)
      throw error
    }
  }

  /**
   * Find patient by CNP
   */
  async findPatientByCNP(cnp: string): Promise<Patient | null> {
    try {
      const q = query(
        collection(db, PATIENTS_COLLECTION),
        where('personalInfo.cnp', '==', cnp),
        where('systemInfo.isActive', '==', true)
      )
      
      const snapshot = await getDocs(q)
      if (snapshot.empty) return null
      
      const doc = snapshot.docs[0]
      return {
        id: doc.id,
        ...doc.data()
      } as Patient
    } catch (error) {
      console.error('Error finding patient by CNP:', error)
      throw error
    }
  }

  /**
   * Find patient by email
   */
  async findPatientByEmail(email: string): Promise<Patient | null> {
    try {
      const q = query(
        collection(db, PATIENTS_COLLECTION),
        where('contactInfo.email', '==', email),
        where('systemInfo.isActive', '==', true)
      )
      
      const snapshot = await getDocs(q)
      if (snapshot.empty) return null
      
      const doc = snapshot.docs[0]
      return {
        id: doc.id,
        ...doc.data()
      } as Patient
    } catch (error) {
      console.error('Error finding patient by email:', error)
      throw error
    }
  }

  /**
   * Find patient by phone
   */
  async findPatientByPhone(phone: string): Promise<Patient | null> {
    try {
      const q = query(
        collection(db, PATIENTS_COLLECTION),
        where('contactInfo.phone', '==', phone),
        where('systemInfo.isActive', '==', true)
      )
      
      const snapshot = await getDocs(q)
      if (snapshot.empty) return null
      
      const doc = snapshot.docs[0]
      return {
        id: doc.id,
        ...doc.data()
      } as Patient
    } catch (error) {
      console.error('Error finding patient by phone:', error)
      throw error
    }
  }

  /**
   * Get patient statistics
   */
  async getPatientStatistics(): Promise<PatientStatistics> {
    try {
      const q = query(
        collection(db, PATIENTS_COLLECTION),
        where('systemInfo.isActive', '==', true)
      )
      
      const snapshot = await getDocs(q)
      const patients = snapshot.docs.map(doc => doc.data()) as Patient[]
      
      return this.calculatePatientStatistics(patients)
    } catch (error) {
      console.error('Error getting patient statistics:', error)
      throw error
    }
  }

  /**
   * Validate patient data
   */
  async validatePatient(data: CreatePatientRequest | UpdatePatientRequest): Promise<PatientValidationResult> {
    const errors: PatientValidationError[] = []
    const warnings: PatientValidationWarning[] = []

    // Validate required fields for creation
    if ('personalInfo' in data) {
      if (!data.personalInfo.firstName) {
        errors.push({
          field: 'personalInfo.firstName',
          message: 'First name is required',
          code: 'REQUIRED'
        })
      }

      if (!data.personalInfo.lastName) {
        errors.push({
          field: 'personalInfo.lastName',
          message: 'Last name is required',
          code: 'REQUIRED'
        })
      }

      if (!data.personalInfo.dateOfBirth) {
        errors.push({
          field: 'personalInfo.dateOfBirth',
          message: 'Date of birth is required',
          code: 'REQUIRED'
        })
      }

      // Validate CNP if provided
      if (data.personalInfo.cnp) {
        const cnpAnalysis = analyzeCNP(data.personalInfo.cnp)
        if (!cnpAnalysis || !cnpAnalysis.isValid) {
          errors.push({
            field: 'personalInfo.cnp',
            message: 'Invalid CNP format',
            code: 'INVALID_CNP'
          })
        }
      } else {
        warnings.push({
          field: 'personalInfo.cnp',
          message: 'CNP is recommended for Romanian citizens',
          code: 'MISSING_CNP'
        })
      }
    }

    // Validate contact info
    if ('contactInfo' in data) {
      if (!data.contactInfo.email && !data.contactInfo.phone) {
        warnings.push({
          field: 'contactInfo',
          message: 'At least one contact method (email or phone) is recommended',
          code: 'MISSING_CONTACT'
        })
      }

      if (data.contactInfo.email && !this.isValidEmail(data.contactInfo.email)) {
        errors.push({
          field: 'contactInfo.email',
          message: 'Invalid email format',
          code: 'INVALID_EMAIL'
        })
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Check for duplicate patients
   */
  async checkForDuplicates(patient: CreatePatientRequest): Promise<Patient[]> {
    const duplicates: Patient[] = []

    // Check by CNP
    if (patient.personalInfo.cnp) {
      const existingByCNP = await this.findPatientByCNP(patient.personalInfo.cnp)
      if (existingByCNP) {
        duplicates.push(existingByCNP)
      }
    }

    // Check by email
    if (patient.contactInfo.email) {
      const existingByEmail = await this.findPatientByEmail(patient.contactInfo.email)
      if (existingByEmail) {
        duplicates.push(existingByEmail)
      }
    }

    // Check by phone
    if (patient.contactInfo.phone) {
      const existingByPhone = await this.findPatientByPhone(patient.contactInfo.phone)
      if (existingByPhone) {
        duplicates.push(existingByPhone)
      }
    }

    return duplicates
  }

  /**
   * Generate unique patient number
   */
  private async generatePatientNumber(): Promise<string> {
    const year = new Date().getFullYear()
    const q = query(
      collection(db, PATIENTS_COLLECTION),
      where('patientNumber', '>=', `P-${year}-000`),
      where('patientNumber', '<', `P-${year + 1}-000`),
      orderBy('patientNumber', 'desc'),
      limit(1)
    )
    
    const snapshot = await getDocs(q)
    let nextNumber = 1
    
    if (!snapshot.empty) {
      const lastPatient = snapshot.docs[0].data()
      const lastNumber = parseInt(lastPatient.patientNumber.split('-')[2])
      nextNumber = lastNumber + 1
    }
    
    return `P-${year}-${nextNumber.toString().padStart(3, '0')}`
  }

  /**
   * Apply text search filter
   */
  private applyTextSearch(patients: Patient[], searchQuery: string): Patient[] {
    if (!searchQuery.trim()) return patients
    
    const query = searchQuery.toLowerCase()
    
    return patients.filter(patient => {
      return (
        patient.personalInfo.fullName.toLowerCase().includes(query) ||
        patient.personalInfo.firstName.toLowerCase().includes(query) ||
        patient.personalInfo.lastName.toLowerCase().includes(query) ||
        patient.patientNumber.toLowerCase().includes(query) ||
        (patient.personalInfo.cnp && patient.personalInfo.cnp.includes(query)) ||
        (patient.contactInfo.email && patient.contactInfo.email.toLowerCase().includes(query)) ||
        (patient.contactInfo.phone && patient.contactInfo.phone.includes(query))
      )
    })
  }

  /**
   * Calculate patient statistics
   */
  private calculatePatientStatistics(patients: Patient[]): PatientStatistics {
    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    const stats: PatientStatistics = {
      totalPatients: patients.length,
      activePatients: patients.filter(p => p.systemInfo.isActive).length,
      newPatientsThisMonth: patients.filter(p => p.systemInfo.createdAt >= thisMonth).length,
      patientsWithCNP: patients.filter(p => p.personalInfo.cnp).length,
      patientsWithoutCNP: patients.filter(p => !p.personalInfo.cnp).length,
      genderDistribution: {
        male: 0,
        female: 0,
        other: 0,
        preferNotToSay: 0
      },
      ageDistribution: {
        '0-18': 0,
        '19-35': 0,
        '36-50': 0,
        '51-65': 0,
        '65+': 0
      },
      commonAllergies: [],
      commonConditions: []
    }

    // Calculate gender distribution
    patients.forEach(patient => {
      stats.genderDistribution[patient.personalInfo.gender]++
    })

    // Calculate age distribution
    patients.forEach(patient => {
      const age = this.calculateAge(patient.personalInfo.dateOfBirth)
      if (age <= 18) stats.ageDistribution['0-18']++
      else if (age <= 35) stats.ageDistribution['19-35']++
      else if (age <= 50) stats.ageDistribution['36-50']++
      else if (age <= 65) stats.ageDistribution['51-65']++
      else stats.ageDistribution['65+']++
    })

    // Calculate common allergies and conditions
    const allergyCounts: Record<string, number> = {}
    const conditionCounts: Record<string, number> = {}

    patients.forEach(patient => {
      patient.medicalInfo.allergies.forEach(allergy => {
        allergyCounts[allergy.allergen] = (allergyCounts[allergy.allergen] || 0) + 1
      })
      
      patient.medicalInfo.chronicConditions.forEach(condition => {
        conditionCounts[condition.name] = (conditionCounts[condition.name] || 0) + 1
      })
    })

    stats.commonAllergies = Object.entries(allergyCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([allergen, count]) => ({ allergen, count }))

    stats.commonConditions = Object.entries(conditionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([condition, count]) => ({ condition, count }))

    return stats
  }

  /**
   * Calculate age from birth date
   */
  private calculateAge(birthDate: Date): number {
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}

// Export singleton instance
export const patientService = new PatientService()
