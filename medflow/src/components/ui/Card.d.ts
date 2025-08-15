import { ReactNode } from 'react';
interface CardProps {
    children: ReactNode;
    variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
    hover?: boolean;
    className?: string;
    onClick?: () => void;
    as?: 'div' | 'article' | 'section';
}
export default function Card({ children, variant, hover, className, onClick, as: Component }: CardProps): import("react/jsx-runtime").JSX.Element;
interface CardHeaderProps {
    children: ReactNode;
    className?: string;
}
export declare function CardHeader({ children, className }: CardHeaderProps): import("react/jsx-runtime").JSX.Element;
interface CardContentProps {
    children: ReactNode;
    className?: string;
}
export declare function CardContent({ children, className }: CardContentProps): import("react/jsx-runtime").JSX.Element;
interface CardFooterProps {
    children: ReactNode;
    className?: string;
}
export declare function CardFooter({ children, className }: CardFooterProps): import("react/jsx-runtime").JSX.Element;
export {};
