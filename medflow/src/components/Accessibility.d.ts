import { ReactNode } from 'react';
interface AccessibilityProps {
    children: ReactNode;
    className?: string;
}
export declare function HighContrastMode({ children, className }: AccessibilityProps): import("react/jsx-runtime").JSX.Element;
export declare function FontSizeControls({ children, className }: AccessibilityProps): import("react/jsx-runtime").JSX.Element;
export declare function ReducedMotion({ children, className }: AccessibilityProps): import("react/jsx-runtime").JSX.Element;
export declare function ScreenReaderOnly({ children, className }: {
    children: ReactNode;
    className?: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function SkipToMainContent(): import("react/jsx-runtime").JSX.Element;
export declare function FocusTrap({ children, className }: AccessibilityProps): import("react/jsx-runtime").JSX.Element;
export declare function LiveRegion({ children, className, 'aria-live': ariaLive }: {
    children: ReactNode;
    className?: string;
    'aria-live'?: 'polite' | 'assertive' | 'off';
}): import("react/jsx-runtime").JSX.Element;
export declare function AccessibilityToolbar({ children, className }: AccessibilityProps): import("react/jsx-runtime").JSX.Element;
export declare function KeyboardNavigation({ children, className }: AccessibilityProps): import("react/jsx-runtime").JSX.Element;
export {};
