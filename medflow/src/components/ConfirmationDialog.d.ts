/**
 * Enhanced Confirmation Dialog Component for MedFlow
 *
 * Features:
 * - Professional medical styling with MedFlow branding
 * - Accessible with ARIA labels and keyboard navigation
 * - Smooth animations and transitions
 * - Customizable actions and content
 * - Romanian localization for medical professionals
 *
 * @author MedFlow Team
 * @version 2.0
 */
interface ConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    type?: 'danger' | 'warning' | 'info';
    confirmText?: string;
    cancelText?: string;
    loading?: boolean;
}
export default function ConfirmationDialog({ isOpen, onClose, onConfirm, title, message, type, confirmText, cancelText, loading }: ConfirmationDialogProps): import("react/jsx-runtime").JSX.Element | null;
/**
 * Specialized confirmation dialogs for common medical actions
 */
interface DeleteAppointmentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    patientName?: string;
    loading?: boolean;
}
export declare function DeleteAppointmentDialog({ isOpen, onClose, onConfirm, patientName, loading }: DeleteAppointmentDialogProps): import("react/jsx-runtime").JSX.Element | null;
interface CompleteAppointmentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    patientName?: string;
    loading?: boolean;
}
export declare function CompleteAppointmentDialog({ isOpen, onClose, onConfirm, patientName, loading }: CompleteAppointmentDialogProps): import("react/jsx-runtime").JSX.Element | null;
export {};
