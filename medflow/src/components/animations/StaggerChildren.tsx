import { motion, easeOut } from 'framer-motion'
import { ReactNode } from 'react'

interface StaggerChildrenProps {
  children: ReactNode
  staggerDelay?: number
  initialDelay?: number
  className?: string
}

export default function StaggerChildren({
  children,
  staggerDelay = 0.1,
  initialDelay = 0,
  className = ''
}: StaggerChildrenProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: initialDelay,
        staggerChildren: staggerDelay
      }
    }
  }

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: easeOut
      }
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className={className}
    >
      {Array.isArray(children) ? (
        children.map((child, index) => (
          <motion.div key={index} variants={childVariants}>
            {child}
          </motion.div>
        ))
      ) : (
        <motion.div variants={childVariants}>
          {children}
        </motion.div>
      )}
    </motion.div>
  )
}
