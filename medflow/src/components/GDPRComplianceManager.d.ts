/**
 * GDPR Compliance Manager for Patient Flagging System
 *
 * Provides comprehensive GDPR compliance features for patient flagging
 * including consent management, data access, and right to be forgotten.
 *
 * @author MedFlow Team
 * @version 1.0
 */
interface GDPRComplianceManagerProps {
    patientId: string;
    patientName: string;
    className?: string;
    onDataExported?: (data: Record<string, unknown>) => void;
    onDataDeleted?: () => void;
}
export default function GDPRComplianceManager({ patientId, patientName, className, onDataExported, onDataDeleted }: GDPRComplianceManagerProps): import("react/jsx-runtime").JSX.Element;
export {};
