/**
 * MedFlow Modular Landing Page
 * 
 * This is the new, modular version that imports all section components
 * and provides a clean, maintainable structure for the website.
 * 
 * Features:
 * - Modular component architecture
 * - Consistent design system
 * - Responsive layout
 * - Performance optimized animations
 * - Accessibility compliant
 */

import React from 'react'
import { motion } from 'framer-motion'
import { 
  HeroSection,
  FeaturesSection,
  AppDemoSection,
  AboutSection,
  TestimonialsSection,
  PricingSection,
  ContactSection,
  CTASection,
  SecuritySection,
  MetricsSection
} from '../components/sections'
import { Navigation, Footer } from '../components/layout'
import { PageWrapper } from '../components/layout'

export default function ModularLandingPage() {
  return (
    <PageWrapper>
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Hero Section - Main landing area */}
        <HeroSection />
        
        {/* Features Section - Product capabilities */}
        <FeaturesSection />
        
        {/* App Demo Section - Interactive preview */}
        <AppDemoSection />
        
        {/* About Section - Company information */}
        <AboutSection />
        
        {/* Security Section - Trust and compliance */}
        <SecuritySection />
        
        {/* Metrics Section - Key performance indicators */}
        <MetricsSection />
        
        {/* Testimonials Section - User feedback */}
        <TestimonialsSection />
        
        {/* Pricing Section - Plans and pricing */}
        <PricingSection />
        
        {/* CTA Section - Call to action */}
        <CTASection />
        
        {/* Contact Section - Contact form and information */}
        <ContactSection />
      </motion.main>
    </PageWrapper>
  )
}
