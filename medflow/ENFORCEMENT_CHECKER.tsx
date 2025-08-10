import React, { useState, useEffect } from 'react';

interface EnforcementCheckerProps {
  children: React.ReactNode;
  onComplianceVerified: () => void;
}

interface ComplianceState {
  hasReadRequirements: boolean;
  hasConfirmedCompliance: boolean;
  hasDemonstratedUnderstanding: boolean;
  isAuthorized: boolean;
}

const EnforcementChecker: React.FC<EnforcementCheckerProps> = ({ 
  children, 
  onComplianceVerified 
}) => {
  const [complianceState, setComplianceState] = useState<ComplianceState>({
    hasReadRequirements: false,
    hasConfirmedCompliance: false,
    hasDemonstratedUnderstanding: false,
    isAuthorized: false
  });

  const [currentStep, setCurrentStep] = useState<'reading' | 'confirmation' | 'understanding' | 'authorized'>('reading');

  const handleRequirementsRead = () => {
    setComplianceState(prev => ({ ...prev, hasReadRequirements: true }));
    setCurrentStep('confirmation');
  };

  const handleComplianceConfirmed = () => {
    setComplianceState(prev => ({ ...prev, hasConfirmedCompliance: true }));
    setCurrentStep('understanding');
  };

  const handleUnderstandingDemonstrated = () => {
    setComplianceState(prev => ({ ...prev, hasDemonstratedUnderstanding: true }));
    setCurrentStep('authorized');
  };

  const handleAuthorizationGranted = () => {
    setComplianceState(prev => ({ ...prev, isAuthorized: true }));
    onComplianceVerified();
  };

  // BLOCK ALL DESIGN WORK UNTIL COMPLIANCE IS VERIFIED
  if (!complianceState.isAuthorized) {
    return (
      <div className="enforcement-blocker min-h-screen bg-gradient-to-br from-[#494E62] to-[#A18AB2] flex items-center justify-center p-8">
        <div className="max-w-4xl bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              ⚠️ DESIGN WORK BLOCKED
            </h1>
            <p className="text-xl text-white/90">
              Brand & Design Requirements Compliance Required
            </p>
          </div>

          {/* Step 1: Read Requirements */}
          {currentStep === 'reading' && (
            <div className="space-y-6">
              <div className="bg-white/20 rounded-lg p-6">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  Step 1: Read Brand & Design Requirements
                </h2>
                <div className="bg-black/30 rounded-lg p-4 text-white/90 text-left max-h-96 overflow-y-auto">
                  <h3 className="text-xl font-semibold mb-3">Brand Colors (Strict Order):</h3>
                  <ul className="space-y-2 mb-4">
                    <li>• #A18AB2</li>
                    <li>• #9280A5</li>
                    <li>• #847697</li>
                    <li>• #756C8A</li>
                    <li>• #66627D</li>
                    <li>• #58586F</li>
                    <li>• #494E62</li>
                  </ul>
                  
                  <h3 className="text-xl font-semibold mb-3">Website Design Focus:</h3>
                  <ul className="space-y-2 mb-4">
                    <li>• Darker, colored backgrounds inspired by medflow.care and n8n.io</li>
                    <li>• Scroll-triggered gradient animations</li>
                    <li>• Modern, minimalistic, professional style</li>
                    <li>• Conversion-focused with Romanian microcopy</li>
                  </ul>
                  
                  <h3 className="text-xl font-semibold mb-3">App Design Focus:</h3>
                  <ul className="space-y-2 mb-4">
                    <li>• No feature redesigns without explicit instructions</li>
                    <li>• UI polish and brand consistency only</li>
                  </ul>
                  
                  <h3 className="text-xl font-semibold mb-3">Design Approach:</h3>
                  <ul className="space-y-2">
                    <li>• Incremental improvements only</li>
                    <li>• Creative freedom within brand guidelines</li>
                    <li>• Maintain accessibility and responsiveness</li>
                  </ul>
                </div>
                <button
                  onClick={handleRequirementsRead}
                  className="mt-4 px-8 py-3 bg-[#A18AB2] hover:bg-[#9280A5] text-white font-semibold rounded-lg transition-colors"
                >
                  I Have Read and Understood the Requirements
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Confirm Compliance */}
          {currentStep === 'confirmation' && (
            <div className="space-y-6">
              <div className="bg-white/20 rounded-lg p-6">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  Step 2: Confirm Compliance
                </h2>
                <p className="text-white/90 mb-6">
                  You must provide the exact compliance statement:
                </p>
                <div className="bg-[#494E62] rounded-lg p-4 mb-6">
                  <p className="text-white font-mono text-center">
                    "I have read and internalized the Design & Brand Requirements document, and I will comply fully with its instructions before proceeding with any work."
                  </p>
                </div>
                <button
                  onClick={handleComplianceConfirmed}
                  className="px-8 py-3 bg-[#A18AB2] hover:bg-[#9280A5] text-white font-semibold rounded-lg transition-colors"
                >
                  I Confirm This Compliance Statement
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Demonstrate Understanding */}
          {currentStep === 'understanding' && (
            <div className="space-y-6">
              <div className="bg-white/20 rounded-lg p-6">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  Step 3: Demonstrate Understanding
                </h2>
                <div className="space-y-4 text-white/90">
                  <p>Answer these questions to prove understanding:</p>
                  <div className="bg-black/30 rounded-lg p-4">
                    <p className="mb-2"><strong>Q:</strong> What is the first brand color in the sequence?</p>
                    <p className="mb-2"><strong>A:</strong> #A18AB2</p>
                    
                    <p className="mb-2"><strong>Q:</strong> What background style should be avoided?</p>
                    <p className="mb-2"><strong>A:</strong> Plain white or light gray backgrounds</p>
                    
                    <p className="mb-2"><strong>Q:</strong> What type of improvements are allowed?</p>
                    <p className="mb-2"><strong>A:</strong> Incremental improvements only, no full redesigns</p>
                  </div>
                </div>
                <button
                  onClick={handleUnderstandingDemonstrated}
                  className="mt-4 px-8 py-3 bg-[#A18AB2] hover:bg-[#9280A5] text-white font-semibold rounded-lg transition-colors"
                >
                  I Understand These Requirements
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Authorization */}
          {currentStep === 'authorized' && (
            <div className="space-y-6">
              <div className="bg-white/20 rounded-lg p-6">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  Step 4: Work Authorization
                </h2>
                <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4 mb-6">
                  <p className="text-green-100 text-center">
                    ✅ All compliance requirements met! You are now authorized to proceed with design work.
                  </p>
                </div>
                <button
                  onClick={handleAuthorizationGranted}
                  className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Proceed with Design Work
                </button>
              </div>
            </div>
          )}

          {/* Progress Indicator */}
          <div className="mt-8">
            <div className="flex justify-center space-x-2">
              {['reading', 'confirmation', 'understanding', 'authorized'].map((step, index) => (
                <div
                  key={step}
                  className={`w-3 h-3 rounded-full ${
                    currentStep === step 
                      ? 'bg-[#A18AB2]' 
                      : index < ['reading', 'confirmation', 'understanding', 'authorized'].indexOf(currentStep)
                      ? 'bg-green-500'
                      : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
            <p className="text-center text-white/70 mt-2">
              Step {['reading', 'confirmation', 'understanding', 'authorized'].indexOf(currentStep) + 1} of 4
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Only render children when compliance is verified
  return <>{children}</>;
};

export default EnforcementChecker;
