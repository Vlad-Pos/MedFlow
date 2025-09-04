/**
 * Appointment utility functions for the MedFlow application
 * Enhanced version with complete patient information fields
 */

import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy } from 'firebase/firestore'
import { db } from '../services/firebase'

export interface Appointment {
  id?: string
  patientName: string
  patientEmail?: string
  patientPhone?: string
  patientCNP?: string
  patientBirthDate?: Date
  dateTime: Date
  symptoms: string
  notes?: string
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  userId: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Gets appointments for a specific date
 */
export const getAppointmentsForDate = async (date: Date, userId?: string): Promise<Appointment[]> => {
  try {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)
    
    const appointmentsRef = collection(db, 'appointments')
    let q = query(
      appointmentsRef,
      where('dateTime', '>=', startOfDay),
      where('dateTime', '<=', endOfDay),
      orderBy('dateTime', 'asc')
    )
    
    if (userId) {
      q = query(q, where('userId', '==', userId))
    }
    
    const querySnapshot = await getDocs(q)
    const appointments: Appointment[] = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      appointments.push({
        id: doc.id,
        ...data,
        dateTime: data.dateTime.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        patientBirthDate: data.patientBirthDate ? data.patientBirthDate.toDate() : undefined
      } as Appointment)
    })
    
    return appointments.sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime())
  } catch (error) {
    console.error('Error fetching appointments:', error)
    throw new Error('Failed to load appointments')
  }
}

/**
 * Gets appointments for a date range
 */
export const getAppointmentsForDateRange = async (startDate: Date, endDate: Date, userId?: string): Promise<Appointment[]> => {
  try {
    const startOfDay = new Date(startDate)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(endDate)
    endOfDay.setHours(23, 59, 59, 999)
    
    const appointmentsRef = collection(db, 'appointments')
    let q = query(
      appointmentsRef,
      where('dateTime', '>=', startOfDay),
      where('dateTime', '<=', endOfDay),
      orderBy('dateTime', 'asc')
    )
    
    if (userId) {
      q = query(q, where('userId', '==', userId))
    }
    
    const querySnapshot = await getDocs(q)
    const appointments: Appointment[] = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      appointments.push({
        id: doc.id,
        ...data,
        dateTime: data.dateTime.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        patientBirthDate: data.patientBirthDate ? data.patientBirthDate.toDate() : undefined
      } as Appointment)
    })
    
    return appointments.sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime())
  } catch (error) {
    console.error('Error fetching appointments for date range:', error)
    throw new Error('Failed to load appointments')
  }
}

/**
 * Gets upcoming appointments
 */
export const getUpcomingAppointments = async (userId?: string, limit: number = 10): Promise<Appointment[]> => {
  try {
    const now = new Date()
    
    const appointmentsRef = collection(db, 'appointments')
    let q = query(
      appointmentsRef,
      where('dateTime', '>=', now),
      orderBy('dateTime', 'asc')
    )
    
    if (userId) {
      q = query(q, where('userId', '==', userId))
    }
    
    const querySnapshot = await getDocs(q)
    const appointments: Appointment[] = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      appointments.push({
        id: doc.id,
        ...data,
        dateTime: data.dateTime.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        patientBirthDate: data.patientBirthDate ? data.patientBirthDate.toDate() : undefined
      } as Appointment)
    })
    
    return appointments.slice(0, limit)
  } catch (error) {
    console.error('Error fetching upcoming appointments:', error)
    throw new Error('Failed to load upcoming appointments')
  }
}

/**
 * Creates a new appointment
 */
