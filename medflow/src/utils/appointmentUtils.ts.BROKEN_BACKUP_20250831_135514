/**
 * Appointment utility functions for the MedFlow application
 */

import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../services/firebase'

export interface Appointment {
  id?: string
  patientName: string
  patientEmail?: string
  patientPhone?: string
  dateTime: Date
  symptoms: string
  notes?: string
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  doctorId: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Gets appointments for a specific date
 */
export const getAppointmentsForDate = async (date: Date, doctorId?: string): Promise<Appointment[]> => {
  try {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)
    
    const appointmentsRef = collection(db, 'appointments')
    let q = query(
      appointmentsRef,
      where('dateTime', '>=', startOfDay),
      where('dateTime', '<=', endOfDay)
    )
    
    if (doctorId) {
      q = query(q, where('doctorId', '==', doctorId))
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
        updatedAt: data.updatedAt.toDate()
      } as Appointment)
    })
    
    return appointments.sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime())
  } catch (error) {
    console.error('Error fetching appointments:', error)
    throw new Error('Failed to load appointments')
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
    
    const docRef = await addDoc(collection(db, 'appointments'), appointment)
    return docRef.id
  } catch (error) {
    console.error('Error creating appointment:', error)
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
  } catch (error) {
    console.error('Error updating appointment:', error)
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
  } catch (error) {
    console.error('Error deleting appointment:', error)
    throw new Error('Failed to delete appointment')
  }
}

/**
 * Gets appointments for a date range
 */
export const getAppointmentsForDateRange = async (
  startDate: Date,
  endDate: Date,
  doctorId?: string
): Promise<Appointment[]> => {
  try {
    const appointmentsRef = collection(db, 'appointments')
    let q = query(
      appointmentsRef,
      where('dateTime', '>=', startDate),
      where('dateTime', '<=', endDate)
    )
    
    if (doctorId) {
      q = query(q, where('doctorId', '==', doctorId))
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
        updatedAt: data.updatedAt.toDate()
      } as Appointment)
    })
    
    return appointments.sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime())
  } catch (error) {
    console.error('Error fetching appointments for date range:', error)
    throw new Error('Failed to load appointments')
  }
}

/**
 * Gets upcoming appointments for a doctor
 */
export const getUpcomingAppointments = async (doctorId: string, limit: number = 10): Promise<Appointment[]> => {
  try {
    const now = new Date()
    const appointmentsRef = collection(db, 'appointments')
    const q = query(
      appointmentsRef,
      where('doctorId', '==', doctorId),
      where('dateTime', '>=', now),
      where('status', 'in', ['scheduled', 'confirmed'])
    )
    
    const querySnapshot = await getDocs(q)
    const appointments: Appointment[] = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      appointments.push({
        id: doc.id,
        ...data,
        dateTime: data.dateTime.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as Appointment)
    })
    
    return appointments
      .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime())
      .slice(0, limit)
  } catch (error) {
    console.error('Error fetching upcoming appointments:', error)
    throw new Error('Failed to load upcoming appointments')
  }
}

/**
 * Checks if a time slot is available
 */
export const isTimeSlotAvailable = async (
  dateTime: Date,
  doctorId: string,
  excludeAppointmentId?: string
): Promise<boolean> => {
  try {
    const startTime = new Date(dateTime)
    startTime.setMinutes(startTime.getMinutes() - 30)
    
    const endTime = new Date(dateTime)
    endTime.setMinutes(endTime.getMinutes() + 30)
    
    const appointmentsRef = collection(db, 'appointments')
    let q = query(
      appointmentsRef,
      where('doctorId', '==', doctorId),
      where('dateTime', '>=', startTime),
      where('dateTime', '<=', endTime),
      where('status', 'in', ['scheduled', 'confirmed'])
    )
    
    const querySnapshot = await getDocs(q)
    
    // If excluding an appointment, check if there are other conflicts
    if (excludeAppointmentId) {
      return querySnapshot.empty || 
        querySnapshot.docs.every(doc => doc.id === excludeAppointmentId)
    }
    
    return querySnapshot.empty
  } catch (error) {
    console.error('Error checking time slot availability:', error)
    return false
  }
}
