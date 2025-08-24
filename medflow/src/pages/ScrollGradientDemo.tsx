/**
 * ScrollGradientDemo - MedFlow Brand Color Demonstration
 * UPDATED: Now uses new 12-brand color scheme
 * 
 * This page demonstrates the new MedFlow brand colors through scroll-triggered gradients.
 * Each section represents a different scroll progress and shows the appropriate color transition.
 */

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { ArrowDown, Calendar, Shield, Clock, Users, Brain, Zap, CheckCircle } from 'lucide-react'

export default function ScrollGradientDemo() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  // Transform scroll progress to color transitions
  const backgroundColor = useTransform(
    scrollYProgress,
    [0, 0.2, 0.4, 0.6, 0.8, 1],
    [
      'rgb(138, 122, 159)', // #8A7A9F - Logo Color (Neutral Purple)
      'rgb(122, 72, 191)',  // #7A48BF - Secondary Floating Button (Basic Purple V1)
      'rgb(128, 74, 200)',  // #804AC8 - Secondary Normal Button (Basic Purple V2)
      'rgb(37, 21, 58)',    // #25153A - Gradient (Dark Purple)
      'rgb(35, 26, 47)',    // #231A2F - Extra Color 1 (Plum Purple)
      'rgb(16, 11, 26)'     // #100B1A - Secondary Background (Really Deep Purple)
    ]
  )

  const textColor = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [
      'rgb(255, 255, 255)', // #FFFFFF - Title Text (Pure White)
      'rgb(204, 204, 204)', // #CCCCCC - Subsection Text (Toned Grey)
      'rgb(255, 255, 255)'  // #FFFFFF - Title Text (Pure White)
    ]
  )

  return (
    <div 
      ref={containerRef}
      className="min-h-screen relative overflow-hidden"
      style={{ background: backgroundColor.get() }}
    >
      {/* Fixed header */}
      <motion.header 
        className="fixed top-0 left-0 right-0 z-50 p-6 text-center"
        style={{ color: textColor }}
      >
        <h1 className="text-4xl font-bold mb-2">MedFlow Brand Colors</h1>
        <p className="text-lg opacity-80">Scroll to see the new 12-brand color scheme in action</p>
        <motion.div 
          className="mt-4"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ArrowDown className="w-8 h-8 mx-auto" />
        </motion.div>
      </motion.header>

      {/* Content sections */}
      <div className="pt-32 pb-20 space-y-8">
        {/* Section 1: Scroll 0-20% */}
        <section className="text-center py-24 bg-black/10 backdrop-blur-sm rounded-2xl mx-8">
          <div className="max-w-3xl mx-auto px-8">
            <h2 className="text-5xl font-bold mb-8 text-white">
              Welcome to MedFlow
            </h2>
            <p className="text-xl max-w-2xl mx-auto text-[var(--medflow-text-primary)] leading-relaxed">
              This section represents the first 20% of scroll progress.
              The gradient should smoothly transition from <span className="font-mono text-purple-300">#8A7A9F</span> to <span className="font-mono text-purple-300">#7A48BF</span>.
            </p>
            <div className="mt-8 p-4 bg-white/10 rounded-lg">
              <p className="text-sm text-[var(--medflow-text-secondary)]">
                <strong>Expected Colors:</strong> Logo Color to Secondary Floating Button transition
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Scroll 20-40% */}
        <section className="text-center py-24 bg-black/10 backdrop-blur-sm rounded-2xl mx-8">
          <div className="max-w-3xl mx-auto px-8">
            <h3 className="text-4xl font-bold mb-8 text-white">
              Professional Healthcare Management
            </h3>
            <p className="text-lg max-w-2xl mx-auto text-[var(--medflow-text-primary)] leading-relaxed">
              This section represents 20-40% scroll progress.
              The gradient should transition from <span className="font-mono text-purple-300">#7A48BF</span> to <span className="font-mono text-purple-300">#804AC8</span>.
            </p>
            <div className="mt-8 p-4 bg-white/10 rounded-lg">
              <p className="text-sm text-[var(--medflow-text-secondary)]">
                <strong>Expected Colors:</strong> Secondary Floating Button to Secondary Normal Button transition
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Scroll 40-60% */}
        <section className="text-center py-24 bg-black/10 backdrop-blur-sm rounded-2xl mx-8">
          <div className="max-w-3xl mx-auto px-8">
            <h3 className="text-4xl font-bold mb-8 text-white">
              Advanced Analytics & Insights
            </h3>
            <p className="text-lg max-w-2xl mx-auto text-[var(--medflow-text-primary)] leading-relaxed">
              This section represents 40-60% scroll progress.
              The gradient should transition from <span className="font-mono text-purple-300">#804AC8</span> to <span className="font-mono text-purple-300">#25153A</span>.
            </p>
            <div className="mt-8 p-4 bg-white/10 rounded-lg">
              <p className="text-sm text-[var(--medflow-text-secondary)]">
                <strong>Expected Colors:</strong> Secondary Normal Button to Gradient transition
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Scroll 60-80% */}
        <section className="text-center py-24 bg-black/10 backdrop-blur-sm rounded-2xl mx-8">
          <div className="max-w-3xl mx-auto px-8">
            <h3 className="text-4xl font-bold mb-8 text-white">
              Secure & Compliant
            </h3>
            <p className="text-lg max-w-2xl mx-auto text-[var(--medflow-text-primary)] leading-relaxed">
              This section represents 60-80% scroll progress.
              The gradient should transition from <span className="font-mono text-purple-300">#25153A</span> to <span className="font-mono text-purple-300">#231A2F</span>.
            </p>
            <div className="mt-8 p-4 bg-white/10 rounded-lg">
              <p className="text-sm text-[var(--medflow-text-secondary)]">
                <strong>Expected Colors:</strong> Gradient to Extra Color 1 transition
              </p>
            </div>
          </div>
        </section>

        {/* Section 5: Scroll 80-100% */}
        <section className="text-center py-24 bg-black/10 backdrop-blur-sm rounded-2xl mx-8">
          <div className="max-w-3xl mx-auto px-8">
            <h3 className="text-4xl font-bold mb-8 text-white">
              Ready to Transform Your Practice?
            </h3>
            <p className="text-lg max-w-2xl mx-auto text-[var(--medflow-text-primary)] leading-relaxed">
              This section represents 80-100% scroll progress.
              The gradient should transition from <span className="font-mono text-purple-300">#231A2F</span> to <span className="font-mono text-purple-300">#100B1A</span>.
            </p>
            <div className="mt-8 p-4 bg-white/10 rounded-lg">
              <p className="text-sm text-[var(--medflow-text-secondary)]">
                <strong>Expected Colors:</strong> Extra Color 1 to Secondary Background transition
              </p>
            </div>
            <button className="mt-8 px-8 py-4 bg-white text-[var(--medflow-text-primary)] rounded-lg font-semibold hover:bg-[var(--medflow-surface-elevated)] transition-colors focus:outline-none focus:ring-4 focus:ring-white/50">
              Get Started Today
            </button>
          </div>
        </section>
      </div>

      {/* Footer with testing instructions */}
      <footer className="text-center py-16 max-w-4xl mx-auto">
        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-8">
          <h3 className="text-2xl font-bold mb-4 text-white">Testing Checklist</h3>
          <div className="grid md:grid-cols-2 gap-6 text-left text-sm">
            <div>
              <h4 className="font-semibold text-white mb-2">Performance Tests:</h4>
              <ul className="space-y-1 text-[var(--medflow-text-secondary)]">
                <li>• Smooth scrolling without jank</li>
                <li>• Color transitions are fluid</li>
                <li>• No performance degradation</li>
                <li>• Responsive on all devices</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Color Tests:</h4>
              <ul className="space-y-1 text-[var(--medflow-text-secondary)]">
                <li>• Colors match new brand scheme</li>
                <li>• Transitions are smooth</li>
                <li>• Contrast ratios maintained</li>
                <li>• Accessibility standards met</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-white/10 rounded-lg">
            <h4 className="font-semibold text-white mb-2">New Brand Colors Implemented:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded bg-[#8A7A9F]"></div>
                <span className="text-[var(--medflow-text-secondary)]">#8A7A9F Logo</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded bg-[#7A48BF]"></div>
                <span className="text-[var(--medflow-text-secondary)]">#7A48BF Secondary</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded bg-[#804AC8]"></div>
                <span className="text-[var(--medflow-text-secondary)]">#804AC8 Normal</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded bg-[#25153A]"></div>
                <span className="text-[var(--medflow-text-secondary)]">#25153A Gradient</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
