/**
 * Appointment Templates Component for MedFlow
 *
 * Features:
 * - Pre-defined templates for common medical procedures
 * - Quick appointment creation with standardized fields
 * - Customizable template management
 * - Duration and preparation guidelines
 * - Integration with appointment scheduling
 * - Medical specialty-specific templates
 *
 * @author MedFlow Team
 * @version 2.0
 */
interface AppointmentTemplate {
    id: string;
    name: string;
    specialty: string;
    duration: number;
    description: string;
    defaultSymptoms: string;
    preparationInstructions: string[];
    requiredDocuments: string[];
    followUpRequired: boolean;
    followUpDays?: number;
    estimatedCost?: string;
    category: 'consultation' | 'procedure' | 'follow-up' | 'emergency';
    complexity: 'simple' | 'moderate' | 'complex';
    isActive: boolean;
    usageCount: number;
    createdAt: Date;
    updatedAt: Date;
}
interface AppointmentTemplatesProps {
    onSelectTemplate: (template: AppointmentTemplate) => void;
    onCreateFromTemplate?: (template: AppointmentTemplate, customData: Record<string, unknown>) => void;
    showManagement?: boolean;
}
export default function AppointmentTemplates({ onSelectTemplate, onCreateFromTemplate, showManagement }: AppointmentTemplatesProps): import("react/jsx-runtime").JSX.Element;
export {};
