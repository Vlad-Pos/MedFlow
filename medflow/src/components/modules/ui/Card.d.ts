import React from 'react';
export interface CardProps {
    children: React.ReactNode;
    variant?: 'default' | 'elevated' | 'outlined' | 'filled';
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    onClick?: () => void;
    hover?: boolean;
}
export default function Card({ children, variant, padding, className, onClick, hover }: CardProps): import("react/jsx-runtime").JSX.Element;
