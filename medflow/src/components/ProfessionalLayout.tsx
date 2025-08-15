import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ScrollGradientBackground, 
  GlowButton, 
  FadeInSection,
  ScrollProgress,
  ParallaxSection,
  StaggeredList,
  FloatingElement,
  GradientText,
  TiltCard,
  AnimatedCounter,
  MagneticButton,
  TextReveal,
  AnimatedBackground
} from "./modules/ui";
import medflowLogo from "../assets/medflow-logo.svg";
import EnhancedPricing from "./modules/EnhancedPricing";
import EnhancedContact from "./modules/EnhancedContact";
import MobileNavigation from "./modules/MobileNavigation";

// Dark/Light mode toggle component
function ThemeToggle({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) {
  return (
    <motion.button
      onClick={onToggle}
      className="relative p-2 rounded-full bg-gray-800 dark:bg-gray-200 transition-colors duration-300"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="w-5 h-5"
        animate={{ rotate: isDark ? 0 : 180 }}
        transition={{ duration: 0.3 }}
      >
        {isDark ? (
          <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </motion.div>
    </motion.button>
  );
}

// Enhanced Header component
function EnhancedHeader({ 
  isDark, 
  onToggleTheme, 
  isMobileMenuOpen, 
  onToggleMobileMenu 
}: { 
  isDark: boolean; 
  onToggleTheme: () => void;
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}) {
  return (
    <motion.header 
      className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <img src={medflowLogo} alt="MedFlow" className="h-8 w-8" />
            <span className="text-xl font-bold text-white">MedFlow</span>
          </motion.div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <MagneticButton 
              className="text-gray-300 hover:text-white transition-colors duration-200 relative group"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Funcționalități
              <motion.span 
                className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full transition-all duration-300"
                initial={{ width: 0 }}
                whileHover={{ width: "100%" }}
              />
            </MagneticButton>
            <MagneticButton 
              className="text-gray-300 hover:text-white transition-colors duration-200 relative group"
              onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Demo
              <motion.span 
                className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full transition-all duration-300"
                initial={{ width: 0 }}
                whileHover={{ width: "100%" }}
              />
            </MagneticButton>
            <MagneticButton 
              className="text-gray-300 hover:text-white transition-colors duration-200 relative group"
              onClick={() => document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Testimoniale
              <motion.span 
                className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full transition-all duration-300"
                initial={{ width: 0 }}
                whileHover={{ width: "100%" }}
              />
            </MagneticButton>
            <MagneticButton 
              className="text-gray-300 hover:text-white transition-colors duration-200 relative group"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Contact
              <motion.span 
                className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full transition-all duration-300"
                initial={{ width: 0 }}
                whileHover={{ width: "100%" }}
              />
            </MagneticButton>
          </nav>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
            <GlowButton onClick={() => console.log("Sign up clicked")}>
              Începe Gratuit
            </GlowButton>
            <MobileNavigation isOpen={isMobileMenuOpen} onToggle={onToggleMobileMenu} />
          </div>
        </div>
      </div>
    </motion.header>
  );
}

// Enhanced Hero section
function EnhancedHero() {
  return (
    <section className="min-h-screen flex items-center justify-center pt-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <AnimatedBackground className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-pink-900/20"></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <FloatingElement key={i} duration={3 + Math.random() * 4}>
              <motion.div
                className="absolute w-1 h-1 bg-white/20 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.2, 0.6, 0.2],
                  scale: [1, 1.5, 1]
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </FloatingElement>
          ))}
        </div>
      </AnimatedBackground>
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <FadeInSection>
          <TextReveal delay={0.2}>
            <motion.h1 
              className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Gestionarea Programărilor{" "}
              <GradientText gradientColors={["from-purple-400", "via-pink-400", "to-blue-400"]}>
                Medicale, Simplificată
              </GradientText>
            </motion.h1>
          </TextReveal>
          
          <TextReveal delay={0.4}>
            <motion.p 
              className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Organizează-ți cabinetul medical cu programări inteligente, documente digitale și analitica în timp real. 
              Începe gratuit acum!
            </motion.p>
          </TextReveal>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <MagneticButton 
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg shadow-lg"
              onClick={() => console.log("Get started clicked")}
            >
              Începe Gratuit
            </MagneticButton>
            <MagneticButton 
              className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors"
              onClick={() => console.log("Demo clicked")}
            >
              Vezi Demo
            </MagneticButton>
          </motion.div>
          
          {/* Floating stats */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <FloatingElement duration={4}>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  <AnimatedCounter value={1000} />+
                </div>
                <div className="text-gray-300">Cabinete Active</div>
              </div>
            </FloatingElement>
            
            <FloatingElement duration={4.5}>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  <AnimatedCounter value={50000} />+
                </div>
                <div className="text-gray-300">Pacienți Gestionați</div>
              </div>
            </FloatingElement>
            
            <FloatingElement duration={5}>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  <AnimatedCounter value={99} />%
                </div>
                <div className="text-gray-300">Satisfacție Clienți</div>
              </div>
            </FloatingElement>
          </motion.div>
        </FadeInSection>
      </div>
    </section>
  );
}

// Features section with enhanced cards
function EnhancedFeatures() {
  const features = [
    {
      icon: "📅",
      title: "Programări Inteligente",
      description: "Sistem automat de programări cu confirmări și reamintiri"
    },
    {
      icon: "📊",
      title: "Analitica în Timp Real",
      description: "Dashboard interactiv cu statistici și rapoarte detaliate"
    },
    {
      icon: "🤖",
      title: "Chatbot Asistent",
      description: "Asistent virtual pentru pacienți și personal medical"
    },
    {
      icon: "📱",
      title: "Aplicație Mobilă",
      description: "Acces complet din orice dispozitiv, oricând"
    },
    {
      icon: "🔒",
      title: "Securitate HIPAA",
      description: "Conformitate completă cu standardele de securitate medicală"
    },
    {
      icon: "💳",
      title: "Facturare Integrată",
      description: "Sistem complet de facturare și plăți online"
    }
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <FadeInSection>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Funcționalități Avansate
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Toate instrumentele necesare pentru a-ți gestiona cabinetul medical eficient
            </p>
          </div>
        </FadeInSection>
        
        <StaggeredList staggerDelay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <TiltCard key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 group relative overflow-hidden">
                {/* Hover background effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                />
                
                {/* Icon with hover animation */}
                <motion.div 
                  className="text-4xl mb-4 relative z-10"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  {feature.icon}
                </motion.div>
                
                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-purple-300 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>
                
                {/* Hover border effect */}
                <motion.div
                  className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-purple-400/30 transition-all duration-300"
                  initial={{ borderColor: "rgba(255, 255, 255, 0.1)" }}
                  whileHover={{ borderColor: "rgba(168, 85, 247, 0.3)" }}
                />
              </TiltCard>
            ))}
          </div>
        </StaggeredList>
      </div>
    </section>
  );
}

