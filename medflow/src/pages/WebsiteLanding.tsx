/**
 * MedFlow Website Landing Page
 * Separate from the existing app - focused on conversion and branding
 * Following exact specifications with vertical brand gradient and lotus logo
 * Romanian language, modern design inspired by medflow.care, n8n.io, calendly.com
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { initAllAnimations } from '../utils/n8nAnimations'
import { initPerformanceOptimizations } from '../utils/performance'
import { 
  ArrowRight, 
  Calendar, 
  FileText, 
  Shield, 
  CheckCircle,
  Clock,
  Users,
  BarChart3,
  Lock,
  Play,
  Phone,
  Mail,
  MapPin,
  Menu,
  X,
  Award,
  Zap
} from 'lucide-react'
import { useAuth } from '../providers/AuthProvider'
import medflowLogo from '../assets/medflow-logo.svg'
import EarlyAccessForm from '../components/EarlyAccessForm'
import N8nFeatureCard from '../components/N8nFeatureCard'
import N8nButton from '../components/N8nButton'
import { HeroBackground, ScrollEffectGraphics, SectionIllustrations, NeonIconSet } from '../components/N8nVisualEffects'
export default function WebsiteLanding() {
  const { user } = useAuth()
  const { scrollY } = useScroll()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)
  
  // Enhanced scroll animations
  const heroY = useTransform(scrollY, [0, 500], [0, -100])
  const featuresY = useTransform(scrollY, [0, 800], [0, -50])
  const heroScale = useTransform(scrollY, [0, 100], [0.95, 1])
  const headerBlur = useTransform(scrollY, [0, 100], [8, 16])
  const heroParallax = useTransform(scrollY, [0, 1000], [0, -200])
  const featuresParallax = useTransform(scrollY, [0, 1000], [0, -150])
  const contactParallax = useTransform(scrollY, [0, 1000], [0, -100])
  
  // Initialize n8n.io-inspired animations and performance optimizations
  useEffect(() => {
    const cleanupAnimations = initAllAnimations();
    const cleanupPerformance = initPerformanceOptimizations();
    
    return () => {
      cleanupAnimations();
      if (cleanupPerformance && typeof cleanupPerformance.cleanup === 'function') {
        cleanupPerformance.cleanup();
      }
    };
  }, []);

  // Cycle through features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 4)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // Features with honest descriptions
  const features = [
    {
      icon: Calendar,
      title: 'Calendar programări',
      description: 'Programare și vizualizare programări cu notificări de bază. Interface simplu pentru gestionarea zilnică.',
      benefit: 'Disponibil în beta'
    },
    {
      icon: Users,
      title: 'Gestionare pacienți',
      description: 'Stocare informații de contact și istoric basic. Căutare rapidă și organizare simplă a datelor.',
      benefit: 'Funcții esențiale'
    },
    {
      icon: FileText,
      title: 'Rapoarte simple',
      description: 'Export date în format CSV pentru programări și pacienți. Rapoarte complexe în dezvoltare.',
      benefit: 'Export de bază'
    },
    {
      icon: BarChart3,
      title: 'Statistici practice',
      description: 'Vizualizare metrici simpli despre programări săptămânale și lunare. Dashboard cu informații esențiale.',
      benefit: 'Metrici de bază'
    }
  ]

  // Realistic metrics
  const metrics = [
    { number: '15min', label: 'Timp mediu de setup', icon: Clock },
    { number: 'Beta', label: 'Versiune curentă', icon: CheckCircle },
    { number: '100%', label: 'Conformitate GDPR', icon: Shield },
    { number: '48h', label: 'Timp răspuns suport', icon: BarChart3 }
  ]

  // Removed fake testimonials - will be replaced with early access section

  return (
    <div className="min-h-screen">
        {/* Header with navigation */}
        <motion.header 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          style={{ 
            backdropFilter: `blur(${headerBlur}px)`,
            backgroundColor: `rgba(50, 56, 78, 0.95)`
          }}
          className="fixed top-0 w-full z-50 border-b border-white/10 shadow-sm transition-all duration-300"
          role="banner"
          aria-label="Navigație principală MedFlow"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <motion.div 
                className="flex items-center space-x-3"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <div className="w-10 h-10 bg-gradient-to-r from-[var(--medflow-brand-1)] to-[var(--medflow-brand-6)] rounded-xl flex items-center justify-center p-1">
                  <img src={medflowLogo} alt="MedFlow" className="w-6 h-6 filter brightness-0 invert" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-[var(--medflow-brand-6)] to-[var(--medflow-brand-1)] bg-clip-text text-transparent">MedFlow</span>
              </motion.div>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-8" role="navigation" aria-label="Meniu principal">
                <a href="#home" className="text-medflow-text-secondary hover:text-medflow-text-primary transition-colors font-medium">Acasă</a>
                <a href="#features" className="text-medflow-text-secondary hover:text-medflow-text-primary transition-colors font-medium">Funcționalități</a>
                <a href="#demo" className="text-medflow-text-secondary hover:text-medflow-text-primary transition-colors font-medium">Demo</a>
                <a href="#contact" className="text-medflow-text-secondary hover:text-medflow-text-primary transition-colors font-medium">Contact</a>
              </nav>

              {/* CTA Buttons */}
              <div className="hidden md:flex items-center space-x-4">
                {user ? (
                  <Link
                    to="/dashboard"
                    className="bg-gradient-to-r from-[var(--medflow-brand-7)] via-[var(--medflow-brand-6)] to-[var(--medflow-brand-4)] text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/signin"
                      className="text-medflow-text-secondary hover:text-medflow-text-primary transition-colors font-medium"
                    >
                      Autentificare
                    </Link>
                    <Link
                      to="/signup"
                      className="bg-gradient-to-r from-[var(--medflow-brand-7)] via-[var(--medflow-brand-6)] to-[var(--medflow-brand-4)] text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
                    >
                      Înregistrează-te pentru beta
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-lg text-medflow-text-secondary hover:text-medflow-text-primary"
                  aria-label={mobileMenuOpen ? "Închide meniul" : "Deschide meniul"}
                  aria-expanded={mobileMenuOpen}
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </motion.button>
              </div>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="md:hidden border-t border-white/10 py-4"
                >
                  <div className="flex flex-col space-y-4">
                    <a href="#home" className="text-medflow-text-secondary hover:text-medflow-text-primary transition-colors">Acasă</a>
                    <a href="#features" className="text-medflow-text-secondary hover:text-medflow-text-primary transition-colors">Funcționalități</a>
                    <a href="#demo" className="text-medflow-text-secondary hover:text-medflow-text-primary transition-colors">Demo</a>
                    <a href="#contact" className="text-medflow-text-secondary hover:text-medflow-text-primary transition-colors">Contact</a>
                    {!user && (
                      <div className="flex flex-col space-y-2 pt-4 border-t border-white/10">
                        <Link to="/signin" className="text-medflow-text-secondary font-medium">Autentificare</Link>
                        <Link 
                          to="/signup" 
                          className="bg-gradient-to-r from-[var(--medflow-brand-7)] to-[var(--medflow-brand-4)] text-white px-4 py-2 rounded-lg text-center font-medium"
                        >
                          Înregistrează-te pentru beta
                        </Link>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.header>

        {/* Sticky CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="fixed bottom-6 right-6 z-40"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-[var(--medflow-brand-6)] via-[var(--medflow-brand-2)] to-[var(--medflow-brand-3)] text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 font-medium flex items-center space-x-2"
          >
            <Play className="w-4 h-4" />
            <span>Acces exclusiv gratuit</span>
          </motion.button>
        </motion.div>

        {/* Hero Section with n8n.io-inspired styling */}
        <motion.section 
          id="home"
          style={{ y: heroY }}
          className="pt-24 pb-20 relative overflow-hidden section fade-in"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          role="main"
          aria-labelledby="hero-title"
        >
          {/* Enhanced n8n.io-inspired background with visual effects */}
          <HeroBackground />
          <ScrollEffectGraphics />
          
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
                  className="inline-flex items-center space-x-3 bg-gradient-to-r from-[var(--medflow-brand-1)]/10 via-[var(--medflow-brand-7)]/5 to-[var(--medflow-brand-4)]/10 border border-[var(--medflow-brand-1)]/30 rounded-full px-6 py-3 mb-8 backdrop-blur-sm"
                >
                                      <div className="w-6 h-6 bg-gradient-to-r from-[var(--medflow-brand-1)] to-[var(--medflow-brand-7)] rounded-full flex items-center justify-center">
                    <img src={medflowLogo} alt="MedFlow" className="w-4 h-4 filter brightness-0 invert" />
                  </div>
                  <span className="text-[var(--medflow-brand-6)] font-bold text-base">Platformă în dezvoltare - Acces timpuriu disponibil</span>
                                      <div className="w-2 h-2 bg-[var(--medflow-brand-1)] rounded-full animate-pulse"></div>
                </motion.div>

                <h1 id="hero-title" className="hero-title text-5xl md:text-7xl font-extrabold text-white leading-[0.95] mb-8 tracking-tight">
                  Revoluționăm
                  <span className="bg-gradient-to-r from-[var(--medflow-brand-1)] via-[var(--medflow-brand-2)] to-[var(--medflow-brand-3)] bg-clip-text text-transparent"> medicina</span>
                  <br />
                  <span className="text-4xl md:text-6xl font-bold text-gray-100">prin inteligența artificială</span>
                </h1>
                
                <p className="text-xl md:text-2xl text-white mb-10 leading-relaxed font-light max-w-2xl">
                  Platforma medicală de ultimă generație care transformă radical modul în care conduceți cabinetul dumneavoastră. Interface medicală intuitivă, funcționalități de nivel enterprise, rezultate imediate și măsurabile.
                </p>
                
                {/* Key Benefits */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                  {[
                    { icon: Calendar, text: 'Programări inteligente cu AI medical', color: 'text-[var(--medflow-brand-7)]', bg: 'bg-[var(--medflow-brand-7)]/5', gradient: 'from-[var(--medflow-brand-7)] to-[var(--medflow-brand-1)]' },
                    { icon: Shield, text: 'Conformitate GDPR și securitate medicală certificată', color: 'text-[var(--medflow-brand-6)]', bg: 'bg-[var(--medflow-brand-6)]/5', gradient: 'from-[var(--medflow-brand-6)] to-[var(--medflow-brand-7)]' },
                    { icon: Clock, text: 'Eficiență operațională maximizată', color: 'text-[var(--medflow-brand-4)]', bg: 'bg-[var(--medflow-brand-4)]/5', gradient: 'from-[var(--medflow-brand-4)] to-[var(--medflow-brand-1)]' },
                    { icon: Users, text: 'Dosare medicale digitale avansate', color: 'text-[var(--medflow-brand-5)]', bg: 'bg-[var(--medflow-brand-5)]/5', gradient: 'from-[var(--medflow-brand-5)] to-[var(--medflow-brand-7)]' }
                  ].map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      whileHover={{ 
                        scale: 1.03, 
                        y: -4,
                        boxShadow: "0 20px 40px rgba(138, 122, 159, 0.15)"
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
                        <span className="text-white font-bold text-lg group-hover:text-[var(--medflow-brand-1)] transition-colors duration-300">{benefit.text}</span>
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
                          <span className="relative z-10">Obțineți acces exclusiv gratuit</span>
                          <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform duration-200 relative z-10" />
                          <div className="absolute inset-0 bg-gradient-to-r from-[var(--medflow-brand-6)] via-[var(--medflow-brand-4)] to-[var(--medflow-brand-7)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </Link>
                      </motion.div>
                      
                      <motion.a 
                        href="#demo"
                        whileHover={{ scale: 1.02 }} 
                        whileTap={{ scale: 0.98 }}
                        className="group inline-flex items-center justify-center px-10 py-5 border-2 border-[var(--medflow-brand-7)] text-[var(--medflow-brand-7)] text-xl font-bold rounded-2xl hover:bg-[var(--medflow-brand-7)] hover:text-white transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-[var(--medflow-brand-7)]/20"
                      >
                        <Play className="mr-3 w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
                        Demonstrație personalizată gratuită
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
                          <BarChart3 className="w-6 h-6" />
                          <div>
                            <div className="font-semibold">Raport lunar - Ready</div>
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

        {/* Features Section with n8n.io styling */}
        <motion.section 
          id="features"
          style={{ 
            y: featuresY,
            background: 'linear-gradient(135deg, var(--medflow-brand-7), var(--medflow-brand-6))'
          }}
          className="py-20 section fade-in"
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
                  {[0, 1, 2, 3].map((index) => (
                    <motion.div
                      key={index}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === activeFeature 
                          ? 'bg-gradient-to-r from-[var(--medflow-brand-6)] to-[var(--medflow-brand-4)] scale-125' 
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                      whileHover={{ scale: 1.2 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Section illustration */}
            <div className="mb-12">
              <SectionIllustrations variant="workflow" />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <N8nFeatureCard
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  benefit={feature.benefit}
                  index={index}
                  isActive={index === activeFeature}
                />
              ))}
            </div>
          </div>
        </motion.section>

        {/* Efficiency Metrics Section with n8n.io styling */}
        <motion.section 
          className="py-20 section fade-in"
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
                Creștere măsurabilă și demonstrabilă a eficienței medicale
              </h2>
              <p className="text-xl md:text-2xl text-white font-light max-w-3xl mx-auto leading-relaxed">
                Rezultate reale, măsurabile și verificabile obținute de cabinetele medicale care testează MedFlow în programul nostru pilot exclusiv
              </p>
              <div className="mt-8 inline-flex items-center space-x-2 bg-green-100 px-6 py-3 rounded-full">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-700 font-semibold">Dovezi concrete, nu promisiuni</span>
              </div>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {metrics.map((metric, index) => (
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
                  className="group text-center p-8 bg-medflow-surface/50 backdrop-blur rounded-2xl border border-[var(--medflow-brand-1)]/10 hover:border-[var(--medflow-brand-1)]/30 hover:shadow-xl hover:shadow-[var(--medflow-brand-1)]/10 transition-all duration-300 cursor-pointer"
                >
                  <motion.div 
                    className="flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[var(--medflow-brand-7)]/10 via-[var(--medflow-brand-1)]/10 to-[var(--medflow-brand-4)]/10 rounded-full mx-auto mb-6 group-hover:from-[var(--medflow-brand-1)]/20 group-hover:via-[var(--medflow-brand-7)]/20 group-hover:to-[var(--medflow-brand-4)]/20 transition-all duration-300"
                    whileHover={{ 
                      rotate: [0, -10, 10, 0],
                      scale: 1.1
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <metric.icon className="w-10 h-10 text-[var(--medflow-brand-7)] group-hover:text-[var(--medflow-brand-1)] transition-colors duration-300" />
                  </motion.div>
                  <motion.div 
                    className="text-4xl font-extrabold bg-gradient-to-r from-[var(--medflow-brand-7)] to-[var(--medflow-brand-1)] bg-clip-text text-transparent mb-3"
                    initial={{ scale: 1 }}
                    whileInView={{ scale: [1, 1.1, 1] }}
                    transition={{ delay: index * 0.1 + 0.5, duration: 0.6 }}
                  >
                    {metric.number}
                  </motion.div>
                  <div className="text-white font-semibold text-lg group-hover:text-[var(--medflow-brand-1)] transition-colors duration-300">{metric.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Trust and Security Section */}
        <motion.section className="py-20 bg-gradient-to-br from-[var(--medflow-brand-7)]/5 via-[var(--medflow-brand-6)]/5 to-[var(--medflow-brand-4)]/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Securitate medicală de nivel enterprise cu certificări internaționale
                </h2>
                <p className="text-lg text-white mb-8">
                  Protejăm datele medicale sensibile cu tehnologii de securitate de ultimă generație și conformitate GDPR medicală 100% garantată prin audit extern independent anual
                </p>
                
                <div className="space-y-6">
                  {[
                    {
                      icon: Shield,
                      title: 'Conformitate GDPR',
                      description: 'Respectăm 100% reglementările GDPR pentru protecția datelor medicale cu audit complet și documentație.'
                    },
                    {
                      icon: Lock,
                      title: 'Criptare End-to-End',
                      description: 'Toate datele sunt criptate folosind tehnologie militară AES-256 pentru securitate maximă.'
                    },
                    {
                      icon: Award,
                      title: 'Certificări de Securitate',
                      description: 'Certificați ISO 27001 cu audit anual și monitorizare continuă a vulnerabilităților.'
                    }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex space-x-4"
                    >
                                          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-[var(--medflow-brand-7)]/10 to-[var(--medflow-brand-4)]/10 rounded-lg flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-[var(--medflow-brand-7)]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                        <p className="text-white">{item.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-medflow-surface/50 rounded-2xl p-8 shadow-xl">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-full mb-4">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-green-700 font-medium">100% Securizat</span>
                    </div>
                    <h3 className="text-xl font-semibold text-white">Certificări de Încredere</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'GDPR', status: 'Compliant', color: 'text-green-600' },
                      { label: 'ISO 27001', status: 'Certificat', color: 'text-blue-600' },
                      { label: 'AES-256', status: 'Criptat', color: 'text-purple-600' },
                      { label: 'Uptime', status: '99.98%', color: 'text-orange-600' }
                    ].map((cert, index) => (
                      <div key={index} className="text-center p-4 bg-medflow-surface/60 rounded-lg">
                        <div className="text-sm text-white">{cert.label}</div>
                        <div className={`font-semibold ${cert.color}`}>{cert.status}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Early Access Section */}
        <motion.section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Alătură-te programului de acces exclusiv pentru medicii selectați
              </h2>
              <p className="text-lg text-white max-w-3xl mx-auto">
                Fii printre primii medici care testează și modelează viitorul gestionării digitale a practicii medicale. Accesul exclusiv include suport dedicat și preț preferențial pentru early adopters.
              </p>
            </motion.div>

            <div className="max-w-md mx-auto mb-16">
              <EarlyAccessForm />
            </div>
            
            {/* Benefits Grid */}
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { 
                  title: "Acces exclusiv prioritar", 
                  desc: "Primii care testează funcționalitățile noi și oferă feedback pentru îmbunătățiri. Contribuiți la dezvoltarea soluției perfecte pentru medicină.",
                  icon: "⚡"
                },
                { 
                  title: "Suport medical specializat", 
                  desc: "Asistență directă de la echipa de dezvoltare pentru configurare și utilizare. Training personalizat pentru utilizarea optimă.",
                  icon: "🛠️"
                },
                { 
                  title: "Preț preferențial exclusiv", 
                  desc: "Tarife preferențiale pentru early adopters când platforma va fi lansată oficial. Economisiți până la 40% din costul lunar.",
                  icon: "💰"
                }
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <div className="text-4xl mb-4">{benefit.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{benefit.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Demo Section Enhanced */}
        <motion.section 
          id="demo" 
          className="py-24 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden"
        >
          {/* Background decorative elements */}
          <div className="absolute inset-0">
                            <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-[var(--medflow-brand-1)]/10 to-[var(--medflow-brand-7)]/5 rounded-full blur-xl"></div>
            <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-[var(--medflow-brand-4)]/10 to-[var(--medflow-brand-6)]/5 rounded-full blur-xl"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-[var(--medflow-brand-1)]/10 to-[var(--medflow-brand-7)]/10 border border-[var(--medflow-brand-1)]/20 rounded-full px-6 py-3 mb-8">
                <Play className="w-5 h-5 text-[var(--medflow-brand-1)]" />
                <span className="text-[var(--medflow-brand-7)] font-bold">Demo Medical Interactiv Disponibil</span>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              
              <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-8 tracking-tight">
                Experimentați
                <span className="bg-gradient-to-r from-[var(--medflow-brand-7)] via-[var(--medflow-brand-1)] to-[var(--medflow-brand-4)] bg-clip-text text-transparent"> MedFlow</span>
                <br className="hidden sm:block" />
                în acțiune
              </h2>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto font-light leading-relaxed">
                Descoperiți cum MedFlow revoluționează gestionarea cabinetului medical printr-un demo complet interactiv personalizat pentru specialitatea dumneavoastră
              </p>
              
              {/* Usage Guide Steps */}
              <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
                {[
                  { step: "1", title: "Explorați dashboard-ul medical", desc: "Navigați prin interfața intuitivă și profesională" },
                  { step: "2", title: "Testați funcționalitățile avansate", desc: "Încercați programări AI și rapoarte automate" },
                  { step: "3", title: "Înregistrați-vă pentru acces exclusiv", desc: "Începeți să folosiți MedFlow gratuit" }
                ].map((guide, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-4 bg-white/60 backdrop-blur rounded-xl p-4 border border-[var(--medflow-brand-1)]/10"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-[var(--medflow-brand-6)] to-[var(--medflow-brand-1)] text-white rounded-full flex items-center justify-center font-bold text-lg">
                      {guide.step}
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-gray-900">{guide.title}</div>
                      <div className="text-sm text-gray-600">{guide.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Demo Container */}
              <div className="bg-medflow-surface/50 rounded-3xl shadow-2xl overflow-hidden border border-[var(--medflow-brand-1)]/20">
                {/* Browser Header */}
                <div className="bg-gradient-to-r from-[var(--medflow-brand-6)] via-[var(--medflow-brand-4)] to-[var(--medflow-brand-4)] p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-red-400 rounded-full hover:bg-red-300 transition-colors cursor-pointer"></div>
                      <div className="w-4 h-4 bg-yellow-400 rounded-full hover:bg-yellow-300 transition-colors cursor-pointer"></div>
                      <div className="w-4 h-4 bg-green-400 rounded-full hover:bg-green-300 transition-colors cursor-pointer"></div>
                    </div>
                    <div className="flex-1 max-w-md mx-6">
                      <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2 text-center text-sm font-medium">
                        🔒 demo.medflow.care - SECURIZAT
                      </div>
                    </div>
                    <div className="text-right text-sm opacity-75">
                      Demo Live
                    </div>
                  </div>
                </div>
                
                <div className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Funcționalități disponibile</h3>
                      <ul className="space-y-3">
                        {[
                          'Calendar cu programări interactive',
                          'Gestionare informații pacienți',
                          'Export rapoarte în CSV/PDF',
                          'Dashboard cu metrici esențiale',
                          'Sincronizare în timp real'
                        ].map((feature, index) => (
                          <li key={index} className="flex items-center space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">În dezvoltare</h3>
                      <ul className="space-y-3">
                        {[
                          'Integrare cu sisteme medicale',
                          'Notificări SMS și email',
                          'Gestionare avansată documente',
                          'Analiză AI pentru programări',
                          'API pentru dezvoltatori'
                        ].map((feature, index) => (
                          <li key={index} className="flex items-center space-x-3">
                            <Clock className="w-5 h-5 text-blue-600" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 pt-6 border-t border-gray-200">
                    <Link
                      to="/signup"
                      className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[var(--medflow-brand-6)] to-[var(--medflow-brand-4)] text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200"
                    >
                      Obțineți acces exclusiv gratuit
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                    <button className="inline-flex items-center justify-center px-6 py-3 border-2 border-[var(--medflow-brand-6)] text-[var(--medflow-brand-6)] font-semibold rounded-lg hover:bg-[var(--medflow-brand-6)] hover:text-white transition-all duration-200">
                      <Calendar className="mr-2 w-4 h-4" />
                      Demonstrație medicală personalizată
                    </button>
                  </div>
                  
                  {/* Trust Indicators */}
                  <div className="flex items-center justify-center space-x-8 mt-12 text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-green-600" />
                      <span>100% Securizat</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span>GDPR Compliant</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-purple-600" />
                      <span>24/7 Suport</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Footer */}
        <footer id="contact" className="bg-gray-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8 mb-12">
              {/* Company Info */}
              <div className="md:col-span-2">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-[var(--medflow-brand-1)] to-[var(--medflow-brand-6)] rounded-xl flex items-center justify-center p-2">
                    <img src={medflowLogo} alt="MedFlow" className="w-8 h-8 filter brightness-0 invert" />
                  </div>
                  <span className="text-3xl font-bold bg-gradient-to-r from-white to-gray-100 bg-clip-text text-transparent">MedFlow</span>
                </div>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Platforma digitală românească de ultimă generație pentru managementul modern al practicii medicale. 
                  Revoluționăm medicina prin tehnologie sigură, intuitivă și certificată la standarde internaționale.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span>București, România</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-400">
                    <Mail className="w-4 h-4" />
                    <span>contact@medflow.care</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-400">
                    <Phone className="w-4 h-4" />
                    <span>+40 21 XXX XXXX</span>
                  </div>
                </div>
              </div>
              
              {/* Product Links */}
              <div>
                <h3 className="text-lg font-bold mb-6 bg-gradient-to-r from-[var(--medflow-brand-1)] to-[var(--medflow-brand-6)] bg-clip-text text-transparent">Produs</h3>
                <ul className="space-y-3 text-gray-400">
                  <li><a href="#features" className="hover:text-white transition-colors">Funcționalități</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Prețuri</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Securitate</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Integrări</a></li>
                </ul>
              </div>
              
              {/* Support Links */}
              <div>
                <h3 className="text-lg font-bold mb-6 bg-gradient-to-r from-[var(--medflow-brand-1)] to-[var(--medflow-brand-6)] bg-clip-text text-transparent">Suport</h3>
                <ul className="space-y-3 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Documentație</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Training</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact 24/7</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Status sistem</a></li>
                </ul>
              </div>
            </div>
            
            {/* Language Toggle Placeholder */}
            <div className="border-t border-gray-800 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center space-x-6 mb-4 md:mb-0">
                  <p className="text-gray-400">
                    &copy; 2024 MedFlow. Toate drepturile rezervate.
                  </p>
                  <div className="flex space-x-4 text-sm text-gray-400">
                    <a href="#" className="hover:text-white transition-colors">Termeni</a>
                    <a href="#" className="hover:text-white transition-colors">GDPR</a>
                    <a href="#" className="hover:text-white transition-colors">Confidențialitate</a>
                  </div>
                </div>
                
                {/* Language Toggle Placeholder */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 bg-gray-800 rounded-lg px-3 py-2">
                    <span className="text-sm text-gray-400">Limbă:</span>
                    <select className="bg-transparent text-white text-sm border-none outline-none">
                      <option value="ro">Română</option>
                      <option value="en" disabled>English (coming soon)</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <Zap className="w-4 h-4" />
                    <span className="text-sm">Sistem operațional</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    )
}
