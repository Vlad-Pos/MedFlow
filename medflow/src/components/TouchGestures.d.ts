import { ReactNode } from 'react';
interface TouchGesturesProps {
    children: ReactNode;
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
    onTap?: () => void;
    onDoubleTap?: () => void;
    onPinchIn?: () => void;
    onPinchOut?: () => void;
    className?: string;
    disabled?: boolean;
    threshold?: number;
}
export default function TouchGestures({ children, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onTap, onDoubleTap, onPinchIn, onPinchOut, className, disabled, threshold }: TouchGesturesProps): import("react/jsx-runtime").JSX.Element;
export declare function SwipeableCard({ children, onSwipeLeft, onSwipeRight, className, threshold }: {
    children: ReactNode;
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    className?: string;
    threshold?: number;
}): import("react/jsx-runtime").JSX.Element;
export declare function PullToRefresh({ children, onRefresh, className, threshold }: {
    children: ReactNode;
    onRefresh: () => void;
    className?: string;
    threshold?: number;
}): import("react/jsx-runtime").JSX.Element;
export declare function PinchToZoom({ children, minScale, maxScale, className }: {
    children: ReactNode;
    minScale?: number;
    maxScale?: number;
    className?: string;
}): import("react/jsx-runtime").JSX.Element;
export {};
