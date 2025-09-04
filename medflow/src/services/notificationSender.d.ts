/**
 * Notification Sender Service for MedFlow
 *
 * Handles multi-channel notification delivery with Romanian templates
 * and comprehensive error handling and delivery tracking.
 *
 * @author MedFlow Team
 * @version 1.0
 */
import { AppointmentWithNotifications, NotificationChannel } from '../types/notifications';
/**
 * NotificationSenderService
 *
 * Provides multi-channel notification delivery with comprehensive
 * error handling and delivery tracking.
 */
export declare class NotificationSenderService {
    /**
     * Send appointment notification through specified channel
     */
    static sendAppointmentNotification(appointment: AppointmentWithNotifications, channel: NotificationChannel, notificationType: 'first' | 'second'): Promise<boolean>;
    /**
     * Prepare template data for notification
     */
    private static prepareTemplateData;
    /**
     * Generate special instructions based on appointment data
     */
    private static getSpecialInstructions;
    /**
     * Generate secure confirmation links using AppointmentLinksService
     */
    private static generateConfirmationLinks;
    /**
     * Send email notification
     */
    private static sendEmailNotification;
    /**
     * Send SMS notification
     */
    private static sendSMSNotification;
    /**
     * Send in-app notification
     */
    private static sendInAppNotification;
    /**
     * Replace placeholders in template strings
     */
    private static replacePlaceholders;
    /**
     * Create delivery status record
     */
    private static createDeliveryStatusRecord;
    /**
     * Update delivery status
     */
    private static updateDeliveryStatus;
    /**
     * Send test notification (for debugging/testing)
     */
    static sendTestNotification(channel: NotificationChannel, recipient: string): Promise<boolean>;
}
export default NotificationSenderService;
