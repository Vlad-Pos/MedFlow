/**
 * 🚀 Enhanced Framer Integration Hook
 * 
 * Combines UTM tracking, conversion funnel analysis, and feature usage analytics
 * Provides comprehensive tracking from Framer website to MedFlow app
 */

import { useEffect, useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { utmTracking } from '../services/utmTracking';
import { featureAnalytics } from '../services/featureAnalytics';

export interface FramerUserContext {
  source: 'framer_website';
  sessionId: string;
  timestamp: number;
  pageViews: number;
  timeOnSite: number;
  utm: any;
  referrer: string;
  currentUrl: string;
  userAgent: string;
  conversionPath: string[];
}

export interface FramerNavigationOptions {
  redirectTo?: string;
  preserveContext?: boolean;
  trackEvent?: boolean;
  additionalData?: Record<string, any>;
}

export interface ConversionMetrics {
  websiteVisit: boolean;
  dashboardClick: boolean;
  appLanding: boolean;
  featureUsage: boolean;
  conversionTime: number;
  dropOffPoints: string[];
  userJourney: string[];
}

export const useEnhancedFramerIntegration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userContext, setUserContext] = useState<FramerUserContext | null>(null);
  const [shouldShowWelcome, setShouldShowWelcome] = useState(false);
  const [conversionMetrics, setConversionMetrics] = useState<ConversionMetrics>({
    websiteVisit: false,
    dashboardClick: false,
    appLanding: false,
    featureUsage: false,
    conversionTime: 0,
    dropOffPoints: [],
    userJourney: []
  });

  // Initialize tracking services
  useEffect(() => {
    // Extract UTM parameters from URL if they exist
    const urlParams = new URLSearchParams(window.location.search);
    const utmParams: any = {};
    
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id'].forEach(key => {
      const value = urlParams.get(key);
      if (value) {
        utmParams[key] = value;
      }
    });
    
    // If UTM parameters exist, track them
    if (Object.keys(utmParams).length > 0) {
      utmTracking.trackEvent('app_landing_with_utm', {
        utm: utmParams,
        conversionStep: 'app_landing',
        referrer: document.referrer
      });
    } else {
      utmTracking.trackEvent('app_landing', {
        conversionStep: 'app_landing',
        referrer: document.referrer
      });
    }

    featureAnalytics.initialize();
    
    // Track app landing
    featureAnalytics.trackFeatureUsage(
      'app',
      'MedFlow App',
      'land',
      'app',
      { path: location.pathname, referrer: document.referrer, utm: utmParams }
    );
  }, [location.pathname]);

  // Check if user came from Framer website
  const isFromFramer = useCallback((): boolean => {
    const storedContext = sessionStorage.getItem('medflowUserContext');
    const urlParams = new URLSearchParams(window.location.search);
    
    return !!(storedContext || urlParams.get('from_framer'));
  }, []);

  // Load user context from session storage
  useEffect(() => {
    const storedContext = sessionStorage.getItem('medflowUserContext');
    if (storedContext) {
      try {
        const context = JSON.parse(storedContext);
        setUserContext(context);
        setShouldShowWelcome(true);
        
        // Track conversion step
        utmTracking.trackConversionStep('app_landing', {
          additionalData: context
        });
        
        // Update conversion metrics
        updateConversionMetrics(context);
        
        log('👤 User context loaded from Framer website', context);
      } catch (error) {
        console.warn('Could not parse stored user context:', error);
      }
    }
  }, []);

  // Update conversion metrics based on user context
  const updateConversionMetrics = useCallback((context: FramerUserContext) => {
    const metrics: ConversionMetrics = {
      websiteVisit: true,
      dashboardClick: context.conversionPath?.includes('dashboard_click') || false,
      appLanding: true,
      featureUsage: false,
      conversionTime: 0,
      dropOffPoints: [],
      userJourney: context.conversionPath || []
    };

    // Calculate conversion time
    if (context.timestamp) {
      metrics.conversionTime = Date.now() - context.timestamp;
    }

    // Identify drop-off points
    const expectedPath = ['website_visit', 'dashboard_click', 'app_landing', 'feature_usage'];
    metrics.dropOffPoints = expectedPath.filter(step => !metrics.userJourney.includes(step));

    setConversionMetrics(metrics);
  }, []);

  // Navigate to app with enhanced tracking
  const navigateToApp = useCallback((options: FramerNavigationOptions = {}) => {
    const {
      redirectTo = '/dashboard',
      preserveContext = true,
      trackEvent = true,
      additionalData = {}
    } = options;

    // Get current UTM data
    const currentUTM = utmTracking.getCurrentUTM();
    
    // Build enhanced user context
    const enhancedContext: FramerUserContext = {
      source: 'framer_website',
      sessionId: `framer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      pageViews: 1,
      timeOnSite: 0,
      utm: currentUTM,
      referrer: document.referrer,
      currentUrl: window.location.href,
      userAgent: navigator.userAgent,
      conversionPath: ['website_visit', 'dashboard_click'],
      ...additionalData
    };

    // Store context for app
    if (preserveContext) {
      sessionStorage.setItem('medflowUserContext', JSON.stringify(enhancedContext));
    }

    // Track conversion step
    utmTracking.trackConversionStep('dashboard_click', {
      additionalData: enhancedContext
    });

    // Track feature usage
    featureAnalytics.trackFeatureUsage(
      'dashboard_navigation',
      'Dashboard Navigation',
      'navigate',
      'website_integration',
      enhancedContext
    );

    // Track navigation event
    if (trackEvent) {
      log('🚀 Navigating to MedFlow app', {
        redirectTo,
        context: enhancedContext
      });
    }

    // Navigate to app
    navigate(redirectTo, { replace: true });
  }, [navigate]);

  // Clear navigation context
  const clearNavigationContext = useCallback(() => {
    sessionStorage.removeItem('medflowUserContext');
    setUserContext(null);
    setShouldShowWelcome(false);
    log('🧹 Navigation context cleared');
  }, []);

  // Track conversion funnel step
  const trackConversionStep = useCallback((step: string, additionalData?: any) => {
    utmTracking.trackConversionStep(step as any, additionalData);
    
    // Update conversion metrics
    setConversionMetrics(prev => ({
      ...prev,
      userJourney: [...prev.userJourney, step],
      [step]: true
    }));

    log(`📊 Conversion step tracked: ${step}`, additionalData);
  }, []);

  // Track feature usage from Framer context
  const trackFramerFeatureUsage = useCallback((
    featureId: string,
    featureName: string,
    action: string,
    metadata?: Record<string, any>
  ) => {
    // Track in feature analytics
    featureAnalytics.trackFeatureUsage(
      featureId,
      featureName,
      action,
      'framer_integration',
      {
        ...metadata,
        fromFramer: true,
        userContext
      }
    );

    // Update conversion metrics
    if (action === 'view' || action === 'use') {
      setConversionMetrics(prev => ({
        ...prev,
        featureUsage: true
      }));
    }

    log(`📊 Framer feature usage tracked: ${featureName} - ${action}`, metadata);
  }, [userContext]);

  // Track UTM campaign performance
  const trackUTMCampaign = useCallback((campaignData: any) => {
    utmTracking.trackEvent('utm_campaign', {
      ...campaignData,
      conversionStep: 'campaign_tracking'
    });

    log('🎯 UTM campaign tracked', campaignData);
  }, []);

  // Track user engagement metrics
  const trackEngagement = useCallback((engagementData: any) => {
    const event = {
      ...engagementData,
      timestamp: Date.now(),
      sessionId: userContext?.sessionId,
      fromFramer: true
    };

    // Track in both services
    utmTracking.trackEvent('user_engagement', event);
    featureAnalytics.trackFeatureUsage(
      'engagement',
      'User Engagement',
      engagementData.type || 'engagement',
      'framer_integration',
      event
    );

    log('📈 User engagement tracked', event);
  }, [userContext]);

  // Get comprehensive analytics data
  const getComprehensiveAnalytics = useCallback(() => {
    const utmData = utmTracking.getAllTrackingData();
    const featureData = featureAnalytics.getAllAnalyticsData();
    const conversionFunnel = utmTracking.getConversionFunnel();

    return {
      utm: utmData,
      features: featureData,
      conversion: conversionFunnel,
      framerContext: userContext,
      conversionMetrics,
      timestamp: Date.now()
    };
  }, [userContext, conversionMetrics]);

  // Track page performance
  const trackPagePerformance = useCallback((performanceData: any) => {
    featureAnalytics.trackFeatureUsage(
      'page_performance',
      'Page Performance',
      'measure',
      'performance',
      {
        ...performanceData,
        fromFramer: true,
        userContext
      }
    );

    log('⚡ Page performance tracked', performanceData);
  }, [userContext]);

  // Track user satisfaction
  const trackUserSatisfaction = useCallback((
    satisfactionType: string,
    rating: number,
    feedback?: string
  ) => {
    const event = {
      satisfactionType,
      rating,
      feedback,
      timestamp: Date.now(),
      fromFramer: true,
      userContext
    };

    // Track in both services
    utmTracking.trackEvent('user_satisfaction', event);
    featureAnalytics.trackFeatureUsage(
      'satisfaction',
      'User Satisfaction',
      'rate',
      'feedback',
      event
    );

    log('😊 User satisfaction tracked', event);
  }, [userContext]);

  // Track conversion success/failure
  const trackConversionResult = useCallback((
    success: boolean,
    reason?: string,
    metadata?: Record<string, any>
  ) => {
    const event = {
      success,
      reason,
      timestamp: Date.now(),
      fromFramer: true,
      userContext,
      ...metadata
    };

    // Track in both services
    utmTracking.trackEvent(success ? 'conversion_success' : 'conversion_failure', event);
    featureAnalytics.trackFeatureUsage(
      'conversion',
      'Conversion Result',
      success ? 'success' : 'failure',
      'framer_integration',
      event
    );

    // Update conversion metrics
    if (success) {
      setConversionMetrics(prev => ({
        ...prev,
        featureUsage: true
      }));
    }

    log(`🎯 Conversion result tracked: ${success ? 'SUCCESS' : 'FAILURE'}`, event);
  }, [userContext]);

  // Track user journey abandonment
  const trackJourneyAbandonment = useCallback((abandonmentData: any) => {
    const event = {
      ...abandonmentData,
      timestamp: Date.now(),
      fromFramer: true,
      userContext,
      conversionMetrics
    };

    // Track in both services
    utmTracking.trackEvent('journey_abandonment', event);
    featureAnalytics.trackFeatureUsage(
      'abandonment',
      'Journey Abandonment',
      'abandon',
      'framer_integration',
      event
    );

    log('❌ Journey abandonment tracked', event);
  }, [userContext, conversionMetrics]);

  // Utility function for logging
  const log = useCallback((message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      if (data) {
        console.log(`[Enhanced Framer Integration] ${message}`, data);
      } else {
        console.log(`[Enhanced Framer Integration] ${message}`);
      }
    }
  }, []);

  return {
    // Core integration
    userContext,
    shouldShowWelcome,
    isFromFramer,
    navigateToApp,
    clearNavigationContext,
    
    // Enhanced tracking
    trackConversionStep,
    trackFramerFeatureUsage,
    trackUTMCampaign,
    trackEngagement,
    trackPagePerformance,
    trackUserSatisfaction,
    trackConversionResult,
    trackJourneyAbandonment,
    
    // Analytics and metrics
    conversionMetrics,
    getComprehensiveAnalytics,
    
    // Utility
    log
  };
};

export default useEnhancedFramerIntegration;
