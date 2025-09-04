import React from 'react';
interface ParallaxWrapperProps {
    children: React.ReactNode;
    speed?: number;
    direction?: 'up' | 'down';
    className?: string;
    offset?: number;
}
export default function ParallaxWrapper({ children, speed, direction, className, offset }: ParallaxWrapperProps): import("react/jsx-runtime").JSX.Element;
export {};
