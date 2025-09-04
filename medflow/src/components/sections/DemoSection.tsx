import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Users, FileText, BarChart3, Play, Pause, ArrowRight, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import realData from '../data/realData.json'

interface DemoSectionProps {
  className?: string
}

export default function DemoSection({ className = '' }: DemoSectionProps) {
  const [activeTab, setActiveTab] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)

  const demoFeatures = [
    {
      icon: Calendar,
      title: 'Calendar cu programări',
      description: 'Vizualizează și gestionează programările într-un calendar intuitiv',
      demoData: {
        appointments: 15,
        urgent: 3,
        today: '15 programări astăzi',
        next: 'Următoarea: Dr. Popescu - 14:30'
      }
    },
    {
      icon: Users,
      title: 'Gestionare pacienți',
      description: 'Organizează informațiile despre pacienți într-un sistem centralizat',
      demoData: {
        total: 284,
        active: 267,
        new: 7,
        status: '7 dosare noi săptămâna aceasta'
      }
    },
    {
      icon: FileText,
      title: 'Rapoarte și export',
      description: 'Generează rapoarte detaliate și exportă datele în format CSV/PDF',
      demoData: {
        monthly: 'Raport lunar - Ready',
        status: 'Submisie automată către DSP',
        export: 'Export CSV disponibil'
      }
    },
    {
      icon: BarChart3,
      title: 'Dashboard cu metrici',
      description: 'Monitorizează performanța cabinetului cu statistici în timp real',
      demoData: {
        efficiency: 'Eficiență: 94%',
        patients: 'Pacienți/săptămână: 45',
        growth: 'Creștere: +12% față de luna trecută'
      }
    }
  ]

  const currentFeature = demoFeatures[activeTab]

  return (
    <motion.section 
      id="demo"
      className={`py-20 ${className}`}
      style={{ background: 'linear-gradient(135deg, var(--medflow-brand-6), var(--medflow-brand-7))' }}
      role="region"
      aria-labelledby="demo-title"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 id="demo-title" className="text-4xl md:text-6xl font-extrabold text-white mb-8 tracking-tight">
            Vezi cum
            <span className="bg-gradient-to-r from-[var(--medflow-brand-1)] via-[var(--medflow-brand-2)] to-[var(--medflow-brand-3)] bg-clip-text text-transparent"> funcționează</span>
          </h2>
          <p className="text-xl md:text-2xl text-white font-light max-w-4xl mx-auto leading-relaxed">
            Explorează funcționalitățile platformei prin această demonstrație interactivă. Fiecare caracteristică este proiectată pentru a simplifica munca zilnică.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Demo Interface */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-[var(--medflow-brand-7)] via-[var(--medflow-brand-6)] to-[var(--medflow-brand-4)] rounded-2xl overflow-hidden shadow-2xl">
              {/* Browser Header */}
              <div className="bg-[var(--medflow-brand-6)] px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <div className="ml-4 bg-white/20 rounded px-3 py-1 text-xs text-white">medflow.care/demo</div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="text-white/80 hover:text-white transition-colors"
                  aria-label={isPlaying ? "Pune pauză" : "Pornește"}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </motion.button>
              </div>

              {/* Demo Content */}
              <div className="p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Feature Header */}
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-[var(--medflow-brand-1)]/20 to-[var(--medflow-brand-4)]/20 rounded-xl flex items-center justify-center">
                        <currentFeature.icon className="w-6 h-6 text-[var(--medflow-brand-1)]" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{currentFeature.title}</h3>
                        <p className="text-white/80">{currentFeature.description}</p>
                      </div>
                    </div>

                    {/* Demo Data */}
                    <div className="grid gap-4">
                      {Object.entries(currentFeature.demoData).map(([key, value], index) => (
                        <motion.div
                          key={key}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-white/80 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                            <span className="text-white font-semibold">{value}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Action Button */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="pt-4"
                    >
                      <Link
                        to="/signup"
                        className="inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-[var(--medflow-brand-1)] to-[var(--medflow-brand-4)] text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 group"
                      >
                        Încearcă gratuit
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                      </Link>
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Feature Navigation */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-bold text-white mb-8">
              Funcționalități disponibile în beta
            </h3>
            
            <div className="space-y-4">
              {demoFeatures.map((feature, index) => (
                <motion.button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className={`w-full text-left p-6 rounded-xl border transition-all duration-300 ${
                    activeTab === index
                      ? 'bg-gradient-to-r from-[var(--medflow-brand-1)]/20 to-[var(--medflow-brand-4)]/20 border-[var(--medflow-brand-1)]/40 shadow-lg'
                      : 'bg-white/5 border-white/10 hover:border-[var(--medflow-brand-1)]/30 hover:bg-white/10'
                  }`}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      activeTab === index
                        ? 'bg-gradient-to-r from-[var(--medflow-brand-1)] to-[var(--medflow-brand-4)]'
                        : 'bg-white/10'
                    }`}>
                      <feature.icon className={`w-6 h-6 ${
                        activeTab === index ? 'text-white' : 'text-[var(--medflow-brand-1)]'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-semibold text-lg mb-2 transition-colors duration-300 ${
                        activeTab === index ? 'text-white' : 'text-white/90'
                      }`}>
                        {feature.title}
                      </h4>
                      <p className={`text-sm leading-relaxed transition-colors duration-300 ${
                        activeTab === index ? 'text-white/80' : 'text-white/60'
                      }`}>
                        {feature.description}
                      </p>
                    </div>
                    {activeTab === index && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center"
                      >
                        <CheckCircle className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Early Access Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-12 p-6 bg-gradient-to-r from-[var(--medflow-brand-1)]/10 to-[var(--medflow-brand-4)]/10 rounded-xl border border-[var(--medflow-brand-1)]/30"
            >
              <h4 className="text-lg font-semibold text-white mb-4">Beneficii pentru early adopters</h4>
              <div className="space-y-3">
                {realData.earlyAccess.benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-3"
                  >
                    <span className="text-2xl">{benefit.icon}</span>
                    <div>
                      <div className="font-medium text-white">{benefit.title}</div>
                      <div className="text-sm text-white/80">{benefit.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}
