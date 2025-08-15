import { ReactNode } from 'react';
interface ContrastEnhancerProps {
    children: ReactNode;
    level?: 'normal' | 'high' | 'maximum';
    className?: string;
}
export default function ContrastEnhancer({ children, level, className }: ContrastEnhancerProps): import("react/jsx-runtime").JSX.Element;
export declare const useContrastEnhancement: () => {
    applyContrast: (baseClasses: string, level?: "normal" | "high" | "maximum") => string;
};
export declare const enhanceTextContrast: (element: HTMLElement, level?: "normal" | "high" | "maximum") => void;
export {};
