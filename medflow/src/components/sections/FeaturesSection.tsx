import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Calendar, Users, FileText, BarChart3 } from 'lucide-react'
import realData from '../data/realData.json'
import N8nFeatureCard from '../N8nFeatureCard'

interface FeaturesSectionProps {
  className?: string
}

export default function FeaturesSection({ className = '' }: FeaturesSectionProps) {
  const { scrollY } = useScroll()
  const [activeFeature, setActiveFeature] = useState(0)
  
  // Enhanced scroll animations
  const featuresY = useTransform(scrollY, [0, 800], [0, -50])
  const featuresParallax = useTransform(scrollY, [0, 1000], [0, -150])

  // Cycle through features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % realData.features.current.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const iconMap = {
    Calendar,
    Users,
    FileText,
    BarChart3
  }

  return (
    <motion.section 
      id="features"
      style={{ 
        y: featuresY,
        background: 'linear-gradient(135deg, var(--medflow-brand-7), var(--medflow-brand-6))'
      }}
      className={`py-20 ${className}`}
      role="region"
      aria-labelledby="features-title"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 id="features-title" className="text-4xl md:text-6xl font-extrabold text-white mb-8 tracking-tight">
            Instrumentele profesionale pe care le merită practica dumneavoastră medicală modernă
          </h2>
          <p className="text-xl md:text-2xl text-white max-w-4xl mx-auto font-light leading-relaxed">
            Suita completă de instrumente avansate pentru automatizarea integrală a cabinetului medical - o platformă medicală intuitivă, certificată și sigură, dezvoltată exclusiv pentru nevoile specifice ale medicilor români
          </p>
          
          {/* Progress Indicator */}
          <div className="flex justify-center mt-12 mb-8">
            <div className="flex items-center space-x-2">
              {realData.features.current.map((_, index) => (
                <motion.div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === activeFeature 
                      ? 'bg-gradient-to-r from-[var(--medflow-brand-6)] to-[var(--medflow-brand-2)] scale-125' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  whileHover={{ scale: 1.2 }}
                />
              ))}
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {realData.features.current.map((feature, index) => {
            const IconComponent = iconMap[feature.icon as keyof typeof iconMap]
            return (
              <N8nFeatureCard
                key={index}
                icon={IconComponent}
                title={feature.title}
                description={feature.description}
                benefit={feature.benefit}
                index={index}
                isActive={index === activeFeature}
              />
            )
          })}
        </div>

        {/* Planned Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-8">
            În dezvoltare
            <span className="bg-gradient-to-r from-[var(--medflow-brand-1)] to-[var(--medflow-brand-2)] bg-clip-text text-transparent"> activă</span>
          </h3>
          <p className="text-lg text-gray-300 mb-12 max-w-3xl mx-auto">
            Lucrăm constant la îmbunătățirea platformei. Următoarele funcționalități vor fi disponibile în versiunile viitoare.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {realData.features.planned.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10 hover:border-[var(--medflow-brand-1)]/30 transition-all duration-300"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-[var(--medflow-brand-1)]/20 to-[var(--medflow-brand-2)]/20 rounded-lg flex items-center justify-center">
                    <div className="w-3 h-3 bg-[var(--medflow-brand-1)] rounded-full animate-pulse"></div>
                  </div>
                  <span className="text-white font-medium">{feature}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}
