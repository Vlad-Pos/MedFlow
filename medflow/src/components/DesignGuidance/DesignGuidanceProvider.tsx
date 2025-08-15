import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface DesignGuidanceContextType {
  isDevelopment: boolean;
  showGuidance: boolean;
  setShowGuidance: (show: boolean) => void;
  markComponentAsReviewed: (componentName: string) => void;
  isComponentReviewed: (componentName: string) => boolean;
  getDesignRequirements: () => DesignRequirements;
}

interface DesignRequirements {
  brandColors: string[];
  websiteFocus: string[];
  appScope: string[];
  contentLayout: string[];
  improvementProcess: string[];
}

const DesignGuidanceContext = createContext<DesignGuidanceContextType | undefined>(undefined);

export const useDesignGuidance = () => {
  const context = useContext(DesignGuidanceContext);
  if (!context) {
    throw new Error('useDesignGuidance must be used within a DesignGuidanceProvider');
  }
  return context;
};

interface DesignGuidanceProviderProps {
  children: ReactNode;
}

export const DesignGuidanceProvider: React.FC<DesignGuidanceProviderProps> = ({ children }) => {
  const [showGuidance, setShowGuidance] = useState(false);
  const [reviewedComponents, setReviewedComponents] = useState<Set<string>>(new Set());
  
  // Only active in development environment
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const designRequirements: DesignRequirements = {
    brandColors: [
      '#8A7A9F', '#000000', '#100B1A', '#7A48BF', '#804AC8', '#25153A', '#FFFFFF', '#CCCCCC', '#231A2F', '#BFBFBF', '#A6A6A6', '#737373'
    ],
    websiteFocus: [
      'Conversion-focused design with clear user flow',
      'Professional yet approachable tone - sleek, modern, polished',
      'Dark colored backgrounds inspired by medflow.care and n8n.io',
      'Scroll-triggered gradient animations for backgrounds',
      'Interactive scroll animations guiding attention to CTAs'
    ],
    appScope: [
      'No changes to established app features without explicit instruction',
      'Focus on polish and consistency, not redesign',
      'Respect website style rules for cross-platform brand unity'
    ],
    contentLayout: [
      'High-quality demo integration showing product capabilities',
      'Clear intuitive user flow to minimize drop-off',
      'Above-the-fold CTA clarity and progressive disclosure',
      'Benefit-focused copy aligned with conversion best practices'
    ],
    improvementProcess: [
      'Incremental improvements only - enhance existing designs',
      'Refine flow, increase clarity, improve animations',
      'Creative freedom within established brand rules',
      'Brand-breaking changes require human approval'
    ]
  };

  const markComponentAsReviewed = (componentName: string) => {
    setReviewedComponents(prev => new Set(prev).add(componentName));
  };

  const isComponentReviewed = (componentName: string) => {
    return reviewedComponents.has(componentName);
  };

  const getDesignRequirements = () => designRequirements;

  // Auto-hide guidance in production
  useEffect(() => {
    if (!isDevelopment) {
      setShowGuidance(false);
    }
  }, [isDevelopment]);

  const value: DesignGuidanceContextType = {
    isDevelopment,
    showGuidance,
    setShowGuidance,
    markComponentAsReviewed,
    isComponentReviewed,
    getDesignRequirements
  };

  return (
    <DesignGuidanceContext.Provider value={value}>
      {children}
    </DesignGuidanceContext.Provider>
  );
};
