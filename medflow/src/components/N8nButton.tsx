/**
 * n8n.io-inspired Button Component
 * Enhanced styling matching the provided visual package
 * UPDATED: Now uses new 12-brand color scheme
 */

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'
interface N8nButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  onClick?: () => void
  href?: string
  className?: string
  disabled?: boolean
}

export default function N8nButton({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'right',
  onClick,
  href,
  className = '',
  disabled = false
}: N8nButtonProps) {
  const baseClasses = "relative overflow-hidden rounded-xl font-bold transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center"
  
  const variants = {
      primary: "bg-gradient-to-r from-[var(--medflow-brand-1)] to-[var(--medflow-brand-2)] text-white shadow-lg hover:shadow-xl hover:shadow-[var(--medflow-brand-1)]/25 focus:ring-[var(--medflow-brand-1)]/50 hover:-translate-y-1",
  secondary: "bg-transparent border-2 border-[var(--medflow-brand-1)] text-[var(--medflow-brand-1)] hover:bg-[var(--medflow-brand-1)] hover:text-white focus:ring-[var(--medflow-brand-1)]/50 hover:-translate-y-1",
  ghost: "bg-transparent text-white hover:text-[var(--medflow-brand-1)] hover:bg-[var(--medflow-brand-1)]/10 focus:ring-[var(--medflow-brand-1)]/50"
  }
  
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  }

  const Component = href ? motion.a : motion.button
  
  return (
    <Component
        href={href}
        onClick={onClick}
        disabled={disabled}
        className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
      >
        {/* Animated background gradient */}
        {variant === 'primary' && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-[var(--medflow-brand-2)] to-[var(--medflow-brand-1)] opacity-0 hover:opacity-100 transition-opacity duration-300"
            initial={false}
          />
        )}
        
        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 -skew-x-12"
          whileHover={{ x: ['0%', '100%'], opacity: [0, 1, 0] }}
          transition={{ duration: 0.6 }}
        />
        
        <span className="relative z-10 flex items-center gap-2">
          {Icon && iconPosition === 'left' && (
            <motion.div
              animate={{ rotate: [0, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Icon className="w-5 h-5" />
            </motion.div>
          )}
          
          {children}
          
          {Icon && iconPosition === 'right' && (
            <motion.div
              whileHover={{ x: 2 }}
              transition={{ duration: 0.2 }}
            >
              <Icon className="w-5 h-5" />
            </motion.div>
          )}
        </span>
      </Component>
    )
}
