/**
 * n8n.io-inspired Visual Effects Component
 * CSS-based animations and gradients matching the visual package prompts
 */

import { motion } from 'framer-motion'
import DesignWorkWrapper from '../../DesignWorkWrapper'

export const HeroBackground = () => (
  <DesignWorkWrapper componentName="HeroBackground">
    <div className="absolute inset-0 overflow-hidden">
      {/* Futuristic gradient background with abstract shapes */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1d1f21] via-[#2a2d31] to-[#1d1f21]" />
      
      {/* Abstract floating shapes */}
      <motion.div
        className="absolute top-20 left-20 w-96 h-96 rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle, #ff7e5f 0%, transparent 70%)',
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
          background: 'radial-gradient(circle, #feb47b 0%, transparent 70%)',
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
          background: 'radial-gradient(circle, #4a9eff 0%, transparent 70%)',
          filter: 'blur(30px)'
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.35, 0.2]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  </DesignWorkWrapper>
)

export const ScrollEffectGraphics = () => (
  <DesignWorkWrapper componentName="ScrollEffectGraphics">
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Blurred gradient blobs with motion blur */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full opacity-20"
        style={{
          background: 'linear-gradient(45deg, #ff7e5f, #feb47b)',
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
          background: 'linear-gradient(135deg, #4a9eff, #b084cc)',
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
  </DesignWorkWrapper>
)

export const SectionIllustrations = ({ variant = 'workflow' }: { variant?: 'workflow' | 'automation' | 'data' }) => {
  const variants = {
    workflow: {
      primary: '#ff7e5f',
      secondary: '#feb47b',
      accent: '#4a9eff'
    },
    automation: {
      primary: '#4a9eff',
      secondary: '#b084cc',
      accent: '#ff7e5f'
    },
    data: {
      primary: '#b084cc',
      secondary: '#ff7e5f',
      accent: '#feb47b'
    }
  }
  
  const colors = variants[variant]
  
  return (
    <DesignWorkWrapper componentName="SectionIllustrations">
      <div className="relative w-full h-32 overflow-hidden rounded-xl">
        {/* 3D isometric illustration effect with CSS */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1b1e] to-[#24262a]" />
        
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
    </DesignWorkWrapper>
  )
}

export const NeonIconSet = ({ icon: Icon, variant = 'primary' }: { icon: any, variant?: 'primary' | 'secondary' | 'accent' }) => {
  const variants = {
    primary: {
      gradient: 'from-[#ff7e5f] to-[#feb47b]',
      glow: '#ff7e5f'
    },
    secondary: {
      gradient: 'from-[#4a9eff] to-[#b084cc]',
      glow: '#4a9eff'
    },
    accent: {
      gradient: 'from-[#b084cc] to-[#ff7e5f]',
      glow: '#b084cc'
    }
  }
  
  const style = variants[variant]
  
  return (
    <DesignWorkWrapper componentName="NeonIconSet">
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
    </DesignWorkWrapper>
  )
}
