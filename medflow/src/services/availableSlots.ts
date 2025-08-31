/**
 * Available Slots Service for MedFlow
 * 
 * Detects real-time available appointment slots based on doctor schedules,
 * existing appointments, and Romanian medical practice constraints.
 * 
 * @author MedFlow Team
 * @version 1.0
 */

import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy,
  Timestamp 
} from 'firebase/firestore'
import { db } from './firebase'
import { addDays, addMinutes, format, isWeekend, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns'
import { ro } from 'date-fns/locale'

/**
 * Available time slot
 */
export interface AvailableSlot {
  datetime: Date
  duration: number // minutes
  available: boolean
  reason?: string // why not available
  displayText: string
  isPeak: boolean // busy time indicator
}

/**
 * Doctor's working schedule
 */
export interface DoctorSchedule {
  userId: string // User ID for the new ADMIN/USER role system
  workingDays: number[] // 1-7, Monday to Sunday
  workingHours: {
    start: string // "08:00"
    end: string   // "18:00"
    lunchBreak?: {
      start: string // "12:00"
      end: string   // "13:00"
    }
  }
  slotDuration: number // minutes, default 30
  bufferTime: number   // minutes between appointments, default 15
  maxAdvanceBooking: number // days, default 90
  specialSchedule?: {
    date: Date
    available: boolean
    customHours?: {
      start: string
      end: string
    }
  }[]
}

/**
 * Slot availability options
 */
export interface SlotAvailabilityOptions {
  userId: string // User ID for the new ADMIN/USER role system
  startDate: Date
  endDate: Date
  excludeAppointmentId?: string // for rescheduling
  includeSameDay?: boolean
  maxSlots?: number
  onlyFutureSlots?: boolean
}

/**
 * AvailableSlotsService
 * 
 * Provides real-time slot availability detection with Romanian
 * medical practice considerations and scheduling constraints.
 */
export class AvailableSlotsService {
  
  /**
   * Get available slots for a doctor within date range
   */
  static async getAvailableSlots(options: SlotAvailabilityOptions): Promise<AvailableSlot[]> {
    try {
      const {
        userId,
        startDate,
        endDate,
        excludeAppointmentId,
        includeSameDay = true,
        maxSlots = 100,
        onlyFutureSlots = true
      } = options
      
      // Get doctor's schedule
      const doctorSchedule = await this.getDoctorSchedule(userId)
      
      // Get existing appointments
      const existingAppointments = await this.getExistingAppointments(
        userId, 
        startDate, 
        endDate, 
        excludeAppointmentId
      )
      
      // Generate potential slots
      const potentialSlots = this.generatePotentialSlots(
        doctorSchedule,
        startDate,
        endDate,
        includeSameDay,
        onlyFutureSlots
      )
      
      // Check availability for each slot
      const availableSlots = potentialSlots.map(slot => 
        this.checkSlotAvailability(slot, existingAppointments, doctorSchedule)
      )
      
      // Filter available slots and limit results
      const validSlots = availableSlots
        .filter(slot => slot.available)
        .slice(0, maxSlots)
      
      console.log(`Found ${validSlots.length} available slots for user ${userId}`)
      
      return validSlots
    } catch (error) {
      console.error('Error getting available slots:', error)
      throw new Error('Nu s-au putut încărca intervalele disponibile')
    }
  }
  
  /**
   * Get next available slot for urgent bookings
   */
  static async getNextAvailableSlot(
    userId: string,
    preferredDate?: Date
  ): Promise<AvailableSlot | null> {
    try {
      const startDate = preferredDate || new Date()
      const endDate = addDays(startDate, 7) // Look ahead 1 week
      
      const availableSlots = await this.getAvailableSlots({
        userId,
        startDate,
        endDate,
        maxSlots: 1,
        onlyFutureSlots: true
      })
      
      return availableSlots.length > 0 ? availableSlots[0] : null
    } catch (error) {
      console.error('Error getting next available slot:', error)
      return null
    }
  }
  
  /**
   * Check if specific datetime is available
   */
  static async isSlotAvailable(
    userId: string,
    datetime: Date,
    excludeAppointmentId?: string
  ): Promise<boolean> {
    try {
      const startDate = startOfDay(datetime)
      const endDate = endOfDay(datetime)
      
      const availableSlots = await this.getAvailableSlots({
        userId,
        startDate,
        endDate,
        excludeAppointmentId,
        maxSlots: 1000 // Check all slots for the day
      })
      
      return availableSlots.some(slot => 
        Math.abs(slot.datetime.getTime() - datetime.getTime()) < 60000 // Within 1 minute
      )
    } catch (error) {
      console.error('Error checking slot availability:', error)
      return false
    }
  }
  
  /**
   * Get available slots for today only
   */
  static async getTodayAvailableSlots(userId: string): Promise<AvailableSlot[]> {
    const today = new Date()
    const startOfToday = startOfDay(today)
    const endOfToday = endOfDay(today)
    
    return this.getAvailableSlots({
      userId,
      startDate: startOfToday,
      endDate: endOfToday,
      includeSameDay: true,
      onlyFutureSlots: true,
      maxSlots: 50
    })
  }
  
  /**
   * Get doctor's working schedule (with defaults for Romanian medical practice)
   */
  private static async getDoctorSchedule(userId: string): Promise<DoctorSchedule> {
    try {
      // Try to get custom schedule from Firestore
      // For now, return default Romanian medical practice schedule
      
      return {
        userId,
        workingDays: [1, 2, 3, 4, 5], // Monday to Friday
        workingHours: {
          start: "08:00",
          end: "18:00",
          lunchBreak: {
            start: "12:00",
            end: "13:00"
          }
        },
        slotDuration: 30, // 30-minute appointments
        bufferTime: 15,   // 15-minute buffer
        maxAdvanceBooking: 90, // 3 months ahead
        specialSchedule: []
      }
    } catch (error) {
      console.error('Error getting doctor schedule:', error)
      // Return default schedule as fallback
      return {
        userId,
        workingDays: [1, 2, 3, 4, 5],
        workingHours: {
          start: "08:00",
          end: "18:00"
        },
        slotDuration: 30,
        bufferTime: 15,
        maxAdvanceBooking: 90,
        specialSchedule: []
      }
    }
  }
  
  /**
   * Get existing appointments for date range
   */
  private static async getExistingAppointments(
    userId: string,
    startDate: Date,
    endDate: Date,
    excludeAppointmentId?: string
  ): Promise<Array<{ id: string; dateTime: Date; duration: number }>> {
    try {
      const appointmentsQuery = query(
        collection(db, 'appointments'),
        where('userId', '==', userId),
        where('dateTime', '>=', Timestamp.fromDate(startDate)),
        where('dateTime', '<=', Timestamp.fromDate(endDate)),
        where('status', 'in', ['scheduled', 'confirmed']), // Only count active appointments
        orderBy('dateTime')
      )
      
      const snapshot = await getDocs(appointmentsQuery)
      
      const appointments = snapshot.docs
        .map(doc => ({
          id: doc.id,
          dateTime: doc.data().dateTime.toDate(),
          duration: doc.data().duration || 30 // Default 30 minutes
        }))
        .filter(apt => apt.id !== excludeAppointmentId) // Exclude current appointment for rescheduling
      
      return appointments
    } catch (error) {
      console.error('Error getting existing appointments:', error)
      return []
    }
  }
  
  /**
   * Generate potential time slots based on schedule
   */
  private static generatePotentialSlots(
    schedule: DoctorSchedule,
    startDate: Date,
    endDate: Date,
    includeSameDay: boolean,
    onlyFutureSlots: boolean
  ): Array<{ datetime: Date; duration: number }> {
    const slots: Array<{ datetime: Date; duration: number }> = []
    const now = new Date()
    
    let currentDate = new Date(startDate)
    
    while (currentDate <= endDate) {
      // Skip weekends unless explicitly allowed
      if (isWeekend(currentDate) && !schedule.workingDays.includes(currentDate.getDay())) {
        currentDate = addDays(currentDate, 1)
        continue
      }
      
      // Skip non-working days
      if (!schedule.workingDays.includes(currentDate.getDay())) {
        currentDate = addDays(currentDate, 1)
        continue
      }
      
      // Skip same day if not allowed
      if (!includeSameDay && this.isSameDay(currentDate, now)) {
        currentDate = addDays(currentDate, 1)
        continue
      }
      
      // Generate slots for this day
      const daySlots = this.generateDaySlots(currentDate, schedule)
      
      // Filter future slots if required
      const validSlots = onlyFutureSlots 
        ? daySlots.filter(slot => isAfter(slot.datetime, now))
        : daySlots
      
      slots.push(...validSlots)
      currentDate = addDays(currentDate, 1)
    }
    
    return slots
  }
  
  /**
   * Generate slots for a specific day
   */
  private static generateDaySlots(
    date: Date,
    schedule: DoctorSchedule
  ): Array<{ datetime: Date; duration: number }> {
    const slots: Array<{ datetime: Date; duration: number }> = []
    
    // Parse working hours
    const [startHour, startMinute] = schedule.workingHours.start.split(':').map(Number)
    const [endHour, endMinute] = schedule.workingHours.end.split(':').map(Number)
    
    let currentSlot = new Date(date)
    currentSlot.setHours(startHour, startMinute, 0, 0)
    
    const endTime = new Date(date)
    endTime.setHours(endHour, endMinute, 0, 0)
    
    // Generate slots with duration and buffer time
    while (isBefore(currentSlot, endTime)) {
      // Check if slot conflicts with lunch break
      if (schedule.workingHours.lunchBreak) {
        const [lunchStartHour, lunchStartMinute] = schedule.workingHours.lunchBreak.start.split(':').map(Number)
        const [lunchEndHour, lunchEndMinute] = schedule.workingHours.lunchBreak.end.split(':').map(Number)
        
        const lunchStart = new Date(date)
        lunchStart.setHours(lunchStartHour, lunchStartMinute, 0, 0)
        
        const lunchEnd = new Date(date)
        lunchEnd.setHours(lunchEndHour, lunchEndMinute, 0, 0)
        
        // Skip lunch break slots
        if (currentSlot >= lunchStart && currentSlot < lunchEnd) {
          currentSlot = new Date(lunchEnd)
          continue
        }
      }
      
      // Add slot if it fits within working hours
      const slotEnd = addMinutes(currentSlot, schedule.slotDuration)
      if (slotEnd <= endTime) {
        slots.push({
          datetime: new Date(currentSlot),
          duration: schedule.slotDuration
        })
      }
      
      // Move to next slot (duration + buffer time)
      currentSlot = addMinutes(currentSlot, schedule.slotDuration + schedule.bufferTime)
    }
    
    return slots
  }
  
  /**
   * Check if a specific slot is available
   */
  private static checkSlotAvailability(
    slot: { datetime: Date; duration: number },
    existingAppointments: Array<{ dateTime: Date; duration: number }>,
    schedule: DoctorSchedule
  ): AvailableSlot {
    const slotStart = slot.datetime
    const slotEnd = addMinutes(slotStart, slot.duration)
    
    // Check for conflicts with existing appointments
    const hasConflict = existingAppointments.some(appointment => {
      const aptStart = appointment.dateTime
      const aptEnd = addMinutes(aptStart, appointment.duration)
      
      // Check for overlap
      return (slotStart < aptEnd && slotEnd > aptStart)
    })
    
    if (hasConflict) {
      return {
        datetime: slotStart,
        duration: slot.duration,
        available: false,
        reason: 'Interval ocupat',
        displayText: this.formatSlotDisplay(slotStart),
        isPeak: false
      }
    }
    
    // Check if slot is too far in advance
    const maxBookingDate = addDays(new Date(), schedule.maxAdvanceBooking)
    if (slotStart > maxBookingDate) {
      return {
        datetime: slotStart,
        duration: slot.duration,
        available: false,
        reason: 'Prea departe în viitor',
        displayText: this.formatSlotDisplay(slotStart),
        isPeak: false
      }
    }
    
    // Determine if it's a peak time (morning slots are typically busier)
    const hour = slotStart.getHours()
    const isPeak = hour >= 9 && hour <= 11
    
    return {
      datetime: slotStart,
      duration: slot.duration,
      available: true,
      displayText: this.formatSlotDisplay(slotStart),
      isPeak
    }
  }
  
  /**
   * Format slot for display
   */
  private static formatSlotDisplay(datetime: Date): string {
    const today = new Date()
    const tomorrow = addDays(today, 1)
    
    if (this.isSameDay(datetime, today)) {
      return `Astăzi, ${format(datetime, 'HH:mm')}`
    }
    
    if (this.isSameDay(datetime, tomorrow)) {
      return `Mâine, ${format(datetime, 'HH:mm')}`
    }
    
    return format(datetime, 'dd MMM yyyy, HH:mm', { locale: ro })
  }
  
  /**
   * Check if two dates are the same day
   */
  private static isSameDay(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString()
  }
  
  /**
   * Get slot recommendations based on patient history and preferences
   */
  static async getRecommendedSlots(
    userId: string,
    patientEmail?: string,
    maxRecommendations: number = 3
  ): Promise<AvailableSlot[]> {
    try {
      const startDate = new Date()
      const endDate = addDays(startDate, 14) // Look ahead 2 weeks
      
      const availableSlots = await this.getAvailableSlots({
        userId,
        startDate,
        endDate,
        maxSlots: 50
      })
      
      // Simple recommendation logic - prefer morning slots and weekdays
      const recommendedSlots = availableSlots
        .filter(slot => {
          const hour = slot.datetime.getHours()
          const dayOfWeek = slot.datetime.getDay()
          
          // Prefer 9-11 AM on weekdays
          return hour >= 9 && hour <= 11 && dayOfWeek >= 1 && dayOfWeek <= 5
        })
        .slice(0, maxRecommendations)
      
      // If not enough morning slots, add other available slots
      if (recommendedSlots.length < maxRecommendations) {
        const additionalSlots = availableSlots
          .filter(slot => !recommendedSlots.includes(slot))
          .slice(0, maxRecommendations - recommendedSlots.length)
        
        recommendedSlots.push(...additionalSlots)
      }
      
      return recommendedSlots
    } catch (error) {
      console.error('Error getting recommended slots:', error)
      return []
    }
  }
}

export default AvailableSlotsService
