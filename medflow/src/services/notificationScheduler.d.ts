/**
 * Notification Scheduler Service for MedFlow
 *
 * Handles scheduling and execution of appointment notification reminders
 * with specific timing rules (9 AM day before, 3 PM same day).
 *
 * @author MedFlow Team
 * @version 1.0
 */
import { AppointmentWithNotifications } from '../types/notifications';
/**
 * NotificationSchedulerService
 *
 * Manages the scheduling and execution of appointment notifications
 * according to Romanian medical practice timing requirements.
 */
export declare class NotificationSchedulerService {
    /**
     * Schedule notifications for a new appointment
     */
    static scheduleAppointmentNotifications(appointment: AppointmentWithNotifications): Promise<void>;
    /**
     * Cancel all scheduled notifications for an appointment
     */
    static cancelAppointmentNotifications(appointmentId: string): Promise<void>;
    /**
     * Reschedule notifications when appointment time changes
     */
    static rescheduleAppointmentNotifications(appointmentId: string, newDateTime: Date): Promise<void>;
    /**
     * Execute pending notification jobs (called by scheduler)
     */
    static executePendingNotifications(): Promise<void>;
    /**
     * Calculate first notification time (9 AM, day before appointment)
     */
    private static calculateFirstNotificationTime;
    /**
     * Calculate second notification time (3 PM, same day as appointment)
     */
    private static calculateSecondNotificationTime;
    /**
     * Create a scheduler job
     */
    private static createSchedulerJob;
    /**
     * Execute a specific notification job
     */
    private static executeNotificationJob;
    /**
     * Mark a job as completed
     */
    private static markJobCompleted;
    /**
     * Select the optimal notification channel from available options
     */
    private static selectOptimalChannel;
    /**
     * Clean up old completed/failed jobs (maintenance function)
     */
    static cleanupOldJobs(olderThanDays?: number): Promise<void>;
    /**
     * Get notification statistics for monitoring
     */
    static getNotificationStats(startDate: Date, endDate: Date): Promise<{
        totalJobs: number;
        completedJobs: number;
        failedJobs: number;
        pendingJobs: number;
        averageExecutionTime: number;
    }>;
}
export default NotificationSchedulerService;
