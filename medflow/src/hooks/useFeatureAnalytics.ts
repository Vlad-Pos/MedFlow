/**
 * 🚀 Feature Analytics Hook
 * 
 * Provides easy access to feature analytics throughout the app
 * Automatically tracks page views and provides methods for tracking interactions
 */

import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { featureAnalytics } from '../services/featureAnalytics';

export interface FeatureAnalyticsOptions {
  trackPageView?: boolean;
  trackUserInteraction?: boolean;
  category?: string;
}

export const useFeatureAnalytics = (
  featureId: string,
  featureName: string,
  options: FeatureAnalyticsOptions = {}
) => {
  const location = useLocation();
  const {
    trackPageView = true,
    trackUserInteraction = true,
    category = 'app'
  } = options;

  // Initialize feature analytics
  useEffect(() => {
    featureAnalytics.initialize();
  }, []);

  // Track page view when component mounts
  useEffect(() => {
    if (trackPageView) {
      featureAnalytics.trackFeatureView(featureId, featureName, category);
    }
  }, [featureId, featureName, category, trackPageView, location.pathname]);

  // Track feature interaction
  const trackInteraction = useCallback((
    action: string,
    metadata?: Record<string, any>
  ) => {
    if (trackUserInteraction) {
      featureAnalytics.trackFeatureInteraction(
        featureId,
        featureName,
        action,
        category,
        metadata
      );
    }
  }, [featureId, featureName, category, trackUserInteraction]);

  // Track feature completion
  const trackCompletion = useCallback((
    success: boolean = true,
    metadata?: Record<string, any>
  ) => {
    featureAnalytics.trackFeatureCompletion(
      featureId,
      featureName,
      category,
      success,
      metadata
    );
  }, [featureId, featureName, category]);

  // Start timing a feature
  const startTimer = useCallback(() => {
    featureAnalytics.startFeatureTimer(featureId);
  }, [featureId]);

  // End timing a feature
  const endTimer = useCallback((success: boolean = true) => {
    featureAnalytics.endFeatureTimer(featureId, success);
  }, [featureId]);

  // Track form submission
  const trackFormSubmission = useCallback((
    formData?: Record<string, any>,
    success: boolean = true
  ) => {
    trackInteraction('form_submit', { formData, success });
    trackCompletion(success, { formData });
  }, [trackInteraction, trackCompletion]);

  // Track button click
  const trackButtonClick = useCallback((
    buttonText: string,
    metadata?: Record<string, any>
  ) => {
    trackInteraction('button_click', {
      buttonText,
      ...metadata
    });
  }, [trackInteraction]);

  // Track link click
  const trackLinkClick = useCallback((
    linkText: string,
    linkUrl: string,
    metadata?: Record<string, any>
  ) => {
    trackInteraction('link_click', {
      linkText,
      linkUrl,
      ...metadata
    });
  }, [trackInteraction]);

  // Track data loading
  const trackDataLoading = useCallback((
    dataType: string,
    success: boolean,
    metadata?: Record<string, any>
  ) => {
    trackInteraction('data_loading', {
      dataType,
      success,
      ...metadata
    });
  }, [trackInteraction]);

  // Track search
  const trackSearch = useCallback((
    query: string,
    resultsCount: number,
    metadata?: Record<string, any>
  ) => {
    trackInteraction('search', {
      query,
      resultsCount,
      ...metadata
    });
  }, [trackInteraction]);

  // Track filter usage
  const trackFilter = useCallback((
    filterType: string,
    filterValue: any,
    metadata?: Record<string, any>
  ) => {
    trackInteraction('filter_used', {
      filterType,
      filterValue,
      ...metadata
    });
  }, [trackInteraction]);

  // Track sorting
  const trackSorting = useCallback((
    sortBy: string,
    sortDirection: 'asc' | 'desc',
    metadata?: Record<string, any>
  ) => {
    trackInteraction('sorting', {
      sortBy,
      sortDirection,
      ...metadata
    });
  }, [trackInteraction]);

  // Track pagination
  const trackPagination = useCallback((
    page: number,
    pageSize: number,
    totalPages: number,
    metadata?: Record<string, any>
  ) => {
    trackInteraction('pagination', {
      page,
      pageSize,
      totalPages,
      ...metadata
    });
  }, [trackInteraction]);

  // Track export/download
  const trackExport = useCallback((
    exportType: string,
    format: string,
    metadata?: Record<string, any>
  ) => {
    trackInteraction('export', {
      exportType,
      format,
      ...metadata
    });
  }, [trackInteraction]);

  // Track error
  const trackError = useCallback((
    errorType: string,
    errorMessage: string,
    metadata?: Record<string, any>
  ) => {
    trackInteraction('error', {
      errorType,
      errorMessage,
      ...metadata
    });
  }, [trackInteraction]);

  // Track success
  const trackSuccess = useCallback((
    action: string,
    metadata?: Record<string, any>
  ) => {
    trackInteraction('success', {
      action,
      ...metadata
    });
  }, [trackInteraction]);

  // Track user preference change
  const trackPreferenceChange = useCallback((
    preference: string,
    oldValue: any,
    newValue: any,
    metadata?: Record<string, any>
  ) => {
    trackInteraction('preference_change', {
      preference,
      oldValue,
      newValue,
      ...metadata
    });
  }, [trackInteraction]);

  // Track navigation
  const trackNavigation = useCallback((
    from: string,
    to: string,
    metadata?: Record<string, any>
  ) => {
    trackInteraction('navigation', {
      from,
      to,
      ...metadata
    });
  }, [trackInteraction]);

  // Track modal open/close
  const trackModal = useCallback((
    action: 'open' | 'close',
    modalName: string,
    metadata?: Record<string, any>
  ) => {
    trackInteraction(`modal_${action}`, {
      modalName,
      ...metadata
    });
  }, [trackInteraction]);

  // Track tooltip usage
  const trackTooltip = useCallback((
    tooltipId: string,
    action: 'show' | 'hide',
    metadata?: Record<string, any>
  ) => {
    trackInteraction(`tooltip_${action}`, {
      tooltipId,
      ...metadata
    });
  }, [trackInteraction]);

  // Track keyboard shortcut usage
  const trackKeyboardShortcut = useCallback((
    shortcut: string,
    action: string,
    metadata?: Record<string, any>
  ) => {
    trackInteraction('keyboard_shortcut', {
      shortcut,
      action,
      ...metadata
    });
  }, [trackInteraction]);

  // Track drag and drop
  const trackDragAndDrop = useCallback((
    action: 'drag_start' | 'drag_end' | 'drop',
    itemType: string,
    metadata?: Record<string, any>
  ) => {
    trackInteraction(`drag_drop_${action}`, {
      itemType,
      ...metadata
    });
  }, [trackInteraction]);

  // Track copy/paste
  const trackCopyPaste = useCallback((
    action: 'copy' | 'paste',
    contentType: string,
    metadata?: Record<string, any>
  ) => {
    trackInteraction(`copy_paste_${action}`, {
      contentType,
      ...metadata
    });
  }, [trackInteraction]);

  // Track file operations
  const trackFileOperation = useCallback((
    operation: 'upload' | 'download' | 'delete' | 'rename',
    fileType: string,
    fileSize?: number,
    metadata?: Record<string, any>
  ) => {
    trackInteraction(`file_${operation}`, {
      fileType,
      fileSize,
      ...metadata
    });
  }, [trackInteraction]);

  // Track API calls
  const trackAPICall = useCallback((
    endpoint: string,
    method: string,
    success: boolean,
    responseTime?: number,
    metadata?: Record<string, any>
  ) => {
    trackInteraction('api_call', {
      endpoint,
      method,
      success,
      responseTime,
      ...metadata
    });
  }, [trackInteraction]);

  // Track performance metrics
  const trackPerformance = useCallback((
    metric: string,
    value: number,
    unit: string,
    metadata?: Record<string, any>
  ) => {
    trackInteraction('performance', {
      metric,
      value,
      unit,
      ...metadata
    });
  }, [trackInteraction]);

  // Track accessibility features
  const trackAccessibility = useCallback((
    feature: string,
    action: string,
    metadata?: Record<string, any>
  ) => {
    trackInteraction('accessibility', {
      feature,
      action,
      ...metadata
    });
  }, [trackInteraction]);

  // Track theme changes
  const trackThemeChange = useCallback((
    fromTheme: string,
    toTheme: string,
    metadata?: Record<string, any>
  ) => {
    trackInteraction('theme_change', {
      fromTheme,
      toTheme,
      ...metadata
    });
  }, [trackInteraction]);

  // Track language changes
  const trackLanguageChange = useCallback((
    fromLanguage: string,
    toLanguage: string,
    metadata?: Record<string, any>
  ) => {
    trackInteraction('language_change', {
      fromLanguage,
      toLanguage,
      ...metadata
    });
  }, [trackInteraction]);

  // Track help/documentation usage
  const trackHelpUsage = useCallback((
    helpType: string,
    action: string,
    metadata?: Record<string, any>
  ) => {
    trackInteraction('help_usage', {
      helpType,
      action,
      ...metadata
    });
  }, [trackInteraction]);

  // Track feedback submission
  const trackFeedback = useCallback((
    feedbackType: string,
    rating?: number,
    metadata?: Record<string, any>
  ) => {
    trackInteraction('feedback', {
      feedbackType,
      rating,
      ...metadata
    });
  }, [trackInteraction]);

  // Track onboarding steps
  const trackOnboarding = useCallback((
    step: string,
    completed: boolean,
    metadata?: Record<string, any>
  ) => {
    trackInteraction('onboarding', {
      step,
      completed,
      ...metadata
    });
  }, [trackInteraction]);

  // Track tutorial usage
  const trackTutorial = useCallback((
    tutorialName: string,
    action: 'start' | 'complete' | 'skip',
    metadata?: Record<string, any>
  ) => {
    trackInteraction(`tutorial_${action}`, {
      tutorialName,
      ...metadata
    });
  }, [trackInteraction]);

  return {
    // Core tracking methods
    trackInteraction,
    trackCompletion,
    startTimer,
    endTimer,
    
    // Specific tracking methods
    trackFormSubmission,
    trackButtonClick,
    trackLinkClick,
    trackDataLoading,
    trackSearch,
    trackFilter,
    trackSorting,
    trackPagination,
    trackExport,
    trackError,
    trackSuccess,
    trackPreferenceChange,
    trackNavigation,
    trackModal,
    trackTooltip,
    trackKeyboardShortcut,
    trackDragAndDrop,
    trackCopyPaste,
    trackFileOperation,
    trackAPICall,
    trackPerformance,
    trackAccessibility,
    trackThemeChange,
    trackLanguageChange,
    trackHelpUsage,
    trackFeedback,
    trackOnboarding,
    trackTutorial,
    
    // Utility methods
    getAnalyticsData: featureAnalytics.getAllAnalyticsData,
    clearAnalyticsData: featureAnalytics.clearAnalyticsData
  };
};

export default useFeatureAnalytics;
