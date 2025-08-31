/**
 * Enhanced Appointment Form Component for MedFlow
 *
 * Features:
 * - Comprehensive input validation with Romanian error messages
 * - Real-time Firebase Firestore integration with immediate dashboard updates
 * - Professional medical styling with MedFlow branding
 * - Full responsiveness and accessibility for all devices
 * - AI integration placeholders for symptom analysis and smart suggestions
 * - Robust error handling and loading states
 * - Romanian localization for medical professionals
 *
 * @author MedFlow Team
 * @version 2.0
 */
import { Timestamp } from 'firebase/firestore';
export type AppointmentStatus = 'scheduled' | 'completed' | 'no_show';
export interface Appointment {
    id?: string;
    userId: string; // User ID for the new ADMIN/USER role system
    patientName: string;
    dateTime: Date;
    symptoms: string;
    notes?: string;
    status: AppointmentStatus;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}
interface AppointmentFormProps {
    appointmentId?: string;
    onSaved?: () => void;
    initialData?: {
        patientName?: string;
        dateTime?: string;
        symptoms?: string;
        notes?: string;
    };
}
export default function AppointmentForm({ appointmentId, onSaved, initialData }: AppointmentFormProps): import("react/jsx-runtime").JSX.Element;
export {};
