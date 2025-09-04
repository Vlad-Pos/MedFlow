import React from 'react';
interface PageWrapperProps {
    children: React.ReactNode;
    className?: string;
    showNavigation?: boolean;
    showFooter?: boolean;
}
export default function PageWrapper({ children, className, showNavigation, showFooter }: PageWrapperProps): import("react/jsx-runtime").JSX.Element;
export {};
