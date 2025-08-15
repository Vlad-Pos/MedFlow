/**
 * Medical Chatbot Interface for MedFlow
 *
 * Features:
 * - Professional medical chatbot UI for patient intake
 * - Romanian language support for patient communication
 * - Symptom collection and medical history gathering
 * - Emergency detection and triage capabilities
 * - AI integration placeholders for OpenAI GPT-4 and Claude
 * - Professional medical styling with MedFlow branding
 *
 * @author MedFlow Team
 * @version 2.0
 * @integration-ready OpenAI GPT-4, Claude AI
 */
interface ChatbotInterfaceProps {
    isOpen: boolean;
    onClose: () => void;
    onAppointmentRequest?: (data: Record<string, unknown>) => void;
    patientId?: string;
}
export default function ChatbotInterface({ isOpen, onClose, onAppointmentRequest, patientId }: ChatbotInterfaceProps): import("react/jsx-runtime").JSX.Element | null;
export {};
