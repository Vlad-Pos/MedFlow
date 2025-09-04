/**
 * Enhanced Theme Provider for MedFlow
 *
 * Features:
 * - Professional MedFlow dark/light mode switching
 * - Smooth theme transitions with animations
 * - System preference detection and synchronization
 * - localStorage persistence for user preferences
 * - Medical-appropriate color schemes
 * - AI integration placeholders for theme personalization
 *
 * @author MedFlow Team
 * @version 2.0
 */
import { ReactNode } from 'react';
interface ThemeContextType {
    isDarkMode: boolean;
    toggleTheme: () => void;
    setTheme: (isDark: boolean) => void;
    isSystemTheme: boolean;
    setSystemTheme: (useSystem: boolean) => void;
    themeTransition: boolean;
}
interface ThemeProviderProps {
    children: ReactNode;
}
export declare function ThemeProvider({ children }: ThemeProviderProps): import("react/jsx-runtime").JSX.Element;
export declare function useTheme(): ThemeContextType;
/**
 * Enhanced Theme Toggle Component with MedFlow Styling
 */
interface ThemeToggleProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    variant?: 'button' | 'switch' | 'icon';
}
export declare function ThemeToggle({ className, size, showLabel, variant }: ThemeToggleProps): import("react/jsx-runtime").JSX.Element;
/**
 * AI Integration Placeholder: Theme Personalization
 */
export declare function useAIThemePersonalization(): {
    suggestedTheme: string;
    confidence: number;
    reasoning: string;
    recommendations: string[];
};
export {};
