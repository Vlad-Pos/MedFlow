/**
 * n8n.io-inspired Visual Effects Component
 * CSS-based animations and gradients matching the visual package prompts
 */

import { motion } from 'framer-motion'
export const HeroBackground = () => (
  <div className="absolute inset-0 overflow-hidden">
      {/* Futuristic gradient background with abstract shapes */}
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--medflow-brand-7)] via-[var(--medflow-brand-6)] to-[var(--medflow-brand-7)]" />
      
      {/* Abstract floating shapes */}
      <motion.div
        className="absolute top-20 left-20 w-96 h-96 rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle, var(--medflow-brand-1) 0%, transparent 70%)',
          filter: 'blur(40px)'
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <motion.div
        className="absolute bottom-20 right-32 w-80 h-80 rounded-full opacity-25"
        style={{
          background: 'radial-gradient(circle, var(--medflow-brand-2) 0%, transparent 70%)',
          filter: 'blur(50px)'
        }}
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.25, 0.4, 0.25]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <motion.div
        className="absolute top-60 right-20 w-64 h-64 rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, var(--medflow-brand-3) 0%, transparent 70%)',
          filter: 'blur(30px)'
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.35, 0.2]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  )

export const ScrollEffectGraphics = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Blurred gradient blobs with motion blur */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full opacity-20"
        style={{
          background: 'linear-gradient(45deg, var(--medflow-brand-1), var(--medflow-brand-2))',
          filter: 'blur(20px)'
        }}
        animate={{
          y: [0, -30, 0],
          x: [0, 20, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <motion.div
        className="absolute top-3/4 right-1/4 w-24 h-24 rounded-full opacity-15"
        style={{
          background: 'linear-gradient(135deg, var(--medflow-brand-3), var(--medflow-brand-1))',
          filter: 'blur(25px)'
        }}
        animate={{
          y: [0, 40, 0],
          x: [0, -15, 0],
          scale: [1.1, 1, 1.1]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  )

export const SectionIllustrations = ({ variant = 'workflow' }: { variant?: 'workflow' | 'automation' | 'data' }) => {
  const variants = {
    workflow: {
      primary: 'var(--medflow-brand-1)',
      secondary: 'var(--medflow-brand-2)',
      accent: 'var(--medflow-brand-3)'
    },
    automation: {
      primary: 'var(--medflow-brand-3)',
      secondary: 'var(--medflow-brand-1)',
      accent: 'var(--medflow-brand-2)'
    },
    data: {
      primary: 'var(--medflow-brand-2)',
      secondary: 'var(--medflow-brand-1)',
      accent: 'var(--medflow-brand-3)'
    }
  }
  
  const colors = variants[variant]
  
  return (
    <div className="relative w-full h-32 overflow-hidden rounded-xl">
        {/* 3D isometric illustration effect with CSS */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--medflow-brand-7)] to-[var(--medflow-brand-6)]" />
        
        {/* Glowing edges effect */}
        <motion.div
          className="absolute top-4 left-4 w-16 h-16 rounded-lg border-2 opacity-60"
          style={{
            borderColor: colors.primary,
            boxShadow: `0 0 20px ${colors.primary}40`
          }}
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.6, 0.8, 0.6]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <motion.div
          className="absolute top-8 right-8 w-12 h-12 rounded-full"
          style={{
            background: `radial-gradient(circle, ${colors.secondary}, transparent)`,
            boxShadow: `0 0 15px ${colors.secondary}60`
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.7, 0.9, 0.7]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        
        <motion.div
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-sm"
          style={{
            background: `linear-gradient(45deg, ${colors.accent}, ${colors.primary})`,
            boxShadow: `0 0 10px ${colors.accent}50`
          }}
          animate={{
            rotate: [0, 45, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>
    )
}

export const NeonIconSet = ({ icon: Icon, variant = 'primary' }: { icon: React.ComponentType<{ className?: string }>, variant?: 'primary' | 'secondary' | 'accent' }) => {
  const variants = {
    primary: {
      gradient: 'from-[var(--medflow-brand-1)] to-[var(--medflow-brand-2)]',
      glow: 'var(--medflow-brand-1)'
    },
    secondary: {
      gradient: 'from-[var(--medflow-brand-3)] to-[var(--medflow-brand-1)]',
      glow: 'var(--medflow-brand-3)'
    },
    accent: {
      gradient: 'from-[var(--medflow-brand-2)] to-[var(--medflow-brand-1)]',
      glow: 'var(--medflow-brand-2)'
    }
  }
  
  const style = variants[variant]
  
  return (
    <motion.div
        className={`relative w-16 h-16 rounded-xl bg-gradient-to-br ${style.gradient} p-4 flex items-center justify-center`}
        style={{
          boxShadow: `0 0 20px ${style.glow}40, 0 0 40px ${style.glow}20`
        }}
        whileHover={{
          scale: 1.1,
          boxShadow: `0 0 30px ${style.glow}60, 0 0 60px ${style.glow}30`
        }}
        transition={{ duration: 0.3 }}
      >
        <Icon className="w-8 h-8 text-white filter drop-shadow-lg" />
        
        {/* Animated border */}
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-white/30"
          animate={{
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    )
}
