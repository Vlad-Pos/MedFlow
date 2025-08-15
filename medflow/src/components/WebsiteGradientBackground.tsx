import React from "react";
import { motion } from "framer-motion";
import "./WebsiteGradientBackground.css";

/**
 * WebsiteGradientBackground
 * Provides a beautiful radial gradient background for the website
 * using the specific brand colors and cross-browser compatibility.
 */
const WebsiteGradientBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      className="min-h-screen w-full text-white website-gradient-bg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      role="main"
      aria-label="Website background with brand gradient"
    >
      {children}
    </motion.div>
  );
};

export default WebsiteGradientBackground;
