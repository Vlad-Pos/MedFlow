/**
 * Appointment Form Validation Utilities for MedFlow
 *
 * Features:
 * - Comprehensive validation for appointment creation and editing
 * - Romanian language error messages for medical professionals
 * - Professional medical form validation rules
 * - Real-time validation feedback
 * - Input sanitization and security
 *
 * @author MedFlow Team
 * @version 2.0
 */
export interface ValidationResult {
    isValid: boolean;
    error?: string;
}
export interface AppointmentFormData {
    patientName: string;
    patientEmail?: string;
    patientPhone?: string;
    dateTime: string;
    symptoms: string;
    notes: string;
    status: 'scheduled' | 'completed' | 'no_show' | 'confirmed' | 'declined';
}
export interface AppointmentFormErrors {
    patientName?: string;
    patientEmail?: string;
    patientPhone?: string;
    dateTime?: string;
    symptoms?: string;
    notes?: string;
    general?: string;
}
declare const APPOINTMENT_MESSAGES: {
    readonly patientName: {
        readonly required: "Numele pacientului este obligatoriu";
        readonly minLength: "Numele pacientului trebuie să aibă cel puțin 2 caractere";
        readonly maxLength: "Numele pacientului nu poate depăși 100 de caractere";
        readonly invalid: "Numele pacientului conține caractere nevalide";
        readonly format: "Vă rugăm să introduceți prenumele și numele complet";
    };
    readonly dateTime: {
        readonly required: "Data și ora programării sunt obligatorii";
        readonly invalid: "Data și ora introduse nu sunt valide";
        readonly pastDate: "Nu puteți programa consultații în trecut";
        readonly tooFarFuture: "Nu puteți programa consultații la mai mult de 6 luni în viitor";
        readonly weekendWarning: "Programarea este în weekend - verificați disponibilitatea";
        readonly outsideHours: "Ora programării este în afara orelor de lucru (08:00-18:00)";
        readonly holidayWarning: "Verificați dacă data aleasă nu este o sărbătoare legală";
    };
    readonly symptoms: {
        readonly required: "Descrierea simptomelor este obligatorie";
        readonly minLength: "Descrierea simptomelor trebuie să aibă cel puțin 10 caractere";
        readonly maxLength: "Descrierea simptomelor nu poate depăși 2000 de caractere";
        readonly inappropriate: "Descrierea conține termeni nepotriviți pentru un document medical";
        readonly tooVague: "Vă rugăm să furnizați o descriere mai detaliată a simptomelor";
    };
    readonly notes: {
        readonly maxLength: "Notele nu pot depăși 1000 de caractere";
        readonly inappropriate: "Notele conțin termeni nepotriviți pentru un document medical";
    };
    readonly patientEmail: {
        readonly invalid: "Formatul adresei de email nu este valid";
        readonly maxLength: "Adresa de email nu poate depăși 100 de caractere";
    };
    readonly patientPhone: {
        readonly invalid: "Numărul de telefon trebuie să fie în format românesc (+40XXXXXXXXX)";
        readonly maxLength: "Numărul de telefon nu poate depăși 15 caractere";
    };
    readonly general: {
        readonly networkError: "Eroare de conexiune. Verificați internetul și încercați din nou.";
        readonly serverError: "Eroare pe server. Vă rugăm să încercați din nou în câteva minute.";
        readonly authError: "Sesiunea a expirat. Vă rugăm să vă autentificați din nou.";
        readonly unknownError: "A apărut o eroare neașteptată. Vă rugăm să încercați din nou.";
        readonly conflictError: "Există deja o programare la această dată și oră.";
        readonly permissionError: "Nu aveți permisiunea să efectuați această operațiune.";
    };
};
/**
 * Validates patient name according to medical standards
 */
export declare function validatePatientName(name: string): ValidationResult;
/**
 * Validates appointment date and time
 */
export declare function validateDateTime(dateTimeString: string): ValidationResult;
/**
 * Validates symptoms description
 */
export declare function validateSymptoms(symptoms: string): ValidationResult;
/**
 * Validates optional notes
 */
export declare function validateNotes(notes: string): ValidationResult;
/**
 * Validates patient email (optional)
 */
export declare function validatePatientEmail(email: string): ValidationResult;
/**
 * Validates patient phone (optional)
 */
export declare function validatePatientPhone(phone: string): ValidationResult;
/**
 * Validates the entire appointment form
 */
export declare function validateAppointmentForm(formData: AppointmentFormData): {
    isValid: boolean;
    errors: AppointmentFormErrors;
};
/**
 * Sanitizes input to prevent XSS and ensure data quality
 */
export declare function sanitizeAppointmentInput(input: string): string;
/**
 * AI Integration Placeholder: Analyzes symptoms for medical insights
 * This function will be enhanced with AI capabilities in future versions
 */
export declare function analyzeSymptoms(symptoms: string): {
    severity?: 'low' | 'medium' | 'high' | 'urgent';
    suggestions?: string[];
    redFlags?: string[];
    relatedConditions?: string[];
};
/**
 * AI Integration Placeholder: Suggests optimal appointment times
 */
export declare function suggestOptimalAppointmentTimes(patientHistory?: Array<Record<string, unknown>>): string[];
/**
 * Maps Firebase errors to user-friendly Romanian messages
 */
export declare function mapFirebaseErrorToMessage(error: unknown): string;
export { APPOINTMENT_MESSAGES };
