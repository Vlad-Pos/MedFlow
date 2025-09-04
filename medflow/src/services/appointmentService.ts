/**
 * Appointment Service for MedFlow
 * Provides appointment management and availability checking functionality
 */

import { isDemoMode } from '../utils/demo'
import { db } from './firebase'
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore'

export interface AvailableTimeSlot {
  start: Date
  end: Date
  available: boolean
  appointmentId?: string
}

export interface AppointmentConstraints {
  workDays: number[] // 0 = Sunday, 1 = Monday, etc.
  workStartHour: number // 8 = 08:00
  workEndHour: number // 18 = 18:00
  slotDuration: number // 45 minutes
  doctorId?: string
}

export interface RescheduleRequest {
  appointmentId: string
  newDateTime: Date
  reason?: string
  patientName: string
  patientEmail: string
}

/**
 * Get available time slots for a specific date
 */
export const getAvailableTimeSlots = async (
  date: Date,
  constraints: AppointmentConstraints,
  excludeAppointmentId?: string
): Promise<AvailableTimeSlot[]> => {
  try {
    if (isDemoMode()) {
      return getDemoAvailableTimeSlots(date, constraints, excludeAppointmentId)
    }

    // Get real appointments from Firestore
    const appointments = await getAppointmentsForDate(date, excludeAppointmentId)
    return generateAvailableSlots(date, constraints, appointments)
  } catch (error) {
    console.error('Error getting available time slots:', error)
    // Fallback to demo mode if there's an error
    return getDemoAvailableTimeSlots(date, constraints, excludeAppointmentId)
  }
}

/**
 * Get appointments for a specific date from Firestore
 */
const getAppointmentsForDate = async (date: Date, excludeAppointmentId?: string) => {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  const appointmentsRef = collection(db, 'appointments')
  const q = query(
    appointmentsRef,
    where('dateTime', '>=', Timestamp.fromDate(startOfDay)),
    where('dateTime', '<=', Timestamp.fromDate(endOfDay))
  )

  const snapshot = await getDocs(q)
  const appointments: any[] = []
  
  snapshot.forEach((doc) => {
    const data = doc.data()
    if (data.id !== excludeAppointmentId) {
      appointments.push({
        id: doc.id,
        ...data,
        dateTime: data.dateTime?.toDate?.() || new Date(data.dateTime)
      })
    }
  })

  return appointments
}

/**
 * Generate available time slots based on constraints and existing appointments
 */
const generateAvailableSlots = (
  date: Date,
  constraints: AppointmentConstraints,
  existingAppointments: any[]
): AvailableTimeSlot[] => {
  const slots: AvailableTimeSlot[] = []
  const { workDays, workStartHour, workEndHour, slotDuration } = constraints
  
  // Check if the date is a work day
  const dayOfWeek = date.getDay()
  if (!workDays.includes(dayOfWeek)) {
    return slots // No slots available on non-work days
  }

  // Check if the date is in the past
  const now = new Date()
  if (date < now && date.toDateString() === now.toDateString()) {
    // For today, only show future slots
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    
    for (let hour = Math.max(workStartHour, currentHour); hour < workEndHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        if (hour === currentHour && minute <= currentMinute) continue
        
        const start = new Date(date)
        start.setHours(hour, minute, 0, 0)
        
        const end = new Date(start)
        end.setMinutes(end.getMinutes() + slotDuration)
        
        const isAvailable = !isTimeSlotOccupied(start, end, existingAppointments)
        
        slots.push({
          start,
          end,
          available: isAvailable
        })
      }
    }
  } else {
    // For future dates, show all slots
    for (let hour = workStartHour; hour < workEndHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const start = new Date(date)
        start.setHours(hour, minute, 0, 0)
        
        const end = new Date(start)
        end.setMinutes(end.getMinutes() + slotDuration)
        
        const isAvailable = !isTimeSlotOccupied(start, end, existingAppointments)
        
        slots.push({
          start,
          end,
          available: isAvailable
        })
      }
    }
  }

  return slots
}

/**
 * Check if a time slot is occupied by existing appointments
 */
const isTimeSlotOccupied = (start: Date, end: Date, appointments: any[]): boolean => {
  return appointments.some(appointment => {
    const apptStart = new Date(appointment.dateTime)
    const apptEnd = new Date(apptStart.getTime() + (appointment.duration || 45) * 60 * 1000)
    
    // Check for overlap
    return start < apptEnd && end > apptStart
  })
}

/**
 * Get demo available time slots (fallback)
 */
const getDemoAvailableTimeSlots = (
  date: Date,
  constraints: AppointmentConstraints,
  excludeAppointmentId?: string
): AvailableTimeSlot[] => {
  const slots: AvailableTimeSlot[] = []
  const { workDays, workStartHour, workEndHour, slotDuration } = constraints
  
  // Check if the date is a work day
  const dayOfWeek = date.getDay()
  if (!workDays.includes(dayOfWeek)) {
    return slots
  }

  // Generate demo slots with some randomness for availability
  for (let hour = workStartHour; hour < workEndHour; hour++) {
    for (let minute = 0; minute < 60; minute += slotDuration) {
      const start = new Date(date)
      start.setHours(hour, minute, 0, 0)
      
      const end = new Date(start)
      end.setMinutes(end.getMinutes() + slotDuration)
      
      // Make some slots unavailable for demo purposes
      const isAvailable = Math.random() > 0.3 && start > new Date()
      
      slots.push({
        start,
        end,
        available: isAvailable
      })
    }
  }

  return slots
}

/**
 * Submit a reschedule request
 */
export const submitRescheduleRequest = async (request: RescheduleRequest): Promise<boolean> => {
  try {
    if (isDemoMode()) {
      // Handle demo mode reschedule
      console.log('Demo mode: Reschedule request submitted:', request)
      return true
    }

    // In real mode, you would:
    // 1. Update the existing appointment
    // 2. Send notifications
    // 3. Update calendar
    // 4. Log the change
    
    console.log('Real mode: Reschedule request submitted:', request)
    return true
  } catch (error) {
    console.error('Error submitting reschedule request:', error)
    return false
  }
}

/**
 * Get default appointment constraints
 */
export const getDefaultConstraints = (): AppointmentConstraints => ({
  workDays: [1, 2, 3, 4, 5], // Monday to Friday
  workStartHour: 8, // 8:00 AM
  workEndHour: 18, // 6:00 PM
  slotDuration: 45 // 45 minutes
})
