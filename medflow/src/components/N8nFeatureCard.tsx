/**
 * n8n.io-inspired Feature Card Component
 * Enhanced visual styling matching the provided visual package
 */

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
interface N8nFeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  benefit: string
  index: number
  isActive?: boolean
}

export default function N8nFeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  benefit, 
  index,
  isActive = false 
}: N8nFeatureCardProps) {
  return (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ 
          y: -8,
          scale: 1.02,
          transition: { duration: 0.2 }
        }}
        className={`
          group relative overflow-hidden rounded-2xl p-8 transition-all duration-300 cursor-pointer
          backdrop-blur-sm border border-white/10 hover:border-[var(--medflow-brand-1)]/30
          ${isActive 
                          ? 'bg-gradient-to-br from-[var(--medflow-brand-1)]/20 to-[var(--medflow-brand-2)]/20 shadow-lg shadow-[var(--medflow-brand-1)]/30' 
                                                     : 'bg-gradient-to-br from-[var(--medflow-brand-7)]/80 to-[var(--medflow-brand-6)]/80 hover:shadow-xl hover:shadow-[var(--medflow-brand-1)]/20'
          }
        `}
      >
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--medflow-brand-1)]/10 via-transparent to-[var(--medflow-brand-2)]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Animated background blobs */}
        <motion.div 
          className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-[var(--medflow-brand-1)]/30 to-[var(--medflow-brand-2)]/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 10, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <div className="relative z-10">
          {/* Icon with enhanced styling */}
          <motion.div 
            className="flex items-center justify-center w-16 h-16 mb-6 rounded-xl bg-gradient-to-br from-[var(--medflow-brand-1)]/30 to-[var(--medflow-brand-2)]/30 border border-[var(--medflow-brand-1)]/40"
            whileHover={{ 
              scale: 1.1,
              rotate: [0, -5, 5, 0]
            }}
            transition={{ duration: 0.3 }}
          >
            <Icon className="w-8 h-8 text-[var(--medflow-brand-1)] group-hover:text-[var(--medflow-brand-2)] transition-colors duration-300" />
          </motion.div>

          {/* Content */}
          <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-[var(--medflow-brand-1)] transition-colors duration-300">
            {title}
          </h3>
          
          <p className="text-white mb-6 leading-relaxed">
            {description}
          </p>
          
          {/* Status badge */}
          <motion.div 
            className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-[var(--medflow-brand-1)]/30 to-[var(--medflow-brand-2)]/30 border border-[var(--medflow-brand-1)]/40"
            whileHover={{ scale: 1.05 }}
          >
            <span className="text-sm font-medium text-[var(--medflow-brand-1)]">{benefit}</span>
          </motion.div>
        </div>

        {/* Hover shine effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 -skew-x-12 transition-opacity duration-500"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6 }}
        />
      </motion.div>
    )
}
