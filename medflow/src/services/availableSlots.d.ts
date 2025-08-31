/**
 * Available Slots Service for MedFlow
 *
 * Detects real-time available appointment slots based on doctor schedules,
 * existing appointments, and Romanian medical practice constraints.
 *
 * @author MedFlow Team
 * @version 1.0
 */
/**
 * Available time slot
 */
export interface AvailableSlot {
    datetime: Date;
    duration: number;
    available: boolean;
    reason?: string;
    displayText: string;
    isPeak: boolean;
}
/**
 * Doctor's working schedule
 */
export interface DoctorSchedule {
    userId: string; // User ID for the new ADMIN/USER role system
    workingDays: number[];
    workingHours: {
        start: string;
        end: string;
        lunchBreak?: {
            start: string;
            end: string;
        };
    };
    slotDuration: number;
    bufferTime: number;
    maxAdvanceBooking: number;
    specialSchedule?: {
        date: Date;
        available: boolean;
        customHours?: {
            start: string;
            end: string;
        };
    }[];
}
/**
 * Slot availability options
 */
export interface SlotAvailabilityOptions {
    userId: string; // User ID for the new ADMIN/USER role system
    startDate: Date;
    endDate: Date;
    excludeAppointmentId?: string;
    includeSameDay?: boolean;
    maxSlots?: number;
    onlyFutureSlots?: boolean;
}
/**
 * AvailableSlotsService
 *
 * Provides real-time slot availability detection with Romanian
 * medical practice considerations and scheduling constraints.
 */
export declare class AvailableSlotsService {
    /**
     * Get available slots for a doctor within date range
     */
    static getAvailableSlots(options: SlotAvailabilityOptions): Promise<AvailableSlot[]>;
    /**
     * Get next available slot for urgent bookings
     */
    static getNextAvailableSlot(userId: string, preferredDate?: Date): Promise<AvailableSlot | null>;
    /**
     * Check if specific datetime is available
     */
    static isSlotAvailable(userId: string, datetime: Date, excludeAppointmentId?: string): Promise<boolean>;
    /**
     * Get available slots for today only
     */
    static getTodayAvailableSlots(userId: string): Promise<AvailableSlot[]>;
    /**
     * Get doctor's working schedule (with defaults for Romanian medical practice)
     */
    private static getDoctorSchedule;
    /**
     * Get existing appointments for date range
     */
    private static getExistingAppointments;
    /**
     * Generate potential time slots based on schedule
     */
    private static generatePotentialSlots;
    /**
     * Generate slots for a specific day
     */
    private static generateDaySlots;
    /**
     * Check if a specific slot is available
     */
    private static checkSlotAvailability;
    /**
     * Format slot for display
     */
    private static formatSlotDisplay;
    /**
     * Check if two dates are the same day
     */
    private static isSameDay;
    /**
     * Get slot recommendations based on patient history and preferences
     */
    static getRecommendedSlots(userId: string, patientEmail?: string, maxRecommendations?: number): Promise<AvailableSlot[]>;
}
export default AvailableSlotsService;
