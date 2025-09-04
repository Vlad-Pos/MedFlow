import { ReactNode } from 'react';
interface AnimatedButtonProps {
    children: ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
    icon?: ReactNode;
    iconPosition?: 'left' | 'right';
}
export default function AnimatedButton({ children, onClick, variant, size, disabled, loading, className, type, icon, iconPosition }: AnimatedButtonProps): import("react/jsx-runtime").JSX.Element;
export declare function PrimaryButton(props: Omit<AnimatedButtonProps, 'variant'>): import("react/jsx-runtime").JSX.Element;
export declare function SecondaryButton(props: Omit<AnimatedButtonProps, 'variant'>): import("react/jsx-runtime").JSX.Element;
export declare function DangerButton(props: Omit<AnimatedButtonProps, 'variant'>): import("react/jsx-runtime").JSX.Element;
export declare function GhostButton(props: Omit<AnimatedButtonProps, 'variant'>): import("react/jsx-runtime").JSX.Element;
export declare function IconButton({ icon, onClick, variant, size, disabled, className, 'aria-label': ariaLabel }: {
    icon: ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    className?: string;
    'aria-label': string;
}): import("react/jsx-runtime").JSX.Element;
export {};
