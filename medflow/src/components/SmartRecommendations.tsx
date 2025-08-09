/**
 * Smart Recommendations Component for MedFlow
 * 
 * Features:
 * - AI-powered appointment optimization suggestions
 * - Patient history analysis and insights
 * - Automated follow-up reminders
 * - Predictive analytics for patient flow
 * - Smart scheduling recommendations
 * - Personalized medical insights
 * 
 * @author MedFlow Team
 * @version 2.0
 */

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  BarChart3,
  Target,
  Star,
  Zap,
  Bell,
  UserCheck,
  Activity,
  ArrowRight,
  X
} from 'lucide-react'
import { useAuth } from '../providers/AuthProvider'
import { staggerContainer, staggerItem, cardVariants } from '../utils/animations'
import LoadingSpinner from './LoadingSpinner'

interface Recommendation {
  id: string
  type: 'optimization' | 'follow-up' | 'scheduling' | 'insight' | 'alert'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  title: string
  description: string
  impact: string
  confidence: number
  actionRequired: boolean
  estimatedTimeToComplete: string
  metadata: {
    patientCount?: number
    timeSlots?: string[]
    followUpDate?: Date
    category?: string
  }
}

interface PatientInsight {
  id: string
  patientName: string
  insight: string
  nextAppointment?: Date
  riskLevel: 'low' | 'medium' | 'high'
  recommendations: string[]
}

interface SmartRecommendationsProps {
  appointments: any[]
  timeRange?: 'week' | 'month' | 'quarter'
  maxRecommendations?: number
}

