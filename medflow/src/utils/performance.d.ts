/**
 * Performance optimization utilities for n8n.io-inspired redesign
 * GPU acceleration and memory management
 */
export declare const enableGPUAcceleration: () => void;
export declare const preloadCriticalAssets: () => void;
export declare const createDebouncedScrollHandler: (callback: () => void, delay?: number) => () => void;
export declare const cleanupAnimations: () => void;
export declare const initPerformanceOptimizations: () => (() => void) | undefined;
