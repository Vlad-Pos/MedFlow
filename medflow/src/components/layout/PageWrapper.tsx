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

export default function PageWrapper({ children, className = '' }: PageWrapperProps) {
  return (
    <div className={`min-h-screen ${className}`}>
      {children}
    </div>
  )
}