export const createAppointment = async (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const appointment = {
      ...appointmentData,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    console.log('🔍 Debug: Creating appointment with data:', appointment)
    console.log('🔍 Debug: Data types:')
    console.log('  - patientName:', typeof appointment.patientName, appointment.patientName)
    console.log('  - dateTime:', typeof appointment.dateTime, appointment.dateTime, appointment.dateTime.constructor.name)
    console.log('  - symptoms:', typeof appointment.symptoms, appointment.symptoms)
    console.log('  - status:', typeof appointment.status, appointment.status)
    console.log('  - userId:', typeof appointment.userId, appointment.userId)
    console.log('  - createdBy:', typeof appointment.createdBy, appointment.createdBy)
    console.log('  - patientEmail:', typeof appointment.patientEmail, appointment.patientEmail)
    console.log('  - patientPhone:', typeof appointment.patientPhone, appointment.patientPhone)
    console.log('  - patientCNP:', typeof appointment.patientCNP, appointment.patientCNP)
    console.log('  - patientBirthDate:', typeof appointment.patientBirthDate, appointment.patientBirthDate)
    console.log('  - notes:', typeof appointment.notes, appointment.notes)

    // ENHANCED DEBUGGING: Check authentication context
    console.log('🔍 Debug: Authentication Context:')
    console.log('  - Current user ID:', appointment.userId)
    console.log('  - Created by:', appointment.createdBy)
    console.log('  - userId === createdBy:', appointment.userId === appointment.createdBy)

    // ENHANCED DEBUGGING: Check field existence and values
    console.log('🔍 Debug: Field Analysis:')
    console.log('  - Has userId:', 'userId' in appointment)
    console.log('  - Has createdBy:', 'createdBy' in appointment)
    console.log('  - userId value:', appointment.userId)
    console.log('  - createdBy value:', appointment.createdBy)
    console.log('  - userId length:', appointment.userId?.length)
    console.log('  - createdBy length:', appointment.createdBy?.length)

    // ENHANCED DEBUGGING: Check for hidden characters
    console.log('🔍 Debug: Character Analysis:')
    console.log('  - userId char codes:', appointment.userId ? Array.from(appointment.userId).map(c => c.charCodeAt(0)) : 'undefined')
    console.log('  - createdBy char codes:', appointment.createdBy ? Array.from(appointment.createdBy).map(c => c.charCodeAt(0)) : 'undefined')

    const docRef = await addDoc(collection(db, 'appointments'), appointment)
    console.log('✅ Appointment created successfully with ID:', docRef.id)
    return docRef.id
  } catch (error) {
    console.error('❌ Error creating appointment:', error)
    console.error('❌ Full error details:', error)
    if (error && typeof error === 'object' && 'code' in error) {
      console.error('❌ Error code:', (error as any).code)
    }
    if (error && typeof error === 'object' && 'message' in error) {
      console.error('❌ Error message:', (error as any).message)
    }
    throw new Error('Failed to create appointment')
  }
}

/**
 * Updates an existing appointment
 */
export const updateAppointment = async (id: string, updates: Partial<Appointment>): Promise<void> => {
  try {
    const appointmentRef = doc(db, 'appointments', id)
    await updateDoc(appointmentRef, {
      ...updates,
      updatedAt: new Date()
    })
    console.log('✅ Appointment updated successfully:', id)
  } catch (error) {
    console.error('❌ Error updating appointment:', error)
    throw new Error('Failed to update appointment')
  }
}

/**
 * Deletes an appointment
 */
export const deleteAppointment = async (id: string): Promise<void> => {
  try {
    const appointmentRef = doc(db, 'appointments', id)
    await deleteDoc(appointmentRef)
    console.log('✅ Appointment deleted successfully:', id)
  } catch (error) {
    console.error('❌ Error deleting appointment:', error)
    throw new Error('Failed to delete appointment')
  }
}

/**
 * Gets a single appointment by ID
 */
export const getAppointmentById = async (id: string): Promise<Appointment | null> => {
  try {
    const appointmentRef = doc(db, 'appointments', id)
    const appointmentDoc = await getDocs(query(collection(db, 'appointments'), where('__name__', '==', id)))
    
    if (appointmentDoc.empty) {
      return null
    }
    
    const data = appointmentDoc.docs[0].data()
    return {
      id: appointmentDoc.docs[0].id,
      ...data,
      dateTime: data.dateTime.toDate(),
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      patientBirthDate: data.patientBirthDate ? data.patientBirthDate.toDate() : undefined
    } as Appointment
  } catch (error) {
    console.error('Error fetching appointment by ID:', error)
    throw new Error('Failed to load appointment')
  }
}