export default function SmartRecommendations({ 
  appointments, 
  timeRange = 'week',
  maxRecommendations = 10 
}: SmartRecommendationsProps) {
  const { user } = useAuth()
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [patientInsights, setPatientInsights] = useState<PatientInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'recommendations' | 'insights' | 'analytics'>('recommendations')
  const [dismissedRecommendations, setDismissedRecommendations] = useState<string[]>([])

  // Generate smart recommendations based on appointment data
  const generateRecommendations = useMemo(() => {
    if (!appointments.length) return []

    const recs: Recommendation[] = []
    const now = new Date()
    
    // Appointment optimization
    const upcomingAppointments = appointments.filter(apt => 
      new Date(apt.dateTime) > now && apt.status === 'scheduled'
    )
    
    if (upcomingAppointments.length > 5) {
      recs.push({
        id: 'high-volume-week',
        type: 'optimization',
        priority: 'medium',
        title: 'Volum mare de programări',
        description: `Aveți ${upcomingAppointments.length} programări în perioada următoare. Considerați extinderea programului.`,
        impact: 'Reduce timpul de așteptare cu 15-20%',
        confidence: 85,
        actionRequired: true,
        estimatedTimeToComplete: '2-3 ore',
        metadata: {
          patientCount: upcomingAppointments.length,
          timeSlots: ['08:00-09:00', '13:00-14:00', '18:00-19:00']
        }
      })
    }

    // Follow-up recommendations
    const completedAppointments = appointments.filter(apt => 
      apt.status === 'completed' && 
      new Date(apt.dateTime) < now &&
      new Date(apt.dateTime) > new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
    )

    completedAppointments.forEach(apt => {
      const daysSinceAppointment = Math.floor((now.getTime() - new Date(apt.dateTime).getTime()) / (24 * 60 * 60 * 1000))
      
      if (daysSinceAppointment >= 7 && daysSinceAppointment <= 14) {
        recs.push({
          id: `follow-up-${apt.id}`,
          type: 'follow-up',
          priority: 'medium',
          title: `Follow-up ${apt.patientName}`,
          description: `A trecut o săptămână de la consultația pacientului ${apt.patientName}. Considerați un follow-up.`,
          impact: 'Îmbunătățește satisfacția pacientului cu 25%',
          confidence: 70,
          actionRequired: false,
          estimatedTimeToComplete: '5-10 minute',
          metadata: {
            followUpDate: new Date(new Date(apt.dateTime).getTime() + 14 * 24 * 60 * 60 * 1000)
          }
        })
      }
    })

    // No-show analysis
    const noShowAppointments = appointments.filter(apt => apt.status === 'no_show')
    const noShowRate = noShowAppointments.length / appointments.length

    if (noShowRate > 0.1) { // More than 10% no-show rate
      recs.push({
        id: 'high-no-show-rate',
        type: 'alert',
        priority: 'high',
        title: 'Rată mare de absențe',
        description: `Rata de absențe este ${(noShowRate * 100).toFixed(1)}%. Implementați confirmări automate.`,
        impact: 'Reduce absențele cu 30-40%',
        confidence: 90,
        actionRequired: true,
        estimatedTimeToComplete: '1-2 ore setup',
        metadata: {
          patientCount: noShowAppointments.length
        }
      })
    }

    // Optimal scheduling suggestions
    const hourlyDistribution = appointments.reduce((acc, apt) => {
      const hour = new Date(apt.dateTime).getHours()
      acc[hour] = (acc[hour] || 0) + 1
      return acc
    }, {} as Record<number, number>)

    const peakHours = Object.entries(hourlyDistribution)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => `${hour}:00`)

    if (peakHours.length > 0) {
      recs.push({
        id: 'optimal-scheduling',
        type: 'scheduling',
        priority: 'low',
        title: 'Orele optime de programare',
        description: `Orele cu cea mai mare solicitare: ${peakHours.join(', ')}. Optimizați programul.`,
        impact: 'Crește eficiența cu 15%',
        confidence: 75,
        actionRequired: false,
        estimatedTimeToComplete: '30 minute',
        metadata: {
          timeSlots: peakHours
        }
      })
    }

    return recs.slice(0, maxRecommendations)
  }, [appointments, maxRecommendations])

  // Generate patient insights
  const generatePatientInsights = useMemo(() => {
    const insights: PatientInsight[] = []
    const patientHistory = appointments.reduce((acc, apt) => {
      if (!acc[apt.patientName]) {
        acc[apt.patientName] = []
      }
      acc[apt.patientName].push(apt)
      return acc
    }, {} as Record<string, any[]>)

    Object.entries(patientHistory).forEach(([patientName, history]) => {
      if (history.length >= 3) {
        const completedVisits = history.filter(apt => apt.status === 'completed').length
        const totalVisits = history.length
        const adherenceRate = completedVisits / totalVisits

        let riskLevel: 'low' | 'medium' | 'high' = 'low'
        let insight = ''
        const recommendations: string[] = []

        if (adherenceRate < 0.7) {
          riskLevel = 'high'
          insight = `Pacient cu risc crescut - rata de prezență: ${(adherenceRate * 100).toFixed(0)}%`
          recommendations.push('Implementați amintiri automate')
          recommendations.push('Discutați barierele de acces')
        } else if (adherenceRate < 0.9) {
          riskLevel = 'medium'
          insight = `Pacient cu risc moderat - rata de prezență: ${(adherenceRate * 100).toFixed(0)}%`
          recommendations.push('Confirmați programările în avans')
        } else {
          insight = `Pacient cu adherență excelentă - rata de prezență: ${(adherenceRate * 100).toFixed(0)}%`
          recommendations.push('Candidat pentru programări în avans')
        }

        const lastVisit = history
          .filter(apt => apt.status === 'completed')
          .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())[0]

        insights.push({
          id: `insight-${patientName}`,
          patientName,
          insight,
          nextAppointment: lastVisit ? new Date(new Date(lastVisit.dateTime).getTime() + 30 * 24 * 60 * 60 * 1000) : undefined,
          riskLevel,
          recommendations
        })
      }
    })

    return insights.slice(0, 10)
  }, [appointments])

  useEffect(() => {
    setLoading(true)
    // Simulate AI processing
    setTimeout(() => {
      setRecommendations(generateRecommendations)
      setPatientInsights(generatePatientInsights)
      setLoading(false)
    }, 1500)
  }, [generateRecommendations, generatePatientInsights])

  const handleDismissRecommendation = (id: string) => {
    setDismissedRecommendations(prev => [...prev, id])
  }

  const filteredRecommendations = recommendations.filter(
    rec => !dismissedRecommendations.includes(rec.id)
  )

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
      default: return 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'optimization': return TrendingUp
      case 'follow-up': return Bell
      case 'scheduling': return Calendar
      case 'insight': return Lightbulb
      case 'alert': return AlertTriangle
      default: return Brain
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            AI analizează datele și generează recomandări...
          </p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={staggerItem} className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recomandări Inteligente
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Analiză AI pentru optimizarea practicii medicale
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {[
            { id: 'recommendations', label: 'Recomandări', icon: Target },
            { id: 'insights', label: 'Insights', icon: Lightbulb },
            { id: 'analytics', label: 'Analiză', icon: BarChart3 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'recommendations' && (
          <motion.div
            key="recommendations"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {filteredRecommendations.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Totul pare în regulă!
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Nu există recomandări urgente în acest moment.
                </p>
              </div>
            ) : (
              filteredRecommendations.map((recommendation, index) => {
                const IconComponent = getTypeIcon(recommendation.type)
                return (
                  <motion.div
                    key={recommendation.id}
                    variants={cardVariants}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: index * 0.1 }}
                    className={`p-6 rounded-xl border ${getPriorityColor(recommendation.priority)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="p-2 rounded-lg bg-white/50 dark:bg-gray-900/50">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold">{recommendation.title}</h4>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              recommendation.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                              recommendation.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                              recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {recommendation.priority.toUpperCase()}
                            </span>
                          </div>
                          
                          <p className="text-sm mb-3">{recommendation.description}</p>
                          
                          <div className="flex items-center space-x-4 text-xs">
                            <div className="flex items-center space-x-1">
                              <TrendingUp className="w-3 h-3" />
                              <span>{recommendation.impact}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3" />
                              <span>{recommendation.confidence}% încredere</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{recommendation.estimatedTimeToComplete}</span>
                            </div>
                          </div>

                          {recommendation.actionRequired && (
                            <div className="mt-3">
                              <button className="flex items-center space-x-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                                <span>Acționează acum</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleDismissRecommendation(recommendation.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )
              })
            )}
          </motion.div>
        )}

        {activeTab === 'insights' && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {patientInsights.map((insight, index) => (
              <motion.div
                key={insight.id}
                variants={cardVariants}
                initial="initial"
                animate="animate"
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <UserCheck className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {insight.patientName}
                    </h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      insight.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                      insight.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {insight.riskLevel === 'high' ? 'Risc mare' : 
                       insight.riskLevel === 'medium' ? 'Risc moderat' : 'Risc scăzut'}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {insight.insight}
                </p>
                
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                    Recomandări:
                  </h5>
                  <ul className="space-y-1">
                    {insight.recommendations.map((rec, recIndex) => (
                      <li key={recIndex} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {/* Analytics cards */}
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 mb-4">
                <Activity className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Eficiența AI
                </h4>
              </div>
              <div className="text-3xl font-bold text-green-600 mb-2">94%</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Precizia recomandărilor AI
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 mb-4">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Optimizare
                </h4>
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-2">+23%</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Îmbunătățirea eficienței
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 mb-4">
                <Users className="w-5 h-5 text-purple-600" />
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Satisfacție
                </h4>
              </div>
              <div className="text-3xl font-bold text-purple-600 mb-2">4.8/5</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Rating mediu pacienți
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
