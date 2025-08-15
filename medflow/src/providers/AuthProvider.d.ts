/**
 * Enhanced Authentication Provider for MedFlow
 *
 * Provides comprehensive authentication services with:
 * - Enhanced error handling with Romanian messages
 * - Role-based access control for medical professionals
 * - Secure session management
 * - Rate limiting and security features
 * - AI integration preparation
 * - GDPR compliance features
 *
 * @author MedFlow Team
 * @version 2.0
 */
import type { User } from 'firebase/auth';
export type AppUser = (User & {
    role?: 'doctor' | 'nurse';
    aiPreferences?: {
        smartSuggestions: boolean;
        autoComplete: boolean;
        medicalAssistance: boolean;
    };
    verified?: boolean;
    lastActivity?: Date;
}) | null;
interface AuthContextValue {
    user: AppUser;
    initializing: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, displayName: string, role: 'doctor' | 'nurse') => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshUserData: () => Promise<void>;
    updateUserPreferences: (preferences: Record<string, unknown>) => Promise<void>;
}
export declare function AuthProvider({ children }: {
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function useAuth(): AuthContextValue;
export {};
