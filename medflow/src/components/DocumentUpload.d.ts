/**
 * Enhanced Document Upload Component for MedFlow
 *
 * Features:
 * - Professional medical document upload with drag & drop
 * - Firebase Storage integration with progress tracking
 * - Comprehensive file validation and error handling
 * - MedFlow branding with professional styling
 * - Responsive design and accessibility support
 * - AI integration placeholders for document analysis
 * - Secure file handling with metadata management
 *
 * @author MedFlow Team
 * @version 2.0
 */
interface DocumentUploadProps {
    appointmentId: string;
    onUploadComplete?: (document: DocumentMetadata) => void;
    maxFileSize?: number;
    allowedTypes?: string[];
    multiple?: boolean;
}
interface DocumentMetadata {
    id: string;
    appointmentId: string;
    uploaderId: string;
    fileUrl: string;
    fileName: string;
    contentType: string;
    size: number;
    createdAt: Date;
    scanResults?: {
        isValid: boolean;
        fileType: string;
        hasVirus: boolean;
        aiAnalysis?: string;
    };
}
export default function DocumentUpload({ appointmentId, onUploadComplete, maxFileSize, // 10MB default
allowedTypes, multiple }: DocumentUploadProps): import("react/jsx-runtime").JSX.Element;
export {};
