interface ResponsiveState {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    isTouchDevice: boolean;
    breakpoint: string;
    width: number;
    height: number;
}
export declare function useResponsive(): ResponsiveState;
export declare function useBreakpoint(): string;
export declare function useTouchDevice(): boolean;
export declare function useViewport(): {
    width: number;
    height: number;
};
export declare function useSafeArea(): {
    top: number;
    bottom: number;
    left: number;
    right: number;
};
export declare function useScrollPosition(): {
    x: number;
    y: number;
};
export declare function useOrientation(): "portrait" | "landscape";
export {};
