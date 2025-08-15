/**
 * Generic data fetching function with error handling
 */
export declare function fetchData<T>(url: string, options?: RequestInit): Promise<T>;
/**
 * Fetch data with timeout
 */
export declare function fetchDataWithTimeout<T>(url: string, timeout?: number, options?: RequestInit): Promise<T>;
/**
 * Simple cache implementation for API responses
 */
declare class SimpleCache {
    private cache;
    private maxAge;
    constructor(maxAge?: number);
    set(key: string, data: any): void;
    get(key: string): any | null;
    clear(): void;
    delete(key: string): boolean;
}
export declare const apiCache: SimpleCache;
/**
 * Fetch data with caching
 */
export declare function fetchDataWithCache<T>(url: string, cacheKey?: string, options?: RequestInit): Promise<T>;
/**
 * POST data to an endpoint
 */
export declare function postData<T>(url: string, data: any, options?: RequestInit): Promise<T>;
/**
 * PUT data to an endpoint
 */
export declare function putData<T>(url: string, data: any, options?: RequestInit): Promise<T>;
/**
 * DELETE data from an endpoint
 */
export declare function deleteData<T>(url: string, options?: RequestInit): Promise<T>;
/**
 * Retry function for failed requests
 */
export declare function retryRequest<T>(requestFn: () => Promise<T>, maxRetries?: number, delay?: number): Promise<T>;
export {};
