import React, { memo } from 'react'
import { motion } from 'framer-motion'
import { FastStatsCardProps } from './FastStatsCard.d'

/**
 * FastStatsCard - Lightweight, fast-loading stats card
 * 
 * Eliminates performance bottlenecks:
 * - No complex performance hooks
 * - Simple animations only
 * - Memoized to prevent unnecessary re-renders
 * - Minimal CSS properties
 * 
 * Follows MedFlow component standards:
 * - Proper TypeScript interfaces
 * - Consistent naming conventions
 * - Modular export structure
 * - Performance-optimized rendering
 */
export const FastStatsCard = memo(({
  title,
  value,
  icon,
  className = ''
}: FastStatsCardProps) => {
  // Simple, fast animation variants
  const cardVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    hover: { y: -2 }
  }

  return (
    <motion.div
      className={`bg-transparent text-[var(--medflow-text-primary)] shadow-lg rounded-xl p-6 border border-[rgba(128,74,200,0.3)] ${className}`}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      transition={{ duration: 0.2, ease: 'easeOut' }}
      viewport={{ once: true, margin: '20px' }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        {icon && (
          <div className="flex-shrink-0">
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  )
})

FastStatsCard.displayName = 'FastStatsCard'

// Default export for backward compatibility
export default FastStatsCard
