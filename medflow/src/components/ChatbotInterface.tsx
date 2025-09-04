/**
 * Medical Chatbot Interface for MedFlow
 * 
 * Features:
 * - Professional medical chatbot UI for patient intake
 * - Romanian language support for patient communication
 * - Symptom collection and medical history gathering
 * - Emergency detection and triage capabilities
 * - AI integration placeholders for OpenAI GPT-4 and Claude
 * - Professional medical styling with MedFlow branding
 * 
 * @author MedFlow Team
 * @version 2.0
 * @integration-ready OpenAI GPT-4, Claude AI
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Bot, 
  User, 
  AlertTriangle, 
  Phone, 
  Heart,
  Brain,
  Mic,
  MicOff,
  X,
  } from 'lucide-react'
import { useAuth } from '../providers/AuthProvider'
import { getAIService, detectEmergency } from '../services/aiService'
import LoadingSpinner from './LoadingSpinner'
interface ChatMessage {
  id: string
  content: string
  type: 'user' | 'bot' | 'system'
  timestamp: Date
  intent?: string
  requiresAction?: boolean
  medicalDisclaimer?: boolean
}

interface PatientIntakeData {
  symptoms: string[]
  duration: string
  severity: string
  previousConditions: string[]
  currentMedications: string[]
  allergies: string[]
  emergencyContact: string
}

interface ChatbotInterfaceProps {
  isOpen: boolean
  onClose: () => void
  onAppointmentRequest?: (data: Record<string, unknown>) => void
  patientId?: string
}

export default function ChatbotInterface({ 
  isOpen, 
  onClose, 
  onAppointmentRequest,
  patientId 
}: ChatbotInterfaceProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [conversationStage, setConversationStage] = useState<'greeting' | 'intake' | 'symptoms' | 'triage' | 'booking'>('greeting')
  const [patientData, setPatientData] = useState<Partial<PatientIntakeData>>({})
  const [showEmergencyAlert, setShowEmergencyAlert] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const aiService = getAIService()

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Initialize conversation
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        content: `Bună ziua${user?.displayName ? `, ${user.displayName}` : ''}! Sunt asistentul virtual MedFlow. 

Vă pot ajuta cu:
• 📋 Colectarea informațiilor despre simptome
• 📅 Programarea consultațiilor
• 📊 Organizarea istoricului medical
• 🚨 Triajul medical de urgență

Cum vă pot ajuta astăzi?`,
        type: 'bot',
        timestamp: new Date(),
        intent: 'greeting'
      }
      setMessages([welcomeMessage])
    }
  }, [isOpen, user, messages.length])

  // Utility function to convert ChatMessage to Record format for AI service
  const convertMessagesToRecord = useCallback((chatMessages: ChatMessage[]): Record<string, unknown>[] => {
    return chatMessages.map(msg => ({
      id: msg.id,
      content: msg.content,
      type: msg.type,
      timestamp: msg.timestamp,
      intent: msg.intent,
      requiresAction: msg.requiresAction,
      medicalDisclaimer: msg.medicalDisclaimer
    }))
  }, [])

  // Handle send message
  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || isTyping) return

    const userMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      content: inputMessage,
      type: 'user',
      timestamp: new Date(),
      intent: 'user_input'
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    try {
      // Check for emergency keywords
      if (detectEmergency(inputMessage)) {
        setShowEmergencyAlert(true)
        const emergencyMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: `🚨 **ATENȚIE: URGENȚĂ MEDICALĂ DETECTATĂ**

Din descrierea dvs., pare că aveți simptome care necesită atenție medicală imediată.

**Acțiuni recomandate:**
• 📞 Sunați la 112 pentru urgențe
• 🏥 Mergeți la cea mai apropiată unitate de urgență
• 👨‍⚕️ Contactați medicul de familie urgent

**Nu așteptați - căutați ajutor medical imediat!**`,
          type: 'system',
          timestamp: new Date(),
          requiresAction: true
        }
        setMessages(prev => [...prev, emergencyMessage])
        setIsTyping(false)
        return
      }

      // Process message with AI service
      // TODO: Replace with actual AI integration
      const response = await aiService.processChatbotMessage(inputMessage, convertMessagesToRecord(messages))
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        content: response.message,
        type: 'bot',
        timestamp: new Date(),
        intent: response.intent,
        medicalDisclaimer: response.medicalAdviceDisclaimer
      }

      // Add follow-up questions if available
      if (response.followUp && response.followUp.length > 0) {
        const followUpMessage: ChatMessage = {
          id: (Date.now() + 3).toString(),
          content: `Pentru o evaluare mai precisă, vă rog să răspundeți la următoarele întrebări:

${response.followUp.map((q, i) => `${i + 1}. ${q}`).join('\n')}`,
          type: 'bot',
          timestamp: new Date(),
          intent: 'symptom_inquiry'
        }
        setMessages(prev => [...prev, botMessage, followUpMessage])
      } else {
        setMessages(prev => [...prev, botMessage])
      }

      // Update conversation stage based on intent
      if (response.intent === 'appointment_booking') {
        setConversationStage('booking')
      } else if (response.intent === 'symptom_inquiry') {
        setConversationStage('symptoms')
      }

    } catch (error) {
      console.error('Chatbot error:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 4).toString(),
        content: 'Ne pare rău, a apărut o problemă tehnică. Vă rugăm să încercați din nou sau să contactați direct medicul.',
        type: 'system',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }, [inputMessage, messages, aiService, isTyping, convertMessagesToRecord])

  // Handle enter key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }, [handleSendMessage])

  // Voice input placeholder
  const handleVoiceInput = useCallback(() => {
    setIsListening(!isListening)
    // TODO: Integrate with Web Speech API
    /*
    if ('webkitSpeechRecognition' in window) {
      const recognition = new webkitSpeechRecognition()
      recognition.lang = 'ro-RO'
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setInputMessage(transcript)
      }
      recognition.start()
    }
    */
  }, [isListening])

  // Quick action buttons
  const quickActions = [
    { text: 'Am dureri de cap', icon: '🤕' },
    { text: 'Vreau să programez o consultație', icon: '📅' },
    { text: 'Am febră', icon: '🌡️' },
    { text: 'Am nevoie de o rețetă', icon: '💊' }
  ]

  if (!isOpen) return null

  return (
    <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl h-[600px] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-medflow-primary to-medflow-secondary p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-full">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Asistent Medical MedFlow</h3>
                  <p className="text-white/80 text-sm">
                    {isTyping ? 'Scrie răspuns...' : 'Online • Pregătit să vă ajute'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 text-white/80 text-xs">
                  <Brain className="w-4 h-4" />
                  <span>🤖 AI</span>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Emergency Alert */}
          <AnimatePresence>
            {showEmergencyAlert && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-red-50 border-l-4 border-red-500 p-4"
              >
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-red-800">Urgență Medicală Detectată</h4>
                    <p className="text-red-700 text-sm mt-1">
                      Pentru simptome severe, contactați imediat serviciile de urgență.
                    </p>
                    <div className="flex space-x-2 mt-2">
                      <button className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors">
                        <Phone className="w-3 h-3" />
                        <span>Sună 112</span>
                      </button>
                      <button 
                        onClick={() => setShowEmergencyAlert(false)}
                        className="px-3 py-1 border border-red-300 text-red-700 rounded text-sm hover:bg-red-50 transition-colors"
                      >
                        Închide
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-3 max-w-[80%] ${
                  message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user' 
                      ? 'bg-medflow-primary text-white' 
                      : message.type === 'system'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-100 text-medflow-primary dark:bg-gray-800'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : message.type === 'system' ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>
                  
                  <div className={`rounded-2xl px-4 py-3 ${
                    message.type === 'user'
                      ? 'bg-medflow-primary text-white'
                      : message.type === 'system'
                      ? 'bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
                      : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
                  }`}>
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    
                    {message.medicalDisclaimer && (
                      <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600 text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Heart className="w-3 h-3" />
                          <span>
                            Disclaimer: Acestea sunt doar informații generale. Pentru diagnostic și tratament, consultați un medic.
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString('ro-RO', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                      
                      {message.intent && (
                        <span className="text-xs opacity-70 bg-black/10 px-2 py-1 rounded">
                          {message.intent}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Typing indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex justify-start"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center dark:bg-gray-800">
                      <Bot className="w-4 h-4 text-medflow-primary" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl px-4 py-3 dark:bg-gray-800">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 1 && (
            <div className="px-6 pb-4">
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setInputMessage(action.text)}
                    className="flex items-center space-x-2 p-3 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
                  >
                    <span className="text-lg">{action.icon}</span>
                    <span className="text-sm">{action.text}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-end space-x-3">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Descrieți simptomele sau întrebarea dvs..."
                  className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-medflow-primary focus:border-medflow-primary dark:bg-gray-800 dark:border-gray-600 dark:text-white resize-none"
                  disabled={isTyping}
                />
                
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                  <button
                    onClick={handleVoiceInput}
                    className={`p-2 rounded-full transition-colors ${
                      isListening 
                        ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                        : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                    }`}
                    title={isListening ? 'Oprește înregistrarea' : 'Înregistrare vocală'}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="p-3 bg-medflow-primary text-white rounded-2xl hover:bg-medflow-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTyping ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </motion.button>
            </div>
            
            <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
              <div className="flex items-center space-x-4">
                <span>🤖 Asistat de AI</span>
                <span>🔒 Conversație securizată</span>
              </div>
              <span>Apăsați Enter pentru a trimite</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
    )
}
