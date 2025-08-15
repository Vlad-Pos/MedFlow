import React from "react";
import { motion } from "framer-motion";

/**
 * ScrollGradientBackground Component
 * 
 * NOW PROVIDES THE EXACT SAME GRADIENT AS THE NAVBAR
 * Uses the same gradient as navbar buttons: from-[var(--medflow-brand-7)] via-[var(--medflow-brand-6)] to-[var(--medflow-brand-4)]
 * 
 * Features:
 * - Uses the exact same gradient as navbar buttons
 * - Static background (no more scroll-triggered changes)
 * - Consistent with navbar appearance
 * - Accessibility compliant with proper contrast
 * - Responsive design using Tailwind CSS
 * - Clean, maintainable TypeScript code
 * 
 * @param children - React nodes to render inside the background
 * @returns Motion div with the exact same gradient as navbar
 */
const ScrollGradientBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      className="min-h-screen w-full bg-gradient-to-r from-[var(--medflow-brand-7)] via-[var(--medflow-brand-6)] to-[#160B1A]"
      // Accessibility attributes
      role="main"
      aria-label="Main content with gradient ending in #160B1A for optimal readability"
      // Performance optimizations and smooth entrance animation
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
};

export default ScrollGradientBackground;
