/**
 * Enhanced Document Manager Component for MedFlow
 *
 * Features:
 * - Professional document viewing and management
 * - Firebase Storage integration with secure downloads
 * - Document preview with thumbnail generation
 * - Comprehensive file metadata display
 * - MedFlow branding with responsive design
 * - AI integration placeholders for document analysis
 * - Secure document sharing and permissions
 *
 * @author MedFlow Team
 * @version 2.0
 */
interface DocumentManagerProps {
    appointmentId: string;
    allowDelete?: boolean;
    allowDownload?: boolean;
    showPreview?: boolean;
    compact?: boolean;
}
export default function DocumentManager({ appointmentId, allowDelete, allowDownload, showPreview, compact }: DocumentManagerProps): import("react/jsx-runtime").JSX.Element;
export {};
