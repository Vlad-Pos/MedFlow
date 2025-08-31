/**
 * Form AI Component for MedFlow
 * 
 * Features:
 * - Extract AI suggestion logic from current components
 * - Preserve EXACT same AI suggestion behavior
 * - Maintain ALL current AI integration features
 * 
 * @author MedFlow Team
 * @version 2.0
 */

import React, { memo } from 'react'
import { analyzeSymptoms, suggestOptimalAppointmentTimes } from '../../../utils/appointmentValidation'

// Define the AI analysis type
export interface AIAnalysis {
  severity?: 'low' | 'medium' | 'high' | 'urgent'
  suggestions?: string[]
  redFlags?: string[]
  relatedConditions?: string[]
}

/**
 * FormAI class that handles all AI-related functionality
 */
export class FormAI {
  /**
   * Analyzes symptoms using AI (placeholder for future implementation)
   */
  static async analyzeSymptoms(symptoms: string): Promise<AIAnalysis | null> {
    if (symptoms.length < 20) {
      return null
    }
    
    return await analyzeSymptoms(symptoms)
  }

  /**
   * Suggests optimal appointment times
   */
  static async suggestOptimalAppointmentTimes(): Promise<string[]> {
    return await suggestOptimalAppointmentTimes()
  }

  /**
   * Checks if AI suggestions should be shown for a field
   */
  static shouldShowSuggestions(
    field: string, 
    value: string, 
    showAISuggestions: boolean = false
  ): boolean {
    if (!showAISuggestions) return false
    
    switch (field) {
      case 'symptoms':
        return value.length > 20
      case 'dateTime':
        return true // Always show for time suggestions
      default:
        return false
    }
  }

  /**
   * Gets AI suggestions for a specific field
   */
  static getFieldSuggestions(
    field: string, 
    value: string, 
    showAISuggestions: boolean = false
  ): string[] {
    if (!this.shouldShowSuggestions(field, value, showAISuggestions)) {
      return []
    }
    
    switch (field) {
      case 'symptoms':
        // Return symptom-related suggestions based on current input
        const suggestions: string[] = []
        const lowerValue = value.toLowerCase()
        
        if (lowerValue.includes('durere')) {
          suggestions.push('Durerea este constantă sau intermitentă?')
          suggestions.push('Care este intensitatea durerei (1-10)?')
          suggestions.push('Durerea se agravează cu mișcarea?')
        }
        
        if (lowerValue.includes('febră')) {
          suggestions.push('Care este temperatura corpului?')
          suggestions.push('Febra este constantă sau intermitentă?')
          suggestions.push('Aveți și alte simptome asociate?')
        }
        
        if (lowerValue.includes('tuse')) {
          suggestions.push('Tusea este uscată sau productivă?')
          suggestions.push('Tusea se agravează noaptea?')
          suggestions.push('Aveți și alte simptome respiratorii?')
        }
        
        return suggestions.length > 0 ? suggestions : [
          'Descrieți durata simptomelor',
          'Mentionați intensitatea simptomelor',
          'Includeți factorii care agravează sau ameliorează simptomele'
        ]
        
      case 'dateTime':
        // This will be handled asynchronously in the calling code
        return []
        
      default:
        return []
    }
  }

  /**
   * Applies AI suggestion to a field value
   */
  static applySuggestion(
    field: string, 
    currentValue: string, 
    suggestion: string
  ): string {
    switch (field) {
      case 'symptoms':
        // For symptoms, append the suggestion
        return currentValue + (currentValue ? ' ' : '') + suggestion
        
      case 'dateTime':
        // For date/time, replace the current value
        return suggestion
        
      default:
        return suggestion
    }
  }

  /**
   * Gets AI analysis display data for symptoms
   */
  static async getSymptomsAnalysis(symptoms: string): Promise<AIAnalysis | null> {
    return await this.analyzeSymptoms(symptoms)
  }

  /**
   * Formats AI analysis for display
   */
  static formatAnalysis(analysis: AIAnalysis): {
    severity: string
    severityClass: string
    suggestions: string[]
    redFlags: string[]
  } {
    const severity = analysis.severity || 'low'
    
    const severityClass: Record<string, string> = {
      low: 'bg-medflow-primary/5 border-medflow-primary/20 text-medflow-primary',
      medium: 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-300',
      high: 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300',
      urgent: 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
    }
    
    return {
      severity: severity,
      severityClass: severityClass[severity] || severityClass.low,
      suggestions: analysis.suggestions || [],
      redFlags: analysis.redFlags || []
    }
  }

  /**
   * Checks if AI features should be enabled
   */
  static isAIEnabled(): boolean {
    // Placeholder for future AI feature flag
    return true
  }

  /**
   * Gets AI feature notice text
   */
  static getFeatureNotice(): string {
    return '🤖 Funcționalități AI pentru optimizarea programărilor vor fi disponibile în curând'
  }
}
