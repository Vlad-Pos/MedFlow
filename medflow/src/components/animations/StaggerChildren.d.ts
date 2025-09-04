import { ReactNode } from 'react';
interface StaggerChildrenProps {
    children: ReactNode;
    staggerDelay?: number;
    initialDelay?: number;
    className?: string;
    as?: keyof JSX.IntrinsicElements;
}
export default function StaggerChildren({ children, staggerDelay, initialDelay, className, as: Component }: StaggerChildrenProps): import("react/jsx-runtime").JSX.Element;
export {};
