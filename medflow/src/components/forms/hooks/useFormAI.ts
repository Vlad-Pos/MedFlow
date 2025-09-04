/**
 * useFormAI Hook for MedFlow
 * 
 * Features:
 * - Extract AI integration logic
 * - Preserve ALL current AI behavior
 * - Maintain ALL current AI suggestion timing
 * 
 * @author MedFlow Team
 * @version 2.0
 */

import { useState, useCallback, useEffect, useMemo } from 'react'
import { FormAI } from '../base/FormAI'
import { AppointmentFormData } from '../../../utils/appointmentValidation'

export interface AIState {
  analysis: ReturnType<typeof FormAI.analyzeSymptoms> | null
  suggestions: Record<keyof AppointmentFormData, string[]>
  isAnalyzing: boolean
  showSuggestions: boolean
  lastAnalysisTime: number | null
}

export interface UseFormAIOptions {
  enableAI?: boolean
  autoAnalyze?: boolean
  suggestionDelay?: number
  maxSuggestions?: number
  analyzeThreshold?: number
}

export interface UseFormAIReturn {
  aiState: AIState
  analyzeSymptoms: (symptoms: string) => void
  getSuggestions: (field: keyof AppointmentFormData, value: string) => string[]
  applySuggestion: (field: keyof AppointmentFormData, suggestion: string) => void
  showSuggestions: (field: keyof AppointmentFormData, show: boolean) => void
  clearAnalysis: () => void
  clearSuggestions: () => void
  isAIAvailable: boolean
  getAnalysisDisplay: () => {
    severity: string
    severityClass: string
    suggestions: string[]
    redFlags: string[]
  } | null
  updateAIState: (updates: Partial<AIState>) => void
}

/**
 * Hook for managing AI integration in forms
 */
export function useFormAI(
  formData: AppointmentFormData,
  options: UseFormAIOptions = {}
): UseFormAIReturn {
  const {
    enableAI = true,
    autoAnalyze = true,
    suggestionDelay = 500,
    maxSuggestions = 5,
    analyzeThreshold = 20
  } = options

  // AI state
  const [aiState, setAiState] = useState<AIState>({
    analysis: null,
    suggestions: {} as Record<keyof AppointmentFormData, string[]>,
    isAnalyzing: false,
    showSuggestions: false,
    lastAnalysisTime: null
  })

  // Update AI state
  const updateAIState = useCallback((updates: Partial<AIState>) => {
    setAiState(prev => ({ ...prev, ...updates }))
  }, [])

  // Check if AI is available
  const isAIAvailable = useMemo(() => {
    return enableAI && FormAI.isAIEnabled()
  }, [enableAI])

  // Analyze symptoms
  const analyzeSymptoms = useCallback((symptoms: string) => {
    if (!isAIAvailable || symptoms.length < analyzeThreshold) {
      updateAIState({ analysis: null })
      return
    }

    updateAIState({ isAnalyzing: true })

    // Simulate AI analysis delay
    setTimeout(() => {
      const analysis = FormAI.analyzeSymptoms(symptoms)
      updateAIState({
        analysis,
        isAnalyzing: false,
        lastAnalysisTime: Date.now()
      })
    }, 300)
  }, [isAIAvailable, analyzeThreshold, updateAIState])

  // Get suggestions for a field
  const getSuggestions = useCallback((field: keyof AppointmentFormData, value: string): string[] => {
    if (!isAIAvailable) return []

    const suggestions = FormAI.getFieldSuggestions(field, value, true)
    return suggestions.slice(0, maxSuggestions)
  }, [isAIAvailable, maxSuggestions])

  // Apply AI suggestion
  const applySuggestion = useCallback((field: keyof AppointmentFormData, suggestion: string) => {
    if (!isAIAvailable) return

    // Update suggestions state to remove the applied suggestion
    setAiState(prev => ({
      ...prev,
      suggestions: {
        ...prev.suggestions,
        [field]: prev.suggestions[field]?.filter(s => s !== suggestion) || []
      }
    }))
  }, [isAIAvailable])

  // Show/hide suggestions for a field
  const showSuggestions = useCallback((field: keyof AppointmentFormData, show: boolean) => {
    if (!isAIAvailable) return

    updateAIState({ showSuggestions: show })
  }, [isAIAvailable, updateAIState])

  // Clear AI analysis
  const clearAnalysis = useCallback(() => {
    updateAIState({
      analysis: null,
      lastAnalysisTime: null
    })
  }, [updateAIState])

  // Clear all suggestions
  const clearSuggestions = useCallback(() => {
    updateAIState({
      suggestions: {} as Record<keyof AppointmentFormData, string[]>,
      showSuggestions: false
    })
  }, [updateAIState])

  // Get analysis display data
  const getAnalysisDisplay = useCallback(() => {
    if (!aiState.analysis) return null

    return FormAI.formatAnalysis(aiState.analysis)
  }, [aiState.analysis])

  // Auto-analyze symptoms when they change
  useEffect(() => {
    if (autoAnalyze && isAIAvailable && formData.symptoms) {
      const timeoutId = setTimeout(() => {
        analyzeSymptoms(formData.symptoms)
      }, suggestionDelay)

      return () => clearTimeout(timeoutId)
    }
  }, [formData.symptoms, autoAnalyze, isAIAvailable, analyzeSymptoms, suggestionDelay])

  // Update suggestions when form data changes
  useEffect(() => {
    if (!isAIAvailable) return

    const newSuggestions: Record<keyof AppointmentFormData, string[]> = {} as Record<keyof AppointmentFormData, string[]>

    // Get suggestions for each field
    Object.keys(formData).forEach((field) => {
      const fieldKey = field as keyof AppointmentFormData
      const fieldValue = formData[fieldKey]

      if (typeof fieldValue === 'string') {
        newSuggestions[fieldKey] = getSuggestions(fieldKey, fieldValue)
      }
    })

    updateAIState({ suggestions: newSuggestions })
  }, [formData, isAIAvailable, getSuggestions, updateAIState])

  return {
    aiState,
    analyzeSymptoms,
    getSuggestions,
    applySuggestion,
    showSuggestions,
    clearAnalysis,
    clearSuggestions,
    isAIAvailable,
    getAnalysisDisplay,
    updateAIState
  }
}

