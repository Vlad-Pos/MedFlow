export declare const breakpoints: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
};
export declare const spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
};
export declare const typography: {
    xs: {
        fontSize: string;
        lineHeight: string;
    };
    sm: {
        fontSize: string;
        lineHeight: string;
    };
    base: {
        fontSize: string;
        lineHeight: string;
    };
    lg: {
        fontSize: string;
        lineHeight: string;
    };
    xl: {
        fontSize: string;
        lineHeight: string;
    };
    '2xl': {
        fontSize: string;
        lineHeight: string;
    };
    '3xl': {
        fontSize: string;
        lineHeight: string;
    };
    '4xl': {
        fontSize: string;
        lineHeight: string;
    };
};
export declare const gridConfig: {
    mobile: {
        columns: number;
        gap: string;
    };
    tablet: {
        columns: number;
        gap: string;
    };
    desktop: {
        columns: number;
        gap: string;
    };
    wide: {
        columns: number;
        gap: string;
    };
};
export declare const touchTargets: {
    minSize: string;
    minPadding: string;
    minSpacing: string;
};
export declare const containerWidths: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
};
export declare const responsive: {
    isTouchDevice: () => boolean;
    isMobile: () => boolean;
    isTablet: () => boolean;
    isDesktop: () => boolean;
    getBreakpoint: () => "sm" | "md" | "lg" | "xs" | "xl" | "2xl";
    getResponsiveClass: (baseClass: string, responsiveClasses: Record<string, string>) => string;
};
export declare const responsiveStyles: {
    padding: {
        mobile: string;
        tablet: string;
        desktop: string;
    };
    margin: {
        mobile: string;
        tablet: string;
        desktop: string;
    };
    fontSize: {
        mobile: string;
        tablet: string;
        desktop: string;
    };
    lineHeight: {
        mobile: string;
        tablet: string;
        desktop: string;
    };
};
export declare const accessibility: {
    minTouchTarget: string;
    minTouchSpacing: string;
    focusRing: string;
    highContrast: {
        border: string;
        background: string;
    };
};
export declare const performance: {
    debounceDelay: number;
    throttleDelay: number;
    lazyLoadThreshold: number;
    targetFrameRate: number;
};
export declare const mobile: {
    safeArea: {
        top: string;
        bottom: string;
        left: string;
        right: string;
    };
    viewportHeight: string;
    preventZoom: string;
};
