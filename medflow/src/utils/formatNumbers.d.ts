/**
 * Format a number with appropriate suffixes (K, M, B)
 */
export declare function formatNumber(num: number): string;
/**
 * Format a number as currency (EUR)
 */
export declare function formatCurrency(amount: number): string;
/**
 * Format a percentage
 */
export declare function formatPercentage(value: number, decimals?: number): string;
/**
 * Format a date in Romanian locale
 */
export declare function formatDate(date: Date | string): string;
/**
 * Format a time in Romanian locale
 */
export declare function formatTime(date: Date | string): string;
/**
 * Format a relative time (e.g., "2 hours ago")
 */
export declare function formatRelativeTime(date: Date | string): string;
/**
 * Format a file size
 */
export declare function formatFileSize(bytes: number): string;
/**
 * Format a phone number
 */
export declare function formatPhoneNumber(phone: string): string;