/**
 * Hook for managing AI with custom analysis functions
 */
export function useFormAIWithCustom(
  formData: AppointmentFormData,
  customAnalyzer?: (symptoms: string) => ReturnType<typeof FormAI.analyzeSymptoms>,
  customSuggestionGenerator?: (field: keyof AppointmentFormData, value: string) => string[],
  options: UseFormAIOptions = {}
): UseFormAIReturn {
  const baseHook = useFormAI(formData, options)

  // Override analyzeSymptoms with custom analyzer
  const analyzeSymptomsWithCustom = useCallback((symptoms: string) => {
    if (customAnalyzer) {
      baseHook.updateAIState({ isAnalyzing: true })

      setTimeout(() => {
        const analysis = customAnalyzer(symptoms)
        baseHook.updateAIState({
          analysis,
          isAnalyzing: false,
          lastAnalysisTime: Date.now()
        })
      }, 300)
    } else {
      baseHook.analyzeSymptoms(symptoms)
    }
  }, [customAnalyzer, baseHook])

  // Override getSuggestions with custom generator
  const getSuggestionsWithCustom = useCallback((field: keyof AppointmentFormData, value: string): string[] => {
    if (customSuggestionGenerator) {
      return customSuggestionGenerator(field, value).slice(0, options.maxSuggestions || 5)
    }
    return baseHook.getSuggestions(field, value)
  }, [customSuggestionGenerator, baseHook, options.maxSuggestions])

  return {
    ...baseHook,
    analyzeSymptoms: analyzeSymptomsWithCustom,
    getSuggestions: getSuggestionsWithCustom
  }
}

/**
 * Hook for managing AI with async analysis
 */
