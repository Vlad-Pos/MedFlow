import { InputHTMLAttributes } from 'react';
import { LucideIcon } from 'lucide-react';
interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
    label?: string;
    error?: string;
    success?: string;
    helperText?: string;
    leftIcon?: LucideIcon;
    rightIcon?: LucideIcon;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'outlined' | 'filled';
    fullWidth?: boolean;
    required?: boolean;
}
declare const Input: import("react").ForwardRefExoticComponent<InputProps & import("react").RefAttributes<HTMLInputElement>>;
export default Input;
