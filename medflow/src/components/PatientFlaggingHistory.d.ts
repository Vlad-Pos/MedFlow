/**
 * Patient Flagging History Component for MedFlow
 *
 * Comprehensive interface for doctors to view patient flagging history,
 * statistics, and manage flag resolution with GDPR compliance.
 *
 * @author MedFlow Team
 * @version 1.0
 */
interface PatientFlaggingHistoryProps {
    patientId?: string;
    className?: string;
    showFilters?: boolean;
    maxItems?: number;
}
/**
 * Main patient flagging history component
 */
export default function PatientFlaggingHistory({ patientId, className, showFilters, maxItems }: PatientFlaggingHistoryProps): import("react/jsx-runtime").JSX.Element;
export {};
