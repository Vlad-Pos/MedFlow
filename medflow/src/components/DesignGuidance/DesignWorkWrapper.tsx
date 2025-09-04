import React, { useState, ReactNode } from 'react';
import { useDesignGuidance } from './DesignGuidanceProvider';
import { DesignGuidancePanel } from './DesignGuidancePanel';

interface DesignWorkWrapperProps {
  children: ReactNode;
  componentName: string;
  showGuidanceOnMount?: boolean;
}

export const DesignWorkWrapper: React.FC<DesignWorkWrapperProps> = ({ 
  children, 
  componentName,
  showGuidanceOnMount = false 
}) => {
  const { isDevelopment, isComponentReviewed, setShowGuidance } = useDesignGuidance();
  const [showGuidance, setShowGuidanceLocal] = useState(showGuidanceOnMount);

  // In production, always render children without any guidance
  if (!isDevelopment) {
    return <>{children}</>;
  }

  // If component has been reviewed, render normally
  if (isComponentReviewed(componentName)) {
    return <>{children}</>;
  }

  const handleShowGuidance = () => {
    setShowGuidanceLocal(true);
    setShowGuidance(true);
  };

  const handleCloseGuidance = () => {
    setShowGuidanceLocal(false);
    setShowGuidance(false);
  };

  return (
    <>
      {/* Render the actual component content */}
      {children}
      
      {/* Development-only guidance overlay */}
      <div className="fixed bottom-4 right-4 z-40">
        <div className="bg-blue-600 text-white rounded-lg shadow-lg p-4 max-w-sm">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium mb-1">
                Design Requirements Review
              </h4>
              <p className="text-xs text-blue-100 mb-3">
                Component <strong>{componentName}</strong> needs design compliance review before development work.
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={handleShowGuidance}
                  className="bg-white text-blue-600 text-xs font-medium px-3 py-1 rounded-md hover:bg-blue-50 transition-colors"
                >
                  Review Requirements
                </button>
                <button
                  onClick={handleCloseGuidance}
                  className="text-blue-200 text-xs hover:text-white transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Guidance Panel */}
      {showGuidance && (
        <DesignGuidancePanel
          componentName={componentName}
          onClose={handleCloseGuidance}
        />
      )}
    </>
  );
};
