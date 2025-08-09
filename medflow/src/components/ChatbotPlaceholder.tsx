/**
 * Enhanced AI Chatbot Page for MedFlow
 * 
 * Features:
 * - AI-powered medical conversation assistant
 * - Natural language processing for appointments
 * - Multilingual support (Romanian/English)
 * - Smart scheduling suggestions
 * - Medical intake assistance
 * - Real-time sentiment analysis
 * 
 * @author MedFlow Team
 * @version 2.0
 */

import AIChat from './AIChat'
import { motion } from 'framer-motion'
import { fadeInVariants } from '../utils/animations'
import { Brain, MessageCircle, Calendar, Heart, Languages, Zap } from 'lucide-react'

export default function ChatbotPlaceholder() {
  return (
    <motion.section
      variants={fadeInVariants}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-4"
        >
          <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
            <Brain className="w-8 h-8 text-white" />
          </div>
        </motion.div>
        
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Asistent Medical AI
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Discutați cu asistentul nostru inteligent pentru programări, simptome și întrebări medicale
        </p>
      </div>

      {/* Features Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
      >
        {[
          { icon: MessageCircle, label: 'Chat inteligent', color: 'text-blue-500' },
          { icon: Calendar, label: 'Programări auto', color: 'text-green-500' },
          { icon: Heart, label: 'Analiză sentiment', color: 'text-red-500' },
          { icon: Languages, label: 'Multilingv', color: 'text-purple-500' },
          { icon: Brain, label: 'AI medical', color: 'text-indigo-500' },
          { icon: Zap, label: 'Răspuns rapid', color: 'text-yellow-500' }
        ].map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <feature.icon className={`w-6 h-6 ${feature.color} mb-2`} />
            <span className="text-xs text-gray-600 dark:text-gray-400 text-center">
              {feature.label}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* AI Chat Component */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        <AIChat />
      </motion.div>

      {/* Info Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6"
      >
        <div className="flex items-start space-x-3">
          <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Despre Asistentul AI MedFlow
            </h4>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <p>• <strong>Confidențialitate:</strong> Toate conversațiile sunt criptate și protejate</p>
              <p>• <strong>Precizie:</strong> AI-ul este antrenat specific pentru domeniul medical</p>
              <p>• <strong>Disponibilitate:</strong> Asistentul este disponibil 24/7 pentru întrebări</p>
              <p>• <strong>Limitări:</strong> Pentru urgențe medicale, contactați imediat serviciile de urgență</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.section>
  )
}