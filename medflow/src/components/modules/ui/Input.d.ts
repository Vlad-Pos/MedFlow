import React from 'react';
export interface InputProps {
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
    onBlur?: () => void;
    onFocus?: () => void;
    disabled?: boolean;
    required?: boolean;
    error?: string;
    success?: boolean;
    label?: string;
    helperText?: string;
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    className?: string;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
}
declare const Input: React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>>;
export default Input;
