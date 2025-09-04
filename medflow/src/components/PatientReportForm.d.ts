/**
 * Patient Report Form Component for MedFlow
 *
 * Comprehensive form for creating and editing patient consultation reports with:
 * - Tabbed interface for organized data entry
 * - Real-time validation with Romanian medical standards
 * - Auto-save functionality for drafts
 * - Template integration for quick input
 * - Voice-to-text support
 * - GDPR compliance features
 *
 * @author MedFlow Team
 * @version 1.0
 */
import { PatientReport } from '../types/patientReports';
declare global {
    interface Window {
        SpeechRecognition?: typeof SpeechRecognition;
        webkitSpeechRecognition?: typeof SpeechRecognition;
    }
}
interface PatientReportFormProps {
    appointmentId: string;
    patientId: string;
    patientName: string;
    reportId?: string;
    initialData?: Partial<PatientReport>;
    onSaved?: (reportId: string) => void;
    onFinalized?: (reportId: string) => void;
    onClose?: () => void;
}
export default function PatientReportForm({ appointmentId, patientId, patientName, reportId, initialData, onSaved, onFinalized, onClose }: PatientReportFormProps): import("react/jsx-runtime").JSX.Element;
export {};
