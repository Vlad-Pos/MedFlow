/**
 * Validated Input Component for MedFlow Authentication
 *
 * Provides comprehensive input validation with:
 * - Real-time validation feedback
 * - Romanian error messages
 * - Accessibility features
 * - MedFlow branding
 * - Medical professional focus
 *
 * @author MedFlow Team
 * @version 2.0
 */
import type { AuthValidationResult } from '../../utils/authValidation';
interface ValidatedInputProps {
    type: 'text' | 'email' | 'password' | 'select';
    name: string;
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    validateFn?: (value: string) => AuthValidationResult;
    required?: boolean;
    disabled?: boolean;
    label: string;
    placeholder?: string;
    autoComplete?: string;
    options?: {
        value: string;
        label: string;
    }[];
    icon?: 'user' | 'email' | 'lock' | 'role' | 'none';
    showToggle?: boolean;
    className?: string;
    ariaLabel?: string;
    ariaDescribedBy?: string;
    aiSuggestions?: boolean;
}
declare const _default: import("react").ForwardRefExoticComponent<ValidatedInputProps & import("react").RefAttributes<HTMLInputElement | HTMLSelectElement>>;
export default _default;
