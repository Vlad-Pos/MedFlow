import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlowButton } from "./ui";

interface MobileNavigationProps {
  isOpen: boolean;
  onToggle: () => void;
}

const menuItems = [
  { href: "#features", label: "Funcționalități" },
  { href: "#demo", label: "Demo" },
  { href: "#pricing", label: "Prețuri" },
  { href: "#testimonials", label: "Testimoniale" },
  { href: "#contact", label: "Contact" }
];

export default function MobileNavigation({ isOpen, onToggle }: MobileNavigationProps) {
  return (
    <>
      {/* Mobile menu button */}
      <motion.button
        className="md:hidden relative z-50 p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20"
        onClick={onToggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="w-6 h-6 flex flex-col justify-center items-center">
          <motion.span
            className="w-5 h-0.5 bg-white rounded-full mb-1"
            animate={{
              rotate: isOpen ? 45 : 0,
              y: isOpen ? 6 : 0
            }}
            transition={{ duration: 0.3 }}
          />
          <motion.span
            className="w-5 h-0.5 bg-white rounded-full mb-1"
            animate={{
              opacity: isOpen ? 0 : 1
            }}
            transition={{ duration: 0.3 }}
          />
          <motion.span
            className="w-5 h-0.5 bg-white rounded-full"
            animate={{
              rotate: isOpen ? -45 : 0,
              y: isOpen ? -6 : 0
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </motion.button>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onToggle}
            />
            
            {/* Menu panel */}
            <motion.div
              className="fixed top-0 right-0 h-full w-80 bg-gradient-to-b from-[#243153] to-[#494E62] border-l border-white/10 z-50 md:hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">M</span>
                    </div>
                    <span className="text-xl font-bold text-white">MedFlow</span>
                  </div>
                  <button
                    onClick={onToggle}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
                  >
                    <span className="text-white text-2xl">×</span>
                  </button>
                </div>

                {/* Navigation items */}
                <nav className="space-y-2 mb-8">
                  {menuItems.map((item, index) => (
                    <motion.a
                      key={item.href}
                      href={item.href}
                      className="block px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
                      onClick={onToggle}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      {item.label}
                    </motion.a>
                  ))}
                </nav>

                {/* CTA Button */}
                <motion.div
                  className="pt-4 border-t border-white/10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  <GlowButton onClick={() => {
                    console.log("Mobile CTA clicked");
                    onToggle();
                  }}>
                    Începe Gratuit
                  </GlowButton>
                </motion.div>

                {/* Contact info */}
                <motion.div
                  className="mt-8 pt-6 border-t border-white/10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                >
                  <p className="text-gray-300 text-sm mb-2">Suport 24/7</p>
                  <p className="text-white font-medium">+40 123 456 789</p>
                  <p className="text-gray-300 text-sm">contact@medflow.ro</p>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}



