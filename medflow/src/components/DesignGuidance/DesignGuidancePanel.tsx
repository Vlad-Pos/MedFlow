import React, { useState } from 'react';
import { useDesignGuidance } from './DesignGuidanceProvider';

interface DesignGuidancePanelProps {
  componentName: string;
  onClose: () => void;
}

export const DesignGuidancePanel: React.FC<DesignGuidancePanelProps> = ({ 
  componentName, 
  onClose 
}) => {
  const { 
    getDesignRequirements, 
    markComponentAsReviewed, 
    isComponentReviewed 
  } = useDesignGuidance();
  
  const [currentStep, setCurrentStep] = useState(1);
  // These state variables are used in the step handlers
  const [complianceConfirmed, setComplianceConfirmed] = useState(false);
  const [understandingDemonstrated, setUnderstandingDemonstrated] = useState(false);
  
  const requirements = getDesignRequirements();
  const isReviewed = isComponentReviewed(componentName);

  const handleStepComplete = (step: number) => {
    if (step === 1) {
      setCurrentStep(2);
    } else if (step === 2) {
      setCurrentStep(3);
    } else if (step === 3) {
      setCurrentStep(4);
    } else if (step === 4) {
      markComponentAsReviewed(componentName);
      onClose();
    }
  };

  const handleComplianceConfirm = () => {
    setComplianceConfirmed(true);
    handleStepComplete(1);
  };

  const handleUnderstandingConfirm = () => {
    setUnderstandingDemonstrated(true);
    handleStepComplete(3);
  };

  const handleWorkAuthorization = () => {
    handleStepComplete(4);
  };

  if (isReviewed) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4">
          <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-4">
            ✅ Design Requirements Reviewed
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Component <strong>{componentName}</strong> has already been reviewed for design compliance.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl mx-4 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Design Requirements Review
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step < currentStep 
                  ? 'bg-green-500 text-white' 
                  : step === currentStep 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-300 text-gray-600'
              }`}>
                {step < currentStep ? '✓' : step}
              </div>
              {step < 4 && (
                <div className={`w-16 h-1 mx-2 ${
                  step < currentStep ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Read Requirements */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Step 1: Read Design Requirements
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Please read through the design requirements for component: <strong>{componentName}</strong>
            </p>
            
            <div className="space-y-6">
              {/* Brand Colors */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Brand Colors (High Importance)
                </h4>
                <div className="grid grid-cols-7 gap-2 mb-3">
                  {requirements.brandColors.map((color, index) => (
                    <div key={color} className="text-center">
                      <div 
                        className="w-12 h-12 rounded-lg mb-2 mx-auto"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {color}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  These colors must be preserved. When extending the palette, use closely related shades for harmony.
                </p>
              </div>

              {/* Website Focus */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Website Design Focus
                </h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                  {requirements.websiteFocus.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* App Scope */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  App Design Scope
                </h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                  {requirements.appScope.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Content & Layout */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Content & Layout Guidelines
                </h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                  {requirements.contentLayout.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Improvement Process */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Improvement Process
                </h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                  {requirements.improvementProcess.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={() => handleStepComplete(1)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              I Have Read the Requirements
            </button>
          </div>
        )}

        {/* Step 2: Confirm Compliance */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Step 2: Confirm Compliance
            </h3>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-blue-800 dark:text-blue-200 font-medium mb-4">
                Please confirm your compliance with the following statement:
              </p>
              <p className="text-blue-700 dark:text-blue-300 italic">
                "I have read and internalized the Design & Brand Requirements document, and I will comply fully with its instructions before proceeding with any work."
              </p>
            </div>
            <button
              onClick={handleComplianceConfirm}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              I Confirm Compliance
            </button>
          </div>
        )}

        {/* Step 3: Demonstrate Understanding */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Step 3: Demonstrate Understanding
            </h3>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-yellow-800 dark:text-yellow-200 font-medium mb-4">
                Key Understanding Points:
              </p>
              <ul className="list-disc list-inside space-y-2 text-yellow-700 dark:text-yellow-300">
                <li>Brand colors must be preserved and extended harmoniously</li>
                <li>Website design focuses on conversion and user engagement</li>
                <li>App changes are limited to polish and consistency</li>
                <li>Improvements must be incremental, not full redesigns</li>
                <li>Brand-breaking changes require explicit human approval</li>
              </ul>
            </div>
            <button
              onClick={handleUnderstandingConfirm}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              I Understand These Requirements
            </button>
          </div>
        )}

        {/* Step 4: Work Authorization */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Step 4: Work Authorization
            </h3>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-green-800 dark:text-green-200 font-medium mb-4">
                Final Authorization:
              </p>
              <p className="text-green-700 dark:text-green-300">
                You have successfully completed the design requirements review. You are now authorized to work on component <strong>{componentName}</strong> in compliance with the established design guidelines.
              </p>
            </div>
            <button
              onClick={handleWorkAuthorization}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Complete Authorization
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
