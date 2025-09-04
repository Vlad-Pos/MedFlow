/**
 * Authentication Validation Utilities for MedFlow
 *
 * Provides comprehensive validation for authentication forms with:
 * - Clear Romanian error messages suitable for medical professionals
 * - Password strength validation
 * - Email format validation
 * - Rate limiting support
 * - Security best practices
 *
 * @author MedFlow Team
 * @version 2.0
 */
export interface AuthValidationResult {
    isValid: boolean;
    errors: string[];
    warnings?: string[];
}
export interface PasswordStrength {
    score: number;
    feedback: string;
    requirements: {
        length: boolean;
        uppercase: boolean;
        lowercase: boolean;
        numbers: boolean;
        symbols: boolean;
    };
}
export declare const AUTH_ERRORS: {
    readonly EMAIL_REQUIRED: "Adresa de email este obligatorie.";
    readonly EMAIL_INVALID: "Vă rugăm să introduceți o adresă de email validă.";
    readonly EMAIL_TOO_LONG: "Adresa de email este prea lungă (maximum 254 caractere).";
    readonly EMAIL_DOMAIN_INVALID: "Domeniul email-ului pare să nu fie valid.";
    readonly PASSWORD_REQUIRED: "Parola este obligatorie.";
    readonly PASSWORD_TOO_SHORT: "Parola trebuie să aibă cel puțin 8 caractere pentru securitate.";
    readonly PASSWORD_TOO_LONG: "Parola este prea lungă (maximum 128 caractere).";
    readonly PASSWORD_WEAK: "Parola este prea slabă. Folosiți o combinație de litere, cifre și simboluri.";
    readonly PASSWORD_NO_UPPERCASE: "Parola trebuie să conțină cel puțin o literă mare.";
    readonly PASSWORD_NO_LOWERCASE: "Parola trebuie să conțină cel puțin o literă mică.";
    readonly PASSWORD_NO_NUMBERS: "Parola trebuie să conțină cel puțin o cifră.";
    readonly PASSWORD_NO_SYMBOLS: "Parola trebuie să conțină cel puțin un simbol (!@#$%^&*).";
    readonly PASSWORD_COMMON: "Această parolă este prea comună. Vă rugăm să alegeți o parolă mai unică.";
    readonly PASSWORDS_MISMATCH: "Parolele introduse nu se potrivesc.";
    readonly CONFIRM_PASSWORD_REQUIRED: "Vă rugăm să confirmați parola.";
    readonly DISPLAY_NAME_REQUIRED: "Numele de afișare este obligatoriu.";
    readonly DISPLAY_NAME_TOO_SHORT: "Numele trebuie să aibă cel puțin 2 caractere.";
    readonly DISPLAY_NAME_TOO_LONG: "Numele este prea lung (maximum 50 caractere).";
    readonly DISPLAY_NAME_INVALID: "Numele poate conține doar litere, cifre, spații și cratima.";
    readonly ROLE_REQUIRED: "Vă rugăm să selectați un rol.";
    readonly ROLE_INVALID: "Rolul selectat nu este valid.";
    readonly RATE_LIMIT_EXCEEDED: "Prea multe încercări. Vă rugăm să așteptați înainte de a încerca din nou.";
    readonly FIELD_REQUIRED: "Acest câmp este obligatoriu.";
    readonly INVALID_INPUT: "Datele introduse nu sunt valide.";
};
/**
 * Validates email address with medical practice considerations
 */
export declare function validateEmail(email: string): AuthValidationResult;
/**
 * Analyzes password strength and provides detailed feedback
 */
export declare function analyzePasswordStrength(password: string): PasswordStrength;
/**
 * Validates password with comprehensive security checks
 */
export declare function validatePassword(password: string, confirmPassword?: string): AuthValidationResult;
/**
 * Validates display name for medical professionals
 */
export declare function validateDisplayName(name: string): AuthValidationResult;
/**
 * Validates user role selection
 */
export declare function validateRole(role: string): AuthValidationResult;
/**
 * Comprehensive validation for sign-up form
 */
export declare function validateSignUpForm(data: {
    displayName: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: string;
}): AuthValidationResult;
/**
 * Comprehensive validation for sign-in form
 */
export declare function validateSignInForm(data: {
    email: string;
    password: string;
}): AuthValidationResult;
/**
 * Rate limiting for authentication attempts
 */
export declare function checkAuthRateLimit(identifier: string, maxAttempts?: number): boolean;
/**
 * Clear rate limit for successful authentication
 */
export declare function clearAuthRateLimit(identifier: string): void;
/**
 * Sanitize input for authentication forms
 */
export declare function sanitizeAuthInput(input: string): string;
/**
 * Generate secure session token for additional security
 */
export declare function generateSecureToken(): string;
export { analyzePasswordStrength as getPasswordStrength };
