/**
 * Date utility functions for consistent date formatting throughout the app
 * All dates are formatted as dd/mm/yyyy for Romanian locale
 */
/**
 * Format a date to dd/mm/yyyy format
 */
export declare function formatDate(date: Date | string | number): string;
/**
 * Format a date and time to dd/mm/yyyy HH:mm format
 */
export declare function formatDateTime(date: Date | string | number): string;
/**
 * Format a date to yyyy-MM-dd format for HTML date inputs
 */
export declare function formatDateForInput(date: Date | string | number): string;
/**
 * Parse a date string in dd/mm/yyyy format to a Date object
 */
export declare function parseDate(dateString: string): Date;
/**
 * Get the current date in dd/mm/yyyy format
 */
export declare function getCurrentDate(): string;
/**
 * Get the current date and time in dd/mm/yyyy HH:mm format
 */
export declare function getCurrentDateTime(): string;
