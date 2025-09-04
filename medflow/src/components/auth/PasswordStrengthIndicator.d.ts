/**
 * Password Strength Indicator Component for MedFlow
 *
 * Provides real-time visual feedback on password strength with:
 * - Color-coded strength levels
 * - Romanian feedback messages
 * - Professional medical UI styling
 * - Accessibility features
 *
 * @author MedFlow Team
 * @version 2.0
 */
interface PasswordStrengthIndicatorProps {
    password: string;
    showRequirements?: boolean;
    className?: string;
}
export default function PasswordStrengthIndicator({ password, showRequirements, className }: PasswordStrengthIndicatorProps): import("react/jsx-runtime").JSX.Element | null;
/**
 * Compact version for inline use
 */
export declare function CompactPasswordStrength({ password }: {
    password: string;
}): import("react/jsx-runtime").JSX.Element | null;
export {};
