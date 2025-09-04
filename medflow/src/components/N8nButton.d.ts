/**
 * n8n.io-inspired Button Component
 * Enhanced styling matching the provided visual package
 */
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';
interface N8nButtonProps {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    icon?: LucideIcon;
    iconPosition?: 'left' | 'right';
    onClick?: () => void;
    href?: string;
    className?: string;
    disabled?: boolean;
}
export default function N8nButton({ children, variant, size, icon: Icon, iconPosition, onClick, href, className, disabled }: N8nButtonProps): import("react/jsx-runtime").JSX.Element;
export {};
