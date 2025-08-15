import type { ReactNode } from 'react';
interface PageTransitionProps {
    children: ReactNode;
    className?: string;
}
export default function PageTransition({ children, className }: PageTransitionProps): import("react/jsx-runtime").JSX.Element;
export declare function AnimatedPage({ children, className, animation }: {
    children: ReactNode;
    className?: string;
    animation?: 'fade' | 'slide-left' | 'slide-right' | 'scale' | 'bounce';
}): import("react/jsx-runtime").JSX.Element;
export {};