// Product Demo section
function ProductDemo() {
  return (
    <section id="demo" className="py-20 px-4 sm:px-6 lg:px-8 bg-black/20">
      <div className="max-w-7xl mx-auto">
        <FadeInSection>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Vezi Cum Funcționează
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Interfața intuitivă care face gestionarea cabinetului medical simplă și eficientă
            </p>
          </div>
        </FadeInSection>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <ParallaxSection speed={0.3}>
            <FadeInSection>
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-white">Dashboard Principal</h3>
                <p className="text-gray-300 leading-relaxed">
                  Accesează rapid toate informațiile importante: programările zilei, 
                  statistici în timp real, și notificările urgente.
                </p>
                <StaggeredList staggerDelay={0.2}>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-center space-x-3">
                      <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                      <span>Vizualizare calendar interactiv</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                      <span>Gestionare pacienți centralizată</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                      <span>Rapoarte și analitica avansată</span>
                    </li>
                  </ul>
                </StaggeredList>
              </div>
            </FadeInSection>
          </ParallaxSection>
          
          <ParallaxSection speed={0.5}>
            <FadeInSection>
              <TiltCard className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-2xl p-8 border border-white/10">
                <div className="bg-gray-800 rounded-lg p-6 h-80 flex items-center justify-center relative overflow-hidden">
                  <FloatingElement duration={3}>
                    <div className="text-center text-gray-400">
                      <div className="text-6xl mb-4">📱</div>
                      <p className="text-lg">Demo Interactiv</p>
                      <p className="text-sm">În curând disponibil</p>
                    </div>
                  </FloatingElement>
                  
                  {/* Animated background elements */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-4 left-4 w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    <div className="absolute top-8 right-8 w-3 h-3 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                    <div className="absolute bottom-6 left-8 w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                  </div>
                </div>
              </TiltCard>
            </FadeInSection>
          </ParallaxSection>
        </div>
      </div>
    </section>
  );
}

// Testimonials section
function Testimonials() {
  const testimonials = [
    {
      name: "Dr. Maria Popescu",
      role: "Medic de Familie",
      content: "MedFlow mi-a transformat complet modul în care gestionez cabinetul. Programările se fac automat, iar pacienții sunt mult mai mulțumiți.",
      rating: 5
    },
    {
      name: "Dr. Alexandru Ionescu",
      role: "Cardiolog",
      content: "Interfața intuitivă și funcționalitățile avansate mă ajută să-mi concentrez atenția pe pacienți, nu pe administrație.",
      rating: 5
    },
    {
      name: "Dr. Elena Dumitrescu",
      role: "Pediatru",
      content: "De când folosesc MedFlow, am redus timpul petrecut cu administrația cu 70%. Recomand cu încredere!",
      rating: 5
    }
  ];

  return (
    <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <FadeInSection>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ce Spun Medicii
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Mii de medici au ales MedFlow pentru a-și moderniza practica medicală
            </p>
          </div>
        </FadeInSection>
        
        <StaggeredList staggerDelay={0.15}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TiltCard key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 group relative overflow-hidden">
                {/* Hover background effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                />
                
                {/* Rating stars with hover animation */}
                <div className="flex mb-4 relative z-10">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.span 
                      key={i} 
                      className="text-yellow-400 text-xl"
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      transition={{ duration: 0.2, delay: i * 0.1 }}
                    >
                      ⭐
                    </motion.span>
                  ))}
                </div>
                
                {/* Quote content */}
                <motion.p 
                  className="text-gray-300 mb-6 leading-relaxed relative z-10 group-hover:text-gray-200 transition-colors duration-300"
                  initial={{ opacity: 0.8 }}
                  whileHover={{ opacity: 1 }}
                >
                  "{testimonial.content}"
                </motion.p>
                
                {/* Author info */}
                <div className="relative z-10">
                  <motion.p 
                    className="font-semibold text-white group-hover:text-yellow-300 transition-colors duration-300"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    {testimonial.name}
                  </motion.p>
                  <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">
                    {testimonial.role}
                  </p>
                </div>
                
                {/* Hover border effect */}
                <motion.div
                  className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-yellow-400/30 transition-all duration-300"
                  initial={{ borderColor: "rgba(255, 255, 255, 0.1)" }}
                  whileHover={{ borderColor: "rgba(251, 191, 36, 0.3)" }}
                />
              </TiltCard>
            ))}
          </div>
        </StaggeredList>
      </div>
    </section>
  );
}

