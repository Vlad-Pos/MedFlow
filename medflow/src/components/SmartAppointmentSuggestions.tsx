/**
 * Smart Appointment Suggestions Component for MedFlow
 * 
 * Features:
 * - AI-powered appointment slot optimization
 * - Intelligent scheduling based on doctor availability and patient preferences
 * - Medical urgency-based prioritization
 * - Conflict detection and resolution
 * - Professional UI with MedFlow branding
 * - Integration placeholders for OpenAI and Claude AI
 * 
 * @author MedFlow Team
 * @version 2.0
 * @integration-ready OpenAI GPT-4, Claude AI
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  Brain, 
  CheckCircle, 
  AlertTriangle, 
  Zap,
  TrendingUp,
  RefreshCw,
  Filter,
  ChevronDown,
  Star
} from 'lucide-react'
import { useAuth } from '../providers/AuthProvider'
import { getAIService, AppointmentSuggestion } from '../services/aiService'
import { formatDateTime } from '../utils/dateUtils'
import LoadingSpinner from './LoadingSpinner'
interface SmartAppointmentSuggestionsProps {
  doctorId?: string
  patientPreferences?: {
    preferredHours?: number[]
    preferredDays?: string[]
    maxWaitTime?: number
    urgencyLevel?: 'low' | 'medium' | 'high' | 'urgent'
  }
  onSelectSlot?: (suggestion: AppointmentSuggestion) => void
  onScheduleAppointment?: (suggestion: AppointmentSuggestion) => void
  className?: string
}

interface ScheduleAnalytics {
  totalSlots: number
  availableSlots: number
  averageWaitTime: number
  doctorEfficiency: number
  patientSatisfactionScore: number
  peakHours: string[]
}

export default function SmartAppointmentSuggestions({
  doctorId,
  patientPreferences = {},
  onSelectSlot,
  onScheduleAppointment,
  className = ''
}: SmartAppointmentSuggestionsProps) {
  const { user } = useAuth()
  const [suggestions, setSuggestions] = useState<AppointmentSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [analytics, setAnalytics] = useState<ScheduleAnalytics | null>(null)
  const [selectedSuggestion, setSelectedSuggestion] = useState<AppointmentSuggestion | null>(null)
  const [filterBy, setFilterBy] = useState<'all' | 'today' | 'week' | 'urgent'>('all')
  const [showAnalytics, setShowAnalytics] = useState(false)
  
  const aiService = getAIService()

  // Generate smart suggestions
  const generateSuggestions = useCallback(async () => {
    if (!doctorId && !user?.uid) return

    setLoading(true)
    try {
      // TODO: Replace with actual AI integration
      /*
      const aiSuggestions = await aiService.suggestAppointmentSlots(
        doctorId || user!.uid,
        patientPreferences,
        patientPreferences.urgencyLevel || 'medium'
      )
      */

      // Placeholder implementation with realistic scheduling logic
      const currentDoctorId = doctorId || user!.uid
      const urgencyLevel = patientPreferences.urgencyLevel || 'medium'
      
      const mockSuggestions = await aiService.suggestAppointmentSlots(
        currentDoctorId,
        patientPreferences,
        urgencyLevel
      )

      setSuggestions(mockSuggestions)

      // Generate analytics
      const mockAnalytics: ScheduleAnalytics = {
        totalSlots: 40,
        availableSlots: mockSuggestions.length,
        averageWaitTime: urgencyLevel === 'urgent' ? 1 : urgencyLevel === 'high' ? 2 : 7,
        doctorEfficiency: 0.85,
        patientSatisfactionScore: 4.6,
        peakHours: ['09:00', '10:00', '14:00', '15:00']
      }
      setAnalytics(mockAnalytics)

    } catch (error) {
      console.error('Error generating suggestions:', error)
    } finally {
      setLoading(false)
    }
  }, [doctorId, user, patientPreferences, aiService])

  // Load suggestions on mount
  useEffect(() => {
    generateSuggestions()
  }, [generateSuggestions])

  // Filter suggestions based on selected filter
  const filteredSuggestions = useMemo(() => {
    if (filterBy === 'all') return suggestions
    
    const now = new Date()
    return suggestions.filter(suggestion => {
      switch (filterBy) {
        case 'today':
          return suggestion.datetime.toDateString() === now.toDateString()
        case 'week':
          const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
          return suggestion.datetime <= weekFromNow
        case 'urgent':
          return suggestion.priority === 'high'
        default:
          return true
      }
    })
  }, [suggestions, filterBy])

  // Handle suggestion selection
  const handleSelectSuggestion = useCallback((suggestion: AppointmentSuggestion) => {
    setSelectedSuggestion(suggestion)
    onSelectSlot?.(suggestion)
  }, [onSelectSlot])

  // Handle appointment scheduling
  const handleScheduleAppointment = useCallback((suggestion: AppointmentSuggestion) => {
    onScheduleAppointment?.(suggestion)
  }, [onScheduleAppointment])

  // Get priority color
  const getPriorityColor = useCallback((priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }, [])

  // Get confidence indicator
  const getConfidenceIndicator = useCallback((confidence: number) => {
    if (confidence >= 0.9) return { stars: 5, color: 'text-green-500' }
    if (confidence >= 0.8) return { stars: 4, color: 'text-blue-500' }
    if (confidence >= 0.7) return { stars: 3, color: 'text-yellow-500' }
    if (confidence >= 0.6) return { stars: 2, color: 'text-orange-500' }
    return { stars: 1, color: 'text-red-500' }
  }, [])

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-medflow-primary/10 rounded-lg">
              <Brain className="w-6 h-6 text-medflow-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                🤖 Sugestii Inteligente de Programare
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Optimizate de AI pentru eficiență maximă
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Analiză</span>
              <ChevronDown className={`w-4 h-4 transform transition-transform ${showAnalytics ? 'rotate-180' : ''}`} />
            </button>

            <button
              onClick={generateSuggestions}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-2 bg-medflow-primary text-white rounded-lg hover:bg-medflow-secondary transition-colors text-sm disabled:opacity-50"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span>Reîmprospătează</span>
            </button>
          </div>
        </div>

        {/* Analytics Panel */}
        <AnimatePresence>
          {showAnalytics && analytics && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
            >
              <div className="bg-medflow-primary/5 border border-medflow-primary/10 rounded-lg p-3">
                <div className="text-medflow-primary text-2xl font-bold">
                  {analytics.availableSlots}
                </div>
                <div className="text-xs text-gray-600">Sloturi disponibile</div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-blue-600 text-2xl font-bold">
                  {analytics.averageWaitTime}
                </div>
                <div className="text-xs text-gray-600">Zile timp așteptare</div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="text-green-600 text-2xl font-bold">
                  {Math.round(analytics.doctorEfficiency * 100)}%
                </div>
                <div className="text-xs text-gray-600">Eficiență doctor</div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="text-yellow-600 text-2xl font-bold">
                  {analytics.patientSatisfactionScore}
                </div>
                <div className="text-xs text-gray-600">Satisfacție pacienți</div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="text-purple-600 text-sm font-medium">
                  {analytics.peakHours.join(', ')}
                </div>
                <div className="text-xs text-gray-600">Ore de vârf</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtrare:</span>
          </div>
          
          {['all', 'today', 'week', 'urgent'].map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterBy(filter as 'all' | 'today' | 'week' | 'urgent')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                filterBy === filter
                  ? 'bg-medflow-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              {filter === 'all' && 'Toate'}
              {filter === 'today' && 'Astăzi'}
              {filter === 'week' && 'Această săptămână'}
              {filter === 'urgent' && 'Urgent'}
            </button>
          ))}
        </div>
      </div>

      {/* Suggestions List */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="loader mb-4"></div>
              <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
                🤖 AI analizează programul și generează sugestii...
              </p>
            </div>
          </div>
        ) : filteredSuggestions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nu există sugestii disponibile
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Încercați să modificați filtrele sau să reîmprospătați sugestiile.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredSuggestions.map((suggestion, index) => {
                const confidence = getConfidenceIndicator(suggestion.confidence)
                const isSelected = selectedSuggestion?.datetime === suggestion.datetime
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.1 }}
                    className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-medflow-primary bg-medflow-primary/5 shadow-md'
                        : 'border-gray-200 dark:border-gray-700 hover:border-medflow-primary hover:shadow-md'
                    }`}
                    onClick={() => handleSelectSuggestion(suggestion)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-5 h-5 text-medflow-primary" />
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {formatDateTime(suggestion.datetime)}
                            </span>
                          </div>
                          
                          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(suggestion.priority)}`}>
                            {suggestion.priority === 'high' && '🚨 Urgent'}
                            {suggestion.priority === 'high' && '⚡ Prioritate'}
                            {suggestion.priority === 'medium' && '📅 Normal'}
                            {suggestion.priority === 'low' && '🕐 Flexibil'}
                          </div>

                          <div className="flex items-center space-x-1">
                            {Array.from({ length: confidence.stars }).map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${confidence.color} fill-current`} />
                            ))}
                            <span className="text-xs text-gray-500">
                              {Math.round(suggestion.confidence * 100)}%
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{suggestion.duration} min</span>
                          </div>
                          
                          {suggestion.conflicts.length > 0 && (
                            <div className="flex items-center space-x-1 text-orange-600">
                              <AlertTriangle className="w-4 h-4" />
                              <span>{suggestion.conflicts.length} conflict(e)</span>
                            </div>
                          )}
                        </div>

                        <p className="text-gray-700 dark:text-gray-300 text-sm">
                          {suggestion.reasoning}
                        </p>

                        {suggestion.conflicts.length > 0 && (
                          <div className="mt-2 text-xs text-orange-600">
                            <strong>Conflicte:</strong> {suggestion.conflicts.join(', ')}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        {isSelected && (
                          <motion.button
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleScheduleAppointment(suggestion)
                            }}
                            className="flex items-center space-x-2 px-4 py-2 bg-medflow-primary text-white rounded-lg hover:bg-medflow-secondary transition-colors text-sm"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Programează</span>
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* AI Integration Notice */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-6">
        <div className="bg-medflow-primary/5 border border-medflow-primary/10 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Zap className="w-5 h-5 text-medflow-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-medflow-primary text-sm">
                🤖 Funcționalități AI Avansate în Dezvoltare
              </h4>
              <p className="text-medflow-primary/80 text-xs mt-1">
                • Optimizare automată bazată pe istoricul pacientului<br/>
                • Detecție predictivă a cancelărilor<br/>
                • Recomandări personalizate de programare<br/>
                • Integrare cu calendare externe (Google, Outlook)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    )
}
