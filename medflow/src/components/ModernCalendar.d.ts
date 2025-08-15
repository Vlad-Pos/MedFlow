/**
 * Enhanced Modern Calendar Component for MedFlow
 *
 * Features:
 * - Real-time Firebase Firestore synchronization
 * - MedFlow branding with professional medical styling
 * - Responsive design for all devices (mobile, tablet, desktop)
 * - Accessibility support with ARIA labels and keyboard navigation
 * - Status-based color coding for appointments
 * - Smart appointment management with confirmations
 * - Loading states and comprehensive error handling
 * - AI integration placeholders for future smart scheduling
 *
 * @author MedFlow Team
 * @version 2.0
 */
interface Appointment {
    id: string;
    patientName: string;
    dateTime: Date;
    symptoms: string;
    notes?: string;
    status: 'scheduled' | 'completed' | 'no_show';
    doctorId: string;
}
interface ModernCalendarProps {
    onAppointmentClick?: (appointment: Appointment) => void;
    onTimeSlotClick?: (date: Date, time: string) => void;
}
declare const ModernCalendar: import("react").MemoExoticComponent<({ onAppointmentClick, onTimeSlotClick }: ModernCalendarProps) => import("react/jsx-runtime").JSX.Element>;
export default ModernCalendar;
