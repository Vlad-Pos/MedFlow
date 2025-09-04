import { motion, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Calendar, Shield, Clock, Users } from 'lucide-react'
import { useAuth } from '../../providers/AuthProvider'
import medflowLogo from '../../assets/medflow-logo.svg'
import realData from '../data/realData.json'

interface HeroSectionProps {
  className?: string
}

export default function HeroSection({ className = '' }: HeroSectionProps) {
  const { user } = useAuth()
  const { scrollY } = useScroll()
  
  // Enhanced scroll animations
  const heroY = useTransform(scrollY, [0, 500], [0, -100])
  const heroScale = useTransform(scrollY, [0, 100], [0.95, 1])
  const heroParallax = useTransform(scrollY, [0, 1000], [0, -200])

  const benefits = [
    { icon: Calendar, text: 'Programări inteligente cu AI', color: 'text-[var(--medflow-brand-6)]', bg: 'bg-[var(--medflow-brand-6)]/5', gradient: 'from-[var(--medflow-brand-6)] to-[var(--medflow-brand-1)]' },
    { icon: Shield, text: 'Conformitate GDPR garantată', color: 'text-[var(--medflow-brand-5)]', bg: 'bg-[var(--medflow-brand-5)]/5', gradient: 'from-[var(--medflow-brand-5)] to-[var(--medflow-brand-6)]' },
    { icon: Clock, text: 'Eficiență maximizată', color: 'text-[var(--medflow-brand-4)]', bg: 'bg-[var(--medflow-brand-4)]/5', gradient: 'from-[var(--medflow-brand-4)] to-[var(--medflow-brand-1)]' },
    { icon: Users, text: 'Dosare medicale digitale', color: 'text-[var(--medflow-brand-3)]', bg: 'bg-[var(--medflow-brand-3)]/5', gradient: 'from-[var(--medflow-brand-3)] to-[var(--medflow-brand-6)]' }
  ]

  return (
    <motion.section 
      id="home"
      style={{ y: heroY }}
      className={`pt-24 pb-20 relative overflow-hidden ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      role="main"
      aria-labelledby="hero-title"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-[var(--medflow-brand-1)]/10 to-[var(--medflow-brand-6)]/5 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-[var(--medflow-brand-4)]/10 to-[var(--medflow-brand-5)]/5 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-[var(--medflow-brand-6)]/5 to-[var(--medflow-brand-1)]/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center space-x-3 bg-gradient-to-r from-[var(--medflow-brand-1)]/10 via-[var(--medflow-brand-6)]/5 to-[var(--medflow-brand-4)]/10 border border-[var(--medflow-brand-1)]/30 rounded-full px-6 py-3 mb-8 backdrop-blur-sm"
            >
              <div className="w-6 h-6 bg-gradient-to-r from-[var(--medflow-brand-1)] to-[var(--medflow-brand-6)] rounded-full flex items-center justify-center">
                <img src={medflowLogo} alt="MedFlow" className="w-4 h-4 filter brightness-0 invert" />
              </div>
              <span className="text-[var(--medflow-brand-6)] font-bold text-base">{realData.company.status}</span>
              <div className="w-2 h-2 bg-[var(--medflow-brand-1)] rounded-full animate-pulse"></div>
            </motion.div>

            <h1 id="hero-title" className="text-5xl md:text-7xl font-extrabold text-white leading-[0.95] mb-8 tracking-tight">
              {realData.company.tagline.split(' ').map((word, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className={index === 1 ? 'bg-gradient-to-r from-[var(--medflow-brand-2)] via-[var(--medflow-brand-3)] to-[var(--medflow-brand-4)] bg-clip-text text-transparent' : ''}
                >
                  {word}{' '}
                </motion.span>
              ))}
            </h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-xl md:text-2xl text-white mb-10 leading-relaxed font-light max-w-2xl"
            >
              {realData.company.description}
            </motion.p>
            
            {/* Key Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ 
                    scale: 1.03, 
                    y: -4,
                    boxShadow: "0 20px 40px rgba(159, 134, 177, 0.15)"
                  }}
                  className={`group flex items-center space-x-4 p-6 rounded-2xl ${benefit.bg} border border-transparent hover:border-[var(--medflow-brand-1)]/30 transition-all duration-300 cursor-pointer relative overflow-hidden`}
                >
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${benefit.gradient}/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  
                  <div className="relative z-10 flex items-center space-x-4">
                    <motion.div 
                      className={`w-12 h-12 bg-gradient-to-r ${benefit.gradient}/10 rounded-xl flex items-center justify-center group-hover:${benefit.gradient}/20 transition-all duration-300`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <benefit.icon className={`w-6 h-6 ${benefit.color} group-hover:text-[var(--medflow-brand-1)] transition-colors duration-300`} />
                    </motion.div>
                    <span className="text-white font-bold text-lg group-hover:text-[var(--medflow-brand-2)] transition-colors duration-300">{benefit.text}</span>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6">
              {user ? (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/dashboard"
                    className="group inline-flex items-center justify-center px-10 py-5 bg-gradient-to-r from-[var(--medflow-brand-7)] via-[var(--medflow-brand-6)] to-[var(--medflow-brand-4)] text-white text-xl font-bold rounded-2xl hover:shadow-2xl hover:shadow-[var(--medflow-brand-7)]/25 transition-all duration-300 transform hover:-translate-y-1"
                  >
                    Acces Dashboard
                    <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                </motion.div>
              ) : (
                <>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      to="/signup"
                      className="group inline-flex items-center justify-center px-10 py-5 bg-gradient-to-r from-[var(--medflow-brand-7)] via-[var(--medflow-brand-6)] to-[var(--medflow-brand-4)] text-white text-xl font-bold rounded-2xl hover:shadow-2xl hover:shadow-[var(--medflow-brand-7)]/25 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden"
                    >
                      <span className="relative z-10">Acces timpuriu gratuit</span>
                      <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform duration-200 relative z-10" />
                      <div className="absolute inset-0 bg-gradient-to-r from-[var(--medflow-brand-5)] via-[var(--medflow-brand-4)] to-[var(--medflow-brand-6)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </Link>
                  </motion.div>
                  
                  <motion.a 
                    href="#demo"
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }}
                    className="group inline-flex items-center justify-center px-10 py-5 border-2 border-[var(--medflow-brand-6)] text-[var(--medflow-brand-6)] text-xl font-bold rounded-2xl hover:bg-[var(--medflow-brand-6)] hover:text-white transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-[var(--medflow-brand-6)]/20"
                  >
                    Testează platforma gratuit
                  </motion.a>
                </>
              )}
            </div>
          </motion.div>
          
          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-br from-[var(--medflow-brand-7)] via-[var(--medflow-brand-6)] to-[var(--medflow-brand-4)] p-8 text-white">
                {/* Browser controls */}
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <div className="ml-4 bg-white/20 rounded px-3 py-1 text-xs">medflow.care</div>
                </div>
                
                <div className="space-y-4">
                  {/* Calendar card */}
                  <motion.div
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="bg-white/10 backdrop-blur rounded-lg p-4"
                  >
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-6 h-6" />
                      <div>
                        <div className="font-semibold">15 programări astăzi</div>
                        <div className="text-white/80">3 urgențe programate</div>
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Patients card */}
                  <motion.div
                    animate={{ x: [-2, 2, -2] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="bg-white/10 backdrop-blur rounded-lg p-4"
                  >
                    <div className="flex items-center space-x-3">
                      <Users className="w-6 h-6" />
                      <div>
                        <div className="font-semibold">284 pacienți activi</div>
                        <div className="text-white/80">7 dosare noi săptămâna aceasta</div>
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Reports card */}
                  <motion.div
                    animate={{ y: [-1, 1, -1] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="bg-white/10 backdrop-blur rounded-lg p-4"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <div>
                        <div className="font-semibold">Raport lunar - Gata</div>
                        <div className="text-white/80">Submisie automată către DSP</div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}
