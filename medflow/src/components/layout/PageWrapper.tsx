import React from 'react'
import { motion } from 'framer-motion'
import Navigation from './Navigation'
import Footer from './Footer'

interface PageWrapperProps {
  children: React.ReactNode
  className?: string
  showNavigation?: boolean
  showFooter?: boolean
}

export default function PageWrapper({
  children,
  className = '',
  showNavigation = true,
  showFooter = true
}: PageWrapperProps) {
  return (
    <div className="min-h-screen bg-white">
      {showNavigation && <Navigation />}
      
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={`${showNavigation ? 'pt-16 lg:pt-20' : ''} ${className}`}
      >
        {children}
      </motion.main>
      
      {showFooter && <Footer />}
    </div>
  )
}
