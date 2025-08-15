import React from 'react';
export interface ButtonProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    className?: string;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
}
export default function Button({ children, variant, size, disabled, loading, fullWidth, onClick, type, className, icon, iconPosition }: ButtonProps): import("react/jsx-runtime").JSX.Element;
