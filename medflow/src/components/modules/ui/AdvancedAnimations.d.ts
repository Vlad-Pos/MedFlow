import React from "react";
export declare function ParallaxSection({ children, speed, className }: {
    children: React.ReactNode;
    speed?: number;
    className?: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function StaggeredList({ children, staggerDelay, className }: {
    children: React.ReactNode;
    staggerDelay?: number;
    className?: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function FloatingElement({ children, duration, className }: {
    children: React.ReactNode;
    duration?: number;
    className?: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function GradientText({ children, className, gradientColors }: {
    children: React.ReactNode;
    className?: string;
    gradientColors?: string[];
}): import("react/jsx-runtime").JSX.Element;
export declare function TiltCard({ children, className }: {
    children: React.ReactNode;
    className?: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function ScrollProgress(): import("react/jsx-runtime").JSX.Element;
export declare function AnimatedCounter({ value, duration, className }: {
    value: number;
    duration?: number;
    className?: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function MagneticButton({ children, className, onClick }: {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}): import("react/jsx-runtime").JSX.Element;
export declare function TextReveal({ children, className, delay }: {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}): import("react/jsx-runtime").JSX.Element;
export declare function AnimatedBackground({ children, className }: {
    children: React.ReactNode;
    className?: string;
}): import("react/jsx-runtime").JSX.Element;
