import React from 'react';
import { DesignWorkWrapper } from './DesignWorkWrapper';

/**
 * Example of how to use DesignWorkWrapper for components that need design guidance
 * 
 * This wrapper should ONLY be used for:
 * 1. New components being developed
 * 2. Components undergoing design changes
 * 3. Components that need design compliance review
 * 
 * DO NOT wrap every component - only those actively being worked on
 */

// Example 1: Wrapping a new component being developed
export const NewComponentExample: React.FC = () => {
  return (
    <DesignWorkWrapper componentName="NewComponentExample" showGuidanceOnMount={true}>
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          New Component Example
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          This component is wrapped with DesignWorkWrapper because it's being actively developed
          and needs design compliance review.
        </p>
      </div>
    </DesignWorkWrapper>
  );
};

// Example 2: Wrapping a component undergoing design changes
export const RedesignedComponentExample: React.FC = () => {
  return (
    <DesignWorkWrapper componentName="RedesignedComponentExample">
      <div className="p-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-4">
          Redesigned Component
        </h2>
        <p className="text-white/90">
          This component is wrapped because it's undergoing design improvements.
          The guidance will help ensure brand compliance.
        </p>
      </div>
    </DesignWorkWrapper>
  );
};

// Example 3: Component WITHOUT wrapper (normal operation)
export const NormalComponentExample: React.FC = () => {
  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-700 rounded-lg">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
        Normal Component
      </h2>
      <p className="text-gray-600 dark:text-gray-300">
        This component is NOT wrapped with DesignWorkWrapper because it's not
        being actively developed or redesigned. It renders normally without any guidance.
      </p>
    </div>
  );
};

// Example 4: Conditional wrapping based on development state
export const ConditionalWrapperExample: React.FC<{ isUnderDevelopment: boolean }> = ({ 
  isUnderDevelopment 
}) => {
  if (isUnderDevelopment) {
    return (
      <DesignWorkWrapper componentName="ConditionalWrapperExample">
        <div className="p-4 border-2 border-dashed border-yellow-400 rounded-lg">
          <p className="text-yellow-700 dark:text-yellow-300">
            This component is under development and wrapped with guidance.
          </p>
        </div>
      </DesignWorkWrapper>
    );
  }

  // Normal rendering when not under development
  return (
    <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-lg">
      <p className="text-green-700 dark:text-green-300">
        This component is stable and renders normally without guidance.
      </p>
    </div>
  );
};
