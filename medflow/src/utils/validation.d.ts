export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}
export interface ValidationRule {
    test: (value: string) => boolean;
    message: string;
}
export declare const validationRules: {
    required: (value: string) => boolean;
    email: (value: string) => boolean;
    minLength: (min: number) => (value: string) => boolean;
    maxLength: (max: number) => (value: string) => boolean;
    phone: (value: string) => boolean;
    date: (value: string) => boolean;
    futureDate: (value: string) => boolean;
    alphanumeric: (value: string) => boolean;
    noSpecialChars: (value: string) => boolean;
};
export declare function validateField(value: string, rules: ValidationRule[]): ValidationResult;
export declare function validateEmail(email: string): ValidationResult;
export declare function validatePassword(password: string): ValidationResult;
export declare function validatePatientName(name: string): ValidationResult;
export declare function validateSymptoms(symptoms: string): ValidationResult;
export declare function validateDateTime(dateTime: string): ValidationResult;
export declare function sanitizeInput(input: string): string;
export declare function sanitizeEmail(email: string): string;
export declare function sanitizePhone(phone: string): string;
export declare function generateCSRFToken(): string;
export declare class RateLimiter {
    private attempts;
    isAllowed(key: string, maxAttempts?: number, windowMs?: number): boolean;
    clear(key: string): void;
}
export declare const rateLimiter: RateLimiter;
