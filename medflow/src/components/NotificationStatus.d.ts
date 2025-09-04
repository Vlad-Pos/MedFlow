/**
 * Notification Status Component for MedFlow
 *
 * Displays the notification delivery status for appointments
 * with visual indicators and patient response tracking.
 *
 * @author MedFlow Team
 * @version 1.0
 */
import { AppointmentWithNotifications } from '../types/notifications';
interface NotificationStatusProps {
    appointment: AppointmentWithNotifications;
    className?: string;
    compact?: boolean;
}
export default function NotificationStatus({ appointment, className, compact }: NotificationStatusProps): import("react/jsx-runtime").JSX.Element;
export {};