// Enhanced CTA section
function EnhancedCTA() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <FadeInSection>
          <motion.div
            className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-3xl p-12 border border-white/10 relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {/* Floating background elements */}
            <div className="absolute inset-0 overflow-hidden">
              <FloatingElement duration={6}>
                <motion.div
                  className="absolute top-8 right-8 w-16 h-16 bg-purple-500/20 rounded-full blur-xl"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.2, 0.4, 0.2]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </FloatingElement>
              
              <FloatingElement duration={8}>
                <motion.div
                  className="absolute bottom-8 left-8 w-12 h-12 bg-pink-500/20 rounded-full blur-xl"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.2, 0.3, 0.2]
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </FloatingElement>
              
              <FloatingElement duration={7}>
                <motion.div
                  className="absolute top-1/2 left-1/2 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl"
                  animate={{
                    scale: [1, 1.8, 1],
                    opacity: [0.1, 0.2, 0.1]
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </FloatingElement>
            </div>
            <TextReveal delay={0.2}>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Gata să Începi cu{" "}
                <GradientText gradientColors={["from-purple-400", "via-pink-400", "to-blue-400"]}>
                  MedFlow
                </GradientText>
                ?
              </h2>
            </TextReveal>
            
            <TextReveal delay={0.4}>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Alătură-te miilor de medici care au deja transformat practica lor medicală cu MedFlow
              </p>
            </TextReveal>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <MagneticButton 
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg shadow-lg"
                onClick={() => console.log("Start free trial clicked")}
              >
                Începe Perioada Gratuită
              </MagneticButton>
              <MagneticButton 
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors"
                onClick={() => console.log("Schedule demo clicked")}
              >
                Programează Demo
              </MagneticButton>
            </motion.div>
          </motion.div>
        </FadeInSection>
      </div>
    </section>
  );
}

