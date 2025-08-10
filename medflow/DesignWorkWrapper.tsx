import React from 'react';
import EnforcementChecker from './EnforcementChecker';

interface DesignWorkWrapperProps {
  children: React.ReactNode;
  componentName: string;
}

const DesignWorkWrapper: React.FC<DesignWorkWrapperProps> = ({ 
  children, 
  componentName 
}) => {
  const handleComplianceVerified = () => {
    console.log(`✅ Design work authorized for ${componentName} - Compliance verified`);
  };

  // This component will block ALL design work until compliance is verified
  return (
    <EnforcementChecker onComplianceVerified={handleComplianceVerified}>
      <div className="design-work-authorized">
        <div className="compliance-banner bg-green-600/20 border border-green-400/30 rounded-lg p-3 mb-4">
          <p className="text-green-100 text-center text-sm">
            ✅ Design Work Authorized - Brand & Design Requirements Compliant
          </p>
        </div>
        {children}
      </div>
    </EnforcementChecker>
  );
};

export default DesignWorkWrapper;
