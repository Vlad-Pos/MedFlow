/**
 * Doctor Alerts Component for MedFlow
 *
 * Displays patient flagging alerts and other important notifications
 * for doctors with real-time updates and Romanian localization.
 *
 * @author MedFlow Team
 * @version 1.0
 */
interface DoctorAlertsProps {
    className?: string;
    showUnreadOnly?: boolean;
    maxItems?: number;
    compact?: boolean;
}
export default function DoctorAlerts({ className, showUnreadOnly, maxItems, compact }: DoctorAlertsProps): import("react/jsx-runtime").JSX.Element;
export {};
