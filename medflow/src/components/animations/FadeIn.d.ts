import { ReactNode } from 'react';
interface FadeInProps {
    children: ReactNode;
    direction?: 'up' | 'down' | 'left' | 'right' | 'none';
    delay?: number;
    duration?: number;
    className?: string;
    once?: boolean;
    amount?: number;
    threshold?: number;
}
export default function FadeIn({ children, direction, delay, duration, className, once, amount, threshold }: FadeInProps): import("react/jsx-runtime").JSX.Element;
export {};
