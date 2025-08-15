/**
 * AI-Powered Chatbot Component for MedFlow
 * 
 * Features:
 * - Natural Language Processing for medical conversations
 * - Multilingual support (Romanian/English)
 * - Automated responses for common questions
 * - Sentiment analysis for patient feedback
 * - Smart appointment scheduling suggestions
 * - Medical intake assistance
 * - Integration with MedFlow appointment system
 * 
 * @author MedFlow Team
 * @version 2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Bot, 
  User, 
  Calendar, 
  Heart, 
  Brain,
  MessageCircle,
  Mic,
  MicOff,
  Languages,
  ThumbsUp,
  ThumbsDown,
  Download,
  Settings
} from 'lucide-react'
import { useAuth } from '../providers/AuthProvider'
import { staggerContainer, staggerItem, fadeInVariants } from '../utils/animations'
import LoadingSpinner from './LoadingSpinner'
interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  language: 'ro' | 'en'
  sentiment?: 'positive' | 'negative' | 'neutral'
  confidence?: number
  suggestions?: string[]
  appointmentData?: AppointmentSuggestion
  metadata?: {
    responseTime?: number
    tokens?: number
    intent?: string
    entities?: Record<string, unknown>[]
  }
}

interface AppointmentSuggestion {
  suggestedDates: Date[]
  preferredTime: string
  urgencyLevel: 'low' | 'medium' | 'high' | 'urgent'
  specialty?: string
  symptoms: string[]
}

interface AIConfig {
  enabled: boolean
  model: 'gpt-3.5' | 'gpt-4' | 'medflow-ai'
  language: 'ro' | 'en' | 'auto'
  features: {
    voiceInput: boolean
    sentimentAnalysis: boolean
    appointmentScheduling: boolean
    medicalIntake: boolean
    multiLanguage: boolean
  }
}

const DEFAULT_CONFIG: AIConfig = {
  enabled: true,
  model: 'medflow-ai',
  language: 'auto',
  features: {
    voiceInput: true,
    sentimentAnalysis: true,
    appointmentScheduling: true,
    medicalIntake: true,
    multiLanguage: true
  }
}

// Medical knowledge base for common queries
const MEDICAL_RESPONSES = {
  ro: {
    greeting: [
      "Bună ziua! Sunt asistentul virtual MedFlow. Cum vă pot ajuta astăzi?",
      "Salut! Sunt aici să vă ajut cu programările și întrebările medicale.",
      "Bună! Cu ce vă pot fi de folos astăzi?"
    ],
    appointment: [
      "Vă pot ajuta să programați o consultație. Când ați dori să veniți?",
      "Pentru a face o programare, am nevoie de câteva informații. În ce zi v-ar conveni?",
      "Perfect! Să vedem ce ore sunt disponibile pentru dvs."
    ],
    symptoms: [
      "Înțeleg că aveți simptome. Pentru a vă ajuta mai bine, puteți descrie ce simțiți?",
      "Vă mulțumesc că îmi spuneți despre simptome. Cât timp aveți aceste probleme?",
      "Este important să discutați aceste simptome cu doctorul. Să programăm o consultație?"
    ],
    emergency: [
      "Pentru urgențe medicale, vă rog să sunați imediat la 112 sau să mergeți la cea mai apropiată secție de urgență.",
      "Dacă este o situație de urgență, nu întârziați - contactați serviciile medicale de urgență.",
      "Pentru probleme urgente, contactați imediat medicul sau serviciile de urgență."
    ]
  },
  en: {
    greeting: [
      "Hello! I'm MedFlow's virtual assistant. How can I help you today?",
      "Hi! I'm here to help you with appointments and medical questions.",
      "Hello! What can I assist you with today?"
    ],
    appointment: [
      "I can help you schedule an appointment. When would you like to come in?",
      "To make an appointment, I need some information. What day works for you?",
      "Perfect! Let's see what times are available for you."
    ],
    symptoms: [
      "I understand you have symptoms. To help you better, can you describe what you're feeling?",
      "Thank you for telling me about your symptoms. How long have you had these issues?",
      "It's important to discuss these symptoms with the doctor. Shall we schedule a consultation?"
    ],
    emergency: [
      "For medical emergencies, please call emergency services immediately or go to the nearest emergency room.",
      "If this is an emergency, don't delay - contact emergency medical services.",
      "For urgent issues, contact your doctor or emergency services immediately."
    ]
  }
}

export default function AIChat() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [config, setConfig] = useState<AIConfig>(DEFAULT_CONFIG)
  const [isListening, setIsListening] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [conversationSummary, setConversationSummary] = useState('')
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Initialize conversation
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: getRandomResponse('greeting', config.language === 'auto' ? 'ro' : config.language),
      timestamp: new Date(),
      language: config.language === 'auto' ? 'ro' : config.language,
      sentiment: 'positive'
    }
    setMessages([welcomeMessage])
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Get random response from knowledge base
  const getRandomResponse = useCallback((type: keyof typeof MEDICAL_RESPONSES.ro, language: 'ro' | 'en') => {
    const responses = MEDICAL_RESPONSES[language][type]
    return responses[Math.floor(Math.random() * responses.length)]
  }, [])

  // Detect language of input text
  const detectLanguage = useCallback((text: string): 'ro' | 'en' => {
    // Simple language detection based on common Romanian words
    const romanianWords = ['sunt', 'este', 'am', 'vreau', 'pot', 'programare', 'doctor', 'durere', 'simptome']
    const englishWords = ['am', 'is', 'want', 'can', 'appointment', 'doctor', 'pain', 'symptoms']
    
    const lowerText = text.toLowerCase()
    const romanianMatches = romanianWords.filter(word => lowerText.includes(word)).length
    const englishMatches = englishWords.filter(word => lowerText.includes(word)).length
    
    return romanianMatches > englishMatches ? 'ro' : 'en'
  }, [])

  // Analyze sentiment of message
  const analyzeSentiment = useCallback((text: string): { sentiment: 'positive' | 'negative' | 'neutral', confidence: number } => {
    // Simple sentiment analysis based on keywords
    const positiveWords = ['bine', 'mulțumesc', 'perfect', 'excelent', 'bun', 'good', 'great', 'thank', 'perfect', 'excellent']
    const negativeWords = ['rău', 'durere', 'problemă', 'nasol', 'grav', 'bad', 'pain', 'problem', 'terrible', 'awful']
    
    const lowerText = text.toLowerCase()
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length
    
    if (positiveCount > negativeCount) {
      return { sentiment: 'positive', confidence: 0.7 }
    } else if (negativeCount > positiveCount) {
      return { sentiment: 'negative', confidence: 0.7 }
    } else {
      return { sentiment: 'neutral', confidence: 0.5 }
    }
  }, [])

  // Extract intent and entities from message
  const extractIntent = useCallback((text: string, language: 'ro' | 'en') => {
    const lowerText = text.toLowerCase()
    
    // Define intent patterns
    const intents = {
      appointment: language === 'ro' 
        ? ['programare', 'consultație', 'să vin', 'să mă programez', 'doctor']
        : ['appointment', 'consultation', 'schedule', 'book', 'visit'],
      symptoms: language === 'ro'
        ? ['durere', 'simptome', 'mă doare', 'probleme', 'nu mă simt']
        : ['pain', 'symptoms', 'feel', 'hurt', 'problem'],
      emergency: language === 'ro'
        ? ['urgență', 'urgent', 'grav', 'imediat', 'ajutor']
        : ['emergency', 'urgent', 'serious', 'immediate', 'help'],
      greeting: language === 'ro'
        ? ['salut', 'bună', 'bună ziua', 'hai']
        : ['hello', 'hi', 'good morning', 'hey']
    }
    
    for (const [intent, keywords] of Object.entries(intents)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return intent
      }
    }
    
    return 'general'
  }, [])

  // Generate AI response based on input
  const generateResponse = useCallback(async (userMessage: string, language: 'ro' | 'en'): Promise<{
    content: string
    suggestions?: string[]
    appointmentData?: AppointmentSuggestion
  }> => {
    const intent = extractIntent(userMessage, language)
    const sentiment = analyzeSentiment(userMessage)
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
    
    let response = ''
    let suggestions: string[] = []
    let appointmentData: AppointmentSuggestion | undefined

    switch (intent) {
      case 'appointment':
        response = getRandomResponse('appointment', language)
        suggestions = language === 'ro' 
          ? ['Mâine dimineața', 'Săptămâna viitoare', 'Cât mai repede posibil']
          : ['Tomorrow morning', 'Next week', 'As soon as possible']
        
        // Generate appointment suggestions
        appointmentData = {
          suggestedDates: [
            new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
            new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
          ],
          preferredTime: '09:00',
          urgencyLevel: 'medium',
          symptoms: []
        }
        break
        
      case 'symptoms':
        response = getRandomResponse('symptoms', language)
        if (sentiment.sentiment === 'negative') {
          appointmentData = {
            suggestedDates: [new Date(Date.now() + 24 * 60 * 60 * 1000)],
            preferredTime: '09:00',
            urgencyLevel: 'high',
            symptoms: [userMessage]
          }
        }
        suggestions = language === 'ro'
          ? ['Programează consultație', 'Descrie mai multe simptome', 'Este urgent?']
          : ['Schedule consultation', 'Describe more symptoms', 'Is it urgent?']
        break
        
      case 'emergency':
        response = getRandomResponse('emergency', language)
        break
        
      case 'greeting':
        response = getRandomResponse('greeting', language)
        suggestions = language === 'ro'
          ? ['Vreau să fac o programare', 'Am niște simptome', 'Informații despre cabinet']
          : ['I want to make an appointment', 'I have symptoms', 'Cabinet information']
        break
        
      default:
        response = language === 'ro'
          ? 'Înțeleg. Pot să vă ajut cu programări medicale, informații despre simptome sau întrebări generale. Cu ce vă pot ajuta?'
          : 'I understand. I can help you with medical appointments, symptom information, or general questions. How can I assist you?'
        suggestions = language === 'ro'
          ? ['Programare medicală', 'Simptome și probleme', 'Informații cabinet']
          : ['Medical appointment', 'Symptoms and issues', 'Cabinet information']
    }

    return { content: response, suggestions, appointmentData }
  }, [getRandomResponse, extractIntent, analyzeSentiment])

  // Handle sending message
  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setIsLoading(true)

    // Detect language
    const language = config.language === 'auto' ? detectLanguage(userMessage) : config.language
    const sentiment = config.features.sentimentAnalysis ? analyzeSentiment(userMessage) : undefined

    // Add user message
    const userChatMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
      language,
      sentiment: sentiment?.sentiment,
      confidence: sentiment?.confidence
    }

    setMessages(prev => [...prev, userChatMessage])

    try {
      // Generate AI response
      const startTime = Date.now()
      const aiResponse = await generateResponse(userMessage, language)
      const responseTime = Date.now() - startTime

      // Add AI response
      const aiChatMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: aiResponse.content,
        timestamp: new Date(),
        language,
        suggestions: aiResponse.suggestions,
        appointmentData: aiResponse.appointmentData,
        metadata: {
          responseTime,
          intent: extractIntent(userMessage, language)
        }
      }

      setMessages(prev => [...prev, aiChatMessage])
    } catch (error) {
      console.error('Error generating AI response:', error)
      
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: language === 'ro' 
          ? 'Ne pare rău, a apărut o eroare. Vă rog să încercați din nou.'
          : 'Sorry, an error occurred. Please try again.',
        timestamp: new Date(),
        language
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, config, detectLanguage, analyzeSentiment, generateResponse, extractIntent])

  // Handle key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }, [handleSendMessage])

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInput(suggestion)
    inputRef.current?.focus()
  }, [])

  // Voice input (placeholder)
  const toggleVoiceInput = useCallback(() => {
    if (!config.features.voiceInput) return
    setIsListening(!isListening)
    // TODO: Implement actual voice recognition
  }, [isListening, config.features.voiceInput])

  // Export conversation
  const exportConversation = useCallback(() => {
    const conversationText = messages
      .map(msg => `[${msg.timestamp.toLocaleString()}] ${msg.role.toUpperCase()}: ${msg.content}`)
      .join('\n')
    
    const blob = new Blob([conversationText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `medflow-conversation-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }, [messages])

  return (
    <motion.div
        variants={fadeInVariants}
        initial="initial"
        animate="animate"
        className="h-[600px] flex flex-col bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                MedFlow AI Assistant
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Asistent medical inteligent
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            
            <button
              onClick={exportConversation}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Export conversation"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
            >
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    AI Features
                  </span>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-green-600 dark:text-green-400">
                      ● Active
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center space-x-2">
                    <Languages className="w-3 h-3 text-blue-500" />
                    <span>Multilingual Support</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Heart className="w-3 h-3 text-red-500" />
                    <span>Sentiment Analysis</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3 h-3 text-green-500" />
                    <span>Smart Scheduling</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mic className="w-3 h-3 text-purple-500" />
                    <span>Voice Input</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {messages.map((message) => (
              <motion.div
                key={message.id}
                variants={staggerItem}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                  {/* Message bubble */}
                  <div
                    className={`
                      px-4 py-2 rounded-2xl
                      ${message.role === 'user'
                        ? 'bg-blue-600 text-white ml-auto'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                      }
                    `}
                  >
                    <p className="text-sm">{message.content}</p>
                    
                    {/* Metadata */}
                    <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                      <span>{message.timestamp.toLocaleTimeString()}</span>
                      {message.sentiment && (
                        <div className="flex items-center space-x-1">
                          {message.sentiment === 'positive' && <ThumbsUp className="w-3 h-3" />}
                          {message.sentiment === 'negative' && <ThumbsDown className="w-3 h-3" />}
                          {message.sentiment === 'neutral' && <MessageCircle className="w-3 h-3" />}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="block w-full text-left px-3 py-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Appointment suggestions */}
                  {message.appointmentData && (
                    <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-300">
                          Sugestii de programare
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        {message.appointmentData.suggestedDates.map((date, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-green-700 dark:text-green-400">
                              {date.toLocaleDateString('ro-RO')} la {message.appointmentData?.preferredTime}
                            </span>
                            <button className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                              Selectează
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' ? 'order-1 ml-2' : 'order-2 mr-2'
                }`}>
                  {message.role === 'user' ? (
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-2xl">
                <LoadingSpinner size="sm" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  AI gândește...
                </span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Scrieți mesajul dvs. aici..."
                  className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  disabled={isLoading}
                />
                
                {config.features.voiceInput && (
                  <button
                    onClick={toggleVoiceInput}
                    className={`p-2 rounded-full transition-colors ${
                      isListening 
                        ? 'bg-red-500 text-white' 
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                    aria-label={isListening ? 'Stop listening' : 'Start voice input'}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>
            
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Quick actions */}
          <div className="flex items-center justify-between mt-3 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <span>AI Model: {config.model}</span>
              <span>Language: {config.language}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span>{messages.length} messages</span>
              {conversationSummary && (
                <button className="text-blue-600 dark:text-blue-400 hover:underline">
                  View Summary
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    )
}
