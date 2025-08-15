import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'
import realData from '../data/realData.json'

interface MetricsSectionProps {
  className?: string
}

export default function MetricsSection({ className = '' }: MetricsSectionProps) {
  const iconMap = {
    Clock: '⏱️',
    CheckCircle: '✅',
    Shield: '🛡️',
    BarChart3: '📊'
  }

  return (
    <motion.section 
      className={`py-20 ${className}`}
      style={{ background: 'linear-gradient(135deg, var(--medflow-brand-7), var(--medflow-brand-6))' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
            Creștere măsurabilă a
            <span className="bg-gradient-to-r from-[var(--medflow-brand-1)] via-[var(--medflow-brand-2)] to-[var(--medflow-brand-3)] bg-clip-text text-transparent"> productivității</span>
          </h2>
          <p className="text-xl md:text-2xl text-white font-light max-w-3xl mx-auto leading-relaxed">
            Rezultate reale și măsurabile obținute de medicii care folosesc MedFlow zilnic
          </p>
          <div className="mt-8 inline-flex items-center space-x-2 bg-green-100 px-6 py-3 rounded-full">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-700 font-semibold">Dovezi concrete, nu promisiuni</span>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {realData.metrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                delay: index * 0.1,
                type: "spring",
                stiffness: 100,
                damping: 15
              }}
              whileHover={{ 
                scale: 1.05,
                y: -8,
                transition: { duration: 0.2 }
              }}
              className="group text-center p-8 bg-white/5 backdrop-blur rounded-2xl border border-[var(--medflow-brand-1)]/10 hover:border-[var(--medflow-brand-1)]/30 hover:shadow-xl hover:shadow-[var(--medflow-brand-1)]/10 transition-all duration-300 cursor-pointer"
            >
              <motion.div 
                className="flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[var(--medflow-brand-6)]/10 via-[var(--medflow-brand-1)]/10 to-[var(--medflow-brand-4)]/10 rounded-full mx-auto mb-6 group-hover:from-[var(--medflow-brand-1)]/20 group-hover:via-[var(--medflow-brand-6)]/20 group-hover:to-[var(--medflow-brand-4)]/20 transition-all duration-300"
                whileHover={{ 
                  rotate: [0, -10, 10, 0],
                  scale: 1.1
                }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-3xl">{iconMap[metric.icon as keyof typeof iconMap]}</span>
              </motion.div>
              <motion.div 
                className="text-4xl font-extrabold bg-gradient-to-r from-[var(--medflow-brand-6)] to-[var(--medflow-brand-1)] bg-clip-text text-transparent mb-3"
                initial={{ scale: 1 }}
                whileInView={{ scale: [1, 1.1, 1] }}
                transition={{ delay: index * 0.1 + 0.5, duration: 0.6 }}
              >
                {metric.number}
              </motion.div>
              <div className="text-white font-semibold text-lg group-hover:text-[var(--medflow-brand-1)] transition-colors duration-300 mb-2">
                {metric.label}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                {metric.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
