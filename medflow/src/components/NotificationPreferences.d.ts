/**
 * Notification Preferences Component for MedFlow
 *
 * Comprehensive UI for patients to manage notification preferences
 * with GDPR compliance and Romanian localization.
 *
 * @author MedFlow Team
 * @version 1.0
 */
import { PatientNotificationPreferences } from '../types/notifications';
interface NotificationPreferencesProps {
    patientId?: string;
    onSaved?: (preferences: PatientNotificationPreferences) => void;
    className?: string;
}
export default function NotificationPreferences({ patientId, onSaved, className }: NotificationPreferencesProps): import("react/jsx-runtime").JSX.Element;
export {};
