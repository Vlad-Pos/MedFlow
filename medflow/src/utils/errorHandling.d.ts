/**
 * Comprehensive Error Handling System for MedFlow
 *
 * Features:
 * - Medical-specific error classification and handling
 * - Romanian language error messages for healthcare professionals
 * - Unauthorized access detection and graceful handling
 * - Firebase-specific error mapping
 * - Error reporting and analytics integration
 * - Production-ready error boundary components
 *
 * @author MedFlow Team
 * @version 2.0
 * @compliance GDPR error logging
 */
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ErrorCategory = 'authentication' | 'authorization' | 'validation' | 'network' | 'storage' | 'medical_data' | 'system' | 'unknown';
export interface MedFlowError {
    id: string;
    category: ErrorCategory;
    severity: ErrorSeverity;
    message: string;
    technicalMessage?: string;
    code?: string;
    timestamp: Date;
    userId?: string;
    context?: Record<string, unknown>;
    recoverable: boolean;
    userActions?: string[];
    reportToAdmin: boolean;
}
/**
 * Main Error Handler Class
 */
export declare class MedFlowErrorHandler {
    private static instance;
    private errorLog;
    private maxLogSize;
    private constructor();
    static getInstance(): MedFlowErrorHandler;
    /**
     * Handle and classify any error
     */
    handleError(error: unknown, context?: Record<string, unknown>, userId?: string): MedFlowError;
    /**
     * Create structured MedFlow error from any error type
     */
    private createMedFlowError;
    /**
     * Map Firebase errors to medical context
     */
    private mapFirebaseError;
    /**
     * Map custom error codes
     */
    private mapErrorCode;
    /**
     * Get default error structure
     */
    private getDefaultError;
    /**
     * Sanitize error messages to remove sensitive information
     */
    private sanitizeErrorMessage;
    /**
     * Log error to local storage and analytics
     */
    private logError;
    /**
     * Report critical errors to administrators
     */
    private reportToAdmin;
    /**
     * Send error data to analytics (anonymized)
     */
    private sendToAnalytics;
    /**
     * Generate unique error ID
     */
    private generateErrorId;
    /**
     * Get recent errors for debugging
     */
    getRecentErrors(count?: number): MedFlowError[];
    /**
     * Clear error log
     */
    clearErrorLog(): void;
}
/**
 * Convenience functions for easy error handling
 */
export declare function handleMedicalError(error: unknown, context?: Record<string, unknown>, userId?: string): MedFlowError;
export declare function createAuthorizationError(message?: string): MedFlowError;
export declare function createValidationError(field: string, message?: string): MedFlowError;
export declare function createNetworkError(operation?: string): MedFlowError;
/**
 * Error boundary component helpers
 */
export interface ErrorBoundaryState {
    hasError: boolean;
    error?: MedFlowError;
}
export declare function getErrorRecoveryActions(error: MedFlowError): {
    primary: string;
    secondary?: string;
    emergency?: string;
};
/**
 * Medical-specific error validators
 */
export declare function validateMedicalLicense(license: string): {
    isValid: boolean;
    error?: MedFlowError;
};

export declare const errorHandler: MedFlowErrorHandler;
