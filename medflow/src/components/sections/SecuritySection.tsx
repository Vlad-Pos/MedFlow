import { motion } from 'framer-motion'
import { Shield, Lock, Award, CheckCircle } from 'lucide-react'
import realData from '../data/realData.json'

interface SecuritySectionProps {
  className?: string
}

export default function SecuritySection({ className = '' }: SecuritySectionProps) {
  return (
    <motion.section 
      className={`py-20 ${className}`}
      style={{ background: 'linear-gradient(135deg, var(--medflow-brand-7), var(--medflow-brand-6))' }}
      role="region"
      aria-labelledby="security-title"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 id="security-title" className="text-4xl md:text-6xl font-extrabold text-white mb-8 tracking-tight">
            Securitate medicală de nivel enterprise cu certificări internaționale
          </h2>
          <p className="text-xl md:text-2xl text-white font-light max-w-4xl mx-auto leading-relaxed">
            Protejăm datele medicale sensibile cu tehnologii de securitate de ultimă generație și conformitate GDPR medicală 100% garantată prin audit extern independent anual
          </p>
        </motion.div>

        {/* Security Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {realData.security.features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ 
                scale: 1.03,
                y: -8,
                transition: { duration: 0.2 }
              }}
              className="group text-center p-8 bg-white/5 backdrop-blur rounded-2xl border border-white/10 hover:border-[var(--medflow-brand-1)]/30 hover:shadow-xl hover:shadow-[var(--medflow-brand-1)]/10 transition-all duration-300"
            >
              <motion.div 
                className="flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[var(--medflow-brand-6)]/10 via-[var(--medflow-brand-1)]/10 to-[var(--medflow-brand-2)]/10 rounded-full mx-auto mb-6 group-hover:from-[var(--medflow-brand-1)]/20 group-hover:via-[var(--medflow-brand-6)]/20 group-hover:to-[var(--medflow-brand-2)]/20 transition-all duration-300"
                whileHover={{ 
                  rotate: [0, -10, 10, 0],
                  scale: 1.1
                }}
                transition={{ duration: 0.5 }}
              >
                {feature.icon === 'Shield' && <Shield className="w-10 h-10 text-[var(--medflow-brand-1)]" />}
                {feature.icon === 'Lock' && <Lock className="w-10 h-10 text-[var(--medflow-brand-1)]" />}
                {feature.icon === 'Award' && <Award className="w-10 h-10 text-[var(--medflow-brand-1)]" />}
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-4 group-hover:text-[var(--medflow-brand-1)] transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Certifications Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h3 className="text-3xl font-bold text-white mb-12">
            Certificări și conformitate
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {realData.security.certifications.map((cert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100,
                  damping: 15
                }}
                whileHover={{ 
                  scale: 1.05,
                  y: -4,
                  transition: { duration: 0.2 }
                }}
                className="group p-6 bg-white/5 backdrop-blur rounded-xl border border-white/10 hover:border-[var(--medflow-brand-1)]/30 transition-all duration-300"
              >
                <div className={`text-2xl font-bold mb-2 ${cert.color} group-hover:text-[var(--medflow-brand-1)] transition-colors duration-300`}>
                  {cert.status}
                </div>
                <div className="text-white font-semibold mb-3 group-hover:text-[var(--medflow-brand-1)] transition-colors duration-300">
                  {cert.label}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {cert.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* GDPR Compliance Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-[var(--medflow-brand-1)]/10 via-[var(--medflow-brand-6)]/10 to-[var(--medflow-brand-4)]/10 rounded-2xl p-8 border border-[var(--medflow-brand-1)]/30"
        >
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">100% Conformitate GDPR</h3>
              </div>
              <p className="text-white/90 text-lg leading-relaxed mb-6">
                Respectăm toate reglementările GDPR pentru protecția datelor medicale. Fiecare pacient are controlul total asupra informațiilor sale personale.
              </p>
              <ul className="space-y-3">
                {[
                  'Consimțământ explicit pentru procesarea datelor',
                  'Dreptul la ștergerea datelor (right to be forgotten)',
                  'Portabilitatea datelor în format standardizat',
                  'Audit complet și documentație transparentă',
                  'Notificări imediate în caz de incidente de securitate'
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-3 text-white/80"
                  >
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-[var(--medflow-brand-6)] to-[var(--medflow-brand-4)] rounded-xl p-6 text-white">
                <h4 className="text-xl font-bold mb-4">Măsuri de securitate implementate</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                    <span>Criptare AES-256</span>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                    <span>Autentificare 2FA</span>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                    <span>Backup automat</span>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                    <span>Monitorizare 24/7</span>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}
