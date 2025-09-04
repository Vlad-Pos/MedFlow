import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
interface ButtonProps {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    disabled?: boolean;
    loading?: boolean;
    icon?: LucideIcon;
    iconPosition?: 'left' | 'right';
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    className?: string;
    fullWidth?: boolean;
    href?: string;
    target?: string;
}
export default function Button({ children, variant, size, disabled, loading, icon: Icon, iconPosition, onClick, type, className, fullWidth, href, target }: ButtonProps): import("react/jsx-runtime").JSX.Element;
export {};
