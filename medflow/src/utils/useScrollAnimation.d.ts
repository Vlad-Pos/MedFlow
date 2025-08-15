export declare function useScrollAnimation(threshold?: number): {
    ref: import("react").RefObject<null>;
    isInView: boolean;
};
export declare function useStaggerAnimation(delay?: number): {
    ref: import("react").RefObject<null>;
    isInView: boolean;
    staggerDelay: number;
};
export declare function useParallaxAnimation(speed?: number): {
    ref: import("react").RefObject<null>;
    isInView: boolean;
    parallaxSpeed: number;
};
export declare function useInfiniteScrollAnimation(): {
    ref: import("react").RefObject<null>;
    isInView: boolean;
};