// Enhanced Footer
function EnhancedFooter() {
  return (
    <footer className="py-16 px-4 sm:px-6 lg:px-8 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <StaggeredList staggerDelay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <FloatingElement duration={4}>
                <div className="flex items-center space-x-3 mb-4">
                  <img src={medflowLogo} alt="MedFlow" className="h-8 w-8" />
                  <span className="text-xl font-bold text-white">MedFlow</span>
                </div>
              </FloatingElement>
              
              <TextReveal delay={0.2}>
                <p className="text-gray-300 mb-4 max-w-md">
                  Soluția completă pentru gestionarea cabinetelor medicale moderne. 
                  Simplu, eficient, sigur.
                </p>
              </TextReveal>
              
              <div className="flex space-x-4">
                <FloatingElement duration={4.5}>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                    <span className="sr-only">Facebook</span>
                    📘
                  </a>
                </FloatingElement>
                <FloatingElement duration={5}>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                    <span className="sr-only">Twitter</span>
                    🐦
                  </a>
                </FloatingElement>
                <FloatingElement duration={5.5}>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                    <span className="sr-only">LinkedIn</span>
                    💼
                  </a>
                </FloatingElement>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Produs</h3>
              <StaggeredList staggerDelay={0.1}>
                <ul className="space-y-2 text-gray-300">
                  <li>
                    <motion.a 
                      href="#" 
                      className="hover:text-white transition-colors duration-200 relative group inline-block"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="relative">
                        Funcționalități
                        <motion.span 
                          className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full transition-all duration-300"
                          initial={{ width: 0 }}
                          whileHover={{ width: "100%" }}
                        />
                      </span>
                    </motion.a>
                  </li>
                  <li>
                    <motion.a 
                      href="#" 
                      className="hover:text-white transition-colors duration-200 relative group inline-block"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="relative">
                        Prețuri
                        <motion.span 
                          className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full transition-all duration-300"
                          initial={{ width: 0 }}
                          whileHover={{ width: "100%" }}
                        />
                      </span>
                    </motion.a>
                  </li>
                  <li>
                    <motion.a 
                      href="#" 
                      className="hover:text-white transition-colors duration-200 relative group inline-block"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="relative">
                        Demo
                        <motion.span 
                          className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full transition-all duration-300"
                          initial={{ width: 0 }}
                          whileHover={{ width: "100%" }}
                        />
                      </span>
                    </motion.a>
                  </li>
                  <li>
                    <motion.a 
                      href="#" 
                      className="hover:text-white transition-colors duration-200 relative group inline-block"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="relative">
                        API
                        <motion.span 
                          className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full transition-all duration-300"
                          initial={{ width: 0 }}
                          whileHover={{ width: "100%" }}
                        />
                      </span>
                    </motion.a>
                  </li>
                </ul>
              </StaggeredList>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Suport</h3>
              <StaggeredList staggerDelay={0.1}>
                <ul className="space-y-2 text-gray-300">
                  <li>
                    <motion.a 
                      href="#" 
                      className="hover:text-white transition-colors duration-200 relative group inline-block"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="relative">
                        Documentație
                        <motion.span 
                          className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full transition-all duration-300"
                          initial={{ width: 0 }}
                          whileHover={{ width: "100%" }}
                        />
                      </span>
                    </motion.a>
                  </li>
                  <li>
                    <motion.a 
                      href="#" 
                      className="hover:text-white transition-colors duration-200 relative group inline-block"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="relative">
                        Contact
                        <motion.span 
                          className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full transition-all duration-300"
                          initial={{ width: 0 }}
                          whileHover={{ width: "100%" }}
                        />
                      </span>
                    </motion.a>
                  </li>
                  <li>
                    <motion.a 
                      href="#" 
                      className="hover:text-white transition-colors duration-200 relative group inline-block"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="relative">
                        Status
                        <motion.span 
                          className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full transition-all duration-300"
                          initial={{ width: 0 }}
                          whileHover={{ width: "100%" }}
                        />
                      </span>
                    </motion.a>
                  </li>
                  <li>
                    <motion.a 
                      href="#" 
                      className="hover:text-white transition-colors duration-200 relative group inline-block"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="relative">
                        Comunitate
                        <motion.span 
                          className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full transition-all duration-300"
                          initial={{ width: 0 }}
                          whileHover={{ width: "100%" }}
                        />
                      </span>
                    </motion.a>
                  </li>
                </ul>
              </StaggeredList>
            </div>
          </div>
        </StaggeredList>
        
        <div className="mt-12 pt-8 border-t border-white/10 text-center text-gray-400 relative">
          {/* Floating decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <FloatingElement duration={10}>
              <motion.div
                className="absolute top-1/2 left-1/4 w-2 h-2 bg-purple-500/30 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </FloatingElement>
            
            <FloatingElement duration={12}>
              <motion.div
                className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-pink-500/30 rounded-full"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </FloatingElement>
          </div>
          
          <TextReveal delay={0.3}>
            <motion.p 
              className="relative z-10"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              &copy; 2025 MedFlow. Toate drepturile rezervate. Conform HIPAA.
            </motion.p>
          </TextReveal>
        </div>
      </div>
    </footer>
  );
}

// Main Professional Layout component
export default function ProfessionalLayout() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <ScrollGradientBackground>
      <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
        <ScrollProgress />
        <EnhancedHeader 
          isDark={isDarkMode} 
          onToggleTheme={toggleTheme}
          isMobileMenuOpen={isMobileMenuOpen}
          onToggleMobileMenu={toggleMobileMenu}
        />
        <EnhancedHero />
        <EnhancedFeatures />
        <ProductDemo />
        <EnhancedPricing />
        <Testimonials />
        <EnhancedCTA />
        <EnhancedContact />
        <EnhancedFooter />
      </div>
    </ScrollGradientBackground>
  );
}
