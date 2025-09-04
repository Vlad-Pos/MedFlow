import { motion, type Transition, type TargetAndTransition } from 'framer-motion'
import type { ReactNode } from 'react'
import { pageVariants, pageTransition } from '../utils/animations'

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

export default function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <motion.div
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition as Transition}
        className={className}
      >
        {children}
      </motion.div>
    )
}

// Animated page wrapper with different entrance animations
export function AnimatedPage({ 
  children, 
  className = '',
  animation = 'fade'
}: {
  children: ReactNode
  className?: string
  animation?: 'fade' | 'slide-left' | 'slide-right' | 'scale' | 'bounce'
}) {
  const animations: Record<string, { 
    initial: TargetAndTransition; 
    animate: TargetAndTransition; 
    exit: TargetAndTransition; 
    transition: Transition 
  }> = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.3 }
    },
    'slide-left': {
      initial: { opacity: 0, x: -50 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 50 },
      transition: { duration: 0.4 }
    },
    'slide-right': {
      initial: { opacity: 0, x: 50 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -50 },
      transition: { duration: 0.4 }
    },
    scale: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.9 },
      transition: { duration: 0.3 }
    },
    bounce: {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.8 },
      transition: { 
        type: 'spring',
        stiffness: 200,
        damping: 15
      } as Transition
    }
  }

  const selectedAnimation = animations[animation]

  return (
    <motion.div
        initial={selectedAnimation.initial}
        animate={selectedAnimation.animate}
        exit={selectedAnimation.exit}
        transition={selectedAnimation.transition}
        className={className}
      >
        {children}
      </motion.div>
    )
}
