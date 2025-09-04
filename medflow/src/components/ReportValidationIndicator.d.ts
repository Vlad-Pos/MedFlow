/**
 * Report Validation Indicator Component for MedFlow
 *
 * Real-time validation feedback component that provides:
 * - Visual validation status indicators
 * - Detailed error and warning messages
 * - Field-specific validation feedback
 * - Progress tracking for report completion
 * - Romanian medical validation standards
 *
 * @author MedFlow Team
 * @version 1.0
 */
import { ReportValidation } from '../types/patientReports';
interface ReportValidationIndicatorProps {
    validation: ReportValidation | null;
    isValidating?: boolean;
    showDetails?: boolean;
    className?: string;
    compact?: boolean;
}
export default function ReportValidationIndicator({ validation, isValidating, showDetails, className, compact }: ReportValidationIndicatorProps): import("react/jsx-runtime").JSX.Element | null;
export {};
