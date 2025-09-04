/**
 * Patient Flag Indicator Component for MedFlow
 *
 * Visual indicators for flagged patients with flag counts, risk levels,
 * and quick access to flagging history and details.
 *
 * @author MedFlow Team
 * @version 1.0
 */
interface PatientFlagIndicatorProps {
    patientId: string;
    patientName: string;
    /** Display mode: inline for lists, badge for compact display, full for detailed view */
    mode?: 'inline' | 'badge' | 'full';
    /** Whether to show the flag tooltip on hover */
    showTooltip?: boolean;
    /** Custom CSS classes */
    className?: string;
    /** Callback when flag details are requested */
    onViewDetails?: (patientId: string) => void;
}
/**
 * Main patient flag indicator component
 */
export default function PatientFlagIndicator({ patientId, patientName, mode, showTooltip, className, onViewDetails }: PatientFlagIndicatorProps): import("react/jsx-runtime").JSX.Element | null;
export {};
