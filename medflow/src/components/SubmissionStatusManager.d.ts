/**
 * Submission Status Manager Component for MedFlow
 *
 * Comprehensive interface for monitoring and managing government submissions:
 * - Real-time submission status monitoring
 * - Manual retry capabilities for failed submissions
 * - Submission receipts and confirmation tracking
 * - Comprehensive audit log viewing
 * - Automated submission scheduling
 *
 * @author MedFlow Team
 * @version 1.0
 */
interface SubmissionStatusManagerProps {
    batchId?: string;
    onClose?: () => void;
    showFullInterface?: boolean;
}
export default function SubmissionStatusManager({ batchId, onClose, showFullInterface }: SubmissionStatusManagerProps): import("react/jsx-runtime").JSX.Element;
export {};
