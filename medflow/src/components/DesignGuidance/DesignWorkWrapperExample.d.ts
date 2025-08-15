import React from 'react';
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
export declare const NewComponentExample: React.FC;
export declare const RedesignedComponentExample: React.FC;
export declare const NormalComponentExample: React.FC;
export declare const ConditionalWrapperExample: React.FC<{
    isUnderDevelopment: boolean;
}>;
