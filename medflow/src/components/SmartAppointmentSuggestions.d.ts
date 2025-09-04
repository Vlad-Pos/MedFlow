/**
 * Smart Appointment Suggestions Component for MedFlow
 *
 * Features:
 * - AI-powered appointment slot optimization
 * - Intelligent scheduling based on doctor availability and patient preferences
 * - Medical urgency-based prioritization
 * - Conflict detection and resolution
 * - Professional UI with MedFlow branding
 * - Integration placeholders for OpenAI and Claude AI
 *
 * @author MedFlow Team
 * @version 2.0
 * @integration-ready OpenAI GPT-4, Claude AI
 */
import { AppointmentSuggestion } from '../services/aiService';
interface SmartAppointmentSuggestionsProps {
    doctorId?: string;
    patientPreferences?: {
        preferredHours?: number[];
        preferredDays?: string[];
        maxWaitTime?: number;
        urgencyLevel?: 'low' | 'medium' | 'high' | 'urgent';
    };
    onSelectSlot?: (suggestion: AppointmentSuggestion) => void;
    onScheduleAppointment?: (suggestion: AppointmentSuggestion) => void;
    className?: string;
}
export default function SmartAppointmentSuggestions({ doctorId, patientPreferences, onSelectSlot, onScheduleAppointment, className }: SmartAppointmentSuggestionsProps): import("react/jsx-runtime").JSX.Element;
export {};
