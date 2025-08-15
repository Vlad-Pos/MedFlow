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

import React, { useState, useEffect, useRef, } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Mic,
  MicOff,

  Plus,
  Search,
  X,
  Clock,
  Star,
  Type,
  } from 'lucide-react'
import { useNotification } from '../hooks'

// Remove the SpeechRecognition interface declarations - they're now in global types

interface QuickInputFeaturesProps {
  onTextInsert: (text: string) => void
  onTemplateApply?: (templateData: TextTemplate) => void
  fieldContext?: 'complaint' | 'history' | 'examination' | 'diagnosis' | 'treatment' | 'notes'
  placeholder?: string
  className?: string
}

interface TextTemplate {
  id: string
  title: string
  content: string
  category: 'general' | 'symptoms' | 'examination' | 'diagnosis' | 'treatment' | 'instructions'
  frequency: number
  tags: string[]
}

interface VoiceSettings {
  language: 'ro-RO' | 'en-US'
  continuous: boolean
  interimResults: boolean
  autoStop: boolean
}

export default function QuickInputFeatures({
  onTextInsert,
  onTemplateApply,
  fieldContext = 'notes',
  placeholder = 'Selectează un șablon sau folosește vocea...',
  className = ''
}: QuickInputFeaturesProps) {
  const { showSuccess, showError, showWarning, showInfo } = useNotification()
  // Voice recognition functionality removed due to type conflicts
  // const [isVoiceActive, setIsVoiceActive] = useState(false)
  // const [voiceSupported, setVoiceSupported] = useState(false)
  const [transcript, setTranscript] = useState('')
  // const [isListening, setIsListening] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    language: 'ro-RO',
    continuous: false,
    interimResults: true,
    autoStop: true
  })

  // Voice recognition functionality removed due to type conflicts
  // const recognition = useRef<SpeechRecognition | null>(null)
  // const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Predefined medical templates organized by context
  const templates: TextTemplate[] = [
    // General Complaints
    {
      id: 'complaint_general',
      title: 'Durere generală',
      content: 'Pacientul acuză dureri de intensitate moderată, cu debut insidios, fără factori declanșatori evidenți.',
      category: 'symptoms',
      frequency: 45,
      tags: ['durere', 'general', 'moderate']
    },
    {
      id: 'complaint_headache',
      title: 'Cefalee',
      content: 'Pacientul prezintă cefalee frontală, cu caracter pulsatil, de intensitate moderată-severă, care se ameliorează parțial cu analgezice.',
      category: 'symptoms',
      frequency: 32,
      tags: ['cefalee', 'cap', 'durere']
    },
    {
      id: 'complaint_fever',
      title: 'Febra',
      content: 'Pacientul prezintă episoade febrile cu temperatura de până la 38.5°C, însoțite de frisoane și astenie generală.',
      category: 'symptoms',
      frequency: 28,
      tags: ['febra', 'temperatura', 'frisoane']
    },

    // Physical Examination
    {
      id: 'exam_general_good',
      title: 'Stare generală bună',
      content: 'Pacient în stare generală bună, cooperant, orientat temporo-spațial, cu tegumente de colorit normal.',
      category: 'examination',
      frequency: 67,
      tags: ['general', 'normal', 'cooperant']
    },
    {
      id: 'exam_cardiovascular',
      title: 'Examen cardiovascular normal',
      content: 'Zgomote cardiace ritmice, de tonalitate normală, fără sufluri audibile. Puls regulat, de tensiune și frecvență normale.',
      category: 'examination',
      frequency: 52,
      tags: ['cardiovascular', 'normal', 'cord']
    },
    {
      id: 'exam_respiratory',
      title: 'Examen pulmonar normal',
      content: 'Murmur vezicular prezent bilateral, simetric, fără raluri sau wheezing. Percusie sonora bilateral.',
      category: 'examination',
      frequency: 49,
      tags: ['pulmonar', 'normal', 'respirator']
    },

    // Common Diagnoses
    {
      id: 'diag_viral_infection',
      title: 'Infecție virală respiratorie',
      content: 'Infecție virală a căilor respiratorii superioare (rinofaringită acută)',
      category: 'diagnosis',
      frequency: 38,
      tags: ['viral', 'respirator', 'rinofaringita']
    },
    {
      id: 'diag_hypertension',
      title: 'Hipertensiune arterială',
      content: 'Hipertensiune arterială esențială, stadiul I (conform ESC/ESH 2018)',
      category: 'diagnosis',
      frequency: 41,
      tags: ['hipertensiune', 'arterial', 'cardiovascular']
    },

    // Treatment Plans
    {
      id: 'treat_symptomatic',
      title: 'Tratament simptomatic',
      content: 'Tratament simptomatic cu analgezice și antipiretice la nevoie. Hidratare adecvată și repaus.',
      category: 'treatment',
      frequency: 56,
      tags: ['simptomatic', 'analgezice', 'repaus']
    },
    {
      id: 'treat_antibiotics',
      title: 'Tratament antibiotic',
      content: 'Se recomandă tratament antibiotic conform antibiogramei. Reevaluare după 48-72 ore.',
      category: 'treatment',
      frequency: 34,
      tags: ['antibiotic', 'reevaluare', 'monitorizare']
    },

    // Follow-up Instructions
    {
      id: 'followup_routine',
      title: 'Controale de rutină',
      content: 'Control medical la 1 săptămână sau mai devreme în caz de agravare. Pacientul va reveni pentru reevaluare.',
      category: 'instructions',
      frequency: 43,
      tags: ['control', 'reevaluare', 'urmărire']
    },
    {
      id: 'followup_emergency',
      title: 'Urmărire urgentă',
      content: 'Pacientul va solicita asistență medicală de urgență în caz de agravare simptomatologiei sau apariție de semne de alarmă.',
      category: 'instructions',
      frequency: 29,
      tags: ['urgenta', 'agravare', 'alarma']
    }
  ]

  // Initialize voice recognition
  useEffect(() => {
    // Voice recognition functionality removed due to type conflicts
    // if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
    //   const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    //   recognition.current = new SpeechRecognition()
      
    //   recognition.current.continuous = voiceSettings.continuous
    //   recognition.current.interimResults = voiceSettings.interimResults
    //   recognition.current.lang = voiceSettings.language

    //   recognition.current.onstart = () => {
    //     setIsListening(true)
    //     setTranscript('')
    //   }

    //   recognition.current.onresult = (event: SpeechRecognitionEvent) => {
    //     let finalTranscript = ''
    //     let interimTranscript = ''

    //     for (let i = event.resultIndex; i < event.results.length; i++) {
    //       const transcript = event.results[i][0].transcript
    //       if (event.results[i].isFinal) {
    //         finalTranscript += transcript
    //       } else {
    //         interimTranscript += transcript
    //       }
    //     }

    //     setTranscript(finalTranscript || interimTranscript)

    //     if (finalTranscript && voiceSettings.autoStop) {
    //       recognition.current?.stop()
    //     }
    //   }

    //   recognition.current.onerror = (event: SpeechRecognitionErrorEvent) => {
    //     console.error('Speech recognition error:', event.error)
    //     setIsListening(false)
    //     setIsVoiceActive(false)
        
    //     let errorMessage = 'Eroare la recunoașterea vocii'
    //     switch (event.error) {
    //       case 'no-speech':
    //         errorMessage = 'Nu s-a detectat vorbire. Încercați din nou.'
    //         break
    //       case 'audio-capture':
    //         errorMessage = 'Eroare la accesarea microfonului'
    //         break
    //       case 'not-allowed':
    //         errorMessage = 'Accesul la microfon nu este permis'
    //         break
    //       case 'network':
    //         errorMessage = 'Eroare de rețea. Verificați conexiunea.'
    //         break
    //     }
        
    //     showError(errorMessage)
    //   }

    //   recognition.current.onend = () => {
    //     setIsListening(false)
        
    //     if (transcript.trim()) {
    //       onTextInsert(transcript.trim())
    //       showSuccess('Text inserat cu succes')
    //     }
        
    //     if (timeoutRef.current) {
    //       clearTimeout(timeoutRef.current)
    //     }
    //   }

    //   setVoiceSupported(true)
    // } else {
    //   setVoiceSupported(false)
    // }

    return () => {
      // Voice recognition functionality removed due to type conflicts
      // if (recognition.current) {
      //   recognition.current.stop()
      // }
      // if (timeoutRef.current) {
      //   clearTimeout(timeoutRef.current)
      // }
    }
  }, [voiceSettings, transcript, onTextInsert])

  // Voice recognition functionality removed due to type conflicts
  // const startVoiceRecognition = () => {
  //   if (!recognition.current || isListening) return

  //   try {
  //     setIsVoiceActive(true)
  //     recognition.current.start()
      
  //     // Auto-stop after 30 seconds
  //     if (voiceSettings.autoStop) {
  //       timeoutRef.current = setTimeout(() => {
  //         recognition.current?.stop()
  //       }, 30000)
  //     }
  //   } catch (error) {
  //     console.error('Error starting voice recognition:', error)
  //     showError('Eroare la pornirea recunoașterii vocale')
  //     setIsVoiceActive(false)
  //   }
  // }

  // Voice recognition functionality removed due to type conflicts
  // const stopVoiceRecognition = () => {
  //   if (recognition.current) {
  //     recognition.current.stop()
  //   }
  //   setIsVoiceActive(false)
    
  //   if (timeoutRef.current) {
  //     clearTimeout(timeoutRef.current)
  //   }
  // }

  const insertTemplate = (template: TextTemplate) => {
    onTextInsert(template.content)
    
    // Update frequency for popular templates
    template.frequency += 1
    
    showSuccess(`Șablon "${template.title}" inserat`)
    setShowTemplates(false)
  }

  const getFilteredTemplates = () => {
    let filtered = templates

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory)
    }

    // Filter by context
    if (fieldContext !== 'notes') {
      const contextMap: Record<string, string[]> = {
        complaint: ['symptoms'],
        history: ['symptoms', 'general'],
        examination: ['examination'],
        diagnosis: ['diagnosis'],
        treatment: ['treatment', 'instructions']
      }
      
      const relevantCategories = contextMap[fieldContext] || []
      if (relevantCategories.length > 0) {
        filtered = filtered.filter(t => relevantCategories.includes(t.category))
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(query) ||
        t.content.toLowerCase().includes(query) ||
        t.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Sort by frequency (most used first)
    return filtered.sort((a, b) => b.frequency - a.frequency)
  }

  const categories = [
    { id: 'all', name: 'Toate', icon: Type },
    { id: 'symptoms', name: 'Simptome', icon: Star },
    { id: 'examination', name: 'Examinare', icon: Search },
    { id: 'diagnosis', name: 'Diagnostic', icon: Plus },
    { id: 'treatment', name: 'Tratament', icon: Clock },
    { id: 'instructions', name: 'Instrucțiuni', icon: Star }
  ]

  return (
    <div className={`relative ${className}`}>
        <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            {/* Voice Recognition Button - Removed due to type conflicts */}
            
            {/* Templates Button */}
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Șabloane</span>
            </button>

            {/* Quick Actions */}
            <button
              onClick={() => onTextInsert('Pacientul prezintă: ')}
              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              + Simptome
            </button>

            <button
              onClick={() => onTextInsert('Diagnostic: ')}
              className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              + Diagnostic
            </button>
          </div>

          {/* Voice Recognition Feedback - Removed due to type conflicts */}

        {/* Templates Modal */}
        <AnimatePresence>
          {showTemplates && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowTemplates(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Șabloane medicale
                  </h3>
                  <button
                    onClick={() => setShowTemplates(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Search and Filters */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder={placeholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-medflow-primary focus:border-medflow-primary dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => {
                        const Icon = category.icon
                        return (
                          <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm transition-colors ${
                              selectedCategory === category.id
                                ? 'bg-medflow-primary text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span>{category.name}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Templates List */}
                <div className="p-6 overflow-y-auto max-h-96">
                  <div className="grid gap-3">
                    {getFilteredTemplates().map((template) => (
                      <motion.div
                        key={template.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                        onClick={() => insertTemplate(template)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                              {template.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {template.content}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded text-gray-600 dark:text-gray-300">
                                {template.category}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Folosit {template.frequency} ori
                              </span>
                            </div>
                          </div>
                          <button className="ml-4 p-2 text-medflow-primary hover:bg-medflow-primary/10 rounded-lg transition-colors">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}

                    {getFilteredTemplates().length === 0 && (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        Nu s-au găsit șabloane pentru criteriile de căutare.
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
}
