/**
 * Specialized Form Input Components for MedFlow Appointment Management
 *
 * Features:
 * - Medical-themed validation with real-time feedback
 * - Romanian localization for medical professionals
 * - MedFlow branding and accessibility
 * - AI integration placeholders for smart suggestions
 * - Professional medical form styling
 *
 * @author MedFlow Team
 * @version 2.0
 */
import React from 'react';
interface BaseInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    warning?: string;
    disabled?: boolean;
    required?: boolean;
    placeholder?: string;
    className?: string;
    onBlur?: () => void;
    onFocus?: () => void;
    aiSuggestions?: string[];
    showAISuggestions?: boolean;
}
interface TextInputProps extends BaseInputProps {
    type?: 'text' | 'email' | 'tel';
    maxLength?: number;
    icon?: React.ReactNode;
    autoComplete?: string;
    pattern?: string;
}
interface TextAreaProps extends BaseInputProps {
    rows?: number;
    maxLength?: number;
    resize?: boolean;
    icon?: React.ReactNode;
}
interface DateTimeInputProps extends BaseInputProps {
    type: 'date' | 'time' | 'datetime-local';
    min?: string;
    max?: string;
    step?: string;
}
interface SelectInputProps extends BaseInputProps {
    options: {
        value: string;
        label: string;
        icon?: React.ReactNode;
    }[];
    icon?: React.ReactNode;
}
/**
 * Enhanced Text Input with Medical Validation
 */
export declare function MedicalTextInput({ label, value, onChange, error, warning, disabled, required, placeholder, className, onBlur, onFocus, type, maxLength, icon, autoComplete, pattern, aiSuggestions, showAISuggestions }: TextInputProps): import("react/jsx-runtime").JSX.Element;
/**
 * Enhanced TextArea for Medical Notes and Symptoms
 */
export declare function MedicalTextArea({ label, value, onChange, error, warning, disabled, required, placeholder, className, onBlur, onFocus, rows, maxLength, resize, icon, aiSuggestions, showAISuggestions }: TextAreaProps): import("react/jsx-runtime").JSX.Element;
/**
 * Enhanced DateTime Input for Medical Appointments
 */
export declare function MedicalDateTimeInput({ label, value, onChange, error, warning, disabled, required, placeholder, className, onBlur, onFocus, type, min, max, step, aiSuggestions, showAISuggestions }: DateTimeInputProps): import("react/jsx-runtime").JSX.Element;
/**
 * Enhanced Select Input for Status and Categories
 */
export declare function MedicalSelectInput({ label, value, onChange, error, warning, disabled, required, placeholder, className, onBlur, onFocus, options, icon }: SelectInputProps): import("react/jsx-runtime").JSX.Element;
export {};
