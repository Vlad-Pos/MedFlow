import React, { ReactNode } from 'react';
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
export declare const useDesignGuidance: () => DesignGuidanceContextType;
interface DesignGuidanceProviderProps {
    children: ReactNode;
}
export declare const DesignGuidanceProvider: React.FC<DesignGuidanceProviderProps>;
export {};
