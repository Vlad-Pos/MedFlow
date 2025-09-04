/**
 * AI Service Module for MedFlow
 *
 * This module provides a centralized interface for all AI-powered features in MedFlow.
 * It includes placeholders for future OpenAI GPT-4 and Claude AI integrations.
 *
 * Features:
 * - Medical symptom analysis and triage
 * - Smart appointment scheduling optimization
 * - Patient history summarization
 * - Medical document analysis
 * - Chatbot for patient intake
 * - Diagnostic assistance recommendations
 *
 * @author MedFlow Team
 * @version 2.0
 * @integration-ready OpenAI GPT-4, Claude AI, Google Health AI
 */
export interface AIConfig {
    provider: 'openai' | 'claude' | 'google-health' | 'local';
    apiKey?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    language: 'ro' | 'en';
    medicalContext: boolean;
}
export interface SymptomAnalysis {
    severity: 'low' | 'medium' | 'high' | 'urgent';
    confidence: number;
    recommendations: string[];
    redFlags: string[];
    suggestedSpecialty?: string;
    estimatedAppointmentDuration?: number;
    followUpRequired: boolean;
    aiReasoning: string;
}
export interface AppointmentSuggestion {
    datetime: Date;
    confidence: number;
    reasoning: string;
    duration: number;
    priority: 'low' | 'medium' | 'high';
    conflicts: string[];
}
export interface ChatbotResponse {
    message: string;
    intent: 'greeting' | 'symptom_inquiry' | 'appointment_booking' | 'medical_question' | 'emergency';
    confidence: number;
    followUp?: string[];
    requiresHumanIntervention: boolean;
    medicalAdviceDisclaimer: boolean;
}
export interface MedicalDocumentAnalysis {
    documentType: 'lab_result' | 'prescription' | 'medical_report' | 'image' | 'other';
    confidence: number;
    extractedData: Record<string, unknown>;
    medicalRelevance: number;
    suggestedActions: string[];
    flaggedConcerns: string[];
}
/**
 * AI Service Class - Central AI Management
 *
 * TODO: Integrate with OpenAI GPT-4 API
 * TODO: Add Claude AI support for medical reasoning
 * TODO: Implement Google Health AI for diagnostic assistance
 */
export declare class AIService {
    private config;
    private initialized;
    constructor(config: AIConfig);
    /**
     * Initialize AI Service with API connections
     *
     * @integration-point OpenAI API initialization
     * @integration-point Claude API setup
     * @integration-point Google Health AI configuration
     */
    initialize(): Promise<void>;
    /**
     * Analyze patient symptoms using AI
     *
     * @param symptoms - Patient-reported symptoms in Romanian
     * @param patientHistory - Previous medical history
     * @param currentMedications - Current medications
     *
     * @integration-point OpenAI GPT-4 medical analysis
     * @integration-point Claude medical reasoning
     */
    analyzeSymptoms(symptoms: string, patientHistory?: string[], currentMedications?: string[]): Promise<SymptomAnalysis>;
    /**
     * Generate smart appointment slot suggestions
     *
     * @param doctorId - Doctor's unique identifier
     * @param patientPreferences - Patient scheduling preferences
     * @param urgencyLevel - Medical urgency level
     *
     * @integration-point OpenAI for schedule optimization
     * @integration-point Claude for reasoning about optimal timing
     */
    suggestAppointmentSlots(doctorId: string, patientPreferences?: Record<string, unknown>, urgencyLevel?: 'low' | 'medium' | 'high' | 'urgent'): Promise<AppointmentSuggestion[]>;
    /**
     * Process chatbot conversation for patient intake
     *
     * @param message - Patient message in Romanian
     * @param conversationHistory - Previous conversation context
     *
     * @integration-point OpenAI GPT-4 for natural language understanding
     * @integration-point Claude for medical context reasoning
     */
    processChatbotMessage(message: string, conversationHistory?: Record<string, unknown>[]): Promise<ChatbotResponse>;
    /**
     * Analyze uploaded medical documents
     *
     * @param fileUrl - URL of the uploaded document
     * @param contentType - MIME type of the document
     *
     * @integration-point OpenAI Vision API for image analysis
     * @integration-point Claude for document text analysis
     * @integration-point Google Health AI for medical document understanding
     */
    analyzeDocument(fileUrl: string, contentType: string): Promise<MedicalDocumentAnalysis>;
    /**
     * Generate medical summary from patient history
     *
     * @param patientHistory - Array of medical events and consultations
     *
     * @integration-point OpenAI for medical summarization
     * @integration-point Claude for clinical reasoning
     */
    generateMedicalSummary(patientHistory: Record<string, unknown>[]): Promise<string>;
}
/**
 * Get the global AI Service instance
 */
export declare function getAIService(): AIService;
/**
 * Initialize AI Service for the application
 */
export declare function initializeAI(): Promise<void>;
/**
 * Quick triage function for emergency detection
 */
export declare function detectEmergency(message: string): boolean;
/**
 * AI-powered form validation helper
 */
export declare function getAIValidationSuggestions(fieldName: string, value: string): string[];
