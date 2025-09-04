import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, ArrowRight } from 'lucide-react';
import { useFramerIntegration } from '../../hooks/useFramerIntegration';

interface FramerWelcomeBannerProps {
  className?: string;
}

export const FramerWelcomeBanner: React.FC<FramerWelcomeBannerProps> = ({
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const { shouldShowWelcome, clearNavigationContext } = useFramerIntegration();

  useEffect(() => {
    // Check if user came from Framer website
    if (shouldShowWelcome) {
      setIsVisible(true);
      
      // Auto-hide after 8 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, [shouldShowWelcome]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    clearNavigationContext();
  };

  const handleReturnToWebsite = () => {
    // Navigate back to Framer website
    window.open('https://compassionate-colors-919784.framer.app', '_blank');
  };

  if (!isVisible || isDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg ${className}`}
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-lg">🎉</span>
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="text-sm font-semibold">
                  Welcome to MedFlow!
                </h3>
                <p className="text-xs text-blue-100">
                  You've successfully navigated from our website to the app
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleReturnToWebsite}
                className="flex items-center space-x-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Website</span>
              </button>
              
              <button
                onClick={handleDismiss}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Dismiss welcome message"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