export function useFormAIWithAsync(
  formData: AppointmentFormData,
  asyncAnalyzer?: (symptoms: string) => Promise<ReturnType<typeof FormAI.analyzeSymptoms>>,
  asyncSuggestionGenerator?: (field: keyof AppointmentFormData, value: string) => Promise<string[]>,
  options: UseFormAIOptions = {}
): Omit<UseFormAIReturn, 'getSuggestions'> & { 
  isAnalyzingAsync: boolean
  getSuggestions: (field: keyof AppointmentFormData, value: string) => Promise<string[]>
} {
  const baseHook = useFormAI(formData, options)
  const [isAnalyzingAsync, setIsAnalyzingAsync] = useState(false)

  // Async symptom analysis
  const analyzeSymptomsAsync = useCallback(async (symptoms: string) => {
    if (!asyncAnalyzer) {
      baseHook.analyzeSymptoms(symptoms)
      return
    }

    if (symptoms.length < (options.analyzeThreshold || 20)) {
      baseHook.updateAIState({ analysis: null })
      return
    }

    baseHook.updateAIState({ isAnalyzing: true })
    setIsAnalyzingAsync(true)

    try {
      const analysis = await asyncAnalyzer(symptoms)
      baseHook.updateAIState({
        analysis,
        isAnalyzing: false,
        lastAnalysisTime: Date.now()
      })
    } catch (error) {
      baseHook.updateAIState({
        analysis: null,
        isAnalyzing: false
      })
    } finally {
      setIsAnalyzingAsync(false)
    }
  }, [asyncAnalyzer, baseHook, options.analyzeThreshold])

  // Async suggestion generation
  const getSuggestionsAsync = useCallback(async (field: keyof AppointmentFormData, value: string): Promise<string[]> => {
    if (!asyncSuggestionGenerator) {
      return baseHook.getSuggestions(field, value)
    }

    try {
      const suggestions = await asyncSuggestionGenerator(field, value)
      return suggestions.slice(0, options.maxSuggestions || 5)
    } catch (error) {
      return []
    }
  }, [asyncSuggestionGenerator, baseHook, options.maxSuggestions])

  return {
    ...baseHook,
    analyzeSymptoms: analyzeSymptomsAsync,
    getSuggestions: getSuggestionsAsync,
    isAnalyzingAsync
  }
}

/**
 * Hook for managing AI with real-time suggestions
 */
export function useFormAIWithRealTime(
  formData: AppointmentFormData,
  realTimeAnalyzer?: (field: keyof AppointmentFormData, value: string) => string[],
  options: UseFormAIOptions = {}
): UseFormAIReturn & { realTimeSuggestions: Record<keyof AppointmentFormData, string[]> } {
  const baseHook = useFormAI(formData, options)
  const [realTimeSuggestions, setRealTimeSuggestions] = useState<Record<keyof AppointmentFormData, string[]>>({} as Record<keyof AppointmentFormData, string[]>)

  // Get real-time suggestions
  const getRealTimeSuggestions = useCallback((field: keyof AppointmentFormData, value: string): string[] => {
    if (realTimeAnalyzer) {
      const suggestions = realTimeAnalyzer(field, value)
      return suggestions.slice(0, options.maxSuggestions || 5)
    }
    return baseHook.getSuggestions(field, value)
  }, [realTimeAnalyzer, baseHook, options.maxSuggestions])

  // Update real-time suggestions when form data changes
  useEffect(() => {
    if (!realTimeAnalyzer) return

    const newRealTimeSuggestions: Record<keyof AppointmentFormData, string[]> = {} as Record<keyof AppointmentFormData, string[]>

    Object.keys(formData).forEach((field) => {
      const fieldKey = field as keyof AppointmentFormData
      const fieldValue = formData[fieldKey]

      if (typeof fieldValue === 'string') {
        newRealTimeSuggestions[fieldKey] = getRealTimeSuggestions(fieldKey, fieldValue)
      }
    })

    setRealTimeSuggestions(newRealTimeSuggestions)
  }, [formData, realTimeAnalyzer, getRealTimeSuggestions])

  return {
    ...baseHook,
    getSuggestions: getRealTimeSuggestions,
    realTimeSuggestions
  }
}
