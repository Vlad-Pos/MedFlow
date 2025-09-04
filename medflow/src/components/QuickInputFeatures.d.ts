/**
 * Quick Input Features Component for MedFlow
 *
 * Provides quick input methods for patient reports including:
 * - Pre-defined medical text templates
 * - Voice-to-text functionality with Romanian support
 * - Smart suggestions based on medical context
 * - Commonly used medical phrases and abbreviations
 *
 * @author MedFlow Team
 * @version 1.0
 */
declare global {
    interface Window {
        SpeechRecognition?: typeof SpeechRecognition;
        webkitSpeechRecognition?: typeof SpeechRecognition;
    }
}
interface QuickInputFeaturesProps {
    onTextInsert: (text: string) => void;
    onTemplateApply?: (templateData: TextTemplate) => void;
    fieldContext?: 'complaint' | 'history' | 'examination' | 'diagnosis' | 'treatment' | 'notes';
    placeholder?: string;
    className?: string;
}
interface TextTemplate {
    id: string;
    title: string;
    content: string;
    category: 'general' | 'symptoms' | 'examination' | 'diagnosis' | 'treatment' | 'instructions';
    frequency: number;
    tags: string[];
}
export default function QuickInputFeatures({ onTextInsert, onTemplateApply, fieldContext, placeholder, className }: QuickInputFeaturesProps): import("react/jsx-runtime").JSX.Element;
export {};
