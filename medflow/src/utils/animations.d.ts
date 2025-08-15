import type { Variants, Transition } from 'framer-motion';
export declare const pageVariants: Variants;
export declare const pageTransition: Transition;
export declare const staggerContainer: Variants;
export declare const staggerItem: Variants;
export declare const cardVariants: Variants;
export declare const buttonVariants: Variants;
export declare const modalVariants: Variants;
export declare const backdropVariants: Variants;
export declare const formVariants: Variants;
export declare const loadingVariants: Variants;
export declare const notificationVariants: Variants;
export declare const heroVariants: Variants;
export declare const featureVariants: Variants;
export declare const scrollVariants: Variants;
export declare const fadeInVariants: Variants;
export declare const slideInLeftVariants: Variants;
export declare const slideInRightVariants: Variants;
export declare const scaleInVariants: Variants;
export declare const bounceVariants: Variants;
export declare const pulseVariants: Variants;
export declare const shakeVariants: Variants;
export declare const checkmarkVariants: Variants;
export declare const createStaggerAnimation: (delay?: number) => {
    container: {
        animate: {
            transition: {
                staggerChildren: number;
                delayChildren: number;
            };
        };
    };
    item: {
        initial: {
            opacity: number;
            y: number;
        };
        animate: {
            opacity: number;
            y: number;
            transition: {
                duration: number;
                ease: string;
            };
        };
    };
};
export declare const createHoverAnimation: (scale?: number, y?: number) => {
    hover: {
        scale: number;
        y: number;
        transition: {
            duration: number;
            ease: string;
        };
    };
    tap: {
        scale: number;
        transition: {
            duration: number;
        };
    };
};
