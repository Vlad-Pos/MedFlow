import { ReactNode } from 'react';
interface AnimatedCardProps {
    children: ReactNode;
    className?: string;
    variant?: 'default' | 'feature' | 'elevated' | 'outlined';
    onClick?: () => void;
    interactive?: boolean;
    delay?: number;
}
export default function AnimatedCard({ children, className, variant, onClick, interactive, delay }: AnimatedCardProps): import("react/jsx-runtime").JSX.Element;
export declare function FeatureCard(props: Omit<AnimatedCardProps, 'variant'>): import("react/jsx-runtime").JSX.Element;
export declare function ElevatedCard(props: Omit<AnimatedCardProps, 'variant'>): import("react/jsx-runtime").JSX.Element;
export declare function OutlinedCard(props: Omit<AnimatedCardProps, 'variant'>): import("react/jsx-runtime").JSX.Element;
export declare function InteractiveCard({ children, className, onClick, delay }: {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    delay?: number;
}): import("react/jsx-runtime").JSX.Element;
export declare function StatsCard({ title, value, change, icon, className, style }: {
    title: string;
    value: string | number;
    change?: {
        value: number;
        isPositive: boolean;
    };
    icon?: ReactNode;
    className?: string;
    style?: React.CSSProperties;
}): import("react/jsx-runtime").JSX.Element;
export declare function InfoCard({ title, description, icon, action, className }: {
    title: string;
    description: string;
    icon?: ReactNode;
    action?: ReactNode;
    className?: string;
}): import("react/jsx-runtime").JSX.Element;
export {};
