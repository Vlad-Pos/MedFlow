/**
 * Amendment Manager Component for MedFlow
 *
 * Comprehensive amendment workflow management with:
 * - Create amendment requests for finalized reports
 * - Version control and change tracking
 * - Amendment approval/rejection workflow
 * - Audit trail for compliance
 * - GDPR-compliant data handling
 *
 * @author MedFlow Team
 * @version 1.0
 */
import { PatientReport } from '../types/patientReports';
interface AmendmentManagerProps {
    report: PatientReport;
    onAmendmentCreated?: (amendmentId: string) => void;
    onAmendmentProcessed?: (amendmentId: string, action: 'approve' | 'reject') => void;
    onAmendmentsApplied?: (reportId: string) => void;
    onClose?: () => void;
}
export default function AmendmentManager({ report, onAmendmentCreated, onAmendmentProcessed, onAmendmentsApplied, onClose }: AmendmentManagerProps): import("react/jsx-runtime").JSX.Element;
export {};
