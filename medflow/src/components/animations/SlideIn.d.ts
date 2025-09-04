import React from 'react';
import { HTMLMotionProps } from 'framer-motion';
interface SlideInProps extends HTMLMotionProps<'div'> {
    children: React.ReactNode;
    direction?: 'up' | 'down' | 'left' | 'right';
    delay?: number;
    duration?: number;
    distance?: number;
    className?: string;
}
export default function SlideIn({ children, direction, delay, duration, distance, className, ...props }: SlideInProps): import("react/jsx-runtime").JSX.Element;
export {};
